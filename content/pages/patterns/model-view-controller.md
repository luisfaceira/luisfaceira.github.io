---
title: Model-View-Controller
date: 2018-02-21
tags: ["architecture", "mvc", "model", "view", "controller", "entities", "twig"]
layout: post
thumb_img_path: images/layers.jpg
thumb_img_alt: Layers
content_img_path: images/layers.jpg
content_img_alt: Layers
---

Model-View-Controller is one architectural pattern to clearly separate an
application into three layers.

This is the predominant pattern established by server-side web frameworks such
as Symfony, and it's important to understand it well.

There are some misconceptions and common misuses of the pattern, so here is an
attempt to clarify how it should be applied.

This separation is mostly conceptual. Even though there are some distinctions
in the common file types, base classes or common contents, most frameworks don't
really force us to organize our files in a way that explicitly separates the
three layers that correspond to three directories in the project.

So, more than placing a certain concern in a certain place, this pattern is
focused on ensuring that the concerns don't mix together. What's relevant is not
that a Controller should be on a certain directory, it's that it does not contain
model or view logic.

## The View

The view is usually the easiest part to understand and separate.

It is mainly (but not only) composed by templates that allow to render data
in what is usually a user-friendly way.

In Symfony projects, that usually means a Twig template. But it can also be
menu or form renderers, for example.

There are a couple of things that make up a good view layer:

* Templates should NOT use variables or any logic other than extremely simple
ifs and iterators to decide parts of the template to show
* Templates can only interact with the Model to retrieve simple accessors

An important concept is that an application can actually have multiple separate
view layers. For example, it can have an entire view layer for HTML and a separate
one for API.

## Controller

The controller layer is where the technical interaction logic occurs. It translates
the inputs and the context of the web request and translates them into
the appropriate actions to be executed upon the model, passes such values to fill
the view and present it to the user.

This is where the frameworks provide more value, by most of times doing most
of the heavy-lifting of pattern-matching routing, handling security, 404s, etc.

But Controllers should simply retrieve inputs, providing them to the model, then
the results to the view. And that should be it, *NO LOGIC*, no ifs, no loops, etc.

### CONTROLLERS SHOULD HAVE NO LOGIC EXCEPT INTERACTION LOGIC

The single exception to having logic in the controller is if its interaction logic
(though most is likely achievable through embedded framework configurations).

Interaction logic is only the one that decides technical aspects (e.g. the HTTP
return code), but should NEVER include the supporting business logic that supports
the decision on what interaction to apply.

For example, in a Controller, instead of this:

```php
if ($document->getOwner() != $currentUser && !$currentUser->isAdmin()) {
  $this->createNotFoundException('Document not found!');
}
```

we should do this instead:

```php
if (! $currentUser->isAllowedToSeeDocument($document)) {
  $this->createNotFoundException('Document not found!');
}
```

Bare in mind that an application can also have multiple groups of isolated
controllers. For example, a web application can have, beside its main HTTP-driven
controller layer, a group of command-line commands for system administration.

In this layer it is common to see the anti-pattern to put too much logic in the
Controller layer, but most of the times, refactoring it to the Model should be
easy.

## Model

Model is everything else, and is where the heart of the application should be.

Its where the BUSINESS LOGIC lives, where the system has the rules that represent
the business domain and the business rules on how to interact with such domain.

Because of its wider scope, this is usually the hardest of the three layers to
maintain organized.

Sometimes the concept of the Model is confused with the concept of database-backed
entities, but Model are all business-domain-specific classes, which includes
both persisted and not persisted objects.

Entities should be classes that represent business objects that are unique in
the sense that have an identity, and even if two are identical (think of two human
twins), they are still considered two separated objects that can become different
over time.

By having an identity, not considered to be ephemeral immutable objects, Entities
are usually persisted through an EntityManager (such as Doctrine).

An entity should be the single responsible for changing its state, and all state
coordinated state changes to an entity should be made by it.

Instead of this:

```php
$user->setActive('false');
$user->setDeactivatedAt($now);
$user->setDeactivatedBy($currentUser);
```

Consider this instead:

```php
$user->deactivateBy($currentUser);
```

Public getters and setters should be avoided, and only created when it makes sense
to have a direct and isolated change of that specific property (for example, if that
property is tied to a form).

Besides persisted entities, classes should be organized according to the business
domain logic (Domain Driven Design), and represent a direct translation of
business concepts and activities.

Reversely, there should not be *no awareness of the controller, session, or other
interface-related objects* in the Model. It's up to the controller to filter what
is needed and pass down just the business-related concepts to the Model.
