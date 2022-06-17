<?php

namespace Drupal\cgov_blog;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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

    // Throw an exception if the year is invalid.
    if (isset($year) && (!is_numeric($year) || $year < 0)) {
      throw new BadRequestHttpException('year is invalid');
    }
    // Throw an exception if the month is invalid.
    if (isset($month) && (!is_numeric($month) || $month < 1 || $month > 12)) {
      throw new BadRequestHttpException('month is invalid');
    }

    // Make sure For topic, only alphanumeric characters should be
    // allowed, plus colon ( : ) and hyphen ( - ).
    if (!empty($topic) && !preg_match('/^[a-zA-Z0-9:-]*$/', $topic)) {
      throw new BadRequestHttpException('month is invalid');
    }

    return $this->blogManager->getBlogSeriesTitle($month, $year, $topic, $node);
  }

}
