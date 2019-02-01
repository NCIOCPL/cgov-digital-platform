<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\Path\AliasManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Path\CurrentPathStack;

/**
 * Cgov Navigation Manager Service.
 *
 * Use to retrieve innformation and entities related to the Site Section
 * taxonomy term tree.
 */
class CgovNavigationManager implements CgovNavigationManagerInterface {

  /**
   * Retrieve raw path for the current request.
   *
   * @var \Drupal\Core\Path\CurrentPathStack
   */
  protected $currentPath;

  /**
   * Path alias manager.
   *
   * @var \Drupal\Core\Path\AliasManagerInterface
   */
  protected $pathAliasManager;

  /**
   * Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Entity Field Manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * Constructs a new CgovNavigationManager class.
   */
  public function __construct(
    CurrentPathStack $currentPath,
    AliasManagerInterface $pathAliasManager,
    EntityTypeManagerInterface $entityTypeManager,
    EntityFieldManagerInterface $entityFieldManager
    ) {
    $this->currentPath = $currentPath;
    $this->pathAliasManager = $pathAliasManager;
    $this->entityTypeManager = $entityTypeManager;
    $this->entityFieldManager = $entityFieldManager;
    // $this->getClosestSiteSection();
    // $path = $this->currentPath->getPath();
    // $aliasedPath = $this->pathAliasManager->getAliasByPath($path);
    // $this->getNavRoot('field_breadcrumb_root');
  }

  /**
   * Retrieve closest Site Section Term by aliased path.
   *
   * Using the aliased path, we walk up the url (towards root)
   * ancestry until we find the first Site Section
   * matching the path fragment.
   *
   * @return \Drupal\taxonomy\Entity\Term|null
   *   Get closest site section. This should always
   *   at least return the root site section, but
   *   just in case...
   */
  public function getClosestSiteSection() {
    /* @var \Drupal\taxonomy\Entity\Term|null */
    $siteSection = NULL;
    /* @var string */
    $path = $this->currentPath->getPath();
    /* @var string */
    $aliasedPath = $this->pathAliasManager->getAliasByPath($path);
    $pathFragments = explode('/', trim($aliasedPath, '/'));
    for ($i = 0; $i <= count($pathFragments); $i++) {
      $pathTest = '/' . implode('/', array_slice($pathFragments, 0, count($pathFragments) - $i));
      /* @var \Drupal\taxonomy\Entity\Term */
      $siteSection = $this->getSiteSectionByComputedPath($pathTest);
      if ($siteSection) {
        break;
      }
    }
    return $siteSection;
  }

  /**
   * Retrieve Site Section by path.
   *
   * @param string $path
   *   Aliased path to look up in computed_path field
   *   on Site Section Terms.
   *
   * @return \Drupal\taxonomy\Entity\Term|null
   *   Term with computed_path field value matching
   *   given path.
   */
  public function getSiteSectionByComputedPath(string $path) {
    /* @var \Drupal\taxonomy\TermStorageInterface */
    $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');
    $queryResults = $termStorage->loadByProperties(['computed_path' => $path]);
    if (count($queryResults) === 0) {
      return;
    }
    // Something horrible has gone wrong if there is more
    // than one site section associated with an aliased path so we are
    // going to operate under the assumption that the associative array
    // returned by loadByProperties will either be empty or have exactly
    // one key value pair.
    $tid = array_keys($queryResults)[0];
    /* @var \Drupal\taxonomy\Entity\Term */
    $term = $queryResults[$tid];
    return $term;
  }

  /**
   * Get Parent ID from Term ID.
   *
   * @param int $tid
   *   Term ID.
   *
   * @return int|null
   *   Term id of immediate parent term.
   */
  public function getParentId(int $tid) {
    /* @var \Drupal\taxonomy\TermStorageInterface */
    $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');
    /* @var \Drupal\Core\Entity\EntityInterface[] */
    $parents = $termStorage->loadParents($tid);
    // Load parents return an associative array where key is $tid
    // obviating the need to query the term itself for its id.
    if (count(array_keys($parents))) {
      return array_keys($parents)[0];
    }
  }

