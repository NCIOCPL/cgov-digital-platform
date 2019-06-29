<?php

namespace Drupal\cgov_redirect_manager\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\File\FileSystem;

/**
 * Class MigrateForm.
 *
 * @package Drupal\custom_migrate\Form
 */
class RedirectImport extends FormBase {

  protected $filesystem;

  /**
   * Uploaded file entity.
   *
   * @var \Drupal\file\Entity\File
   */
  protected $file;

  /**
   * Drupal\Core\Queue\QueueFactory definition.
   *
   * @var \Drupal\Core\Queue\QueueFactory
   */
  protected $queue;

  /**
   * Constructs a new RedirectImport form object.
   */
  public function __construct(QueueFactory $queue, FileSystem $fileStorage) {
    $this->queue = $queue;
    $this->filesystem = $fileStorage;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('queue'),
      $container->get('file_system')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'redirect_import_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['file'] = [
      '#type' => 'file',
      '#upload_location' => 'private://redirect-import',
      '#title' => $this->t('CSV Redirect File'),
      '#description' => $this->t('Please upload a CSV redirect file.'),
      '#upload_validators' => [
        'file_validate_extensions' => ['csv'],
      ],
      '#prefix' => '<p id="redirect-import">Upload a new CSV file.</p>',
      '#suffix' => '<p>CSV file should be formatted:<ul>
        <li>Two columns: From URL, To URL</li>
        <li>From URLs should be relative</li>
        <li>To URLs can be relative or absolute</li>
        </ul></p>',
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Upload Redirects'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $uploadDirectory = $this->filesystem
      ->realpath($form['file']['#upload_location']);

    if (!is_dir($uploadDirectory)) {
      $this->filesystem
        ->mkdir($form['file']['#upload_location']);
    }

    $this->file = file_save_upload(
      'file',
      $form['file']['#upload_validators'],
      $form['file']['#upload_location'],
      0,
      TRUE
    );

    if (!$this->file) {
      $form_state->setErrorByName('file', $this->t('Please select a csv file of redirects to import.'));
    }

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    if (empty($this->file)) {
      $form_state->setErrorByName('file', $this->t('No file was found.'));
      return;
    }
    drupal_set_message($this->t("Successfully uploaded redirect file."));

    ini_set('auto_detect_line_endings', TRUE);
    // Don't do anything if no valid file.
    if (!isset($this->file)) {
      drupal_set_message($this->t('No valid file was found. No redirects will be imported.'), 'warning');
      return;
    }

    $queue = $this->queue->get('cgov_redirect_manager_queue_worker');
    $queue->createItem(['type' => 'csv_import', 'file' => $this->file]);

  }

}
