# Purpose
This module is here because the `block_content` enity type was built to only be used within `block` entities. `block_content` however is a perfect solution to be able to create reusable components and embed them within content across the site. So this module removes some of the assumptions that they are always used within `block` entities.

# TODO:
* The add new block content should go under Add media in the Admin toolbar. (Under content, not structure)
* A tab should appear next to Media on the content overview tab.
* Permissions need to be nailed down for editors to create the blocks and see the listings.
