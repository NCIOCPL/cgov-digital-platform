<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Extension\ModuleHandler;

/**
 * Provides a 'Main Nav' block.
 *
 * @Block(
 *  id = "cgov_main_nav",
 *  admin_label = @Translation("Cgov Main Nav"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class MainNav extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * Core language manager service.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandler
   */
  protected $moduleHandler;

  /**
   * Is the Akamai module enabled?
   *
   * @var bool
   */
  protected $akamaiIsEnabled;

  /**
   * Constructs an LanguageBar object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navigationManager
   *   Cgov navigation service.
   * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
   *   Core language manager.
   * @param \Drupal\Core\Extension\ModuleHandler $moduleHandler
   *   Core module handler.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManager $navigationManager,
    LanguageManagerInterface $languageManager,
    ModuleHandler $moduleHandler
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->navMgr = $navigationManager;
    $this->moduleHandler = $moduleHandler;
    $this->languageManager = $languageManager;

    $this->akamaiIsEnabled = FALSE;
    if ($this->moduleHandler->moduleExists('akamai')) {
      $this->akamaiIsEnabled = TRUE;
    }
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
      $container->get('module_handler')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    $shouldDisplay = $this->navMgr->getCurrentPathIsInNavigationTree();
    if ($shouldDisplay) {
      return AccessResult::allowed();
    }
    return AccessResult::forbidden();
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    // If the Akamai module is enabled, we want to output an ESI tag and use
    // the CDN's "Edge Side Includes" capability to insert the navigation.
    if ($this->akamaiIsEnabled) {

      $langCode = $this->languageManager->getCurrentLanguage()->getId();
      switch ($langCode) {
        case 'es':
          $langPath = 'espanol/';
          break;

        case 'en':
        default:
          $langPath = '';
      }

      $build = [
        'ESI' => 'ON',
        'block_id' => $this->configuration['id'],
        'lang_path' => $langPath,
      ];
    }
    else {
      // Using dependency injection would be preferable, however the service
      // will not be called from here in production, so there's no sense
      // incurring the overhead of creating/injecting it here.
      $svc = \Drupal::service('cgov_core.navigation_block');
      $navTree = $svc->getNavigationBlock('cgov_main_nav');
      $build = [
        '#markup' => $navTree,
      ];
    }
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {

    if ($this->akamaiIsEnabled) {
      return parent::getCacheMaxAge();
    }
    else {
      return 0;
    }
  }

}
