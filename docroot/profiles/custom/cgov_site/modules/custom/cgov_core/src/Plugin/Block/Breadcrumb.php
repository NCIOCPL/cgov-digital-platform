<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Provides a 'Breadcrumb' block.
 *
 * @Block(
 *  id = "cgov_breadcrumb",
 *  admin_label = @Translation("Cgov Breadcrumb"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class Breadcrumb extends BlockBase implements ContainerFactoryPluginInterface {

  protected $breadcrumbs = [];

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManagerInterface
   */
  protected $navigationManager;

  /**
   * Constructs an LanguageBar object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_core\Services\CgovNavigationManagerInterface $navigationManager
   *   Cgov navigation service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManagerInterface $navigationManager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->navigationManager = $navigationManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.cgov_navigation_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    return AccessResult::allowed();
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#type' => 'block',
      'breadcrumbs' => $this->breadcrumbs,
    ];

    return $build;
  }

}
