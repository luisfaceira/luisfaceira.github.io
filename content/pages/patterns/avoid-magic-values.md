---
title: Avoid magic values
date: 2018-03-14
tags: ["OOP", "strong-typed", "strings", "constants"]
layout: post
thumb_img_path: images/magic.jpg
thumb_img_alt: Magic Value
content_img_path: images/magic.jpg
content_img_alt: Magic Value
---

While programming it is usual to have logic that is in some way bounded to
a specific value, which we call "magic values" or "hardcoded values".

There are multiple reasons why such values appear, some more valid and
comprehensible than others.

## Magic values derived from requirements

For example, let's say you have a method that lists recent events:

```php
// Example of what should NOT be done
class EventRepository extends EntityRepository
{
  public function findRecentEvents()
  {
    $recentEvents = $this->getQueryBuilder()
                      ->orderBy('date')
                      ->setMaxResults(10)
                      ->getQuery()->getResult();

    return $recentEvents;
  }
}
```

In this context, the value "10" is a magic value. It isn't logic, it's simply
an hardcoded parameter.

Its origin is probably a functional requirement, in the sense that in the project
it was defined that a "recent event" means one of the last 10 events ordered by
date.

Instead of a magic value mixed with the logic, there are advantages into extracting
the value into an explicit constant like the following:

```php
class EventRepository extends EntityRepository
{
  constant AMOUNT_OF_EVENTS_CONSIDERED_RECENT = 10;

  public function findRecentEvents()
  {
    $recentEvents = $this->getQueryBuilder()
                      ->orderBy('date')
                      ->setMaxResults(self::AMOUNT_OF_EVENTS_CONSIDERED_RECENT)
                      ->getQuery()->getResult();

    return $recentEvents;
  }
}
```

There are multiple advantages of the second approach:

* Separates logic from configuration (even if a static configuration)
* The meaning of the value becomes self-documented, making it easier to read
* Even if I don't know what the `setMaxResults` does, the name of the constant
makes it easier to understand
* If the same magic value is meaningful elsewhere, it will be reused instead of
duplicated
* It makes it easier to change simultaneous across multiple places, instead of
find/replacing the value "10" (which can be used for different things and mean
different things in different contexts) you can check for the usages of this
specific constant
* It makes it easier to potentially convert it into a dynamically defined
value, mainly because of the previous point

Also, it is worth contemplating if a magic value that derives from a requirement
such as the one above is something that is expectable to remain the same in the
future, or if it is likely that it might change in the future.
In the latter situation, a proper configuration system that injects the value
as a parameter to the class is more appropriate.

## Internally defined values for logic variations

Another example of a magic value, this time with a different motivation and type:

```php
// Example of what should NOT be done
class Vehicle
{
  public function isSpaceRocket()
  {
    if ($this->type === 'space_rocket') {
      return true;
    } else {
      return false;
    }
  }
}
```

In this context, the 'space_rocket' is also a magic value. Contrary to the previous
example, it is not likely that this was explicitly defined as a requirement, but
is a special internal string used to tie things together between different parts
of the code.

This is much worse than the previous example, because it is almost guaranteed
that the same magic value will be used in multiple contexts. A simple mistyping
of the value will make the logic fail. It has almost all the disadvantages/advantages
of the previous example except the verbosity (which can be identical).

Besides putting it inside the class as a constant, as with the previous example,
there are other ways to avoid these values more fit of these situations:

1. Refactor the code to use explicit classes/interfaces/traits instead of
hardcoded variations:

   ```php
   class SpaceRocket extends Vehicle {}

   // instead of if($vehicle->isSpaceRocket()) :
   if ($vehicle instanceof SpaceRocket)
   ```

2. Create an abstract class with the multiple types:

   ```php
   abstract class VehicleType
   {
     const CAR = 'car';
     const SPACE_ROCKET = 'space_rocket';
   }

   class Vehicle
   {
     public function isSpaceRocket()
     {
       if ($this->type === Vehicle::SPACE_ROCKET) {
         return true;
       } else {
         return false;
       }
     }
   }
   ```

## Magic values used for "wiring"

There is another common example of magic values in symfony projects, the usage
of special "wiring" values, such as the ones used with getting services from
service locators.

```php
// Do not do this:
$repo = $this->entityManager->getRepository('TransportationBundle:Vehicle');
```

First, ideally, you should avoid service locators, as described in the
"[Avoid Service Locators](/patterns/avoid-service-locators/)" pattern.

Even when not taking that best extra step of defining the repository as a dependency,
there is a very simple alternative, which is to use the existing `::class` constant
that points to the fully-qualified-name of a class, which allows to do the same
as above, with a statically typed value (refactorable, statically-verifiable, etc.):

```php
// if you must really get a repo from the entity manager use
//  the :class constant which even leverages the "use" declarations
$repo = $this->entityManager->getRepository(Vehicle::class);
```

## Exception - un-translatable string

One fo the rare exceptions where using a magic value is acceptable is
where the magic value is a string that self-explains itself and that is not
supposed to be translated, for example with messages used in logging:

```php
$logger->write('Opening connection to the database');
```
