<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/*
 * NOTE: this is copied almost word for word from the CgovPager.php plugin,
 * which in turn borrows heavily from LanguageBar.php. We should make
 * commonly used functions like such as getCurrEntity() part of a base
 * class or library.
 */

/**
 * Provides a block for the Cgov Blog right rail archive.
 *
 * @Block(
 *   id = "cgov_blog_archive",
 *   admin_label = @Translation("Cgov Blog Archive block"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogArchive extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  /**
   * An entity query.
   *
   * @var Drupal\Core\Entity\Query\QueryFactory
   */
  protected $entityQuery;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a blog entity object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   * @param \Drupal\Core\Entity\Query\QueryFactory $entity_query
   *   An entity query.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    RouteMatchInterface $route_matcher,
    QueryFactory $entity_query,
    EntityTypeManagerInterface $entity_type_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatcher = $route_matcher;
    $this->entityQuery = $entity_query;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_route_match'),
      $container->get('entity.query'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $my_archive_markup = $this->drawDummyContent();
    // Ksm($my_archive_markup);!
    $build = [
      '#type' => 'block',
      '#markup' => $my_archive_markup,
    ];

    /*
    1. Count totals for each year
    2. Further sort all Blog Posts by month (if flag is set)
     */
    return $build;
  }

  /**
   * Draw dummy content.
   */
  private function drawDummyContent() {
    $markup = '
      <!-- populated with dummy values for template front end -->
      <h4>2019</h4>
      <ul>
        <li class="month">March (0)</li>
        <li class="month"><a class href="?filter[year]=2019&filter[month]=2">February</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2019&filter[month]=1">January</a> (6)</li>
      </ul>
      <h4>2018</h4>
      <ul>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=12">December</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=11">November</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=10">October</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=9">September</a> (11)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=8">August</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=7">July</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=6">June</a> (12)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=5">May</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=4">April</a> (10)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=3">March</a> (11)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=2">February</a> (11)</li>
        <li class="month"><a class href="?filter[year]=2018&filter[month]=1">January</a> (10)</li>
      </ul>
      <h4>2017</h4>
      <ul>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=12">December</a> (11)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=11">November</a> (13)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=10">October</a> (11)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=9">September</a> (12)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=8">August</a> (14)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=7">July</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=6">June</a> (13)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=5">May</a> (10)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=4">April</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=3">March</a> (11)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=2">February</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2017&filter[month]=1">January</a> (7)</li>
      </ul>
      <h4>2016</h4>
      <ul>
        <li class="month"><a class href="?filter[year]=2016&filter[month]=12">December</a> (8)</li>
        <li class="month"><a class href="?filter[year]=2016&filter[month]=11">November</a> (8)</li>
        <li class="month"><a class href="?filter[year]=2016&filter[month]=10">October</a> (9)</li>
        <li class="month"><a class href="?filter[year]=2016&filter[month]=9">September</a> (11)</li>
        <li class="month"><a class href="?filter[year]=2016&filter[month]=8">August</a> (8)</li>
        <li class="month"><a class href="?filter[year]=2016&filter[month]=7">July</a> (9)</li>
      </ul>
    ';
    return $markup;
  }

}
