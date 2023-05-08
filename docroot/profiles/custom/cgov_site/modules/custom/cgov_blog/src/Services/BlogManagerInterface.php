<?php

namespace Drupal\cgov_blog\Services;

/**
 * Methods for retrieving a related Blog Series.
 */
interface BlogManagerInterface {

  /**
   * Get the current entity type.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface|false
   *   The retrieved entity, or FALSE if none found.
   */
  public function getCurrentEntity();

  /**
   * Get the associated Blog Series entity.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface|mixed
   *   The retrieved entity, or empty array if none found.
   */
  public function getSeriesEntity();

  /**
   * Get the in-usage blog categories.
   *
   * @return array
   *   The active topics, or an empty array if none found.
   */
  public function getActiveSeriesTopics();

  /**
   * Return the title for blog series..
   *
   * @param string $month
   *   Month value.
   * @param string $year
   *   Year value.
   * @param bool $includeTopic
   *   Should the title include the topic?
   * @param object $node
   *   Node object.
   *
   * @return string
   *   Blog series title.
   */
  public function getBlogSeriesTitle($month, $year, $includeTopic, $node);

  /**
   * The URL path for the blog series.
   *
   * @param mixed $queryParams
   *   An associative array of the URL query parameter.
   */
  public function getSeriesPath($queryParams = []);

  /**
   * Return query results based on date posted.
   *
   * @param string $type
   *   Content type or bundle.
   */
  public function getNodesByPostedDateDesc($type);

  /**
   * Get the Blog Series ID.
   */
  public function getSeriesId();

  /**
   * Create a node object given an nid.
   *
   * @param string $nid
   *   A node ID.
   *
   * @return mixed
   *   The node storage or NULL.
   */
  public function getNodeFromNid($nid);

  /**
   * Get a single topic taxonomy object.
   *
   * @param string $tid
   *   A taxonomy term ID.
   * @param string $lang
   *   A language code (optional).
   */
  public function loadBlogTopic($tid, $lang = NULL);

  /**
   * Get the Blog Featured content nodes.
   */
  public function getSeriesFeaturedPosts();

  /**
   * The the URL path for a node based on NID.
   *
   * @param string $nid
   *   Node ID of content item.
   * @param string $lang
   *   Optional langcode.
   */
  public function getBlogPathFromNid($nid, $lang = NULL);

  /**
   * Return query results based on date posted.
   *
   * @param string $type
   *   Content type or bundle.
   */
  public function getNodesByPostedDateAsc($type);

  /**
   * Return list of terms for series..
   *
   * @param string $series_id
   *   The series node id.
   * @param string $language_id
   *   The series language.
   *
   * @return array
   *   Blog series terms.
   */
  public function getBlogTopicsForSeries($series_id, $language_id);

  /**
   * Get Blog Series topic based on field_pretty_url.
   */
  public function getSeriesTopicByUrl();

}
