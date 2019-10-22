<?php

namespace Drupal\app_module\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBase;
use Drupal\Core\Plugin\DefaultSingleLazyPluginCollection;
use Drupal\app_module\AppModuleInterface;

/**
 * Defines the Application Module entity.
 *
 * @ConfigEntityType(
 *   id = "app_module",
 *   label = @Translation("Application Module"),
 *   handlers = {
 *     "list_builder" = "Drupal\app_module\Controller\AppModuleListBuilder",
 *     "form" = {
 *       "add" = "Drupal\app_module\Form\AppModuleForm",
 *       "edit" = "Drupal\app_module\Form\AppModuleForm",
 *       "delete" = "Drupal\app_module\Form\AppModuleDeleteForm",
 *     }
 *   },
 *   config_prefix = "app_module",
 *   admin_permission = "administer app modules",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label",
 *   },
 *   config_export = {
 *     "id",
 *     "label",
 *     "app_module_plugin_id",
 *   },
 *   links = {
 *     "edit-form" = "/admin/config/system/app_module/{app_module}",
 *     "delete-form" = "/admin/config/system/app_module/{app_module}/delete",
 *   }
 * )
 */
class AppModule extends ConfigEntityBase implements AppModuleInterface {

  /**
   * The App Module ID.
   *
   * @var string
   */
  protected $id;

  /**
   * The App Module label.
   *
   * @var string
   */
  protected $label;

  /**
   * The ID of the App Module plugin.
   *
   * @var string
   */
  protected $app_module_plugin_id;

  /**
   * The app module plugin manager.
   *
   * @var \Drupal\Component\Plugin\PluginManagerInterface
   */
  protected $pluginManager;

  /**
   * The application module plugin collection.
   *
   * @var \Drupal\Core\Plugin\DefaultSingleLazyPluginCollection
   */
  protected $appModulePluginCollection;

  /**
   * Gets the app module plugin identifier.
   *
   * @var string
   */
  public function appModulePluginId() {
    return $this->app_module_plugin_id;
  }

  /**
   * {@inheritdoc}
   *
   * NOTE: This makes assumptions that the *will* be a plugin id if it is
   * called. This is a fair assumption given the fact that an AppModule
   * entity cannot be saved if the app module is bogus. So anything that
   * would interact with this method would be interacting with a valid
   * AppModule entity.
   */
  public function getAppModulePlugin() {
    return $this->appModulePluginCollection()->get($this->app_module_plugin_id);
  }

  /**
   * {@inheritdoc}
   */
  public function getPluginCollections() {
    return [
      'app_module' => $this->appModulePluginCollection(),
    ];
  }

  /**
   * Gets the application module lazy plugin collection.
   *
   * This comes from EntityWithPluginCollectionInterface, which
   * is necessary because ConfigEntityBase looks for that interface
   * in order to call this method when calculatingdependencies as well
   * as the presave method to ensure your plugin actually exists. It
   * is also the Drupal best practice for managing plugins in a
   * config. DefaultSingleLazyPluginCollection is the implementation
   * for when you only will have 1 plugin.
   *
   * @return \Drupal\Core\Plugin\DefaultSingleLazyPluginCollection|null
   *   The tag plugin collection or NULL if the plugin ID was not set yet.
   */
  protected function appModulePluginCollection() {
    if (!$this->appModulePluginCollection && $this->app_module_plugin_id) {
      $this->appModulePluginCollection = new DefaultSingleLazyPluginCollection(
        \Drupal::service('plugin.manager.app_module'),
        $this->app_module_plugin_id,
        []
      );
    }
    return $this->appModulePluginCollection;
  }

}
