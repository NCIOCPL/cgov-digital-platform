<?php

namespace Drupal\cgov_syndication\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Advanced widget for metatag field.
 *
 * @FieldWidget(
 *   id = "cgov_syndication_widget",
 *   label = @Translation("HHS Syndication"),
 *   field_types = {
 *     "hhs_syndication"
 *   }
 * )
 */
class CgovSyndicationWidget extends WidgetBase implements ContainerFactoryPluginInterface {

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
    $item = $items[$delta];
    $open = $item->syndicate || !empty($item->keywords);
    $element += [
      '#type' => 'details',
      '#collapsible' => TRUE,
      '#open' => $open ? 1 : 0,
      '#group' => 'advanced',
    ];
    $element['syndicate'] = [
      '#type' => 'checkbox',
      '#default_value' => !empty($item->syndicate),
      '#title' => $this->t('Include in Syndication'),
    ];
    $element['keywords'] = [
      '#type' => 'textfield',
      '#default_value' => $item->keywords ?? '',
      '#title' => 'Keywords',
      '#description' => $this->t('Separate keywords with commas'),
    ];

    return $element;
  }

}
