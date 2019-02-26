<?php

namespace Drupal\cgov_core\Plugin\Block;

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
 *  id = "cgov_pager",
 *  admin_label = "CGov Pager",
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class CgovPager extends BlockBase implements ContainerFactoryPluginInterface {

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
   * Constructs a CgovPager object.
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
        $build['#markup'] = $this->drawBlogPostOlderNewer($content_id, $content_type);
        break;

      default:
        $build['#markup'] = '';
        break;
    }
    return $build;
  }

  /**
   * Draw Older/Newer links for Blog Post.
   *
   * @param string $cid
   *   The nid of the current content item.
   * @param string $type
   *   The content type machine name.
   */
  private function drawBlogPostOlderNewer($cid, $type) {
    // TODO: filter by series.
    // Build our query object.
    $query = $this->entityQuery->get('node');
    $query->condition('status', 1);
    $query->condition('type', $type);
    $query->sort('field_date_posted');
    $entity_ids = $query->execute();

    // Build associative array.
    foreach ($entity_ids as $nid) {
      $node = $this->getNodeStorage()->load($nid);
      $blog_links[] = [
        'nid' => $nid,
        'date' => $node->field_date_posted->value,
        'title' => $node->title->value,
      ];
    }

    // Open Blog Post pagination div.
    $markup = "<div id='cgov-blog-post-pagination>";

    // Draw our prev/next links.
    // TODO: hook up translation.
    foreach ($blog_links as $index => $blog_link) {
      if ($blog_link['nid'] == $cid) {
        $length = count($blog_links);

        // Link previous post if exists.
        if ($index > 0) {
          $prev = $blog_links[$index - 1];
          $markup .= "
            <div class='blog-post-older'>
              <a href=/node/" . $prev['nid'] . ">&lt; Older Post</a>
              <p><i>" . $prev['title'] . "</i></p>
            </div>
          ";
        }

        // Link next post if exists.
        if ($index < ($length - 1)) {
          $next = $blog_links[$index + 1];
          $markup .= "
            <div class='blog-post-newer'>
              <a href=/node/" . $next['nid'] . ">Newer Post &gt;</a>
              <p><i>" . $next['title'] . "</i></p>
            </div>
          ";
        }
        break;
      }
    }

    // Close pagination div and return HTML.
    $markup .= "</div>";
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
