## Purpose
This module controls configuration for the migration of CancerGov sites.

Mostly, it provides data and configuration for `migrate_plus`.

## Configuration

Data file URLs take the form of `migration://filename`.  All files are loaded from a subdirectory under
the `cgov_migration` module's `migragtions` directory. THe individual site's sub-directory is specified in
the `MIGRATION` environment variable.

So the DCEG english article xml would be placed in `cgov_migration/migrations/DCEG` and specified in the
`migrate_plus.migration.article_en_migration.yml` file as `migration://article_en.xml`.  Because the MIGRATION
environment variable is set to `DCEG`, the `drush mim article_en_migration` command will know to pick it up
from the correct location.
