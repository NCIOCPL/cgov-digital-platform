<?php

/**
 * SAML IDP loader.
 *
 * Environment-specific IDP metadata is stored in:
 * /mnt/files/$_ENV['AH_SITE_GROUP'],$_ENV['AH_SITE_ENVIRONMENT']/saml/config/saml20-idp-remote.php
 *
 * This file is responsible for loading it transparently.
 */

$idpFile = sprintf('/mnt/files/%s.%s/saml/config/saml20-idp-remote.php', $_ENV['AH_SITE_GROUP'],$_ENV['AH_SITE_ENVIRONMENT']);
if (file_exists($idpFile)) {
  require_once ($idpFile);
}
