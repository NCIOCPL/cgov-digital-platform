<?php

namespace Drupal\pdq_cancer_information_summary\Plugin\rest\resource;

use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Implements PDQ RESTful API verbs.
 *
 * @RestResource(
 *   id = "pdq_cis_api",
 *   label = @Translation("PDQ Cancer Information Summaries API"),
 *   uri_paths = {
 *     "canonical" = "/pdq/api/cis/{id}",
 *     "create" = "/pdq/api/cis"
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
   *   The CDR ID of a PDQ Summary document or Drupal node ID.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The response containing node ID(s) or a Drupal node
   *
   * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
   *   Thrown when the summary node was not found.
   * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
   *   Thrown when no ID was provided.
   */
  public function get($id) {
    if ($id !== 'some-bogus-value') {
      $fields = ['nid' => 42, 'title' => 'Test Summary'];
      return new ResourceResponse($fields);
    }
    if (!$id) {
      throw new BadRequestHttpException(t('No ID was provided'));
    }
    if (substr($id, 0, 3) === 'CDR') {
      $cdr_id = substr($id, 3);
      $query = \Drupal::database()->select('node__field_cdr_id', 'c');
      $query->addField('c', 'entity_id');
      $query->condition('c.bundle', 'pdq_summary');
      $query->condition('c.field_cdr_id_value', $cdr_id);
      $nids = $query->execute()->fetchCol();
      if (!empty($nids)) {
        return new ResourceResponse($nids);
      }
      $msg = t('@id not found', ['@id' => $id]);
      throw new NotFoundHttpException($msg);
    }
    $node = Node::load($id);
    if (empty($node)) {
      $msg = t('Node @id not found', ['@id' => $id]);
      throw new NotFoundHttpException($msg);
    }
    $sections = [];
    foreach ($node->field_summary_sections as $section) {
      $s = Paragraph::load($section->target_id);
      $sections[] = [
        "title" => $s->field_section_title->value,
        "html" => $s->field_section_html->value,
      ];
    }
    $fields = [
      "nid" => $node->id(),
      "cdr_id" => $node->field_cdr_id->value,
      "created" => date('c', $node->getCreatedTime()),
      "language" => $node->langcode->value,
      "url" => $node->path->alias,
      "title" => $node->getTitle(),
      "published" => $node->promote->value,
      "sections" => $sections,
    ];
    return new ResourceResponse($fields);
  }

  /**
   * Response to POST requests.
   *
   * Stores a new PDQ Summary node or update an existing node.
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
   * @param array $summary
   *   The summary document values.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The response containing node ID(s) or a Drupal node
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $summary) {
    $nid = $summary['nid'];
    if (empty($nid)) {
      $node = Node::create([
        'type' => 'pdq_cancer_information_summary',
        'langcode' => 'en',
        'path' => ['alias' => $summary['url']],
        'title' => $summary['title'],
      ]);
    }
    else {
      $node = Node::load($nid);
      $node = $node->addTranslation('es', [
        'title' => $summary['title'],
        'path' => ['alias' => $summary['url']],
      ]);
    }
    if (!empty($summary['short_title'])) {
      $short_title = substr($summary['short_title'], 0, 100);
      $node->set('field_short_title', $short_title);
    }
    if (!empty($summary['description'])) {
      $description = substr($summary['description'], 0, 320);
      $node->set('field_list_description', $description);
    }
    $posted = $summary['posted_date'];
    $updated = $summary['updated_date'];
    $posted = empty($posted) ? date('y-m-d') : $posted;
    $posted = empty($updated) ? date('y-m-d') : $updated;
    $node->set('field_date_posted', $posted);
    $node->set('field_date_updated', $updated);
    $node->setOwnerId($this->currentUser->id());
    // $node->setTitle($summary['title']);
    // Switch to false after dev/testing.
    // $node->setPublished(TRUE);
    // Do this later after dev/testing.
    $node->moderation_state->value = 'published';
    //$sections = [];
    //foreach ($summary['sections'] as $section) {
    //  $paragraph = Paragraph::create([
    //    'type' => 'pdq_summary_section',
    //    'field_section_html' => [
    //      'value' => $section['html'],
    //      'format' => 'full_html',
    //    ],
    //    'field_section_title' => [
    //      'value' => $section['title'],
    //      'format' => 'plain_text',
    //    ],
    //  ]);
    //  $paragraph->save();
    //  $sections[] = [
    //    'target_id' => $paragraph->id(),
    //    'target_revision_id' => $paragraph->getRevisionId(),
    //  ];
    //}
    //$node->set('field_summary_sections', $sections);
    $node->save();
    $verb = empty($nid) ? 'Created' : 'Updated';
    $code = empty($nid) ? 201 : 200;
    $args = ['%verb' => $verb, '%nid' => $node->id()];
    $this->logger->notice('%verb %nid', $args);
    return new ResourceResponse(['nid' => $node->id()], $code);
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
    if (substr($id, 0, 3) === 'CDR') {
      $cdr_id = substr($id, 3);
    }
    else {
      $cdr_id = $id;
    }
    $this->logger->notice("Deleting PDQ summary document CDR$id");
    $query = \Drupal::database()->select('node__field_cdr_id', 'c');
    $query->addField('c', 'entity_id');
    $query->condition('c.bundle', 'pdq_summary');
    $query->condition('c.field_cdr_id_value', $cdr_id);
    $nids = $query->execute()->fetchCol();
    if (empty($nids)) {
      throw new NotFoundHttpException("$id not found");
    }
    $sh = \Drupal::entityTypeManager()->getStorage('node');
    $nodes = $sh->loadMultiple($nids);
    try {
      foreach ($nids as $nid) {
        $this->logger->notice("Deleted pdq_summary node $nid.");
      }
      $sh->delete($nodes);
      return new ModifiedResourceResponse(NULL, 204);
    }
    catch (EntityStorageException $e) {
      throw new HttpException(500, 'Internal Server Error', $e);
    }
  }

}
