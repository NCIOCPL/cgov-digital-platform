<?php

/**
 * @file
 * Delete this and move code into install hook.
 *
 * (after resolving issues with wrong theme/region placement)
 */

use Drupal\block\Entity\Block;
use Drupal\block_content\Entity\BlockContent;

// Create Contact Us block for Press Releases.
$block_theme = \Drupal::config('system.theme')->get('default');
$block_region = 'content';
print "ADD BLOCK TO THEME $block_theme BLOCK $block_region\n";
$block_label = 'Contact Us - Press Releases';
$block_html = <<<EOMarkup
    <div class="media-contact columns large-4 right">
       <div class="row collapse-edges">
         <div class="media-contact-info">
            <strong>Contact:</strong>
         </div>
         <div class="media-contact-info">
           <a href="mailto:ncipressofficers@mail.nih.gov">NCI Press Office</a>
           <p>240-760-6600</p>
         </div>
       </div>
    </div>
EOMarkup;

// Create block content.
$block_content = BlockContent::create([
  'type' => 'raw_html_block',
  'info' => $block_label,
  'body' => ['value' => $block_html, 'format' => 'full_html'],
]);
$block_content->save();

// Assign block to Region.
$data = [
  'id' => 'contact_us__press_release',
  'plugin' => 'block_content:' . $block_content->uuid(),
  'region' => $block_region,
  'provider' => 'block_content',
  'weight' => -100,
  'theme' => $block_theme,
  'visibility' => [
    'node_type' =>
      [
        'id' => 'node_type',
        'bundles' => ['cgov_press_release' => 'cgov_press_release'],
        'context_mapping' =>
          [
            'node' => '@node.node_route_context:node',
          ],
      ],
  ],
  'settings' => [
    'label' => $block_label,
    'label_display' => '0',
  ],
];

print "CREATING BLOCK: ";
print_r($data);
$block = Block::create($data);
$block->save();

print "BLOCK ADDED\n";
