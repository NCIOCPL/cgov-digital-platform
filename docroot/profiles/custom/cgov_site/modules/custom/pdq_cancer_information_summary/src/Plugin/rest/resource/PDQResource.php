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
   *   The response containing node ID(s) or the values (in a keyed array)
   *   for a Drupal node. There can be multiple nested arrays for the
   *   English (keyed by 'en') and Spanish ('es') versions of the summary.
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

    // If we got a CDR ID, find the corresponding node IDs (should
    // be only one, but we return all we found, and it's the client's
    // problem to deal with cases where more than one node is found).
    if (substr($id, 0, 3) === 'CDR') {
      $cdr_id = substr($id, 3);
      $query = \Drupal::database()->select('node__field_pdq_cdr_id', 'c');
      $query->addField('c', 'entity_id');
      $query->condition('c.bundle', 'pdq_cancer_information_summary');
      $query->condition('c.field_pdq_cdr_id_value', $cdr_id);
      $nids = $query->execute()->fetchCol();
      if (!empty($nids)) {
        return new ResourceResponse($nids);
      }
      $msg = t('@id not found', ['@id' => $id]);
      throw new NotFoundHttpException($msg);
    }

    // We got a node ID, so return the corresponding node's values.
    $node = Node::load($id);
    if (empty($node)) {
      $msg = t('Node @id not found', ['@id' => $id]);
      throw new NotFoundHttpException($msg);
    }
    $fields = [
      'nid' => $node->id(),
      'created' => date('c', $node->getCreatedTime()),
    ];
    foreach (['en', 'es'] as $code) {
      if ($node->hasTranslation($code)) {
        $translation = $node->getTranslation($code);
        $sections = [];
        foreach ($translation->field_summary_sections as $section) {
          $s = Paragraph::load($section->target_id);
          $sections[] = [
            'id' => $s->field_section_id->value,
            'title' => $s->field_section_title->value,
            'html' => $s->field_section_html->value,
          ];
        }
        $fields[$code] = [
          'title' => $translation->getTitle(),
          'cdr_id' => $translation->field_pdq_cdr_id->value,
          'audience' => $translation->field_pdq_audience->value,
          'summary_type' => $translation->field_pdq_summary_type->value,
          'posted_date' => $translation->field_date_posted->value,
          'updated_date' => $translation->field_date_updated->value,
          'short_title' => $translation->field_short_title->value,
          'description' => $translation->field_list_description->value,
          'public_use' => $translation->field_public_use,
          'url' => $translation->path->alias,
          'published' => $translation->promote->value,
          'section' => $sections,
        ];
      }
    }
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
   * In contrast with the CDR, the Drupal CMS stores an English
   * Cancer Information Summary document and it's Spanish translation
   * document in the same node.
   *
   * Incomplete until we get the rest of the fields defined.
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

    // Simplified approach, doesn't support updates of existing
    // nodes. At this point we're just trying to make sure we
    // can save a new summary and add its Spanish translation.
    // If the values have a node ID (nid) this is the Spanish
    // summary.
    $nid = $summary['nid'];
    if (empty($nid)) {
      $node = Node::create([
        'type' => 'pdq_cancer_information_summary',
        'langcode' => 'en',
      ]);
    }
    else {
      $node = Node::load($nid);
      $node = $node->addTranslation('es');
    }
    $today = date('Y-m-d');
    $node->setTitle(($summary['title']));
    $node->setOwnerId($this->currentUser->id());
    $node->set('path', ['alias' => $summary['url']]);
    $node->set('field_pdq_cdr_id', $summary['cdr_id']);
    $node->set('field_pdq_audience', $summary['audience']);
    $node->set('field_pdq_summary_type', $summary['summary_type']);
    $node->set('field_date_posted', $summary['posted_date'] ?? $today);
    $node->set('field_date_updated', $summary['updated_date'] ?? $today);
    $node->set('field_short_title', $summary['short_title']);
    $node->set('field_list_description', $summary['description']);
    $node->set('field_public_use', TRUE);

    // Assemble and plug in the summary sections.
    $sections = [];
    foreach ($summary['sections'] as $section) {
      $paragraph = Paragraph::create([
        'type' => 'pdq_summary_section',
        'field_section_id' => ['value' => $section['id']],
        'field_section_title' => [
          'value' => $section['title'],
          'format' => 'plain_text',
        ],
        'field_section_html' => [
          'value' => $section['html'],
          'format' => 'full_html',
        ],
      ]);
      $paragraph->save();
      $sections[] = [
        'target_id' => $paragraph->id(),
        'target_revision_id' => $paragraph->getRevisionId(),
      ];
    }
    $node->set('field_summary_sections', $sections);

    // @todo: defer this, using 'draft' initially.
    $node->moderation_state->value = 'published';
    $node->save();
    $verb = empty($nid) ? 'Created' : 'Updated';
    $code = empty($nid) ? 201 : 200;
    $cdr_id = $summary['cdr_id'];
    $args = ['%verb' => $verb, '%cdrid' => $cdr_id, '%nid' => $node->id()];
    $this->logger->notice('%verb %cdrid as %nid', $args);
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
    // To be rewritten from the original POC code once we have
    // the CDR ID field defined.
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
