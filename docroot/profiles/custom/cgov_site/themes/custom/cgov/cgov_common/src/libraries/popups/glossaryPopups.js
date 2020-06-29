// phpcs:disable

import queryString from 'query-string';
import { getNodeArray, getDocumentLanguage } from 'Utilities';
import { GlossaryApiClientV1 } from 'Core/libraries/glossaryService';
import * as config from 'Core/libraries/nciConfig/NCI.config';
import linkAudioPlayer from 'Core/libraries/linkAudioPlayer/linkAudioPlayer';
import triggerModal from './trigger-modal';

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

/*
 Update 6/1/2020 - This really should not use popup_functions. That was always a bit klunky and now that we are redoing the
 dictionary service, it is even harder to figure out what is going on. While the modal singleton is an issue, we should not
 have anything other than the dictionary using popup_functions. Most of the help pages should actually be in app modules,
 which are going away. (and if they are not going away, there is a problem because /common will be going away.)

 Additionally, based on conversations and investigations in the CDR, we did not see any use cases where a Spanish page would
 link to an English definition or vice-versa. So we are going to use the Page's language to determine which definition language
 to fetch.
 */

/**
 * It is not as simple as having some default values. The defaults changed based on the
 * combination of parameters.
 * @param {*} dictionary the provided dictionary
 * @param {*} audience the provided audience
 */
export const getParamsOrDefaults = (glossary, audience) => {
  // Our default glossary is the Dictionary of Cancer Terms, which only has Patient
  // definitions. And is the ONLY glossary that HAS Patient definitions.
  // So any other glossary is for HP and the logic below handles that.
  if (!glossary && !audience) {
    return { glossary: 'Cancer.gov', audience: 'Patient' }
  }

  if (audience && !glossary) {
    switch (audience.toLowerCase()) {
      case 'patient': return { glossary: 'Cancer.gov', audience: 'Patient' };

      case 'healthprofessional': return { glossary: 'NotSet', audience: 'HealthProfessional' };

      default: return { glossary: 'Unknown', audience };
    }
  }

  if (glossary && !audience) {
    return {
      glossary,
      audience: glossary.toLowerCase() === 'cancer.gov' ? 'Patient' : 'HealthProfessional'
    }
  }

  return { glossary, audience };
}

/**
 * This will convert the ID (either CDR0000 or string as number) into an int
 *
 * @param {string} id
 */
export const cleanId = (id) => {
  return parseInt(id.replace('CDR', ''));
}

/**
 * Fixes casing issues with know audiences.
 *
 * @param {string} audience audience string
 */
export const cleanKnownAudience = (audience) => {
  if (audience && audience.toLowerCase() === 'patient') {
    return 'Patient';
  }

  if (audience && audience.toLowerCase() === 'healthprofessional') {
    return 'HealthProfessional';
  }

  return audience;
}

/**
 * These glossary terms have been glossified using Drupal. They are all for the Dictionary of
 * Cancer Terms and they all match the pattern like:
 *
 * <a class="definition" data-glossary-id="CDR0000046014" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046014&amp;version=Patient&amp;language=English">malnutrition</a>
 */
const addListenersToDrupalGlossaryTerms = () => {
  // Find all links that are identifiable as CKEditor-glossified links. Otherwise exit.
  // (Unfortunately this will run on every page for the time being, so we want to avoid resource-intensive operations
  // beyond the initial DOM query.)
  const glossaryLinks = getNodeArray('a.definition[data-glossary-id]');
  if(!glossaryLinks.length) {
    return;
  }

  glossaryLinks.forEach(element => {
    // Extract the data- params
    const glossaryId = cleanId(element.dataset.glossaryId);
    const { glossary, audience} = getParamsOrDefaults(
        element.dataset.glossaryName,
        cleanKnownAudience(element.dataset.glossaryAudience)
      );

    // Using onclick instead of click eventlistener fits with the older paradigm until the refactor. It
    // also allows disabling the link action through return false, unlike with a click event listener.
    element.addEventListener('click', (e) => {
      e.preventDefault();
      fetchAndPop(glossary, audience, getDocumentLanguage(document), glossaryId);
    });
  })

};

/**
 * This handles all the legacy glossary link patterns.
 *
 * Instead of looking at onclick handlers, we should just look at the href to get
 * the params for the definition. They all match a pattern like:
 * <a class="definition" onclick="javascript:popWindow('defbyid','CDR0000045693&amp;version=Patient&amp;language=English'); return false;" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045693&amp;version=Patient&amp;language=English">genes</a>
 */
