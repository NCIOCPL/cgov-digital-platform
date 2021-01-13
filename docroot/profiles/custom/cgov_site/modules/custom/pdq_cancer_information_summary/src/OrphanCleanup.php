<?php

namespace Drupal\pdq_cancer_information_summary;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Database\Connection;

/**
 * Service for clearing out orphan summary sections.
 *
 * @package Drupal\pdq_cancer_information_summary
 */
class OrphanCleanup {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The database connection used to find orphaned summary sections.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * Constructs an OrphanCleanup object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection which will be used to find orphans.
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    Connection $connection
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->connection = $connection;
  }

  /**
   * Drop orphaned PDQ summary sections.
   *
   * Identify `paragraph` entities of type `pdq_summary_section` for which at
   * least some of the revisions no longer have (or never had) a parent node.
   * If all of such an entity's revisions are orphans, delete the entire
   * entity. Otherwise, delete only revisions which are orphaned. Perform as
   * many complete entity deletions as are requested by the caller, if that
   * many are eligible for deletion, counting each entity as a single deletion,
   * regardless of how many revisions the entity has. If there are fewer
   * entities eligible for deletion than the number of deletions requested,
   * perform the remaining number of deletions on individual orphaned revisions
   * from `paragraph` entities which have some non-orphaned revisions (or as
   * many such revisions as are eligible for deletion). It is not an error to
   * perform fewer deletions than requested. If no maximum number of deletions
   * is specified by the caller, delete all orphans found.
   *
   * @param int $max_deletions
   *   Optional throttle on the number of deletions to be performed.
   *
   * @return array
   *   Nested arrays of revision IDs indexed by the IDs of the entities in
   *   which the orphaned revisions were found.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function dropOrphanedSummarySections($max_deletions = 0) {

    // Find orphaned paragraph entities.
    $storage = $this->entityTypeManager->getStorage('paragraph');
    $query = $this->connection->select('paragraphs_item', 'p');
    $query->fields('p', ['id']);
    $query->condition('p.type', 'pdq_summary_section');
    $query->distinct();
    $query->leftJoin(
      'node_revision__field_summary_sections',
      's',
      's.field_summary_sections_target_id = p.id'
    );
    $query->isNull('s.entity_id');
    if ($max_deletions > 0) {
      $query->range(0, $max_deletions);
    }
    $results = $query->execute();
    $dropped = [];
    foreach ($results as $result) {
      $paragraph_id = $result->id;
      $revision_ids = $this->connection
        ->select('paragraphs_item_revision', 'r')
        ->fields('r', ['revision_id'])
        ->distinct()
        ->condition('r.id', $paragraph_id)
        ->execute()
        ->fetchCol();
      foreach ($revision_ids as $revision_id) {
        $dropped[$paragraph_id][] = (int) $revision_id;
      }
      $entity = $storage->load($paragraph_id);
      $entity->delete();
    }

    // If appropriate, find individual orphaned revisions.
    if (empty($max_deletions) || count($dropped) < $max_deletions) {
      $query = $this->connection->select('paragraphs_item_revision', 'r');
      $query->fields('r', ['id', 'revision_id']);
      $query->distinct();
      $query->join('paragraphs_item', 'p', 'p.id = r.id');
      $query->condition('p.type', 'pdq_summary_section');
      $query->leftJoin(
        'node_revision__field_summary_sections',
        's',
        's.field_summary_sections_target_revision_id = r.revision_id'
      );
      $query->isNull('s.entity_id');
      if (!empty($max_deletions)) {
        $remaining = $max_deletions - count($dropped);
        $query->range(0, $remaining);
      }
      $results = $query->execute();
      foreach ($results as $result) {
        $entity = $storage->load($paragraph_id);
        $storage->deleteRevision($result->revision_id);
        $dropped[$result->id][] = (int) $result->revision_id;
      }
    }

    return $dropped;
  }

}
