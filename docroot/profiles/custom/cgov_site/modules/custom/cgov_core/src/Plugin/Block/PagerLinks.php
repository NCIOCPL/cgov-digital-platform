<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Path\PathMatcherInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block that displays alternate language links.
 *
 * This is based off of Drupal\language\Plugin\Block\LanguageBlock.
 *
 * @Block(
 *  id = "cgov_pager_links",
 *  admin_label = "Pager Links",
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class PagerLinks extends BlockBase implements ContainerFactoryPluginInterface {

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
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  /**
   * Constructs an LanguageBar object.
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
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    LanguageManagerInterface $language_manager,
    PathMatcherInterface $path_matcher,
    RouteMatchInterface $route_matcher
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->languageManager = $language_manager;
    $this->pathMatcher = $path_matcher;
    $this->routeMatcher = $route_matcher;
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
      $container->get('path.matcher'),
      $container->get('current_route_match')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    // If this site is not multilingual this should not display.
    // Of course, if this site is not multilingual, there should be no block...
    $access = $this->languageManager->isMultilingual() ? AccessResult::allowed() : AccessResult::forbidden();

    // Cache this fact based on the list of languages for the site.
    return $access->addCacheTags(['config:configurable_language_list']);
  }

  /**
   * Gets the current entity if there is one.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  private function getCurrEntity() {
    $params = $this->routeMatcher->getParameters()->all();
    foreach ($params as $param) {
      if ($param instanceof ContentEntityInterface) {
        // If you find a ContentEntityInterface stop iterating and return it.
        return $param;
      }
    }
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    // Initialize the render array response to be empty.
    $build = [];

    // The next few lines are from LanguageBlock - getLanguageSwitchLinks is
    // looking for front or current.
    // TODO: See if we can just use the route matcher or even the loaded entity.
    $route_name = $this->pathMatcher->isFrontPage() ? '<front>' : '<current>';
    $links = $this->languageManager->getLanguageSwitchLinks(
      LanguageInterface::TYPE_CONTENT,
      Url::fromRoute($route_name)
    );

    // Remove the current language from the list of links.
    $curr_lang = $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_CONTENT)->getId();
    $filtered_links = array_diff_key($links->links, [$curr_lang => '']);

    // Filter out untranslated URLs, by default ALL possible links are
    // returned by getLanguageSwitchLinks.
    if ($curr_entity = $this->getCurrEntity()) {
      $translations = array_keys($curr_entity->getTranslationLanguages());
      $filtered_links = array_filter(
        $filtered_links,
        function ($v, $k) use ($translations) {
          return in_array($k, $translations);
        },
        ARRAY_FILTER_USE_BOTH
      );
    }
    else {
      // TODO: If we have a View page we would end up here
      // we do not have that case yet fix this when that happens.
      $filtered_links = [];
    }

    // Now that we have the alternate links, or nothing.
    // if nothing do not output anything.
    if (isset($links->links)) {
      $build = [
        '#theme' => 'links__language_block',
        '#links' => $filtered_links,
        '#attributes' => [
          'class' => [
            "language-switcher-{$links->method_id}",
          ],
        ],
        '#set_active_class' => TRUE,
      ];
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
