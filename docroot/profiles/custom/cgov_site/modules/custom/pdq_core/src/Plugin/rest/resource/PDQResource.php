<?php

namespace Drupal\pdq_core\Plugin\rest\resource;

use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\rest\ModifiedResourceResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Implements PDQ RESTful API verbs.
 *
 * @RestResource(
 *   id = "pdq_api",
 *   label = @Translation("PDQ API"),
 *   uri_paths = {
 *     "canonical" = "/pdq/api/{id}",
 *     "create" = "/pdq/api"
 *   }
 * )
 */
class PDQResource extends ResourceBase {


  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new PdqResource object.
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
   * Responds to GET requests.
   *
   * @param string $id
   *   The CDR ID of a PDQ Summary document (optionally prefixed by "CDR").
   *
   * @return \Drupal\rest\ResourceResponse
   *   The response containing Drupal node ID(s) matching the CDR ID.
   *   Unless the site has become corrupted, there should only be
   *   one match.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
   *   Thrown when the summary node was not found.
   * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
   *   Thrown when no ID was provided.
   */
  public function get($id) {

    // Make sure the client gave us something to look for.
    if (!$id) {
      throw new BadRequestHttpException(t('No ID was provided'));
    }
    $matches = $this->lookupCdrId($id);
    if (count($matches) === 0) {
      $msg = t('CDR ID @id not found', ['@id' => $id]);
      throw new NotFoundHttpException($msg);
    }
    $response = new ResourceResponse($matches);
    $response->addCacheableDependency(['#cache' => ['max-age' => 0]]);
    return $response;
  }

  /**
   * Response to POST requests.
   *
   * Flip a set of content versions from draft to published.
   *
   * Garbage collection is not aggressive enough, so the client
   * for this end point must batch the entities to be processed
   * in small enough groups that memory is not exhausted.
   * Attempting to process all of the summaries in a single
   * call is almost certain to fail with a memory error.
   * Groups of 25 at a time should be safe.
   *
   * @param array $summaries
   *   Sequence of node ID + language code pairs.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   Possibly empty sequence of node ID/language/error arrays
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $summaries) {

    $errors = [];
    foreach ($summaries as $summary) {
      try {
        list($nid, $language) = $summary;
        $node = Node::load($nid);
        $entity = $node->getTranslation($language);
        $entity->moderation_state = 'published';
        $entity->save();
        unset($entity);
        unset($node);
      }
      catch (Exception $e) {
        $message = $e->getMessage() ?? 'unexpected failure';
        $errors[] = [$nid, $language, $message];
      }
    }
    $nid = $summary['nid'];
    return new ModifiedResourceResponse(['errors' => $errors], 200);
  }

  /**
   * Responds to DELETE requests.
   *
   * @param string $id
   *   The CDR ID of a PDQ Summary document (optionally prefixed by
   *   "CDR").
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function delete($id) {

    // @todo: avoid deleting target of links from other content.
    // Make sure the client gave us something to look for.
    if (!$id) {
      throw new BadRequestHttpException(t('No ID was provided'));
    }

    // Make sure the CDR ID matches exactly one entity.
    $matches = $this->lookupCdrId($id);
    if (count($matches) === 0) {
      $msg = t('CDR ID @id not found', ['@id' => $id]);
      throw new NotFoundHttpException($msg);
    }
    if (count($matches) > 1) {
      $msg = t('Ambiguous CDR ID @id', ['@id' => $id]);
      throw new BadRequestHttpException($msg);
    }
    list($nid, $langcode) = $matches[0];
    $node = Node::load($nid);

    // Apply deletion logic based on language.
    if ($langcode === 'es') {
      $node->removeTranslation('es');
    }
    else {
      if ($node->hasTranslation('es')) {
        throw new BadRequestHttpException(t('Spanish translation exists'));
      }
      $node->delete();
    }
    return new ModifiedResourceResponse(NULL, 204);
  }

  /**
   * Find the Drupal entities which store a given PDQ document.
   *
   * @param string $id
   *   The CDR ID of a PDQ Summary document (optionally prefixed by
   *   "CDR").
   *
   * @return array
   *   Sequence of value pairs, each of which has a node ID and a
   *   language code.
   */
  private function lookupCdrId($id) {
    if (substr($id, 0, 3) === 'CDR') {
      $id = substr($id, 3);
    }
    $matches = [];
    $query = \Drupal::database()->select('node__field_pdq_cdr_id', 'c');
    $query->fields('c', ['entity_id', 'langcode']);
    $query->condition('c.bundle', 'pdq_cancer_information_summary');
    $query->condition('c.field_pdq_cdr_id_value', $id);
    $query->condition('c.deleted', 0);
    $results = $query->execute();
    foreach ($results as $result) {
      $matches[] = [$result->entity_id, $result->langcode];
    }
    return $matches;
  }

}
