# Cgov YAML Content Loader

## What am I for?

Use this module as a CLI tool to create entities in the database from structured YAML files.
This tool is especially helpful for expediting demo preparations, test environment setups, and driving you insane with impossible to find indentation errors.

## How do you use me?

First create XXX.content.yml files in the cgov_yaml_content/content directory. Then run 'drush ycim cgov_yaml_content' from the command line after installing Drupal (inside the Docker container).

All of the files in the content directory are sorted alphabetically before loading. So if you have dependencies across files, you need to make sure the files are named such that the order is maintained. As such we are following the Basic Programming style of line numbering. (Numbers start the filenames and you leave enough space between the next group to fit new items in)
* 000-009 Site Sections
* 010-090 Content Pages
* 099-199 Landing pages

(Note, you can have a bunch of Content Page files start with 010_XXX. It is ok as long as there are no dependencies.)

Additionally the file names should be descriptive either by Content Type where we are bulk loading things of the same type that are dumped in the same folders. (e.g. press releases, or PDQ summaries) For actual articles and landing pages they should be named with enough of their file path that we could figure out where on the Cancer.gov front-end they live in. (e.g. 010_coping_feelings.content.yml, 010_coping_feelings_relaxation.content.yml or 099_about-cancer.content.yml)


NOTE: The CLI command is now baked into the blt helper command 'blt cgov:reinstall' as well as post code-deploy hooks for ODE environments.

## What are the gotchas? How is the sausage made? Implementation overview:

### tl: dr; It's brittle, but it mostly works. Watch your indenting. There be dragons here.

You tell me? No, I mean, you tell me. I'm sure you will. We're still discovering the uses and limitations of the library. This is essentially a series of, dare I say, clever hacks, sitting on top of a series of other nested tools. That fact alone should help explain/excuse some of the eccentricities it may exhibit. At its core is Symfony's built-in YAML parser. Beyond that, a contrib Drupal module, yaml_content, builds on top of Symfony's parser to provide a service that allows for using structured YAML files to represent Drupal entities. yaml_content uses Symfony to parse these files, then proceeds to take the parsed data and programmatically create Drupal entities and save them. Thankfully it offers several lifecycle hooks along the way, cgov_yaml_content is a subscriber that listens to the post save lifecycle event. yaml_content returns both the entities it saves and the matching parsed YAML content. That allows cgov_yaml_content to create translations of those entities programmatically. In addition, cgov_yaml_content is able to create blocks for default block content and then programmatically place those blocks in the appropriate theme regions. This means we can not only create, but also place footers, headers, and government shutdown notices at will on site installation.

There are a few other fiddly bits complicating the whole affair. Paragraphs are special and need to be handled in a special manner in order to create and associate translations. But exponentially more annoyingly, yaml_content has an admittedly useful internal set of methods to handle a special #process directive that lets you add callbacks into your otherwise structured YAML document. However, yaml_content does not expose them as a service. In order to hack our way in to the protected methods that allow cgov_yaml_content to use yaml_content's #process processor, we needed to extend the class and expose an entry point method. So yeah, it's hacky, but its ours.

## Rules:

##### (NOTE: Reference documentation for YAML and yaml_content for how to structure your files. The rest describes idiosyncracies related to cgov_yaml_content)

* All files need to be in the cgov_yaml_content/content directory. No sub directories allowed (this is yaml_content's fault).

* All files need to be suffixed with .content.yml

* You can have multiple entities in a single file.

* Watch your indenting! No doubt you will still learn the hard way, but it bears repeating nonetheless.

* If you want to translate a field, create a copy of the field key with __ES added at the end.

* If you create an __ES field, you cannot add a value directly. You have to nest the value in a value key:

    BAD:
    ```yml
    title: Where is the library?
    title__ES: Donde esta la biblioteca?
    ```

    GOOD:
    ```yml
    title: Where is the library?
    title__ES:
      value: Donde esta la biblioteca?
    ```
* To add a raw content block to a region, use region__CONFIG (The __ES is a way of sneaking invalid entity fields past the yaml parser but maintaining a strong association with the valid fields for the cgov_yaml_content library to work with. __CONFIG, lets us do the same for specifying regions to place programmatically created blocks to hold the custom raw content blocks.)

  ```yml
  region__CONFIG:
    value: 'main_nav'
  ```

... To be continued?
