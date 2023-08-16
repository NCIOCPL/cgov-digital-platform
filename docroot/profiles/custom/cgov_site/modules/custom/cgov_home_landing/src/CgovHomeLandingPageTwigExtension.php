<?php

namespace Drupal\cgov_home_landing;

use Twig\TwigFunction;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\AbstractExtension;

/**
 * Extend Drupal's AbstractExtension class.
 */
class CgovHomeLandingPageTwigExtension extends AbstractExtension {


  /**
   * The request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructs a new CgovHomeLandingPageTwigExtension class.
   */
  public function __construct(RequestStack $requestStack) {
    $this->requestStack = $requestStack;
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return 'cgov_home_landing.twigextension';
  }

  /**
   * {@inheritdoc}
   */
  public function getFunctions() {
    return [
      new TwigFunction('getHomeLandingStyle', [$this, 'getHomeLandingStyle']),
    ];
  }

  /**
   * Returns page style.
   *
   * @return string
   *   Page style of the Entity
   */
  public function getHomeLandingStyle() {
    $entity = $this->requestStack->getCurrentRequest()->get('node');
    if ($entity && $entity->bundle() === 'cgov_home_landing') {
      $page_style = $entity->get('field_page_style')->getValue();
      return $page_style[0]['value'] ?? '';
    }
    else {
      return '';
    }
  }

}
