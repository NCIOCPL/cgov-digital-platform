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
  const DEFAULT_ROLES = ['content_author', 'content_editor', 'advanced_editor'];

  const DEFAULT_PERMISSIONS = [
    'create [content_type] content',
    'delete any [content_type] content',
    'delete own [content_type] content',
    'edit any [content_type] content',
    'edit own [content_type] content',
    'revert [content_type] revisions',
    'translate [content_type] node',
    'view [content_type] revisions',
    // Excluded: 'delete [content_type] revisions'.
  ];

  const MEDIA_PERMISSIONS = [
    'create [content_type] media',
    'delete any [content_type] media',
    'delete own [content_type] media',
    'edit any [content_type] media',
    'edit own [content_type] media',
    'translate [content_type] media',
  ];

  const PROD_ENVIRONMENTS = [
    '01live',
    'prod',
  ];

  const TEST_ENVIRONMENTS = [
    '01test',
    'test',
  ];

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
        'language-url' => "-8",
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
   * @param \Drupal\language\LanguageNegotiatorInterface $negotiator
   *   The language negotiation methods manager.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(
      ConfigFactoryInterface $config_factory,
      LanguageNegotiatorInterface $negotiator,
      EntityTypeManagerInterface $entity_type_manager
    ) {

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
   * Links a content type to a workflow.
   *
   * See https://github.com/NCIOCPL/cgov-digital-platform/issues/127.
   */
  public function attachContentTypeToWorkflow($type_name, $workflow_name) {
    $workflows = $this->entityTypeManager->getStorage('workflow')->loadMultiple();
    $workflow = $workflows[$workflow_name];
    $workflow->getTypePlugin()->addEntityTypeAndBundle('node', $type_name);
    $workflow->save(TRUE);
  }

  /**
   * Links a media type to a workflow.
   *
   * See https://github.com/NCIOCPL/cgov-digital-platform/issues/127.
   */
  public function attachMediaTypeToWorkflow($type_name, $workflow_name) {
    $workflows = $this->entityTypeManager->getStorage('workflow')->loadMultiple();
    $workflow = $workflows[$workflow_name];
    $workflow->getTypePlugin()->addEntityTypeAndBundle('media', $type_name);
    $workflow->save(TRUE);
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

  /**
   * Add Permissions to a role.
   *
   * @param string $type_name
   *   Content type name to be added.
   * @param mixed $roles
   *   Roles to be added, as string or array.
   * @param mixed $permissions
   *   Permissions to be added, as string or array.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException exception.
   *   Expects getStorage to work.
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *   Thrown if the entity type doesn't exist.
   * @throws \Drupal\Core\Entity\EntityStorageException exception
   *   Expects role->save() to work.
   */
  public function addContentTypePermissions($type_name, $roles = self::DEFAULT_ROLES, $permissions = NULL) {
    // Define Common roles and permissions.
    $rolePerms['content_author'] = self::DEFAULT_PERMISSIONS;
    $rolePerms['content_editor'] = [];
    $rolePerms['advanced_editor'] = [];
    $rolePerms['layout_manager'] = self::DEFAULT_PERMISSIONS;

    // Convert $roles string to array if needed.
    if (!is_array($roles)) {
      $roles = [$roles];
    }

    // Get Role entities.
    $role_storage = $this->entityTypeManager->getStorage('user_role');
    $roleObjects = $role_storage->loadMultiple($roles);

    if (count($roleObjects) != count($roles)) {
      // Role not found, display error message.
      echo "Role(s) " . implode(', ', $roles) . " not found in " . __FUNCTION__ . "\n";
    }
    else {
      // Get all role objects.
      foreach ($roleObjects as $role_name => $roleObj) {
        // Get permissions to assign.
        // If permissions are passed as a parameter, use that.
        if ($permissions) {
          // Convert to array if a string.
          if (!is_array($permissions)) {
            $perms = [$permissions];
          }
          else {
            $perms = $permissions;
          }
        }
        else {
          // No permissions passed, get list of permissions to use.
          if (isset($rolePerms[$role_name])) {
            // Get role-specific permissions.
            $perms = $rolePerms[$role_name];
          }
          else {
            // Load default permissions.
            $perms = self::DEFAULT_PERMISSIONS;
          }
        }

        // Update all the permissions.
        foreach ($perms as &$perm) {
          // Replace placeholders.
          $perm = str_replace('[content_type]', $type_name, $perm);

          // Grant Permission.
          $roleObj->grantPermission($perm);
          $roleObj->save();
        }
      }
    }
  }

  /**
   * Add Media Permissions to a role.
   *
   * @param string $type_name
   *   Content type name to be added.
   * @param mixed $roles
   *   Roles to be added, as string or array.
   * @param mixed $permissions
   *   Permissions to be added, as string or array.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException exception.
   *   Expects getStorage to work.
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *   Thrown if the entity type doesn't exist.
   * @throws \Drupal\Core\Entity\EntityStorageException exception
   *   Expects role->save() to work.
   */
  public function addMediaTypePermissions($type_name, $roles = self::DEFAULT_ROLES, $permissions = NULL) {
    // Define Common roles and permissions.
    $rolePerms['content_author'] = self::MEDIA_PERMISSIONS;
    $rolePerms['content_editor'] = [];
    $rolePerms['advanced_editor'] = [];
    $rolePerms['layout_manager'] = self::MEDIA_PERMISSIONS;

    // Convert $roles string to array if needed.
    if (!is_array($roles)) {
      $roles = [$roles];
    }

    // Get Role entities.
    $role_storage = $this->entityTypeManager->getStorage('user_role');
    $roleObjects = $role_storage->loadMultiple($roles);

    if (count($roleObjects) != count($roles)) {
      // Role not found, display error message.
      echo "Role(s) " . implode(', ', $roles) . " not found in " . __FUNCTION__ . "\n";
    }
    else {
      // Get all role objects.
      foreach ($roleObjects as $role_name => $roleObj) {
        // Get permissions to assign.
        // If permissions are passed as a parameter, use that.
        if ($permissions) {
          // Convert to array if a string.
          if (!is_array($permissions)) {
            $perms = [$permissions];
          }
          else {
            $perms = $permissions;
          }
        }
        else {
          // No permissions passed, get list of permissions to use.
          if (isset($rolePerms[$role_name])) {
            // Get role-specific permissions.
            $perms = $rolePerms[$role_name];
          }
          else {
            // Load default permissions.
            $perms = self::MEDIA_PERMISSIONS;
          }
        }

        // Update all the permissions.
        foreach ($perms as &$perm) {
          // Replace placeholders.
          $perm = str_replace('[content_type]', $type_name, $perm);

          // Grant Permission.
          $roleObj->grantPermission($perm);
          $roleObj->save();
        }
      }
    }
  }

  /**
   * Remove [content_type] with passed variable in array of parameters.
   *
   * @param string $content_type
   *   Content type to replace [content_type] tokens.
   * @param array $permissions
   *   Array of strings containing permission names with [content_type] tokens.
   *
   * @return array
   *   Permission strings with [placeholder] replaced.
   */
  public function renameContentTypePermissions(string $content_type, array $permissions) {
    foreach ($permissions as &$perm) {
      $perm = str_replace('[content_type]', $content_type, $perm);
    }
    return $permissions;
  }

  /**
   * Get the raw AH_SITE_ENVIRONMENT global variable.
   *
   * @return string
   *   The name of the environment or empty string if variable is not set.
   */
  public function getAhSiteEnvironment() {
    return $_ENV['AH_SITE_ENVIRONMENT'] ?? '';
  }

  /**
   * Get one of our four tier values.
   *
   * @return string
   *   Returns one of the following: 'prod', 'test', 'dev', 'local'.
   */
  public function getCloudEnvironment() {
    $site_env = strtolower($this->getAhSiteEnvironment());

    // Check if site_env matches a prod environment name...
    if (in_array($site_env, self::PROD_ENVIRONMENTS)) {
      return 'prod';
    }
    // Otherwise, check if site_env matches a test environment name...
    elseif (in_array($site_env, self::TEST_ENVIRONMENTS)) {
      return 'test';
    }
    // Otherwise, check if site_env matches the dev environment regex...
    elseif (preg_match('/^(\d*(int|dev)|(ode)\d*)$/', $site_env)) {
      return 'dev';
    }
    // Finally, return 'local' if the variable is unmatched or empty.
    else {
      return 'local';
    }
  }

  /**
   * Check if this is a production environment.
   *
   * @return bool
   *   TRUE if matches prod environment, FALSE otherwise.
   */
  public function isProd() {
    return $this->getCloudEnvironment() == 'prod';
  }

}
