---
title: Good urls
date: 2018-03-05
tags: ["architecture", "rest", "restful", "urls", "routing"]
layout: post
thumb_img_path: images/address.jpg
thumb_img_alt: Good urls
content_img_path: images/address.jpg
content_img_alt: Good urls
---

## Usability of urls

The URLs that are used for the multiple interactions with an application
are commonly seen as a technical detail of a web application, specially if it's
not part of a integration API.

But although they can be essentially ignored by the end users, they are actually
visible and interacted upon by the end user, so they are a sort of user interface,
so its usability should not be disregarded

Good urls should be understandable, should be guessable (with the exception of
direct-sharing private links), and should be possible to manipulate by the users.

They might not be ideal for them to be programmed (it would require web-scraping)
but the routes/urls of a web application establish, in great measure, are its
world-facing interface. So, many of the reasoning that apply to good url design
on Restful APIs also apply to good url design of the main HTML endpoints of an
application.

## Restful urls

Good restful urls follow the following rules:

* The url identifies the target of an action, like this:
  * `/optionalNamespaces/collectionName`
  * `/optionalNamespaces/collectionName/itemIdentification`
* Standard CRUD actions are identified by the HTTP method:
  * Create: `PUT` or `POST` on the collection URL
  * Read: `GET` without parameters, on the collection URL (to list) or on the
individual item URL (to view details)
  * Update: `POST` on the item's url or `PUT` on the collection URL (with the id
as parameter)
  * DELETE: `DELETE` on the item url

* Additional non-crud actions can be established by appending `/extraAction` to
the item or collection url
* Optional parameters are NOT part of the url and should be sent as POST parameters.

## Avoid Query strings

Query strings are the classical way to provide parameters to a web application,
in the form `viewPage?id=123`.

One of the problems of these query strings is that they are ignored by search
engines and other mechanisms as not being part of the URL. So, we should use
`page/123` instead, which most web frameworks already provide as default,
converting the `123` to an argument for a more generic action.

Besides the parameters that identify the target of an action, or the action itself,
if additional ones are necessary, they should preferably be sent as POST
parameters.

## Avoid removing support to known URLs

If a URL has some visibility, it's a risk to change it, and it should be avoided.
Since the URL is the main interface of the application, its users might be
expecting for a certain URL to work, and we should avoid not delivering on a
user expectation. This is particularly relevant if the user has set an URL as
favorite.

This does not mean that bad urls should stay bad forever. It means we should think
on them deeply as we create them, being aware that it's something that shouldn't
be changed often.

If that hasn't been done, or for some other reason we find ourselves in a situation
where we really need to change an url, we should consider establishing a way to
answer the "old" url with a Permanent Redirect (HTTP 301) response, at least for
a reasonable "transitioning" period.
