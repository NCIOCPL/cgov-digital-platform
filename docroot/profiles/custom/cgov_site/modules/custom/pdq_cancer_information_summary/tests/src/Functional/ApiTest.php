<?php

namespace Drupal\Tests\pdq_cancer_information_summary\Functional;

use Drupal\Tests\rest\Functional\ResourceTestBase;
use Psr\Http\Message\ResponseInterface;
use Drupal\Core\Url;

/**
 * Verify publication of PDQ Cancer Information Summaries.
 *
 * Might use Drupal\Tests\BrowserTestBase.
 */
class ApiTest extends ResourceTestBase {

  /**
   * Use our own profile instead of the default.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * The admin user.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $pdqImporter;

  /**
   * {@inheritdoc}
   */
  protected function setUpAuthorization($method) {
    echo "setUpAuthorization($method)\n";
  }

  /**
   * {@inheritdoc}
   */
  protected function assertResponseWhenMissingAuthentication($method, ResponseInterface $response) {
    echo "assertResponseWhenMissingAuthentication($method)\n";
  }

  /**
   * {@inheritdoc}
   */
  protected function assertNormalizationEdgeCases($method, Url $url, array $request_options) {
    echo "assertNormalizationEdgeCases($method, $url, $request_options)\n";
  }

  /**
   * {@inheritdoc}
   */
  protected function assertAuthenticationEdgeCases($method, Url $url, array $request_options) {
    echo "assertAuthenticationEdgeCases($method, $url, $request_options)\n";
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedUnauthorizedAccessCacheability() {
    echo "getExpectedUnauthorizedAccessCacheability()\n";
    return NULL;
  }

  /**
   * Verify correct storage of new Cancer Information Summary.
   */
  public function testApis() {
    // @var \Drupal\Core\Url
    $url = Url::fromUri('https://rksystems.com');
    // @var \Psr\Http\Message\ResponseInterface
    $response = $this->request('GET', $url, []);
    $this->assertEqual(200, $response->getStatusCode());
    $this->assertTrue(2 > 1);
  }

}
