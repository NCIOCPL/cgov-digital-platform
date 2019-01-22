# PDQ Core Module

## Description

This module provides the common functionality and common fields used
for PDQ content. For the initial release of the new CMS, two content
types are supported, one for PDQ Cancer Information Summaries, and
the other for PDQ Drug Information Summaries. Each type has its own
module.

## API

Three RESTful API verbs are provided by this module, for `GET`, `POST`,
and `DELETE` requests. All of the APIs use `json` encoding.

### `GET`

A `GET` request for `/pdq/api/CDR-ID` is used to find out which Drupal nodes
store the content for a given PDQ document imported by the CDR.  The `CDR-ID`
portion of the URL is the integer for the unique CDR ID for the PDQ document,
optionally prefixed with `CDR`. The response returns an array of pairs each
of which has a node ID and a language code. For example:

```javascript
[
    ["15473", "es"]
]
```

Unless something has gone wrong, there should be at most a single pair for a
given CDR ID.

For retrieving the actual node values for a given PDQ content item, use the
`GET` api implemented for the specific content type for the item.

### `POST`

A `POST` request is submitted to `/pdq/api` to release the PDQ content items
which have just been pushed from the CDR in a publish job, flipping the
moderation state from `draft` to `published`, which in turn sets the `status`
flag for the entities. The data provided with the request is a sequence of
node ID + language code pairs. For example:

```javascript
[
    ["15473", "en"],
    ["18543", "es"],
    ["21418", "en"]
]
```

The response body contains an array with a single element whose key is
"errors," and whose value is a possibly empty sequence of arrays, each
of which contains a node ID, language code, and error string for an
entity which could not be released. For example:

```javascript
[
    "errors" => [
        ["18543", "es", "translation could not be found"]
    ]
]
```

The client for this request must break up the set of content items to be
released into smaller batches (25 is a reasonable number) when the job
is large, as PHP will otherwise run out of memory.

For storing PDQ documents, use the `POST` API implemented for the specific
type of each document (e.g., `/pdq/api/cis`).

### `DELETE`

A `DELETE` request for `/pdq/api/CDR-ID` is used to remove a PDQ document
from the site. `CDR-ID` has the unique ID (possibly prefixed by "CDR")
for the document to be removed. When an English summary is deleted, the
node is completely removed (it is not allowed to delete an English summary
for which a Spanish translation is present). When a Spanish summary is
deleted, the node is kept with the English summary.

## APIs for individual content types

Each content type has its own set of APIs for retrieving (`GET`) and
storing (`POST`) PDQ content. Consult the documentation for each content
type's module for details.
