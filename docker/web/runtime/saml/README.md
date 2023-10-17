To enable SAML login on local dev you need to place the following files in this folder:

- certificates/saml.crt
- certificates/saml.pem
- idp-metadata/www-cms.php

Alternatively you can use `scripts/utility/saml/saml_convert.php` to convert a `www-cms.xml` into `www-cms.php`.
