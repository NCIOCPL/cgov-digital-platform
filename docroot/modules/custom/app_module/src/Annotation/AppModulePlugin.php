<?php

namespace Drupal\app_module\Annotation;

use Drupal\Component\Annotation\AnnotationInterface;
use Drupal\Component\Annotation\Plugin;

/**
 * Defines a Plugin annotation object for AppModule plugins.
 *
 * @see \Drupal\app_module\Plugin\app_module\AppModulePluginBase
 *
 * @Annotation
 */
class AppModulePlugin extends Plugin implements AnnotationInterface {

  /**
   * The plugin ID.
   *
   * @var string
   */
  public $id;

  /**
   * The plugin label used in the AppModule entity forms.
   *
   * @var \Drupal\Core\Annotation\Translation
   *
   * @ingroup plugin_translatable
   */
  public $label = '';

}
