<?php

namespace Drupal\pdq_glossifier\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Database\Database;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function GuzzleHttp\json_encode;

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
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

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
      $container->get('current_user')
    );
  }

  /**
   * Response to POST requests.
   *
   * Store a fresh set of PDQ dictionary information.
   *
   * @param array $terms
   *   Contains a keyed array of PDQ glossary terms, serialized as JSON.
   *
   * @return \Drupal\rest\ResourceResponse
   *   Possibly empty sequence of node ID/language/error arrays
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $terms) {
    $now = date('Y-m-d H:i:s');
    $fields = ['terms' => json_encode($terms), 'updated' => $now];
    $conn = Database::getConnection();
    $conn->update('pdq_glossary')->fields($fields)->execute();
    $count = count($terms);
    $msg = "Stored $count glossary terms";
    $this->logger->notice($msg);
    return new ResourceResponse(['message' => "$msg at $now"], 200);
  }

}
