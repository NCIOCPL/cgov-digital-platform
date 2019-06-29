<?php

namespace Drupal\cgov_redirect_manager;

use Drupal\Core\Database\Connection;
use Drupal\redirect\Entity\Redirect;
use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Url;
use Drupal\Core\Language\LanguageManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Class CGovImporterService.
 *
 * @package Drupal\cgov_redirect_manager
 */
class CGovImporterService {

  public static $messages = [];

  public static $options = [];

  /**
   * The database connection service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * The language manager to get all languages for to get all aliases.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * A logger instance.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Constructs a Google Analytics Counter object.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   A database connection.
   *   The path matcher.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language
   *   The language manager.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   */
  public function __construct(
    Connection $connection,
    LanguageManagerInterface $language,
    LoggerInterface $logger
  ) {
    $this->connection = $connection;
    $this->languageManager = $language;
    $this->logger = $logger;
  }

  /**
   * Main method: execute parsing and saving of redirects.
   *
   * @param mixed $file
   *   Either a Drupal file object (ui) or a path to a file (drush).
   * @param str[] $options
   *   User-supplied default flags.
   */
  public static function import($file, array $options) {
    // Parse the CSV file into a readable array.
    $data = self::read($file, $options);
    self::$options = $options;
    // Perform Drupal-specific validation logic on each row.
    $data = array_filter($data, ['self', 'preSave']);
    $count = 0;

    if ($options['suppress_messages'] != 1) {
      // Messaging/logging is separated out in case we want to suppress these.
      foreach (self::$messages['warning'] as $warning) {
        drupal_set_message($warning, 'warning');
      }
    }

    if (empty($data)) {
      drupal_set_message(t('The uploaded file contains no rows with compatible redirect data. No redirects have imported. Compare your file to <a href=":sample">this sample data.</a>', [':sample' => '/' . drupal_get_path('module', 'path_redirect_import') . '/redirect-example-file.csv']), 'warning');
    }
    else {
      if (PHP_SAPI == 'cli' && function_exists('drush_main')) {
        foreach ($data as $redirect_array) {
          self::save($redirect_array, $options['override'], []);
          $count++;
        }
      }
      else {
        // This case should never happen...
      }
    }
    drupal_set_message(t('Successfully imported "@count" items.', ['@count' => $count]));
  }

  /**
   * Batch API callback.
   */
  public static function finish($success, $results, $operations) {
    if ($success) {
      $message = t('Redirects processed.');
    }
    else {
      $message = t('Finished with an error.');
    }
    drupal_set_message($message, 'status');
  }

  /**
   * Reads a line from the csv and handles language and type.
   *
   * The input file will only be Source, Destination. A Redirect
   * is actually Source, Destination, Status, Language. Because
   * Drupal, Spanish URLs should not have /espanol in the url
   * AND the language needs to be Spanish. So we will find those
   * sources and destinations and manipulate appropriately.
   *
   * NOTE: In a really perfect world, this would use the language
   * negotiation system to figure out the URL/Language. For now we
   * shall make assumptions.
   *
   * @param resource $file
   *   The file handle to read from.
   * @param string $delimiter
   *   The delimiter to use to separate the line.
   * @param string $status
   *   The default status code.
   * @param string $lang
   *   The default language if the url does not begin with /.
   *
   * @return mixed
   *   Returns an indexed array containing the fields read. See fgetcsv.
   */
  public static function readExpandLine($file, $delimiter, $status, $lang) {
    $line = fgetcsv($file, 0, $delimiter);

    // Either EOF, Error or Empty Line.
    if (!$line || !is_array($line)) {
      return $line;
    }

    // Missing either source or destination.
    if (empty($line[0]) || empty($line[1])) {
      return $line;
    }

    // For some reason this row has the appropriate number of elements.
    // Most likely this will be due to someone combining two rows, but
    // let's hope for the best...
    if (count($line) == 4) {
      return $line;
    }

    $source = trim($line[0]);
    $dest = trim($line[1]);

    if (preg_match("/^\/espanol(\/.*)$/i", $source, $matches)) {
      return [
        $matches[1],
        $dest,
        $status,
        'es',
      ];
    }
    else {
      return [
        $source,
        $dest,
        $status,
        $lang,
      ];
    }
  }

