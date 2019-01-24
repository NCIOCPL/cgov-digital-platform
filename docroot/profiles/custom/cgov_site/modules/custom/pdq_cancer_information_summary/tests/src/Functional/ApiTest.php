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
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    // Create PDQ user and login.
    $this->pdqImporter = $this->drupalCreateUser();
    $this->pdqImporter->addRole('pdq_importer');
    $this->pdqImporter->save();
    // Don't $this->drupalLogin($this->pdqImporter);.
  }

  /**
   * Verify correct storage of new Cancer Information Summary.
   */
  public function testApis() {
    // @var \Drupal\Core\Url
    $url = Url::fromUri('base:pdq/api/cis/0');
    // @var \Psr\Http\Message\ResponseInterface
    $response = $this->request('GET', $url, ['query' => ['_format' => 'json']]);
    $this->assertResponse(200);
    $payload = json_decode($response->getBody()->__toString(), TRUE);
    $this->assertEqual($payload['foo'], 'bar');
  }

  /**
   * Helper method to submit an HTTP request.
   */
  private function request($method, Url $url, array $options) {
    $options[RequestOptions::HTTP_ERRORS] = FALSE;
    $options[RequestOptions::ALLOW_REDIRECTS] = FALSE;
    $options = $this->addCookies($options);
    $credentials = $this->pdqImporter->name->value . ':' . $this->pdqImporter->passRaw;
    $auth = base64_encode($credentials);
    $options[RequestOptions::HEADERS]['Authorization'] = 'Basic ' . $auth;
    $client = $this->getHttpClient();
    return $client->request($method, $url->setAbsolute(TRUE)->toString(), $options);
  }

  /**
   * Helper method to set cookies.
   */
  private function addCookies(array $request_options) {
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
