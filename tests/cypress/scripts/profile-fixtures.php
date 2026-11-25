<?php

/**
 * @file
 * Fixtures for Cypress profile tests. Run through drush php:script.
 */

use Drupal\block_content\Entity\BlockContent;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\user\Entity\Role;
use Drupal\user\Entity\User;
use Symfony\Component\Yaml\Yaml;

if (count($extra) !== 2) {
  throw new InvalidArgumentException('Usage: profile-fixtures.php -- operation token');
}
[$operation, $token] = $extra;
if (!preg_match('/^cyprof_[a-z0-9_]{8,30}$/D', $token)) {
  throw new InvalidArgumentException('A Cypress profile fixture token is required.');
}

$manager = \Drupal::entityTypeManager();
$result = [];
$snapshot = sys_get_temp_dir() . '/' . $token . '-glossary.json';

switch ($operation) {
  case 'account-admin':
  case 'account-importer':
  case 'account-reader':
    $kind = substr($operation, strlen('account-'));
    $name = $token . '_' . $kind;
    if (user_load_by_name($name)) {
      throw new RuntimeException('Fixture account already exists: ' . $name);
    }
    $roles = [];
    if ($kind === 'admin') {
      $role = Role::create([
        'id' => $name,
        'label' => $name,
        'permissions' => [
          'access administration pages',
          'access toolbar',
          'view the administration theme',
          'administer users',
          'administer taxonomy',
          'access taxonomy overview',
          'access cgov_site_section_browser entity browser pages',
          'administer redirects',
          'configure saml',
          'delete authmap',
        ],
      ]);
      $role->save();
      $roles[] = $role->id();
    }
    elseif ($kind === 'importer') {
      $roles[] = 'pdq_importer';
    }
    $account = User::create([
      'name' => $name,
      'mail' => $name . '@example.com',
      'pass' => 'password123',
      'status' => 1,
      'roles' => $roles,
    ]);
    $account->save();
    $result = ['name' => $name, 'uid' => $account->id()];
    break;

  case 'cleanup-accounts':
    foreach (['admin', 'importer', 'reader', 'saml'] as $kind) {
      $account = user_load_by_name($token . '_' . $kind);
      if ($account) {
        $account->delete();
      }
    }
    $role = Role::load($token . '_admin');
    if ($role) {
      $role->delete();
    }
    break;

  case 'navigation':
    foreach (['published' => 1, 'unpublished' => 0] as $label => $status) {
      $node = Node::create([
        'type' => 'cgov_article',
        'title' => $token . ' ' . $label,
        'field_browser_title' => $token . ' ' . $label,
        'uid' => 1,
        'status' => $status,
        'moderation_state' => $status ? 'published' : 'draft',
      ]);
      $node->save();
      $result[$label] = $node->id();
    }
    $module_path = \Drupal::service('extension.list.module')->getPath('cgov_site_section');
    $max_id = (int) $manager->getStorage('block_content')->getAggregateQuery()->accessCheck(FALSE)
      ->aggregate('id', 'max')->execute()[0]['id_max'];
    $block = BlockContent::create([
      'id' => $max_id + mt_rand(1000, 1000000),
      'type' => 'ncids_mega_menu_content',
      'info' => $token . ' megamenu',
      'status' => 1,
      'moderation_state' => 'published',
      'field_yaml_content' => ['value' => Yaml::parseFile($module_path . '/tests/JsonDataFieldTestData.yml')],
    ]);
    $block->enforceIsNew(TRUE);
    $block->save();
    $terms = [
      'published' => ['field_landing_page' => $result['published'], 'field_main_nav_root' => 1, 'field_section_nav_root' => 1],
      'unpublished' => ['field_landing_page' => $result['unpublished'], 'field_main_nav_root' => 1, 'field_section_nav_root' => 1],
      'nonroot' => ['field_landing_page' => $result['unpublished'], 'field_main_nav_root' => 0, 'field_section_nav_root' => 0],
      'megamenu' => ['field_ncids_mega_menu_contents' => $block->id()],
      'empty' => [],
    ];
    foreach ($terms as $label => $fields) {
      $term = Term::create($fields + [
        'vid' => 'cgov_site_sections',
        'name' => $token . ' ' . $label,
        'field_pretty_url' => $token . '-' . $label,
        'status' => 1,
      ]);
      $term->save();
      $result[$label] = $term->id();
    }
    break;

  case 'cleanup-navigation':
    foreach (['taxonomy_term' => 'name', 'block_content' => 'info', 'node' => 'title'] as $type => $field) {
      $storage = $manager->getStorage($type);
      $ids = $storage->getQuery()->accessCheck(FALSE)
        ->condition($field, $token . ' ', 'STARTS_WITH')->execute();
      $storage->delete($storage->loadMultiple($ids));
    }
    break;

  case 'queue-count':
    $result = \Drupal::queue('cgov_redirect_manager_queue_worker')->numberOfItems();
    break;

  case 'cleanup-redirects':
    $storage = $manager->getStorage('redirect');
    $ids = $storage->getQuery()->accessCheck(FALSE)
      ->condition('redirect_source.path', $token . '/', 'STARTS_WITH')->execute();
    $storage->delete($storage->loadMultiple($ids));
    $files = $manager->getStorage('file')->loadByProperties(['filename' => $token . '.csv']);
    $database = \Drupal::database();
    // Remove only this upload if a failed scenario left its queue item behind.
    $items = $database->select('queue', 'q')->fields('q', ['item_id', 'data'])
      ->condition('name', 'cgov_redirect_manager_queue_worker')->execute();
    foreach ($items as $item) {
      if (str_contains($item->data, $token . '.csv')) {
        $database->delete('queue')->condition('item_id', $item->item_id)->execute();
      }
    }
    $manager->getStorage('file')->delete($files);
    break;

  case 'glossary-snapshot':
    $rows = \Drupal::database()->select('pdq_glossary', 'g')->fields('g')
      ->execute()->fetchAll(PDO::FETCH_ASSOC);
    $encoded = json_encode($rows, JSON_THROW_ON_ERROR);
    $handle = fopen($snapshot, 'x');
    if (!$handle) {
      throw new RuntimeException('Could not create glossary snapshot: ' . $snapshot);
    }
    try {
      if (!chmod($snapshot, 0600) || fwrite($handle, $encoded) !== strlen($encoded)) {
        throw new RuntimeException('Could not save glossary snapshot: ' . $snapshot);
      }
    }
    catch (Throwable $error) {
      unlink($snapshot);
      throw $error;
    }
    finally {
      fclose($handle);
    }
    $result = ['snapshot' => $snapshot];
    break;

  case 'glossary-restore':
    if (file_exists($snapshot)) {
      $rows = json_decode(file_get_contents($snapshot), TRUE, 512, JSON_THROW_ON_ERROR);
      $database = \Drupal::database();
      $transaction = $database->startTransaction();
      try {
        $database->delete('pdq_glossary')->execute();
        foreach ($rows as $row) {
          $database->insert('pdq_glossary')->fields($row)->execute();
        }
      }
      catch (Throwable $error) {
        $transaction->rollBack();
        throw $error;
      }
      unset($transaction);
      if (!unlink($snapshot)) {
        throw new RuntimeException('Could not remove glossary snapshot: ' . $snapshot);
      }
    }
    break;

  default:
    throw new InvalidArgumentException('Unknown fixture operation: ' . $operation);
}

echo json_encode($result, JSON_THROW_ON_ERROR) . PHP_EOL;
