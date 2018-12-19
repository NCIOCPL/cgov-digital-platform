<?php

namespace Drupal\cgov_core;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManager;
use Drupal\language\LanguageNegotiatorInterface;

/**
 * Helper service for various cgov installation tasks.
 *
 * @package Drupal\cgov_core
 */
class CgovCoreTools {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The language negotiator.
   *
   * @var \Drupal\language\LanguageNegotiatorInterface
   */
  protected $negotiator;

  /**
   * The entity type manager.
   *
   * @var Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

  /**
   * Our Language Negotiation settings.
   *
   * This would normally be in language.types.yml, but due to
   *   https://www.drupal.org/project/drupal/issues/2666998 it cannot be
   *   imported.
   *
   * @var array
   */
  private $cgovLangTypes = [
    'language_interface' => [
      'enabled' => [
        'language-user-admin' => "-10",
        'language-selected' => "12",
      ],
      'method_weights' => [
        'language-user-admin' => "-10",
        'language-url' => "-8",
        'language-session' => "-4",
        'language-user' => "-4",
        'language-browser' => "-2",
        'language-selected' => "12",
      ],
    ],
    'language_content' => [
      'enabled' => [
        'language-url' => "-8",
        'language-selected' => "12",
      ],
      'method_weights' => [
        'language-content-entity' => "-9",
        'language-url' => "-8",
        'language-session' => "-4",
        'language-user' => "-4",
        'language-browser' => "-2",
        'language-interface' => "9",
        'language-selected' => "12",
      ],
    ],
  ];

  /**
   * Constructs a CgovSiteTools object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\language\LanguageNegotiatorInterface $negotiator
   *   The language negotiation methods manager.
   * @param Drupal\Core\Entity\EntityTypeManager $entity_type_manager
   *   Access to the workflow storage.
   */
  public function __construct(
      ConfigFactoryInterface $config_factory,
      LanguageNegotiatorInterface $negotiator,
      EntityTypeManager $entity_type_manager
    ) {

    $this->negotiator = $negotiator;
    $this->configFactory = $config_factory;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * Installs language types configuration until it is fixed in core.
   *
   * See https://www.drupal.org/project/drupal/issues/2666998 .
   */
  public function installLanguageNegotiation() {

    // Gets editable types config. Only used for *some* config changes.
    $typesConfig = $this->configFactory->getEditable('language.types');

    // Set the method weights for each negotiation type.
    foreach ($this->cgovLangTypes as $type => $typeConf) {
      $typesConfig->set(
        'negotiation.' . $type . '.method_weights',
        $typeConf['method_weights']
      )->save();
    }

    // Updates the configuration based on the given language types.
    $this->negotiator->updateConfiguration(array_keys($this->cgovLangTypes));

    // Set the enabled methods.
    foreach ($this->cgovLangTypes as $type => $typeConf) {
      $this->negotiator->saveConfiguration(
        $type,
        $typeConf['enabled']
      );
    }
  }

  /**
   * Links a content type to a workflow.
   *
   * See https://github.com/NCIOCPL/cgov-digital-platform/issues/127.
   */
  public function attachContentTypeToWorkflow($type_name, $workflow_name) {
    $workflows = $this->entityTypeManager->getStorage('workflow')->loadMultiple();
    $workflow = $workflows[$workflow_name];
    $workflow->getTypePlugin()->addEntityTypeAndBundle('node', $type_name);
    $workflow->save(TRUE);
  }

}
