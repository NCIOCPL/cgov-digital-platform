

Closes `<YOUR TICKET NUMBER HERE>`


### Reviewer Questions to Ask:
#### Security
- [ ] Are we introducing XSS or other security issues?
- [ ] Would the code actually work differently if the Drupal protections kick in? (e.g. special character encoding)

#### Performance
- [ ] Do the changes impact caching in any way? 
- [ ] Was the code tested to ensure caching is not an issue?
- [ ] Are there front-end items that could affect [page speed](https://developers.google.com/speed)/[lighthouse](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) scores?
  * e.g First Contentful Paint, Cumulative Layout Shift
- [ ] Are there changes that could keep things cached forever with no way to clear?

#### Accessibility
- [ ] Are the changes accessible?
- [ ] Was the code tested for accessibility? (e.g., if JS and user elements are the correct ARIA attributes applied? 
- [ ] Are we ensuring there is either alt text or marking elements as hidden to screen readers if no alt test? (SHOULD the element even be hidden without alt text...)

#### Maintainability
- [ ] Is the code readable?
- [ ] Do the changes align with other patterns in the repository?
  * make sure that items are placed in similar folders to similar solutions
  * make sure that Drupal methods (e.g., hook usage, configs) matches similar solution 
- [ ] Are the changes the best Drupaly way?
  * e.g., theme preprocessing is a last resort - there is probably a hook for what you want to do... 
- [ ] Are the changes/configs in the best, and most correct correct, cgov_site module?
- [ ] Are there circular dependencies being added in the configs?
- [ ] If one were to disable this module to turn off this feature are there configs in other modules referencing this?
- [ ] Are we incorrectly referencing legacy css/js from themes/cgov in this new ncids-ified page/component? (The answer should be no.)

#### Yaml
- [ ] Is the YAML properly formed HTML?
   * e.g., no duplicate IDs, well formed HTML with correct closing tags 
- [ ] Are the fields in the YAML correct for that content type?
- [ ] Is there YAML that SHOULD have been updated or deleted but was not?
- [ ] Is the YAML editable in the content editing interface and can be saved without error?
- [ ] Is the YAML accessible? 

#### Deployability
- [ ] Are there update or post-update hooks? **These need to be tested on ACSF.**

### Merger Checks
- [ ] Is there a Copilot review?
   - [ ] Have all comments been addressed in some form?
- [ ] Is there an approval from QA?
- [ ] Is there an approval from Product?
- [ ] Is there an approval from Dev?
- [ ] Were there any comments about issues made AFTER the approvals? Does it need re-review?
- [ ] Were there major changes in the base branch since all the approvals to require re-review?
