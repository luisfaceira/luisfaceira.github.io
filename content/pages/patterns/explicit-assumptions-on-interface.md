---
title: Explicit assumptions on the interface
date: 2018-03-09
tags: ['OOP', 'methods', 'assumptions']
layout: post
thumb_img_path: images/interface.jpg
thumb_img_alt: Interface
content_img_path: images/interface.jpg
content_img_alt: Interface
---

One of the core concepts of object-oriented programming is encouraging to model
a solution to a system problem by splitting the complexity into smaller units,
(namespaces, classes, methods, etc.).

The purpose of such separation is to eliminate the amount of simultaneous
comprehension of a system that the programmer would need to understand, manage
and evolve a system-wide solution.

Instead of having to comprehend everything at the same time, he can instead
comprehend just a smaller unit and part of the problem/solution.

For this approach to be effective, when a person is trying to comprehend a unit,
which in its smaller form means a method, it should NOT have to look anywhere
else to understand it. The code inside it, its documentation, and the interfaces
of other units (methods) MUST be enough to understand what is going on.

This means that there can NOT exist any assumptions on how a method will be
used, by whom, in what context, other than the assumptions that are reasonable
implied by the interface of the method. Ideally, its signature (name and arguments)
should be enough, in last resort its documentation should clarify.

It is also not acceptable to explain such assumptions inside the code of the unit
because, they are not visible in the units that use it.

## Example

Consider the situation where we have a system that manages multiple types of
vehicles (cars, motorcycles, bicycles, etc.).

### Implicit assumptions (bad)

```php
public class Driver
{
  public function prepare(Vehicle $vehicle)
  {
    $tankSize = $vehicle->getTankSize();
    $dieselInTank = $vehicle->getGasInTank();
    $amountToFill = $tankSize - $dieselInTank;

    $vehicle->addDiesel($amountToFill);
  }

  public function moveForward(Vehicle $vehicle, int seconds)
  {
    if (! $vehicle->engineRunning()) {
      $vehicle->startEngine();
    }
    $vehicle->pushGasPedal($seconds);
  }
}
```

The above two methods take multiple visible assumptions about a vehicle:

* The vehicle has a tank for which we can get its size and status
* The vehicle is propelled by diesel (and not gasoline, for example)
* The vehicle has an engine that can be checked to be running and started
* The vehicle goes forward by pushing a gas pedal

Sometimes we take these sort of assumptions (either by mistake or on purpose)
based on our knowledge of the current state of the whole system. Maybe we know
that the single place that uses the above methods is the following piece of code
on another part of the system:

```php
public function doLongTravelByDieselCar(Vehicle $car)
{
    prepare($car);
    moveForward($car, 50000);
    // ...
}
```

The problem is, the project inevitably evolves, and the whole point of separating
the system into smaller manageable units is precisely to AVOID having to take into
account what other units do.

And as the system evolves, we'll eventually replicate parts of the code that was
originally only on that diesel car, to other situations... assumptions change,
and whoever is programming the other parts of the system, the other units, won't
care (as they shouldn't) how this works, they believe in the contract that it
establishes that when asks a `Driver` to `moveForward(Vehicle)` it will do so.

This is a time-ticking bomb:

```php
$driver->moveForward($bicycle);
```

## Explicit assumptions (good)

Assumptions are inevitable. In fact, assumptions are exactly what define the
interface of methods. It's OK to have them.

One should not attempt to develop all sorts of logic to drive all vehicles at
once. If for now our system will only need for our class `Driver` to be
able to drive diesel cars, we should NOT implement the logic for him to be able
to drive bicycles (YAGNI). It might be needed in the future, but it also might not.

But if the system does evolve into needing to drive bicycles, it must be clear
that it is not prepared to do that, the assumptions that the methods make should
be clear on their interfaces.

There are multiple ways to achieve that:

### Increase verbosity

Changing the unit's (method or class) name to transpire the assumptions it is
making is the simplest way to make them explicit and avoid future problems.

For example, we could call the above sample methods
`prepareDieselVehicle(Vehicle $vehicle)` and
`moveEngineVehicleForward(Vehicle $vehicle)`.

Much less likely that someone might call those with a bicycle, right?

### Use specialized classes

If a vehicle can take many forms, and they behave differently, we could model
those vehicles as extended classes of the base Vehicle class.

We could therefore use a `moveForward(Car $car)`. Shorter, clearer, and the
language engine will ensure that the method will never be called with a bicycle,
and hardly anyone will even consider it.

### Use interfaces

Better than simple class hierarchy, most OOP languages provide a mechanism
to handle assumptions: Interfaces.

The previous example of class hierarchy is not ideal, because it will limit to
use the moveForward with a car, but that wasn't really the assumption. The
assumption was that the vehicle provided had an engine. The method is already
ready to handle cars, vans. buses, trucks, etc., not just cars.

So, we could define the method's signature in the following way:
`moveForward(EngineVehicleInterface $vehicle)`

### Test assumptions, throw exceptions

Exceptions deserve their own independent pattern page, but they are particularly
relevant in the context of managing assumptions.

That's what they are made for in the first place. When you get thrown an
Exception for trying to connect to a database, is because the method has the
assumption that it should be used with an existing and available connection.

If one of our methods has an assumption, it should ideally test for those
assumptions and throw exceptions when they fail to be verified.

For example, it's perfectly acceptable that a `startEngine()` method has the
assumption that there is an engine. But to protect a situation where that rule
isn't followed (probably by mistake), we should do the following:

```php
public class Vehicle
{

  public method startEngine()
  {
    if (! $this->hasEngine()) {
      throw new VehicleWithoutEngineException();
    }
  }
}
```

## TL;DR

If you must take assumptions on how others will use a unit (method/class), ensure
that such assumptions are perfectly explicit in the unit's interface, and when
necessary test such assumptions and throw exceptions if they fail.
