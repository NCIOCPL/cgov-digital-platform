/*
This is a stop-gap measure until we can refactor the popups further.
At the moment popup_functions runs prior to other code in Common.js, allowing
it to overwrite several window functions that would ordinarily open new windows, instead
now rendering their contents as a modal popup. It also ignores the specified language and instead pulls that
off the page.

The reason for this stopgap is that we want to avoid instantiating more than one modal at a time and
a refactor is required to ensure the modals exist as a singleton service.

For now, for expediency's sake, we are going to simply identify all glossified links that have been generated in the newer
CKEditor glossifier and attach to them the popWindow function that popup_functions has already previously overwritten with the
same parameters it expects.

IMPORTANT: Because we don't want to apply this shim to all links, we can't use the default class="definition" since that
won't act as an adequate filter. And since we need to manually pass the params for this callback, we may as well do double duty
and identify links based on the paramstring data attribute. Since the current override version of popWindow only reads
off the id anyway, we really can just attach that as a data attribute. However we still need to construct the param string
that the override deconstructs (until that process is refactored) so for now we will do that here where it is closer to the
future refactor point.

NOTE: Right now popup_functions both looks for CDR0000xxx and strips the prefix (so we have to maintain that format
in the data attribute) and uses the document language instead of the passed param.
*/
import {
  getNodeArray,
} from 'Utilities';
import {
  popWindow,
} from 'Libraries/popups/popup_functions';

// popup_functions only looks at two parts of the query string, id and dictionary. We want to
// use it's default for dictionary, so we really don't need to pass a param string, just the id in a way
// the queryString.parse is able to find it. This is currently an unnecessary step and this function only existing
// in the event that the requirements evolve to require some processing.
const constructQueryStringFromId = id => id;

const addListenersToGlossaryTerms = () => {
  // Find all links that are identifiable as CKEditor-glossified links. Otherwise exit.
  // (Unfortunately this will run on every page for the time being, so we want to avoid resource-intensive operations
  // beyond the initial DOM query.)
  const glossaryLinks = getNodeArray('a.definition[data-glossary-id]');
  if(!glossaryLinks.length) {
    return;
  }

  glossaryLinks.forEach(element => {
    const glossaryId = element.dataset.glossaryId;
    const queryString = constructQueryStringFromId(glossaryId);
    // Using onclick instead of click eventlistener fits with the older paradigm until the refactor. It
    // also allows disabling the link action through return false, unlike with a click event listener.
    element.onclick = () => {
      popWindow('defbyid', queryString);
      return false;
    }
  })

};

export default addListenersToGlossaryTerms;
