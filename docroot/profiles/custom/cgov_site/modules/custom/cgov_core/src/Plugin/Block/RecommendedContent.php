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
 * Provides a Recommended Content block.
 *
 * @Block(
 *  id = "cgov_recommended_content",
 *  admin_label = @Translation("Cgov Recommended Content"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class RecommendedContent extends BlockBase implements ContainerFactoryPluginInterface {

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
   * {@inheritdoc}
   */
  public function build() {
    // If our entity exists, get the nid (content id) and bundle (content type).
    if ($curr_entity = $this->getCurrEntity()) {
      $content_type = $curr_entity->bundle();
    }

    // Change view based on CT.
    switch ($content_type) {
      case 'cgov_blog_post':
        $build = [
          '#markup' => $this->t('
              <div class="contentid-1073806 slot-item first-SI equalheight large-4 columns card gutter blog-feature">
                  <div class="feature-card cgvBlogPost">
                  <a href="/news-events/cancer-currents-blog/2017/lung-cancer-screening-challenges">
                      <div class="image-hover">
                          <img src="/sites/default/files/2019-03/ocean-sunset-view-mykonos-thumb.jpg" alt="">
                      </div>
                      <h3>Lung Cancer Screening Project Reveals Challenges</h3>
                  </a>
                  </div>
              </div>
              <div class="contentid-1108310 slot-item equalheight large-4 columns card gutter blog-feature">
                  <div class="feature-card cgvBlogPost">
                  <a href="/news-events/cancer-currents-blog/2018/lung-cancer-screening-identifying-who-benefits">
                      <div class="image-hover">
                          <img src="/sites/default/files/2019-03/ocean-sunset-view-mykonos-thumb.jpg" alt="">
                      </div>
                      <h3>Lung Cancer Screening May Benefit Those at Highest Risk</h3>
                  </a>
                  </div>
              </div>
              <div class="contentid-1051873 slot-item last-SI equalheight large-4 columns card gutter blog-feature">
                  <div class="feature-card cgvBlogPost">
                  <a href="/news-events/cancer-currents-blog/2016/risk-profile-lung-screening">
                      <div class="image-hover">
                          <img src="/sites/default/files/2019-03/ocean-sunset-view-mykonos-thumb.jpg" alt="">
                      </div>
                      <h3>Improving Lung Cancer Screening</h3>
                  </a>
                  </div>
              </div>
          '),
        ];
        break;

      default:
        $build['#markup'] = '';
        break;
    }
    return $build;
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
