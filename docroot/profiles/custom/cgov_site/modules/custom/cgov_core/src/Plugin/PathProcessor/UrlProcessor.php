<?php

namespace Drupal\cgov_core\Plugin\PathProcessor;

use Drupal\Core\Render\BubbleableMetadata;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Path\AliasManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

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
   * @var \Drupal\Core\Path\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Path\AliasManagerInterface $aliasManager
   *   An alias manager for looking up the system path.
   * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
   *   Language manager.
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $serviceContainer
   *   Service Container.
   */
  public function __construct(AliasManagerInterface $aliasManager, LanguageManagerInterface $languageManager, ContainerInterface $serviceContainer) {
    $this->aliasManager = $aliasManager;
    $this->languageManager = $languageManager;
    $this->serviceContainer = $serviceContainer;
  }

  /**
   * {@inheritdoc}
   */
  public function processOutbound($path, &$options = [], Request $request = NULL, BubbleableMetadata $bubbleable_metadata = NULL) {
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

    $currentLanguage = $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_INTERFACE)->getId();
    $alias = $this->aliasManager->getAliasByPath($path, $currentLanguage);
    $isAliased = $path !== $alias;
    if (!$isAliased) {
      $languageObject = ConfigurableLanguage::createFromLangcode('en');
      $options['language'] = $languageObject;
    }

    return $path;
  }

}
