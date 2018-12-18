<?php

namespace Drupal\cgov_core;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\language\LanguageNegotiatorInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Helper service for various cgov installation tasks.
 *
 * @package Drupal\cgov_core
 */
class CgovCoreTools {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The language negotiator.
   *
   * @var \Drupal\language\LanguageNegotiatorInterface
   */
  protected $negotiator;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Our Language Negotiation settings.
   *
   * This would normally be in language.types.yml, but due to
   *   https://www.drupal.org/project/drupal/issues/2666998 it cannot be
   *   imported.
   *
   * @var array
   */
  private $cgovLangTypes = [
    'language_interface' => [
      'enabled' => [
        'language-user-admin' => "-10",
        'language-selected' => "12",
      ],
      'method_weights' => [
        'language-user-admin' => "-10",
        'language-url' => "-8",
        'language-session' => "-4",
        'language-user' => "-4",
        'language-browser' => "-2",
        'language-selected' => "12",
      ],
    ],
    'language_content' => [
      'enabled' => [
        'language-url' => "-8",
        'language-selected' => "12",
      ],
      'method_weights' => [
        'language-content-entity' => "-9",
        'language-url' => "-8",
        'language-session' => "-4",
        'language-user' => "-4",
        'language-browser' => "-2",
        'language-interface' => "9",
        'language-selected' => "12",
      ],
    ],
  ];

  /**

   * Constructs a CgovCoreTools object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\language\LanguageNegotiatorInterface $negotiator
   *   The language negotiation methods manager.
   */
  public function __construct(ConfigFactoryInterface $config_factory, EntityTypeManagerInterface $entity_type_manager, LanguageNegotiatorInterface $negotiator) {
    $this->negotiator = $negotiator;
    $this->configFactory = $config_factory;
    $this->entityTypeManager = $entity_type_manager;

  }

  /**
   * Installs language types configuration until it is fixed in core.
   *
   * See https://www.drupal.org/project/drupal/issues/2666998 .
   */
  public function installLanguageNegotiation() {

    // Gets editable types config. Only used for *some* config changes.
    $typesConfig = $this->configFactory->getEditable('language.types');

    // Set the method weights for each negotiation type.
    foreach ($this->cgovLangTypes as $type => $typeConf) {
      $typesConfig->set(
        'negotiation.' . $type . '.method_weights',
        $typeConf['method_weights']
      )->save();
    }

    // Updates the configuration based on the given language types.
    $this->negotiator->updateConfiguration(array_keys($this->cgovLangTypes));

    // Set the enabled methods.
    foreach ($this->cgovLangTypes as $type => $typeConf) {
      $this->negotiator->saveConfiguration(
        $type,
        $typeConf['enabled']
      );
    }
  }

  /**
   * Add Permissions to a role.
   *
   * @param array $rolePermissions
   *   Array of [ RoleID => [ PermissionsList ] ] of permissions to add.
   *
   * @throws \Drupal\Core\Entity\EntityStorageException exception
   *   Expects role->save() to work.
   */
  public function addRolePermissions(array $rolePermissions) {
    // Get Role entities.
    $role_storage = $this->entityTypeManager->getStorage('user_role');
    $roles = $role_storage->loadMultiple(array_keys($rolePermissions));

    // Add all permissions.
    foreach ($rolePermissions as $roleId => $permissionId) {
      foreach ($permissionId as $perm) {
        $roles[$roleId]->grantPermission($perm);
      }
      $roles[$roleId]->save();
    }

  }

}
