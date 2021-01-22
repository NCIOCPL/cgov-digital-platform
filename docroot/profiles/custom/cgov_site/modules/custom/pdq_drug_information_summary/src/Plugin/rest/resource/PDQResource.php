<?php

namespace Drupal\pdq_drug_information_summary\Plugin\rest\resource;

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
 *   id = "pdq_dis_api",
 *   label = @Translation("PDQ Drug Information Summaries API"),
 *   uri_paths = {
 *     "canonical" = "/pdq/api/dis/{id}",
 *     "create" = "/pdq/api/dis"
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
   *   Used to find and load node revisions.
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
   * See also \Drupal\pdq_core\Plugin\rest\resource::get(), which
   * takes a CDR ID and returns all of the node ids which match.
   *
   * @param string $id
   *   A Drupal node ID.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The values (in a keyed array) for a Drupal node.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
   *   Thrown when the summary node was not found.
   * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
   *   Thrown when no ID was provided.
   */
  public function get($id) {

    // Make sure the client gave us something to look for.
    if (!$id) {
      throw new BadRequestHttpException('No ID was provided');
    }

    // We got a node ID, so return the corresponding node's values.
    $node = Node::load($id);
    if (empty($node)) {
      $msg = $this->t('Node @id not found', ['@id' => $id]);
      throw new NotFoundHttpException($msg);
    }
    $fields = [
      'nid' => $node->id(),
      'created' => date('c', $node->getCreatedTime()),
      'cdr_id' => $node->field_pdq_cdr_id->value,
      'title' => $node->getTitle(),
      'browser_title' => $node->field_browser_title->value,
      'body' => $node->body->value,
      'description' => $node->field_page_description->value,
      'posted_date' => $node->field_date_posted->value,
      'audio_id' => $node->field_pdq_audio_id->value,
      'pron' => $node->field_pdq_pronunciation_key->value,
      'updated_date' => $node->field_date_updated->value,
      'public_use' => $node->field_public_use->value,
      'url' => $node->field_pdq_url->value,
      'published' => $node->status->value,
    ];
    $response = new ResourceResponse($fields);
    $response->addCacheableDependency(['#cache' => ['max-age' => 0]]);
    return $response;
  }

  /**
   * Response to POST requests.
   *
   * Stores a new PDQ Drug Summary node or update an existing node.
   *
   * Decided to use POST for replacing existing summary nodes,
   * because PUT is required to be idempotent, meaning if the
   * client submits the same request twice, the effect on the
   * resource should be no different than if it had been
   * submitted only once, and it would be prohibitively hard
   * to figure out whether the document submitted each time
   * were identical, and we should not create a new revision
   * (we'll let the upstream client take care of that logic).
   *
   * See https://stackoverflow.com/questions/630453/put-vs-post-in-rest
   *
   * @param array $drug
   *   The drug summary document values.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The response containing the node ID for the PDQ Drug Summary.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function post(array $drug) {

    // Extract the bits we'll use more than once.
    $nid = $drug['nid'] ?? '';

    // If the node doesn't already exist, create it.
    if (empty($nid)) {
      $node = Node::create([
        'type' => 'pdq_drug_information_summary',
        'langcode' => 'en',
      ]);
    }

    // The node already exists: fetch it.
    else {
      /** @var \Drupal\Core\Entity\ContentEntityStorageBase $storage */
      $storage = $this->entityTypeManager->getStorage('node');
      $vid = $storage->getLatestRevisionId($nid);
      $node = $storage->loadRevision($vid);
    }

    // Fill in the values for the drug summary.
    $today = date('Y-m-d');
    $node->setTitle(($drug['title']));
    $node->setOwnerId($this->currentUser->id());
    $node->set('body', ['value' => $drug['body'], 'format' => 'raw_html']);
    $node->set('field_pdq_url', $drug['url']);
    $node->set('field_pdq_cdr_id', $drug['cdr_id']);
    $node->set('field_date_posted', $drug['posted_date'] ?? $today);
    $node->set('field_date_updated', $drug['updated_date'] ?? $today);
    $node->set('field_page_description', $drug['description']);
    $node->set('field_pdq_audio_id', $drug['audio_id']);
    $node->set('field_pdq_pronunciation_key', $drug['pron']);
    $node->set('field_public_use', 0);
    $node->set('field_browser_title', $drug['title']);

    // Store the node, leaving it unpublished. We'll make all of the
    // nodes published in a separate pass after they've all been
    // stored, in order to minimize the window of time during which
    // older versions exist alongside newer.
    // There is a long-standing bug in Drupal core, which fails to
    // set the correct revision creation time and user for new
    // revisions, so we do it here.
    // See https://github.com/NCIOCPL/cgov-digital-platform/issues/2630.
    $node->setRevisionCreationTime(\time());
    $node->setRevisionUserId($this->currentUser->id());
    $node->moderation_state->value = 'draft';
    $node->save();
    $verb = empty($nid) ? 'Created' : 'Updated';
    $code = empty($nid) ? 201 : 200;
    $cdr_id = $drug['cdr_id'];
    $args = ['%verb' => $verb, '%cdrid' => $cdr_id, '%nid' => $node->id()];
    $this->logger->notice('%verb %nid for %cdrid', $args);

    // Tell the caller the ID for the possibly new node.
    return new ModifiedResourceResponse(['nid' => $node->id()], $code);
  }

}
