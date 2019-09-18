<?php

namespace Drupal\cgov_schema_org\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Advanced widget for schema.org field.
 *
 * @FieldWidget(
 *   id = "cgov_schema_org_widget",
 *   label = @Translation("Schema.org Data"),
 *   field_types = {
 *     "schema_org_data"
 *   }
 * )
 */
class CgovSchemaOrgWidget extends WidgetBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings']
    );
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(
      FieldItemListInterface $items,
      $delta,
      array $element,
      array &$form,
      FormStateInterface $form_state
  ) {
    $page_types = [
      'faq_page',
    ];
    $item = $items[$delta];
    $open = in_array($item->page_itemtype, $page_types) ? 1 : 0;
    $element += [
      '#type' => 'details',
      '#collapsible' => TRUE,
      '#open' => $open ? 1 : 0,
      '#group' => 'advanced',
    ];
    $element['page_itemtype'] = [
      '#type' => 'select',
      '#title' => 'Page Type',
      '#options' => [
        'web_page' => $this
          ->t('Webpage'),
        'faq_page' => $this
          ->t('FAQ'),
      ],
      '#default_value' => !empty($item->page_itemtype) ? $item->page_itemtype : 'web_page',
      '#description' => $this->t('Default set to Webpage. FAQ used only for questions and answers to be eligible for a Google FAQ rich result.'),
    ];

    return $element;
  }

}
