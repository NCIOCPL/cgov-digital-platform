<?php

namespace Drupal\Tests\cgov_js_app_module\Unit;

use Drupal\cgov_js_app_module\Plugin\app_module\JsOnlyAppModulePlugin;
use Drupal\Tests\UnitTestCase;

/**
 * Tests for the PathProcessorAppModule.
 */
class JsOnlyAppModulePluginTest extends UnitTestCase {

  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $languageManager;

  /**
   * The token service.
   *
   * @var Drupal\Core\Utility\Token|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $tokenService;

  /**
   * Instance of the plugin.
   *
   * @var \Drupal\cgov_js_app_module\Plugin\app_module\JsOnlyAppModulePlugin
   */
  protected $pluginInstance;

  /**
   * These are a set of default options for the plugin methods.
   *
   * Copy the array and make changes for your tests. This way you
   * don't have to keep typing them over and over. Rememberm array
   * assignment in PHP is copy by value.
   *
   * @var array
   */
  protected $defaultOptions = [
    "drupalConfig" => [
      "appName" => "test-app",
      "rootId" => "NCI-app-root",
      "initFnName" => "window.TestApp",
      "appCssUri" => "https://example.org/test-app/test-app.vX.Y.Z.css",
      "appJsUri" => "https://example.org/test-app/test-app.vX.Y.Z.js",
      "removeHeadElements" => [],
      "validAppPaths" => [],
    ],
    "frontEndConfig" => [
      "testKey1" => "testValue",
      "testKey2" => "testKey2",
    ],
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->languageManager = $this->createMock('Drupal\Core\Language\LanguageManagerInterface');
    $this->tokenService = $this->createMock('Drupal\Core\Utility\Token');

    $this->pluginInstance = new JsOnlyAppModulePlugin(
      [],
      'cgov_js_only_app_module_plugin',
      [
        "label" => "JS-Only App Module Plugin",
        "id" => "cgov_js_only_app_module_plugin",
        "class" => "Drupal\cgov_js_app_module\Plugin\app_module\JsOnlyAppModulePlugin",
        "provider" => "cgov_js_app_module",
      ],
      $this->languageManager,
      $this->tokenService
    );
  }

  /**
   * Tests the matchRouteInternal() method.
   */
  public function testMatchRouteInternalSlashNoPathFilter() {
    $expected = [
      'app_module_route' => '/',
      'params' => [],
    ];

    $options = $this->defaultOptions;
    $actual = $this->pluginInstance->matchRoute("/", $options);
    $this->assertEquals($expected, $actual);
  }

  /**
   * Tests the matchRouteInternal() method.
   */
  public function testMatchRouteInternalWithPathNullPathFilter() {
    $expected = [
      'app_module_route' => '/',
      'params' => [],
    ];

    $options = $this->defaultOptions;
    unset($options['validAppPaths']);
    $actual = $this->pluginInstance->matchRoute("/foo/bar", $options);
    $this->assertEquals($expected, $actual);
  }

  /**
   * Tests the matchRouteInternal() method.
   */
  public function testMatchRouteInternalWithPathEmptyPathFilter() {
    $expected = [
      'app_module_route' => '/',
      'params' => [],
    ];

    $options = $this->defaultOptions;
    $actual = $this->pluginInstance->matchRoute("/foo/bar", $options);
    $this->assertEquals($expected, $actual);
  }

  /**
   * Tests the matchRouteInternal() method.
   */
  public function testMatchRouteInternalDefaultWithMatchingPath() {
    $expected = [
      'app_module_route' => '/',
      'params' => [],
    ];

    $options = $this->defaultOptions;
    $options['drupalConfig']['validAppPaths'] = [
      "\/foo\/.*",
    ];
    $actual = $this->pluginInstance->matchRoute("/", $options);
    $this->assertEquals($expected, $actual);
  }

  /**
   * Tests the matchRouteInternal() method.
   */
  public function testMatchRouteInternalMatchingPath() {
    $expected = [
      'app_module_route' => '/',
      'params' => [],
    ];

    $options = $this->defaultOptions;
    $options['drupalConfig']['validAppPaths'] = [
      "\/foo\/.*",
    ];
    $actual = $this->pluginInstance->matchRoute("/foo/bar", $options);
    $this->assertEquals($expected, $actual);
  }

  /**
   * Tests the matchRouteInternal() method.
   */
  public function testMatchRouteInternalNoMatchingPath() {

    $options = $this->defaultOptions;
    $options['drupalConfig']['validAppPaths'] = [
      "\/bazz\/.*",
    ];
    $actual = $this->pluginInstance->matchRoute("/foo/bar", $options);
    $this->assertNull($actual);
  }

}