  /**
   * Convert CSV file into readable PHP array.
   *
   * @param mixed $file
   *   A Drupal file object.
   * @param str[] $options
   *   User-passed defaults.
   *
   * @return str[]
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   */
  protected static function read($file, array $options = []) {

    $filepath = \Drupal::service('file_system')->realpath($file->getFileUri());

    if (!$f = fopen($filepath, 'r')) {
      return ['success' => FALSE, 'message' => [t('Unable to read the file')]];
    }
    $options += [
      'delimiter' => ',',
      'no_headers' => TRUE,
      'override' => TRUE,
      'status_code' => '301',
      'language' => 'en',
    ];

    $line_no = 0;
    $data = [];
    while ($line = self::readExpandLine($f, $options['delimiter'], $options['status_code'], $options['language'])) {
      $line_no++;
      if ($line_no == 1 && !$options['no_headers']) {
        drupal_set_message(t('Skipping the header row.'));
        continue;
      }

      if (!is_array($line)) {
        self::$messages['warning'][] = t('Line @line_no is invalid; bypassed.', ['@line_no' => $line_no]);
        continue;
      }
      if (empty($line[0]) || empty($line[1])) {
        self::$messages['warning'][] = t('Line @line_no contains invalid data; bypassed.', ['@line_no' => $line_no]);
        continue;
      }
      if (empty($line[2])) {
        $line[2] = $options['status_code'];
      }
      else {
        $redirect_options = redirect_status_code_options();
        if (!isset($redirect_options[$line[2]])) {
          self::$messages['warning'][] = t('Line @line_no contains invalid status code; bypassed.', ['@line_no' => $line_no]);
          continue;
        }
      }

      if (empty($line[3])) {
        $line[3] = $options['language'];
      }
      elseif (!self::isValidLanguage($line[3])) {
        self::$messages['warning'][] = t('Line @line_no contains an invalid language code; bypassed.', ['@line_no' => $line_no]);
        continue;
      }

      // Build a row of data.
      $data[$line_no] = [
        'source' => self::stripLeadingSlash($line[0]),
        'redirect' => isset($line[1]) ? self::stripLeadingSlash($line[1]) : NULL,
        'status_code' => $line[2],
        'language' => isset($line[3]) ? $line[3] : $options['language'],
      ];

    }
    fclose($f);
    return $data;
  }

  /**
   * Check for problematic data and remove or clean up.
   *
   * @param str[] $row
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   *
   * @return bool
   *   A TRUE/FALSE value to be used by array_filter.
   */
  public static function preSave(array $row) {
    // Disallow redirects from <front>.
    if ($row['source'] == '<front>') {
      self::$messages['warning'][] = t('You cannot create a redirect from the front page. Bypassing "@source".', ['@source' => $row['source']]);
      return FALSE;
    }

    // Disallow redirects from anchor fragments.
    if (strpos($row['source'], '#') !== FALSE) {
      self::$messages['warning'][] = t('Redirects from anchor fragments (i.e., with "#) are not allowed. Bypassing "@source".', ['@source' => $row['source']]);
      return FALSE;
    }

    // Disallow redirects to nonexistent internal paths.
    if (self::internalPathMissing($row['redirect']) && self::$options['allow_nonexistent'] == 0) {
      self::$messages['warning'][] = t('The destination path "@redirect" does not exist on the site. Redirect from "@source" bypassed.', [
        '@redirect' => $row['redirect'],
        '@source' => $row['source'],
      ]);
      return FALSE;
    }

    // Disallow infinite redirects.
    if (self::sourceIsDestination($row)) {
      self::$messages['warning'][] = t('You are attempting to redirect "@redirect" to itself. Bypassed, as this will result in an infinite loop.', ['@redirect' => $row['redirect']]);
      return FALSE;
    }

    return TRUE;
  }

  /**
   * Save an individual redirect entity, if no redirect already exists.
   *
   * @param str[] $redirect_array
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   * @param bool $override
   *   A 1 indicates that existing redirects should be updated.
   */
  public static function save(array $redirect_array, $override) {
    if ($redirects = self::redirectExists($redirect_array)) {
      if ($override == 1) {
        $redirect = reset($redirects);
      }
      else {
        return;
      }
    }
    else {
      $parsed_url = UrlHelper::parse(trim($redirect_array['source']));
      $path = isset($parsed_url['path']) ? $parsed_url['path'] : NULL;
      $query = isset($parsed_url['query']) ? $parsed_url['query'] : NULL;

      /** @var \Drupal\redirect\Entity\Redirect $redirect */
      $redirectEntityManager = \Drupal::service('entity.manager')
        ->getStorage('redirect');
      $redirect = $redirectEntityManager->create();
      $redirect->setSource($path, $query);
    }
    // Currently, the Redirect module's setRedirect function assumes
    // all paths are internal. If external, we will use redirect_redirect->set.
    if (parse_url($redirect_array['redirect'], PHP_URL_SCHEME)) {
      $redirect->redirect_redirect->set(0, ['uri' => $redirect_array['redirect']]);
    }
    else {
      $redirect->setRedirect($redirect_array['redirect']);
    }
    $redirect->setStatusCode($redirect_array['status_code']);
    $redirect->setLanguage($redirect_array['language']);
    $redirect->save();

  }

