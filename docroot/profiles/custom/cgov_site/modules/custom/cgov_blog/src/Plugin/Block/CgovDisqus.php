<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
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
class CgovDisqus extends BlockBase implements ContainerFactoryPluginInterface {

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
   * Constructs a CgovPager object.
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

    // Verify that this is an entity object.
    if ($curr_entity = $this->getCurrEntity()) {
      $bpid = $curr_entity->id();
      $bsid = $curr_entity->get('field_blog_series')->target_id;
      $owner = $this->getNodeStorage()->load($bsid)->get('field_pretty_url')->value;
    }
    // If not an entity object, exit build():
    else {
      return;
    }

    $debug = [
      'debug' => '~~ Debugging array ~~',
      'owner' => $owner,
      'post-nid' => $bpid,
      'series-nid' => $bsid,
      'its-a-me' => 'Mario!',
    ];
    ksm($debug);

    $build = [
      '#markup' => $this->t('
        <div id="disqus_thread"></div>
        <script>
            /**
             *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT 
             *  THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR 
             *  PLATFORM OR CMS.
             *  
             *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: 
             *  https://disqus.com/admin/universalcode/#configuration-variables
             */
            /*

            // TODO: Generate programatically.
            var disqus_identifier = "rx:cgvBlogPost-1140158";
            var disqus_url = "https://www.cancer.gov/news-events/cancer-currents-blog/foo";

            var disqus_config = function () {
                // Replace PAGE_URL with your page′s canonical URL variable
                this.page.url = disqus_url;
                
                // Replace PAGE_IDENTIFIER with your page′s unique identifier variable
                this.page.identifier = disqus_identifier; 
            };
            */
            
            (function() {  // REQUIRED CONFIGURATION VARIABLE: EDIT THE SHORTNAME BELOW
                var d = document, s = d.createElement("script");
                var disqus_shortname = "cancer-currents-dev";
                // IMPORTANT: Replace EXAMPLE with your forum shortname!
                s.src = "https://" + disqus_shortname + ".disqus.com/embed.js";                
                s.setAttribute("data-timestamp", +new Date());
                (d.head || d.body).appendChild(s);
            })();
        </script>
        <noscript>
            Please enable JavaScript to view the 
            <a href="https://disqus.com/?ref_noscript" rel="nofollow">
                comments powered by Disqus.
            </a>
        </noscript>
      '),
    ];
    return $build;
  }

}
