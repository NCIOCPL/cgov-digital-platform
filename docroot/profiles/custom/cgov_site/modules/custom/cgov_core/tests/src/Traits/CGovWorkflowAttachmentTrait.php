<?php

namespace Drupal\Tests\cgov_core\Traits;

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
    $workflow->getTypePlugin()->addEntityTypeAndBundle('node', $type_name);
    $workflow->save(TRUE);
  }

}
