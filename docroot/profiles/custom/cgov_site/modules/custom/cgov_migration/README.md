# CGov Migration

The `pdq_dis_xml` migration reads the English XML files from the
`cc-drug-information-summaries` repository. It updates the latest revision of
an existing PDQ Drug Information Summary node matched by CDR ID, or creates a
published English node owned by the PDQ importer when no match exists. More
than one matching node is an error.

Run the read-only reconciliation before importing:

```sh
scripts/utility/clone_pdq_dis_xml.sh <repository-url> [git-ref]

ddev exec env \
  PDQ_DIS_XML_DIR=/var/www/html/files-private/pdq-dis-xml/content/en \
  drush cgov:pdq-dis-preflight
```

The clone script uses a sparse checkout so only the XML files directly under
`content/en` and required Git metadata are checked out. On the host, the XML
directory is `files-private/pdq-dis-xml/content/en`. DDEV mounts it at
`/var/www/html/files-private/pdq-dis-xml/content/en`. The script refuses to
overwrite an existing checkout; move or remove that specific directory before
requesting a fresh clone.

The preflight reports the XML and CMS counts, nodes to update and create,
duplicate or missing CDR IDs, CMS-only pages, site-section problems, and pretty
URL collisions. It returns a failure exit code for blocking inconsistencies.

Run the migration after the database updates which install the new DIS fields:

```sh
ddev exec env \
  PDQ_DIS_XML_DIR=/var/www/html/files-private/pdq-dis-xml/content/en \
  drush migrate:import pdq_dis_xml
```

The XML directory may instead be set with
`$settings['pdq_dis_xml_directory']`. Use `drush migrate:messages pdq_dis_xml`
to inspect rejected rows. A normal second import skips completed, unchanged
XML rows; use `--update` only when intentionally reapplying changed XML.

The legacy body field and its form/view configuration remain in place during a
partial import. They are replaced with the `field_article_body` configuration
only after every source XML document has imported without an error.

Rollback removes the migration tracking records but preserves the pre-existing
nodes. It cannot restore their old field values.

## Testing an upgrade from legacy content

The migration must be tested against a database containing the legacy PDQ DIS
content. Installing this branch from scratch loads the already-migrated YAML
fixtures and does not exercise the migration.

For local testing:

1. Check out the commit immediately before this migration and run
   `blt cgov:reinstall --no-interaction`.
2. Check out this branch without reinstalling the site.
3. Run `composer install`, then `blt drupal:update` to install the migration
   code and schema changes while preserving the legacy content.
4. Take a database snapshot, run `scripts/utility/clone_pdq_dis_xml.sh`, and
   run the preflight command.
5. Test selected documents with `drush migrate:import pdq_dis_xml
   --idlist=<cdr-id>,<cdr-id>`, then restore the snapshot before the full run.
6. Run `drush migrate:import pdq_dis_xml` without `--idlist` to test the full
   migration and its automatic finalization.

Use the complete XML directory even for an `--idlist` test. A reduced source
directory can make a partial test appear complete and trigger finalization.

An ODE must follow the same two-deployment pattern: first install the legacy
branch, then deploy this branch with `PRESERVE_ON_REDEPLOY=true` so the deploy
hook runs `blt deploy:update` instead of reinstalling the site. An ACSF test
environment should start from a fresh production database copy, take a backup,
deploy this branch, run database updates, preflight, and finally import.
