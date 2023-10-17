<?php

/**
 * @file
 * Set up SAML settings for Single Sign-On
 */

// Get our current environment
if (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT'])) {
  $samlDir = "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/saml";
} elseif (file_exists('/var/saml')) {
  $samlDir = "/var/saml";
}

// Get host information
$fullName = $_SERVER['SERVER_NAME'];
$segments = explode('.', $fullName);
$hostname = $segments[0];
$metadataFile = sprintf('%s/idp-metadata/%s.php', $samlDir, $hostname);

if (file_exists($metadataFile) && $hostname !== 'default') { // hostname=default during drush commands

  // Show the login link if we have SAML capabilities.
  $config['samlauth.authentication']['login_link_show'] = TRUE;

  // Our SP certificate can be loaded from the host filesystem
  $config['samlauth.authentication']['sp_x509_certificate'] = sprintf('file:%s/certificate/saml.crt', $samlDir);
  $config['samlauth.authentication']['sp_new_certificate'] = ''; // in case we need it in the future
  $config['samlauth.authentication']['sp_private_key'] = sprintf('file:%s/certificate/saml.pem', $samlDir);;

  // The rest of the data is stored in the IDP metadata file
  require($metadataFile);
  $config['samlauth.authentication']['sp_entity_id'] = $idpData['spEntityId'];
  $config['samlauth.authentication']['idp_entity_id'] = $idpData['idpEntityId'];
  $config['samlauth.authentication']['idp_single_sign_on_service'] = $idpData['singleSignOnService'];
  $config['samlauth.authentication']['idp_certs'] = [$idpData['idpCert']];

}
