<?php

namespace Drupal\pdq_glossifier\Plugin\CKEditorPlugin;

use Drupal\ckeditor\CKEditorPluginBase;
use Drupal\editor\Entity\Editor;

/**
 * Defines the "cgov_glossifier" plugin.
 *
 * NOTE: The plugin ID ('id' key) corresponds to the CKEditor plugin name.
 * It is the first argument of the CKEDITOR.plugins.add() function in the
 * plugin.js file.
 *
 * @CKEditorPlugin(
 *   id = "cgov_glossifier",
 *   label = @Translation("Glossify")
 * )
 */
class CgovGlossifier extends CKEditorPluginBase {

  /**
   * {@inheritdoc}
   *
   * NOTE: The keys of the returned array corresponds to the CKEditor button
   * names. They are the first argument of the editor.ui.addButton() or
   * editor.ui.addRichCombo() functions in the plugin.js file.
   */
  public function getButtons() {
    // Make sure that the path to the image matches the file structure of
    // the CKEditor plugin you are implementing.
    // NOTE: It doesn't matter that you can specify custom paths. For the icon
    // to display correctly it needs to be in an icons folder.
    return [
      'Cgov_glossifier' => [
        'label' => t('Glossify'),
        'image' => drupal_get_path('module', 'pdq_glossifier') . '/js/plugins/cgov_glossifier/icons/button.png',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    // Make sure that the path to the plugin.js matches the file structure of
    // the CKEditor plugin you are implementing.
    return drupal_get_path('module', 'pdq_glossifier') . '/js/plugins/cgov_glossifier/plugin.js';
  }

  /**
   * {@inheritdoc}
   */
  public function isInternal() {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getDependencies(Editor $editor) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getLibraries(Editor $editor) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor) {
    return [];
  }

}
