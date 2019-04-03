<?php

namespace Drupal\Tests\node\Functional;

use Drupal\node\Entity\NodeType;
use Drupal\Tests\system\Functional\Menu\AssertBreadcrumbTrait;
use Drupal\Tests\system\Functional\Cache\AssertPageCacheContextsAndTagsTrait;
use CgovPlatform\Tests\CgovSchemaExclusions;

/**
 * Ensures the PDQ content types are correctly configured.
 *
 * @group node
 */
class PdqNodeTypeTest extends NodeTestBase {

  use AssertBreadcrumbTrait;
  use AssertPageCacheContextsAndTagsTrait;

  /**
   * Load the CancerGov site profile.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [];


  /**
   * PDQ Content types.
   *
   * This field contains a list of all the content types to be tested.
   * Potentially, this could be expanded to include a list of the fields
   * expected to be associated with the type.
   *
   * @var array
   */
  private $contentTypes = [
    'pdq_cancer_information_summary',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
  }

  /**
   * Ensures that node type functions (node_type_get_*) work correctly.
   *
   * Load available node types and validate the returned data.
   */
  public function testNodeTypesArePresent() {

    foreach ($this->contentTypes as $name) {
      $node = NodeType::load($name);

      $this->assertTrue(isset($node), "Node type $name is available.");

      $label = $node->label();
      $this->assertTrue($label != NULL && strlen($label) > 0, "Node type $name has a non-blank label.");

      $description = $node->getDescription();
      $this->assertTrue($description != NULL && strlen($description) > 0, "Node type $name has a non-blank description.");
    }
  }

}
