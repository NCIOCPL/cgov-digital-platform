<?php

/**
 * @file
 * Set up fast_404 handling.
 */

$config['system.performance']['fast_404']['enabled'] = TRUE;
$config['system.performance']['fast_404']['paths'] = '/.*/';
$config['system.performance']['fast_404']['exclude_paths'] = '/\/ErrorPages\/.*/i';
$config['system.performance']['fast_404']['html'] = '<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>Not Found</h1><p>The requested URL "@path" was not found on this server.</p></body></html>';
