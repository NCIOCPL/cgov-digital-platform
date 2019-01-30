import {
    onClickShareButton,
    onClickAnalytics,
    getContent,
} from '../utilities';

const twitter = {
    hook: '.social-share--twitter a',
    link: (url, {'og:title': text}) => {
        // Check for global config object with custom overrides from content creator
        if(window.pageOptionsContentOverride && window.pageOptionsContentOverride.title){
            text = window.pageOptionsContentOverride.title;
        }
        return `https://twitter.com/share?url=${ encodeURIComponent(url) }&text=${ encodeURIComponent(text) }`
    }, 
    windowSettings: {},
    textContent: {
        title: {
            'en': () => 'Twitter',
            'es': () => 'Twitter',
        },
    },
    initialize: language => settings => node => {
        const title = getContent(settings.textContent.title, language)();
        node.title = title;
        node.setAttribute('aria-label', title);       

        node.addEventListener('click', onClickShareButton(settings));
        return node;
    },
    initializeAnalytics: node => {
        const detail = {
            type: 'BookmarkShareClick',
        };
        node.addEventListener('click', onClickAnalytics({ node, detail }))
        return node;
    },
};

export default twitter;