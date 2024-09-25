# Card twig templates

## How do you use me?

So we have 3 feature card paragraphs (NCIDS Feature Card Internal, External, Multimedia). Each one of these paragraphs must have it's own paragraph twig template as stated by the twig suggestions so we have 3 of them:
* paragraph--ncids-feature-card-internal--default.html.twig
* paragraph--ncids-feature-card-external--default.html.twig
* paragraph--ncids-feature-card-multimedia--default.html.twig

There are other `paragraph--ncids-feature-card--<blah>` templates there but those are using a different view mode to render out the feature cards (using the view mode `ncids-group-card `to render out in the 3 feature card row). There is no way to have 1 template to handle the 3 cases of feature cards because the way we extract the data for each of them is different. For internal and multimedia, we need to check if the featured item has content we can use or if the content editor overrides any of the content when making the feature card. For external feature card, there is no featured item so we render out whatever the content editor inputs. The only similarity between these 3 cards is the HTML in which they get rendered. The data (i.e. heading, description, image) that gets extracted differs between each feature card which is why we do them separately in each `paragraph--<blah>` twig files, and then render them out the same using our macro thats inside of ncids_card_macros.twig.

`ncids_card_macros.twig` contains the functions to render our Feature Cards and Flag Cards.

`ncidsFeatureCard` macro is used in the following twig templates:
* `paragraph--ncids-feature-card-external--default.html.twig`
* `paragraph--ncids-feature-card-internal--default.html.twig`
* `paragraph--ncids-feature-card-multimedia--default.html.twig`
* `paragraph--ncids-feature-card-external--ncids-group-card.html.twig`
* `paragraph--ncids-feature-card-internal--ncids-group-card.html.twig`
* `paragraph--ncids-feature-card-multimedia--ncids-group-card.html.twig`

`ncidsFlagCard` macro is used in the following twig templates:
* `paragraph--ncids-feature-card-external--ncids-flag-group-card.html.twig`
* `paragraph--ncids-feature-card-internal--ncids-flag-group-card.html.twig`
* `paragraph--ncids-feature-card-multimedia--ncids-flag-group-card.html.twig`

The remaining paragraph twig templates are independent from our ncids macros. The `cgov-card-raw-html` twig templates are independent from our ncids card macros. The `cgov-card-external`, `cgov-card-internal`, and `cgov-card-borderless` twig templates are using legacy macros but follow the same logic as our NCIDS components.
