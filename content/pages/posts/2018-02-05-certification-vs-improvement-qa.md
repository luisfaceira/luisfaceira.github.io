---
title: "Who should do the testing?"
subtitle: Certification vs. Improvement QA
date: 2018-02-05
tags: ["test", "quality", "qa", "agile", "xp", "tdd"]
layout: post
thumb_img_path: images/testing.jpg
thumb_img_alt: Testing
content_img_path: images/testing.jpg
content_img_alt: Testing
---

Time and time again I get asked the question: "Who should write the tests?"

Most times this is a trap-question, when this is asked in an attempt to end
some sort of tribal internal black-and-white discussion between those who
argue it should be the developer and those who argue that the developer is
precisely the last person on earth who should do it.

Both have sound arguments, and as usual, the truth lies somewhere in the
middle, which in this particular case seems an almost impossible concept.

<!--more-->

This is not just about who writes the tests. It's about the inner driver of 
quality assurance. There are two approaches to quality assurance in software
projects, that although complementary, are looked upon as contradictory and
incompatible, which, in my experience, frequently leads to failure. They are:

* **Certification QA** - Made by another person/group/entity/process providing an
independent confirmation of quality, which can't be safely done by who has the
vices and assumptions of whoever develops the solution
* **Improvement QA** - Techniques used by whoever is developing the solution,
that lead it to improve the quality of its work, namely by emulating being
another person/group/entity on the perspective of the user of the work produced.

-----------------------

## Certification QA

This is the classical approach, and the one you're more likely to find in big
corporations. But, isolated from Internal QA has a massive track record of
failure after failure.

It looks at QA (and in particular testing) as a way for entity `A` to assess
the work of entity `B`, in order to ensure (and sometimes to formally certify)
that the work produced has NO problems. The tester must be *external,
independent and unbiased*.

One limitation of this is that its output is mostly binary: it either passes
or it doesn't. When on earth have you seen quality defined as existing or
nonexisting?

It has the advantage of better preventing that developer deceives himself
(or others) on whether its work meets certain requirements or not. But the
result is rarely to identify improvement opportunities as much as it is to
identify what needs to be fixed.

On the other hand, by being binary, creates clear incentives to simply sweep
under the rug and do whatever it needs for the quality control process
to pass, instead of focusing on improving the quality. Piles of trash keep
accumulating...

I argue that, if only this sort of QA is done, and is not reinforced with
internal QA, it very quickly leads to unmaintainable rotten code. It
leads to watermelon software: **green on the outside, red on the inside**

![Green on the outside, red on the inside][watermelon_image]

------------------------

## Improvement QA

This is the approach that is somehow more encouraged by modern agile practices
such as TDD or XP.

Within _Improvement QA_, entity `A` executes some practices that force it to
emulate itself as being an external `B`, in order to be more self-critical
and immediately improve the quality of its work.

For example, when a team does internal code-review, it forces itself to
imagine being a future programmer, which will have to evolve and change it,
or imagine doing support and tracking a bug across a piece of code. This
makes it easier to self-criticize and improve the names of the variables, the
architecture, etc. and immediately improve it.

When developing a unit test, the developer is forcing itself to being a future
user of its unit (outside of its current issue), and thinking about its public
interfaces, instead of just thinking on how to solve their immediate problem.

Notice that, the primary output of this sort of QA is not binary, the unit
test development is not as much focused on checking that the new unit complies
or not with what it should do. Instead, its focused on validating if its
interface is clear, easy to use (the test uses it), flexible (it's hard to
test coupled code), and thus proactively improve its internal quality.

> *But isn't the unit test validating its specification?*

Sure, but that's a byproduct. In addition to the primary output (improved
internal quality), that you get during its development, you can then add the
automated test into the set used for regression checking, and thus it acts
as the "external, independent, unbiased".

![Robots are best in being unbiased][robots_image]

_Improvement QA_ promotes awareness of the importance of quality (internal and
external) within the development team and the growth of know-how and
experience on how to do higher quality work in smaller iterations.

Additionally, I argue that when verification isn't seen as an external
process, testing code is less likely to be treated as `second-class code`,
leading to an higher quality, easier to maintain and therefore less likely to
become a burden of false positives and confusing outputs.

This approach does not necessarily imply that the test must be made by the
developer, but above all that **QA shall feed quality into development instead
of just monitoring for the lack of it**.

--------------------------

## Comparison

| Type of QA                                        | Improvement                     | Certification              |
|---------------------------------------------------|---------------------------------|----------------------------|
| To eliminate the bias of the problem-solver...    | the team changes hats           | another entity controls it |
| It mainly aims to...                              | improve quality                 | control minimum quality    |
| It identifies...                                  | opportunities to improve        | problems                   |
| Its output is...                                  | subjective, range               | objective, binary          |
| Focuses on...                                     | internal quality                | external quality           |
| Leads to...                                       | sustainable projects            | green on the outside       |
| Best done by...                                   | the developer itself            | a robot                    |
| The quality of the testing code itself becomes... | as good as the rest of the code | a second-class citizen     |

To achieve sustainable quality, start with a focus on *Improvement QA*. Add
*Certification QA* when its cost is residual (as in the case of reusing the
developed tests for regression), or whenever they are considered high risk
(billing, authentication, deployment, etc.).

----------------------

## TL;DR

> *So, who writes them, then?*

**Improvement QA** should be done by those that can directly impact the
development. When viable, by the developer itself.

**Certification QA** should be done by another entity. When viable by a BOT that
simply reuses tests developed by the development team.



[watermelon_image]: https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Death_Star_Watermelon_%284737176336%29.jpg/640px-Death_Star_Watermelon_%284737176336%29.jpg
[robots_image]: https://c1.staticflickr.com/1/701/22157065162_70e7b5c6e1_b.jpg
