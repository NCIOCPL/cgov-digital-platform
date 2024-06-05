<?php

namespace Drupal\cgov_redirect_manager;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ExtensionPathResolver;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\redirect\Entity\Redirect;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Service that imports redirections in bulk.
 *
 * @package Drupal\cgov_redirect_manager
 */
class CgovImporterService {

  use StringTranslationTrait;

  /**
   * The current request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The language manager to get all languages for to get all aliases.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Alias manager.
   *
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * Drupal messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * File System service.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected $fileSystem;

  /**
   * Extension path resolver.
   *
   * @var \Drupal\Core\Extension\ExtensionPathResolver
   */
  protected $extensionPathResolver;

  /**
   * A logger instance.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Constructs a Google Analytics Counter object.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language
   *   The language manager.
   * @param \Drupal\path_alias\AliasManagerInterface $alias_manager
   *   The alias manager interface.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The Drupal messenger service.
   * @param \Drupal\Core\File\FileSystemInterface $file_system
   *   The file system service.
   * @param \Drupal\Core\Extension\ExtensionPathResolver $extension_path_resolver
   *   The extension path resolver.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   */
  public function __construct(
    RequestStack $request_stack,
    EntityTypeManagerInterface $entity_type_manager,
    LanguageManagerInterface $language,
    AliasManagerInterface $alias_manager,
    MessengerInterface $messenger,
    FileSystemInterface $file_system,
    ExtensionPathResolver $extension_path_resolver,
    LoggerInterface $logger,
  ) {
    $this->requestStack = $request_stack;
    $this->entityTypeManager = $entity_type_manager;
    $this->languageManager = $language;
    $this->aliasManager = $alias_manager;
    $this->messenger = $messenger;
    $this->fileSystem = $file_system;
    $this->extensionPathResolver = $extension_path_resolver;
    $this->logger = $logger;
  }

