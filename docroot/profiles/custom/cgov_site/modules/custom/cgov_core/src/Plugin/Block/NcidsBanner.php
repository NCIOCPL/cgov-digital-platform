<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Path\PathMatcherInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'NCIDS Banner' block.
 *
 * This is basically a LanguageBlock only that it need to draw no matter what,
 *
 * @Block(
 *  id = "ncids_banner",
 *  admin_label = @Translation("NCIDS Banner"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class NcidsBanner extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The path matcher.
   *
   * @var \Drupal\Core\Path\PathMatcherInterface
   */
  protected $pathMatcher;

  /**
   * Constructs a LanguageBlock object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Drupal\Core\Path\PathMatcherInterface $path_matcher
   *   The path matcher.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, LanguageManagerInterface $language_manager, PathMatcherInterface $path_matcher) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->languageManager = $language_manager;
    $this->pathMatcher = $path_matcher;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('language_manager'),
      $container->get('path.matcher')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#theme' => 'block',
    ];
    $route_name = $this->pathMatcher->isFrontPage() ? '<front>' : '<current>';
    $type = 'language_content';
    $links = $this->languageManager->getLanguageSwitchLinks($type, Url::fromRoute($route_name));

    if (isset($links->links) && count($links->links) > 0) {
      // We have no UX that specifies there can be more than 1 language
      // enabled. So we will just take the first traslation available,
      // which should be the only one available. See cgov_core.module and
      // cgov_core_language_switch_links_alter for how we are filtering
      // the list.
      $link = $links->links[array_key_first($links->links)];

      // Replace the default drupal link classes with NCIDS classes.
      // Set the hreflang attribute.
      $link['attributes'] = [
        'class' => ['usa-button', 'usa-button--nci-small'],
        'hreflang' => $link['language']->getId(),
      ];

      // Borrowed the following from theme_preprocess_links since
      // we only need 1 link.
      $link += [
        'ajax' => NULL,
        'url' => NULL,
      ];
      $keys = [
        'title',
        'url',
      ];
      $link_element = [
        '#type' => 'link',
        '#title' => $link['title'],
        '#options' => array_diff_key($link, array_combine($keys, $keys)),
        '#url' => $link['url'],
        '#ajax' => $link['ajax'],
      ];

      $build['#translation_link'] = $link_element;
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
