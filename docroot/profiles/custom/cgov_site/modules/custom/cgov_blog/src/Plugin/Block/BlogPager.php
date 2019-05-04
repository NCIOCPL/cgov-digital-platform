<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
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
   * The BlogManager object.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  public $blogManager;

  /**
   * Constructs a BlogPager object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_blog\Services\BlogManagerInterface $blog_manager
   *   A blog manager object.
   */
  public function __construct(
    // Constructor with args.
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blogManager = $blog_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    // Create an instance of this plugin with the blog_manager service.
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_blog.blog_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    // If our entity exists, get the nid (content id) and bundle (content type).
    if ($curr_entity = $this->blogManager->getCurrentEntity()) {
      $content_id = $curr_entity->id();
      $content_type = $curr_entity->bundle();
    }

    // Build object.
    $build = [];

    // Render our pager markup based on content type.
    // Note: wherever possible, we should use out-of-the box pagination from
    // the view. This plugin is currently being used by Blog Posts only.
    switch ($content_type) {
      case 'cgov_blog_post':
        $post = $this->drawBlogPostOlderNewer($content_id, $content_type);
        $langcode = $curr_entity->language()->getId();

        // Build the render array & cache tags.
        $build['prev_nid'] = $post['prev_nid'] ?? '';
        $build['prev_title'] = $post['prev_title'] ?? '';
        $build['prev_link'] = $this->blogManager->getBlogPathFromNid($build['prev_nid'], $langcode);
        $build['next_nid'] = $post['next_nid'] ?? '';
        $build['next_title'] = $post['next_title'] ?? '';
        $build['next_link'] = $this->blogManager->getBlogPathFromNid($build['next_nid'], $langcode);
        $build['#cache'] = [
          'tags' => [
            'node_list',
          ],
        ];
        break;

      default:
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
    // Get available Blog Post nids.
    $entity_ids = $this->blogManager->getNodesByPostedDateAsc($content_type);

    // Create series filter.
    $filter_node = $this->blogManager->getNodeStorage()->load($cid);
    $filter_series = $filter_node->field_blog_series->target_id;

    // Build a collection of blog link objects.
    foreach ($entity_ids as $entid) {
      $node = $this->blogManager->getNodeStorage()->load($entid);
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
    $post = [];
    $blog_links = $this->getBlogPostPagerLinks($cid, $content_type);

    // Draw our prev/next links.
    foreach ($blog_links as $index => $blog_link) {

      // Look for the entry that matches the current node.
      if ($blog_link['nid'] == $cid) {

        // Link previous post if exists.
        if ($index > 0) {
          $p = $blog_links[$index - 1];
          $post['prev_nid'] = $p['nid'];
          $post['prev_title'] = $p['title'];
        }

        // Link next post if exists.
        if ($index < (count($blog_links) - 1)) {
          $n = $blog_links[$index + 1];
          $post['next_nid'] = $n['nid'];
          $post['next_title'] = $n['title'];
        }
        break;
      }
    }

    // Return properties that will be used to draw HTML.
    return $post;

  }

}
