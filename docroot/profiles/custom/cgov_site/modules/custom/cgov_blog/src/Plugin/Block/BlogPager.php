<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block that displays pager variants.
 *
 * @Block(
 *  id = "cgov_blog_pager",
 *  admin_label = "Cgov Blog Pager",
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogPager extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  /**
   * An entity query.
   *
   * @var Drupal\Core\Entity\Query\QueryFactory
   */
  protected $entityQuery;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a BlogPager object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   * @param \Drupal\Core\Entity\Query\QueryFactory $entity_query
   *   An entity query.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    RouteMatchInterface $route_matcher,
    QueryFactory $entity_query,
    EntityTypeManagerInterface $entity_type_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatcher = $route_matcher;
    $this->entityQuery = $entity_query;
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
      $container->get('current_route_match'),
      $container->get('entity.query'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * Gets the current entity if there is one.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  private function getCurrEntity() {
    $params = $this->routeMatcher->getParameters()->all();
    foreach ($params as $param) {
      if ($param instanceof ContentEntityInterface) {
        // If you find a ContentEntityInterface stop iterating and return it.
        return $param;
      }
    }
    return FALSE;
  }

  /**
   * Create a new node storage instance.
   *
   * @return Drupal\Core\Entity\EntityStorageInterface
   *   The node storage or NULL.
   */
  private function getNodeStorage() {
    $node_storage = $this->entityTypeManager->getStorage('node');
    return isset($node_storage) ? $node_storage : NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    // If our entity exists, get the nid (content id) and bundle (content type).
    if ($curr_entity = $this->getCurrEntity()) {
      $content_id = $curr_entity->id();
      $content_type = $curr_entity->bundle();
    }

    // Render our pager markup based on content type.
    // Note: wherever pssible, we should use out-of-the box pagination from
    // the view. This plugin is currently being used by Blog Posts only.
    switch ($content_type) {
      case 'cgov_blog_post':
        $markup = $this->drawBlogPostOlderNewer($content_id, $content_type);
        $build['#prev_node'] = $markup['prev_node'] ?? '';
        $build['#prev_text'] = $markup['prev_text'] ?? '';
        $build['#prev_title'] = $markup['prev_title'] ?? '';
        $build['#next_node'] = $markup['next_node'] ?? '';
        $build['#next_text'] = $markup['next_text'] ?? '';
        $build['#next_title'] = $markup['next_title'] ?? '';
        break;

      default:
        $build['#markup'] = '';
        break;
    }
    return $build;
  }

  /**
   * Get an array of field collections to use for Blog Post pagination links.
   *
   * @param string $cid
   *   The nid of the current content item.
   * @param string $content_type
   *   The content type machine name.
   */
  private function getBlogPostPagerLinks($cid, $content_type) {
    // Build our query object.
    $query = $this->entityQuery->get('node');
    $query->condition('status', 1);
    $query->condition('type', $content_type);
    $query->sort('field_date_posted');
    $entity_ids = $query->execute();

    // Create series filter.
    $filter_node = $this->getNodeStorage()->load($cid);
    $filter_series = $filter_node->field_blog_series->target_id;

    // Build associative array.
    foreach ($entity_ids as $entid) {
      $node = $this->getNodeStorage()->load($entid);
      $node_series = $node->field_blog_series->target_id;

      if ($node_series == $filter_series) {
        $blog_links[] = [
          'nid' => $entid,
          'date' => $node->field_date_posted->value,
          'title' => $node->title->value,
        ];
      }
    }
    return $blog_links;
  }

  /**
   * Draw Older/Newer links for Blog Post.
   *
   * @param string $cid
   *   The nid of the current content item.
   * @param string $content_type
   *   The content type machine name.
   */
  private function drawBlogPostOlderNewer($cid, $content_type) {
    // Get an array of blog field collections to populate links.
    $markup = [];
    $blog_links = $this->getBlogPostPagerLinks($cid, $content_type);

    // Draw our prev/next links.
    foreach ($blog_links as $index => $blog_link) {

      // Look for the entry that matches the current node.
      // TODO: use pretty URLs, not node #s.
      if ($blog_link['nid'] == $cid) {

        // Link previous post if exists.
        if ($index > 0) {
          $p = $blog_links[$index - 1];
          $markup['prev_node'] = $p['nid'];
          $markup['prev_title'] = $p['title'];
          $markup['prev_text'] = $this->t('Older Post');
        }

        // Link next post if exists.
        if ($index < (count($blog_links) - 1)) {
          $n = $blog_links[$index + 1];
          $markup['next_node'] = $n['nid'];
          $markup['next_title'] = $n['title'];
          $markup['next_text'] = $this->t('Newer Post');
        }
        break;
      }
    }

    // Return HTML.
    return $markup;
  }

  /**
   * {@inheritdoc}
   *
   * @todo Make cacheable in https://www.drupal.org/node/2232375.
   */
  public function getCacheMaxAge() {
    return 0;
  }

}
