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
   * The URL path for the blog series.
   *
   * @param \Drupal\node\NodeInterface $blog_series
   *   The blog series.
   * @param mixed $queryParams
   *   An associative array of the URL query parameter.
   *
   * @return string
   *   The path to the blog series.
   */
  public function getSeriesPath(NodeInterface $blog_series, $queryParams = []);

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
   * Gets the filtered topics that have blog posts with them.
   *
   * @param \Drupal\node\NodeInterface $blog_series
   *   The blog series.
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   An array of filtered topics.
   */
  public function getFilteredTopicsBySeries(NodeInterface $blog_series);

  /**
   * Gets the current entity.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface|false
   *   The current entity from route matcher.
   */
  public function getCurrentEntity();

  /**
   * Gets the featured posts from the blog series.
   *
   * @param \Drupal\node\NodeInterface $blog_series
   *   The blog series.
   *
   * @return \Drupal\node\Entity\Node[]
   *   An array of featured post nodes.
   */
  public function getSeriesFeaturedPosts(NodeInterface $blog_series);

  /**
   * Return query results based on date posted.
   *
   * @param string $type
   *   Content type or bundle.
   *
   * @return \Drupal\node\Entity\Node[]
   *   An array of all the nodes by posted dates.
   */
  public function getNodesByPostedDateDesc($type);

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
   *
   * @return string[]
   *   An array of ids.
   */
  public function getNodesByPostedDateAsc($type);

  /**
   * Return the title for blog series.
   *
   * @param string $month
   *   Month value.
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
  public function getBlogSeriesTitle($month, $year, $includeTopic, $blog_series);

}
