<?php

namespace Drupal\cgov_sitemap\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class SitemapIndex.
 *
 * @package Drupal\cgov_sitemap\Controller
 */
class SitemapIndex extends ControllerBase {

  /**
   * Replace the generated site map with a site index.
   *
   * We only route to this controller for the www.cancer.gov microsite.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   Prepared response object.
   */
  public function index(Request $request) {
    $base = $request->getSchemeAndHttpHost();
    $now = \date('c');
    $content = <<<EOT
<?xml version="1.0" encoding="utf-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>$base/content/sitemap.xml</loc>
    <lastmod>$now</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.cancer.gov/sitemaps/dictionaries.xml</loc>
    <lastmod>$now</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.cancer.gov/sitemaps/dynamiclistingpages.xml</loc>
    <lastmod>$now</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.cancer.gov/sitemaps/clinicaltrials.xml</loc>
    <lastmod>$now</lastmod>
  </sitemap>
</sitemapindex>
EOT;
    $response = new Response();
    $response->headers->set('Content-type', 'text/xml');
    $response->setContent($content);
    return $response;
  }

}
