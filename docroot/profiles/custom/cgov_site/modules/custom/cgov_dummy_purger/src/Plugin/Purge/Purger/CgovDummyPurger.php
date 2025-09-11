<?php

namespace Drupal\cgov_dummy_purger\Plugin\Purge\Purger;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface;
use Drupal\purge\Plugin\Purge\Purger\PurgerBase;
use Drupal\purge\Plugin\Purge\Purger\PurgerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Dummy Purger for tags, urls, and everything. Logs purge requests only.
 *
 * @PurgePurger(
 *   id = "cgov_dummy_purger",
 *   label = @Translation("CGOV Dummy Purger"),
 *   description = @Translation("A dummy purger that logs purge requests for tags, urls, and everything."),
 *   types = {"tag", "url", "everything"},
 *   multi_instance = FALSE
 * )
 */
class CgovDummyPurger extends PurgerBase implements PurgerInterface, ContainerFactoryPluginInterface {

  /**
   * Logger for debugging output to not conflict with purge.
   */
  protected LoggerInterface $dummyPurgeLogger;

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, LoggerInterface $logger) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->dummyPurgeLogger = $logger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('logger.channel.cgov_dummy_purger')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function routeTypeToMethod($type) {
    // All types use the invalidate method.
    return 'invalidate';
  }

  /**
   * {@inheritdoc}
   */
  public function invalidate(array $invalidations): void {
    if (empty($invalidations)) {
      return;
    }

    $type = $invalidations[0]->getPluginId();
    $expressions = array_map(static function ($inv) {
      return $inv->getExpression();
    }, $invalidations);

    $this->dummyPurgeLogger->info(
      'Received invalidation for {type} with: {expressions}',
      [
        'type' => $type,
        'expressions' => implode(', ', $expressions),
      ]
    );

    foreach ($invalidations as $invalidation) {
      $invalidation->setState(InvalidationInterface::SUCCEEDED);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function hasRuntimeMeasurement(): bool {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getTimeHint(): float {
    return 1.0;
  }

}
