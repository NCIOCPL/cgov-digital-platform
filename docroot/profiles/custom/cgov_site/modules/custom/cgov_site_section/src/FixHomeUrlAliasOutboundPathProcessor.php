<?php

namespace Drupal\cgov_site_section;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Symfony\Component\HttpFoundation\Request;

/**
 * Outbound path processor to fix home aliases that are generated as /-0.
 *
 * This needs to fire BEFORE the alias processor.
 *
 * PathAuto is generating our home alias as /-0, because / is special. This
 * processor will attempt to rewrite that to '/'. Since we know the entity
 * with an alias of /-0 should also be set as a front page based on our code,
 * this should not be an issue rewriting the alias outbound, but ignoring
 * inbound handling. (As Drupal will take care of mapping '/' to what is set
 * for the front page)
 *
 * One IMPORTANT thing to note: All URLs pass through these gates. Therefore
 * we should only replace if we are 100% sure it is the front-page. Even if
 * the URL is /-0, that does not mean it is set to the front page. We don't
 * want to break working pages and we don't want it to blowup if an assumption
 * is not met.
 */
class FixHomeUrlAliasOutboundPathProcessor implements OutboundPathProcessorInterface {

  /**
   * Constructs a FixHomeUrlAliasOutboundPathProcessor object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config
   *   A config factory for retrieving the site front page configuration.
   */
  public function __construct(ConfigFactoryInterface $config) {
    $this->config = $config;
  }

  /**
   * {@inheritdoc}
   */
  public function processOutbound($path, &$options = [], Request $request = NULL, BubbleableMetadata $bubbleable_metadata = NULL) {
    // Get the route for the front page.
    $front_path = $this->config->get('system.site')->get('page.front');

    // There is no front page, so bail.
    if (empty($front_path)) {
      return $path;
    }

    if ($front_path === $path) {
      return '/';
    }
    else {
      return $path;
    }
  }

}
