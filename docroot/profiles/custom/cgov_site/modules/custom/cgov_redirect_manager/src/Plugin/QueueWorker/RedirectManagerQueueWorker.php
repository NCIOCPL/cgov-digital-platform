<?php

namespace Drupal\cgov_redirect_manager\Plugin\QueueWorker;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\cgov_redirect_manager\CgovImporterService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Psr\Log\LoggerInterface;

/**
 * Processes migration imports on cron.
 *
 * NOTE: Cron is not set below on the worker attributes. This means the
 * worker never is executed when running cron. (As far as I can tell)
 * It must be manually run through the command:
 *    `drush queue:run cgov_redirect_manager_queue_worker`.
 * This is how the code worked prior to, and after 10/23/2023 when it
 * got refactored.
 * The reason it does not run from cron, is that the PHP execution time
 * is set to 240 seconds for a cron run. (As set in Cron.php) All tasks
 * must finish within that time and we don't want to find out what
 * happens when processing the CSV fails in the middle. Also the code
 * checks to see if it is in drush anyway, which is a problem for cron
 * running under the web site. This should probably get refactored into
 * a Batch API process.
 *
 * @QueueWorker(
 *   id = "cgov_redirect_manager_queue_worker",
 *   title = @Translation("CGov Redirect Manager Queue Worker")
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
   * The Redirect Importer Service.
   *
   * @var \Drupal\cgov_redirect_manager\CgovImporterService
   */
  protected $importerService;

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
   * @param \Drupal\cgov_redirect_manager\CgovImporterService $importer_service
   *   The CGov redirect importer service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    array $plugin_definition,
    LoggerInterface $loggerFactory,
    CgovImporterService $importer_service
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->loggerFactory = $loggerFactory;
    $this->importerService = $importer_service;
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
      $container->get('logger.factory')->get('cgov_redirect_manager'),
      $container->get('cgov_redirect_manager.importer')
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

    if ($data['type'] == 'csv_import') {
      // Just use the default options, which were defined for this specific
      // use case.
      $this->importerService->import($data['file']);
    }
    $this->loggerFactory->info('CGov Redirect Imports finished...');
  }

}
