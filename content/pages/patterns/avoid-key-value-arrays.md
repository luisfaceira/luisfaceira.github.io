---
title: Avoid key-value arrays
date: 2018-02-22
tags: ["OOP", "strong-typed", "array", "hashmap"]
layout: post
thumb_img_path: images/hashmap.jpg
thumb_img_alt: Hashmap
content_img_path: images/hashmap.jpg
content_img_alt: Hashmap
---

Particularly in dynamically typed languages (such as PHP and Javascript), there
is a strong support for operating key-value arrays (aka hashmaps).

This provides extreme flexibility in situations where an item can have multiple
non-determined properties.

But non-determinism is a source of many problems, and is generally better
to use well-established interfaces and types, using real OOP objects/classes
to establish which are the acceptable or not-acceptable properties for such item.

This is particularly significant when defining the interface/signature of a method,
it's always best if what such method supports is clear and even, if possible,
enforced by the method signature.

So:

```php
// Instead of this:
public function printLastLoginOfUser(array $userProperties)
{
  $username = $userProperties['username'];
  $lastLogin = $userProperties['lastLogin'];
  
  echo 'User '.$username.' last login: '.$lastLogin;
}

// Either use the precise properties you need
public function printLastLogin(string $username, \DateTime $lastLogin)
{
  echo 'User '.$username.' last login: '.$lastLogin;
}

// Or even better, use a typed class/object, if possible
public function printLastLogin(User $user)
{
  $username = $user->getUsername();
  $lastLogin = $user->getLastLogin();
  echo 'User '.$username.' last login: '.$lastLogin;
}
```

By using well-defined interfaces not only does the code becomes more clear and
safe, it will also be more apparent what's its scope and in which class they should
be organized into. For example, the approach above of using the class should
be refactored into the User class itself, like this:

```php
public class User
{
  public function printLastLogin()
  {
    echo 'User '.$this->username.' last login: '.$this->lastLogin;
  }
}
```

Key-value arrays are acceptable to use on in-method logic, and sometimes in
private methods, but for public methods, it is very rarely really needed such
amount of flexibility, and there are many advantages to defining the exact
properties needed or a typed class with the group of properties.

Therefore, as a rule of thumb: *Do not use key-value arrays on public method arguments*

In the extremely rare situation where the method requires more than 5 arguments,
consider creating a typed class or structure first, and only if not viable use key-value arrays.
