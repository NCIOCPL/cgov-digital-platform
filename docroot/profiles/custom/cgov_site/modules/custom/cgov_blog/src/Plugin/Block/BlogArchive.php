<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block for the Cgov Blog right rail archive.
 *
 * @Block(
 *   id = "cgov_blog_archive",
 *   admin_label = @Translation("Cgov Blog Archive"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogArchive extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The BlogManager object.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  public $blogManager;

  /**
   * An entity query.
   *
   * @var Drupal\Core\Entity\Query\QueryFactory
   */
  protected $entityQuery;

  /**
   * Constructs a blog entity object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_blog\Services\BlogManagerInterface $blog_manager
   *   A blog manager object.
   * @param \Drupal\Core\Entity\Query\QueryFactory $entity_query
   *   An entity query.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager,
    QueryFactory $entity_query
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blogManager = $blog_manager;
    $this->entityQuery = $entity_query;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_blog.blog_manager'),
      $container->get('entity.query')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    // If our entity exists, get the nid (content id) and bundle (content type).
    if ($curr_entity = $this->blogManager->getCurrentEntity()) {
      $content_id = $curr_entity->id();
      $content_type = $curr_entity->bundle();
    }

    // TODO: Add check for year vs. month vs. none.
    $archive_years = $this->drawArchiveByYear($content_id, $content_type);
    $build = [
      '#archive_years' => $archive_years,
    ];

    /*
    1. Count totals for each year
    2. Further sort all Blog Posts by month (if flag is set)
     */
    return $build;
  }

  /**
   * Get a collection of years.
   *
   * @param string $cid
   *   The nid of the current content item.
   * @param string $content_type
   *   The content type machine name.
   */
  private function getMonthsYears($cid, $content_type) {
    // Build our query object.
    $query = $this->entityQuery->get('node');
    $query->condition('status', 1);
    $query->condition('type', $content_type);
    $query->sort('field_date_posted', 'DESC');
    $entity_ids = $query->execute();

    // Create series filter.
    $filter_node = $this->blogManager->getNodeStorage()->load($cid);
    $filter_series = $filter_node->field_blog_series->target_id;

    // Build associative array.
    foreach ($entity_ids as $entid) {
      $node = $this->blogManager->getNodeStorage()->load($entid);
      $node_series = $node->field_blog_series->target_id;

      if ($node_series == $filter_series) {
        $date = $node->field_date_posted->value;
        $date = explode('-', $date);

        $blog_links[] = [
          'year' => $date[0],
          'month' => $date[1],
        ];
      }
    }
    return $blog_links;
  }

  /**
   * Get a collection of years.
   *
   * @param string $cid
   *   The nid of the current content item.
   * @param string $content_type
   *   The content type machine name.
   */
  private function drawArchiveByYear($cid, $content_type) {
    $archive = [];

    // Get an array of blog field collections to populate links.
    $blog_links = $this->getMonthsYears($cid, $content_type);
    foreach ($blog_links as $link) {
      $years[] = $link['year'];
    }

    // Get counts and values for each available year.
    if (isset($years) && $years[0]) {
      foreach (array_count_values($years) as $year => $count) {
        $archive[$year] = strval($count);
      }
    }

    return $archive;
  }

}
