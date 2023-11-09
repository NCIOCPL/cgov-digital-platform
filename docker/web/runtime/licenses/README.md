This folder houses a `licenses.php` file that contains license keys for any add-ons.

The file has the format:
```
<?php

$cgdp_license_keys = [
  '<product_name>' => [
    '<environment>' => '<key>',
    ...
    'default' => '<key>',
  ],
  ...
];

```

Where:
* `<product_name>` would be something like `ckeditor_lts`.
* `<environment>` would be the name of the environment as per our normal environment naming. (e.g. `ode`, `01live`, `local`)
* `<key>` would be the string or object you need to setup the configuration.

There should always be a default key specified which is for development purposes. So if there is a key for production and a key for development, then you only need to specific `01live` as an environment using the production key, and use the `default` to store the development key.

NOTE:
