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
   *   Topic ID if present.
   * @param object $node
   *   Node object.
   *
   * @return bool
   *   Field has text content.
   */
  public function getBlogSeriesTitle($month, $year, $topic, $node) {

    // The only allowed characters in dates are numbers. Once we eliminate
    // everything else, there's no need to do further checks.
    if($year != NULL && (!is_numeric($year) || $year < 0)) {
        throw new BadRequestHttpException('year is invalid');
    }
    if($month != NULL && (!is_numeric($month) || $month < 1 || $month > 12)) {
        throw new BadRequestHttpException('month is invalid');
    }

    // When called from a twig template, $topic may be an empty string.
    $includeTopic = isset($topic) && (strlen(trim($topic)) > 0);

    return $this->blogManager->getBlogSeriesTitle($month, $year, $includeTopic, $node);
  }

}
