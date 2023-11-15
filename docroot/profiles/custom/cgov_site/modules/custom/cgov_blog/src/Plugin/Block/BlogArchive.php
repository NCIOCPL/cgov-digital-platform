<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\node\NodeInterface;
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
    $build = [];
    $series = $this->blogManager->getBlogSeriesFromRoute();

    // Set return values by Archive field selection.
    if (!isset($series)) {
      return $build;
    }
    $group_by = $series->field_archive_group_by->getValue()['0']['value'];
    $years_back = $series->field_archive_back_years->getValue()['0']['value'];
    $archive = $this->drawArchiveData(intval($years_back), $group_by, $series);
    $path = $this->blogManager->getSeriesPath($series, []);
    /*
     * Pass custom data to the block inside '#cgov_block_data'.
     * Otherwise render array is invalid.
     */
    $build = [
      '#cgov_block_data' => [
        'archive_data' => $archive,
        'archive_granularity' => $group_by,
        'archive_path' => $path,
      ],
      '#cache' => [
        'tags' => [
          'node:' . $series->id(),
        ],
      ],
    ];
    return $build;
  }

  /**
   * Get a collection of years and months.
   *
   * @param int $years_back
   *   The number of archive years to show.
   * @param string $group_by
   *   Archive granularity (years vs. months).
   * @param \Drupal\node\NodeInterface $series
   *   The blog series.
   *
   * @return array
   *   Either an array of months, years, or an empty array.
   */
  private function drawArchiveData($years_back, $group_by, NodeInterface $series) {
    // Get an array of years and months.
    $archive_dates = $this->getMonthsAndYears($series);
    $min_year = intval(date('Y') - $years_back);

    // Get data based on group_by setting.
    if ($group_by == 'month') {
      $archive = $this->getByMonth($archive_dates, $min_year);
    }
    else {
      $archive = $this->getByYear($archive_dates, $min_year);
    }
    return $archive;
  }

  /**
   * Get a collection of years and months.
   *
   * @param \Drupal\node\NodeInterface $series
   *   The blog series.
   *
   * @return array
   *   An array of months and years.
   */
  private function getMonthsAndYears(NodeInterface $series) {
    // Get all available Blog Posts in current language.
    $dates_raw = $this->getSortedDates($series);
    $dates = [];

    /*
     * Build associative array. Iterate through each date and
     * format as date[year] => [month].
     */
    foreach ($dates_raw as $date) {
      $date = explode('-', $date);
      $dates[] = [
        'year' => $date[0],
        'month' => $date[1],
      ];
    }
    return $dates;
  }

  /**
   * Get a descending array of Blog Post dates.
   *
   * @param \Drupal\node\NodeInterface $series
   *   The blog series.
   *
   * @return array
   *   The sorted posted dates.
   */
  private function getSortedDates(NodeInterface $series) {
    // Get all available Blog Posts in current language.
    $nodes = $this->blogManager->getNodesByPostedDateDesc('cgov_blog_post');
    $dates = [];

    // Get current series ID.
    $filter_series = $series->id();

    /*
     * Get node dates where field_blog_series matches the filter series.
     */
    foreach ($nodes as $node) {
      $field_blog_series = $node->field_blog_series->target_id;
      // Get the date posted field, then split for the link values.
      if ($field_blog_series == $filter_series) {
        $dates[] = $node->field_date_posted->value;
      }
    }

    // Do rsort() to handle improperly sorted dates from query.
    rsort($dates);
    return $dates;
  }

  /**
   * Get a collection of years.
   *
   * @param array $arch_dates
   *   Collection of blog post dates for archive.
   * @param int $min_year
   *   The earliest archive year to show.
   *
   * @return array
   *   Archieve dates by year.
   */
  private function getByYear(array $arch_dates, $min_year) {
    $archive = [];

    // Add each year value to an array.
    foreach ($arch_dates as $arch_date) {
      $years[] = $arch_date['year'];
    }

    // Get counts and values for each available year.
    if (isset($years) && $years[0]) {
      foreach (array_count_values($years) as $year => $count) {
        if (intval($year) > $min_year) {
          $archive[$year] = strval($count);
        }
      }
    }
    return $archive;
  }

  /**
   * Get a collection of months.
   *
   * @param array $arch_dates
   *   Collection of blog post dates for archive.
   * @param int $min_year
   *   The earliest archive year to show.
   *
   * @return array
   *   Archieve dates by year.
   */
  private function getByMonth(array $arch_dates, $min_year) {
    $archive = [];

    // Add each year-month value to an array.
    foreach ($arch_dates as $arch_date) {
      // To use array_count_values, year and month must be a single string.
      $yearmonths[] = $arch_date['year'] . '-' . $arch_date['month'];
    }

    // Get values and count of each available year-month combination.
    if (isset($yearmonths) && $yearmonths[0]) {
      foreach (array_count_values($yearmonths) as $yearmonth => $count) {
        $yyyy_mm = explode('-', $yearmonth);
        $year = $yyyy_mm[0];
        $month = $yyyy_mm[1];

        // Only add items up to the selected years_back.
        if (intval($year) > $min_year) {
          $archive[$year][$month] = $count;
        }
      }

    }
    return $archive;
  }

}
