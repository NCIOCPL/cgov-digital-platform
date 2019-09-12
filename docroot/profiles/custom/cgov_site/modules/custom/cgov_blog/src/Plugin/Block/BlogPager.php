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
        // Get series nid for the block.
        $series_nid = $this->blogManager->getSeriesId();
        $langcode = $curr_entity->language()->getId();
        $prev_nid = $post['prev_nid'] ?? '';
        $prev_title = $post['prev_title'] ?? '';
        $prev_link = $this->blogManager->getBlogPathFromNid($prev_nid, $langcode);
        $next_nid = $post['next_nid'] ?? '';
        $next_title = $post['next_title'] ?? '';
        $next_link = $this->blogManager->getBlogPathFromNid($next_nid, $langcode);
        // Build the render array & cache tags.
        $build['#cgov_block_data'] = [
          'prev_nid' => $prev_nid,
          'prev_title' => $prev_title,
          'prev_link' => $prev_link,
          'next_nid' => $next_nid,
          'next_title' => $next_title,
          'next_link' => $next_link,
        ];
        $build['#cache'] = [
          'tags' => [
            'node:' . $series_nid,
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
    $blog_post_nids = $this->blogManager->getNodesByPostedDateAsc($content_type);

    // Create series filter.
    $filter_node = $this->blogManager->getNodeFromNid($cid);
    $filter_series = $filter_node->field_blog_series->target_id;

    // Initialize the links list in case there aren't any published posts.
    $blog_links = [];

    // Build a collection of blog link objects.
    foreach ($blog_post_nids as $nid) {
      $node = $this->blogManager->getNodeFromNid($nid);
      $node_series = $node->field_blog_series->target_id;

      if ($node_series == $filter_series) {
        $blog_links[] = [
          'nid' => $nid,
          'date' => $node->field_date_posted->value,
          'title' => $node->title->value,
        ];
      }
    }

    // Run through sorting function to handle date wierdness.
    $blog_links = $this->sortByField($blog_links, 'date');
    return $blog_links;
  }

  /**
   * Sort links by a given field.
   *
   * @param array $links
   *   Array of link objects.
   * @param string $field
   *   Field to sort by.
   */
  private function sortByField(array $links, $field) {
    if (count($links) > 1) {
      // Usort callback function.
      usort($links, function ($a, $b) use ($field) {
        return strcmp($a[$field], $b[$field]);
      });
    }
    return $links;
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
