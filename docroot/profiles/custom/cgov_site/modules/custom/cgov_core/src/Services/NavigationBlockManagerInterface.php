<?php

namespace Drupal\cgov_core\Services;

/**
 * Defines the interface for a class which renders navigation blocks.
 */
interface NavigationBlockManagerInterface {

  /**
   * Draw a navigation block.
   *
   * @param string $block_name
   *   The name of the block to render.
   */
  public function getNavigationBlock(string $block_name);

}
