<?php

namespace Drupal\Tests\cgov_core\Traits;

use Drupal\content_moderation\Plugin\WorkflowType\ContentModerationInterface;

/**
 * Provides test assertions for testing config entity synchronization.
 *
 * Can be used by test classes that extend \Drupal\Tests\BrowserTestBase or
 * \Drupal\KernelTests\KernelTestBase.
 */
trait CGovWorkflowAttachmentTrait {

  /**
   * Assigns an entity type to a workflow.
   *
   * @param string $type_name
   *   Entity name.
   * @param string $workflow_name
   *   Workflow name.
   */
  public function attachContentTypeToWorkflow($type_name, $workflow_name) {
    $workflows = \Drupal::entityTypeManager()->getStorage('workflow')->loadMultiple();
    $workflow = $workflows[$workflow_name];
    $typePlugin = $workflow->getTypePlugin();
    if (!($typePlugin instanceof ContentModerationInterface)) {
      throw new \Exception("editorial_workflow is not of the expected type, ContentModerationInterface.");
    }
    $typePlugin->addEntityTypeAndBundle('node', $type_name);
    $workflow->save();
  }

}
