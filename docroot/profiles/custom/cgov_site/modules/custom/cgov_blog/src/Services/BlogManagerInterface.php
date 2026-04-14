<?php

namespace Drupal\cgov_blog\Services;

use Drupal\node\NodeInterface;

/**
 * Methods for retrieving a related Blog Series.
 */
interface BlogManagerInterface {

  /**
   * Get Blog Series from the current route.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The matched blog series.
   */
  public function getBlogSeriesFromRoute();

  /**
   * The topics associated to the blog series.
   *
   * @param \Drupal\node\NodeInterface $series
   *   The blog series.
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   The loaded topics for the blog series.
   */
  public function getTopicsBySeries(NodeInterface $series);

  /**
   * The topics associated to the blog series through the series ID.
   *
   * @param string|int $id
   *   The blog series id.
   * @param string $langcode
   *   The current language of the series.
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   The loaded topics for the blog series.
   */
  public function getTopicsBySeriesId($id, $langcode);

  /**
   * Gets the current entity.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface|false
   *   The current entity from route matcher.
   */
  public function getCurrentEntity();

  /**
   * Get Blog Series topic based on field_pretty_url.
   *
   * @param \Drupal\node\NodeInterface $blog_series
   *   The blog series.
   *
   * @return \Drupal\taxonomy\Entity\Term|null
   *   The blog topics.
   */
  public function getSeriesTopicByUrl(NodeInterface $blog_series);

  /**
   * Get a single topic taxonomy object.
   *
   * @param string $tid
   *   A taxonomy term ID.
   * @param string|false $lang
   *   A language code (optional).
   *
   * @return \Drupal\taxonomy\Entity\Term
   *   The blog topics.
   */
  public function loadBlogTopic($tid, $lang);

  /**
   * The the URL path for a node based on NID.
   *
   * @param string $nid
   *   Node ID of content item.
   * @param string|null $lang
   *   Optional langcode.
   *
   * @return \Drupal\Core\Url|string
   *   The path to the node.
   */
  public function getBlogPathFromNid($nid, $lang);

  /**
   * Create a node object given an nid.
   *
   * @param string $nid
   *   A node ID.
   *
   * @return \Drupal\node\Entity\Node
   *   The loaded node from the $nid.
   */
  public function getNodeFromNid($nid);

  /**
   * Return query results based on date posted.
   *
   * @param string $type
   *   Content type or bundle.
   * @param int $series_id
   *   The blog series id.
   *
   * @return string[]
   *   An array of ids.
   */
  public function getNodesByPostedDateAsc($type, $series_id);

  /**
   * Return the title for blog series.
   *
   * @param string $year
   *   Year value.
   * @param bool $includeTopic
   *   Should the title include the topic?
   * @param \Drupal\node\Entity\Node $blog_series
   *   Node object.
   *
   * @return string
   *   Blog series title.
   */
  public function getBlogSeriesTitle($year, $includeTopic, $blog_series);

}
