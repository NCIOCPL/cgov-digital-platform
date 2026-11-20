<?php

namespace Drupal\Tests\cgov_migration\Unit;

use Drupal\cgov_migration\Plugin\migrate\destination\PdqDrugInformationSummaryNode;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\Core\Entity\RevisionableStorageInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate\Row;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;
use Drupal\Tests\UnitTestCase;
use Drupal\user\UserInterface;

/**
 * Tests the PDQ DIS migration destination.
 *
 * @group cgov_migration
 */
class PdqDrugInformationSummaryNodeTest extends UnitTestCase {

  /**
   * Tests that a missing CDR ID creates a published PDQ-owned node.
   */
  public function testCreatesMissingNode(): void {
    $query = $this->createMock(QueryInterface::class);
    $query->method('condition')->willReturnSelf();
    $query->method('accessCheck')->willReturnSelf();
    $query->method('execute')->willReturn([]);

    $node = $this->createNodeMock(99);
    $node_storage = $this->createMock(RevisionableStorageInterface::class);
    $node_storage->method('getQuery')->willReturn($query);
    $node_storage->expects($this->once())
      ->method('create')
      ->with([
        'type' => 'pdq_drug_information_summary',
        'langcode' => 'en',
        'uid' => 7,
        'status' => 1,
        'moderation_state' => 'published',
      ])
      ->willReturn($node);
    $node_storage->expects($this->once())->method('resetCache')->with([99]);

    $user = $this->createMock(UserInterface::class);
    $user->method('id')->willReturn(7);
    $user_storage = $this->createMock(EntityStorageInterface::class);
    $user_storage->expects($this->once())
      ->method('loadByProperties')
      ->with(['name' => 'PDQ', 'status' => 1])
      ->willReturn([7 => $user]);

    $destination = $this->createDestination($node_storage, $user_storage);
    $this->assertSame([99], $destination->import($this->createRow()));
  }

  /**
   * Tests that an existing CDR ID updates its latest revision.
   */
  public function testUpdatesExistingNode(): void {
    $query = $this->createMock(QueryInterface::class);
    $query->method('condition')->willReturnSelf();
    $query->method('accessCheck')->willReturnSelf();
    $query->method('execute')->willReturn([42]);

    $node = $this->createNodeMock(42);
    $node_storage = $this->createMock(RevisionableStorageInterface::class);
    $node_storage->method('getQuery')->willReturn($query);
    $node_storage->expects($this->never())->method('create');
    $node_storage->expects($this->once())->method('getLatestRevisionId')->with(42)->willReturn(84);
    $node_storage->expects($this->once())->method('loadRevision')->with(84)->willReturn($node);
    $node_storage->expects($this->once())->method('resetCache')->with([42]);

    $user_storage = $this->createMock(EntityStorageInterface::class);
    $user_storage->expects($this->never())->method('loadByProperties');

    $destination = $this->createDestination($node_storage, $user_storage);
    $this->assertSame([42], $destination->import($this->createRow()));
  }

  /**
   * Creates the destination plugin with mocked entity storage.
   */
  private function createDestination(RevisionableStorageInterface $node_storage, EntityStorageInterface $user_storage): PdqDrugInformationSummaryNode {
    $term = $this->createMock(TermInterface::class);
    $term->method('id')->willReturn(5);
    $term_storage = $this->createMock(EntityStorageInterface::class);
    $term_storage->method('loadByProperties')->willReturn([5 => $term]);

    $entity_type_manager = $this->createMock(EntityTypeManagerInterface::class);
    $entity_type_manager->method('getStorage')->willReturnCallback(
      static fn(string $entity_type) => match ($entity_type) {
        'node' => $node_storage,
        'user' => $user_storage,
        'taxonomy_term' => $term_storage,
      }
    );

    return new PdqDrugInformationSummaryNode(
      [],
      'pdq_dis_node',
      [],
      $this->createMock(MigrationInterface::class),
      $entity_type_manager,
      $this->createMock(Connection::class),
    );
  }

  /**
   * Creates a node mock suitable for destination writes.
   */
  private function createNodeMock(int $nid): NodeInterface {
    $language = $this->createMock(LanguageInterface::class);
    $language->method('getId')->willReturn('en');

    $node = $this->createMock(NodeInterface::class);
    $node->method('language')->willReturn($language);
    $node->method('setTitle')->willReturnSelf();
    $node->method('set')->willReturnSelf();
    $node->method('id')->willReturn($nid);
    $node->expects($this->once())->method('setNewRevision')->with(TRUE);
    $node->expects($this->once())->method('setRevisionLogMessage');
    $node->expects($this->once())->method('save');
    return $node;
  }

  /**
   * Creates a processed migration row for a single drug.
   */
  private function createRow(): Row {
    $row = new Row(['cdr_id' => 487488], ['cdr_id' => ['type' => 'integer']]);
    $values = [
      'cdr_id' => 487488,
      'title' => 'Imatinib Mesylate',
      'browser_title' => 'Imatinib Mesylate',
      'description' => 'Description.',
      'site_section_path' => '/about-cancer/treatment/drugs',
      'pretty_url' => 'imatinibmesylate',
      'pronunciation' => 'pronunciation',
      'audio_id' => '706105',
      'intro_text' => '<p>Description.</p>',
      'drug_info_type' => 'single',
      'us_brand_names' => ['Gleevec'],
      'drugs_in_combination' => '',
      'fda_url' => 'https://example.org/label',
      'body_sections' => [],
      'related_resources' => [],
      'posted_date' => '2006-10-05',
      'updated_date' => '2025-01-09',
      'reviewed_date' => '2026-10-26',
      'date_display_mode' => ['posted', 'updated'],
      'public_use' => 0,
    ];
    foreach ($values as $property => $value) {
      $row->setDestinationProperty($property, $value);
    }
    return $row;
  }

}
