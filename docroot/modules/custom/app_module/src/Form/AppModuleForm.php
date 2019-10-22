<?php

namespace Drupal\app_module\Form;

use Drupal\app_module\Plugin\AppModulePluginManager;
use Drupal\Core\Entity\EntityForm;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form handler for the Application module add and edit forms.
 */
class AppModuleForm extends EntityForm {

  /**
   * The Application Module plugin manager.
   *
   * @var \Drupal\app_module\Plugin\AppModulePluginManager
   */
  protected $pluginManager;

  /**
   * Constructs an AppModuleForm object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entityTypeManager.
   * @param \Drupal\app_module\Plugin\AppModulePluginManager $pluginManager
   *   The Application Module plugin manager.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager, AppModulePluginManager $pluginManager) {
    $this->entityTypeManager = $entityTypeManager;
    $this->pluginManager = $pluginManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('plugin.manager.app_module')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);

    $app_module = $this->entity;

    $form['label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Label'),
      '#maxlength' => 255,
      '#default_value' => $app_module->label(),
      '#description' => $this->t("Label for the Application Module."),
      '#required' => TRUE,
    ];
    $form['id'] = [
      '#type' => 'machine_name',
      '#default_value' => $app_module->id(),
      '#machine_name' => [
        'exists' => [$this, 'exist'],
      ],
      '#disabled' => !$app_module->isNew(),
    ];
    $form['app_module_plugin_id'] = [
      '#type' => 'select',
      '#title' => $this
        ->t('Select element'),
      '#options' => $this->getAppModulePluginOptions(),
      '#required' => TRUE,
      '#default_value' => $app_module->appModulePluginId(),
    ];

    // TODO: You will need additional form elements for your custom properties.
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $app_module = $this->entity;
    $status = $app_module->save();

    if ($status) {
      $this->messenger()->addMessage($this->t('Saved the %label Application module.', [
        '%label' => $app_module->label(),
      ]));
    }
    else {
      $this->messenger()->addMessage($this->t('The %label Application module was not saved.', [
        '%label' => $app_module->label(),
      ]), MessengerInterface::TYPE_ERROR);
    }

    $form_state->setRedirect('entity.app_module.collection');
  }

  /**
   * Helper function to check whether an App Module configuration entity exists.
   */
  public function exist($id) {
    $entity = $this->entityTypeManager->getStorage('app_module')->getQuery()
      ->condition('id', $id)
      ->execute();
    return (bool) $entity;
  }

  /**
   * Gets the available App Module plugins as options for a select.
   *
   * @return array
   *   Returns an options array of all app module plugins.
   */
  private function getAppModulePluginOptions() {
    $options = [];
    $app_module_plugins = $this->pluginManager->getDefinitions();
    foreach ($app_module_plugins as $name => $plugin) {
      $options[$name] = $plugin['label'];
    }
    return $options;
  }

}
