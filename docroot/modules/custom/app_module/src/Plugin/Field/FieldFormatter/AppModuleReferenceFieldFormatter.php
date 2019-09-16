<?php

namespace Drupal\app_module\Plugin\Field\FieldFormatter;

use Drupal\app_module\Entity\AppModule;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;

/**
 * Field formatter for AppModuleReference Field.
 *
 * @FieldFormatter(
 *   id = "app_module_reference_formatter",
 *   label = @Translation("App module reference"),
 *   field_types = {"app_module_reference"}
 * )
 */
class AppModuleReferenceFieldFormatter extends FormatterBase {

  /* SETTINGS
   * For now we do not need defaultSettings(), settingsSummary() nor
   * settingsForm() because we do not have any settings.
   */

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    foreach ($items as $delta => $item) {
      $app_id = $item->getValue()['target_id'];
      // TODO: Use app module settings handler to deserialize.
      // $data = $item->getValue()['data'];
      $app_module = AppModule::load($app_id);

      // Add an extra check because the app module could have been deleted.
      if (!is_object($app_module)) {
        continue;
      }

      /*
       * We need to do the following here:
       * 1. Tell the App Module's controller handler to fire
       *    * This should pass in this instance's data
       * 2. Then call the App Module's display handler to render
       *    the results.
       *    * This should pass in this instance's data
       * 3. We then return the build objject from the display
       *    handler.
       */
      $plugin = $app_module->getAppModulePlugin();
      $elements[$delta]['contents'] = [
        '#markup' => "<div>App Module: " . $plugin->pluginTitle() . " </div>",
      ];
    }

    return $elements;
  }

}
