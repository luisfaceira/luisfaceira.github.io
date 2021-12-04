---
title: Streams and Pagination
date: 2018-09-25
tags: ["OOP", "performance", "memory", "ORM"]
layout: post
thumb_img_path: images/pagination.jpg
thumb_img_alt: Pages
content_img_path: images/pagination.jpg
content_img_alt: Pages
---

## Avoiding memory overuse

While disk space is becoming increasingly cheaper, quick-access memory still is
a relatively expensive resource in computing infrastructure. Also, it is most
often not automatically expansive, its limits can be pretty hard to overcome
(even though swap - which stores it temporarily in disk softens it a bit).

We should be conscious about our usage of this scare resource, without trying to
preemptively improve it too much (premature optimization is the root of all
evil). It's not so much that we should spare from overusing it, but we should
mostly be aware that if something has an high usage for it it might bust it out
completely on a different machine, on a different load or with a different set
of data.

As a rule of thumb to know if it's worth to look into it, a web page request
should never go over 150 Mb and a background processing over 300 Mb of peak
memory usage. In php one can see what this value was by calling the function
`memory_get_peak_usage`. Most debuggers/profilers also make this value apparent.

Generically, unless we've been having performance/memory issues on the specific
application or area of the application, it's not worth it to look for such
memory drains, they usually make themselves notice.

But naturally, if we bump into fatal failures for memory exhaustion and/or if
we are able to anticipate that we are seeing a strong candidate for it, such as
when we deal with thousands of records at once, it's important to know a few
techniques on how to avoid overuse of memory.

## Streams

A programming concept that is used to avoid memory overuse is streams.

A stream is an asynchronous programming pattern where a set of data to be
processed is received continuously or at an unknown rate on its input interface,
temporarily stored in a FIFO (first-in-first-out) buffer storage and as its
processed, sent out on its output interface.

In this pattern, the maximum memory is defined by the buffer size. It's used
for continuous and never-ending processing. In this approach is not so relevant
how much big the data to be processed is, but more how fast can it be processed,
what is its throughput. The stream must be able to handle the data fast
enough that the buffer doesn't fill itself (or the buffer must be big enough to
accommodate it).

Although true streams are continuous and data is processed as-soon-as-possible,
there are situations where that is hard to achieve due to the nature of the
underlying architecture or programming language and when in practice a stream
is emulated through polling, where the processor of the stream periodically
checks if there is new data to be processed.

There can also be streams with a buffer that is not limited, and let it be
limited itself by the underlying infrastructure available memory. Even if that
would also risk a memory exhaustion, the risk is of orders of magnitude lower
than not using a stream and handling the whole data at once.

## Pagination

Pagination can be seen as a variation/simplification of the streams pattern.

When it's the processor that controls the rate at which data is fetched from
another source (for example, from the database), instead of fetching all the
data at once, it can treat it as if it were a book which its read (and
processed) page-by-page.

Most database-abstraction tools already have native support and/or examples on
how to achieve pagination.

This is the go-to solution when handling massive amounts of data with an ORM.
Specifically, in Doctrine2 there is an abstraction to providing pages almost
transparently to the collection user called
[Paginator](https://www.doctrine-project.org/projects/doctrine-orm/en/2.6/tutorials/pagination.html).
