# Floating Delighter

## Summary

Inject a floating delighter anchor element onto a page given a set of a rules for the desired pages it should appear on.

## Usage

### Creating a new delighter element

New delighters should be defined in their own sub-directory in the delighters directory. Any custom css can be included through the new element file as well. A new element should consist of an exported object with the shape:

{
    href: String,
    innerHTML: String,
    ?classList: String[]
}

The href will be used to generate an anchor tag wrapping the innerHTML. The innerHTML should represent a string containing valid HTML that will be injected inside the anchor. The classList is an array of class names that will be added to the delighter container which will be inserted onto the page.

### Creating a new path rule (ie using a delighter on a new page or set of pages)

Adding a new rule is as simple as adding a new object to the rules array in rules.js. A new rule should have the shape:

{
    rule: RegExp,
    delighter: Delighter,
    ?exclude: [ RegExp | { rule: RegExp, whitelist: String[] } ]
}


## Troubleshooting

* The library defaults to looking for a div on the page with the selector '.page-options-container' and insert the delighter into it. If that element isn't on the page for any reason, a delighter will not appear. If the library is used on non CGOV pages, a different selector string can be passed as an argument on initialization of the library.

* This library uses a lazy algorithm to match rules, so the order of elements in the rules array matters in the case of overlapping rules. Make sure your rule's base rule property is unique.


## NOTE BIGTIME

The partials for page specific delighters that contain references to the sprite sheets were having issues with the path aliasing when not at the root of this library. Hence the reason why they are floating down in the root, wuite messily. Post-migration, this shoiuld hopefully be explored when time is a bit more free.
