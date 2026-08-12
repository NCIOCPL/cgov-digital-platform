<?php

namespace Drupal\cgov_blog;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\node\NodeInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/**
 * Extend Drupal's Twig_Extension class.
 */
class CgovBlogTwigExtensions extends AbstractExtension {

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
      new TwigFunction('get_blog_series_title', [$this, 'getBlogSeriesTitle'], ['is_safe' => ['html']]),
    ];
  }

  /**
   * Retrieves the appropriate blog series title based on context.
   *
   * @param string|null $year
   *   The 4-digit year value, if present.
   * @param string|null $topic
   *   The topic ID, if present.
   * @param \Drupal\node\NodeInterface $node
   *   The node object.
   *
   * @return string
   *   The formatted blog series title.
   */
  public function getBlogSeriesTitle(?string $year, ?string $topic, NodeInterface $node): string {

    // Stricter validation: Ensure it is exactly a 4-digit number.
    if ($year !== NULL && !preg_match('/^\d{4}$/', $year)) {
      // Fail gracefully instead of throwing an exception so Twig
      // can continue rendering without crashing the page.
      $year = NULL;
    }

    // When called from a twig template, $topic may be an empty string.
    $includeTopic = ($topic !== NULL && trim($topic) !== '');

    // If there is a topic or a valid year filter, default to Card Title.
    // Otherwise, default to the standard Node Title.
    $titleMode = ($year || $includeTopic)
      ? BlogManagerInterface::TITLE_CARD
      : BlogManagerInterface::TITLE_NODE;

    return $this->blogManager->getBlogSeriesTitle($year, $includeTopic, $node, $titleMode);
  }

}
