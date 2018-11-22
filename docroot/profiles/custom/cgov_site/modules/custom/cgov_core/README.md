## Purpose
This module defines all the common fields, content types, roles, etc needed by any web site in the CGov Digital Platform.

## Developing
TBD

## Testing
**NOTE:** General information about running tests and project structure can be found in the root [TESTING.md](../../../../../../../TESTING.md) file. Please refer to that before reading further.

### Unit Tests

### Kernel Tests
Kernel Tests run against a working Drupal instance through API calls. This is a great way to ensure that configurations get loaded upon module enable, as well as other back end things.

#### Field Storage Tests
These Kernel tests make sure that field storage items are configured and attached to content types correctly. Most of testing work is repetative, so we have created a base class for FieldStorage tests. (This should probably get promoted higher up the tree at some point)

##### Creating a Field Storage Test

Field Storage Tests are placed in the `FieldStorage` directory under the `cgov_core/tests/src/Kernel` directory. The tests classes should be derived from the `CGovFieldStorageTestBase` class which takes care of most of the work.

Example Code (see comments for descriptions)
```php
<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

/**
 * Tests My Field field storage.
 *
 * @group cgov_core
 */
class NodeMyFieldFieldStorageTest extends CGovFieldStorageTestBase {

  /**
   * Modules to enable.
   *
   * This should be the complete list of modules to make the field work.
   * It should be noted that text & filter are required by node and its
   * body field. The example below tests a simple text (plain) field. For
   * a DateTime or something more complicated, you will need to add the
   * additional required modules.
   *
   * @var array
   */
  public static $modules = [
    'user', 'system', 'field', 'node', 'text', 'filter', 'cgov_core',
  ];

  /**
   * Tests the Browser Title field.
   *
   * Your test methods *must* start with test.
   */
  public function testMyField() {
    /*
     * This performs a series of common tests for a Text (Plain) field.
     *
     * See PHP doc comments for more information on the inputs/outputs.
     *
     * This will:
     *   - Check the config exists.
     *   - Check the field can be attached to a node.
     *   - Checks that when the node is removed the field still exists.
     *   - Checks that when the module is disabled, the field is removed.
     *
     * Feel free to add more baseTest<Field Type>Field methods as needed.
     */
    $this->baseTestPlainTextField('field_my_field', 'My Field');
  }

}
```


### Functional Tests (Coming Soon)
