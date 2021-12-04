---
title: Avoid using Service Locators
date: 2018-02-21
tags: ["dependency-injection", "di", "dic", "container", "symfony", "OOP", "service-locator"]
layout: post
thumb_img_path: images/compass.jpg
thumb_img_alt: Compass
content_img_path: images/compass.jpg
content_img_alt: Compass
---

## DI != SL

[Dependency Injection](/patterns/dependency-injection) is an highly recommended pattern
to make the dependencies of a class configurable by its users, with many advantages.

With the increase of popularity of this pattern and its recommendation of usage
in the context of web frameworks, arose another pattern, which when misused, as it usually is,
becomes an anti-pattern: the service locator (aka dependency injection container).

## Service-Locator pattern

To understand the negative anti-pattern, we should first understand the originating
positive pattern.

When applying the concept of [DI](/patterns/dependency-injection) into a big application
structured around a framework, it's easy to end up with injecting a dependency
(e.g. `EntityManager`) repeatedly in multiple classes that require it.

For example, we could end up with code in multiple controllers that would do this repeatedly:

```php
use Doctrine\DBAL\Driver\PDOMySql as MySqlDriver;
use Doctrine\ORM\EntityManager;
use MyProject\OAuth\Authenticator;

public class LoginController
{
  public function authenticateAction(string $username, string $password)
  {
    // Extremely bad example, for multiple reasons!

    // Preparing the dependency to be injected
    $driver = new MySqlDriver();
    $connection = $driver->connect('localhost', 'db_user', 'db_pass');
    $entityManager = new EntityManager($connection);

    // Injecting the dependency to the authenticator
    $authenticator = new Authenticator($entityManager);
    $authenticator->authenticate($username, $password);
    // ...
  }
}
```

These classes, called from multiple places are usually called **Services**. Entity managers
that handle database persistence or loggers are two classical examples of common services
in a web-based application.

To avoid repeating the configuration of the dependency over and over,
to create a central point where you can change the configurations of it,
and even its implementation details (for example, switching from a mysql driver to
a postgres driver), the *Service Locator* (SL) or *Dependency Injection Container* (DIC)
pattern can be used, and most DI-friendly frameworks provide one.

