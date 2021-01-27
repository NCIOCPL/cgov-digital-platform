<?php

namespace Drupal\pdq_core;

use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Service for removing unwanted older revisions of PDQ content.
 *
 * @package Drupal\pdq_core
 */
class RevisionPruner {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a RevisionPruner object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * Discard older revisions of a specified node.
   *
   * Identify the most recent published revisions for each language found in
   * the node and retain those revisions, deleting the others. The number of
   * per-language revisions to preserve defaults to 3 but can be overridden
   * by the optional second parameter.
   *
   * @param int $nid
   *   Unique identifier for the node whose revisions are to be pruned.
   * @param int $keep
   *   Number of revisions to preserve for each language in the node.
   *
   * @return array
   *   List of IDs for deleted revisions.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function dropOldRevisions($nid, $keep = 3) {
    $storage = $this->entityTypeManager->getStorage('node');
    $node = $storage->load($nid);
    $vids = $storage->revisionIds($node);
    sort($vids, SORT_NUMERIC);
    $vids = array_reverse($vids);
    $languages = array_keys($node->getTranslationLanguages());
    $kept = [];
    $dropped = [];
    foreach ($languages as $langcode) {
      $kept[$langcode] = 0;
    }
    foreach ($vids as $vid) {
      $wanted = FALSE;
      $revision = $storage->loadRevision($vid);
      foreach ($languages as $langcode) {
        if ($kept[$langcode] < $keep) {
          if ($revision->hasTranslation($langcode)) {
            $translation = $revision->getTranslation($langcode);
            if ($translation->isRevisionTranslationAffected()) {
              if ($translation->isPublished()) {
                $wanted = TRUE;
                $kept[$langcode]++;
              }
            }
          }
        }
      }
      if (!$wanted) {
        $storage->deleteRevision($vid);
        $dropped[] = (int) $vid;
      }
    }
    return $dropped;
  }

}