const addListenersToPdqAndLegacyGlossaryTerms = () => {
  // Find all legacy links. Otherwise exit.
  // (Unfortunately this will run on every page for the time being, so we want to avoid resource-intensive operations
  // beyond the initial DOM query.)
  const glossaryLinks = getNodeArray('a.definition[href*="popDefinition.aspx"]:not([data-glossary-id])');
  if(!glossaryLinks.length) {
    return;
  }

  glossaryLinks.forEach(element => {
    // Get the query params from the href
    const params = queryString.parse(element.search);

    const glossaryId = cleanId(params.id);
    const { glossary, audience} = getParamsOrDefaults(
        // This is a backwards compatibility hack for issues in PDQ content not using the
        // correct glossary name in their links!
        params.dictionary && (params.dictionary.toLowerCase() === 'genetic') ? 'genetics' : params.dictionary,
        cleanKnownAudience(params.version)
      );

    // Remove the onclick handler
    element.removeAttribute('onclick');

    // Using onclick instead of click eventlistener fits with the older paradigm until the refactor. It
    // also allows disabling the link action through return false, unlike with a click event listener.
    element.addEventListener('click', (e) => {
      e.preventDefault();
      fetchAndPop(glossary, audience, getDocumentLanguage(document), glossaryId);
    });
  })

};

/**
 * Fetches a definition and displays it in a modal popup.
 * @param {string} glossary The name of the glossary
 * @param {string} audience The audience, either Patient or HealthProfessional
 * @param {string} language The language
 * @param {integer} id the term's ID
 */
export const fetchAndPop = async (glossary, audience, language, id) => {
  const client = GlossaryApiClientV1.getDefaultInstance();
  // We use the fallback option because popups may not find the right definitions.
  try {
    const term = await client.getTermById(glossary, audience, language, id, true);
    triggerModal(
      renderTerm(term),
      () => {
        // initialize audio player
        if(!!term.pronunciation) {
          linkAudioPlayer(".modal__content .CDR_audiofile");
        }

        // NOTE: the old code called flexVideo, but we don't show any videos in the popup.
      }
    );
  } catch (err) {
    console.error(err);
  }
}

const renderTerm = (term) => {
  // render any images
  const renderMedia = (media) => {
    const images = media.filter(item => item.Type === 'Image');
    //TODO: render as a carousel if more than two images?
    const imageHtml = images.reduce(
      (ac, image) => {
        const imgSrc = image.ImageSources.filter(src => src.Size === "571").shift();
        // Caption is optional...
        const caption = image.Caption ? `<figcaption><div class="caption-container">${image.Caption}</div></figcaption>` : '';
        const renderedImage = `<figure><img src="${imgSrc ? imgSrc.Src : ''}" alt="${image.Alt ? image.Alt : ''}" />${caption}</figure>`;
        return [
          ...ac,
          renderedImage
        ]
      }, [])
      .join('');
    return imageHtml;
  }

  // Sub-template for pronunciation.
  let subTemplate = '';
  if( term.pronunciation && (term.pronunciation.key || term.pronunciation.audio) ) {
    const audio = term.pronunciation.audio ? `<a href="${term.pronunciation.audio}" class="CDR_audiofile"><span class="show-for-sr">listen</span></a>` : '';
    const key = term.pronunciation.key ? term.pronunciation.key : '';
    subTemplate = `<span class="pronunciation">${key} ${audio}</span>`;
  }

  // this is the complete template that will be rendered to the dialog popup. It will conditionally check for data values before attempting to render anything. This way we can avoid property undefined errors and empty DOM nodes.
  let template = `
    <dl>
      <dt class="term">
        <div class="title">${config.lang.Definition_Title[term.language]}:</div>
        <dfn>${term.termName}</dfn>
        ${subTemplate}
      </dt>
      ${term.definition.html ? `<dd class="definition">${term.definition.html}</dd>` : ''}
      ${!!term.media && !!term.media.length ? renderMedia(term.media) : ''}
    </dl>
  `;

  return template;
}


/**
 * Initialize all glossary link popups.
 */
const addListenersToGlossaryTerms = () => {
  addListenersToDrupalGlossaryTerms();
  addListenersToPdqAndLegacyGlossaryTerms();
};

export default addListenersToGlossaryTerms;
