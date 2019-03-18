import { newWindow } from 'Utilities';
import {
    getMetaData,
    getMetaURL,
    getCanonicalURL,
} from 'Utilities';
import { broadcastCustomEvent } from 'Core/libraries/customEventHandler';

// Currently we aren't using most of these tags since the services themselves are scraping the info they
// need. But I'm leaving this here as a point of reference ('og:title' is the only one being used
// at the moment, by Twitter) BB 3/2018
export const metaTags = [
    ['property', 'og:url'],
    ['property', 'og:title'],
    // ['property', 'og:description'],
    // ['property', 'og:site_name'],
    // ['property', 'og:type'],
    // ['name', 'twitter:card']
]

// In the event that the metaData is not pulled down (which is a non-case as of this comment but might
// change shortly), we want to default to the opengraph url with the canonical as a fallback.
export const getURL = (document, metaData) => {
    const metaURL = metaData ? metaData['og:url'] : getMetaURL(document);
    return metaURL ? metaURL : getCanonicalURL(document);
}

/**
 *
 * @param {Object} dict
 * @param {string} language
 * @return {function}
 */
export const getContent = (dict, language = 'en') => {
    if(!dict){
        console.warn('No i18n dictionary provided');
        return () => '';
    }

    if(!Object.keys(dict).length){
        console.warn('Empty dictionary')
        return () => '';
    }

    if(!dict[language] && !dict['en']){
        console.warn('No default english value found')
        return () => '';
    }

    if(!dict[language]){
        console.warn('Desired language not available, defaulting to english')
        return dict['en'];
    }

    return dict[language];
}

// We don't want to take the metadata until the share link has been activated (so that if some
// of it was changed dynamically, we can capture the new data)
export const onClickShareButton = ({
    link,
    windowSettings
}) => event => {
    event.preventDefault();
    const metaData = getMetaData(metaTags, document)
    const url = getURL(document, metaData);
    newWindow(link(url, metaData), windowSettings);
}

export const onClickAnalytics = ({
    node,
    detail = {},
}) => broadcastCustomEvent('NCI.page_option.clicked', {
    node,
    data: detail
})
