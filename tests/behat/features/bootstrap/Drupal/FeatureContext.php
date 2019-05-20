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

  /**
   * After every step in a @javascript scenario, we want to wait for AJAX.
   *
   * @AfterStep
   */
  public function afterStepWaitForJavascript($event) {
    if (isset($this->javascript) && $this->javascript) {
      $text = $event->getStep()->getText();
      if (preg_match('/(follow|press|click|submit|viewing|visit|reload|attach)/i', $text)) {
        $this->iWaitForAjax();
        // For whatever reason, the above isn't very accurate inside iframes.
        if (!empty($this->iframe)) {
          sleep(3);
        }
      }
    }
  }

  /**
   * Wait for AJAX to finish.
   *
   * @Given I wait for AJAX
   */
  public function iWaitForAjax() {
    $this->getSession()->wait(10000, 'typeof jQuery !== "undefined" && jQuery.active === 0');
  }

  /**
   * Get the wysiwyg instance variable to use in Javascript.
   *
   * @param string
   *   The instanceId used by the WYSIWYG module to identify the instance.
   *
   * @throws Exception
   *   Throws an exception if the editor does not exist.
   *
   * @return string
   *   A Javascript expression representing the WYSIWYG instance.
   */
  protected function getWysiwygInstance($instanceId) {
    $instance = "CKEDITOR.instances['$instanceId']";
    if (!$this->getSession()->evaluateScript("return !!$instance")) {
      throw new \Exception(sprintf('The editor "%s" was not found on the page %s', $instanceId, $this->getSession()->getCurrentUrl()));
    }
    return $instance;
  }

  /**
   * @When /^I fill in the "([^"]*)" WYSIWYG editor with "([^"]*)"$/
   */
  public function iFillInTheWysiwygEditor($locator, $text) {
    $field = $this->getSession()->getPage()->findField($locator);
    if (null === $field) {
      throw new ElementNotFoundException($this->getDriver(), 'form field', 'id|name|label|value|placeholder', $locator);
    }
    $id = $field->getAttribute('id');
    $instance = $this->getWysiwygInstance($id);
    $this->getSession()->executeScript("$instance.setData(\"$text\");");
  }

}
