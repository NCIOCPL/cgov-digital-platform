<?php

/**
 * @file
 * Prints a drush-compatible uri, given a site, env and db_role.
 */

$site = $argv[1];
$env = $argv[2];
$db_role = $argv[3];

// Get the db connection.
require dirname(__FILE__) . '/../acquia/db_connect.php';
$connection = get_db($site, $env, $db_role);
// Get the site name from the database.
$result = execute_query($connection, 'SELECT value FROM acsf_variables WHERE name = "acsf_site_info"');
mysqli_close($connection);
if ($result === FALSE || !isset($result[0]['value'])) {
  error('Could not retrieve the site standard_domain from the database.');
}
else {
  $site_data = unserialize($result[0]['value']);
  $standard_domain = $site_data['standard_domain'];
  echo "$standard_domain";
}
