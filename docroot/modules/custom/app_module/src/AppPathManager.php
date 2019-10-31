<?php

namespace Drupal\app_module;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\CacheDecorator\CacheDecoratorInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Path\AliasManagerInterface;
use Drupal\Core\Path\AliasStorageInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;

/**
 * The default app path manager implementation.
 */
class AppPathManager implements AppPathManagerInterface, CacheDecoratorInterface {

  /**
   * The alias manager service.
   *
   * @var \Drupal\Core\Path\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * The alias manager service.
   *
   * @var \Drupal\Core\Path\AliasStorageInterface
   */
  protected $aliasStorage;


  /**
   * The app path storage service.
   *
   * @var \Drupal\app_module\AppPathStorageInterface
   */
  protected $storage;

  /**
   * Cache backend service.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface
   */
  protected $cache;

  /**
   * The cache key to use when caching paths.
   *
   * @var string
   */
  protected $cacheKey;

  /**
   * Whether the cache needs to be written.
   *
   * @var bool
   */
  protected $cacheNeedsWriting = FALSE;

  /**
   * Language manager for get the default langcode when none is specified.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Holds the map of paths per language.
   *
   * @var array
   */
  protected $lookupMap = [];

  /**
   * Identifies if this has been initialized.
   *
   * @var bool
   */
  protected $isInitialized = FALSE;

  /**
   * Constructs an AppPathManager.
   *
   * @param \Drupal\Core\Path\AliasManagerInterface $alias_manager
   *   The core alias manager service.
   * @param \Drupal\Core\Path\AliasStorageInterface $alias_storage
   *   The core alias storage service.
   * @param \Drupal\app_module\AppPathStorageInterface $storage
   *   The app module path storage service.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache
   *   Cache backend.
   */
  public function __construct(
    AliasManagerInterface $alias_manager,
    AliasStorageInterface $alias_storage,
    AppPathStorageInterface $storage,
    LanguageManagerInterface $language_manager,
    CacheBackendInterface $cache
  ) {
    $this->aliasManager = $alias_manager;
    $this->aliasStorage = $alias_storage;
    $this->storage = $storage;
    $this->languageManager = $language_manager;
    $this->cache = $cache;
  }

