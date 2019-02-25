<?php

namespace Drupal\Tests\pdq_drug_information_summary\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Verify publication of PDQ Drug Information Summaries.
 */
class ApiTest extends BrowserTestBase {

  /**
   * Use our own profile instead of the default.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * Basic authentication credentials.
   *
   * @var array
   */
  protected $auth;

  /**
   * Test Drug Information Summary document.
   *
   * @var array
   */
  protected $drug = [
    'nid' => NULL,
    'title' => 'Test Drug',
    'description' => 'Test description',
    'url' => '/about-cancer/treatment/drugs/test',
    'cdr_id' => 5001,
    'posted_date' => '2020-01-01',
    'updated_date' => '2020-01-02',
    'body' => '<p>This is a test</p>',
    'pron' => 'tehst drug',
    'audio_id' => 5002,
  ];

  /**
   * Names of fields which can be compared in a loop.
   *
   * @var array
   */
  protected $fields = [
    'title',
    'description',
    'url',
    'cdr_id',
    'posted_date',
    'updated_date',
    'body',
    'pron',
    'audio_id',
  ];

  /**
   * URL for common PDQ API requests.
   *
   * @var string
   */
  protected $pdqUrl;

  /**
   * URL for PDQ Drug Information Summary API requests.
   *
   * @var string
   */
  protected $disUrl;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    // Build the URLs for the API requests.
    $url = Url::fromUri('base:pdq/api/dis');
    $this->disUrl = $url->setAbsolute(TRUE)->toString();
    $url = Url::fromUri('base:pdq/api');
    $this->pdqUrl = $url->setAbsolute(TRUE)->toString();

