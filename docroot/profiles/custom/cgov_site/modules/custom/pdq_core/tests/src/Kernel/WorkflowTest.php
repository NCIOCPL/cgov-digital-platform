<?php

namespace Drupal\Tests\pdq_core\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;
use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\Tests\cgov_core\Traits;

/**
 * Ensure that PDQ workflows conform to requirements.
 *
 * @group cgov
 * @group cgov_site
 */
class WorkflowTest extends KernelTestBase {

  use Traits\CGovWorkflowAttachmentTrait;
  use NodeCreationTrait;
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
    'user',
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
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();

    // These are special and cannot be installed as a dependency
    // for this module. So we have to install their bits separately.
    $this->installEntitySchema('user');
    $this->installSchema('system', ['sequences']);
    $this->installConfig(['system', 'user']);

    // Install core and its dependencies.
    // This ensures that the install hook will fire, which sets up
    // the permissions for the roles we are testing below.
    \Drupal::service('module_installer')->install(['pdq_core']);

    $node_type = NodeType::create(['type' => 'pony']);
    $node_type->save();
    $node_type = NodeType::create(['type' => 'unicorn']);
    $node_type->save();
    $this->attachContentTypeToWorkflow('unicorn', 'pdq_workflow');
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
