<?php

namespace Drupal\cgov_js_app_module\Render;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Component\Render\MarkupTrait;

/**
 * Defines an object that passes safe strings through the render system.
 *
 * You should not use Markup::Create to get your own string. Also it is
 * internal. However we do need to get a script block injected in the head
 * for our app module. So here goes.
 * See https://www.drupal.org/project/drupal/issues/2752283#comment-12624340
 *
 * @see \Drupal\Core\Template\TwigExtension::escapeFilter
 * @see \Twig_Markup
 */
final class JsAppModuleScriptMarkup implements MarkupInterface, \Countable {
  use MarkupTrait;

}
