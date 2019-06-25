<?php

namespace Drupal\cgov_redirect_manager\Plugin\QueueWorker;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Psr\Log\LoggerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;

/**
 * Processes migration imports on cron.
 *
 * @QueueWorker(
 *   id = "cgov_redirect_manager_queue_worker",
 *   title = @Translation("CGov Redirect Manager Queue Worker"),
 * )
 */
class RedirectManagerQueueWorker extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  /**
   * The loggerFactory object.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $loggerFactory;

  /**
   * Constructs a new LocaleTranslation object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   * @param \Psr\Log\LoggerInterface $loggerFactory
   *   The module handler.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    array $plugin_definition,
    LoggerInterface $loggerFactory
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->loggerFactory = $loggerFactory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition
  ) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('logger.factory')->get('cgov_redirect_manager')
    );
  }

  /**
   * Processes items added to migration_import_queue_worker.
   *
   * @param mixed $data
   *   Data to be processed by worker.
   */
  public function processItem($data) {
    $this->loggerFactory->info('Executing CGov Redirect Imports...');
    $options = [
      'status_code' => '301',
      'override' => TRUE,
      'no_headers' => TRUE,
      'delimiter' => ',',
      'language' => 'en',
      'suppress_messages' => TRUE,
      'allow_nonexistent' => TRUE,
    ];

    if ($data['type'] == 'csv_import') {
      \Drupal::service('cgov_redirect_manager.importer')->import($data['file'], $options);
    }
    $this->loggerFactory->info('CGov Redirect Imports finished...');
  }

}
