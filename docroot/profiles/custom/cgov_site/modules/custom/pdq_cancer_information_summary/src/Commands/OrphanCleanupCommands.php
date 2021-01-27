<?php

namespace Drupal\pdq_cancer_information_summary\Commands;

use Drupal\pdq_cancer_information_summary\OrphanCleanup;
use Drush\Commands\DrushCommands;

/**
 * Drush command for dropping orphaned PDQ summary sections.
 *
 * @package Drupal\cgov_cancer_information_summary\Commands
 */
class OrphanCleanupCommands extends DrushCommands {

  /**
   * Service for removing orphaned summary sections.
   *
   * @var \Drupal\pdq_cancer_information_summary\OrphanCleanup
   */
  protected $orphanCleanup;

  /**
   * OrphanCleanupCommands constructor.
   */
  public function __construct(OrphanCleanup $orphan_cleanup) {
    $this->orphanCleanup = $orphan_cleanup;
  }

  /**
   * Delete orphaned PDQ summary sections.
   *
   * @param array $options
   *   An associative array of options whose values come from cli, aliases,
   *   config, etc.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @option max_deletions
   *   Restrict number of deletions to MAX_DELETIONS (default is 1000).
   *   When all the revisions for a given entity are orphaned, the deletion
   *   of the entity is counted as a single deletion. For revisions in
   *   entities which also have revisions which are not orphans, each deleted
   *   revision is counted separately.
   * @usage drush pdq:drop-orphaned-summary-sections
   *   Perform at most 1000 deletions of orphaned summary sections.
   * @usage drush pdq:drop-orphaned-summary-sections --max_deletions=20
   *   Perform at most 20 deletions of orphaned summary sections.
   *
   * @command pdq:drop-orphaned-summary-sections
   */
  public function cleanup(array $options = ['max_deletions' => self::REQ]) {
    $max_deletions = $options['max_deletions'];
    if (!is_numeric($max_deletions)) {
      $max = 1000;
    }
    else {
      $max = (int) $max_deletions;
    }
    $message = 'performing at most !n deletions';
    $this->logger()->info(dt($message, ['!n' => $max]));
    $dropped = $this->orphanCleanup->dropOrphanedSummarySections($max);
    $pids = array_keys($dropped);
    if (empty($pids)) {
      $this->logger()->success(dt('No orphaned summary sections found.'));
    }
    else {
      sort($pids, SORT_NUMERIC);
      $total = 0;
      foreach ($pids as $pid) {
        $vids = $dropped[$pid];
        sort($vids);
        $message = 'Dropped orphaned revisions !vids for entity !pid';
        $context = ['!pid' => $pid, '!vids' => implode(',', $vids)];
        $this->logger()->notice(dt($message, $context));
        $total += count($vids);
      }
      $message = 'Dropped !total revisions for !entities entities';
      $context = ['!total' => $total, '!entities' => count($pids)];
      $this->logger()->success(dt($message, $context));
    }
  }

}
