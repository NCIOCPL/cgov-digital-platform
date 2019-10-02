<?php

namespace Drupal\Tests\app_module\Unit;

use Drupal\app_module\PathProcessor\PathProcessorAppModule;
use Drupal\Tests\UnitTestCase;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests for the PathProcessorAppModule.
 */
class PathProcessorAppModuleTest extends UnitTestCase {

  /**
   * The app path manager mock.
   *
   * @var \Drupal\app_module\AppPathManagerInterface
   */
  protected $appPathManager;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * A app module path processor.
   *
   * @var \Drupal\app_module\PathProcessor\PathProcessorAppModule
   */
  protected $pathProcessor;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // Create a new request stack to handle the various test requests.
    $this->stack = new RequestStack();

    $this->appPathManager = $this->getMock('\Drupal\app_module\AppPathManagerInterface');
    $this->entityTypeManager = $this->getMock('\Drupal\Core\Entity\EntityTypeManagerInterface');
    $this->entityStorage = $this->getMock('\Drupal\Core\Entity\EntityStorageInterface');

    // Return our storage mock.
    $this->entityTypeManager->expects($this->any())
      ->method('getStorage')
      ->with('app_module')
      ->willReturn($this->entityStorage);

    $this->pathProcessor = new PathProcessorAppModule($this->appPathManager, $this->entityTypeManager);
  }

  /**
   * Tests the Path Processor.
   *
   * No app path is found.
   */
  public function testPathProcessorNoAppPath() {
    $request_url = '/bad/url/path';
    $stack = $this->getRequest($request_url, []);
    $request = $stack->getCurrentRequest();

    $this->mockAppPathResponse($this->appPathManager, NULL);

    $path = $this->pathProcessor->processInbound($request_url, $request);

    $this->assertEquals($path, $request_url);
  }

  /**
   * Tests the Path Processor.
   *
   * An app path exists, but the plugin does not match.
   */
  public function testPathProcessorPluginNoMatch() {
    $request_url = '/good/url/bad_route';
    $owner_alias = '/good/url';
    $stack = $this->getRequest($request_url, []);
    $request = $stack->getCurrentRequest();

    $this->mockAppPathResponse($this->appPathManager, [
      'pid' => 3,
      'owner_pid' => 10,
      'owner_alias' => $owner_alias,
      'owner_source' => '/node/123',
      'app_module_id' => 'test_app_module',
      'app_module_data' => NULL,
    ]);

    $this->setStorageMock(NULL);

    $path = $this->pathProcessor->processInbound($request_url, $request);

    // There was no match so the returned path should match the original
    // request.
    $this->assertEquals($path, $request_url);
    // There also should NOT be a param set for app_module_route.
    $this->assertTrue(!$request->query->has('app_module_route'));
  }

  /**
   * Tests the Path Processor.
   *
   * An app path exists, but the plugin does not match.
   */
  public function testPathProcessorPluginExactMatch() {
    $request_url = '/good/url/exact_route';
    $owner_alias = '/good/url';
    $stack = $this->getRequest($request_url, []);
    $request = $stack->getCurrentRequest();

    $this->mockAppPathResponse($this->appPathManager, [
      'pid' => 3,
      'owner_pid' => 10,
      'owner_alias' => $owner_alias,
      'owner_source' => '/node/123',
      'app_module_id' => 'test_app_module',
      'app_module_data' => NULL,
    ]);

    $this->setStorageMock([
      'app_module_route' => '/exact_route',
      'params' => [],
    ]);

    $path = $this->pathProcessor->processInbound($request_url, $request);

    // There was no match so the returned path should match the original
    // request.
    $this->assertEquals($path, $owner_alias);
    $this->assertEquals($request->query->get('app_module_route'), '/exact_route');
  }

  /**
   * Tests the Path Processor.
   *
   * An app path exists, but the plugin does not match.
   */
  public function testPathProcessorPluginMatchWithParams() {
    $request_url = '/good/url/route/123';
    $owner_alias = '/good/url';
    $stack = $this->getRequest($request_url, []);
    $request = $stack->getCurrentRequest();

    $this->mockAppPathResponse($this->appPathManager, [
      'pid' => 3,
      'owner_pid' => 10,
      'owner_alias' => $owner_alias,
      'owner_source' => '/node/123',
      'app_module_id' => 'test_app_module',
      'app_module_data' => NULL,
    ]);

    $this->setStorageMock([
      'app_module_route' => '/route',
      'params' => [
        'some_id' => '123',
      ],
    ]);

    $path = $this->pathProcessor->processInbound($request_url, $request);

    // There was no match so the returned path should match the original
    // request.
    $this->assertEquals($path, $owner_alias);
    $this->assertEquals($request->query->get('app_module_route'), '/route');
    $this->assertEquals($request->query->get('some_id'), '123');
  }

  /**
   * Helper function to setup plugin mock.
   */
  protected function setStorageMock($app_route_info) {

    // Mock the plugin.
    $plugin_instance = $this->getMock('\Drupal\app_module\Plugin\app_module\AppModulePluginInterface');
    $plugin_instance->expects($this->any())
      ->method('matchRoute')
      ->willReturn($app_route_info);

    // Mock up an app module entity to be returned by storage.
    $app_module_instance = $this->getMock('\Drupal\app_module\AppModuleInterface');
    $app_module_instance->expects($this->any())
      ->method('getAppModulePlugin')
      ->willReturn($plugin_instance);

    // Return our app module mock from storage.
    $this->entityStorage->expects($this->any())
      ->method('load')
      ->with('test_app_module')
      ->willReturn($app_module_instance);
  }

  /**
   * Helper function to mock a getPathByRequest call.
   */
  protected function mockAppPathResponse($mock, $response) {
    $mock->expects($this->any())
      ->method('getPathByRequest')
      ->willReturn($response);
  }

  /**
   * Helper method for testing "render" output.
   */
  private function getRequest($url, array $params) {
    // Create a new request stack to handle the various test requests.
    $stack = new RequestStack();

    $request = Request::create($url, 'GET', $params);
    $stack->push($request);

    return $stack;
  }

}