  /**
   * Main method: execute parsing and saving of redirects.
   *
   * @param mixed $file
   *   Either a Drupal file object (ui) or a path to a file (drush).
   * @param bool $suppress_messages
   *   Should this supress logging messages?
   * @param bool $allow_nonexistent
   *   Allow links to non-existent urls.
   * @param string $delimiter
   *   Delimiter to break up columns.
   * @param bool $has_header
   *   Does the file have a header?
   * @param bool $overwrite
   *   Should existing redirects be overridden?
   * @param string $status_code
   *   The status code to set for all redirects, '301' or '302'.
   * @param string $language
   *   The default language for the redirects.
   */
  public function import(
    $file,
    $suppress_messages = TRUE,
    $allow_nonexistent = TRUE,
    $delimiter = ',',
    $has_header = FALSE,
    $overwrite = TRUE,
    $status_code = '301',
    $language = 'en',
  ) {

    // Holder of error messages.
    $messages = [];

    // Parse the CSV file into a readable array.
    [$data, $readMessages] = $this->read(
      $file,
      $delimiter,
      $has_header,
      $status_code,
      $language
    );
    $messages = array_merge($messages, $readMessages);

    // Perform Drupal-specific validation logic on each row.
    $data = array_filter($data, function ($row) use ($allow_nonexistent, $messages) {
      [$status, $message] = $this->validateRow($row, $allow_nonexistent);
      if (!$status) {
        $messages[] = $message;
      }
      return $status;
    });
    $count = 0;

    if (!$suppress_messages) {
      // Messaging/logging is separated out in case we want to suppress these.
      foreach ($messages as $warning) {
        $this->messenger->addWarning($warning);
      }
    }

    if (empty($data)) {
      $this->messenger->addWarning(
        $this->t('The uploaded file contains no rows with compatible redirect data. No redirects have imported. Compare your file to <a href=":sample">this sample data.</a>',
        [':sample' => '/' . $this->extensionPathResolver->getPath('module', 'path_redirect_import') . '/redirect-example-file.csv']
      ));
    }
    else {
      if (
        PHP_SAPI === 'cli' && function_exists('drush_main')
      ) {
        foreach ($data as $redirect_array) {
          $this->save($redirect_array, $overwrite);
          $count++;
        }
        $this->messenger->addStatus($this->t('Successfully imported "@count" items.', ['@count' => $count]));
      }
      else {
        // This should never happen, but if it does, let's log a warning.
        $this->logger->warning('Redirect importing has run outside of drush');
      }
    }
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
  private function readExpandLine($file, $delimiter, $status, $lang) {
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
   * @param string $delimiter
   *   Delimiter to break up columns.
   * @param bool $has_header
   *   Does the file have a header?
   * @param string $status_code
   *   The status code for the redirect, '301' or '302'.
   * @param string $language
   *   The language for the redirects.
   *   Note: urls starting with /espanol will be 'es'.
   *
   * @return array
   *   Returns a two element array, the first being a
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language],
   *   The second being an array of messages.
   */
  protected function read(
    $file,
    $delimiter,
    $has_header,
    $status_code,
    $language,
  ) {
    $messages = [];
    $filepath = $this->fileSystem->realpath($file->getFileUri());

    if (!$f = fopen($filepath, 'r')) {
      return [
        [],
        [$this->t('Unable to read the file')],
      ];
    }

    $line_no = 0;
    $data = [];

    // @todo The code below is a little silly and needs to be reworked.
    // readExpandLine is much more opinionated than the code below suggests. For
    // example, the status_code will always be there, it is in the return,
    // UNLESS there is some data issue, in which the line is just returned.
    // readExpandLine should throw an exception or something, or return a
    // scalar with and error and the code below should work with that and
    // not need to check if the 3rd element is empty to set the status.
    while ($line = $this->readExpandLine($f, $delimiter, $status_code, $language)) {
      $line_no++;
      if ($line_no == 1 && $has_header) {
        continue;
      }

      if (!is_array($line)) {
        $messages[] = $this->t('Line @line_no is invalid; bypassed.', ['@line_no' => $line_no]);
        continue;
      }
      if (empty($line[0]) || empty($line[1])) {
        $messages[] = $this->t('Line @line_no contains invalid data; bypassed.', ['@line_no' => $line_no]);
        continue;
      }
      if (empty($line[2])) {
        $line[2] = $status_code;
      }
      else {
        $redirect_options = redirect_status_code_options();
        if (!isset($redirect_options[$line[2]])) {
          $messages[] = $this->t('Line @line_no contains invalid status code; bypassed.', ['@line_no' => $line_no]);
          continue;
        }
      }

      if (empty($line[3])) {
        $line[3] = $language;
      }
      elseif (!$this->isValidLanguage($line[3])) {
        $messages[] = $this->t('Line @line_no contains an invalid language code; bypassed.', ['@line_no' => $line_no]);
        continue;
      }

      // Build a row of data.
      $data[$line_no] = [
        'source' => $this->stripLeadingSlash($line[0]),
        'redirect' => isset($line[1]) ? $this->stripLeadingSlash($line[1]) : NULL,
        'status_code' => $line[2],
        'language' => $line[3] ?? $language,
      ];

    }
    fclose($f);
    return [$data, $messages];
  }

  /**
   * Check for problematic data and remove or clean up.
   *
   * @param array $row
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   * @param bool $allow_nonexistent
   *   Allow redirects to non-existent URLs.
   *
   * @return array
   *   An array with 2 elements. The first being the status, then second
   *   being any error messages.
   */
  private function validateRow(array $row, $allow_nonexistent) {
    // Disallow redirects from <front>.
    if ($row['source'] == '<front>') {
      return [
        FALSE,
        $this->t('You cannot create a redirect from the front page. Bypassing "@source".', ['@source' => $row['source']]),
      ];
    }

    // Disallow redirects from anchor fragments.
    if (strpos($row['source'], '#') !== FALSE) {
      return [
        FALSE,
        $this->t('Redirects from anchor fragments (i.e., with "#) are not allowed. Bypassing "@source".', ['@source' => $row['source']]),
      ];
    }

    // Disallow redirects to nonexistent internal paths.
    if ($this->internalPathMissing($row['redirect']) && $allow_nonexistent) {
      return [
        FALSE,
        $this->t('The destination path "@redirect" does not exist on the site. Redirect from "@source" bypassed.', [
          '@redirect' => $row['redirect'],
          '@source' => $row['source'],
        ]),
      ];
    }

    // Disallow infinite redirects.
    if ($this->sourceIsDestination($row)) {
      return [
        FALSE,
        $this->t('You are attempting to redirect "@redirect" to itself. Bypassed, as this will result in an infinite loop.', ['@redirect' => $row['redirect']]),
      ];
    }

    return [TRUE, ''];
  }

  /**
   * Save an individual redirect entity, if no redirect already exists.
   *
   * @param array $redirect_array
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   * @param bool $overwrite
   *   TRUE indicates that existing redirects should be overwritten.
   */
  private function save(array $redirect_array, $overwrite) {
    if ($redirects = $this->redirectExists($redirect_array)) {
      if ($overwrite) {
        $redirect = reset($redirects);
      }
      else {
        return;
      }
    }
    else {
      $parsed_url = UrlHelper::parse(trim($redirect_array['source']));
      $path = $parsed_url['path'] ?? NULL;
      $query = $parsed_url['query'] ?? NULL;

      $redirectStorage = $this->entityTypeManager
        ->getStorage('redirect');
      $redirect = $redirectStorage->create();
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
   * Remove leading slash, if present.
   *
   * @param string $path
   *   A user-supplied URL path.
   *
   * @return string
   *   A URL without the leading slash.
   */
  protected function stripLeadingSlash($path) {
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
  protected function addLeadingSlash($path) {
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
  protected function internalPathMissing($destination) {
    if ($destination == '<front>') {
      return FALSE;
    }
    $parsed = parse_url($destination);
    if (!isset($parsed['scheme'])) {
      // Check for aliases *including* named anchors/query strings.
      $alias = $this->addLeadingSlash($destination);
      $normal_path = $this->aliasManager
        ->getPathByAlias($alias);
      if ($alias != $normal_path) {
        return FALSE;
      }
      // Check for aliases *excluding* named anchors/query strings.
      if (isset($parsed['path'])) {
        $alias = $this->addLeadingSlash($parsed['path']);
        $normal_path = $this->aliasManager
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
   * @param array $row
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   */
  protected function sourceIsDestination(array $row) {
    // Check if the user-supplied source & redirect are identical.
    if ($row['source'] == $row['redirect']) {
      return TRUE;
    }
    // Now check if the the resulting Drupal location would be identical.
    try {
      $parsed = parse_url($row['redirect']);
      if (!isset($parsed['scheme'])) {
        // If the destination is an internal link, prepare it.
        $row['redirect'] = 'internal:' . $this->addLeadingSlash($row['redirect']);
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
      $host = $this->requestStack
        ->getCurrentRequest()
        ->getSchemeAndHttpHost();
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
   * @param array $row
   *   Keyed array of redirects, in the format
   *    [source, redirect, status_code, language].
   *
   * @return mixed
   *   FALSE if the redirect does not exist, array of redirect objects
   *    if it does.
   */
  protected function redirectExists(array $row) {
    // @todo memoize the query.
    $parsed_url = UrlHelper::parse(trim($row['source']));
    $path = $parsed_url['path'] ?? NULL;
    $query = $parsed_url['query'] ?? NULL;
    $hash = Redirect::generateHash($path, $query, $row['language']);

    // Search for duplicate.
    $redirects = $this->entityTypeManager
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
  protected function isValidLanguage($langcode) {
    if (!empty($langcode) && in_array($langcode, $this->validLanguages())) {
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Retrieve languages in the system.
   *
   * @return string[]
   *   A list of langcodes known to the system.
   */
  protected function validLanguages() {
    $languages = array_map(
      function ($lang) {
        return $lang->getId();
      },
      $this->languageManager->getLanguages()
    );

    $defaultLockedLanguages = array_map(
      function ($lang) {
        return $lang->getId();
      },
      $this->languageManager->getDefaultLockedLanguages()
    );

    return array_merge($languages, $defaultLockedLanguages);
  }

}
