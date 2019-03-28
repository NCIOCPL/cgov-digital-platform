## A few notes about this folder.

1. We have an actual paragraph type that is allowed on Home/Landing and Mini Landing called a List. This allows a content editor to create a curated list of links.
   * It is actually a list of Internal and External Link paragraph items
   * This only allows the following styles:
     * List with titles
     * List with titles and descriptions
     * List with titles, descriptions and images
   * The title of the list items in the list are H3 elements in this display, as opposed to just a link.
2. We have related resources on multiple content types which:
   * Allow a list of Internal and External Link paragraph items
   * It only allows a List with titles
3. The Cancer Research Pages used on CTHPs allow:
   * List of Internal and External Link paragraph items
   * This displays as a List with Dates, Titles and Descriptions
4. The Press Release archive listing is driven by a view and displays its items as List with titles and dates
5. The Press Release archive listing on the news and events home is driven by a view and displays its items as List with titles and dates

All of these lists should share the rendering of the markup. Yes, there are slight differences such as show date, don't show date, however the visual styling is consistent for each list's display elements.

Given that each of these displays are different templates, across multiple modules, and even different entity types, we need to use macros to ensure the markup lives in one place. That is list_item_macros.twig.

So this folder contains that macro, the cgov_list templates, and internal/external paragraph templates for the various styles.



