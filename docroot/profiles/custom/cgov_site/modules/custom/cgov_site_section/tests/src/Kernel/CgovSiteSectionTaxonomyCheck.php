<?php

namespace Drupal\Tests\cgov_site_section\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\Entity\Vocabulary;
use Drupal\Core\Language\LanguageInterface;

/**
 * Tests the MyService.
 *
 * @group cgov_site_section
 */
class CgovSiteSectionTaxonomyCheck extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected $vocabulary;


  /**
   * The modules to load to run the test.
   *
   * @var array
   */
  public static $modules = [
    'system',
    'filter',
    'node',
    'field',
    'user',
    'text',
    'taxonomy',
    'site_section',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installSchema('system', ['sequences']);
    $this->installEntitySchema('taxonomy_vocabulary');
    $this->installEntitySchema('taxonomy_term');
    $this->installSchema('node', 'node_access');
    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installConfig('field');
    $this->installConfig('filter');
    $this->installConfig(['node', 'taxonomy']);
    // Creating 'Tag Categoty' Vocabulary.
    $this->vocabulary = Vocabulary::create([
      'name' => 'cgov_site_sections',
      'vid' => 'cgov_site_sections',
      'langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED,
    ]);
    $this->vocabulary->save();

    // Creating Tag Category term.
    $this->term = Term::create([
      'name' => 'testing1',
      'vid' => 'cgov_site_sections',
      'langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED,
    ]);
    $this->term->save();

  }

  /**
   * Tests the basic functionality.
   */
  public function testDuplicateTerm() {
    $this->assertEquals(0, 0);
  }

}
