<?php

/**
 * @file
 * Contains classes needed for sending requests to the Site Factory.
 */

namespace Acquia\SimpleRest;

/**
 * Class SimpleRestCreds.
 *
 * Contains the REST credentials that will be used when making Site Factory
 * requests.
 */
// Class name doesn't match filename.
// phpcs:disable
class SimpleRestCreds {
// phpcs:enable

  /**
   * The username to be used to contact Site Factory.
   *
   * @var string
   */
  public $name;

  /**
   * The password to be used to contact Site Factory.
   *
   * @var string
   */
  public $password;

  /**
   * The URL of the Site Factory.
   *
   * @var string
   */
  public $url;

  /**
   * Creates a new instance of SimpleRestCreds.
   *
   * @param string $name
   *   The username to be used to contact Site Factory.
   * @param string $password
   *   The password to be used to contact Site Factory.
   * @param string $url
   *   The URL of the Site Factory.
   */
  public function __construct($name, $password, $url) {
    $this->name = $name;
    $this->password = $password;
    $this->url = $url;
  }

}

/**
 * Class SimpleRestMessage.
 *
 * A simple class used to send REST requests to the Site Factory.
 */
class SimpleRestMessage {

  /**
   * Maximum amount of retries before giving up sending a message.
   */
  private int $retryMax = 3;

  /**
   * Number of seconds to wait before trying again after sending failed.
   */
  private int $retryWait = 5;

  /**
   * The hosting sitegroup name.
   */
  private string $site;

  /**
   * The hosting environment name.
   */
  private string $env;

  /**
   * Creates a new instance of SimpleRestMessage.
   *
   * @param string $site
   *   The hosting sitegroup name.
   * @param string $env
   *   The hosting environment name.
   */
  public function __construct($site, $env) {
    $this->site = $site;
    $this->env = $env;
  }

  /**
   * Sends a request.
   *
   * @param string $method
   *   The request method.  Either 'POST' or 'GET'.
   * @param string $endpoint
   *   The request endpoint.
   * @param array $parameters
   *   Any required parameters for the request. Note: parameters are currently
   *   only implemented for POST requests. To add support for GET parameters
   *   would require changes in this method.
   * @param SimpleRestCreds $creds
   *   The credentials to use for the Site Factory request.
   *
   * @throws Exception
   *   If the request fails.
   *
   * @return \SimpleRestResponse
   *   The response.
   */
  public function send($method, $endpoint, array $parameters, SimpleRestCreds $creds) {
    $error = '';
    $user_agent = sprintf('%s.%s %s', $this->site, $this->env, gethostname());
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_USERAGENT, $user_agent);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_USERPWD, $creds->name . ":" . $creds->password);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);

    // If it is not a GET request, set the method here.
    if ($method != 'GET') {
      curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    }

    // If we are sending parameters, set the query string or POST fields here.
    $query_string = '';
    if ($method != 'GET' && !empty($parameters)) {
      $data_string = json_encode($parameters, JSON_THROW_ON_ERROR);
      curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data_string),
      ]);
    }

    $full_url = sprintf('%s/%s%s', $creds->url, $endpoint, $query_string);
    curl_setopt($curl, CURLOPT_URL, $full_url);

    $attempts = 0;
    $response = FALSE;

    while (!$response && ++$attempts <= $this->retryMax) {
      $response = curl_exec($curl);
      if (!$response) {
        $error = curl_error($curl);
        sleep($this->retryWait);
      }
    }

    if (!$response) {
      throw new Exception(sprintf('Error reaching url "%s" with method "%s." Returned error "%s."', $full_url, $method, $error));
    }

    $response_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $response_body = json_decode($response, TRUE, 512, JSON_THROW_ON_ERROR);

    if (!is_array($response_body)) {
      $response_body = [];
    }

    curl_close($curl);

    return new SimpleRestResponse($endpoint, $response_code, $response_body);
  }

}

/**
 * Class SimpleRestResponse.
 *
 * Holds the response.
 */
class SimpleRestResponse {
  /**
   * The request endpoint.
   *
   * @var string
   */
  public $endpoint;

  /**
   * The response code.
   *
   * @var string
   */
  public $code;

  /**
   * The response body.
   *
   * @var array
   */
  public $body;

  /**
   * Constructs a new instance of SimpleRestResponse.
   *
   * @param string $endpoint
   *   The request endpoint.
   * @param string $response_code
   *   The response code.
   * @param array $response_body
   *   The response body.
   */
  public function __construct($endpoint, $response_code, array $response_body) {
    $this->endpoint = $endpoint;
    $this->code = $response_code;
    $this->body = $response_body;
  }

}