    // Create a user that can import the PDQ drug content.
    $user = $this->drupalCreateUser();
    $user->addRole('pdq_importer');
    $user->save();
    $this->auth = [$user->name->value, $user->passRaw];
  }

  /**
   * Verify correct behavior of PDQ Drug Information Summary APIs.
   */
  public function testApis() {

    // Store new drug summary and capture the node ID.
    $payload = $this->store($this->drug, 201);
    $nid = $this->drug['nid'] = $payload['nid'];

    // Verify that the node ID lookup works correctly.
    $matches = $this->findNodes($this->drug['cdr_id']);
    $this->assertEqual($matches, [[$nid, 'en']]);

    // Confirm that the values have been stored correctly.
    $values = $this->fetchNode($nid);
    $this->assertFalse($values['published'], 'Not yet published');
    $this->checkValues($values);

    // Store a modified revision (still unpublished).
    $this->drug['description'] = 'Revised drug description';
    $payload = $this->store($this->drug, 200);
    $this->assertEqual($payload['nid'], $nid, 'Uses same node');

    // Confirm that the values are still stored correctly.
    $values = $this->fetchNode($nid);
    $this->assertFalse($values['published'], 'Not yet published');
    $this->checkValues($values);

    // Publish the summaries and make sure they're still intact.
    $this->publish();
    $values = $this->fetchNode($nid);
    $this->assertTrue($values['published'], 'Published');
    $this->checkValues($values);

    // Verify the catalog API.
    $response = $this->request('GET', "$this->pdqUrl/list");
    $this->assertEqual($response->getStatusCode(), 200);
    $values = json_decode($response->getBody()->__toString(), TRUE);
    $this->assertCount(1, $values, 'One entry in catalog');
    $values = array_pop($values);
    $this->assertCount(7, $values, 'Catalog entry has 7 values');
    $this->assertEqual($values['cdr_id'], $this->drug['cdr_id'],
      'CDR ID is correct');
    $this->assertEqual($values['nid'], $nid, 'Node ID is correct');
    $this->assertEqual(preg_match('/^\d+$/', $values['vid']), 1,
      'Version ID is numeric');
    $this->assertEqual($values['langcode'], 'en');
    $this->assertEqual($values['type'], 'pdq_drug_information_summary');
    $pat = '/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/';
    $this->assertEqual(preg_match($pat, $values['created']), 1,
      'Created is datetime');
    $this->assertEqual(preg_match($pat, $values['changed']), 1,
      'Changed is datetime');

    // Make sure the pathauto mechanism is behaving correctly.
    $this->checkPathauto($this->drug);

    // Delete the drug summary.
    $this->delete($this->drug);
  }

  /**
   * Helper method to submit an HTTP request.
   *
   * @param string $method
   *   HTTP verb (e.g., 'POST') for request.
   * @param string $url
   *   Web address to which request should be directed.
   * @param array $options
   *   Values to be passed the $client->request() (['json' => $data] for
   *   POST requests; empty array -- the default -- otherwise).
   *
   * @return \Psr\Http\Message\ResponseInterface
   *   Object representing response from server.
   */
  private function request(string $method, string $url, array $options = []) {
    $options['auth'] = $this->auth;
    $options['query'] = ['_format' => 'json'];
    $options['http_errors'] = FALSE;
    $options['allow_redirects'] = FALSE;
    $client = $this->getHttpClient();
    return $client->request($method, $url, $options);
  }

  /**
   * Send values for a PDQ Drug Information Summary to the CMS.
   *
   * @param array $values
   *   Summary values to be stored.
   * @param int $expected
   *   Status value which should result from request.
   *
   * @return array
   *   Array with node ID (indexed by 'nid') if successful; error message
   *   (indexed by 'message') otherwise.
   */
  private function store(array $values, $expected) {
    $response = $this->request('POST', $this->disUrl, ['json' => $values]);
    $this->assertEqual($response->getStatusCode(), $expected);
    return json_decode($response->getBody()->__toString(), TRUE);
  }

  /**
   * Map CDR ID for PDQ summary to Drupal nodes.
   *
   * @param int $cdr_id
   *   Document ID for PDQ summary.
   *
   * @return array
   *   Pairs of node ID and language code (must be only one pair).
   */
  private function findNodes($cdr_id) {
    $response = $this->request('GET', "$this->pdqUrl/$cdr_id");
    $this->assertEqual($response->getStatusCode(), 200);
    $pairs = json_decode($response->getBody()->__toString(), TRUE);
    $this->assertCount(1, $pairs, 'Only one node/language per CDR ID');
    $this->assertCount(2, $pairs[0], 'Pair must have two items');
    list($nid, $language) = $pairs[0];
    $this->assertTrue(is_numeric($nid), 'Node ID is numeric');
    $this->assertEqual($nid, (int) $nid, 'Node ID is an integer');
    $this->assertEqual($language, 'en', 'Correct language code');
    return $pairs;
  }

  /**
   * Get the current values for a given node via the RESTful API.
   *
   * @param int $nid
   *   Unique node ID.
   *
   * @return array
   *   Values for the requested node (all languages).
   */
  private function fetchNode($nid) {
    $response = $this->request('GET', "$this->disUrl/$nid");
    $this->assertEqual($response->getStatusCode(), 200);
    $values = json_decode($response->getBody()->__toString(), TRUE);
    $this->assertEqual($values['nid'], $nid);
    return $values;
  }

  /**
   * Verify that the retrieved values match what we stored.
   *
   * @param array $values
   *   Values retrieved from the CMS for a given node.
   */
  private function checkValues(array $values) {
    $expected = $this->drug;
    $actual = $values;
    $this->assertEqual($values['nid'], $expected['nid'], 'Same node');
    $this->assertFalse($actual['public_use'], 'Public use field unset');
    foreach ($this->fields as $name) {
      $message = "The '$name' field matches in the drug summary";
      $this->assertEqual($actual[$name], $expected[$name], $message);
    }
  }

  /**
   * Release the summaries to the web site.
   */
  private function publish() {
    $drugs = [[$this->drug['nid'], 'en']];
    $response = $this->request('POST', $this->pdqUrl, ['json' => $drugs]);
    $this->assertEqual($response->getStatusCode(), 200);
    $errors = json_decode($response->getBody()->__toString(), TRUE)['errors'];
    $this->assertEmpty($errors, 'Release of drug summary succeeds');
  }

  /**
   * Delete a drug summary (or try to and fail).
   *
   * @param array $drug
   *   Values for the summary to be deleted.
   */
  private function delete(array $drug) {
    $cdr_id = $drug['cdr_id'];
    $response = $this->request('DELETE', "$this->pdqUrl/$cdr_id");
    $this->assertEqual($response->getStatusCode(), 204);
    $response = $this->request('GET', "$this->pdqUrl/$cdr_id");
    $this->assertEqual($response->getStatusCode(), 404);
  }

  /**
   * Make sure the pathauto mechanism has kicked in.
   *
   * The idea here is that the mnemonic ("pretty") URL should get the same
   * HTML back as the canonical URL using the node ID. This happens because
   * we have registered a rule which tells the `pathauto` module to use the
   * value of our new `pdq_url` field in constructing the "pretty" URL.
   *
   * @param array $drug
   *   Values for the drug summary to be visited.
   */
  private function checkPathauto(array $drug) {
    $nid = $drug['nid'];
    $url = "node/$nid";
    $expected = $this->drupalGet($url);
    $this->assertResponse(200);
    $url = ltrim($drug['url'], '/');
    $actual = $this->drupalGet($url);
    $this->assertResponse(200);
    $this->assertEqual($actual, $expected);
  }

}
