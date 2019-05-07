<?php

namespace Drupal\Tests\pdq_glossifier\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;
use CgovPlatform\Tests\CgovSchemaExclusions;

/**
 * Verify correct behavior of the PDQ Glossifier service.
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
   * Mini glossary for testing.
   *
   * @var array
   */
  protected $glossary = [
    "iq\u{2019}mik" => [
      '748239' => [
        'en' => ['Cancer.gov'],
        'es' => ['Cancer.gov'],
      ],
    ],
    "dolor cr\u{00f3}nico" => [
      '44654' => [
        'es' => ['Cancer.gov'],
      ],
    ],
    "sun's soup" => [
      '446552' => [
        'en' => ['Cancer.gov'],
        'es' => ['Cancer.gov'],
      ],
    ],
    'carcinoma' => [
      '45963' => [
        'en' => ['Cancer.gov'],
        'es' => ['Cancer.gov'],
      ],
    ],
    "gerota's capsule" => [
      '335068' => [
        'en' => ['Cancer.gov'],
      ],
    ],
    'carcinoma de vulva in situ' => [
      '741734' => [
        'es' => ['Cancer.gov'],
      ],
    ],
    'vulva' => [
      '44974' => [
        'en' => ['Cancer.gov'],
        'es' => ['Cancer.gov'],
      ],
    ],
  ];

  /**
   * Test HTML fragment to be submitted to the glossifier service.
   *
   * The array will be spliced together later. Doing it like this so
   * I'm not stuck with an obscenely long line in this source code
   * file, and so I can sprinkle in some comments.
   *
   * @var array
   */
  protected $fragment = [

    // The 'carcinoma' inside the tag should be ignored.
    "<p class=\"carcinoma\">",

    // The "smart" quote should match the apostrophe.
    "Bebe Sun\u{2019}s Soup para evitar la \n",

    // This occurrence has already been glossified, so skip it.
    "<a href=\"/Common/PopUps/popDefinition?id=446552\">carcinoma</a>.\n",

    // Non-ASCII characters should count as 1, not multiple bytes.
    "Y para evitar el dolor cr\u{00f3}nico de carcinoma.\n",

    // Special delimiters to suppress portions from glossification.
    "{{Y m\u{00e1}s carcinoma a ser ignorado.}}\n",

    // Should have first_occurrence of FALSE.
    "Y aun m\u{00e1}s carcinoma.\n",

    // Match the larger term, but not 'carcinoma' or vulva' by themselves.
    "Y carcinoma de vulva in situ tambi\u{00e9}n es carcinoma.\n",

    // Skip Gerota's capsule, which is English only.
    "Por \u{00fa}ltimo, no olvides Gerota's capsule o iq'mik.</p>",
  ];

  /**
   * Values we should get back from the glossifier service.
   *
   * @var array
   */
  protected $expected = [

    // Term: Sun’s Soup.
    [
      'start' => 26,
      'length' => 10,
      'doc_id' => 'CDR0000446552',
      'language' => 'es',
      'first_occurrence' => TRUE,
      'dictionary' => 'Cancer.gov',
    ],

    // Term: dolor crónico.
    [
      'start' => 134,
      'length' => 13,
      'doc_id' => 'CDR0000044654',
      'language' => 'es',
      'first_occurrence' => TRUE,
      'dictionary' => 'Cancer.gov',
    ],

    // Term: carcinoma.
    [
      'start' => 151,
      'length' => 9,
      'doc_id' => 'CDR0000045963',
      'language' => 'es',
      'first_occurrence' => TRUE,
      'dictionary' => 'Cancer.gov',
    ],

    // Term: carcinoma.
    [
      'start' => 208,
      'length' => 9,
      'doc_id' => 'CDR0000045963',
      'language' => 'es',
      'first_occurrence' => FALSE,
      'dictionary' => 'Cancer.gov',
    ],

    // Term: carcinoma de vulva in situ.
    [
      'start' => 221,
      'length' => 26,
      'doc_id' => 'CDR0000741734',
      'language' => 'es',
      'first_occurrence' => TRUE,
      'dictionary' => 'Cancer.gov',
    ],

    // Term: carcinoma.
    [
      'start' => 259,
      'length' => 9,
      'doc_id' => 'CDR0000045963',
      'language' => 'es',
      'first_occurrence' => FALSE,
      'dictionary' => 'Cancer.gov',
    ],

    // Term: iq'mik.
    [
      'start' => 312,
      'length' => 6,
      'doc_id' => 'CDR0000748239',
      'language' => 'es',
      'first_occurrence' => TRUE,
      'dictionary' => 'Cancer.gov',
    ],
  ];

  /**
   * URL for PDQ Glossifier API.
   *
   * @var string
   */
  protected $url;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();

    // Build the URL for the API requests.
    $url = Url::fromUri('base:pdq/api/glossifier');
    $this->url = $url->setAbsolute(TRUE)->toString();

    // Create a user that can refresh the glossifier.
    $user = $this->drupalCreateUser();
    $user->addRole('pdq_importer');
    $user->save();
    $this->auth = [$user->name->value, $user->passRaw];
  }

  /**
   * Verify correct behavior of PDQ Glossifier APIs.
   */
  public function testApis() {

    // Store the glossary information.
    $options = [
      'auth' => $this->auth,
      'query' => ['_format' => 'json'],
      'http_errors' => FALSE,
      'allow_redirects' => FALSE,
      'json' => $this->glossary,
    ];
    $client = $this->getHttpClient();
    $url = $this->url . '/refresh';
    $response = $client->request('POST', $url, $options);
    $this->assertEqual($response->getStatusCode(), 200);
    $count = count($this->glossary);
    $expected = "Stored $count glossary terms at ";
    $got = json_decode($response->getBody()->__toString())->message;
    $this->assertStringStartsWith($expected, $got, 'Glossary stored');

    // Submit a fragment to the glossifier service.
    $request = [
      'fragment' => implode('', $this->fragment),
      'languages' => ['es'],
      'dictionaries' => ['Cancer.gov'],
    ];
    $options = [
      'query' => ['_format' => 'json'],
      'http_errors' => FALSE,
      'allow_redirects' => FALSE,
      'json' => $request,
    ];

    // Anyone can use the glossifier.
    $user = $this->createUser();
    $this->drupalLogin($user);
    $client = $this->getHttpClient();
    $response = $client->request('POST', $this->url, $options);
    $this->assertEqual($response->getStatusCode(), 200);
    $body = $response->getBody()->__toString();
    $matches = json_decode($body, TRUE);
    $msg = 'Received expected number of matches';
    $this->assertCount(count($this->expected), $matches, $msg);

    // Check each of the expected values.
    $i = 0;
    foreach ($this->expected as $expected) {
      $got = $matches[$i++];
      foreach ($expected as $name => $value) {
        $message = "$name field matches for term $i";
        $this->assertEqual($got[$name], $value, $message);
      }
    }
  }

}
