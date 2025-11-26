<?php

namespace Drupal\Tests\ncids_html_transformer\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;

/**
 * Base class for NCIDS Transformer Kernel tests.
 */
class NcidsTransformerKernelTestBase extends KernelTestBase {

  /**
   * The transformer manager.
   */
  protected NcidsHtmlTransformerManager $transformerManager;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'ncids_html_transformer',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();
    $this->transformerManager = $this->container->get('ncids_html_transformer.html_transformer_manager');
  }

}
