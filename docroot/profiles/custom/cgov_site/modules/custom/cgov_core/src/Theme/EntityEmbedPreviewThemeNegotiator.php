<?php

namespace Drupal\cgov_core\Theme;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Theme\ThemeNegotiatorInterface;

/**
 * Class EntityEmbedPreviewThemeNegotiator.
 *
 * Provides a theme negotiator to force the theme used for entity embed
 * previews to the admin theme. This is how the entity embed module operated
 * previous to the change implemented in https://drupal.org/i/2844822. (
 * See comment #65)
 *
 * This site was built when the admin theme was used to render the previews,
 * which allowed us to provide specific templates for the previews for the
 * admin theme. This allowed us to create more reasonable representations of
 * certain media types, like slideshows.
 *
 * When embed previews are rendered using the front-end theme, all sorts of
 * things break for us. This fixes that.
 */
class EntityEmbedPreviewThemeNegotiator implements ThemeNegotiatorInterface {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $user;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Creates a new AdminNegotiator instance.
   *
   * @param \Drupal\Core\Session\AccountInterface $user
   *   The current user.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(AccountInterface $user, ConfigFactoryInterface $config_factory, EntityTypeManagerInterface $entity_type_manager) {
    $this->user = $user;
    $this->configFactory = $config_factory;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function applies(RouteMatchInterface $route_match) {
    return ($route_match->getRouteName() === 'entity_embed.preview' && $this->entityTypeManager->hasHandler('user_role', 'storage') && $this->user->hasPermission('view the administration theme'));
  }

  /**
   * {@inheritdoc}
   */
  public function determineActiveTheme(RouteMatchInterface $route_match) {
    return $this->configFactory->get('system.theme')->get('admin');
  }

}
