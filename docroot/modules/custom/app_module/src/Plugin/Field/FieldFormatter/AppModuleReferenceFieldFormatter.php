<?php

namespace Drupal\app_module\Plugin\Field\FieldFormatter;

use Drupal\app_module\Entity\AppModule;
use Drupal\app_module\AppModuleRenderArrayBuilderInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Field formatter for AppModuleReference Field.
 *
 * @FieldFormatter(
 *   id = "app_module_reference_formatter",
 *   label = @Translation("App module reference"),
 *   field_types = {"app_module_reference"}
 * )
 */
class AppModuleReferenceFieldFormatter extends FormatterBase implements ContainerFactoryPluginInterface {

  /**
   * The App module render array builder.
   *
   * @var \Drupal\app_module\AppModuleRenderArrayBuilderInterface
   */
  private $appModuleBuilder;

  /**
   * Constructs a AppModuleReferenceFieldFormatter instance.
   *
   * @param string $plugin_id
   *   The plugin_id for the formatter.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the formatter is associated.
   * @param array $settings
   *   The formatter settings.
   * @param string $label
   *   The formatter label display setting.
   * @param string $view_mode
   *   The view mode.
   * @param array $third_party_settings
   *   Any third party settings settings.
   * @param \Drupal\app_module\AppModuleRenderArrayBuilderInterface $app_module_builder
   *   The app module render array builder service.
   */
  public function __construct(
    $plugin_id,
    $plugin_definition,
    FieldDefinitionInterface $field_definition,
    array $settings,
    $label,
    $view_mode,
    array $third_party_settings,
    AppModuleRenderArrayBuilderInterface $app_module_builder
  ) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings);
    $this->appModuleBuilder = $app_module_builder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      $container->get('app_module.builder')
    );
  }

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
      $app_instance_options = $item->getValue()['data'] ?: [];

      // TODO: Use app module settings handler to deserialize.
      // $data = $item->getValue()['data'];
      $app_module = AppModule::load($app_id);

      // Add an extra check because the app module could have been deleted.
      if (!is_object($app_module)) {
        continue;
      }

      // Call the builder to get the app_module render array for this instance.
      $elements[$delta] = $this->appModuleBuilder->build($app_module, $app_instance_options);

    }

    return $elements;
  }

}
