import $ from 'jquery';
import queryString from 'query-string';
import { getDocumentLanguage } from 'Utilities';
import { cleanId, cleanKnownAudience, getParamsOrDefaults, fetchAndPop } from './glossaryPopups';
import triggerModal from './trigger-modal';

export const popWindow = (type, urlargs) => {
  if (type === "definition") {
    // This has been replaced by glossaryPopups.js, and there should be no place
    // where this code is called. However, leaving the warning here for any folks
    // that got creative.
    console.warn(`popWindow by "definition" has been deprecated. ${urlargs}`);
  } else if (type === "help") {
    const searchHelpURL = '/Common/PopUps/popHelp.html';

    $.ajax({
      url:searchHelpURL,
      dataType: 'html',
      success: (response) => {
        // extract the body content from html document
        const pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
        const content = pattern.exec(response)[1];
        triggerModal(content);
      }
    });

  } else if (type === "defbyid") {
    // This has been deprecated by glossaryPopups. We are adding in backwards compatibility
    // here to call glossaryPopups.

    // The code already assumed that the first param was the ID parameter.
    // So let's tack on an ?id= to the front to match the expectations and
    // parse the querystring so we can get definition id and dictionary
    const params = queryString.parse('?id=' + urlargs);

    const glossaryId = cleanId(params.id);
    const { glossary, audience} = getParamsOrDefaults(
      // This is a backwards compatibility hack for issues in PDQ content not using the
      // correct glossary name in their links!
      params.dictionary && (params.dictionary.toLowerCase() === 'genetic') ? 'genetics' : params.dictionary,
      cleanKnownAudience(params.version)
    );

    fetchAndPop(glossary, audience, getDocumentLanguage(document), glossaryId);
  } else {
    // fallback?
    window.open(urlargs, '', 'scrollbars=yes,resizable=yes,width=550,height=550');
  }
}

function dynPopWindow(url, name, windowAttributes){
  // just forwarding this hard coded method to popWindow. All instances of dynPopWindow are for Search Help currently
  const type = url.match('Help.aspx').length ? 'help' : 'popup';
  popWindow(type,url);
}


const overridePopWindowGlobals = () => {
  window.popWindow = popWindow;
  window.dynPopWindow = dynPopWindow;
}

export default overridePopWindowGlobals;
