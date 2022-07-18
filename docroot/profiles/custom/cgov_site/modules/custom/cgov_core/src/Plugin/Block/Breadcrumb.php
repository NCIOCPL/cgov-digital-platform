<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Url;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Utility\Token;
use Drupal\Core\Render\Markup;

/**
 * Provides a 'Breadcrumb' block.
 *
 * @Block(
 *  id = "cgov_breadcrumb",
 *  admin_label = @Translation("Cgov Breadcrumb"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class Breadcrumb extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * Drupal Token Service.
   *
   * @var \Drupal\Core\Utility\Token
   */
  protected $tokenSvc;

  /**
   * Constructs an Breadcrumb object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navigationManager
   *   Cgov navigation service.
   * @param \Drupal\Core\Utility\Token $tokenSvc
   *   Drupal token service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManager $navigationManager,
    Token $tokenSvc
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->navMgr = $navigationManager;
    $this->tokenSvc = $tokenSvc;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.cgov_navigation_manager'),
      $container->get('token')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    $shouldDisplay = $this->navMgr->getCurrentPathIsInNavigationTree();
    if ($shouldDisplay) {
      return AccessResult::allowed();
    }
    return AccessResult::forbidden();
  }

  /**
   * Get breadcrumbs to render.
   *
   * Using navigation service, return
   * array of breadcrumbs to render.
   *
   * @return array
   *   Array of breadcrumbs.
   */
  public function getBreadcrumbs() {
    $config = $config = $this->getConfiguration();

    $navRoot = $this->navMgr->getNavRoot('field_breadcrumb_root');
    // We don't want to render anything if there is the current
    // request is not associated with the Site Section vocabulary tree.
    if ($navRoot) {
      $breadcrumbs = [$navRoot];
      $child = $navRoot;
      // We only want to go as far as one level below the current site
      // section.
      while ($child && !$child->isCurrentSiteSection()) {
        $children = $child->getChildren();
        // Filter results to only the child in the current path.
        // (Should always be just one).
        // We don't use array_filter because it maintains
        // original keys.
        $filteredChildren = [];
        foreach ($children as $child) {
          if ($child->getIsInCurrentPath() === TRUE) {
            $filteredChildren[] = $child;
          }
        }

        $child = NULL;
        // We should only ever find one child in the active path.
        // Otherwise this is NULL and the while loop exits.
        if (count($filteredChildren)) {
          $child = $filteredChildren[0];
          // Requirement: Do not include breadcrumb for active page if it is
          // the landing page of the current site section.
          if ($child && !$child->isCurrentSiteSectionLandingPage()) {
            $breadcrumbs[] = $child;
          }
        }
      }
      $formattedBreadcrumbs = array_map(function ($breadcrumb) {
        return [
          'href' => $breadcrumb->getHref(),
          'label' => $breadcrumb->getLabel(),
        ];
      }, $breadcrumbs);

      // Requirement: If the only breadcrumb is the root, we don't want to
      // render any breadcrumbs, unless show home alone is set.
      if (!empty($config['show_home_alone']) && $config['show_home_alone'] === 'show') {
        $show_home_alone = TRUE;
      }
      else {
        $show_home_alone = FALSE;
      }

      if (count($formattedBreadcrumbs) === 1 && $show_home_alone === FALSE) {

        $homeUrl = Url::fromRoute('<front>')->toString();
        $firstCrumbUrl = $this->cleanUrl($formattedBreadcrumbs[0]['href']);

        if ($firstCrumbUrl === $homeUrl) {
          $formattedBreadcrumbs = [];
        }
      }
      return $formattedBreadcrumbs;
    }
  }

  /**
   * Helper function to clean a url.
   *
   * @param string $url
   *   The URL string to clean.
   *
   * @return string
   *   The cleaned url, or '' if the string was null.
   */
  private function cleanUrl($url) {
    if (!$url) {
      return '';
    }
    // In some cases the alias will be /-0 usually in the case of the
    // homepage because of how pathauto, aliases and <front> works.
    // (Front already is /, so when generating an alias, / is already
    // taken.)
    $cleanUrl = preg_replace('/-\d+$/', '', $url);

    // The URLs could end in slashes so we want to remove the trailing
    // slashes, but only if it is not '/'.
    if (
      $cleanUrl !== '' &&
      $cleanUrl !== '/' &&
      substr($cleanUrl, -(strlen($cleanUrl))) === '/'
    ) {
      $cleanUrl = substr($cleanUrl, 0, strlen($cleanUrl) - 1);
    }

    return $cleanUrl;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $breadcrumbs = $this->getBreadcrumbs();
    $currentPageTitle = $this->tokenSvc->replace("[current-page:title]", [], []);
    $build = [
      '#type' => 'block',
      'breadcrumbs' => $breadcrumbs,
      'currentPageTitle' => Markup::create($currentPageTitle),
    ];
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return 0;
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    $config = $this->getConfiguration();

    $form['show_home_alone'] = [
      '#type' => 'select',
      '#title' => $this->t('Root Site Section Display'),
      '#options' => [
        'hide' => $this->t('Hide when only breadcrumb item'),
        'show' => $this->t('Show when only breadcrumb item'),
      ],
      '#description' => $this->t('Select whether the root site section (e.g., Home or Página Principal) should display when it is the only breadcrumb.'),
      '#default_value' => isset($config['show_home_alone']) ? $config['show_home_alone'] : 'hide',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $values = $form_state->getValues();
    $this->configuration['show_home_alone'] = $values['show_home_alone'];
  }

}
