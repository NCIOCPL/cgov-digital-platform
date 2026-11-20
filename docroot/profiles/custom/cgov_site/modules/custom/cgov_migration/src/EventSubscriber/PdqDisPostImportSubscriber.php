<?php

namespace Drupal\cgov_migration\EventSubscriber;

use Drupal\features\FeaturesAssignerInterface;
use Drupal\features\FeaturesManagerInterface;
use Drupal\field\Entity\FieldConfig;
use Drupal\migrate\Event\MigrateEvents;
use Drupal\migrate\Event\MigrateImportEvent;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Finalizes the DIS field switch after a complete XML migration.
 */
class PdqDisPostImportSubscriber implements EventSubscriberInterface {

  /**
   * Constructs the event subscriber.
   */
  public function __construct(
    private readonly FeaturesManagerInterface $featuresManager,
    private readonly FeaturesAssignerInterface $featuresAssigner,
    private readonly LoggerInterface $logger,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      MigrateEvents::POST_IMPORT => 'onPostImport',
    ];
  }

  /**
   * Removes the old body field only after every XML row has been imported.
   */
  public function onPostImport(MigrateImportEvent $event): void {
    $migration = $event->getMigration();
    if ($migration->id() !== 'pdq_dis_xml') {
      return;
    }

    $source_count = $migration->getSourcePlugin()->count();
    $id_map = $migration->getIdMap();
    if ($source_count < 1 ||
      $id_map->errorCount() > 0 ||
      $id_map->importedCount() !== $source_count) {
      $this->logger->warning(
        'PDQ DIS field switch deferred: @imported of @source XML rows imported with @errors errors.',
        [
          '@imported' => $id_map->importedCount(),
          '@source' => $source_count,
          '@errors' => $id_map->errorCount(),
        ]
      );
      return;
    }

    $body = FieldConfig::loadByName('node', 'pdq_drug_information_summary', 'body');
    if ($body) {
      $body->delete();
    }
    $this->featuresAssigner->assignConfigPackages();
    $this->featuresManager->import(['pdq_drug_information_summary']);
    $this->logger->notice(
      'PDQ DIS XML migration complete; the content type now uses field_article_body.'
    );
  }

}
