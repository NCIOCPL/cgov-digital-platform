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

if ($samlDir) {
  // Our SP certificate can be loaded from the host filesystem
  $config['samlauth.authentication']['sp_x509_certificate'] = sprintf('file:%s/certificate/saml.cert', $samlDir);
  $config['samlauth.authentication']['sp_new_certificate'] = ''; // in case we need it in the future
  $config['samlauth.authentication']['sp_private_key'] = sprintf('file:%s/certificate/saml.pem', $samlDir);;

  // Our SP entity IDs are our site URLs
  $fullName = $_SERVER['SERVER_NAME'];
  $hostUrl = sprintf('https://%s', $fullName);
  $config['samlauth.authentication']['sp_entity_id'] = $hostUrl;

  // The rest of the data is stored in the IDP metadata file
  $segments = explode('.', $fullName);
  $hostname = $segments[0];
  $metadataFile = sprintf('%s/idp-metadata/%s.php', $samlDir, $hostname);
  require($metadataFile); // Defines $metadata.
  $idpData = array_pop($metadata);
  $idpService = $idpData['SingleSignOnService'][1]['Location'];

  $config['samlauth.authentication']['idp_entity_id'] = $idpData['entityid'];
  $config['samlauth.authentication']['idp_single_sign_on_service'] = $idpService;
  $config['samlauth.authentication']['idp_certs'] = [$idpData['keys'][0]['X509Certificate']];

  // We have to extract the IDP hostname to calculate the logout URL
  $parsed_url = parse_url($idpService);
  $logOutUrl = sprintf('%s://%s/login/signout', $parsed_url['scheme'], $parsed_url['host']);
  $config['samlauth.authentication']['idp_single_log_out_service'] = $logOutUrl;
}
