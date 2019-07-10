<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\cgov_core\CgovCoreTools;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityRepository;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Disqus JS snippet Block.
 *
 * @Block(
 *   id = "cgov_disqus",
 *   admin_label = @Translation("Cgov Disqus Block"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class DisqusComments extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * Cgov core site helper tools.
   *
   * @var Drupal\cgov_core\CgovCoreTools
   */
  protected $cgovCoreTools;

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Entity Repository.
   *
   * @var \Drupal\Core\Entity\EntityRepository
   */
  protected $entityRepository;

  /**
   * Constructs a DisqusComments object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \Drupal\Core\Entity\EntityRepository $entity_repository
   *   Entity repository.
   * @param Drupal\cgov_core\CgovCoreTools $cgov_core_tools
   *   Cgov core site helper tools.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    RouteMatchInterface $route_matcher,
    EntityTypeManagerInterface $entity_type_manager,
    EntityRepository $entity_repository,
    CgovCoreTools $cgov_core_tools
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatcher = $route_matcher;
    $this->entityTypeManager = $entity_type_manager;
    $this->entityRepository = $entity_repository;
    $this->cgovCoreTools = $cgov_core_tools;
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
      $container->get('entity_type.manager'),
      $container->get('entity.repository'),
      $container->get('cgov_core.tools')
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
   * Returns markup object - the Disqus embed link in this case.
   *
   * {@inheritdoc}
   */
  public function build() {
    $build = [];

    // Get entity object.
    if ($current = $this->getCurrEntity()) {
      $content_type = $current->bundle();
      $lang = $current->language()->getId();
      if (!isset($content_type)) {
        return $build;
      }
    }

    // Draw the Disqus block for a given content type.
    switch ($content_type) {

      // Draw Disqus form on Blog Post per Blog Series settings.
      case 'cgov_blog_post':
        $series_nid = $current->get('field_blog_series')->target_id;
        $series_node = $this->getNodeStorage()->load($series_nid);

        // Load the Blog Series node for the current language.
        if ($series_node) {
          $series_node = $this->entityRepository->getTranslationFromContext($series_node, $lang);
          $allow_comments = intval($series_node->field_allow_comments->value);
          $shortname = $series_node->field_blog_series_shortname->value;

          /* If allow comments is TRUE and shortname value is set,
           * draw Disqus embed tag.
           */
          if ($allow_comments == 1 && strlen($shortname) > 0) {
            $tier = $this->cgovCoreTools->isProd() ? 'prod' : 'dev';
            $build = [
              '#markup' => 'https://' . $shortname . '-' . $tier . '.disqus.com/embed.js',
            ];
          }
        }
        break;

      // No other Disqus content types atm.
      default:
        break;
    }

    return $build;
  }

}
