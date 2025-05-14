<?php

namespace Drupal\nci_definition\Plugin\Filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\filter\Attribute\Filter;
use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;
use Drupal\filter\Plugin\FilterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a filter to transform <nci-definition> tags.
 */
#[Filter(
  id: "nci_definition",
  title: new TranslatableMarkup("NCI Definition Filter"),
  type: FilterInterface::TYPE_TRANSFORM_REVERSIBLE,
  weight: -10,
  settings: [
    "definition_classes" => "",
  ],
)]
class NciDefinitionFilter extends FilterBase implements ContainerFactoryPluginInterface {

  /**
   * Configuration key format.
   */
  const CONFIG_KEY_FORMAT = '%s_%s_%s';

  /**
   * The configuration factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Constructs a NciDefinitionFilter object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The Drupal configuration factory service.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    ConfigFactoryInterface $config_factory,
    LoggerInterface $logger,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configFactory = $config_factory;
    $this->logger = $logger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('logger.channel.nci_definition')
    );
  }

  /**
   * {@inheritdoc}
   *
   * The expected tag will be:
   *  <nci-definition
   *    data-gloss-id="<CDRID_AS_INT>"
   *    data-gloss-dictionary="<dictionary-name>"
   *    data-gloss-audience="<Patient|HealthProfessional>"
   *    data-gloss-lang="<en|es>"
   *  >text</nci-definition>
   *
   * Gloss ID is required.
   */
  public function process($text, $langcode) {
    $result = new FilterProcessResult($text);

    // We should not go through the effort of making the DOM if there are no
    // instances of <nci-definition> in the text.
    if (strpos($text, '<nci-definition') !== FALSE) {
      // Load the configuration.
      $config = $this->configFactory->get('nci_definition.settings');

      $dom = Html::load($text);
      $xpath = new \DOMXPath($dom);

      foreach ($xpath->query('//nci-definition') as $node) {
        /** @var \DOMElement $node */
        $gloss_id = $node->getAttribute('data-gloss-id');
        // @todo Make default dictionary and audience a config setting.
        // Although, we should only set the default when the WYSIWYG is
        // updated too.
        $dictionary = $node->getAttribute('data-gloss-dictionary') !== '' ? $node->getAttribute('data-gloss-dictionary') : 'Cancer.gov';
        $audience = $node->getAttribute('data-gloss-audience') !== '' ? $node->getAttribute('data-gloss-audience') : 'Patient';
        // Langcode might be unknown or default. We want this to be either
        // en or es. We always want the langcode to match the language of
        // the content. We should probably not set this ever, EXCEPT when
        // we need to force the language of the glossary term. IDK if that
        // is a real need. Technically if we do not include it in the tag,
        // then translating content becomes easier. We make the lang
        // show up in the link because it is a good idea to have it there.
        $lang = $node->getAttribute('data-gloss-lang') !== '' ? $node->getAttribute('data-gloss-lang') : $langcode;

        if ($gloss_id === '') {
          // If the glossary ID is missing, we should not transform the tag.
          $this->logger->warning('Definition filter encountered nci-definition with missing id.');

          continue;
        }

        // Change out the tag here.
        $this->changeNodeName($node, 'a');

        // Generate the href for search engines.
        $url_format = $this->getFormatterString(
          $config->get('nci_glossary_dictionary_urls'),
          $dictionary, $audience, $lang
        );

        // If we have no format string we should log an error.
        if ($url_format === NULL) {
          $this->logger->warning(
            'Definition filter encountered unknown dictionary/audience/language combination: @dictionary/@audience/@language. Please check configuration.',
            [
              '@dictionary' => $dictionary,
              '@audience' => $audience,
              '@language' => $lang,
            ]
          );
          continue;
        }

        $node->setAttribute('href', sprintf($url_format, $gloss_id));

        // Add the class attribute. Each filter instance can override
        // the global definition_classes definition.
        $definition_classes = $config->get('definition_classes');
        if (!empty($this->settings['definition_classes'])) {
          $definition_classes = $this->settings['definition_classes'];
        }
        if (!empty($definition_classes)) {
          $node->setAttribute('class', $definition_classes);
        }

        // Speaking of defaults, we could also let the dictionary popup
        // sort out what to use with the missing data-gloss-*, but for
        // consistency, let's set them here to match the href.
        if (!$node->hasAttribute('data-gloss-dictionary')) {
          $node->setAttribute('data-gloss-dictionary', 'Cancer.gov');
        }
        if (!$node->hasAttribute('data-gloss-audience')) {
          $node->setAttribute('data-gloss-audience', 'Patient');
        }
        if (!$node->hasAttribute('data-gloss-lang')) {
          $node->setAttribute('data-gloss-lang', $lang);
        }
      }

      $result->setProcessedText(Html::serialize($dom));
    }
    return $result;
  }

  /**
   * Rename a DOMNode tag.
   *
   * @param \DOMNode $node
   *   A DOMElement object.
   * @param string $name
   *   The new tag name.
   */
  protected function changeNodeName(\DOMNode &$node, string $name = 'div'): void {
    if ($node->nodeName != $name) {
      /** @var \DOMElement $replacement_node */
      $replacement_node = $node->ownerDocument->createElement($name);

      // Copy all children of the original node to the new node.
      if ($node->childNodes->length) {
        while ($node->firstChild) {
          $replacement_node->appendChild($node->firstChild);
        }
      }

      // Copy all attributes of the original node to the new node.
      if ($node->attributes->length) {
        foreach ($node->attributes as $attribute) {
          $replacement_node->setAttribute($attribute->nodeName, $attribute->nodeValue);
        }
      }

      $node->parentNode->replaceChild($replacement_node, $node);
      $node = $replacement_node;
    }
  }

  /**
   * Get the formatter string from the configuration.
   *
   * @param mixed $array
   *   The nci_glossary_dictionary_urls configuration.
   * @param string $dictionary
   *   The dictionary name (per the Glossary API).
   * @param string $audience
   *   The audience (per the Glossary API).
   * @param string $langcode
   *   The language.
   *
   * @return string
   *   The formatter string.
   */
  private function getFormatterString(mixed $array, $dictionary, $audience, $langcode) {
    foreach ($array as $entry) {
      if (
        strtolower($entry['dictionary']) === strtolower($dictionary) &&
        strtolower($entry['audience']) === strtolower($audience) &&
        strtolower($entry['langcode']) === strtolower($langcode)
      ) {
        return $entry['formatter'];
      }
    }

    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form['definition_classes'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Override Definition Classes'),
      '#default_value' => $this->settings['definition_classes'],
      '#description' => $this->t(
        'The class names to give to the anchor element. This setting will override the global configuration for classes.'
      ),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $summary[] = $this->t('Transforms <nci-definition> tags to <a> tags.');
    return $summary;
  }

}
