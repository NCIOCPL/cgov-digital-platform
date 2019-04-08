<?php

namespace Drupal;

use Drupal\DrupalExtension\Context\RawDrupalContext;
use Behat\Behat\Context\SnippetAcceptingContext;

/**
 * FeatureContext class defines custom step definitions for Behat.
 */
class FeatureContext extends RawDrupalContext implements SnippetAcceptingContext {

  /**
   * Every scenario gets its own context instance.
   *
   * You can also pass arbitrary arguments to the
   * context constructor through behat.yml.
   */
  public function __construct() {

  }


  /**
   * Enters a frame given an ID.
   *
   * @Then I enter the :arg1 frame
   */
  public function iEnterTheFrame($id)
  {
    $this->getSession()->getDriver()->switchToIFrame($id);
  }


  /**
   * Switches to the main window.
   *
   * @Then I switch to main window
   */
  public function iSwitchToMainWindow() {
    $this->getSession()->getDriver()->switchToIFrame(NULL);
  }


}
