<?php

namespace Drupal\cgov_core\Plugin\PathProcessor;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\TypedData\TranslatableInterface;
use Drupal\Core\Url;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Ensure valid urls.
 *
 * We want to make sure a valid language exists on the options
 * key by the time PathProcessorAlias kicks off.
 * If a translation doesn't exist, we don't want the url to
 * be /espanol/node/{node}, we want it to be the english
 * aliased path instead.
 */
class UrlProcessor implements OutboundPathProcessorInterface {

  /**
   * The route matcher.
   *
   * @var \Symfony\Component\DependencyInjection\ContainerInterface
   */
  protected $serviceContainer;

  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * An alias manager for looking up the system path.
   *
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructor.
   *
   * @param \Drupal\path_alias\AliasManagerInterface $aliasManager
   *   An alias manager for looking up the system path.
   * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
   *   Language manager.
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $serviceContainer
   *   Service Container.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(AliasManagerInterface $aliasManager, LanguageManagerInterface $languageManager, ContainerInterface $serviceContainer, EntityTypeManagerInterface $entity_type_manager) {
    $this->aliasManager = $aliasManager;
    $this->languageManager = $languageManager;
    $this->serviceContainer = $serviceContainer;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function processOutbound($path, &$options = [], ?Request $request = NULL, ?BubbleableMetadata $bubbleable_metadata = NULL) {
    if (!isset($options['route'])) {
      return $path;
    }

    $route = $options['route'];
    $pattern = $route->getPath();
    $routeProvider = $this->serviceContainer->get('router.route_provider');
    $routes = $routeProvider->getRoutesByPattern($pattern);
    $isNode = $routes->get('entity.node.canonical') != NULL;
    $isMedia = $routes->get('entity.media.canonical') != NULL;
    if (!$isNode && !$isMedia) {
      return $path;
    }
    $params = Url::fromUri("internal:" . $path)->getRouteParameters();
    $entity_type = key($params);
    $entity = NULL;
    if ($entity_type == 'media' || $entity_type == 'node') {
      $entity = $this->entityTypeManager->getStorage($entity_type)->load($params[$entity_type]);
    }
    $currentLanguage = $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_INTERFACE)->getId();
    $alias = $this->aliasManager->getAliasByPath($path, $currentLanguage);
    $isAliased = $path !== $alias;
    if (!$isAliased) {
      $languageObject = ConfigurableLanguage::createFromLangcode('en');
      // We are checking entity translation if en doesnot exist, but es exist.
      if ($entity && ($entity instanceof TranslatableInterface) && $entity->hasTranslation('en')) {
        $options['language'] = $languageObject;
      }
    }
    return $path;
  }

}
