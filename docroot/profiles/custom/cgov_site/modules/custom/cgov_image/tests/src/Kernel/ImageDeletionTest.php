<?php

namespace Drupal\Tests\cgov_image\Kernel;

use Drupal\KernelTests\KernelTestBase;
use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\Tests\user\Traits\UserCreationTrait;
use Drupal\media\Entity\MediaType;
use Drupal\media\Entity\Media;
use Drupal\Tests\cgov_core\Traits;
use Drupal\file\Entity\File;
use org\bovigo\vfs\vfsStream;

/**
 * Tests the prevent image deletion for image manager role.
 *
 * @group cgov
 * @group cgov_image
 */
class ImageDeletionTest extends KernelTestBase {
  use Traits\CGovWorkflowAttachmentTrait;
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
    'user',
    'cgov_image',
    'media',
    'image',
    'file',
    'field',
  ];

  /**
   * Use our own profile instead of one from the standard distribution.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * Users with role permissions to be tested.
   *
   * @var array
   */
  protected $users = [];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setup();
    // These are special and cannot be installed as a dependency
    // for this module. So we have to install their bits separately.
    $this->installEntitySchema('user');
    $this->installSchema('system', ['sequences']);
    $this->installEntitySchema('user');
    $this->installEntitySchema('file');
    $this->installSchema('file', 'file_usage');
    $this->installEntitySchema('media');
    $this->installConfig(['user', 'field', 'system', 'image', 'file', 'media']);

    // Set media permissions.
    $perms = [
      'view media',
      'create media',
      'update media',
      'update any media',
      'delete any media',
      'delete media',
    ];

    // Create users and assign roles.
    $this->users['admin'] = $this->createUser([], NULL, TRUE);
    $this->users['image_manager'] = $this->createUser($perms);
    $this->users['image_manager']->addRole('image_manager');
    $this->users['site_admin'] = $this->createUser($perms);
    $this->users['site_admin']->addRole('site_admin');
  }

  /**
   * Test control of when an image manager can delete content images.
   */
  public function testDeletion() {

    // Create Cgov image media type.
    $image_media_type = MediaType::create([
      'id' => 'cgov_image',
      'name' => 'Cgov image',
      'source' => 'image',
    ]);
    $image_media_type->save();
    $source_field = $image_media_type->getSource()->createSourceField($image_media_type);
    $source_field->getFieldStorageDefinition()->save();
    $source_field->save();
    $image_media_type->set('source_configuration', [
      'source_field' => $source_field->getName(),
    ])->save();

    // Create Cgov contextual image media type.
    $contextual_media_type = MediaType::create([
      'id' => 'cgov_contextual_image',
      'name' => 'Cgov contextual image',
      'source' => 'image',
    ]);
    $contextual_media_type->save();
    $source_field = $contextual_media_type->getSource()->createSourceField($contextual_media_type);
    $source_field->getFieldStorageDefinition()->save();
    $source_field->save();
    $contextual_media_type->set('source_configuration', [
      'source_field' => $source_field->getName(),
    ])->save();

    $entityTypeManager = $this->container->get('entity_type.manager');
    $accessHandler = $entityTypeManager->getAccessControlHandler('media');

    $this->setCurrentUser($this->users['admin']);

    // Set sample file name.
    $filename = 'test.png';
    vfsStream::setup('drupal_root');
    vfsStream::create([
      'sites' => [
        'default' => [
          'files' => [
            $filename => str_repeat('a', 3000),
          ],
        ],
      ],
    ]);

    $file = File::create([
      'uri' => 'vfs://drupal_root/sites/default/files/' . $filename,
      'uid' => $this->users['admin']->id(),
    ]);
    $file->setPermanent();
    $file->save();

    // Create published Cgov media image.
    $cgov_image_media_published = Media::create([
      'name' => 'Cgov media image',
      'bundle' => 'cgov_image',
      $source_field->getName() => [
        'target_id' => $file->id(),
      ],
      'status' => TRUE,
    ]);
    $cgov_image_media_published->save();
    $this->assertFalse($accessHandler->access($cgov_image_media_published, 'delete', $this->users['image_manager']));
    $this->assertTrue($accessHandler->access($cgov_image_media_published, 'delete', $this->users['site_admin']));

    // Create unpublished Cgov media image.
    $cgov_image_media_unpublished = Media::create([
      'name' => 'Cgov media image',
      'bundle' => 'cgov_image',
      $source_field->getName() => [
        'target_id' => $file->id(),
      ],
      'status' => FALSE,
    ]);
    $cgov_image_media_unpublished->save();
    $this->assertTrue($accessHandler->access($cgov_image_media_unpublished, 'delete', $this->users['image_manager']));
    $this->assertTrue($accessHandler->access($cgov_image_media_unpublished, 'delete', $this->users['site_admin']));

    // Create published Cgov contextual media image.
    $cgov_contextual_media_published = Media::create([
      'name' => 'Cgov contextual media image',
      'bundle' => 'cgov_contextual_image',
      $source_field->getName() => [
        'target_id' => $file->id(),
      ],
      'status' => TRUE,
    ]);
    $cgov_contextual_media_published->save();
    $this->assertFalse($accessHandler->access($cgov_contextual_media_published, 'delete', $this->users['image_manager']));
    $this->assertTrue($accessHandler->access($cgov_contextual_media_published, 'delete', $this->users['site_admin']));

    // Create unpublished Cgov contextual media image.
    $cgov_contextual_media_unpublished = Media::create([
      'name' => 'Cgov contextual media image',
      'bundle' => 'cgov_contextual_image',
      $source_field->getName() => [
        'target_id' => $file->id(),
      ],
      'status' => FALSE,
    ]);
    $cgov_contextual_media_unpublished->save();
    $this->assertTrue($accessHandler->access($cgov_contextual_media_unpublished, 'delete', $this->users['image_manager']));
    $this->assertTrue($accessHandler->access($cgov_contextual_media_unpublished, 'delete', $this->users['site_admin']));
  }

}
