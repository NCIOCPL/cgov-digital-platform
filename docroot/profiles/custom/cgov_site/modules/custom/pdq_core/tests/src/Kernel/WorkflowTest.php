<?php

namespace Drupal\Tests\pdq_core\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;

/**
 * Ensure that PDQ workflows conform to requirements.
 *
 * @group cgov
 * @group cgov_site
 */
class WorkflowTest extends KernelTestBase {

  use NodeCreationTrait;
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'cgov_core',
    'content_moderation',
    'content_translation',
    'datetime',
    'field',
    'file',
    'link',
    'filter',
    'language',
    'node',
    'options',
    'paragraphs',
    'pdq_core',
    'rest',
    'serialization',
    'system',
    'taxonomy',
    'views',
    'entity_browser',
    'entity_reference_revisions',
    'paragraphs',
    'text',
    'user',
    'workflows',
  ];

  /**
   * Use our own profile instead of one from the standard distribution.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installEntitySchema('content_moderation_state');
    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installEntitySchema('workflow');
    $this->installConfig([
      'cgov_core',
      'content_moderation',
      'content_translation',
      'field',
      'file',
      'link',
      'node',
      'pdq_core',
      'rest',
      'user',
      'filter',
      'language',
      'views',
      'entity_browser',
      'entity_reference_revisions',
      'paragraphs',
      'user',
      'workflows',
    ]);
    $this->installSchema('system', ['sequences']);
    $this->installSchema('node', ['node_access']);
    $tools = $this->container->get('cgov_core.tools');
    $node_type = NodeType::create(['type' => 'pony']);
    $node_type->save();
    $node_type = NodeType::create(['type' => 'unicorn']);
    $node_type->save();
    $tools->attachContentTypeToWorkflow('unicorn', 'pdq_workflow');
  }

  /**
   * Verify the PDQ moderation state transitions (issue #258).
   */
  public function testPdqWorkflowTransitions() {
    $perms = ['create unicorn content', 'edit any unicorn content'];
    $admin = $this->createUser([], NULL, TRUE);
    $pdq_importer = $this->createUser($perms);
    $pdq_importer->addRole('pdq_importer');
    $perms = [
      'access content',
      'create pony content',
      'delete any pony content',
      'edit any pony content',
    ];
    $advanced = $this->createUser($perms);
    $advanced->addRole('content_author');
    $advanced->addRole('content_editor');
    $advanced->addRole('advanced_editor');
    $states = ['draft', 'published'];
    $allowed = 'Transition should be allowed for PDQ Importer role';
    $forbidden = 'Transition should not be allowed';
    foreach ($states as $from) {
      foreach ($states as $to) {
        $this->setCurrentUser($admin);
        $node = $this->createNode(['type' => 'unicorn']);
        $node->moderation_state->value = $from;
        $node->save();
        $node->setNewRevision(TRUE);
        $node->moderation_state->value = $to;
        $this->setCurrentUser($pdq_importer);
        $violations = $node->validate();
        $this->assertCount(0, $violations, $allowed);
        $this->setCurrentUser($advanced);
        $violations = $node->validate();
        $this->assertCount(1, $violations, $forbidden);
      }
    }
  }

}
