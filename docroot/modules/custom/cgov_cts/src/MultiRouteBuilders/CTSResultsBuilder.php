<?php

namespace Drupal\cgov_cts\MultiRouteBuilders;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Results route builder for CTS.
 *
 * Loads the React app; sets up the page-specific metadata.
 */
class CTSResultsBuilder extends CTSBuilderBase {

  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructs a CTSResultsBuilder object.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request object.
   */
  public function __construct(RequestStack $request_stack) {
    $this->requestStack = $request_stack;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $requestStack = $container->get('request_stack');

    return new static($requestStack);
  }

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'results';
  }

  /**
   * {@inheritdoc}
   */
  public function alterPageAttachments(array &$attachments, array $options = []) {
    parent::alterPageAttachments($attachments, $options);

    foreach ($attachments['#attached']['html_head'] as $delta => $tag) {
      if (isset($tag[1]) && $tag[1] == 'robots') {
        $attachments['#attached']['html_head'][$delta][0]['#attributes']['content'] = 'noindex, nofollow';
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function alterTokens(array &$replacements, array $context, array $options = []) {
    $uri = $this->requestStack->getCurrentRequest()->getRequestUri();

    foreach ($replacements as $key => $value) {
      switch ($key) {
        case '[cgov_tokens:cgov-title]':
          $replacements[$key] = 'Clinical Trials Search Results';
          break;

        case '[node:field_page_description:value]':
          $replacements[$key] = 'Find an NCI-supported clinical trial - Search results';
          break;

        case '[node:field_browser_title:value]':
          $replacements[$key] = 'Clinical Trials Search Results';
          break;

        case '[node:url]':
          $url = str_replace('/about-cancer/treatment/clinical-trials/search', $uri, $value);
          $replacements[$key] = $url;
          break;

        case '[current-page:url]':
          $url = str_replace('/about-cancer/treatment/clinical-trials/search', $uri, $value);
          $replacements[$key] = $url;
          break;

        default:
          break;
      }
    }
  }

  /**
   * {@inheritdoc}
   *
   * Return an array of tokens to alter.
   */
  public function getTokensForAltering(array $options = []) {
    $tokensToAlter = [
      '[cgov_tokens:cgov-title]',
      '[node:field_page_description:value]',
      '[node:field_browser_title:value]',
      '[node:url]',
      '[current-page:url]',
    ];

    return $tokensToAlter;
  }

}
