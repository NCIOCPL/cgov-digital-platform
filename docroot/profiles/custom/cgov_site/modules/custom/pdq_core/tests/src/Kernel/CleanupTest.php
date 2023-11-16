<?php

namespace Drupal\Tests\pdq_core\Kernel;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\KernelTests\KernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\cgov_core\Traits;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;

/**
 * Verify that the PDQ content cleanup works as advertised (issue #2815).
 *
 * @group cgov
 * @group cgov_site
 */
class CleanupTest extends KernelTestBase {

  use Traits\CGovWorkflowAttachmentTrait;
  use NodeCreationTrait;
  use UserCreationTrait;

  /**
   * Tell the pruner to keep this many published revisions for each language.
   */
  const REVISIONS_TO_KEEP = 3;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'path_alias',
    'system',
    'user',
  ];

  /**
   * Revision pruning service.
   *
   * @var \Drupal\pdq_core\RevisionPruner
   */
  protected $pruner;

  /**
   * Storage interface.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $storage;

  /**
   * User ID for node/revision saving.
   *
   * @var int
   */
  protected $uid;

  /**
   * {@inheritdoc}
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  protected function setUp(): void {
    static::$configSchemaCheckerExclusions =
      CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();

    // Install schemas, configuration, etc., that we need.
    $this->installEntitySchema('user');
    $this->installEntitySchema('path_alias');
    $this->installSchema('system', ['sequences']);
    $this->installConfig(['system', 'user', 'path_alias']);
    \Drupal::service('module_installer')->install(['pdq_core']);
    $node_type = NodeType::create(['type' => 'test', 'name' => 'test']);
    $node_type->save();
    ConfigurableLanguage::createFromLangcode('es')->save();

    // Plug in PDQ workflow to handle draft->published transition.
    $this->attachContentTypeToWorkflow('test', 'pdq_workflow');

    // Initialize our test object's properties.
    $entityTypeManager = \Drupal::service('entity_type.manager');
    $this->storage = $entityTypeManager->getStorage('node');
    $this->setCurrentUser($this->createUser([], 'Zeus', TRUE));
    $this->uid = \Drupal::currentUser()->id();
    $this->pruner = \Drupal::service('pdq_core.revision_pruner');
  }

  /**
   * Test pruning of older revisions.
   *
   * For each case, we simulate running a series of PDQ publishing jobs,
   * in which we send one or both languages for a given PDQ summary node.
   * The job creates the draft revision(s) for the language(s), and then
   * publishes the draft(s). Each time a published revision is created, we
   * remember its revision ID, and which language it was created for. The
   * last step in the job is to invoke the purge service to clear out the
   * unwanted revisions, which is all the draft revisions, and all but the
   * last three published revisions for each language. We verify at the end
   * of each job that we are left with EXACTLY the revisions we expect.
   */
  public function testPruneOldRevisions() {

    // Run each test case, verifying what's left after a purge.
    $cases = $this->getTestCases();
    foreach ($cases as $values) {
      $nid = $values['nid'];
      $published = ['en' => [], 'es' => []];

      // Emulate what a PDQ publishing job does.
      foreach ($values['languages'] as $languages) {

        // Create drafts for each of the languges in this job.
        $job = 1;
        foreach ($languages as $langcode) {
          $title = "Node $nid [$langcode] - job $job";
          $node = $this->storage->load($nid);

          // Create the node if it doesn't yet exist.
          if (empty($node)) {
            $translation = $this->createNode([
              'type' => 'test',
              'id' => $nid,
              'langcode' => $langcode,
            ]);
          }

          // Otherwise, load it and make sure we have the translation we need.
          else {
            $vid = $this->storage->getLatestRevisionId($nid);
            $revision = $this->storage->loadRevision($vid);
            if ($revision->hasTranslation($langcode)) {
              $translation = $revision->getTranslation($langcode);
            }
            else {
              $translation = $revision->addTranslation($langcode);
            }
          }
          $translation->setRevisionCreationTime(\time());
          $translation->setRevisionUserId($this->uid);
          $translation->setTitle($title);
          $translation->moderation_state->value = 'draft';
          $translation->save();
        }

        // Now publish the draft(s).
        foreach ($languages as $langcode) {
          $vid = $this->storage->getLatestRevisionId($nid);
          $revision = $this->storage->loadRevision($vid);
          $translation = $revision->getTranslation($langcode);
          $translation->moderation_state->value = 'published';
          $translation->setRevisionTranslationAffected(TRUE);
          $translation->setRevisionCreationTime(\time());
          $translation->setRevisionUserId($this->uid);
          $translation->save();
          $published[$langcode][] = $translation->getRevisionId();
        }

        // Prune the unwanted revisions and verify the results.
        $this->pruner->dropOldRevisions($nid, self::REVISIONS_TO_KEEP);
        $node = $this->storage->load($nid);
        $kept = $this->storage->revisionIds($node);
        $expected_english = array_slice($published['en'], -self::REVISIONS_TO_KEEP);
        $expected_spanish = array_slice($published['es'], -self::REVISIONS_TO_KEEP);
        $expected = array_merge($expected_english, $expected_spanish);
        sort($kept);
        sort($expected);
        $message = "Prune misbehaved for node $nid at the end of job $job";
        $this->assertEquals($expected, $kept, $message);
        $job++;
      }
    }
  }

  /**
   * Create some test case data.
   *
   * In order to achieve acceptable coverage, we use different patterns for
   * how PDQ publishing jobs send the English and Spanish versions of a PDQ
   * summary. In some cases the two are always sent together, sometimes there
   * is only one language for a node, sometimes there are both, but they
   * don't always get sent in the same jobs. Some of these cases avoid simple
   * patterns for how the languages alternate with each other.
   *
   * Note that we don't have the business rule enforced for cancer information
   * summaries, which requires that there must be an English revision for a
   * node before a Spanish translation is created. So we can also test the
   * case here in which the Spanish translation is saved first, even though
   * it's not currently needed.
   *
   * @return array
   *   Value sets with a node ID and sequence of languages for simulated
   *   publishing jobs.
   */
  private function getTestCases() {
    return [
      [
        'nid' => 1,
        'languages' => [
          ['en', 'es'],
          ['en', 'es'],
          ['en', 'es'],
          ['en', 'es'],
          ['en', 'es'],
          ['en', 'es'],
        ],
      ],
      [
        'nid' => 2,
        'languages' => [
          ['en'],
          ['en'],
          ['en'],
          ['en'],
          ['en'],
          ['en'],
        ],
      ],
      [
        'nid' => 3,
        'languages' => [
          ['es'],
          ['es'],
          ['es'],
          ['es'],
          ['es'],
          ['es'],
          ['en'],
        ],
      ],
      [
        'nid' => 4,
        'languages' => [
          ['en', 'es'],
          ['en', 'es'],
        ],
      ],
      [
        'nid' => 5,
        'languages' => [
          ['en'],
          ['en'],
          ['es'],
          ['es'],
          ['es'],
          ['en'],
          ['en'],
          ['en'],
          ['en'],
          ['es'],
          ['es'],
          ['es'],
          ['en'],
          ['en'],
        ],
      ],
      [
        'nid' => 6,
        'languages' => [
          ['en'],
          ['es'],
          ['es'],
          ['en', 'es'],
          ['es', 'en'],
          ['en', 'es'],
          ['en'],
          ['es'],
          ['es'],
        ],
      ],
    ];
  }

}
