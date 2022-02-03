<?php

/**
 * SAML IDP loader.
 *
 * Environment-specific IDP metadata is stored in:
 * /mnt/files/$_ENV['AH_SITE_GROUP'],$_ENV['AH_SITE_ENVIRONMENT']/saml/idp-metadata/
 *
 * This file is responsible for making sure the correct site's data is loaded.
 */

// CgovIdpTools is magically autoloaded for this use, so no need to require it.
$idpFile = \CgovIdpTools::getIdpFilepath();

require ($idpFile);

