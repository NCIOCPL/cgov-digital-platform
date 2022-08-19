<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Url;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\Element\EntityAutocomplete;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Path\PathValidatorInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RequestContext;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\link\LinkItemInterface;
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
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'home_page_title' => 'Home Page',
      'search_results_page' => '',
      'autosuggest_collection' => '',
    ];
  }

  /* **************************************************************************
   *                   ___ ___ _  _ ___  ___ ___ ___ _  _  ___
   *                  | _ \ __| \| |   \| __| _ \_ _| \| |/ __|
   *                  |   / _|| .` | |) | _||   /| || .` | (_ |
   *                  |_|_\___|_|\_|___/|___|_|_\___|_|\_|\___|
   * *************************************************************************/

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

  /**
   * Determines if a path is within a given url.
   *
   * We use arrays here because we need to check the path components, and not
   * just a string.
   *
   * @param string $path
   *   The path to check.
   * @param string $url
   *   The url to check against.
   *
   * @return bool
   *   TRUE is the path is part of, or equal to, the URL.
   */
  private function isInPath($path, $url) {

    // So let's make sure the paths end with a slash. We don't want partial
    // string matches, but we want to know if the directories match.
    $path = $path . '/';
    $url = $url . '/';

    // This is the current page.
    if ($path === $url) {
      return TRUE;
    }

    // The homepage is always part of every URL on the site. NOTE: See above
    // where we add a trailing slash. / will become //.
    if ($path === '//') {
      return TRUE;
    }

    // If the URL is shorter than the path, the URL cannot begin with that
    // path.
    if (strlen($url) < strlen($path)) {
      return FALSE;
    }

    // Let's make the URL string the same length as the path.
    $urlChop = substr($url, 0, strlen($path));

    // If the path is part of the URL, then this should return true.
    return $urlChop === $path;
  }

  /**
   * Helper function to add current/ancestor state to nav based on current url.
   *
   * This modifies the tree in place.
   *
   * @param array $nodes
   *   A list of nodes.
   * @param string $currentPath
   *   The current url/path.
   */
  private function setActivePaths(array &$nodes, $currentPath) {
    // Primary nav is only 1 level deep so we just need to find the one item
    // that is in the active path.
    for ($i = 0; $i < count($nodes); $i++) {

      if ($this->isInPath($nodes[$i]['href'], $currentPath)) {
        if ($nodes[$i]['href'] === $currentPath) {
          $nodes[$i]['navstate'] = 'current';
        }
        else {
          $nodes[$i]['navstate'] = 'ancestor';
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];

    // We are not cached and should render.
    $navItems = $this->getTreeForMainNav();

    $currentUrl = Url::fromRoute('<current>');
    $this->setActivePaths($navItems, $currentUrl->toString());

    $language = $this->languageManager->getCurrentLanguage();
    $build['navitems'] = $navItems;
    $build['site_logo'] = $this->getLogo();
    $build['home_page_title'] = $this->configuration['home_page_title'];
    if (!empty($this->configuration['search_results_page'])) {
      // @todo Wrap this with a try.
      $build['search_results_url'] = Url::fromUri(
        $this->configuration['search_results_page'],
        ['language' => $language]
      );
    }
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
    // @todo Add some way to have a unique id for this block.
    // This will probably through settings since this class does not know the
    // block id that is calling this plugin.
    $cache_tags[] = 'mainnav_manual';
    return $cache_tags;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    return Cache::mergeContexts(
      parent::getCacheContexts(),
      [
        'languages:language_interface',
        'nci_primary_nav_active_path',
      ]
    );
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

  /* **************************************************************************
   *       ___ ___ _____ _____ ___ _  _  ___ ___     ___ ___  ___ __  __
   *      / __| __|_   _|_   _|_ _| \| |/ __/ __|   | __/ _ \| _ \  \/  |
   *      \__ \ _|  | |   | |  | || .` | (_ \__ \   | _| (_) |   / |\/| |
   *      |___/___| |_|   |_| |___|_|\_|\___|___/   |_| \___/|_|_\_|  |_|
   * *************************************************************************/

  /**
   * Gets the URI without the 'internal:' or 'entity:' scheme.
   *
   * The following two forms of URIs are transformed:
   * - 'entity:' URIs: to entity autocomplete ("label (entity id)") strings;
   * - 'internal:' URIs: the scheme is stripped.
   *
   * This method is the inverse of ::getUserEnteredStringAsUri().
   *
   * This method was taken from LinkWidget and moditfied to only support
   * internal links.
   *
   * @param string $uri
   *   The URI to get the displayable string for.
   *
   * @return string
   *   The URI without the scheme.
   *
   * @see static::getUserEnteredStringAsUri()
   */
  protected static function getUriAsDisplayableString($uri) {
    $scheme = parse_url($uri, PHP_URL_SCHEME);

    // By default, the displayable string is the URI.
    $displayable_string = $uri;

    // A different displayable string may be chosen in case of the 'internal:'
    // or 'entity:' built-in schemes.
    if ($scheme === 'internal') {
      $uri_reference = explode(':', $uri, 2)[1];

      // @todo '<front>' is valid input for BC reasons, may be removed by
      //   https://www.drupal.org/node/2421941
      $path = parse_url($uri, PHP_URL_PATH);
      if ($path === '/') {
        $uri_reference = '<front>' . substr($uri_reference, 1);
      }
      $displayable_string = $uri_reference;
    }
    elseif ($scheme === 'entity') {
      [
        $entity_type,
        $entity_id,
      ] = explode('/', substr($uri, 7), 2);

      // Show the 'entity:' URI as the entity autocomplete would.
      // @todo Support entity types other than 'node'. Will be fixed in
      //   https://www.drupal.org/node/2423093.
      if ($entity_type == 'node' && ($entity = \Drupal::entityTypeManager()
        ->getStorage($entity_type)
        ->load($entity_id))) {
        $displayable_string = EntityAutocomplete::getEntityLabels([
          $entity,
        ]);
      }
    }
    elseif ($scheme === 'route') {
      $displayable_string = ltrim($displayable_string, 'route:');
    }
    return $displayable_string;
  }

  /**
   * Gets the user-entered string as a URI.
   *
   * The following two forms of input are mapped to URIs:
   * - entity autocomplete ("label (entity id)") strings: to 'entity:' URIs;
   * - strings without a detectable scheme: to 'internal:' URIs.
   *
   * This method is the inverse of ::getUriAsDisplayableString().
   *
   * This method was taken from LinkWidget and moditfied to only support
   * internal links.
   *
   * @param string $string
   *   The user-entered string.
   *
   * @return string
   *   The URI, if a non-empty $uri was passed.
   *
   * @see static::getUriAsDisplayableString()
   */
  protected static function getUserEnteredStringAsUri($string) {

    // By default, assume the entered string is a URI.
    $uri = trim($string);

    // Detect entity autocomplete string, map to 'entity:' URI.
    $entity_id = EntityAutocomplete::extractEntityIdFromAutocompleteInput($string);
    if ($entity_id !== NULL) {

      // @todo Support entity types other than 'node'. Will be fixed in
      //   https://www.drupal.org/node/2423093.
      $uri = 'entity:node/' . $entity_id;
    }
    elseif (in_array($string, [
      '<nolink>',
      '<none>',
      '<button>',
    ], TRUE)) {
      $uri = 'route:' . $string;
    }
    elseif (!empty($string) && parse_url($string, PHP_URL_SCHEME) === NULL) {

      // @todo '<front>' is valid input for BC reasons, may be removed by
      //   https://www.drupal.org/node/2421941
      // - '<front>' -> '/'
      // - '<front>#foo' -> '/#foo'
      if (strpos($string, '<front>') === 0) {
        $string = '/' . substr($string, strlen('<front>'));
      }
      $uri = 'internal:' . $string;
    }
    return $uri;
  }

  /**
   * Form element validation handler for the 'uri' element.
   *
   * Disallows saving inaccessible or untrusted URLs.
   */
  public static function validateUriElement($element, FormStateInterface $form_state, $form) {
    $uri = static::getUserEnteredStringAsUri($element['#value']);
    $form_state
      ->setValueForElement($element, $uri);

    // So, we don't want anything other than "entity:" as our scheme as that
    // will be a node somone selected.
    if (!empty($uri) && parse_url($uri, PHP_URL_SCHEME) !== 'entity') {
      $form_state
        ->setError($element, t('Please select a page from the autocomplete or leave the Search Results Page field empty'));
    }
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

    // This all is pretty much borrowed from
    // Drupal\link\Plugin\Field\FieldWidget\LinkWidget, which is what is used
    // to drive the entity reference autocomplete. This will allow an admin to
    // select the node and we don't have to do a lot of weird url validation.
    $search_results_page = $this->configuration['search_results_page'];
    $form['header_config']['search_results_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#title' => $this->t('Search Results Page'),
      // The current field value could have been entered by a different user.
      // However, if it is inaccessible to the current user, do not display it
      // to them. (this is from LinkWidget, but we had to tweak to not offend
      // Drupal coding standards.)
      // P.S. How is Core code not passing the Drupal sniffer rules??
      '#default_value' => !empty($search_results_page) && (
          \Drupal::currentUser()->hasPermission('link to any page') ||
          Url::fromUri($search_results_page, [])->access()
      ) ? static::getUriAsDisplayableString($search_results_page) : NULL,
      '#element_validate' => [
        [
          static::class,
          'validateUriElement',
        ],
      ],
      '#size' => 2048,
      '#description' => $this->t('Specify a path to use as the action for the search form. If you are building out an empty site leave this empty until you create the results page.'),
      '#link_type' => LinkItemInterface::LINK_INTERNAL,
      '#process_default_value' => FALSE,
    ];

    $form['header_config']['autosuggest_collection'] = [
      '#type' => 'textfield',
      '#title' => $this->t('The collection name for the autosuggest API.'),
      '#description' => $this->t('This is the name of the collection for the autosuggest API. Leave empty if there is no autosuggest.'),
      '#default_value' => $this->configuration['autosuggest_collection'],
      '#size' => 100,
      '#maxlength' => 1024,
      '#required' => FALSE,
    ];

    return $form;
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

  /* TODO: Add BlockForm to setup the search bits */
  /* I guess we have an English and a Spanish block? */

}
