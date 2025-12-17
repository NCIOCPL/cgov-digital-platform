<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsEmbeddedEntitiesTransformer;
use Drupal\Tests\UnitTestCase;
use Psr\Log\LoggerInterface;

/**
 * Tests Ncids Embedded Entities Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsEmbeddedEntitiesTransformer
 */
class NcidsEmbeddedEntitiesTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsEmbeddedEntitiesTransformer
   */
  protected $transformer;

  /**
   * The mock logger.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject&\Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->logger = $this->createMock(LoggerInterface::class);
    $this->transformer = new NcidsEmbeddedEntitiesTransformer($this->logger);
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings=""' .
      '>&nbsp;</drupal-entity>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings ' .
        'data-html-transformer="NcidsEmbeddedEntitiesTransformer"' .
      '>&nbsp;</drupal-entity>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';

    $processed_html = $this->transformer->preProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Test postProcessHtml method.
   *
   * @covers ::postProcessHtml
   */
  public function testPostProcessHtml() {
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings ' .
        'data-html-transformer="NcidsEmbeddedEntitiesTransformer"' .
      '>&nbsp;</drupal-entity>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings' .
      '>&nbsp;</drupal-entity>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Test external link block transformation.
   *
   * @covers ::transform
   */
  public function testExternalLinkBlockHtml() {
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_block_content" ' .
        'data-entity-embed-display="view_mode:block_content.embedded_feature_card"' .
      '>&nbsp;</drupal-entity>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_external_link_block" ' .
        'data-entity-embed-display="view_mode:block_content.embedded_feature_card"' .
      '>&nbsp;</drupal-entity>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($original_html);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected_html, $post_processed, 'Should transform external link blocks with new embed button.');
  }

  /**
   * Tests wrong view mode on external link block transformation.
   *
   * @covers ::transform
   */
  public function testErrorExternalLinkBlockHtml() {
    $this->logger->expects($this->once())
      ->method('error')
      ->with(
        'Error Message: uuid @uuid with unknown view mode @view_mode',
        [
          '@uuid' => 'e69980a2-d521-4f68-b7d8-98aa59921444',
          '@view_mode' => 'view_mode:block_content.wrong_one',
        ]
    );
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_block_content" ' .
        'data-entity-embed-display="view_mode:block_content.wrong_one"' .
      '>&nbsp;</drupal-entity>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_block_content" ' .
        'data-entity-embed-display="view_mode:block_content.wrong_one"' .
      '>&nbsp;</drupal-entity>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($original_html);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected_html, $post_processed, 'Should transform external link blocks with new embed button.');
  }

  /**
   * Test external link block migration with embedded_feature_card_no_image.
   *
   * @covers ::transform
   */
  public function testExternalLinkBlockNoImageHtml() {
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_block_content" ' .
        'data-entity-embed-display="view_mode:block_content.embedded_feature_card_no_image"' .
      '>&nbsp;</drupal-entity>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_external_link_block" ' .
        'data-entity-embed-display="view_mode:block_content.embedded_feature_card_no_image"' .
      '>&nbsp;</drupal-entity>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($original_html);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected_html, $post_processed, 'Should transform external link blocks with new embed button for no image view mode.');
  }

  /**
   * Test content block migration with block_content.full.
   *
   * @covers ::transform
   */
  public function testContentBlock() {
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_block_content" ' .
        'data-entity-embed-display="view_mode:block_content.full"' .
      '>&nbsp;</drupal-entity>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-entity-type="block_content" ' .
        'data-entity-uuid="e69980a2-d521-4f68-b7d8-98aa59921444" ' .
        'data-embed-button="insert_content_block_content" ' .
        'data-entity-embed-display="view_mode:block_content.full"' .
      '>&nbsp;</drupal-entity>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($original_html);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected_html, $post_processed, 'Should transform content block.');
  }

}