  /**
   * Determines if an entity is a valid one for our purposes.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity.
   * @param string $app_field_id
   *   The name of the app module reference field.
   *
   * @return bool
   *   TRUE if the entity is good. FALSE if bad.
   */
  private function isValidEntity(EntityInterface $entity, $app_field_id) {
    // Skip if the entity does not have the path field.
    if (!($entity instanceof ContentEntityInterface) || !$entity->hasField('path')) {
      return FALSE;
    }

    // Skip if we don't actually have the requested field.
    if (!$entity->hasField($app_field_id)) {
      return FALSE;
    }

    // Only act if this is the default revision.
    if ($entity instanceof RevisionableInterface && !$entity->isDefaultRevision()) {
      return FALSE;
    }

    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function updateAppPath(EntityInterface $entity, $app_field_id = 'field_application_module') {

    // Check the entity.
    if (!$this->isValidEntity($entity, $app_field_id)) {
      return NULL;
    }

    // Get the alias information.
    $path = $this->getAliasEntry($entity);

    if (!$path) {
      return NULL;
    }

    // See if we have an app path.
    $app_path = $this->storage->load(['owner_pid' => $path['pid']]);

    if (!$app_path) {
      // There is no existing app path. Let's see if it is because we did not
      // have a populated field_application_module the last time we saved.
      return $this->registerAppPath($entity, $path, $app_field_id);
    }

    // We have an app path, and that means that we will just be updating the
    // app module id and data.
    $app_module_id = $entity->$app_field_id->target_id;
    $app_module_data = $entity->$app_field_id->data;

    $return = $this->storage->save(
      $app_path['owner_pid'],
      $app_path['owner_source'],
      $app_path['owner_alias'],
      $app_module_id,
      $app_module_data,
      $app_path['langcode'],
      $app_path['pid']
    );

    return $return;
  }

  /**
   * Helper function to create a NEW app path for an entity.
   *
   * This is so that we do not need to add this logic to all
   * of the entity modules that we may add app modules to.
   *
   * NOTE: This is inspired by PathautoGenerator.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity to create the app module path entry for.
   * @param array $path
   *   An associative array matching a AliasStorage::load return.
   * @param string $app_field_id
   *   The name of the app module reference field.
   */
  protected function registerAppPath(EntityInterface $entity, array $path, $app_field_id = 'field_application_module') {

    // Get the app module ID & data.
    $app_module_id = $entity->$app_field_id->target_id;
    $app_module_data = $entity->$app_field_id->data;

    // Treat this as a new item. If it breaks, well,
    // bad on the caller.
    $return = $this->storage->save(
      $path['pid'],
      $path['source'],
      $path['alias'],
      $app_module_id,
      $app_module_data,
      $path['langcode']
    );

    return $return;
  }

  /**
   * {@inheritdoc}
   */
  public function updateAliasFromPath(array $path) {
    // Nothing to see here. Exit.
    if ($path['alias'] === $path['original']['alias']) {
      return;
    }

    $app_path = $this->storage->load(['owner_pid' => $path['pid']]);

    if ($app_path) {
      $this->storage->save(
        $app_path['owner_pid'],
        $app_path['owner_source'],
        $path['alias'],
        $app_path['app_module_id'],
        $app_path['app_module_data'],
        $app_path['langcode'],
        $app_path['pid']
      );
    }

  }

  /**
   * {@inheritdoc}
   */
  public function deleteByPath(array $path) {
    $this->storage->delete(['owner_pid' => $path['pid']]);
  }

  /**
   * {@inheritdoc}
   */
  public function setCacheKey($key) {
    // Prefix the cache key to avoid clashes with other caches.
    $this->cacheKey = AppPathStorageInterface::CACHE_TAG . ':' . $key;
  }

  /**
   * {@inheritdoc}
   */
  public function getPathByRequest($request_path, $langcode = NULL) {
    // So we need to reload from the cache if we want noPath to be filled. So
    // let's initialize the path information here when get path is called.
    // this should be a small number of URLs.
    $this->initPathData();

    // If no language is explicitly specified we default to the current URL
    // language. If we used a language different from the one conveyed by the
    // requested URL, we might end up being unable to check if there is a path
    // alias matching the URL path.
    $langcode = $langcode ?: $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_URL)->getId();

    // There is no lookups for that langcode. So we should return quickly.
    if (!isset($this->lookupMap[$langcode])) {
      return NULL;
    }

    // Lookup the alias.
    $matchedPath = $this->aliasManager->getPathByAlias($request_path, $langcode);

    // If we got back a route path, then
    // $request_path will either an exact match of an app module path,
    // or it will not be any sort of app_module. Either way, it is a
    // quick lookup.
    // This leverages the AliasManager caching.
    if ($matchedPath !== $request_path) {
      $index = array_search($request_path, $this->lookupMap[$langcode]);
      if ($index !== FALSE && $index === 0) {
        return $this->getAppPathByAlias($request_path, $langcode);
      }
      else {
        return NULL;
      }
    }

    // This does not match an existing alias, so let's see if it is
    // a candidate for an app module's route.
    foreach ($this->lookupMap[$langcode] as $path) {
      // Setup the req and alias with a trailing slash to ensure
      // we do not accidentally match a partial path. (e.g.
      // /foo-bar and /foo)
      $test_req = $request_path . '/';
      $test_alias = $path . '/';

      // If the requested path is shorter than the alias, must not
      // be a match so we move on.
      if (strlen($test_req) < strlen($test_alias)) {
        continue;
      }

      // Let's look for the alias at the beginning of the requested
      // path. Case-insensative of course.
      if (stripos($test_req, $test_alias) === 0) {
        return $this->getAppPathByAlias($path, $langcode);
      }

      // Not a match, move on to the next.
      continue;
    }

    return NULL;
  }

  /**
   * Helper to return app path record by alias.
   *
   * @param string $alias
   *   The alias.
   * @param string $langcode
   *   The language.
   *
   * @return array|null
   *   The app path record for the alias for the app module entity that most
   *   closely matches the requested path, or null if no matching paths were
   *   found.
   */
  protected function getAppPathByAlias($alias, $langcode) {
    $app_path = $this->storage->load([
      'owner_alias' => $alias,
      'langcode' => $langcode,
    ]);

    if (!$app_path) {
      return NULL;
    }
    else {
      return $app_path;
    }
  }

