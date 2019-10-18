<?php

namespace Drupal\cgov_vocab_manager\Manager;

use Drupal\Core\Breadcrumb\Breadcrumb;
use Drupal\Core\Link;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\TermStorageInterface;
use Drupal\Core\Url;

/**
 * Class CgovVocabManager.
 *
 * @package Drupal\cgov_vocab_manager\Manager
 */
class CgovVocabManager {

  use StringTranslationTrait;

  /**
   * Generates a rendered breadcrumb that print taxonomy hiererchy levels.
   */
  public function getTaxonomyBreadcrumb(int $parent_tid, TermStorageInterface $storageController, RendererInterface $renderer) {
    if (!isset($parent_tid) || !$parent_tid) {
      return;
    }

    // Load all parents.
    $parents = $storageController->loadAllParents($parent_tid);
    $term = $storageController->load($parent_tid);

    // Go through the parent elements and generate an array of Urls.
    $first_element = TRUE;
    while ($parent = array_shift($parents)) {
      $parent_link_text = $parent->getName();

      if ($first_element) {
        $parent_link_text = strtoupper($parent_link_text);
        $parent_link_url = Url::fromRoute('<nolink>');
        $first_element = FALSE;
      }
      else {
        $parent_link_url = Url::fromRoute('cgov_vocab_manager.overview_onelevel_form', [
          'taxonomy_vocabulary' => $parent->getVocabularyId(),
          'parent_tid' => $parent->id(),
        ]);
      }

      $parent_link = Link::fromTextAndUrl($parent_link_text, $parent_link_url);
      $parents_links[] = $parent_link;
    }
    // Add Root in so users can get back to main overview page.
    $parents_links[] = Link::fromTextAndUrl('Level 0 (Root)', Url::fromRoute('cgov_vocab_manager.overview_onelevel_form', [
      'taxonomy_vocabulary' => $term->getVocabularyId(),
      'parent_tid' => 0,
    ]));
    // Revert the order of the Url elements.
    $parents_links = array_reverse($parents_links);

    // Output the Urls as a Breadcrumb.
    $breadcrumb = new Breadcrumb();
    $breadcrumb->setLinks($parents_links);
    $breadcrumb_render_array = $breadcrumb->toRenderable();

    // Return the rendered Breadcrumb.
    return $renderer->render($breadcrumb_render_array);
  }

  /**
   * Generates a rendered link to the overview page of term children.
   */
  public function getChildrenLink(Term $term, TermStorageInterface $storageController, RendererInterface $renderer) {
    // Count the number of children of the current term.
    $children_count = count($storageController->loadChildren($term->id(), $term->getVocabularyId()));

    // Generate the link.
    $link_manage_children_url = Url::fromRoute('cgov_vocab_manager.overview_onelevel_form', [
      'taxonomy_vocabulary' => $term->getVocabularyId(),
      'parent_tid' => $term->id(),
    ]);
    $link_manage_children_url_text = $this->formatPlural($children_count, '1 child', '@count children');
    $link_manage_children = Link::fromTextAndUrl($link_manage_children_url_text, $link_manage_children_url)
      ->toRenderable();

    // Render the link for output.
    $link_manage_children_rendered = ($children_count) ? ' (' . $renderer->render($link_manage_children) . ')' : '';

    return $link_manage_children_rendered;
  }

}
