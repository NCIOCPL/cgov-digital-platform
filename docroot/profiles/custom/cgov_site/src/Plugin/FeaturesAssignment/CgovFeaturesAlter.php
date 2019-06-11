<?php

namespace Drupal\cgov_site\Plugin\FeaturesAssignment;

use Drupal\features\ConfigurationItem;
use Drupal\features\FeaturesAssignmentMethodBase;

/**
 * Class for excluding configuration from packages.
 *
 * @Plugin(
 *   id = "cgov_alter",
 *   weight = 0,
 *   name = @Translation("CGov Alter"),
 *   description = @Translation("Alter configuration items before they are exported. Altering includes options such as removing dependencies from workflow."),
 *   config_route_name = "cgov_site.cgov_assignment_alter",
 *   default_settings = {
 *     "workflow" = TRUE,
 *   }
 * )
 */
class CgovFeaturesAlter extends FeaturesAssignmentMethodBase {

  /**
   * {@inheritdoc}
   */
  public function assignPackages($force = FALSE) {
    $current_bundle = $this->assigner->getBundle();
    $settings = $current_bundle->getAssignmentSettings($this->getPluginId());

    $alterWorkflow = $settings['workflow'];
    $alterSamlLogin = $settings['saml'];

    // Loop through the full set of configuration items.
    $config_collection = $this->featuresManager->getConfigCollection();
    foreach ($config_collection as &$config) {

      // Check for workflow config items.
      if ($alterWorkflow && $config->getType() == 'workflow') {
        $this->alterWorkflowConfig($config);
      }
      // Clean up form display.
      elseif ($alterWorkflow && $config->getType() == 'entity_form_display') {
        $this->alterFormDisplay($config);
      }
      // Check for simple SAML config.
      elseif ($alterSamlLogin && $config->getName() == 'simplesamlphp_auth.settings') {
        $this->alterSimpleSamlConfig($config);
      }
    }
    // Clean up the $config pass by reference.
    unset($config);

    // Register the updated data.
    $this->featuresManager->setConfigCollection($config_collection);

  }

  /**
   * Unsets dependencies and type settings on workflow.
   *
   * This facilitates packaging workflows that may have dependencies which
   * relate to multiple packages and prevents loss of configured workflow
   * dependencies in the event of a feature revert.
   *
   * @param Drupal\features\ConfigurationItem $config
   *   A workflow configuration item.
   */
  private function alterWorkflowConfig(ConfigurationItem $config) {
    $data = $config->getData();
    unset($data['dependencies']['config']);
    unset($data['type_settings']['entity_types']);
    $config->setData($data);
  }

  /**
   * Unsets workflow dependencies on entity_form_display configs.
   *
   * This is related to the cleanup for alterWorkflowConfig().
   *
   * @param Drupal\features\ConfigurationItem $config
   *   A workflow configuration item.
   */
  private function alterFormDisplay(ConfigurationItem $config) {
    $data = $config->getData();
    $data['dependencies']['config'] = $this->removeDependencyMatch($data['dependencies']['config'], 'workflows');
    $config->setData($data);
  }

  /**
   * Alter configuration settings for simplesamlphp_auth.
   *
   * Prevents the list of users allowed to use local login
   * from being imported/exported.
   *
   * @param Drupal\features\ConfigurationItem $config
   *   The simplesamlphp_auth configuration item.
   */
  private function alterSimpleSamlConfig(ConfigurationItem $config) {
    $data = $config->getData();
    $data['allow']['default_login_users'] = NULL;
    $config->setData($data);
  }

  /**
   * Helper function to remove dependencies from configs based on a match.
   *
   * @param array $dependencies
   *   Array of dependencies 'config' or 'module'.
   * @param string $toRemove
   *   String to match dependencies on. Checks for instances of string anywhere
   *   in config.
   *
   * @return array
   *   Returns altered list of dependencies.
   */
  protected function removeDependencyMatch(array $dependencies, $toRemove) {
    if (empty($dependencies)) {
      return $dependencies;
    }
    $alteredDependencies = $dependencies;

    foreach ($dependencies as $key => $value) {
      if (strpos($value, $toRemove) !== FALSE) {
        unset($alteredDependencies[$key]);
      }
    }

    return $alteredDependencies;
  }

}
