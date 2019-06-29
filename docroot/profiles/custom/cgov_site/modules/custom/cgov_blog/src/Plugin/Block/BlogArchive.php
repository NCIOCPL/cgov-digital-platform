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
    $build = [];
    $series = $this->blogManager->getSeriesEntity();

    // Set return values by Archive field selection.
    if (!empty($series)) {
      $group_by = $series->field_archive_group_by->getValue()['0']['value'];
      $years_back = $series->field_archive_back_years->getValue()['0']['value'];
      $archive = $this->drawArchiveData($years_back, $group_by);
      $path = $this->blogManager->getSeriesPath();
      $build = [
        'archive_data' => $archive,
        'archive_granularity' => $group_by,
        'archive_path' => $path,
        '#cache' => [
          'tags' => [
            'node_list',
          ],
        ],
      ];
    }

    return $build;
  }

  /**
   * Get a collection of years and months.
   *
   * @param string $years_back
   *   The number of archive years to show.
   * @param string $group_by
   *   Archive granularity (years vs. months).
   */
  private function drawArchiveData($years_back, $group_by) {
    // Get an array of years and months.
    $archive_dates = $this->getMonthsAndYears();
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
   */
  private function getMonthsAndYears() {
    // Get all available Blog Posts in current language.
    $dates_raw = $this->getSortedDates();
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
   */
  private function getSortedDates() {
    // Get all available Blog Posts in current language.
    $nids = $this->blogManager->getNodesByPostedDateDesc('cgov_blog_post');
    $dates = [];

    // Get current series ID.
    $filter_series = $this->blogManager->getSeriesId();

    /*
     * Get node dates where field_blog_series matches the filter series.
     */
    foreach ($nids as $nid) {
      $node = $this->blogManager->getNodeFromNid($nid);
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
   * @param string $min_year
   *   The earliest archive year to show.
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
   * @param string $min_year
   *   The earliest archive year to show.
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
