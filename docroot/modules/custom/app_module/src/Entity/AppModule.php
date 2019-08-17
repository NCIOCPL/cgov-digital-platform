<?php

namespace Drupal\app_module\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBase;
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
 *   config_prefix = "app",
 *   admin_permission = "administer app modules",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label",
 *   },
 *   config_export = {
 *     "id",
 *     "label",
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
  public $id;

  /**
   * The App Module label.
   *
   * @var string
   */
  public $label;

}
