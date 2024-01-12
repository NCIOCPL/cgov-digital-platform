<?php

namespace Drupal\cgov_article;

use Drupal\Component\Transliteration\PhpTransliteration;
use Drupal\Core\Language\LanguageManagerInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

/**
 * Extend Drupal's AbstractExtension class.
 */
class CgovArticleTwigExtensions extends AbstractExtension {


  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Constructs \Drupal\cgov_article\CgovArticleTwigExtensions.
   *
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   */
  public function __construct(LanguageManagerInterface $language_manager) {
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return 'cgov_article.CgovArticleTwigExtensions';
  }

  /**
   * {@inheritdoc}
   */
  public function getFilters() {
    return [
      new TwigFilter('nci_transliterate', [$this, 'transliterate']),
    ];
  }

  /**
   * Replaces non-English characters with their closest equivalent.
   *
   * Any character entities are removed.
   *
   * @param string $text
   *   Accented String.
   *
   * @return string
   *   Formatted String.
   */
  public function transliterate($text) {
    $langcode = $this->languageManager->getCurrentLanguage()->getId();
    $trans = new PHPTransliteration();
    $text = preg_replace("/&#?[a-z0-9]+;/i", "", $text);
    $text = $trans->transliterate($text, $langcode);
    return $text;
  }

}
