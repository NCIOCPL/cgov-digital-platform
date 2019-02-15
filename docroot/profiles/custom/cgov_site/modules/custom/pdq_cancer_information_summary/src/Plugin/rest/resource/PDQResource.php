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
   * See also \Drupal\pdq_core\Plugin\rest\resource::get(), which
   * takes a CDR ID and returns all of the node ids (with language)
   * which match.
   *
   * @param string $id
   *   A Drupal node ID.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The values (in a keyed array) for a Drupal node. There can be multiple
   *   nested arrays for the English (keyed by 'en') and Spanish ('es')
   *   versions of the summary.
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
            'id' => $s->field_pdq_section_id->value,
            'title' => $s->field_pdq_section_title->value,
            'html' => $s->field_pdq_section_html->value,
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
          'description' => $translation->field_page_description->value,

          // This field will probably not be retained for the intitial
          // release.
          // 'keywords' => $translation->field_syndication_keywords->value,
          // End of suppressed field.
          'public_use' => $translation->field_public_use->value,
          'url' => $translation->field_pdq_url->value,
          'published' => $translation->status->value,
          'sections' => $sections,
        ];
      }
    }
    $response = new ResourceResponse($fields);
    $response->addCacheableDependency(['#cache' => ['max-age' => 0]]);
    return $response;
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
   * Cancer Information Summary document and its Spanish translation
   * document in the same node.
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

    // Extract the bits we'll use frequently.
    $nid = $summary['nid'];
    $language = $summary['language'];

    // If the node doesn't already exist, create it. The English
    // summary must be stored before its Spanish translation.
    if (empty($nid)) {
      if ($language != 'en') {
        $msg = 'New summary node must be the English version';
        throw new BadRequestHttpException($msg);
      }
      $node = Node::create([
        'type' => 'pdq_cancer_information_summary',
        'langcode' => 'en',
      ]);
    }

    // The node already exists: fetch it and point to the entity
    // for the language being stored.
    else {
      $node = Node::load($nid);
      if ($node->hasTranslation($language)) {
        $node = $node->getTranslation($language);
      }
      else {
        $node = $node->addTranslation($language);
      }
    }

    // Assemble the summary sections as Paragraph entities.
    $sections = [];
    foreach ($summary['sections'] as $section) {
      $paragraph = Paragraph::create([
        'type' => 'pdq_summary_section',
        'field_pdq_section_id' => ['value' => $section['id']],
        'field_pdq_section_title' => [
          'value' => $section['title'],
          'format' => 'plain_text',
        ],
        'field_pdq_section_html' => [
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

    // Fill in the values for the summary.
    $today = date('Y-m-d');
    $node->setTitle(($summary['title']));
    $node->setOwnerId($this->currentUser->id());
    $node->set('field_pdq_url', $summary['url']);
    $node->set('field_pdq_cdr_id', $summary['cdr_id']);
    $node->set('field_pdq_audience', $summary['audience']);
    $node->set('field_pdq_summary_type', $summary['summary_type']);
    $node->set('field_date_posted', $summary['posted_date'] ?? $today);
    $node->set('field_date_updated', $summary['updated_date'] ?? $today);
    $node->set('field_short_title', $summary['short_title']);
    $node->set('field_page_description', $summary['description']);

    // Field suppressed for now.
    // $node->set('field_syndication_keywords', $summary['keywords']);
    // End of suppressed field.
    $node->set('field_summary_sections', $sections);
    $node->set('field_public_use', 1);

    // Store the summary, leaving it unpublished. We'll make all of the
    // summaries published in a separate pass after they've all been
    // stored, in order to minimize the window of time during which
    // older versions exist alongside newer.
    $node->save();
    $verb = empty($nid) ? 'Created' : 'Updated';
    $code = empty($nid) ? 201 : 200;
    $cdr_id = $summary['cdr_id'];
    $args = ['%verb' => $verb, '%cdrid' => $cdr_id, '%nid' => $node->id()];
    $this->logger->notice('%verb %nid for %cdrid', $args);

    // Tell the caller the ID for the possibly new node.
    return new ModifiedResourceResponse(['nid' => $node->id()], $code);
  }

}
