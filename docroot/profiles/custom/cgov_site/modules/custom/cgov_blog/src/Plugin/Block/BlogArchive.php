<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\ContentEntityInterface;
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
   * Gets the current entity if there is one.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  private function getCurrEntity() {
    $params = $this->routeMatcher->getParameters()->all();
    foreach ($params as $param) {
      if ($param instanceof ContentEntityInterface) {
        // If you find a ContentEntityInterface stop iterating and return it.
        return $param;
      }
    }
    return FALSE;
  }

  /**
   * Create a new node storage instance.
   *
   * @return Drupal\Core\Entity\EntityStorageInterface
   *   The node storage or NULL.
   */
  private function getNodeStorage() {
    $node_storage = $this->entityTypeManager->getStorage('node');
    return isset($node_storage) ? $node_storage : NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    // If our entity exists, get the nid (content id) and bundle (content type).
    if ($curr_entity = $this->getCurrEntity()) {
      $content_id = $curr_entity->id();
      $content_type = $curr_entity->bundle();
    }

    $markup1 = $this->drawArchiveByYear($content_id, $content_type);
    // Ksm($markup1);!
    $build = [
      '#type' => 'block',
      '#markup' => $markup1,
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
    $filter_node = $this->getNodeStorage()->load($cid);
    $filter_series = $filter_node->field_blog_series->target_id;

    // Build associative array.
    foreach ($entity_ids as $entid) {
      $node = $this->getNodeStorage()->load($entid);
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

    // Get an array of blog field collections to populate links.
    $blog_links = $this->getMonthsYears($cid, $content_type);
    foreach ($blog_links as $blog_link) {
      $year_links[] = $blog_link['year'];
    }

    // Get counts and values for each available year. I hate php.
    if (isset($year_links) && 1 == 2) {
      foreach (array_count_values($year_links) as $year => $count) {
        $markup .= '<li>' . $year . ' (' . $count . ')</li>';
      }
    }
    return $markup;
  }

}
