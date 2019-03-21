<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
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
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blogManager = $blog_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_blog.blog_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    // If our entity exists, get the nid (content id) and bundle (content type).
    if ($curr_entity = $this->blogManager->getCurrentEntity()) {
      $content_id = $curr_entity->id();
      $series = $this->blogManager->getSeriesEntity();
      $group_by = $series->field_archive_group_by->getValue()['0']['value'];
      $years_back = $series->field_archive_back_years->getValue()['0']['value'];
    }
    else {
      return [];
    }

    // Set years_back to default of '5' if not set.
    $years_back = isset($years_back) ? intval($years_back) : 5;

    // Set return values by Archive field selection.
    if ($group_by == '1') {
      $archive = $this->drawArchiveByMonth($content_id, $years_back);
    }
    elseif ($group_by == '0') {
      $archive = $this->drawArchiveByYear($content_id, $years_back);
    }
    else {
      return [];
    }

    // Return our archive link array.
    $build = [
      '#archive_years' => $archive,
    ];
    return $build;
  }

  /**
   * Get a collection of years and months.
   *
   * @param string $cid
   *   The node id of the current content item.
   */
  private function getMonthsAndYears($cid) {

    // Get all available Blog Posts in current language.
    $post_nids = $this->blogManager->getNodesByPostedDateDesc('cgov_blog_post', '');

    // Get current series ID.
    $filter_series = $this->blogManager->getSeriesId();

    /*
     * Build associative array. Iterate through each Blog Post node and push
     * those where field_blog_series matches the filter series.
     */
    foreach ($post_nids as $post_nid) {
      $post_node = $this->blogManager->getNodeStorage()->load($post_nid);
      $field_blog_series = $post_node->field_blog_series->target_id;

      // Get the date posted field, then split for the link values.
      if ($field_blog_series == $filter_series) {
        $date = $post_node->field_date_posted->value;
        $date = explode('-', $date);
        $dates[] = [
          'year' => $date[0],
          'month' => $date[1],
        ];
      }
    }
    return $dates;
  }

  /**
   * Get a collection of years.
   *
   * @param string $cid
   *   The node id of the current content item.
   * @param string $years_back
   *   The number of archive years to show.
   */
  private function drawArchiveByYear($cid, $years_back) {

    // Get an array of years and months.
    $arch_dates = $this->getMonthsAndYears($cid);
    $min_date = intval(date('Y') - $years_back);
    $archive = [];

    // Add each year value to an array.
    foreach ($arch_dates as $arch_date) {
      $years[] = $arch_date['year'];
    }

    // Get counts and values for each available year.
    if (isset($years) && $years[0]) {
      foreach (array_count_values($years) as $year => $count) {
        if (intval($year) > $min_date) {
          $archive[$year] = strval($count);
        }
      }
    }
    return $archive;
  }

  /**
   * Get a collection of years and months. TODO: Replace dummy content.
   *
   * @param string $cid
   *   The node id of the current content item.
   * @param string $years_back
   *   The number of archive years to show.
   */
  private function drawArchiveByMonth($cid, $years_back) {
    /*
     * TODO: Filter by language.
     */
    return $this->drawArchiveByYear($cid);
  }

}
