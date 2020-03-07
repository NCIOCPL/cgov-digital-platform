<?php

namespace Drupal\cgov_mail\Plugin\Mail;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\Mail\MailFormatHelper;
use Drupal\Core\Mail\MailInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Site\Settings;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Defines a mail backend that captures sent messages to the logger.
 *
 * To enable, save the following variable in settings.php (or otherwise)
 *
 * @code
 * $config['system.mail']['interface']['default'] = 'cgov_mail_logger';
 * @endcode
 *
 * @Mail(
 *   id = "cgov_mail_logger",
 *   label = @Translation("Cancer.gov Mail logger"),
 *   description = @Translation("Does not send the message, but sends it to the
 *   logger. Used for lower tiers")
 * )
 */
class CgovMailLogger implements MailInterface, ContainerFactoryPluginInterface {

  /**
   * The logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Constructs a new LoggerMail object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Psr\Log\LoggerInterface $logger
   *   The logger.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, LoggerInterface $logger) {
    $this->logger = $logger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($configuration, $plugin_id, $plugin_definition, $container->get('logger.factory')
      ->get('mail'));
  }

  /**
   * {@inheritdoc}
   */
  public function format(array $message) {
    // Join the body array into one string.
    $message['body'] = implode("\n\n", $message['body']);

    // Convert any HTML to plain-text.
    $message['body'] = MailFormatHelper::htmlToText($message['body']);
    // Wrap the mail body for sending.
    $message['body'] = MailFormatHelper::wrapMail($message['body']);

    return $message;
  }

  /**
   * {@inheritdoc}
   */
  public function mail(array $message) {
    $this->logger->info('Mail sent to @to with subject %subject: <pre>@mail</pre>', [
      '@to' => $message['to'],
      '%subject' => $message['subject'],
      '@mail' => $this->formatMessage($message),
    ]);
    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  protected function formatMessage($message) {
    $mimeheaders = [];
    $message['headers']['To'] = $message['to'];
    foreach ($message['headers'] as $name => $value) {
      $mimeheaders[] = $name . ': ' . Unicode::mimeHeaderEncode($value);
    }
    $line_endings = Settings::get('mail_line_endings', PHP_EOL);
    $output = implode($line_endings, $mimeheaders) . $line_endings;

    // 'Subject:' is a mail header and should not be translated.
    $output .= 'Subject: ' . $message['subject'] . $line_endings;

    // Blank line to separate headers from body.
    $output .= $line_endings;
    $output .= preg_replace('@\\r?\\n@', $line_endings, $message['body']);
    return $output;
  }

}
