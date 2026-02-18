# WYSIWYG Components

## Overview

This folder contains stylesheets and analytics for WYSIWYG text formats used throughout the site. Each text format has its own subdirectory with the necessary CSS and JavaScript to properly render and track content added through that editor.

## Organization

Stylesheets and analytics are organized by text format. When a text format is used on a page, only the required assets for that specific format need to be loaded.

## Current Text Formats

### `ncids_full_html`
Full-featured text format supporting embeds, featured content, and glossified links.

**Assets:**
- `ncids_full_html/index.scss` - Styles for the editor
- `editor.editor.ncids_full_html` - Located in `cgov_article`
- `filter.format.ncids_full_html` - Located in `cgov_article`

## Analytics Note

**Current Limitation:** Analytics not yet implemented. We need to add a check to prevent multiple initialization calls before analytics can be safely added to the text format components.

**TODO:** Implement initialization guard to prevent duplicate analytics initialization when the same text format appears multiple times on a page.

## Adding a New Text Format

1. Create a new directory named after your text format under the `/editors` sub-directory (e.g., `wysiwyg/editors/my_new_format/`)
2. Add required stylesheets (e.g., `my_new_format/index.scss`)
4. Forward the stylesheet where the text format is used
5. Update this README with the new format details