  /**
   * Return ordered array of Term Ancestor Ids.
   *
   * Unfortunately, the built-in methods for TermStorage
   * only return flatmaps representing Term ancestry.
   * In order to return an ordered array, sorted
   * hierarchically, we need to walk up the parent chain
   * manually.
   * (We could load all parents and then do a sort in place
   * but I think this will be clearer for now).
   *
   * NOTE: This method operates under the assumption that all
   * Site Sections can have only one parent. If that changes,
   * good luck.
   *
   * @param int $tid
   *   ID of base term.
   *
   * @return int[]
   *   Array of term ids ordered from root->child
   *   representing the ancestry of a term.
   */
  public function generateTermAncestry(int $tid) {
    /* @var int[] */
    $ancestry = [$tid];
    $parentId = $this->getParentId($tid);
    while ($parentId !== NULL) {
      array_unshift($ancestry, $parentId);
      $parentId = $this->getParentId($parentId);
    }
    return $ancestry;
  }

  /**
   * Check if field name is valid.
   *
   * Just in case a call to this service passes
   * an invalid field name to use as a test
   * for determining something like nav root,
   * hide in nav, depth...
   *
   * @param string $fieldName
   *   Field name.
   *
   * @return bool
   *   Represents valid field on site section term entity.
   */
  public function isValidSiteSectionField(string $fieldName) {
    /* @var \Drupal\Core\Field\FieldDefinitionInterface[] */
    $definitions = $this->entityFieldManager->getFieldDefinitions('taxonomy_term', 'cgov_site_sections');
    return isset($definitions[$fieldName]);
  }

  /**
   * Get Term Id of Nav Root.
   *
   * Provide the appropriate field for which you
   * want the nav root Term id. eg 'field_breadcrumb_root'.
   *
   * This function calls another function that retrieves the entire
   * ancestry starting from the Nav Root and returns only the first
   * element (the Nav Root).
   *
   * @param string $testFieldName
   *   Name of field to check for root status.
   *
   * @return int[]|null
   *   Term id of nav root for given term.
   */
  public function getNavRoot(string $testFieldName) {
    /* @var int[] */
    $ancestryFromNavRoot = $this->getAncestryFromNavRoot($testFieldName);
    // Just in case an invalid field name was passed.
    if ($ancestryFromNavRoot && count($ancestryFromNavRoot)) {
      return $ancestryFromNavRoot[0];
    }
  }

  /**
   * Get the path from nav root to current term.
   *
   * Returns an ordered list of term ids representing
   * the direct route from the nav root to the closest
   * site section.
   *
   * @param string $testFieldName
   *   Name of field to check for root status.
   *
   * @return int[]|null
   *   Array of term ids ordered from navroot->child
   *   representing the ancestry of a term.
   */
  public function getAncestryFromNavRoot(string $testFieldName) {
    // Valid fields are like 'field_breadcrumb_root'.
    // Invalid fields are like 'field_hockey'.
    if (!$this->isValidSiteSectionField($testFieldName)) {
      return;
    }
    // Every path should be able to reach at least one
    // site section, falling all the way back to the root.
    /* @var \Drupal\taxonomy\Entity\TermInterface */
    $siteSection = $this->getClosestSiteSection();
    if ($siteSection) {
      $tid = intval($siteSection->id());
      /* @var int[] */
      $siteSectionAncestry = $this->generateTermAncestry($tid);
      kint($siteSectionAncestry);
      $navRootIndex = 0;
      for ($i = 0; $i < count($siteSectionAncestry); $i++) {
        $tid = $siteSectionAncestry[$i];
        /* @var \Drupal\taxonomy\Entity\TermInterface */
        $term = $this->entityTypeManager->getStorage('taxonomy_term')->load($tid);
        // Returns a bool in the form of 0 or 1.
        $isNavRoot = $term->{$testFieldName}->value;
        if ($isNavRoot) {
          $navRootIndex = $i;
          break;
        }
      }
      $ancestryFromNavRootToClosest = array_slice($siteSectionAncestry, $navRootIndex);
      return $ancestryFromNavRootToClosest;
    }
  }

}
