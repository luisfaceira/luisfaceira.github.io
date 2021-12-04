---
title: Doctrine Repositories Best-Practices
date: 2018-02-21
tags: ["ORM", "doctrine", "database", "repositories"]
layout: post
thumb_img_path: images/library.jpg
thumb_img_alt: Library
content_img_path: images/library.jpg
content_img_alt: Library
---

Doctrine defines a concept of repository classes as a solution to encapsulate
the logic of how to query such repository to retrieve objects of that class.

Below are multiple best-practices on how to achieve reusable, readable and
consistent approaches for doctrine repositories:

## All your queries are belong to us

The core responsibility of a Doctrine Repository is precisely to be able to
encapsulate query building and execution logic, so we should avoid, as much
as possible, to build or execute queries outside of it.

Instead of this:

```php
public class UsersController extends Controller
{
  //...
  public function listAdminUsersAction()
  {
    $admins = $this->userRepository->createQueryBuilder()
        ->where('is_admin = \'true\'')
        ->andWhere('is_active = \'true\'')
        ->andWhere('deleted_at IS NULL)
        ->execute();

    return $admins;
  }
}
```

Consider instead extracting the logic into the repository:

```php
public class UsersController extends Controller
{
  //...
  public function listAdminUsersAction()
  {
    $admins = $this->userRepository->findActiveAdmins();
  }
}

public class UserRepository
{
  public function findActiveAdmins()
  {
    $qb = $this->createQueryBuilder()
             ->where('is_admin = '\true\'')
             ->andWhere('is_active = '\true\'')
             ->andWhere('deleted_at IS NULL);
    
    $admins = $qb->execute();
    
    return $admins;
  }
}
```

Advantages:

* Promotes Single-Responsibility-Principle
* Removes logic out of controllers
* Concentrates querying logic in a single class
* Makes it more clear what it does (for example, who uses the repository
will immediately be aware that there is the concept of `currently* being
an admin.

## Private query builders

It is common that multiple queries have some shared querying. Instead of repeating
the query in multiple find methods of the repository, one should create a private
method for creating a base query builder with such shared criteria.

Example:

```php
public class UserRepository
{
  private function getActiveQueryBuilder()
  {
    $qb = $this->createQueryBuilder()
            ->where('is_active = true')
            ->andWhere('deleted_at IS NULL');

    return $qb;
  }

  public function findActive()
  {
    $qb = $this->getActiveQueryBuilder();

    $activeUsers = $qb->getQuery()->execute();

    return $activeUsers;
  }
  
  public function findActiveAdmins()
  {
    $qb = $this->getActiveQueryBuilder()
            ->andWhere('is_admin = true');

    $activeAdmins = $qb->getQuery()->execute();

    return $activeAdmins;
  }
}
```

Those methods should be private, to avoid the temptation to add logic to them
outside of the repository class.

One notable acceptable exception occurs in the context of the EntityType of
Symfony forms, where to list only a subset of entities of a certain type.
A common way is to use its `query_builder` option, in which case it MUST simply
use a `getFooBarQueryBuilder()` without any additional changes.

### Handling really complex repositories

Sometimes the multitude of criteria that can be applied across different
methods of a repository makes it very hard to use an approach of chained
query builders.

For those situations, there is the notion of Criteria. This [blog post by
Doctrine's creator](https://beberlei.de/2013/03/04/doctrine_repositories.html)
explains how to use them.

## Prefer andWhere() instead of where()

The two methods are very similar and easy to be confused, but with a significant
distinction: the `where()` overrides everything set up until that moment while
the `andWhere()` adds criteria to an existing query builder.

```php
// This won't work well, because it will override the "active" criteria:
$qb = $this->getActiveQueryBuilder()->where('is_admin = true');

// This always works, no matter if there is or isn't any criteria already existing
$qb = $this->getActiveQueryBuilder()->andWhere('is_admin = true');
```

The single situation where a `where` is acceptable is if chained immediately
after creating a new query builder:

```php
$qb = $this->createQueryBuilder()
          ->where('x IS NOT NULL');
```

## Return objects by default

Doctrine Repositories are part of the ORM framework. They should assist in
handling, by default, objects.

Therefore, the default assumed return type for a public method of, for example,
a `UserRepository` should be a collection of `User` objects.

You should only default to return objects, and in the rare occasions where,
for some advanced reasons (e.g. an hydration proven to be extremely slow), the
name of the method shall explicitly say that it returns another type, for example:

```php
public function getActiveUsersArray();
```

## Use the `findBy` terminology to declare filters to apply

The way a method should be used should be immediately apparent from its method
name, so if it has arguments, it should be easy to guess what types they should
have by the method name. In the case of providing filters to apply to a
query operation, they should be stated on the method name, like the following:

```php
public function findActiveByUsername(string $username)
{
  $user = $this->getActiveQueryBuilder()
            ->andWhere('username = :username')
               ->setParameter('username', $username)
            ->getSingleResult();

  return $user;
}
```

## Prefer injecting a repository over the EntityManager

One of the most common injections into a controller (if you're [avoiding service
locators](/patterns/avoid-service-locators)) is of the entity manager.

But many times, you do not really need to inject the entity manager, but instead
can and should inject the repository itself.

Instead of this:

```php
public class ListUsersController()
{
  public function __construct(EntityManagerInterface $em)
  {
    $this->em = $em;
  }

  public function listAdminsAction()
  {
    $admins = $this->em->getRepository('User')->findActiveAdmins();
    return $admins;
  }
}
```

You should do this:

```php
public class ListUsersController()
{
  public function __construct(UserRepository $repo)
  {
    $this->repo = $repo;
  }

  public function listAdminsAction()
  {
    $admins = $this->repo->findActiveAdmins();
    return $admins;
  }
}
```

## Avoid filtering by another entity or id

Frequently, one wants to get a list of items in a repository that are somehow
related with another entity.

For example, imagine we want to get the comments that a certain user did
on a certain date. One common approach is to use the comments query builder on
the comments repository to filter it by such options. Like this:

```php
public class CommentsRepository
{
  public function findByUserAndDate(User $user, \Datetime $date)
  {
    $comments = $this->createQueryBuilder()
                     ->where('user = :user')
                         ->setParameter('user', $user)
                     ->andWhere('created_at = :created_at')
                         ->setParameter('created_at', $date)
                     ->execute();
    return $comments;
  }
}
```

However, most of the times that you want to filter by a related entity, you want
to do it in the context of such entity, so a better API for doing that
would be `$myUser->getCommentsOnDate($date)`. This is the intuitive way to
retrieve related objects in OOP, and is how we also retrieve unfiltered objects
such as `$myUser->getComments()`.

To achieve this, first, you should ensure that a relation exists between the two
entities. If it's common that you need to filter one repository by an entity
(or its id) then it's a fact that they do have a conceptual relationship, so that
relationship should be declared in the entity. Note that this doesn't necessarily
mean that changes to the schema are necessary, only that the relation should be
declared in doctrine annotation so that we're able to leverage the ORM to handle
such relationships.

Then, it shall be possible to do this instead of the above:

```php
public class User
{
  public function getCommentsOnDate(\Datetime $date)
  {
    $createdOnDateCriteria = Criteria::create()
        ->where(Criteria::expr()->eq('created_at', $date));

    $commentsOnDate = $this->comments->matching($createdOnDateCriteria);

    return $commentsOnDate;
  }
}
```
