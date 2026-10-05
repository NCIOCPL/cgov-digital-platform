# PDQ Core Module

## Description

This module provides the common functionality and common fields used
for PDQ content. For the initial release of the new CMS, two content
types are supported, one for PDQ Cancer Information Summaries, and
the other for PDQ Drug Information Summaries. Each type has its own
module.

## API

Four RESTful API verbs are provided by this module, for `GET`, `POST`,
`DELETE`, and `PATCH` requests. These operations only manage PDQ Cancer
Information Summaries (CIS), which remain under CDR control. All of the APIs
use `json` encoding.

### `GET`

A `GET` request for `/pdq/api/CDR-ID` is used to find out which Drupal nodes
store the content for a given CIS document imported by the CDR. The `CDR-ID`
portion of the URL is the integer for the unique CDR ID for the CIS document,
optionally prefixed with `CDR`. The response returns an array of pairs, each
of which has a node ID and a language code. For example:

```javascript
[
    ["15473", "es"]
]
```

Unless something has gone wrong, there should be at most a single pair for a
given CDR ID.

For retrieving the actual node values for a CIS item, use the `GET` API at
`/pdq/api/cis/NODE-ID`.

### `POST`

A `POST` request is submitted to `/pdq/api` to release the CIS content items
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

For storing CIS documents, use the `POST` API at `/pdq/api/cis`.

### `DELETE`

A `DELETE` request for `/pdq/api/CDR-ID` is used to remove a CIS document
from the site. `CDR-ID` has the unique ID (possibly prefixed by "CDR")
for the document to be removed. When an English summary is deleted, the
node is completely removed (it is not allowed to delete an English summary
for which a Spanish translation is present). When a Spanish summary is
deleted, the node is kept with the English summary.

### `PATCH`

A `PATCH` request submitted to `/pdq/api/prune` removes older CIS node
revisions after a CDR load. By default, the three most recent published
revisions for each language are retained to provide a recovery window for a
bad automated load.

## CIS content API

The CIS module provides APIs at `/pdq/api/cis` for retrieving (`GET`) and
storing (`POST`) Cancer Information Summaries. It also provides a CIS-specific
`PATCH` operation for removing orphaned summary-section paragraph revisions.
PDQ Drug Information Summaries are managed in Drupal and are not exposed to
these CDR APIs.

## Manual CIS revision cleanup

Use `drush pdq:prune-node-revisions` to remove older CIS node revisions
manually. The command only accepts `pdq_cancer_information_summary` nodes,
whether they are selected with the `--bundle` option or supplied as explicit
node IDs. By default, it retains the three most recent published revisions for
each language.
