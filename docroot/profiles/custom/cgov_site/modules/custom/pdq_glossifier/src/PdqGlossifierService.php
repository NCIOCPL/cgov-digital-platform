<?php

namespace Drupal\pdq_glossifier;

use Drupal\Core\Database\Connection;

/**
 * Service for Pdq Glossify.
 *
 * @package Drupal\pdq_glossifier
 */
class PdqGlossifierService implements PdqGlossifierServiceInterface {

  /**
   * The database connection service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * Constructs object.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   A database connection.
   */
  public function __construct(Connection $connection) {
    $this->connection = $connection;
  }

  /**
   * {@inheritdoc}
   */
  public function update(array $data, $now) {
    $count = 0;
    $fields = ['terms' => json_encode($data), 'updated' => $now];
    $this->connection->update('pdq_glossary')->fields($fields)->execute();
    $count = count($data);
    return $count;
  }

}
