<?php

namespace Drupal\pdq_core\Plugin\rest\resource;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\Entity\Node;
use Drupal\pdq_core\RevisionPruner;
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
   * Service for dropping older node revisions.
   *
   * @var \Drupal\pdq_core\RevisionPruner
   */
  protected $pruner;

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
   *   Used to find and load node revisions.
   * @param \Drupal\pdq_core\RevisionPruner $pruner
   *   Eliminates unwanted node older revisions.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    EntityTypeManagerInterface $entity_type_manager,
    RevisionPruner $pruner) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
    $this->entityTypeManager = $entity_type_manager;
    $this->pruner = $pruner;
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
      $container->get('entity_type.manager'),
      $container->get('pdq_core.revision_pruner')
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
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function get(string $id): ResourceResponse {

    // Pass the work off to the catalog method if requested.
    if ($id === 'list') {
      return $this->catalog();
    }

    // Make sure the client gave us something to look for.
    if (!$id) {
      throw new BadRequestHttpException('No ID was provided');
    }
    $matches = $this->lookupCdrId($id);
    if (count($matches) === 0) {
      $msg = $this->t('CDR ID @id not found', ['@id' => $id]);
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
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function post(array $summaries): ModifiedResourceResponse {

    $errors = [];
    $success_count = 0;
    /** @var \Drupal\Core\Entity\ContentEntityStorageBase $storage */
    $storage = $this->entityTypeManager->getStorage('node');
    foreach ($summaries as $summary) {
      try {
        [$nid, $lang] = $summary;
        $vid = $storage->getLatestRevisionId($nid);
        if (empty($vid)) {
          $errors[] = [$nid, $lang, 'not found'];
        }
        else {
          // There is a long-standing bug in Drupal core, which fails to
          // set the correct revision creation time and user for new
          // revisions, so we do it here.
          // See https://github.com/NCIOCPL/cgov-digital-platform/issues/2630.
          $revision = $storage->loadRevision($vid);
          $translation = $revision->getTranslation($lang);
          $translation->moderation_state->value = 'published';
          $translation->setRevisionTranslationAffected(TRUE);
          $translation->setRevisionCreationTime(\time());
          $translation->setRevisionUserId($this->currentUser->id());
          $translation->save();
          $success_count++;
          $args = ['%vid' => $vid, '%nid' => $nid, '%lang' => $lang];
          $msg = 'marked %lang revision %vid of node %nid published';
          $this->logger->debug($msg, $args);
        }
      }
      catch (Exception $e) {
        $message = $e->getMessage() ?? 'unexpected failure';
        $errors[] = [$nid, $lang, $message];
      }
    }
    $args = ['%count' => $success_count];
    $this->logger->notice('%count PDQ summaries set to published', $args);
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
   * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function delete(string $id): ModifiedResourceResponse {

    // @todo: avoid deleting target of links from other content.
    // Make sure the client gave us something to look for.
    if (!$id) {
      throw new BadRequestHttpException('No ID was provided');
    }

    // Make sure the CDR ID matches exactly one entity.
    // 2019-08-10 (#2318) remove that restriction for publish preview.
    // 2019-05-03: Treat request to remove a PDQ item which is not present
    // as a success, to avoid publishing job failures caused by shifting
    // contents of rebuilt Drupal servers on the lower tiers (#1610).
    $matches = $this->lookupCdrId($id);
    if (count($matches) === 0) {
      $this->logger->notice('DELETE: CDR ID @id not found', ['@id' => $id]);
      return new ModifiedResourceResponse(NULL, 204);
    }
    if ($id > 0 && count($matches) > 1) {
      $msg = $this->t('Ambiguous CDR ID @id', ['@id' => $id]);
      throw new BadRequestHttpException($msg);
    }
    foreach ($matches as $match) {
      [$nid, $langcode] = $match;
      $node = Node::load($nid);

      // Apply deletion logic based on language.
      if ($langcode === 'es' && $id > 0) {
        $node->removeTranslation('es');
        $node->save();
        $args = ['%cdrid' => $id, '%nid' => $node->id()];
        $msg = 'Spanish translation for node %nid dropped for CDR ID %cdrid';
        $this->logger->notice($msg, $args);
      }
      else {
        if ($node->hasTranslation('es') && $id > 0) {
          throw new BadRequestHttpException('Spanish translation exists');
        }
        $node->delete();
        $args = ['%cdrid' => $id, '%nid' => $node->id()];
        $this->logger->notice('node %nid removed for CDR ID %cdrid', $args);
      }
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
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  private function lookupCdrId($id): array {
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
   * @return \Drupal\Rest\ResourceResponse
   *   Sequence of key-indexed arrays, each of which contains
   *   values for `cdr_id`, `nid`, `vid`, `created`, `updated`,
   *   `langcode`, and `type`, wrapped in a ResourceResponse.
   */
  private function catalog(): ResourceResponse {
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

  /**
   * Response to PATCH requests.
   *
   * Prune older revisions, leaving only the most recent published
   * revisions in place for the specified nodes.
   *
   * @param string $command
   *   Must be "prune"; this is needed because REST routing expects a token
   *   at the end of the URI identifying the content item to be patched, but
   *   we're doing the processing of batches of nodes, so the token is just
   *   treated as a placeholder.
   * @param array $request
   *   Sequence of node IDs and optional number of published revisions to keep
   *   for each language of the nodes to be pruned. Examples:
   *     `['nodes' => [960, 982, 997], 'keep' => 2]`
   *     `['nodes' => [960, 982, 997]]`.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   Array in the form `[[node-id, [revision-id, ...], ...]` identifying
   *   the revisions which have been dropped for each node.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
   */
  public function patch(string $command, array $request): ModifiedResourceResponse {

    if ($command !== 'prune') {
      throw new BadRequestHttpException('Unsupported patch command.');
    }
    if (empty($request['keep'])) {
      $keep = 3;
    }
    else {
      $keep = (int) $request['keep'];
    }
    if (empty($keep)) {
      throw new BadRequestHttpException('Invalid keep value.');
    }
    $response = [];
    $node_ids = $request['nodes'];
    foreach ($node_ids as $nid) {
      $dropped = $this->pruner->dropOldRevisions($nid, $keep);
      $response[] = [$nid, $dropped];
    }
    return new ModifiedResourceResponse($response, 200);
  }

}
