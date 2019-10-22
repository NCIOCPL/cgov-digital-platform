<?php

namespace Drupal\Tests\app_module\Functional;

use Drupal\app_module\Entity\AppModule;
use Drupal\app_module\AppModuleRenderArrayBuilder;
use Drupal\Tests\BrowserTestBase;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Request;

/**
 * Test the AppModuleRenderArrayBuilder service.
 *
 * @group config_entity_example
 * @group examples
 *
 * @ingroup config_entity_example
 */
class AppModuleRenderArrayBuilderTest extends BrowserTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'app_module',
    'app_module_test',
  ];

  /**
   * The installation profile to use with this test.
   *
   * We need the 'cgov_site' profile because we are within that profile.
   *
   * @var string
   */
  protected $profile = 'minimal';

  /**
   * A Request Stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  private $stack;

  /**
   * The builder service.
   *
   * @var \Drupal\app_module\AppModuleRenderArrayBuilderInterface
   */
  private $builder;

  /**
   * Controller resolver to call pre_render.
   *
   * @var \Drupal\Core\Controller\ControllerResolverInterface
   */
  private $controllerResolver;

  /**
   * {@inheritdoc}
   *
   * Once installed, a content type with the desired field is created.
   */
  protected function setUp() {
    // Install Drupal.
    parent::setUp();
    // Create a new request stack to handle the various test requests.
    $this->stack = new RequestStack();
    $this->builder = new AppModuleRenderArrayBuilder($this->stack);
    $this->controllerResolver = \Drupal::service('controller_resolver');
  }

  /**
   * Tests the mechanics of the AppModuleRenderArrayBuilder::build.
   */
  public function testAppModuleRenderArrayBuilder() {

    /* -----------------------------------------------------------------------
     * Test the defaults for the app module to ensure it handles the basic
     * cache tags when none are provided.
     * -----------------------------------------------------------------------
     */

    // Test defaults.
    $this->evalBuilderForRequest(
      NULL,
      'test_app_module',
      'default',
      ['config:app_module.app_module.test_app_module']
    );

    /* -----------------------------------------------------------------------
     * Let's test the caching bits to make sure that a plugin can set the
     * cache tags, age, and contexts correctly without messing up the items
     * that our builder must add.
     * -----------------------------------------------------------------------
     */

    // Test defaults with caching.
    $this->evalBuilderForRequest(
      NULL,
      'caching_app_module',
      'default',
      ['caching_app_module_plugin', 'config:app_module.app_module.caching_app_module'],
      ['url.query_args:app_module_route'],
      50
    );

    // Test defaults with route.
    $this->evalBuilderForRequest(
      '/chicken',
      'caching_app_module',
      'chicken',
      [
        'caching_app_module_plugin',
        'caching_app_module_plugin:chicken',
        'config:app_module.app_module.caching_app_module',
      ],
      ['url.query_args:app_module_route', "url.query_args:chicken_param"],
      100
    );

    // Test Multi Route App Module Base.
    $this->evalBuilderForRequest(
      NULL,
      'test_multi_route_app_module',
      'default',
      ['test_multi_route_app_module_plugin', 'config:app_module.app_module.test_multi_route_app_module'],
      ['url.query_args:app_module_route'],
      50
    );

    // Test Multi Route App Module Base.
    $this->evalBuilderForRequest(
      '/chicken',
      'test_multi_route_app_module',
      'chicken',
      [
        'test_multi_route_app_module_plugin',
        'test_multi_route_app_module_plugin:chicken',
        'config:app_module.app_module.test_multi_route_app_module',
      ],
      ['url.query_args:app_module_route', "url.query_args:chicken_param"],
      100
    );

    /* -----------------------------------------------------------------------
     * And now for something different.
     * We will test the preRender mechanism and make sure that we get some
     * content.
     */
    // Prerender test for default app.
    $this->evalBuildFromPrerender(
      NULL,
      'test_app_module',
      [
        '#markup' => "<div>App Module: Test App Module Plugin </div>",
      ]
    );

    // Prerender test of multi route default route.
    $this->evalBuildFromPrerender(
      NULL,
      'test_multi_route_app_module',
      [
        '#markup' => "<div>Test Multiroute: Default</div>",
      ]
    );

    // Prerender test of multi route chicken route.
    $this->evalBuildFromPrerender(
      '/chicken',
      'test_multi_route_app_module',
      [
        '#markup' => "<div>Test Multiroute: Chicken</div>",
      ]
    );

  }

  /**
   * Helper method for testing "render" output.
   */
  private function setRequest(
    AppModule $entity,
    $app_module_path,
    $default_null_path = TRUE
  ) {
    // Get the plugin.
    $plugin = $entity->getAppModulePlugin();

    // Now get route info. We will make the app module path be
    // / if it is null, or we just pass through the null. It
    // depends on the tests.
    $route_info = $plugin->matchRoute(
      $default_null_path ? ($app_module_path ?? '/') : $app_module_path,
      []
    );

    // Smush the params together with the app_module_route.
    $params = array_merge(
      ['app_module_route' => $route_info['app_module_route']],
      $route_info['params']
    );

    $request = Request::create('/foo/bar', 'GET', $params);
    $this->stack->push($request);
  }

  /**
   * Helper method for testing "render" output.
   */
  private function evalBuildFromPrerender(
    $app_module_path,
    $app_module_id,
    array $content
  ) {

    // Load the entity.
    $entity = AppModule::load($app_module_id);

    // Setup the request.
    $this->setRequest($entity, $app_module_path);

    // Build.
    $build = $this->builder->build($entity, []);

    // Now call the pre_render method to change the build.
    // NOTE: Stolen from Drupal\Core\Render\Renderer.
    if (isset($build['#pre_render'])) {
      foreach ($build['#pre_render'] as $callable) {
        if (is_string($callable) && strpos($callable, '::') === FALSE) {
          $callable = $this->controllerResolver
            ->getControllerFromDefinition($callable);
        }
        $build = call_user_func($callable, $build);
      }
    }

    $this->assertFalse(isset($build['#app_module_info']), "App module was cleared out of build.");
    $this->assertEqual(
      $build['content'],
      $content,
      "Content has been built"
    );
    $this->stack->pop();
  }

  /**
   * Helper method to test builder for various routes.
   */
  private function evalBuilderForRequest(
    $app_module_path,
    $app_module_id,
    $app_route_id,
    $tags,
    $contexts = ['url.query_args:app_module_route'],
    $max_age = 0
  ) {
    // Load the entity.
    $entity = AppModule::load($app_module_id);

    // Setup the request.
    $this->setRequest($entity, $app_module_path);

    // Build.
    $build = $this->builder->build($entity, []);

    // Tests.
    $this->assertEqual($build['#app_module_info']['path'], $app_module_path ?? '/', "Path is correct.");
    $this->assertEqual($build['#app_module_id'], $app_module_id, "App module id is set");
    $this->assertEqual($build['#app_route_id'], $app_route_id, "App module route id is set");
    // The TRUE option at the end tells the assertion to ignore order.
    $this->assertEquals($build['#cache']['contexts'], $contexts, "Cache contexts are equal", 0.0, 10, TRUE);
    $this->assertEquals($build['#cache']['tags'], $tags, "Cache tags are equal", 0.0, 10, TRUE);
    $this->assertEqual($build['#cache']['max-age'], $max_age);
    $this->assertNotNull($build['#pre_render'], "Pre-render callback is not null");
    $this->assertEqual($build['#theme'], "app_module", "Theme is set");
    $this->stack->pop();
  }

}
