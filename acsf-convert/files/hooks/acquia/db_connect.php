<?php

/**
 * @file
 * This file provides helper functions for running Acquia Cloud hooks.
 */

/**
 * Exit on error.
 *
 * @param string $message
 *   A message to write to sdderr.
 */
function error($message) {
  fwrite(STDERR, $message);
  exit(1);
}

/**
 * Initiates a connection to a specified database.
 *
 * In some cases, like cloud hooks, we might need to connect to the Drupal
 * database where there is no Drupal bootstrap. For example, we might need to
 * retrieve a drush compatible uri value before we can run a drush command on a
 * site.
 *
 * @param string $site
 *   The AH site name.
 * @param string $env
 *   The AH site environment.
 * @param string $db_role
 *   The 'role' of the AH database.
 *
 * @return mysqli
 *   mysqli object which represents the connection to a MySQL Server.
 */
function get_db($site, $env, $db_role) {
  $link = FALSE;
  $creds_file = "/var/www/site-php/{$site}.{$env}/creds.json";
  $creds = json_decode(file_get_contents($creds_file), TRUE);
  if (isset($creds['databases'][$db_role]['db_url_ha']) && is_array($creds['databases'][$db_role]['db_url_ha'])) {
    $db_uri = reset($creds['databases'][$db_role]['db_url_ha']);
    $db_info = url_to_connection_info($db_uri);
    $link = mysqli_connect($db_info['host'], $db_info['username'], $db_info['password'], $db_info['database'])
      or error('Could not connect: ' . mysqli_connect_error());
  }
  else {
    error('Could not retrieve data from creds.json.');
  }
  return $link;
}

/**
 * Converts a URL to a database connection info array.
 *
 * Array keys are gleaned from Database::convertDbUrlToConnectionInfo().
 *
 * @param string $url
 *   The URL.
 *
 * @return array
 *   The database connection info, or empty array if none found.
 */
function url_to_connection_info($url) {
  $info = parse_url($url);
  if (!isset($info['scheme'], $info['host'], $info['path'])) {
    return [];
  }
  $info += [
    'user' => '',
    'pass' => '',
  ];
  if ($info['path'][0] === '/') {
    $info['path'] = substr($info['path'], 1);
  }

  $database = [
    'driver' => $info['scheme'],
    'username' => $info['user'],
    'password' => $info['pass'],
    'host' => $info['host'],
    'database' => $info['path'],
  ];
  if (isset($info['port'])) {
    $database['port'] = $info['port'];
  }
  return $database;
}

/**
 * Helper function for mysqli query execute.
 *
 * @param mysqli $con
 *   A link identifier returned by mysqli_connect() or mysqli_init().
 * @param string $query
 *   An SQL query.
 *
 * @return array|bool
 *   If query was successful, retrieve all the rows into an array,
 *   otherwise return FALSE.
 */
function execute_query(mysqli $con, $query) {
  $result = mysqli_query($con, $query);
  // If query failed, return FALSE.
  if ($result === FALSE) {
    return FALSE;
  }
  $rows = [];
  while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = $row;
  }
  return $rows;
}