  /**
   * Initializes path data.
   *
   * Which will load it from the cache, or if the cache
   * has nothing, then it loads it from the database.
   */
  protected function initPathData() {
    // If we have initialized, we need to leave.
    if ($this->isInitialized) {
      return;
    }

    // Check the cache to see if we have the item, if we do, rehydrate and
    // bypass db calls.
    if ($this->cacheKey && $cache_item = $this->cache->get($this->cacheKey)) {
      // Rehydrate from the cache.
      $this->lookupMap = $cache_item;
    }
    else {
      $this->loadFromStorage();
    }

    $this->isInitialized = TRUE;
  }

  /**
   * Loads the app module paths from back-end storage.
   */
  protected function loadFromStorage() {
    // This is not in our cache.
    $allPaths = $this->storage->loadAll();

    // Break out the list into lang codes.
    foreach ($allPaths as $path) {
      $this->lookupMap[$path['langcode']][] = $path['owner_alias'];
    }

    foreach (array_keys($this->lookupMap) as $langcode) {
      // The lookup does not have the langcode so it must not have been
      // cached. Let's go fetch the data, pluc the alias, then sort it
      // reverse alpha.
      rsort($this->lookupMap[$langcode]);
    }

    if ($this->cacheKey) {
      // We will be loading the data from the DB and since we are caching
      // we need to store it later.
      $this->cacheNeedsWriting = TRUE;
    }

    $this->isInitialized = TRUE;
  }

  /**
   * Helper method to get the alias entry for this entity.
   */
  protected function getAliasEntry(EntityInterface $entity) {
    // Get the source route.
    try {
      $internalPath = $entity->toUrl()->getInternalPath();
    }
    // @todo convert to multi-exception handling in PHP 7.1.
    catch (EntityMalformedException $exception) {
      return NULL;
    }
    catch (UndefinedLinkTemplateException $exception) {
      return NULL;
    }
    catch (\UnexpectedValueException $exception) {
      return NULL;
    }
    $owner_source = '/' . $internalPath;

    // Get language.
    // Core does not handle aliases with language Not Applicable,
    // so we need to change that to not specified.
    $langcode = $entity->language()->getId();
    if ($langcode == LanguageInterface::LANGCODE_NOT_APPLICABLE) {
      $langcode = LanguageInterface::LANGCODE_NOT_SPECIFIED;
    }

    // Get the alias and test to ensure it exists, if it does not then we
    // really can't do anything.
    //
    // Ok, so a quick rant. Pathauto changes out the FieldItem type and
    // FieldItemList types for the path "field" on the entities. Cool.
    // Now, the issue is that upon hook_entity_insert() being called,
    // the path will not have been computed and while the alias may have
    // just been created, $entity->path->alias will be null. This is
    // very annoying. So let's instead query the alias storage to get the
    // alias and call it a day.
    //
    // See \Drupal\path\Plugin\Field\FieldType\PathFieldItemList::computeValue.
    $path = $this->aliasStorage->load([
      'source' => $owner_source,
      'langcode' => $langcode,
    ]);

    return $path;
  }

  /**
   * {@inheritdoc}
   *
   * Cache an array of the paths available on each page. We assume that aliases
   * will be needed for the majority of these paths during subsequent requests,
   * and load them in a single query during path alias lookup.
   */
  public function writeCache() {
    // Check if the paths for this page were loaded from cache in this request
    // to avoid writing to cache on every request.
    if ($this->cacheNeedsWriting && !empty($this->cacheKey)) {

      $twenty_four_hours = 60 * 60 * 24;

      // We add the storage cache tag as cache tag so that when storage
      // is modified, we can clear that tag and invalidate this item.
      $this->cache->set(
        $this->cacheKey,
        $this->lookupMap,
        $this->getRequestTime() + $twenty_four_hours,
        [AppPathStorageInterface::CACHE_TAG]
      );
    }
  }

  /**
   * {@inheritdoc}
   */
  public function cacheClear($source = NULL) {

    $this->lookupMap = [];
    $this->noPath = [];
    $this->noAlias = [];
    $this->langcodePreloaded = [];
    $this->preloadedPathLookups = [];
    $this->cache->delete($this->cacheKey);
    $this->isInitialized = FALSE;
  }

  /**
   * Wrapper method for REQUEST_TIME constant.
   *
   * @return int
   *   The request time as an int.
   */
  protected function getRequestTime() {
    return defined('REQUEST_TIME') ? REQUEST_TIME : (int) $_SERVER['REQUEST_TIME'];
  }

}
