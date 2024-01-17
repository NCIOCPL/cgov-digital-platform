<?php

namespace Drupal\Tests\cgov_site_section\Kernel;

use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\KernelTests\KernelTestBase;
use Drupal\taxonomy\Entity\Term;
use CgovPlatform\Tests\CgovSchemaExclusions;

/**
 * Tests for Site Section Root Taxonomy Setting.
 *
 * @group cgov_site_section
 */
class SectionParentTermConstraintValidatorTest extends KernelTestBase {

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
    'user',
    'path_alias',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();

    // These are special and cannot be installed as a dependency
    // for this module. So we have to install their bits separately.
    $this->installEntitySchema('user');
    $this->installEntitySchema('path_alias');
    $this->installSchema('system', ['sequences']);
    $this->installConfig(['system', 'user', 'path_alias']);

    // Install core and its dependencies.
    // This ensures that the install hook will fire, which sets up
    // the permissions for the roles we are testing below.
    \Drupal::service('module_installer')->install(['cgov_site_section']);

  }

  /**
   * Tests the basic functionality.
   */
  public function testRootTaxonomy() {

    // Test Case 1: Successfully Create Initial English Term.
    $en_term = Term::create([
      'name' => 'en_lang',
      'vid' => 'cgov_site_sections',
      'langcode' => 'en',
    ]);
    $violations_en = $en_term->validate();
    $this->assertEqual($violations_en->count(), 0);
    $en_term->save();

    // Test Case 2: Load the term back up for editing.
    $en_term = Term::load($en_term->id());
    $en_term->name = 'en_lang_updated';
    $violations_en = $en_term->validate();
    $this->assertEqual($violations_en->count(), 0);
    $en_term->save();

    // Test Case 3: Fail to Create Dupe English Term.
    $dupe_en_term = Term::create([
      'name' => 'english_term',
      'vid' => 'cgov_site_sections',
      'langcode' => 'en',
    ]);
    $violations_dupe_en = $dupe_en_term->validate();
    $this->assertEqual($violations_dupe_en->count(), 1);

    // Test Case 4: Deleting the Root term.
    $en_term->delete();
    // Recreating the root term.
    $en_term = Term::create([
      'name' => 'en_lang',
      'vid' => 'cgov_site_sections',
      'langcode' => 'en',
    ]);
    $violations_en = $en_term->validate();
    $this->assertEqual($violations_en->count(), 0);
    $en_term->save();

    /* Test for Not Specified language */
    // Test Case 5: Test for Not Specified langauge and Creating.
    $und_term = Term::create([
      'name' => 'undefined_lang',
      'vid' => 'cgov_site_sections',
      'langcode' => 'und',
    ]);
    $violations_und = $und_term->validate();
    $this->assertEqual($violations_und->count(), 0);
    $und_term->save();

    // Enable Spanish Language.
    ConfigurableLanguage::createFromLangcode('es')->save();

    // Test Case 6:  Successfully create Spanish with Existing English.
    $es_term = Term::create([
      'name' => 'spanish_term',
      'vid' => 'cgov_site_sections',
      'langcode' => 'es',
    ]);
    $violations_es = $es_term->validate();
    $this->assertEqual($violations_es->count(), 0);
    $es_term->save();

    // Test Case 7: Fail to create dupe Spanish.
    $dupe_es_term = Term::create([
      'name' => 'spanish_term',
      'vid' => 'cgov_site_sections',
      'langcode' => 'es',
    ]);
    $violations_dupe_es = $dupe_es_term->validate();
    $this->assertEqual($violations_dupe_es->count(), 1);

    // Enable German Language.
    ConfigurableLanguage::createFromLangcode('de')->save();

    // Test Case 8: Successfully create non-profile language
    // with Existing English.
    $de_term = Term::create([
      'name' => 'german_term',
      'vid' => 'cgov_site_sections',
      'langcode' => 'de',
    ]);
    $violations_de = $de_term->validate();
    $this->assertEqual($violations_de->count(), 0);
    $de_term->save();

    // Test Case 9: Load and update the term
    // with a different parent relation.
    $en_term = Term::load($en_term->id());
    $en_term->parent = ['target_id' => $es_term->id()];
    $violations_en = $en_term->validate();
    $this->assertEqual($violations_en->count(), 0);
    $en_term->save();

  }

}
