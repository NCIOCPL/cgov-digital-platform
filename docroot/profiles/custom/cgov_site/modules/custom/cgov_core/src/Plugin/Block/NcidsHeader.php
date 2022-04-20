<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Url;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Path\PathValidatorInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RequestContext;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\cgov_core\NavItem;

/**
 * Provides a 'NCIDS Header' block.
 *
 * @Block(
 *  id = "ncids_header",
 *  admin_label = @Translation("NCIDS Header"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class NcidsHeader extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Stores the configuration factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The path alias manager.
   *
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * The path validator.
   *
   * @var \Drupal\Core\Path\PathValidatorInterface
   */
  protected $pathValidator;

  /**
   * The request context.
   *
   * @var \Drupal\Core\Routing\RequestContext
   */
  protected $requestContext;

  /**
   * Constructs an NCIDS Header object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navigationManager
   *   Cgov navigation service.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\path_alias\AliasManagerInterface $alias_manager
   *   The path alias manager.
   * @param \Drupal\Core\Path\PathValidatorInterface $path_validator
   *   The path validator.
   * @param \Drupal\Core\Routing\RequestContext $request_context
   *   The request context.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManager $navigationManager,
    LanguageManagerInterface $language_manager,
    ConfigFactoryInterface $config_factory,
    AliasManagerInterface $alias_manager,
    PathValidatorInterface $path_validator,
    RequestContext $request_context
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->navMgr = $navigationManager;
    $this->languageManager = $language_manager;
    $this->configFactory = $config_factory;
    $this->aliasManager = $alias_manager;
    $this->pathValidator = $path_validator;
    $this->requestContext = $request_context;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.cgov_navigation_manager'),
      $container->get('language_manager'),
      $container->get('config.factory'),
      $container->get('path_alias.manager'),
      $container->get('path.validator'),
      $container->get('router.request_context')
    );
  }

  /**
   * Get Main Nav NavItems.
   *
   * @return array
   *   Multidimensional main nav.
   */
  private function getTreeForMainNav() {
    // This will be the root node.
    $navRoot = $this->navMgr->getNavRoot('field_main_nav_root');

    if ($navRoot && $navRoot->isNavigable()) {
      // We need to not return the roo, so technically the tree depth will
      // be 2 as the children reside at level 2.
      return $navRoot->getAsNavTree(2, 'hide_in_main_nav', FALSE);
    }
    else {
      return [];
    }
  }

  /**
   * Gets the image render array to be used for the logo.
   *
   * The logo has some primary requirements:
   * 1. We want to let site builders upload a logo without requiring a new
   *    release. This is possible through the default theme setting of
   *    logo.url. This is either the default set in the theme's info.yml
   *    or it is overridden through the theme settings page.
   * 2. As we must support multiple languages and Drupal does not allow more
   *    than one file to be uploaded. So we will leverage SVG symbols to
   *    handle the language. A logo creator needs to add the logos to the
   *    svg for each language. As we only ususally have 2, this should not
   *    result in such a large SVG.
   * 3. So the logo.url must have a fragment tacked on to the end of it,  e.g,
   *    "#en" or "#es".
   * 4. Additionally, we want these logos to be forceably cached for a very
   *    long time, unless there is a change. So we need to add a cachebusting
   *    fingerprint to the image. E.g. ?v=12345. Drupal does not do this
   *    OOB.
   *
   * @return string
   *   The URL for the logo.
   */
  private function getLogo() {
    $langcode = $this->languageManager->getCurrentLanguage()->getId();
    $baseUrl = theme_get_setting('logo.url');

    // @todo We should make a svg_symbol theme hook and return that.
    // The templates would then output the <svg><use> bit for us.
    return $baseUrl . '#' . $langcode;
  }

  /* -------------------------------------------------------------------------
   * These are override methods for BlockBase
   * -------------------------------------------------------------------------
   */

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'home_page_title' => 'Home Page',
      'search_results_page' => '/search/results',
      'autosuggest_collection' => '',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {

    $form['header_config'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('NCIDS Header Configuration'),
      '#description' => $this->t('Configures the settings for the NCIDS Header.'),
    ];

    $form['header_config']['home_page_title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('The accessible label for the home page link.'),
      '#description' => $this->t('This is used in place of an alt tag for the logo and should be descriptive. E.g., National Cancer Institute Division of Cancer Epidemiology and Genetics Homepage'),
      '#default_value' => $this->configuration['home_page_title'],
      '#size' => 100,
      '#maxlength' => 1024,
      '#required' => TRUE,
    ];

    $search_results_page = $this->configuration['search_results_page'] ? $this->aliasManager->getAliasByPath($this->configuration['search_results_page']) : '';
    $form['header_config']['search_results_page'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Search Results Page'),
      '#default_value' => $search_results_page,
      '#size' => 40,
      '#description' => $this->t('Specify a relative URL to use as the search results page. If you are building out an empty site leave this empty until you create the results page.'),
      '#field_prefix' => $this->requestContext->getCompleteBaseUrl(),
    ];

    $form['header_config']['autosuggest_collection'] = [
      '#type' => 'textfield',
      '#title' => $this->t('The collection name for the autosuggest API.'),
      '#description' => $this->t('This is the name of the collection for the autosuggest API. Leave empty if there is no autosuggest.'),
      '#default_value' => $this->configuration['autosuggest_collection'],
      '#size' => 100,
      '#maxlength' => 1024,
      '#required' => TRUE,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockValidate($form, FormStateInterface $form_state) {
    if (!$form_state->isValueEmpty(['header_config', 'search_results_page'])) {
      // Get the normal path of the search results page.
      $form_state->setValueForElement(
        $form['header_config']['search_results_page'],
        $this->aliasManager->getPathByAlias(
          $form_state->getValue(['header_config', 'search_results_page'])
        )
      );
    }
    // Validate search page path (if set).
    if (($value = $form_state->getValue(['header_config', 'search_results_page'])) && $value[0] !== '/') {
      $form_state->setErrorByName(
        'search_results_page',
        $this->t("The path '%path' has to start with a slash.", [
          '%path' => $form_state->getValue([
            'header_config',
            'search_results_page',
          ]),
        ]));
    }
    // Validate the URL to make sure it is a real path or alias. (if set)
    if (
      !$this->pathValidator->isValid($form_state->getValue([
        'header_config',
        'search_results_page',
      ]))
    ) {
      $form_state->setErrorByName(
        'search_results_page',
        $this->t("Either the path '%path' is invalid or you do not have access to it.", [
          '%path' => $form_state->getValue([
            'header_config',
            'search_results_page',
          ]),
        ]));
    }

    parent::blockValidate($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $header_config = $form_state->getValue('header_config');
    $this->configuration['home_page_title'] = $header_config['home_page_title'];
    $this->configuration['search_results_page'] = $header_config['search_results_page'];
    $this->configuration['autosuggest_collection'] = $header_config['autosuggest_collection'];
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];

    // We are not cached and should render.
    $navItems = $this->getTreeForMainNav();

    $build['navitems'] = $navItems;
    $build['site_logo'] = $this->getLogo();
    $build['home_page_title'] = $this->configuration['home_page_title'];
    $build['search_results_url'] = $this->configuration['search_results_page'] ?? Url::fromRoute(
      $this->aliasManager->getPathByAlias($this->configuration['search_results_page'])
    );
    $build['autosuggest_collection'] = $this->configuration['autosuggest_collection'];

    return $build;
  }

  /* --------------------------------------------------------------------------
   * For the future me:
   * TL;DR; The build above is only called if the item is not in the cache. So
   * there is no need to return an empty build with #cache and #pre_render set.
   *
   * BlockViewBuilder is what generates the render array for a block. The build
   * method in a block plugin is actually called in a #pre_render tag that
   * the builder defines. So you cannot simply return a render array from our
   * build with its own #pre_render and some cache information. The #pre_render
   * will never be called. You must override the getCache* methods, which will
   * get incorporated into the render array generated by the BlockViewBuilder
   * and that is what will allow the render to cache the contents of the block.
   *
   * The old MainNav block just happened to work because of how markup is
   * processed by the twig renderer -- it calls the Drupal renderer, which sees
   * the #pre_render callback and calls it to get the old nav. It should not
   * have been done that way.
   *  -------------------------------------------------------------------------
   */

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    $langcode = $this->languageManager->getCurrentLanguage()->getId();
    $cache_tags = parent::getCacheTags();
    $cache_tags[] = 'mainnav:' . $langcode;
    $cache_tags[] = 'mainnav_manual';
    return $cache_tags;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    return Cache::mergeContexts(parent::getCacheContexts(), ['languages:language_interface']);
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return Cache::mergeMaxAges(parent::getCacheMaxAge(), Cache::PERMANENT);
  }

  /**
   * Generic sorting function to sort by Term weight.
   *
   * It's equivalent to reverse sort, since higher weights should
   * appear first.
   *
   * @param \Drupal\cgov_core\NavItem $firstItem
   *   Nav item.
   * @param \Drupal\cgov_core\NavItem $secondItem
   *   Nav item.
   *
   * @return int
   *   Sort result.
   */
  public static function sortItemsByWeight(NavItem $firstItem, NavItem $secondItem) {
    $firstWeight = $firstItem->getWeight();
    $secondWeight = $secondItem->getWeight();
    if ($firstWeight === $secondWeight) {
      return 0;
    }
    return ($firstWeight < $secondWeight) ? -1 : 1;
  }

  /* TODO: Add BlockForm to setup the search bits */
  /* I guess we have an English and a Spanish block? */

}
