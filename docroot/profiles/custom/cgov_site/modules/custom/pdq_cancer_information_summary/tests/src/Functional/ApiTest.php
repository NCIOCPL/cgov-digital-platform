<?php

namespace Drupal\Tests\pdq_cancer_information_summary\Functional;

use Drupal\Core\Url;
use Drupal\taxonomy\Entity\Term;
use Drupal\Tests\BrowserTestBase;

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
   * Basic authentication credentials.
   *
   * @var array
   */
  protected $auth;

  /**
   * Test English Cancer Information Summary document.
   *
   * @var array
   */
  protected $english = [
    'nid' => NULL,
    'title' => 'Test English Summary',
    'short_title' => 'Test Short Title',
    'description' => 'Test description',
    'language' => 'en',
    'url' => '/types/lymphoma/hp/adult-hodgkin-treatment-pdq',
    'cdr_id' => 5001,
    'audience' => 'Patients',
    'summary_type' => 'Treatment',
    // Begin suppressed field.
    // 'keywords' => 'cancer, treatment',
    // End suppressed field.
    'posted_date' => '2020-01-01',
    'updated_date' => '2020-01-02',
    'sections' => [
      ['id' => '_1', 'title' => 'Section 1', 'html' => '<p>one</p>'],
      ['id' => '_2', 'title' => 'Section 2', 'html' => '<p>two</p>'],
    ],
  ];

  /**
   * Test Spanish Cancer Information Summary document.
   *
   * @var array
   */
  protected $spanish = [
    'nid' => NULL,
    'title' => "Resumen en espa\u{f1}ol",
    'short_title' => "T\u{ed}tulo corto",
    'description' => "Descripci\u{f3}n",
    'language' => 'es',
    'url' => '/tipos/linfoma/pro/tratamiento-hodgkin-adultos-pdq',
    'cdr_id' => 5002,
    'audience' => 'Patients',
    'summary_type' => 'Treatment',
    // Begin suppressed field.
    // 'keywords' => 'cancer, treatment',
    // End suppressed field.
    'posted_date' => '2020-01-04',
    'updated_date' => '2020-01-05',
    'sections' => [
      ['id' => '_1', 'title' => "Secci\u{f3}n 1", 'html' => '<p>Uno</p>'],
      ['id' => '_2', 'title' => "Secci\u{f3}n 2", 'html' => '<p>Dos</p>'],
    ],
  ];

  /**
   * Names of fields which can be compared in a loop.
   *
   * @var array
   */
  protected $fields = [
    'audience',
    'cdr_id',
    'description',
    // Begin suppressed field.
    // 'keywords',
    // End suppressed field.
    'posted_date',
    'title',
    'sections',
    'short_title',
    'summary_type',
    'updated_date',
    'url',
  ];

  /**
   * URL for common PDQ API requests.
   *
   * @var string
   */
  protected $pdqUrl;

  /**
   * URL for PDQ Cancer Information Summary API requests.
   *
   * @var string
   */
  protected $cisUrl;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    // Build the URLs for the API requests.
    $url = Url::fromUri('base:pdq/api/cis');
    $this->cisUrl = $url->setAbsolute(TRUE)->toString();
    $url = Url::fromUri('base:pdq/api');
    $this->pdqUrl = $url->setAbsolute(TRUE)->toString();

    // Create a user that can import the PDQ content.
    $user = $this->drupalCreateUser();
    $user->addRole('pdq_importer');
    $user->save();
    $this->auth = [$user->name->value, $user->passRaw];
  }

  /**
   * Verify correct behavior of PDQ Cancer Information Summary APIs.
   */
  public function testApis() {

    // Attempt to create the Spanish summary first (should fail).
    $payload = $this->store($this->spanish, 400);
    $expected = 'New summary node must be the English version';
    $this->assertEqual($payload['message'], $expected);

    // Store new English summary and capture the node ID.
    $payload = $this->store($this->english, 201);
    $nid = $this->english['nid'] = $this->spanish['nid'] = $payload['nid'];

    // Verify that the node ID lookup works correctly.
    $matches = $this->findNodes($this->english['cdr_id']);
    $this->assertEqual($matches, [[$nid, 'en']]);

    // Confirm that the values have been stored correctly.
    $values = $this->fetchNode($nid);
    $this->assertFalse($values['en']['published'], 'Not yet published');
    $this->checkValues($values, ['en']);

    // Store a modified revision (still unpublished).
    $section = ['id' => '_3', 'title' => 'Section 3', 'html' => '<p>3</p>'];
    $this->english['sections'][] = $section;
    $this->english['description'] = 'Revised test description';
    $payload = $this->store($this->english, 200);
    $this->assertEqual($payload['nid'], $nid, 'Uses same node');

    // Confirm that the values are still stored correctly.
    $values = $this->fetchNode($nid);
    $this->assertFalse($values['en']['published'], 'Not yet published');
    $this->checkValues($values, ['en']);

    // Add the Spanish translation.
    $payload = $this->store($this->spanish, 200);
    $this->assertEqual($payload['nid'], $nid, 'Uses same node');

    // Verify that the node ID lookup still works correctly.
    $matches = $this->findNodes($this->spanish['cdr_id']);
    $this->assertEqual($matches, [[$nid, 'es']]);
    $matches = $this->findNodes($this->english['cdr_id']);
    $this->assertEqual($matches, [[$nid, 'en']]);

    // Confirm that the values have been stored correctly.
    $values = $this->fetchNode($nid);
    $this->assertFalse($values['en']['published'], 'Not yet published');
    $this->assertFalse($values['es']['published'], 'Not yet published');
    $this->checkValues($values, ['en', 'es']);

    // Make sure we haven't set the site sections yet.
    $query = \Drupal::entityQuery('taxonomy_term');
    $query->condition('vid', 'cgov_site_sections');
    $query->condition('field_landing_page.target_id', $nid);
    $tids = $query->execute();
    $this->assertEmpty($tids, 'Creation of site sections deferred');

    // Publish the summaries and make sure they're still intact.
    $this->publish();
    $values = $this->fetchNode($nid);
    $this->assertTrue($values['en']['published'], 'Published');
    $this->assertTrue($values['es']['published'], 'Published');
    $this->checkValues($values, ['en', 'es']);

    // Confirm the existence of the site sections.
    $this->checkSiteSections($this->english);
    $this->checkSiteSections($this->spanish);

    // Make sure the pathauto mechanism is behaving correctly.
    $this->checkPathauto($this->english);
    $this->checkPathauto($this->spanish);

    // Make sure changes don't affect the site sections until published.
    $old_short_title = $this->english['short_title'];
    $this->english['short_title'] = 'New Short Title';
    $payload = $this->store($this->english, 200);
    $this->assertEqual($payload['nid'], $nid, 'Uses same node');
    $this->checkSiteSections($this->english, $old_short_title);
    $this->publish([[$nid, 'en']]);
    $this->checkSiteSections($this->english);

    // Try to delete the English summary (should fail).
    $this->delete($this->english, FALSE);

    // Delete the Spanish summary.
    $this->delete($this->spanish, TRUE);

    // Now it should be possible to delete the English summary.
    $this->delete($this->english, TRUE);
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
   * Send values for a PDQ Cancer Information Summary to the CMS.
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
    $response = $this->request('POST', $this->cisUrl, ['json' => $values]);
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
    $this->assertCount(1, $pairs, 'Only one node/language per summary');
    $this->assertCount(2, $pairs[0], 'Pair must have two items');
    list($nid, $language) = $pairs[0];
    $this->assertTrue(is_numeric($nid), 'Node ID is numeric');
    $this->assertEqual($nid, (int) $nid, 'Node ID is an integer');
    $this->assertContains($language, ['en', 'es'], 'Valid language code');
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
    $response = $this->request('GET', "$this->cisUrl/$nid");
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
   * @param array $languages
   *   Languages which should be present in the node.
   */
  private function checkValues(array $values, array $languages) {
    $translations = ['en' => $this->english, 'es' => $this->spanish];
    foreach ($translations as $code => $expected) {
      if (in_array($code, $languages)) {
        $this->assertEqual($values['nid'], $expected['nid'], 'Same node');
        $actual = $values[$code];
        $this->assertTrue($actual['public_use'], 'Public use field set');
        foreach ($this->fields as $name) {
          $message = "The '$name' field matches in the '$code' summary";
          $this->assertEqual($actual[$name], $expected[$name], $message);
        }
      }
      else {
        $this->assertArrayNotHasKey($code, $values, "No '$code' translation");
      }
    }
  }

  /**
   * Release the summaries to the web site.
   *
   * @param array $summaries
   *   Override which summaries to publish.
   */
  private function publish(array $summaries = NULL) {
    if (empty($summaries)) {
      $summaries = [
        [$this->english['nid'], 'en'],
        [$this->spanish['nid'], 'es'],
      ];
    }
    $response = $this->request('POST', $this->pdqUrl, ['json' => $summaries]);
    $this->assertEqual($response->getStatusCode(), 200);
    $errors = json_decode($response->getBody()->__toString(), TRUE)['errors'];
    $this->assertEmpty($errors);
  }

  /**
   * Delete a summary (or try to and fail).
   *
   * @param array $summary
   *   Values for the summary to be deleted.
   * @param bool $success_expected
   *   TRUE if the deletion should succeed.
   */
  private function delete(array $summary, $success_expected) {
    $cdr_id = $summary['cdr_id'];
    $response = $this->request('DELETE', "$this->pdqUrl/$cdr_id");
    if ($success_expected) {
      $this->assertEqual($response->getStatusCode(), 204);
      $response = $this->request('GET', "$this->pdqUrl/$cdr_id");
      $this->assertEqual($response->getStatusCode(), 404);
    }
    else {
      $nodes = $this->findNodes($cdr_id);
      $this->assertEqual($nodes, [[$summary['nid'], $summary['language']]]);
      $this->assertEqual($response->getStatusCode(), 400);
      $payload = json_decode($response->getBody()->__toString(), TRUE);
      $this->assertEqual($payload['message'], 'Spanish translation exists');
    }
  }

  /**
   * Make sure the pathauto mechanism has kicked in.
   *
   * The idea here is that the mnemonic ("pretty") URL should get the same
   * HTML back as the canonical URL using the node ID. This happens because
   * we have registered a rule which tells the `pathauto` module to use the
   * value of our new `pdq_url` field in constructing the "pretty" URL.
   *
   * @param array $summary
   *   Values for the summary to be visited.
   */
  private function checkPathauto(array $summary) {
    $nid = $summary['nid'];
    $url = "node/$nid";
    if ($summary['language'] === 'es') {
      $url = "espanol/$url";
    }
    $expected = $this->drupalGet($url);
    $this->assertResponse(200);
    $url = ltrim($summary['url'], '/');
    if ($summary['language'] === 'es') {
      $url = "espanol/$url";
    }
    $actual = $this->drupalGet($url);
    $this->assertResponse(200);
    $this->assertEqual($actual, $expected);
  }

  /**
   * Confirm that the site section terms have been created.
   *
   * @param array $summary
   *   Values for the summary which should appear in site navigation.
   * @param string $nav_label
   *   Optional value for earlier label which should still be visible,
   *   while a change to the label is waiting to be published.
   */
  private function checkSiteSections(array $summary, $nav_label = NULL) {

    // Start by finding the term linked to this summary.
    $url = $summary['url'];
    $language = $summary['language'];
    $nid = $summary['nid'];
    $query = \Drupal::entityQuery('taxonomy_term');
    $query->condition('vid', 'cgov_site_sections');
    $query->condition('field_landing_page.target_id', $nid);
    $query->condition('langcode', $language);
    $tids = $query->execute();
    $this->assertCount(1, $tids, 'found term for landing page');

    // Unfortunately, Drupal needs help knowing when to let go.
    $storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    $storage->resetCache($tids);
    $section = Term::load(array_pop($tids));

    // Walk backward through the tokens in the summary's URL.
    $tail = TRUE;
    $tokens = explode('/', trim($url, '/'));
    $lang_ok = 'language code is correct';
    while (!empty($tokens)) {

      // Language for the site section needs to match the summary's language.
      $section_langcode = $section->get('langcode')->value;
      $this->assertEqual($section_langcode, $language, $lang_ok);

      // The 'pretty URL' field is a misnomer. It's really the piece of the
      // summary's URL for this node in the terminology hierarchy.
      $token = array_pop($tokens);
      $pretty_url = $section->get('field_pretty_url')->value;
      $this->assertEqual($pretty_url, $token, 'pretty url is correct');

      // We need the term's name for all tokens.
      $name = $section->getName();
      if ($tail) {
        if (empty($nav_label)) {
          $nav_label = $summary['short_title'];
        }

        // For the last token in the URL, fields have different assignments.
        $path = $section->get('computed_path')->value;
        $this->assertEqual($name, $nav_label, 'nav label is correct');
        $this->assertEqual($path, $url, 'computed path is correct');
        $tail = FALSE;
      }
      else {
        $this->assertEqual($name, $token, 'section name matches url token');
      }
      $section = Term::load($section->get('parent')->target_id);
    }
    $this->assertEqual($section->get('parent')->target_id, 0, 'found root');
    $this->assertEqual($section->get('langcode')->value, $language, $lang_ok);
  }

}
