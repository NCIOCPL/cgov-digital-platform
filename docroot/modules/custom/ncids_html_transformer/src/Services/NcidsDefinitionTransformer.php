<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer for definition links.
 *
 * This transformer will not use the data-html-transformer attribute,
 * but we will just make sure it runs before Disallowed* transformers.
 * We are doing this so that we don't have to worry about transforming
 * the child nodes. (The attributes allowed on nci-definition are
 * allowed by the DisallowedAttributes transformer.)
 */
class NcidsDefinitionTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    // This all was copied from NciDefinitionLegacyConverter so that
    // we do not have to make the nci_definition module a dependency
    // of ncids_html_transformer.
    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    // Find all <a class="definition"> tags.
    foreach ($xpath->query('//a[contains(@class, "definition")]') as $node) {
      /** @var \DOMElement $node */

      $href = $node->getAttribute('href');

      // If the href does not match the known good URL structure of a
      // definition link we should move along.
      if (
        !preg_match('/^(http[s]*:\/\/[^\/]*|)\/Common\/PopUps\/popDefinition\.aspx\?id=([^&]*)&version=(patient|healthprofessional)&language=(English|Spanish|en|es)$/i', $href) &&
        !preg_match('/^\/Common\/PopUps\/popDefinition\.aspx\?id=([^&]*)&version=(patient|healthprofessional)&language=(English|Spanish|en|es)&dictionary=([^&]*)$/i', $href)
      ) {
        continue;
      }

      // Parse the href query parameters.
      parse_str(parse_url(html_entity_decode($href), PHP_URL_QUERY), $params);

      $id = isset($params['id']) ? (int) preg_replace('/\D/', '', $params['id']) : NULL;

      $version = isset($params['version']) ? strtolower($params['version']) : 'patient';
      $audienceMapping = [
        'patient' => 'Patient',
        'healthprofessional' => 'Health Professional',
      ];

      $audience = $audienceMapping[$version] ?? 'Patient';

      $spanish_language_params = ['es', 'spanish'];
      $lang = isset($params['language']) &&
        (in_array(strtolower($params['language']), $spanish_language_params)) ?
        'es' : 'en';

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
