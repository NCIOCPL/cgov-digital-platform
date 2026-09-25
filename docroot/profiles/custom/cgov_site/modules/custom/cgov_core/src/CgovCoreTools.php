<?php

namespace Drupal\cgov_core;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\language\LanguageNegotiatorInterface;

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

  // Note: The new Block Content permissions in D10 do not have the "own"
  // set of permissions.
  const BLOCK_CONTENT_PERMISSIONS = [
    'create [content_type] block content',
    'delete any [content_type] block content',
    'edit any [content_type] block content',
    'revert any [content_type] block content revisions',
    'view any [content_type] block content history',
    'translate block_content',
    // Excluded: 'delete any [content_type] block content revisions'.
  ];

  const PROD_AH_SITE_ENVS = [
    'prod',
  ];

  const TEST_AH_SITE_ENVS = [
    'stage',
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
    EntityTypeManagerInterface $entity_type_manager,
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
   * Set NCI as default site Branding.
   */
  public function setDefaultSiteBranding() {
    $config_site = $this->configFactory->getEditable('sitebranding.settings');
    $config_site->set('browser_display_type', 'default');
    $config_site->set('custom_site_title_value', '');
    $config_site->save();
  }

  /**
   * Set default search result sitename.
   */
  public function setDefaultSiteBrandingForSchemaOrg() {
    $config_site = $this->configFactory->getEditable('sitebranding.settings');
    $config_site->set('sitename_display_type', 'default');
    $config_site->set('custom_site_name', '');
    $config_site->save();
  }

  /**
   * Links a media type to a workflow.
   *
   * See https://github.com/NCIOCPL/cgov-digital-platform/issues/127.
   */
  public function attachMediaTypeToWorkflow(string $type_name, string $workflow_name) {
    $workflows = $this->entityTypeManager->getStorage('workflow')->loadMultiple();
    $workflow = $workflows[$workflow_name];
    // Stupid "extra variable" hack to make phpstan happy.
    /** @var \Drupal\content_moderation\Plugin\WorkflowType\ContentModerationInterface */
    $type_plugin = $workflow->getTypePlugin();
    $type_plugin->addEntityTypeAndBundle('media', $type_name);
    $workflow->save();
  }

  /**
   * Links a block content type to a workflow.
   *
   * See https://github.com/NCIOCPL/cgov-digital-platform/issues/1732.
   */
  public function attachBlockContentTypeToWorkflow($type_name, $workflow_name) {
    $workflows = $this->entityTypeManager->getStorage('workflow')->loadMultiple();
    $workflow = $workflows[$workflow_name];
    // Stupid "extra variable" hack to make phpstan happy.
    /** @var \Drupal\content_moderation\Plugin\WorkflowType\ContentModerationInterface */
    $type_plugin = $workflow->getTypePlugin();
    $type_plugin->addEntityTypeAndBundle('block_content', $type_name);
    $workflow->save();
  }

  /**
   * Creates a new role.
   *
   * Roles cannot be managed by features because we do not store permissions
   * in the yml configs, but use addRolePermissions. Imports of roles wipe
   * out the permissions. Call this from your install_hook.
   *
   * NOTE: This defaults to creating non-admin roles.
   *
   * @param string $id
   *   The machine name of the role.
   * @param string $label
   *   The label for the role.
   * @param int $weight
   *   The weight for the role, whatever that may mean?
   *
   * @throws \Drupal\Core\Entity\EntityStorageException exception
   *   Expects role->save() to work.
   */
  public function addRole($id, $label, $weight) {
    $role_storage = $this->entityTypeManager->getStorage('user_role');
    $role = $role_storage->create([
      'id' => $id,
      'label' => $label,
      'weight' => $weight,
    ]);
    $role->save();
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
   * Remove Permissions from a role.
   *
   * @param array $rolePermissions
   *   Array of [ RoleID => [ PermissionsList ] ] of permissions to remove.
   *
   * @throws \Drupal\Core\Entity\EntityStorageException exception
   *   Expects role->save() to work.
   */
  public function removeRolePermissions(array $rolePermissions) {
    // Get Role entities.
    $role_storage = $this->entityTypeManager->getStorage('user_role');
    $roles = $role_storage->loadMultiple(array_keys($rolePermissions));

    foreach ($rolePermissions as $roleId => $permissionId) {
      foreach ($permissionId as $perm) {
        $roles[$roleId]->revokePermission($perm);
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
   * Add Block Content Permissions to a role.
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
  public function addBlockContentTypePermissions($type_name, $roles = self::DEFAULT_ROLES, $permissions = NULL) {
    // Define Common roles and permissions.
    $rolePerms['content_author'] = [];
    $rolePerms['content_editor'] = [];
    $rolePerms['advanced_editor'] = self::BLOCK_CONTENT_PERMISSIONS;
    $rolePerms['layout_manager'] = [];

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
            $perms = self::BLOCK_CONTENT_PERMISSIONS;
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
    // Null coalescing is to prevent deprecations warning in tests.
    $site_env = strtolower($this->getAhSiteEnvironment() ?? '');

    // Check if site_env matches a prod environment name...
    if (in_array($site_env, self::PROD_AH_SITE_ENVS) ||
      preg_match('/^.*(www-prod-acsf|www-cms).*$/', $site_env)) {
      return CgovEnvironments::PROD;
    }
    // Otherwise, check if site_env matches a test environment name...
    elseif (in_array($site_env, self::TEST_AH_SITE_ENVS)) {
      return CgovEnvironments::TEST;
    }
    // Otherwise, check if site_env matches the dev environment regex...
    elseif (preg_match('/^(\d*(int|dev)|(ode)\d*)$/', $site_env)) {
      return CgovEnvironments::DEV;
    }
    // Finally, return 'local' if the variable is unmatched or empty.
    else {
      return CgovEnvironments::LOCAL;
    }
  }

  /**
   * Check if this is a production environment.
   *
   * @return bool
   *   TRUE if matches prod environment, FALSE otherwise.
   */
  public function isProd() {
    return $this->getCloudEnvironment() == CgovEnvironments::PROD;
  }

  /**
   * Returns an AccessResult for a Entity Reference Field for Filtering.
   *
   * We have a lot of paragraph entities that have an Entity Reference
   * Field that points to a content item and some override fields
   * (title, description, etc) to override the content item's fields
   * when rendering. (e.g. List Items, Related resources, Cards, etc)
   *
   * The access checks will correctly filter out unpublished content
   * items from displaying to anonymous users. However, for these paragraphs
   * that just results in an empty element being displayed. In many cases
   * the template for the paragraph does not generate any markup if there
   * is no content item. However, this can still result in field labels
   * and containers being displayed because the field containing the
   * paragraphs still has entities to display, they are just empty.
   *
   * This helper function can be used within a hook_paragraph_access function
   * to "bubble" up an AccessResult for the content item entity field.
   *
   * NOTE: This should only be done for "view" operations.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The entity to check (should be the paragraph).
   * @param string $field_name
   *   The name of the field that contains the content item.
   *
   * @return \Drupal\Core\Access\AccessResult
   *   The bubbled access.
   */
  public function filterAccessForDependantEntity(ContentEntityInterface $entity, $field_name) {
    if (!$entity->hasField($field_name)) {
      throw new \Exception($field_name . " does not exist on entity");
    }

    $dependant = $entity->get($field_name)->entity;

    // There is no entity in this field.
    if (!$dependant) {
      return AccessResult::forbidden("Non-existant dependant");
    }

    // Gets the dependant's AccessResult. This access check was lifted from
    // EntityReferenceFormatterBase, and is the same check call that would
    // hide the content item.
    /** @var \Drupal\Core\Access\AccessResult */
    $access_result = $dependant->access('view', NULL, TRUE);

    if ($access_result->isAllowed()) {
      // If we are allowed to see the node, then we do not want to influence
      // any access checks.
      return AccessResult::neutral();
    }

    // Setup a forbidden result and copy over caching info for
    // the links.
    $new_res = AccessResult::forbidden("Forbidden list item");
    $new_res->setCacheMaxAge($access_result->getCacheMaxAge());
    $new_res->addCacheTags($access_result->getCacheTags());
    $new_res->addCacheContexts($access_result->getCacheContexts());

    return $new_res;
  }

  /**
   * Get the base URL for the active site's production tier.
   *
   * @todo Add support for other sites.
   */
  public function getProdUrl() {
    return 'https://www.cancer.gov';
  }

  /**
   * Custom edit page submit handler for our media types.
   *
   * This overrides the behavior of core's content_moderation module and forces
   * the form submission to redirect to the media listing page instead of the
   * individual item's latest revision form.
   *
   * @param array $form
   *   An associative array containthe structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public static function mediaFormSubmitter(array &$form, FormStateInterface $form_state) {
    if ($redirect = $form_state->getRedirect()) {
      if ($redirect->getRouteName() === 'entity.media.latest_version') {
        // This could probably be declared as a MediaForm, but the lower-level
        // interface seems the better practice.
        /** @var \Drupal\Core\Entity\EntityFormInterface */
        $form_object = $form_state->getFormObject();
        /** @var \Drupal\Core\Entity\ContentEntityInterface $entity */
        $entity = $form_object->getEntity();
        $entity_type_id = $entity->getEntityTypeId();
        $form_state->setRedirect("entity.$entity_type_id.collection", [$entity_type_id => $entity->id()]);
      }
    }
  }

  /**
   * Revokes block content type permissions for specified roles.
   *
   * @param string $bundle
   *   The block content type machine name.
   * @param array $roles
   *   An array of role IDs to revoke permissions from.
   *
   * @throws \Exception
   */
  public static function revokeBlockContentTypePermissions(string $bundle, array $roles = ['advanced_editor']): void {
    $perms = self::BLOCK_CONTENT_PERMISSIONS;
    $permissions_to_revoke = [];

    foreach ($perms as $perm) {
      if (str_contains($perm, '[content_type]')) {
        $permissions_to_revoke[] = str_replace('[content_type]', $bundle, $perm);
      }
    }

    if (!empty($permissions_to_revoke)) {
      foreach ($roles as $role_id) {
        user_role_revoke_permissions($role_id, $permissions_to_revoke);
      }
    }
  }

  /**
   * Completely purges block content type, its content, placements, and config.
   *
   * @param string $bundle
   *   The block content type machine name.
   * @param array $roles
   *   Roles from which to revoke permissions.
   *
   * @throws \Exception
   *   Throws an exception if a critical deletion step fails.
   */
  public static function purgeBlockContentBundle(string $bundle, array $roles = ['advanced_editor']): void {
    $database = \Drupal::database();
    $entity_type_manager = \Drupal::entityTypeManager();
    $config_factory = \Drupal::configFactory();

    // 1. Delete all block content entities cleanly via Entity Storage.
    try {
      $block_storage = $entity_type_manager->getStorage('block_content');
      $block_ids = $block_storage->getQuery()
        ->accessCheck(FALSE)
        ->condition('type', $bundle)
        ->execute();

      if (!empty($block_ids)) {
        $blocks = $block_storage->loadMultiple($block_ids);
        $block_storage->delete($blocks);
      }
    }
    catch (\Throwable $e) {
      \Drupal::logger('cgov_core_tools')->warning("Entity API delete fallback for $bundle: " . $e->getMessage());
    }

    // 2. Clean up any lingering DB records / revisions (Fallback).
    $targets = $database->select('block_content', 'b')
      ->fields('b', ['id', 'uuid'])
      ->condition('type', $bundle)
      ->execute()
      ->fetchAllKeyed(0, 1);

    if (!empty($targets)) {
      $target_ids = array_keys($targets);
      $uuids = array_values($targets);

      // Fallback placement cleanup using the required UUID format.
      $placed_block_storage = $entity_type_manager->getStorage('block');
      foreach ($uuids as $uuid) {
        $placed_blocks = $placed_block_storage->loadByProperties(['plugin' => 'block_content:' . $uuid]);
        if (!empty($placed_blocks)) {
          $placed_block_storage->delete($placed_blocks);
        }
      }

      // Purge the raw database records.
      $database->delete('block_content')->condition('id', $target_ids, 'IN')->execute();
      $database->delete('block_content_field_data')->condition('id', $target_ids, 'IN')->execute();
      $database->delete('block_content_revision')->condition('id', $target_ids, 'IN')->execute();
      $database->delete('block_content_field_revision')->condition('id', $target_ids, 'IN')->execute();
    }

    $tables = $database->schema()->findTables('block_content__field_%');
    foreach ($tables as $table) {
      $database->delete($table)->condition('bundle', $bundle)->execute();
    }
    $revision_tables = $database->schema()->findTables('block_content_revision__field_%');
    foreach ($revision_tables as $table) {
      $database->delete($table)->condition('bundle', $bundle)->execute();
    }

    // 3. Delete all related configuration directly via ConfigFactory.
    $config_prefixes = [
      "core.entity_view_display.block_content.{$bundle}",
      "core.entity_form_display.block_content.{$bundle}",
      "field.field.block_content.{$bundle}",
    ];

    foreach ($config_prefixes as $prefix) {
      $matching_configs = $config_factory->listAll($prefix);
      foreach ($matching_configs as $config_name) {
        $config_factory->getEditable($config_name)->delete();
      }
    }

    // 4. Delete the Block Content Type bundle config
    // directly via ConfigFactory.
    // (Bypassing $bundle_entity->delete() prevents
    // MissingBundleException in field_purge_batch
    // when multiple bundles are deleted before the
    // post_update field map scrub runs).
    $bundle_config = $config_factory->getEditable("block_content.type.{$bundle}");
    if (!$bundle_config->isNew()) {
      $bundle_config->delete();
    }

    // 5. Revoke Permissions (using the other method we just added).
    self::revokeBlockContentTypePermissions($bundle, $roles);

    // 6. Clear entity and bundle definition caches.
    $entity_type_manager->clearCachedDefinitions();
    \Drupal::service('entity_type.bundle.info')->clearCachedBundles();
  }

  /**
   * Removes a bundle's references from an entity type's field map.
   *
   * @param string $entity_type
   *   The entity type ID (e.g., 'block_content').
   * @param string $bundle
   *   The bundle machine name to purge.
   */
  public static function purgeBundleFromFieldMap(string $entity_type, string $bundle): void {
    $key_value = \Drupal::keyValue('entity.definitions.bundle_field_map');
    $map = $key_value->get($entity_type);

    if (is_array($map)) {
      $changed = FALSE;

      foreach ($map as $field_name => &$field_info) {
        if (isset($field_info['bundles'][$bundle])) {
          unset($field_info['bundles'][$bundle]);
          $changed = TRUE;
        }

        if (empty($field_info['bundles'])) {
          unset($map[$field_name]);
          $changed = TRUE;
        }
      }

      if ($changed) {
        $key_value->set($entity_type, $map);
      }
    }

    // Clear the cached field definitions so Views and the UI pick up the fix.
    \Drupal::service('entity_field.manager')->clearCachedFieldDefinitions();
  }

}
