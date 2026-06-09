<?php

namespace Drupal\cgov_core\Plugin\LanguageNegotiation;

use Drupal\language\LanguageNegotiationMethodBase;
use Symfony\Component\HttpFoundation\Request;

/**
 * Language negotiation plugin that keeps the admin UI in English.
 *
 * Runs before URL-based negotiation so that authenticated users always receive
 * English for the interface language, keeping the admin menu in English
 * regardless of content language. Anonymous visitors on /espanol/ pages fall
 * through to URL-based detection so .po translations load correctly.
 *
 * @LanguageNegotiation(
 *   id = \Drupal\cgov_core\Plugin\LanguageNegotiation\LanguageNegotiationAdminEnglish::METHOD_ID,
 *   weight = -12,
 *   name = @Translation("Admin English"),
 *   description = @Translation("The admin UI always uses English regardless of URL or user preference."),
 * )
 */
final class LanguageNegotiationAdminEnglish extends LanguageNegotiationMethodBase {

  const METHOD_ID = 'cgov-admin-english';

  /**
   * {@inheritdoc}
   */
  public function getLangcode(?Request $request = NULL): ?string {
    if ($this->currentUser && $this->currentUser->isAuthenticated()) {
      return 'en';
    }
    return NULL;
  }

}
