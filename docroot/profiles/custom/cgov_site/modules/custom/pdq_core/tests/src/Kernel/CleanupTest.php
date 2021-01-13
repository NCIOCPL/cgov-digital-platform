<?php

namespace Drupal\Tests\pdq_core\Kernel;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\KernelTests\Core\Entity\EntityKernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\node\Entity\NodeType;
use Drupal\node\Entity\Node;

/**
 * Verify that the PDQ content cleanup works as advertised (issue #2815).
 *
 * @group cgov
 * @group cgov_site
 */
class CleanupTest extends EntityKernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['node', 'language', 'block_content', 'pdq_core'];

  /**
   * Use our own profile instead of one from the standard distribution.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * {@inheritdoc}
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  protected function setUp() {
    static::$configSchemaCheckerExclusions =
      CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
    $type = NodeType::create(['type' => 'test', 'name' => 'test']);
    $type->save();
    $this->installSchema('node', 'node_access');
    $this->installEntitySchema('block_content');
    ConfigurableLanguage::createFromLangcode('es')->save();
  }

  /**
   * Test pruning of older revisions.
   */
  public function testPruneOldRevisions() {
    $admin = $this->drupalCreateUser([], 'Zeus', TRUE);
    $this->setCurrentUser($admin);
    $uid = \Drupal::currentUser()->id();
    $node = Node::create([
      'title' => 'Sam and Janet Evening',
      'type' => 'test',
      'uid' => $uid,
      'language' => 'en',
    ]);
    $node->save();
    $nid = $node->id();
    $drop = [$node->getRevisionId()];
    $node = $node->addTranslation('es');
    $node->setTitle('No necesitamos insignias apestosas');
    $node->setNewRevision(TRUE);
    $node->save();
    $drop[] = $node->getRevisionId();
    $languages = ['en', 'es'];
    $storage = $this->entityTypeManager->getStorage('node');
    $pub_revisions_to_create = 10;
    $pub_revisions_to_keep = 3;
    $keep = [];
    for ($i = 0; $i < $pub_revisions_to_create; ++$i) {
      foreach ($languages as $langcode) {
        $node = $node->getTranslation($langcode);
        $node->setPublished(FALSE);
        $node->setNewRevision(TRUE);
        $node->save();
        $drop[] = $node->getRevisionId();
        $node->setPublished(TRUE);
        $node->setNewRevision(TRUE);
        $node->save();
        if ($i < $pub_revisions_to_create - $pub_revisions_to_keep) {
          $drop[] = $node->getRevisionId();
        }
        else {
          $keep[] = $node->getRevisionId();
        }
      }
    }
    $pruner = \Drupal::service('pdq_core.revision_pruner');
    $dropped = $pruner->dropOldRevisions($nid, $pub_revisions_to_keep);
    $this->assertCount(count($drop), $dropped);
    foreach ($dropped as $vid) {
      $this->assertContains($vid, $drop);
    }
    $kept = $storage->revisionIds($node);
    $this->assertCount(count($keep), $kept);
    foreach ($kept as $vid) {
      $this->assertContains($vid, $keep);
    }
  }

}
