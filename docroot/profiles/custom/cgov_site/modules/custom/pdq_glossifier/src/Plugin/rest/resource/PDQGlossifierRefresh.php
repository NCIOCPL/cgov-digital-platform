<?php

namespace Drupal\pdq_glossifier\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\pdq_glossifier\PdqGlossifierServiceInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Implements PDQ RESTful API verbs.
 *
 * Invoked nightly by the CDR to install the latest information
 * on PDQ glossary terms.
 *
 * @RestResource(
 *   id = "pdq_glossary_refresh_api",
 *   label = @Translation("PDQ Glossifier Refresh API"),
 *   uri_paths = {
 *     "create" = "/pdq/api/glossifier/refresh"
 *   }
 * )
 */
class PDQGlossifierRefresh extends ResourceBase {


  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * A current user instance.
   *
   * @var \Drupal\pdq_glossifier\PdqGlossifierServiceInterface
   */
  protected $pdqGlossify;

  /**
   * Constructs a new PDQGlossifierRefresh object.
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
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   * @param \Drupal\pdq_glossifier\PdqGlossifierServiceInterface $pdq_glossify
   *   Pdq glossify service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    PdqGlossifierServiceInterface $pdq_glossify) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->pdqGlossify = $pdq_glossify;
    $this->currentUser = $current_user;
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
      $container->get('logger.factory')->get('pdq'),
      $container->get('current_user'),
      $container->get('pdq_glossifier.data')
    );
  }

  /**
   * Response to POST requests.
   *
   * Store a fresh set of PDQ dictionary information.
   *
   * @param array $data
   *   Contains a keyed array of PDQ glossary terms, serialized as JSON.
   *
   * @return \Drupal\rest\ResourceResponse
   *   Possibly empty sequence of node ID/language/error arrays
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $data) {
    // Drupal 9 requires this param to be named $data, let's make this more
    // readable.
    $terms = $data;
    $now = date('Y-m-d H:i:s');
    $count = $this->pdqGlossify->update($terms, $now);
    $msg = "Stored $count glossary terms";
    $this->logger->notice($msg);
    return new ResourceResponse(['message' => "$msg at $now"], 200);
  }

}