If you use the frameworks `ContainerAware` properties (already embedded into, for example,
symfony's base `Controller` classes, then you can get such dependencies already
instantiated from the Service Locator, like this:

```php
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use MyProject\OAuth\Authenticator;

public class LoginController extends Controller
{
  public function authenticateAction(string $username, string $password)
  {
    $entityManager = $this->container->get('em');

    $authenticator = new Authenticator($entityManager);
    $authenticator->authenticate($username, $password);
    // ...
  }
}
```

The container would know (from its configuration) how to create an EntityManager,
which Driver to use, which username and passwords, etc.

You might notice some improvements:

* We don't need to repeat our db configuration across all our controllers
* Our controller no longer depends on a concrete implementation (MySql)
* It is not even tied to using a real doctrine entity manager, as long
as it is one compatible with the authenticator dependency, making it possible
to use an extension or even a mock of such entity manager
* Testing the first controller without the penalty of real database interaction
was impossible, now it can be done

## Abusing Service Locators

Service locators are extremely powerful to provide a `glue` into multiple
services, and are very useful for a framework to coordinate its configured services.

In symfony, for example, the popularity of its dependency injection component
lead developers to use it everywhere, to get the entity manager, to get the logger,
and eventually lead to even business logic classes to use it. Everything is called
a service nowadays!

Picking the same example of above, here's what someone who uses service locator
would probably (wrongly) do:

```php
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

public function LoginController extends Controller
{
  public function authenticateAction(string $username, string $password)
  {
    $em = $this->container->get('em');
    $authenticator = $this->container->get('authenticator');

    $isAuthenticated = $authenticator->authenticate($username, $password);

    if ($isAuthenticated) {
      $user = $em->getTable('User')->findByUsername($username);
      $user->setLastLogin();
      // ..
    }
    // ..
  }
}
```

Although useful for the framework itself, using them ourselves directly should be
avoided as much as possible, since it introduces other (avoidable) problems:

* Instead of a soft-dependency, it introduces an **undetermined** dependency. We have no
guarantees that when I ask for a service with name 'authenticator', I will get one
of the desired interface, not even that it has the 'authenticate()' method!
* Makes it out-of-reach for IDEs, static analyzers, etc. to automatically know the
type of the object and providing auto-completion, refactoring, etc.
* Since the dependency becomes defined as a string, it's much harder to refactor by IDEs
* Automatic dependency analysis have no clue on what the dependencies are
* A mistype of the service name goes unnoticed (until it breaks when running the code,
possibly in production)
* Makes all the classes that use the SL framework-dependent

### How to avoid/refactor DIC abuse

There are two very different ways to avoid using the service locator, one of the two
applies 99% of the time, so as a general rule of thumb "DO NOT USE THE SERVICE LOCATOR".

I call one of the techniques "move-it-up", the other I call "own-it".

To decide on what's the best one of the two, one just need to analyze if we're depending
on a "true" service, or on an implementation.

#### Move-it-up

If you are really depending upon a service (as in the case of the EntityManager, in the sample),
one that is used in multiple places and which you want to ensure it has consistency, and
about which you couldn't care less about how it really is implemented... then a SL is
something that makes perfect sense... except... it doesn't have to be you to use it,
you can/should move the dependency up in the chain until the point it's the job of the
framework to use it.

In the example we're following, let's do this to the EntityManager:

```php
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Doctrine\ORM\EntityManagerInterface;

public class LoginController extends Controller
{
  public function authenticateAction(EntityManagerInterface $em, string $username, string $password)
  {
    $authenticator = $this->container->get('authenticator');

    $isAuthenticated = $authenticator->authenticate($username, $password);

    if ($isAuthenticated) {
      $user = $em->getTable('User')->findByUsername($username);
      $user->setLastLogin();
    }

    // ...
  }
}
```

Notice that now, in what regards to the EM, we have guarantees that it will have a
certain interface, that it will have a `getTable()` method, etc.

It's no longer an undetermined dependency, but is not an hard-dependency either,
you can inject whatever implements the EntityManagerInterface, so you get all the
benefits of DI without the drawbacks of the SL.

There can be a drawback, however, depending on the framework you're using. By "moving-up" the
injection to who calls the controller, you might be now required to configure the controller
(or command) as a service, in the service locator configurations.
It would still be worth it, but with some frameworks you don't even need to do that,
if they support [auto-wiring of dependencies](https://symfony.com/doc/current/service_container/autowiring.html),
as symfony does since version 2.8.

#### Own-it

But if it's not a true service, there's another alternative to consider.
If your class is one of the few (or the only class) that will depend upon it,
and if you're tied with its implementation details (as it frequently happens
between classes of same namespace, though it shouldn't), then an alternative is
to actually NOT use Dependency Injection at all.

It's better to have an explicit hard dependency to another class than to
have the false appearance and false comfort of an undetermined dependency.

Hard dependencies should be avoided for code over which you have almost no control
(external libraries) and definitely avoided for dependencies that will be slow (and therefore
important to mock in testing). Other than that, it's not a crime to own such dependencies.

If the `LoginController` will always use an `OAuth\Authenticator`, if there is
no foreseeable situation where a different implementation with the same
interface would be necessary, then maybe it just isn't the case where the
dependency injection pattern shines, and we can use it.

So, mixing the example of moving up the `EntityManager` dependency with
owning the `Authenticator` dependency, this would be the result:

```php
use Doctrine\ORM\EntityManagerInterface;
use MyProject\OAuth\Authenticator;

public class LoginController
{
  public function authenticateAction(EntityManagerInterface $em, string $username, string $password)
  {
    $authenticator = new Authenticator($em);

    $isAuthenticated = $authenticator->authenticate($username, $password);

    if ($isAuthenticated) {
      $user = $em->getTable('User')->findByUsername($username);
      $user->setLastLogin();
    }

    // ...
  }
}
```

Notice that we no longer depend on the framework and that all our dependencies are
well defined (one of them flexible, the other owned as an hard dependency).

The code is much easier to read, test, refactor, etc.

### When should we own it?

There is no golden rule into defining a class as a service that should be
on the service locator or not. If it's used a lot, then probably it should.

If it isn't used a lot, it is more subjective if it's better to move it up
or to own it, it's a balance of tradeoffs.

When in doubt, move it up.
