<?php

namespace Drupal\cgov_blog;

use Drupal\cgov_blog\Services\BlogManagerInterface;

/**
 * Extend Drupal's Twig_Extension class.
 */
class CgovBlogTwigExtensions extends \Twig_Extension {

  /**
   * Blog Manager.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  protected $blogManager;

  /**
   * Constructs a new TwigExtension class.
   */
  public function __construct(BlogManagerInterface $blogManager) {
    $this->blogManager = $blogManager;
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return 'cgov_blog.CgovBlogTwigExtensions';
  }

  /**
   * {@inheritdoc}
   */
  public function getFunctions() {
    return [
      new \Twig_SimpleFunction('get_blog_series_title', [$this, 'getBlogSeriesTitle'], ['is_safe' => ['html']]),
    ];
  }

  /**
   * Determine whether any real text content exists.
   *
   * @param string $month
   *   Month value.
   * @param string $year
   *   Year value.
   * @param string $topic
   *   Topic value.
   * @param object $node
   *   Node object.
   *
   * @return bool
   *   Field has text content.
   */
  public function getBlogSeriesTitle($month, $year, $topic, $node) {
    return $this->blogManager->getBlogSeriesTitle($month, $year, $topic, $node);
  }

}
