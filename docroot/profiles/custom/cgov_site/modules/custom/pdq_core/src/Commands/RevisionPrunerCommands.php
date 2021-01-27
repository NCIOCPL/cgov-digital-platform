<?php

namespace Drupal\pdq_core\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\pdq_core\RevisionPruner;
use Drush\Commands\DrushCommands;
use Drush\Utils\StringUtils;

/**
 * Drush command for pruning older node revisions.
 *
 * @package Drupal\cgov_core\Commands
 */
class RevisionPrunerCommands extends DrushCommands {

  /**
   * Storage manager for entities.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Service for paring back the number of older revisions retained.
   *
   * @var \Drupal\pdq_core\RevisionPruner
   */
  protected $revisionPruner;

  /**
   * RevisionPrunerCommands constructor.
   */
  public function __construct(EntityTypeManagerInterface $manager, RevisionPruner $pruner) {
    $this->entityTypeManager = $manager;
    $this->revisionPruner = $pruner;
  }

  /**
   * Delete older revisions of PDQ content nodes.
   *
   * @param string $ids
   *   A comma-delimited list of IDs of nodes to be pruned.
   * @param array $options
   *   An associative array of options whose values come from cli, aliases,
   *   config, etc.
   * @option bundle
   *   Prune all nodes of specified bundle. Ignored when ids are specified.
   *   Only pdq_cancer_information_summary and pdq_drug_information_summary
   *   nodes are supported.
   * @option keep
   *   Number of per-language revisions to preserve for each node
   *   (default is 3).
   * @usage drush pdq:prune-node-revisions --bundle=pdq_cancer_information_summary
   *   Prune older revisions for all nodes of type
   *   pdq_cancer_information_summary.
   * @usage drush pdq:prune-node-revisions 960,1187
   *   Prune older revisions for nodes 960 and 1187.
   *
   * @command pdq:prune-node-revisions
   * @aliases rprune
   * @throws \Exception
   */
  public function prune($ids = '', array $options = ['bundle' => self::REQ, 'keep' => self::REQ]) {
    $keep = $options['keep'];
    if (!is_numeric($keep)) {
      $keep = 3;
    }
    else {
      $keep = (int) $keep;
    }
    $message = 'keeping at most !revs revisions per language for each node';
    $this->logger()->info(dt($message, ['!revs' => $keep]));
    $nids = StringUtils::csvToArray($ids);
    if (empty($nids)) {
      $bundle = $options['bundle'];
      if (!empty($bundle)) {
        $supported = [
          'pdq_cancer_information_summary',
          'pdq_drug_information_summary',
        ];
        if (!in_array($bundle, $supported)) {
          $message = 'bundle !b not supported';
          $this->logger()->error(dt($message, ['!b' => $bundle]));
          return;
        }
        $storage = $this->entityTypeManager->getStorage('node');
        $query = $storage->getQuery();
        $query->condition('type', $bundle);
        $nids = $query->execute();
      }
    }
    if (empty($nids)) {
      $this->logger()->success(dt('No nodes to be pruned.'));
    }
    else {
      $total = 0;
      $message = 'Dropped !dropped revisions for node !nid';
      foreach ($nids as $nid) {
        $dropped = $this->revisionPruner->dropOldRevisions($nid, $keep);
        $context = ['!dropped' => count($dropped), '!nid' => $nid];
        $this->logger()->notice(dt($message, $context));
        $total += count($dropped);
      }
      $message = 'Pruned !revisions revisions from !nodes nodes';
      $context = ['!revisions' => $total, '!nodes' => count($nids)];
      $this->logger()->success(dt($message, $context));
    }
  }

}
