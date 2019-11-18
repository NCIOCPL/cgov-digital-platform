<?php

namespace Drupal\cgov_cts;

/**
 * Interface for Zip Code Lookup Service.
 */
interface ZipCodeLookupServiceInterface {

  /**
   * Gets the geocoordinates for a zip code.
   *
   * @param string $zip_code
   *   A zip code.
   *
   * @return array
   *   A geocoodinates array.
   */
  public function getGeocoordinates($zip_code);

}
