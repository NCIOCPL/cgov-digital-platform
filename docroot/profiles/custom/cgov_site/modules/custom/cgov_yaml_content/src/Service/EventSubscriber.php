<?php

namespace Drupal\cgov_yaml_content\Service;

use Drupal\yaml_content\Event\YamlContentEvents;
use Drupal\yaml_content\Event\EntityPostSaveEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\block\Entity\Block;
use Drupal\Core\Theme\ThemeManagerInterface;

/**
 * Handle yaml_content custom events.
 */
class EventSubscriber implements EventSubscriberInterface {

  protected $themeManager;

  /**
   * Create new Event Subscriber class.
   *
   * @param \Drupal\Core\Theme\ThemeManagerInterface $themeManager
   *   Theme Manager.
   */
  public function __construct(ThemeManagerInterface $themeManager) {
    $this->themeManager = $themeManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events = [];
    $events[YamlContentEvents::ENTITY_POST_SAVE][] = ['addToRegion'];

    return $events;
  }

  /**
   * Generate random alphanumeric string.
   *
   * @param int $length
   *   A number.
   */
  private static function generateRandomString(int $length) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
      $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
  }

  /**
   * Add a raw_html_block to a default region.
   *
   * @param \Drupal\yaml_content\Event\EntityPostSaveEvent $event
   *   The triggered event when an entity has been saved.
   */
  public function addToRegion(EntityPostSaveEvent $event) {
    $savedEntity = $event->getEntity();
    $entityType = $savedEntity->bundle();
    $isRawHTMLBlock = $entityType === 'raw_html_block';
    if ($isRawHTMLBlock) {
      // If no default region is set on the custom block, there's
      // nothing to do here.
      $savedEntityRegion = $savedEntity->get('field_default_region')->get(0)->value;
      if (!$savedEntityRegion) {
        return;
      }

      $theme = $this->themeManager->getActiveTheme();
      // We only want to create a block when a valid default region
      // is specified.
      $regions = $theme->getRegions();
      $isValidRegion = in_array($savedEntityRegion, $regions);
      if (!$isValidRegion) {
        return;
      }

      // We need to create a block top attach the block_content to
      // in a given theme region.
      $blockSettings = [
        'id' => self::generateRandomString(10),
        'plugin' => 'block_content:' . $savedEntity->uuid(),
        'provider' => 'block_content',
        'region' => $savedEntityRegion,
        'theme' => $theme->getName(),
        'weight' => 0,
        'status' => TRUE,
      ];
      printf('Adding default block to ' . $savedEntityRegion . ' region.');
      $block = Block::create($blockSettings);
      $block->save();
    };
  }

}
