<?php
//phpcs:ignoreFile

namespace Drupal\cgov_vocab_manager\Form;

use Drupal\cgov_vocab_manager\Manager\CgovVocabManager;
use Drupal\Component\Utility\Unicode;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\DependencyInjection\DeprecatedServicePropertyTrait;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Url;
use Drupal\taxonomy\VocabularyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides terms overview form for a taxonomy vocabulary.
 *
 * @internal
 */
class CgovVocabManagerForm extends FormBase {

  use DeprecatedServicePropertyTrait;

  /**
   * {@inheritdoc}
   */
  protected $deprecatedProperties = ['entityManager' => 'entity.manager'];

  /**
   * The module handler service.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * The entity manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The term storage handler.
   *
   * @var \Drupal\taxonomy\TermStorageInterface
   */
  protected $storageController;

  /**
   * The term list builder.
   *
   * @var \Drupal\Core\Entity\EntityListBuilderInterface
   */
  protected $termListBuilder;

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * The entity repository.
   *
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected $entityRepository;

  /**
   * The cgov vocab manager.
   *
   * @var \Drupal\cgov_vocab_manager\Manager\CgovVocabManager
   */
  protected $vocabManager;

  /**
   * Constructs an OverviewTerms object.
   *
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler service.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   * @param \Drupal\Core\Entity\EntityRepositoryInterface $entity_repository
   *   The entity repository.
   * @param \Drupal\cgov_vocab_manager\Manager\CgovVocabManager $vocab_manager
   *   The vocab manager.
   */
  public function __construct(
    ModuleHandlerInterface $module_handler, 
    EntityTypeManagerInterface $entity_type_manager, 
    RendererInterface $renderer = NULL, 
    EntityRepositoryInterface $entity_repository = NULL,
    CgovVocabManager $vocab_manager
    ) {
      $this->moduleHandler = $module_handler;
      $this->entityTypeManager = $entity_type_manager;
      $this->storageController = $entity_type_manager->getStorage('taxonomy_term');
      $this->termListBuilder = $entity_type_manager->getListBuilder('taxonomy_term');
      $this->renderer = $renderer;
      $this->entityRepository = $entity_repository;
      $this->vocabManager = $vocab_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('module_handler'),
      $container->get('entity_type.manager'),
      $container->get('renderer'),
      $container->get('entity.repository'),
      $container->get('cgov_vocab_manager.manager')
    );
  }

  /**
   * Returns the title for the whole page.
   *
   * @param \Drupal\taxonomy\Entity\Vocabulary $taxonomy_vocabulary
   *   The name of the vocabulary.
   *
   * @return string
   *   The title, itself
   */
  public function getTitle($taxonomy_vocabulary) {
    return $this->t("CGov Vocab Manager - %voc_name", ["%voc_name" => $taxonomy_vocabulary->label()]);
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'cgov_vocab_manager_form';
  }

  public function getTreeArgs($taxonomy_vocabulary) {

    $tree_args = [
      'vid' => $taxonomy_vocabulary->id(),
      'parent' => 0,
      'max_depth' => 1,
      'load_entities' => FALSE,
    ];

    $this->moduleHandler->alter('taxonomy_tree_args', $tree_args);

    return $tree_args;
  }

  /**
   * Form constructor.
   *
   * Display a tree of all the terms in a vocabulary, with options to edit
   * each one. The form is made drag and drop by the theme function.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\taxonomy\VocabularyInterface $taxonomy_vocabulary
   *   The vocabulary to display the overview form for.
   *
   * @return array
   *   The form structure.
   */
  public function buildForm(array $form, FormStateInterface $form_state, VocabularyInterface $taxonomy_vocabulary = NULL, int $parent_tid = NULL) {
    // @todo Remove global variables when https://www.drupal.org/node/2044435 is
    //   in.
    global $pager_page_array, $pager_total, $pager_total_items;

    $form_state->set(['taxonomy', 'vocabulary'], $taxonomy_vocabulary);
    $vocabulary_hierarchy = $this->storageController->getVocabularyHierarchyType($taxonomy_vocabulary->id());
    $parent_fields = FALSE;

    $page = $this->getRequest()->query->get('page') ?: 0;
    // Number of terms per page.
    $page_increment = $this->config('taxonomy.settings')
      ->get('terms_per_page_admin');
    // Elements shown on this page.
    $page_entries = 0;
    // Elements at the root level before this page.
    $before_entries = 0;
    // Elements at the root level after this page.
    $after_entries = 0;
    // Elements at the root level on this page.
    $root_entries = 0;

    // Terms from previous and next pages are shown if the term tree would have
    // been cut in the middle. Keep track of how many extra terms we show on
    // each page of terms.
    $back_step = NULL;
    $forward_step = 0;

    // An array of the terms to be displayed on this page.
    $current_page = [];

    $delta = 0;
    $term_deltas = [];

    $tree_args = $this->getTreeArgs($taxonomy_vocabulary);

    $tree = $this->storageController->loadTree($tree_args['vid'], $tree_args['parent'], $tree_args['max_depth'], $tree_args['load_entities']);
    $tree_index = 0;
    do {
      // In case this tree is completely empty.
      if (empty($tree[$tree_index])) {
        break;
      }
      $delta++;
      // Count entries before the current page.
      if ($page && ($page * $page_increment) > $before_entries && !isset($back_step)) {
        $before_entries++;
        continue;
      }
      // Count entries after the current page.
      elseif ($page_entries > $page_increment && isset($complete_tree)) {
        $after_entries++;
        continue;
      }

      // Do not let a term start the page that is not at the root.
      $term = $tree[$tree_index];
      if (isset($term->depth) && ($term->depth > 0) && !isset($back_step)) {
        $back_step = 0;
        while ($pterm = $tree[--$tree_index]) {
          $before_entries--;
          $back_step++;
          if ($pterm->depth == 0) {
            $tree_index--;
            // Jump back to the start of the root level parent.
            continue 2;
          }
        }
      }
      $back_step = isset($back_step) ? $back_step : 0;

      // Continue rendering the tree until we reach the a new root item.
      if ($page_entries >= $page_increment + $back_step + 1 && $term->depth == 0 && $root_entries > 1) {
        $complete_tree = TRUE;
        // This new item at the root level is the first item on the next page.
        $after_entries++;
        continue;
      }
      if ($page_entries >= $page_increment + $back_step) {
        $forward_step++;
      }

      // Finally, if we've gotten down this far, we're rendering a term on this
      // page.
      $page_entries++;
      $term_deltas[$term->tid] = isset($term_deltas[$term->tid]) ? $term_deltas[$term->tid] + 1 : 0;
      $key = 'tid:' . $term->tid . ':' . $term_deltas[$term->tid];

      // Keep track of the first term displayed on this page.
      if ($page_entries == 1) {
        $form['#first_tid'] = $term->tid;
      }
      // Keep a variable to make sure at least 2 root elements are displayed.
      if ($term->parents[0] == 0) {
        $root_entries++;
      }
      $current_page[$key] = $term;
    } while (isset($tree[++$tree_index]));

    // Because we didn't use a pager query, set the necessary pager variables.
    $total_entries = $before_entries + $page_entries + $after_entries;
    $pager_total_items[0] = $total_entries;
    $pager_page_array[0] = $page;
    $pager_total[0] = ceil($total_entries / $page_increment);

    // If this form was already submitted once, it's probably hit a validation
    // error. Ensure the form is rebuilt in the same order as the user
    // submitted.
    $user_input = $form_state->getUserInput();
    if (!empty($user_input)) {
      // Get the POST order.
      $order = array_flip(array_keys($user_input['terms']));
      // Update our form with the new order.
      $current_page = array_merge($order, $current_page);
      foreach ($current_page as $key => $term) {
        // Verify this is a term for the current page and set at the current
        // depth.
        if (is_array($user_input['terms'][$key]) && is_numeric($user_input['terms'][$key]['term']['tid'])) {
          $current_page[$key]->depth = $user_input['terms'][$key]['term']['depth'];
        }
        else {
          unset($current_page[$key]);
        }
      }
    }

    $args = [
      '%capital_name' => Unicode::ucfirst($taxonomy_vocabulary->label()),
      '%name' => $taxonomy_vocabulary->label(),
    ];
    $help_message = '';
    if (!is_null($parent_tid) && $parent_tid) {
      $help_message = $this->vocabManager->getTaxonomyBreadcrumb($parent_tid, $this->storageController, $this->renderer);
    }

    // Get the IDs of the terms edited on the current page which have pending
    // revisions.
    $edited_term_ids = array_map(function ($item) {
      return $item->tid;
    }, $current_page);
    $pending_term_ids = array_intersect($this->storageController->getTermIdsWithPendingRevisions(), $edited_term_ids);
    if ($pending_term_ids) {
      $help_message = $this->formatPlural(
        count($pending_term_ids),
        '%capital_name contains 1 term with pending revisions. Drag and drop of terms with pending revisions is not supported, but you can re-enable drag-and-drop support by getting each term to a published state.',
        '%capital_name contains @count terms with pending revisions. Drag and drop of terms with pending revisions is not supported, but you can re-enable drag-and-drop support by getting each term to a published state.',
        $args
      );
    }

    // Only allow access to change parents and reorder the tree if there are no
    // pending revisions and there are no terms with multiple parents.
    $update_tree_access = AccessResult::allowedIf(empty($pending_term_ids) && $vocabulary_hierarchy !== VocabularyInterface::HIERARCHY_MULTIPLE);

    $form['help'] = [
      '#type' => 'container',
      'message' => ['#markup' => $help_message],
    ];
    if (!$update_tree_access->isAllowed()) {
      $form['help']['#attributes']['class'] = ['messages', 'messages--warning'];
    }

    $errors = $form_state->getErrors();
    $row_position = 0;
    // Build the actual form.
    $access_control_handler = $this->entityTypeManager->getAccessControlHandler('taxonomy_term');
    $create_access = $access_control_handler->createAccess($taxonomy_vocabulary->id(), NULL, [], TRUE);
    if ($create_access->isAllowed()) {
      $empty = $this->t('No terms available. <a href=":link">Add term</a>.', [
        ':link' => Url::fromRoute('entity.taxonomy_term.add_form', ['taxonomy_vocabulary' => $taxonomy_vocabulary->id()])
          ->toString(),
      ]);
    }
    else {
      $empty = $this->t('No terms available.');
    }
    $form['terms'] = [
      '#type' => 'table',
      '#empty' => $empty,
      '#header' => [
        'term' => $this->t('Name'),
        'children' => $this->t('Children'),
        'operations' => $this->t('Operations'),
        'weight' => $update_tree_access->isAllowed() ? $this->t('Weight') : NULL,
      ],
      '#attributes' => [
        'id' => 'taxonomy',
      ],
    ];
    $this->renderer->addCacheableDependency($form['terms'], $create_access);

    foreach ($this->loadTermsByStubs($current_page) as $key => $term) {
      $form['terms'][$key] = [
        'term' => [],
        'children' => [],
        'operations' => [],
        'weight' => $update_tree_access->isAllowed() ? [] : NULL,
      ];
      // Removing the below line because it is translating the $term for the current
      // language. If we are translating an english term to english, its the same term.
      // $term = $this->entityRepository->getTranslationFromContext($term);
      $form['terms'][$key]['#term'] = $term;
      $indentation = [];
      if (isset($term->depth) && intval($term->depth) > 0) {
        $indentation = [
          '#theme' => 'indentation',
          '#size' => $term->depth,
        ];
      }
      $form['terms'][$key]['term'] = [
        '#prefix' => !empty($indentation) ? $this->renderer->render($indentation) : '',
        '#type' => 'link',
        '#title' => $term->getName(),
        '#url' => $term->toUrl(),
      ];

      $form['terms'][$key]['children'] = [
        '#type' => 'markup',
        '#markup' => $this->vocabManager
          ->getChildrenLink($term, $this->storageController, $this->renderer),
      ];

      // Add a special class for terms with pending revision so we can highlight
      // them in the form.
      $form['terms'][$key]['#attributes']['class'] = [];
      if (in_array($term->id(), $pending_term_ids)) {
        $form['terms'][$key]['#attributes']['class'][] = 'color-warning';
        $form['terms'][$key]['#attributes']['class'][] = 'taxonomy-term--pending-revision';
      }

      if ($update_tree_access->isAllowed() && count($tree) > 1) {
        $parent_fields = TRUE;
        $form['terms'][$key]['term']['tid'] = [
          '#type' => 'hidden',
          '#value' => $term->id(),
          '#attributes' => [
            'class' => ['term-id'],
          ],
        ];
        $form['terms'][$key]['term']['parent'] = [
          '#type' => 'hidden',
          // Yes, default_value on a hidden. It needs to be changeable by the
          // javascript.
          '#default_value' => $term->parents[0],
          '#attributes' => [
            'class' => ['term-parent'],
          ],
        ];
        $form['terms'][$key]['term']['depth'] = [
          '#type' => 'hidden',
          // Same as above, the depth is modified by javascript, so it's a
          // default_value.
          '#default_value' => $term->depth,
          '#attributes' => [
            'class' => ['term-depth'],
          ],
        ];
      }
      $update_access = $term->access('update', NULL, TRUE);
      $update_tree_access = $update_tree_access->andIf($update_access);

      if ($update_tree_access->isAllowed()) {
        $form['terms'][$key]['weight'] = [
          '#type' => 'weight',
          '#delta' => $delta,
          '#title' => $this->t('Weight for added term'),
          '#title_display' => 'invisible',
          '#default_value' => $term->getWeight(),
          '#attributes' => ['class' => ['term-weight']],
        ];
      }

      if ($operations = $this->termListBuilder->getOperations($term)) {
        $form['terms'][$key]['operations'] = [
          '#type' => 'operations',
          '#links' => $operations,
        ];
      }

      if ($parent_fields) {
        $form['terms'][$key]['#attributes']['class'][] = 'draggable';
      }

      // Add classes that mark which terms belong to previous and next pages.
      if ($row_position < $back_step || $row_position >= $page_entries - $forward_step) {
        $form['terms'][$key]['#attributes']['class'][] = 'taxonomy-term-preview';
      }

      if ($row_position !== 0 && $row_position !== count($tree) - 1) {
        if ($row_position == $back_step - 1 || $row_position == $page_entries - $forward_step - 1) {
          $form['terms'][$key]['#attributes']['class'][] = 'taxonomy-term-divider-top';
        }
        elseif ($row_position == $back_step || $row_position == $page_entries - $forward_step) {
          $form['terms'][$key]['#attributes']['class'][] = 'taxonomy-term-divider-bottom';
        }
      }

      // Add an error class if this row contains a form error.
      foreach ($errors as $error_key => $error) {
        if (strpos($error_key, $key) === 0) {
          $form['terms'][$key]['#attributes']['class'][] = 'error';
        }
      }
      $row_position++;
    }

    $this->renderer->addCacheableDependency($form['terms'], $update_tree_access);
    if ($update_tree_access->isAllowed()) {
      if ($parent_fields) {
        $form['terms']['#tabledrag'][] = [
          'action' => 'match',
          'relationship' => 'parent',
          'group' => 'term-parent',
          'subgroup' => 'term-parent',
          'source' => 'term-id',
          'hidden' => FALSE,
        ];
        $form['terms']['#tabledrag'][] = [
          'action' => 'depth',
          'relationship' => 'group',
          'group' => 'term-depth',
          'hidden' => FALSE,
        ];
        $form['terms']['#attached']['library'][] = 'taxonomy/drupal.taxonomy';
        $form['terms']['#attached']['drupalSettings']['taxonomy'] = [
          'backStep' => $back_step,
          'forwardStep' => $forward_step,
        ];
      }
      $form['terms']['#tabledrag'][] = [
        'action' => 'order',
        'relationship' => 'sibling',
        'group' => 'term-weight',
      ];
    }

    if ($update_tree_access->isAllowed() && count($tree) > 1) {
      $form['actions'] = ['#type' => 'actions', '#tree' => FALSE];
      $form['actions']['submit'] = [
        '#type' => 'submit',
        '#value' => $this->t('Save'),
        '#button_type' => 'primary',
      ];
    }

    $form['pager_pager'] = ['#type' => 'pager'];
    return $form;
  }

  /**
   * Converts stubs info fully loaded Term entities.
   *
   * @param \stdClass[] $stubs
   *   The stubs used to determine which full entities to load.
   *
   * @see TermStorageInterface::loadTree()
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   The loaded terms.
   */
  private function loadTermsByStubs(array $stubs) {
    // Load the actual terms for this page so we can display them.
    $termKeyMap = [];
    foreach ($stubs as $itemKey => $stub) {
      $termKeyMap[$stub->tid] = $itemKey;
    }

    $terms = $this->storageController->loadMultiple(array_keys($termKeyMap));
    foreach ($terms as $tid => $term) {
      $stub = $stubs[$termKeyMap[$tid]];
      // Normally these properties are set by TermStorageInterface::loadTree,
      // but since we're manually loading these terms we have to pass them on.
      $term->depth = $stub->depth;
      $term->parents = $stub->parents;
      $term->setWeight($stub->weight);
      $stubs[$termKeyMap[$tid]] = $term;
    }
    return $stubs;
  }

  /**
   * Form submission handler.
   *
   * Rather than using a textfield or weight field, this form depends entirely
   * upon the order of form elements on the page to determine new weights.
   *
   * Because there might be hundreds or thousands of taxonomy terms that need to
   * be ordered, terms are weighted from 0 to the number of terms in the
   * vocabulary, rather than the standard -10 to 10 scale. Numbers are sorted
   * lowest to highest, but are not necessarily sequential. Numbers may be
   * skipped when a term has children so that reordering is minimal when a child
   * is added or removed from a term.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Sort term order based on weight.
    uasort($form_state->getValue('terms'), [
      'Drupal\Component\Utility\SortArray',
      'sortByWeightElement',
    ]);

    $changed_terms = [];

    $page = $this->getRequest()->query->get('page') ?: 0;
    // Number of terms per page.
    $page_increment = $this->config('taxonomy.settings')
      ->get('terms_per_page_admin');


    // Renumber the current page weights and assign any new parents.
    $level_weights = [];
    $weight = $page * $page_increment;
    foreach ($form_state->getValue('terms') as $tid => $values) {
      if (isset($form['terms'][$tid]['#term'])) {
        $term = $form['terms'][$tid]['#term'];
        // Give terms at the root level a weight in sequence with terms on previous pages.
        if ($values['term']['parent'] == 0 && $term->getWeight() != $weight) {
          $term->setWeight($weight);
          $changed_terms[$term->id()] = $term;
        }
        // Terms not at the root level can safely start from 0 because they're all on this page.
        elseif ($values['term']['parent'] > 0) {
          $level_weights[$values['term']['parent']] = isset($level_weights[$values['term']['parent']]) ? $level_weights[$values['term']['parent']] + 1 : 0;
          if ($level_weights[$values['term']['parent']] != $term->getWeight()) {
            $term->setWeight($level_weights[$values['term']['parent']]);
            $changed_terms[$term->id()] = $term;
          }
        }

        $weight++;
      }
    }

    if (!empty($changed_terms)) {
      $pending_term_ids = $this->storageController->getTermIdsWithPendingRevisions();

      // Force a form rebuild if any of the changed terms has a pending
      // revision.
      if (array_intersect_key(array_flip($pending_term_ids), $changed_terms)) {
        $this->messenger()
          ->addError($this->t('The terms with updated parents have been modified by another user, the changes could not be saved.'));
        $form_state->setRebuild();

        return;
      }

      // Save all updated terms.
      foreach ($changed_terms as $term) {
        $term->save();
      }

      $this->messenger()
        ->addStatus($this->t('The configuration options have been saved.'));
    }
  }


}
