<?php

namespace Drupal\Tests\cgov_site_section\Functional;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\block_content\Entity\BlockContent;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\Tests\BrowserTestBase;
use Symfony\Component\Yaml\Parser;

/**
 * Test the cgov site section nav api.
 *
 * @group cgov_site_section
 */
class CgovSiteSectionNavApiTest extends BrowserTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = [
    'cgov_site_section',
  ];

  /**
   * Use our own profile instead of the default.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
  }

  /**
   * The function that the test runner will call.
   *
   * This is done this way so that there is only 1 install of Drupal to run
   * the tests in this file.
   */
  public function testApis() {
    $this->trySiteNavApi();
    $this->tryMegamenuApi();
  }

  /**
   * Tests for a the section nav json api.
   */
  public function trySiteNavApi() {
    // Create published landing page node.
    $published_node = Node::create([
      'type' => 'cgov_article',
      'title' => $this->randomMachineName(),
      'field_browser_title' => $this->randomMachineName(),
      'uid' => '1',
      'status' => 1,
      'moderation_state' => 'published',
    ]);
    $published_node->save();
    $published_node_id = $published_node->id();

    // Create unpublished landing page node.
    $unpublished_node = Node::create([
      'type' => 'cgov_article',
      'title' => $this->randomMachineName(),
      'field_browser_title' => $this->randomMachineName(),
      'uid' => '1',
      'status' => 0,
    ]);
    $unpublished_node->save();
    $unpublished_node_id = $unpublished_node->id();

    // Create site section term 1.
    $term_1 = Term::create([
      'name' => $this->randomMachineName(),
      'field_landing_page' => [
        'target_id' => $published_node_id,
      ],
      'field_main_nav_root' => 1,
      'field_section_nav_root' => 1,
      'vid' => 'cgov_site_sections',
      'status' => 1,
    ]);
    $term_1->save();
    $term_1_id = $term_1->id();

    // Create site section term 2.
    $term_2 = Term::create([
      'name' => $this->randomMachineName(),
      'field_landing_page' => [
        'target_id' => $unpublished_node_id,
      ],
      'field_main_nav_root' => 1,
      'field_section_nav_root' => 1,
      'vid' => 'cgov_site_sections',
      'status' => 1,
    ]);
    $term_2->save();
    $term_2_id = $term_2->id();

    // Create site section term 3.
    $term_3 = Term::create([
      'name' => $this->randomMachineName(),
      'field_landing_page' => [
        'target_id' => $unpublished_node_id,
      ],
      'field_main_nav_root' => 0,
      'field_section_nav_root' => 0,
      'vid' => 'cgov_site_sections',
      'status' => 1,
    ]);
    $term_3->save();
    $term_3_id = $term_3->id();

    // Assert the section nav json api URL.
    // Verify the section nav json response status code.
    $this->drupalGet('taxonomy/term/' . $term_1_id . '/section-nav');
    $this->assertSession()->statusCodeEquals(200);

    // Verify the section nav json response status code.
    $this->drupalGet('taxonomy/term/' . $term_1_id . '/mobile-nav');
    $this->assertSession()->statusCodeEquals(200);

    // Verify the section nav json response status code.
    $this->drupalGet('taxonomy/term/' . $term_2_id . '/section-nav');
    $this->assertSession()->statusCodeEquals(400);

    // Verify the section nav json response status code.
    $this->drupalGet('taxonomy/term/' . $term_2_id . '/mobile-nav');
    $this->assertSession()->statusCodeEquals(400);

    // Verify the section nav json response status code.
    $this->drupalGet('taxonomy/term/' . $term_3_id . '/section-nav');
    $this->assertSession()->statusCodeEquals(400);

    // Verify the section nav json response status code.
    $this->drupalGet('taxonomy/term/' . $term_3_id . '/mobile-nav');
    $this->assertSession()->statusCodeEquals(400);
  }

  /**
   * Tests for a the megamenu json api.
   */
  public function tryMegamenuApi() {
    // Loading a YAML file or a YAML string.
    $yaml_file = \Drupal::service('extension.list.module')->getPath('cgov_site_section') . '/tests/JsonDataFieldTestData.yml';
    $yaml_file_data = file_get_contents($yaml_file);
    $yaml = new Parser();
    $yaml_data = $yaml->parse($yaml_file_data);

    // Create published megamenu block.
    // Custom block ID must be a number that is not in the database.
    $max_id = (int) \Drupal::entityQueryAggregate('block_content')
      ->accessCheck(FALSE)
      ->aggregate('id', 'max')
      ->execute()[0]['id_max'];
    $test_id = $max_id + mt_rand(1000, 1000000);
    $info = $this->randomMachineName();
    $block_array = [
      'info' => $info,
      'field_yaml_content' => ['value' => $yaml_data],
      'type' => 'ncids_mega_menu_content',
      'id' => $test_id,
    ];
    $published_block = BlockContent::create($block_array);
    $published_block->enforceIsNew(TRUE);
    $published_block->save();
    $published_block_id = $published_block->id();

    // Create site section term 1.
    $term_1 = Term::create([
      'name' => $this->randomMachineName(),
      'field_ncids_mega_menu_contents' => [
        'target_id' => $published_block_id,
      ],
      'vid' => 'cgov_site_sections',
      'status' => 1,
    ]);
    $term_1->save();
    $term_1_id = $term_1->id();

    // Create site section term 2.
    $term_2 = Term::create([
      'name' => $this->randomMachineName(),
      'vid' => 'cgov_site_sections',
      'status' => 1,
    ]);
    $term_2->save();
    $term_2_id = $term_2->id();

    // Assert the megamenu json api URL.
    // Verify the megamenu json response status code.
    $this->drupalGet('taxonomy/term/' . $term_1_id . '/mega-menu');
    $this->assertSession()->statusCodeEquals(200);

    // Verify the megamenu json response status code.
    $this->drupalGet('taxonomy/term/' . $term_2_id . '/mega-menu');
    $this->assertSession()->statusCodeEquals(404);
  }

}
