<?php

/**
 * @file
 * Utility PHP script to create the SAML metadata PHP file.
 */

// Get our current environment.
if (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT'])) {
  $samlDir = "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/saml";
}
elseif (file_exists('/var/saml')) {
  $samlDir = "/var/saml";
}

if ($samlDir) {

  $spEntityId = $argv[1];

  if (!isset($argv[2])) {
    $domain = "cancer.gov";
  }
  else {
    $domain = $argv[2];
  }

  // Load and parse the XML.
  // Assumes you have an XML export from Okta with metadata.
  $metadataFile = sprintf('%s/idp-metadata/%s.xml', $samlDir, $spEntityId);
  $metadata = simplexml_load_file($metadataFile);
  $metadata->registerXPathNamespace("md", "urn:oasis:names:tc:SAML:2.0:metadata");
  $metadata->registerXPathNamespace("ds", "http://www.w3.org/2000/09/xmldsig#");

  // Extract the data from the XML.
  $idpEntityId = (string) $metadata->xpath("/md:EntityDescriptor")[0]['entityID'];
  $singleSignOnService = (string) $metadata->xpath("//md:SingleSignOnService[@Binding='urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect']")[0]['Location'];
  $idpCert = (string) $metadata->xpath("//md:EntityDescriptor/md:IDPSSODescriptor/md:KeyDescriptor/ds:KeyInfo/ds:X509Data/ds:X509Certificate")[0];

  // Create an array to hold the extracted data.
  $dataArray = [
    'spEntityId' => sprintf('https://%s.%s', $spEntityId, $domain),
    'idpEntityId' => $idpEntityId,
    'singleSignOnService' => $singleSignOnService,
    'idpCert' => $idpCert,
  ];

  // Generate a PHP file to store the data as an object.
  $phpCode = '<?php' . PHP_EOL;
  $phpCode .= '$idpData = ' . var_export($dataArray, TRUE) . ';' . PHP_EOL;

  // Save the PHP file.
  $metadataPHPFile = sprintf('%s/idp-metadata/saml-metadata.php', $samlDir);
  file_put_contents($metadataPHPFile, $phpCode);

  echo 'PHP file generated with IDP data.';

}
else {
  throw new Exception("No saml directory found", 1);
}
