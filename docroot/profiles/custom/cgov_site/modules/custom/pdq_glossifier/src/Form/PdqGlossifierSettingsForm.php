<?php

namespace Drupal\pdq_glossifier\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for PDQ Glossifier settings.
 */
class PdqGlossifierSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['pdq_glossifier.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'pdq_glossifier_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    $config = $this->config('pdq_glossifier.settings');

    /* @todo Add field for global class list */
    $form['definition_classes'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Definition Link Classes'),
      '#description'   => $this->t('Classes to Set on Definition Link. This can be overridden per editor configuration.'),
      '#default_value' => $config->get('definition_classes'),
      '#size'          => 80,
      '#maxlength'     => 250,
      '#states'        => [
        'required' => [
          ':input[name="enabled"]' => ['value' => TRUE],
        ],
      ],
    ];

    $urls_description = '<p>' . $this->t('Enter the URLs for the NCI glossary dictionaries.');
    $urls_description .= '<br/>' . $this->t('Each entry should contain the following information separated by pipe characters (|):');
    $urls_description .= '<ul>';
    $urls_description .= '<li>' . $this->t('A valid glossary API dictionary key') . '</li>';
    $urls_description .= '<li>' . $this->t('A valid glossary API audience') . '</li>';
    $urls_description .= '<li>' . $this->t('A valid glossary API language') . '</li>';
    $urls_description .= '<li>' . $this->t('A url string for the dictionary') . '</li>';
    $urls_description .= '</ul>';
    $urls_description .= '<br/>' . $this->t('Separate each entry with a new line.');
    $urls_description .= '<br/>' . $this->t('See https://webapis.cancer.gov/glossary/v1/index.html#/Terms/Terms_GetById for more details on the specific parameters.');
    $urls_description .= '</p>';

    $form['nci_glossary_dictionary_urls'] = [
      '#type' => 'textarea',
      '#title' => $this->t('NCI Glossary Dictionary URLs'),
      '#description' => $urls_description,
      '#default_value' => $this->configToDictionaryUrlsInput(
        $config->get('nci_glossary_dictionary_urls')
      ),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    /*
     * // Clean text values.
     * $launch_property_build_url = trim(
     *   $form_state->getValue('launch_property_build_url')
     * );
     * $form_state->setValue(
     *  'launch_property_build_url',
     *  $launch_property_build_url
     * );
     */

    $dictionary_url_entries = $this->dictionaryUrlsInputToConfig(
      $form_state->getValue('nci_glossary_dictionary_urls')
    );

    // Check if the URL entries are good.
    foreach ($dictionary_url_entries as $entry) {
      if (count($entry) != 4) {
        $form_state->setErrorByName(
          'nci_glossary_dictionary_urls',
          $this->t('One or more dictionary url entries do not match the correct format.')
        );
        break;
      }
    }

    $dictionary_url_config = array_map(
      fn($entry): array => [
        'dictionary' => $entry[0],
        'audience' => $entry[1],
        'langcode' => $entry[2],
        'formatter' => $entry[3],
      ],
      $dictionary_url_entries
    );
    $form_state->setValue('nci_glossary_dictionary_urls', $dictionary_url_config);

    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('pdq_glossifier.settings');

    $config->set('definition_classes', $form_state->getValue('definition_classes'));
    $config->set('nci_glossary_dictionary_urls', $form_state->getValue('nci_glossary_dictionary_urls'));
    $config->save();

    parent::submitForm($form, $form_state);
  }

  /**
   * Splits up the dictionary url information.
   *
   * @param string $text
   *   The string to clean.
   *
   * @return array
   *   The clean text array.
   */
  protected function dictionaryUrlsInputToConfig($text) {
    // Split the lines.
    // Trim extra spaces.
    // Remove any row that is just spaces.
    $rows = array_filter(
        array_map('trim', explode("\n", $text)
      ), 'trim');

    // Convert each row into the individual keys.
    $rows = array_map(
      fn($entry): array => array_filter(
          array_map('trim', explode("|", $entry)
        ), 'trim'),
      $rows
    );
    return $rows;
  }

  /**
   * Implodes a given list of items into a string.
   *
   * @param array $items
   *   The array with list of items.
   *
   * @return string
   *   The imploded list of items as a string.
   */
  protected function configToDictionaryUrlsInput(array $items) {
    if ($items === NULL) {
      return '';
    }

    $entries = array_map(
      fn($item): string => implode('|', [
        $item['dictionary'], $item['audience'], $item['langcode'], $item['formatter'],
      ]),
      $items
    );

    return implode("\n", $entries);
  }

}
