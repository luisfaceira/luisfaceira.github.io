---
title: Dependency Injection
date: 2018-02-20
tags: ["dependency-injection", "OOP", "service-locator", "container", "di"]
layout: post
thumb_img_path: images/puzzle.jpg
thumb_img_alt: Puzzle
content_img_path: images/puzzle.jpg
content_img_alt: Puzzle
---

## Basic Concept

Dependency injection (aka Inversion of Control) is a very important pattern to
avoid having dependencies of concrete implementation classes, removing the
usage of constructors `new ClassX()`, which removes all possibility for
extending, mocking, switching implementations, etc.

Instead of explicitly using a dependency, a class declares its dependencies
either on its constructor (mandatory dependencies) or in setters (optional deps),
making the responsibility of its user to **inject the dependency**.

Instead of this:

```php
public class MyClassA
{
  public function methodA()
  {
    $logger = new Logger();
    $logger->log('using an hard dependency on the Logger class');
  }
}
```

with the dependency injection pattern, we do this:

```php
public class MyClassA
{
  public function __construct(LoggerInterface $logger)
  {
    $this->logger = $logger;
  }

  public function methodA()
  {
    $this->logger->log('using a soft, extendable/mockable dependency');
  }
}
```

## DI does not eliminate dependencies

It might make all of this appear worthless, but it's important to understand
that the DI pattern does not make a dependency disappear, it "simply"
migrates such dependency to an higher level.

By having a class get one of its dependencies injected, we're of course not really
fully avoiding that the dependent class is instantiated somewhere. In the example
above, we're simply providing flexibility to the user/caller of ClassA to decide
how to, in this case, log things.

So, eventually, there would be some other class, `ControllerB` that will instantiate the logger:

```php
public class ControllerB
{
  public function action()
  {
    $logger = new Logger();
    $objectA = new MyClassA($logger);
    $objectA->methodA();
  }
}
```

Even if it might seem we're just "moving the problem around", there are still advantages:

* it allows for other controllers to use `MyClassA` in a different way
* it makes 'MyClassA` easier to test (making it possible to mock its dependencies)

## Service-Locators

This DI pattern is mixed up with the use and (sometimes overuse) of the
service locator, which becomes an anti-pattern.

Read more about why you should [avoid service locators](/patterns/avoid-service-locators)!
