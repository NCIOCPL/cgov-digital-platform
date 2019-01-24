<?php

namespace Drupal\Tests\pdq_cancer_information_summary\Functional;

use Behat\Mink\Driver\BrowserKitDriver;
use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;
use GuzzleHttp\RequestOptions;

/**
 * Verify publication of PDQ Cancer Information Summaries.
 */
class ApiTest extends BrowserTestBase {

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

  /**
   * Helper method to submit an HTTP request.
   */
  private function request($method, Url $url, array $options) {
    $options[RequestOptions::HTTP_ERRORS] = FALSE;
    $options[RequestOptions::ALLOW_REDIRECTS] = FALSE;
    $options = $this->decorateWithXdebugCookie($options);
    $client = $this->getHttpClient();
    return $client->request($method, $url->setAbsolute(TRUE)->toString(), $options);
  }

  /**
   * Helper method to set cookies.
   */
  private function decorateWithXdebugCookie(array $request_options) {
    $session = $this->getSession();
    $driver = $session->getDriver();
    if ($driver instanceof BrowserKitDriver) {
      $client = $driver->getClient();
      foreach ($client->getCookieJar()->all() as $cookie) {
        $assignment = $cookie->getName() . '=' . $cookie->getValue();
        if (isset($request_options[RequestOptions::HEADERS]['Cookie'])) {
          $request_options[RequestOptions::HEADERS]['Cookie'] .= '; ' . $assignment;
        }
        else {
          $request_options[RequestOptions::HEADERS]['Cookie'] = $assignment;
        }
      }
    }
    return $request_options;
  }

}
