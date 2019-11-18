<?php

namespace Drupal\cgov_cts;

use Drupal\Core\Site\Settings;

/**
 * Zip code lookup service that uses a json file for its "database".
 */
class FileBasedZipCodeLookupService implements ZipCodeLookupServiceInterface {

  /**
   * The location of the JSON "database".
   *
   * @var string
   */
  protected $fileLocation;

  /**
   * The zipcode database.
   *
   * @var array
   */
  protected $zipDatabase;

  /**
   * Creates a new instance of a FileBasedZipCodeLookupService.
   *
   * @param string $file_location
   *   The path to the json "database".
   */
  public function __construct($file_location) {
    $this->fileLocation = $file_location;
  }

  /**
   * Lazy loader for the zip code lookup map.
   *
   * So that it is not loaded for every request, but only for those
   * that need to access it.
   */
  private function initialize() {

    if (!$this->zipDatabase) {

      $file_contents = FALSE;
      try {
        // Load the database.
        $file_contents = file_get_contents($this->fileLocation);
      }
      catch (Exception $ex) {
        throw new \Exception("Cannot read zip code DB file at " . $this->fileLocation);
      }
      if ($file_contents === FALSE) {
        throw new \Exception("Cannot read zip code DB file at " . $this->fileLocation);
      }

      $this->zipDatabase = json_decode($file_contents, TRUE);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new \Exception("Cannot parse JSON zip code DB file at " . $this->fileLocation);
      }
    }
  }

  /**
   * Static factory method to create an instance of the file lookup service.
   *
   * @return \Drupal\cgov_cts\FileBasedZipCodeLookupService
   *   An instance of the lookup service.
   */
  public static function create() {
    $default_path = __DIR__ . '/../data/zip_codes.json';

    // Get the file location from settings, or just use the file from the
    // data directory.
    $file_location = Settings::get('cgov_cts_zip_lookup_path', $default_path);
    return new static(
      $file_location
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getGeocoordinates($zip_code) {

    $this->initialize();

    if (array_key_exists($zip_code, $this->zipDatabase)) {
      return $this->zipDatabase[$zip_code];
    }

    return NULL;
  }

}
