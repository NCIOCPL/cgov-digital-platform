<?php

namespace Drupal\Tests\cgov_core\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;

/**
 * Ensure that cgov_site workflows conform to requirements.
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
   * Users with role permissions to be tested.
   *
   * @var array
   */
  protected $users = [];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installEntitySchema('content_moderation_state');
    $this->installEntitySchema('node');
    $this->installEntitySchema('taxonomy_term');
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
      'user',
      'filter',
      'language',
      'taxonomy',
      'views',
      'entity_browser',
      'entity_reference_revisions',
      'paragraphs',
      'user',
      'workflows',
    ]);
    $this->installSchema('system', ['sequences']);
    $this->installSchema('node', ['node_access']);
    $perms = [
      'access content',
      'create pony content',
      'delete any pony content',
      'edit any pony content',
    ];
    $tools = $this->container->get('cgov_core.tools');
    $node_type = NodeType::create(['type' => 'pony', 'label' => 'Pony']);
    $node_type->save();
    $tools->attachContentTypeToWorkflow('pony', 'editorial_workflow');
    $this->users['admin'] = $this->createUser([], NULL, TRUE);
    $this->users['author'] = $this->createUser($perms);
    $this->users['author']->addRole('content_author');
    $this->users['editor'] = $this->createUser($perms);
    $this->users['editor']->addRole('content_author');
    $this->users['editor']->addRole('content_editor');
    $this->users['advanced'] = $this->createUser($perms);
    $this->users['advanced']->addRole('content_author');
    $this->users['advanced']->addRole('content_editor');
    $this->users['advanced']->addRole('advanced_editor');
  }

  /**
   * Check available moderation states of new translation (issue #371).
   */
  public function testNewTranslationModerationState() {
    ConfigurableLanguage::createFromLangcode('es')->save();
    $this->setCurrentUser($this->users['admin']);
    $node = $this->createNode(['type' => 'pony']);
    $node->moderation_state->value = 'published';
    $node->save();
    $translation = $node->addTranslation('es', ['title' => 'Spanish title']);
    $this->assertEquals($translation->moderation_state->value, 'draft');
    $translation->save();
    $tests = [['draft', 0], ['review', 0], ['editing', 1], ['archived', 1]];
    foreach ($tests as $test) {
      list($state, $expected_violations) = $test;
      $translation->moderation_state->value = $state;
      $violations = $translation->validate();
      $negative = $expected_violations ? ' not' : '';
      $message = "Moderation state '$state' should$negative be available";
      $this->assertEquals(count($violations), $expected_violations, $message);
    }
  }

  /**
   * Test control of when an author can delete content nodes (issue #121).
   */
  public function testDeletion() {
    $entityTypeManager = $this->container->get('entity_type.manager');
    $accessHandler = $entityTypeManager->getAccessControlHandler('node');
    $this->setCurrentUser($this->users['admin']);
    $node = $this->createNode(['type' => 'pony']);
    $this->assertTrue($accessHandler->access($node, 'delete', $this->users['author']));
    $node->moderation_state->value = 'published';
    $node->save();
    $this->assertFalse($accessHandler->access($node, 'delete', $this->users['editor']));
    $node->moderation_state->value = 'archived';
    $node->save();
    $this->assertFalse($accessHandler->access($node, 'delete', $this->users['author']));
    $this->assertTrue($accessHandler->access($node, 'delete', $this->users['editor']));
  }

  /**
   * Verify that the transitions are handled as expected (issue #64).
   *
   * We're cutting corners here. If we did this "properly," we would register
   * the `transitionCases` method below as a dataProvider, which would enable
   * us to run separate tests on each of the transitions. The way we've done
   * it instead, we'll only see the first failure we run into, and we'll have
   * to fix that and run the test again to see the next error (if any), and
   * so on. However, doing it the canonical way takes about 25 times longer,
   * and since these tests get kicked off every time a pull request is
   * submitted, that would get really annoying. So get over the fact that
   * we're cheating a little bit.
   */
  public function testTransitions() {

    // Verify that the initial state of a moderated node is `draft`.
    $this->setCurrentUser($this->users['author']);
    $node = $this->createNode(['type' => 'pony']);
    $this->assertEquals('draft', $node->moderation_state->value);

    // Check each logical combination of permissions and state transition.
    $cases = $this->transitionCases();
    foreach ($cases as $case) {

      // Create a new node with the transition's starting state.
      list($from, $to, $user, $expected_failure) = $case;
      $this->setCurrentUser($this->users['admin']);
      $node = $this->createNode(['type' => 'pony']);
      $node->moderation_state->value = $from;
      $node->save();

      // Switch to the account used for this case and validate the transition.
      $node->setNewRevision(TRUE);
      $node->moderation_state->value = $to;
      $this->setCurrentUser($this->users[$user]);
      $violations = $node->validate();

      // Handle the cases which should succeed.
      if (empty($expected_failure)) {
        // Test this prior to invoking the assertion, so we can show the error.
        if (count($violations) > 0) {
          $error = (string) $violations->get(0)->getMessage();
          $message = "$user($from->$to): $error";
          $this->assertCount(0, $violations, $message);
        }
      }
      else {
        // Check for a case we expect to fail, but which doesn't.
        if (count($violations) < 1) {
          $message = "$user should not be able to move from $from to $to";
          $this->assertCount(1, $violations, $message);
        }
        else {
          // Make sure the failure is for the reason we expect.
          $message = (string) $violations->get(0)->getMessage();
          $this->assertStringStartsWith($expected_failure, $message);
        }
      }
    }
  }

  /**
   * Test cases for testTransition.
   *
   * @return array
   *   Two-dimensional array of arrays, each of which contains
   *   an initial state, a target state, a user role, and the
   *   starting substring of an error message if failure is expected
   *   for the transition.
   */
  public function transitionCases() {
    $unauthorized = 'You do not have access to transition from';
    $invalid = 'Invalid state transition';
    $ok = NULL;
    return [
      ['draft', 'draft', 'author', $ok],
      ['draft', 'review', 'author', $ok],
      ['draft', 'published', 'editor', $unauthorized],
      ['draft', 'published', 'advanced', $ok],
      ['draft', 'editing', 'admin', $invalid],
      ['draft', 'post_publication_review', 'admin', $invalid],
      ['draft', 'archive_requested', 'admin', $invalid],
      ['draft', 'archived', 'admin', $invalid],
      ['review', 'draft', 'author', $ok],
      ['review', 'review', 'admin', $invalid],
      ['review', 'published', 'author', $unauthorized],
      ['review', 'published', 'editor', $ok],
      ['review', 'editing', 'admin', $invalid],
      ['review', 'post_publication_review', 'admin', $invalid],
      ['review', 'archive_requested', 'admin', $invalid],
      ['review', 'archived', 'admin', $invalid],
      ['published', 'draft', 'admin', $invalid],
      ['published', 'review', 'admin', $invalid],
      ['published', 'published', 'admin', $invalid],
      ['published', 'editing', 'author', $ok],
      ['published', 'post_publication_review', 'admin', $invalid],
      ['published', 'archive_requested', 'author', $ok],
      ['editing', 'draft', 'admin', $invalid],
      ['editing', 'review', 'admin', $invalid],
      ['editing', 'published', 'editor', $unauthorized],
      ['editing', 'published', 'advanced', $ok],
      ['editing', 'editing', 'author', $ok],
      ['editing', 'post_publication_review', 'author', $ok],
      ['editing', 'archive_requested', 'admin', $invalid],
      ['editing', 'archived', 'admin', $invalid],
      ['post_publication_review', 'draft', 'admin', $invalid],
      ['post_publication_review', 'review', 'admin', $invalid],
      ['post_publication_review', 'published', 'author', $unauthorized],
      ['post_publication_review', 'published', 'editor', $ok],
      ['post_publication_review', 'editing', 'author', $ok],
      ['post_publication_review', 'post_publication_review', 'admin', $invalid],
      ['post_publication_review', 'archive_requested', 'admin', $invalid],
      ['post_publication_review', 'archived', 'admin', $invalid],
      ['archive_requested', 'draft', 'admin', $invalid],
      ['archive_requested', 'review', 'admin', $invalid],
      ['archive_requested', 'published', 'author', $unauthorized],
      ['archive_requested', 'published', 'editor', $ok],
      ['archive_requested', 'editing', 'admin', $invalid],
      ['archive_requested', 'post_publication_review', 'admin', $invalid],
      ['archive_requested', 'archive_requested', 'admin', $invalid],
      ['archive_requested', 'archived', 'author', $unauthorized],
      ['archive_requested', 'archived', 'editor', $ok],
      ['archived', 'draft', 'author', $ok],
      ['archived', 'review', 'admin', $invalid],
      ['archived', 'published', 'admin', $invalid],
      ['archived', 'editing', 'admin', $invalid],
      ['archived', 'post_publication_review', 'admin', $invalid],
      ['archived', 'archive_requested', 'admin', $invalid],
      ['archived', 'archived', 'admin', $invalid],
    ];
  }

}
