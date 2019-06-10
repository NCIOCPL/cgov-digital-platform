<?php

namespace Drupal\cgov_migration\Services;

use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * A logging service for the Cgov Migration.
 */
class MigrationLogger {

  protected $database;

  /**
   * {@inheritdoc}
   */
  public function __construct(Connection $database) {
    $this->database = $database;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
        $container->get('database')
    );
  }

  /**
   * Logs a message to the cgov_migration_message table.
   *
   * @param int $pid
   *   The incoming source ID (percussion ID).
   * @param string $message
   *   The log message.
   * @param mixed $severity
   *   The PHP error severity..
   * @param mixed $category
   *   An optional category for the message..
   */
  public function logMessage($pid, $message, $severity = E_NOTICE, $category = '') {
    $now = time();

    // Trim the message.
    $message = mb_strimwidth($message, 0, 100);

    $this->database->insert('cgov_migration_message_log')
      ->fields([
        'pid' => $pid,
        'message' => $message,
        'severity' => $severity,
        'category' => $category,
        'time ' => $now,
      ])
      ->execute();
  }

}
