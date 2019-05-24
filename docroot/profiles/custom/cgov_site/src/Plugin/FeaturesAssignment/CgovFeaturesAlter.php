<?php

namespace Drupal\cgov_site\Plugin\FeaturesAssignment;

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

    // Alter configuration items.
    if ($settings['workflow']) {
      $config_collection = $this->featuresManager->getConfigCollection();
      foreach ($config_collection as &$config) {
        $data = $config->getData();
        // Unset dependencies and type settings on workflow. Doing so
        // facilitates packaging workflow that may have dependencies that
        // relate to multiple packages.
        if ($settings['workflow'] && $config->getType() == 'workflow') {
          // Unset and not empty permissions data to prevent loss of configured
          // workflow dependencies in the event of a feature revert.
          unset($data['dependencies']['config']);
          unset($data['type_settings']['entity_types']);
        }
        $config->setData($data);
      }
      // Clean up the $config pass by reference.
      unset($config);

      // Register the updated data.
      $this->featuresManager->setConfigCollection($config_collection);
    }

  }

}
