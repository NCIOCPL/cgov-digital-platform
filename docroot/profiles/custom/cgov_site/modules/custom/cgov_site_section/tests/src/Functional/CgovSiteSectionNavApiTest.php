<?php

namespace Drupal\Tests\cgov_site_section\Functional;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\Tests\BrowserTestBase;
use Drupal\taxonomy\Entity\Term;
use Drupal\node\Entity\Node;

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
  protected $defaultTheme = 'cgov_common';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
  }

  /**
   * Tests for a the section nav json api.
   */
  public function testSiteNavApi() {
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

}
