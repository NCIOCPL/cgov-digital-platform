<?php

namespace Drupal\cgov_cts\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\cgov_cts\ZipCodeLookupServiceInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * REST endpoint for looking up Geocoordinates for a US Zipcode.
 *
 * @RestResource(
 *   id = "zip_code_lookup_resource",
 *   label = @Translation("Zip Code Lookup Resource"),
 *   uri_paths = {
 *     "canonical" = "/cts_api/zip_code_lookup/{zip_code}"
 *   }
 * )
 */
class ZipCodeLookupResource extends ResourceBase {

  /**
   * The Zip code lookup service.
   *
   * @var \Drupal\cgov_cts\ZipCodeLookupServiceInterface
   */
  protected $lookupService;

  /**
   * Constructs a new object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\cgov_cts\ZipCodeLookupServiceInterface $zipcode_lookup
   *   Zipcode lookup service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    ZipCodeLookupServiceInterface $zipcode_lookup
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->lookupService = $zipcode_lookup;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('zip_code_lookup'),
      $container->get('cgov_cts.zip_code_lookup')
    );
  }

  /**
   * Responds to entity GET requests.
   *
   * @param string $zip_code
   *   The zip code to lookup.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The longitude and latitude for the zip code.
   */
  public function get($zip_code = NULL) {

    // Validate the zip code, if it is bad return a malformed request.
    if (!$this->isValidZipCode($zip_code)) {
      throw new BadRequestHttpException('You must supply a valid zip code.');
    }

    // Lookup Zip Code.
    $coordinates = $this->lookupService->getGeocoordinates($zip_code);

    // Zip Code was not found. Throw 404.
    if (!$coordinates) {
      throw new NotFoundHttpException('Zip code not found.');
    }

    // Return our coordinates.
    $response = new ResourceResponse($coordinates);
    // Cache it, but vary on the URL path and add cache tages so we
    // can clear it.
    $cacheinfo = new CacheableMetadata();
    $cacheinfo->addCacheTags([
      'zip_code_lookup_resource',
      'zip_code_lookup_resource:' . $zip_code,
    ]);
    $cacheinfo->addCacheContexts(['url.path']);
    $response->addCacheableDependency($cacheinfo);
    return $response;
  }

  /**
   * Helper function to validate a zipcode.
   *
   * @param string $zip_code
   *   The zip code to validate.
   *
   * @return bool
   *   TRUE if the zip code is a valid format, FALSE if not.
   */
  private function isValidZipCode($zip_code) {
    if (!$zip_code) {
      return FALSE;
    }

    if (!preg_match('/\d\d\d\d\d/', $zip_code)) {
      return FALSE;
    }

    return TRUE;
  }

}
