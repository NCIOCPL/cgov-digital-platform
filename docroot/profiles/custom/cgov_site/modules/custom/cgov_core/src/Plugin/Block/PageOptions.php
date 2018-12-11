<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Cgov page options block.
 *
 * @Block(
 *  id = "page_options",
 *  admin_label = "Page Options Block for Cgov",
 * )
 */
class PageOptionsBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      'example' => 'example',
    ];
  }

}
