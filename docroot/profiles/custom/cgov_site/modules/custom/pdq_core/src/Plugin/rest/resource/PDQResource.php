<?php

namespace Drupal\pdq_core\Plugin\rest\resource;

use Drupal\Core\Entity\EntityTypeManagerInterface;
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
   * Access to entity storage.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

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
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   Used (indirectly) to create entity queries.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
    $this->entityTypeManager = $entity_type_manager;
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
      $container->get('entity_type.manager')
    );
  }

  /**
   * Responds to GET requests.
   *
   * @param string $id
   *   The CDR ID of a PDQ Summary document (optionally prefixed by "CDR"),
   *   or 'list' to get a catalog of PDQ content in the Drupal CMS.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The response containing Drupal node ID(s) matching the CDR ID.
   *   Unless the site has become corrupted, there should only be
   *   one match.
   *   If instead of a CDR id the parameter passed is 'list' then
   *   the return value is a sequence of value sets for the PDQ
   *   nodes in the CMS.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
   *   Thrown when the summary node was not found.
   * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
   *   Thrown when no ID was provided.
   */
  public function get($id) {

    // Pass the work off to the catalog method if requested.
    if ($id === 'list') {
      return $this->catalog();
    }

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
    $storage = \Drupal::entityManager()->getStorage('node');
    foreach ($summaries as $summary) {
      try {
        list($nid, $language) = $summary;
        $revisions = $storage->getQuery()
          ->latestRevision()
          ->condition('nid', $nid, '=', $language)
          ->execute();
        foreach (array_keys($revisions) as $vid) {
          $revision = $storage->loadRevision($vid);
          $translation = $revision->getTranslation($language);
          $translation->moderation_state->value = 'published';
          $translation->save();
        }
      }
      catch (Exception $e) {
        $message = $e->getMessage() ?? 'unexpected failure';
        $errors[] = [$nid, $language, $message];
      }
    }
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
      $node->save();
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
    $storage = $this->entityTypeManager->getStorage('node');
    foreach (['en', 'es'] as $langcode) {
      $nids = $storage->getQuery()
        ->condition('field_pdq_cdr_id', $id, '=', $langcode)
        ->execute();
      if (!empty($nids)) {
        foreach ($nids as $nid) {
          $matches[] = [$nid, $langcode];
        }
      }
    }
    return $matches;
  }

  /**
   * Return a catalog of the PDQ content in the Drupal CMS.
   *
   * @return array
   *   Sequence of key-indexed arrays, each of which contains
   *   values for `cdr_id`, `nid`, `vid`, `created`, `updated`,
   *   `langcode`, and `type`.
   */
  private function catalog() {
    $join = 'd.nid = c.entity_id AND d.langcode = c.langcode';
    $query = \Drupal::database()->select('node__field_pdq_cdr_id', 'c');
    $query->join('node_field_data', 'd', $join);
    $results = $query->fields('c')
      ->fields('d', ['created', 'changed'])
      ->condition('c.deleted', 0)
      ->orderBy('c.field_pdq_cdr_id_value')
      ->execute();
    $content = [];
    foreach ($results as $result) {
      $content[] = [
        'cdr_id' => $result->field_pdq_cdr_id_value,
        'nid' => $result->entity_id,
        'vid' => $result->revision_id,
        'langcode' => $result->langcode,
        'type' => $result->bundle,
        'created' => date('Y-m-d H:i:s', $result->created),
        'changed' => date('Y-m-d H:i:s', $result->changed),
      ];
    }
    $response = new ResourceResponse($content);
    $response->addCacheableDependency(['#cache' => ['max-age' => 0]]);
    return $response;
  }

}
