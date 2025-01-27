# Settings files.

Any settings which need to be set at runtime (versus something in the site profile) may be set by adding a `NAME.settings.php` file in this directory (where `NAME` is something descriptive).

This is all driven by the `acquia-recommended.settings.php` in `vendor/acquia/drupal-recommended-settings/settings`. The general order for settings to be loaded is:

* Acquia Cloud settings (from /var/www/site-php).
* Acquia Recommended Settings general settings.
* `global.settings.php` from this directory.
* Any other files in this directory, **except** `local.settings.php`.
* Site specific settings (`/sites/SITE_DIR/settings/includes.settings.php`)
* Continuous Integration settings (if applicable).
* Local settings, via `local.settings.php`.
* Site-specific local settings (`/sites/SITE_DIR/settings/local.settings.php`)

This is, of course, subject to changes in the aforementioned `acquia-recommended.settings.php`.
