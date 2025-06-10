<?php

namespace Drupal\nci_definition\Services;

use Drupal\Component\Utility\Html;

/**
 * Provides a class to convert legacy glossification links.
 */
class NciDefinitionLegacyConverter {

  /**
   * Converts legacy HTML to modern HTML.
   *
   * @param string $old_html
   *   The old HTML string.
   *
   * @return string
   *   The converted HTML string.
   */
  public function convert(string $old_html): string {
    $dom = Html::load($old_html);
    $xpath = new \DOMXpath($dom);

    // Find all <a class="definition"> tags.
    foreach ($xpath->query('//a[contains(@class, "definition")]') as $node) {
      /** @var \DOMElement $node */

      $href = $node->getAttribute('href');

      // Parse the href query parameters.
      parse_str(parse_url(html_entity_decode($href), PHP_URL_QUERY), $params);

      $id = isset($params['id']) ? (int) preg_replace('/\D/', '', $params['id']) : NULL;

      $version = isset($params['version']) ? strtolower($params['version']) : 'patient';
      $audienceMapping = [
        'patient' => 'Patient',
        'healthprofessional' => 'Health Professional',
      ];

      $audience = $audienceMapping[$version] ?? 'Patient';
      $lang = isset($params['language']) && $params['language'] === 'English' ? 'en' : 'es';

      $dictionary = isset($params['dictionary']) ? strtolower($params['dictionary']) : 'cancer.gov';
      if ($dictionary === 'genetic') {
        $dictionary = 'genetics';
      }
      $dictionary = ucfirst($dictionary);

      if ($id) {
        $definition = $dom->createElement('nci-definition');
        $definition->setAttribute('data-gloss-id', $id);
        $definition->setAttribute('data-gloss-dictionary', $dictionary);
        $definition->setAttribute('data-gloss-audience', $audience);
        $definition->setAttribute('data-gloss-lang', $lang);

        while ($node->firstChild) {
          $definition->appendChild($node->firstChild);
        }

        $node->parentNode->replaceChild($definition, $node);
      }
    }
    return Html::serialize($dom);
  }

}