  /**
   * Truncates redirect table.
   */
  public function deleteAll() {
    $this->connection->truncate('redirect', [])->execute();
  }

  /**
   * Remove leading slash, if present.
   *
   * @param string $path
   *   A user-supplied URL path.
   *
   * @return string
   *   A URL without the leading slash.
   */
  protected static function stripLeadingSlash($path) {
    if (strpos($path, '/') === 0) {
      return substr($path, 1);
    }
    return $path;
  }

  /**
   * Add leading slash, if not present.
   *
   * @param string $path
   *   A user-supplied URL path.
   *
   * @return string
   *   A URL with the leading slash.
   */
  protected static function addLeadingSlash($path) {
    if (strpos($path, '/') !== 0) {
      return '/' . $path;
    }
    return $path;
  }

  /**
   * Check if the path is internal, and if so, if it is missing.
   *
   * @param string $destination
   *   A user-supplied URL path.
   */
  protected static function internalPathMissing($destination) {
    if ($destination == '<front>') {
      return FALSE;
    }
    $parsed = parse_url($destination);
    if (!isset($parsed['scheme'])) {
      // Check for aliases *including* named anchors/query strings.
      $alias = self::addLeadingSlash($destination);
      $normal_path = \Drupal::service('path.alias_manager')
        ->getPathByAlias($alias);
      if ($alias != $normal_path) {
        return FALSE;
      }
      // Check for aliases *excluding* named anchors/query strings.
      if (isset($parsed['path'])) {
        $alias = self::addLeadingSlash($parsed['path']);
        $normal_path = \Drupal::service('path.alias_manager')
          ->getPathByAlias($alias);
        if ($alias != $normal_path) {
          return FALSE;
        }
      }
    }
    return FALSE;
  }

  /**
   * Check for infinite loops.
   *
   * @param str[] $row
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   */
  protected static function sourceIsDestination(array $row) {
    // Check if the user-supplied source & redirect are identical.
    if ($row['source'] == $row['redirect']) {
      return TRUE;
    }
    // Now check if the the resulting Drupal location would be identical.
    try {
      $parsed = parse_url($row['redirect']);
      if (!isset($parsed['scheme'])) {
        // If the destination is an internal link, prepare it.
        $row['redirect'] = 'internal:' . self::addLeadingSlash($row['redirect']);
      }
      $source_url = Url::fromUri('internal:/' . $row['source']);
      $redirect_url = Url::fromUri($row['redirect']);
      // It is relevant to do this comparison only in case the source path has
      // a valid route. Otherwise the validation will fail on the redirect path
      // being an invalid route.
      if ($source_url->toString() == $redirect_url->toString()) {
        return TRUE;
      }
      // We still need to check external links, if the user has entered
      // /node/3 => http://example.com/node/3.
      $host = \Drupal::request()->getSchemeAndHttpHost();
      if ($host . $source_url->toString() == $redirect_url->toString()) {
        return TRUE;
      }
    }
    catch (\InvalidArgumentException $e) {
      // Do nothing, we want to only compare the resulting URLs.
    }
  }

  /**
   * Check if a redirect already exists for this source path.
   *
   * @param str[] $row
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   *
   * @return mixed
   *   FALSE if the redirect does not exist, array of redirect objects
   *    if it does.
   */
  protected static function redirectExists(array $row) {
    // @todo memoize the query.
    $parsed_url = UrlHelper::parse(trim($row['source']));
    $path = isset($parsed_url['path']) ? $parsed_url['path'] : NULL;
    $query = isset($parsed_url['query']) ? $parsed_url['query'] : NULL;
    $hash = Redirect::generateHash($path, $query, $row['language']);

    // Search for duplicate.
    $redirects = \Drupal::entityManager()
      ->getStorage('redirect')
      ->loadByProperties(['hash' => $hash]);
    if (!empty($redirects)) {
      return $redirects;
    }
    return FALSE;
  }

  /**
   * Check if the string is a valid langcode.
   *
   * @param string $langcode
   *   A string to check.
   *
   * @return bool
   *   Whether the langcode is valid.
   */
  protected static function isValidLanguage($langcode) {
    if (\Drupal::moduleHandler()->moduleExists('language')) {
      if (!empty($langcode) && in_array($langcode, self::validLanguages())) {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Retrieve languages in the system.
   *
   * @return str[]
   *   A list of langcodes known to the system.
   */
  protected static function validLanguages() {
    $languages = \Drupal::languageManager()->getLanguages();
    $languages = array_keys($languages);

    $defaultLockedLanguages = \Drupal::languageManager()
      ->getDefaultLockedLanguages();
    $defaultLockedLanguages = array_keys($defaultLockedLanguages);

    return array_merge($languages, $defaultLockedLanguages);
  }

}
