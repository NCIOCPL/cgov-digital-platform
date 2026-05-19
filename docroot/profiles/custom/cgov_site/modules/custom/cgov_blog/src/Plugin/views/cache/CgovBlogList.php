<?php

namespace Drupal\cgov_blog\Plugin\views\cache;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\node\NodeInterface;
use Drupal\views\Attribute\ViewsCache;
use Drupal\views\Plugin\views\cache\Tag;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * CGov blog-series-scoped tag caching for blog Views.
 */
#[ViewsCache(
  id: 'cgov_blog_list',
  title: new TranslatableMarkup('CGov blog list'),
  help: new TranslatableMarkup('Tag based caching scoped to a blog series.'),
  base: ['node_field_data'],
)]
class CgovBlogList extends Tag implements ContainerFactoryPluginInterface {

  /**
   * Current route match service.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * Constructs a CgovBlogList cache plugin instance.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, RouteMatchInterface $route_match) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatch = $route_match;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_route_match')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function summaryTitle() {
    return $this->t('CGov blog list');
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    $tags = parent::getCacheTags();

    if ($series_nid = $this->getSeriesNid()) {
      $tags = array_values(array_diff($tags, ['node_list']));
      $tags = Cache::mergeTags($tags, ['cgov_blog_list:' . $series_nid]);
    }

    return $tags;
  }

  /**
   * Gets the blog series nid from arguments or route context.
   */
  protected function getSeriesNid(): ?int {
    $args = $this->view->args ?: ($this->view->element['#arguments'] ?? []);
    if (!empty($args[0]) && is_numeric($args[0])) {
      return (int) $args[0];
    }

    $node = $this->routeMatch->getParameter('node');
    if ($node instanceof NodeInterface) {
      if ($node->bundle() === 'cgov_blog_series') {
        return (int) $node->id();
      }

      if ($node->bundle() === 'cgov_blog_post' && !$node->get('field_blog_series')->isEmpty()) {
        return (int) $node->get('field_blog_series')->target_id;
      }
    }

    return NULL;
  }

}
