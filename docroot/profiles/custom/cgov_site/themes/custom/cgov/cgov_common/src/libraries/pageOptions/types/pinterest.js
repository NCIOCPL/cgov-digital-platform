import {
    onClickShareButton,
    onClickAnalytics,
    getContent,
} from '../utilities';

const pinterest = {
    hook: '.social-share--pinterest a',
    link: url => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
    windowSettings: {
        width: 700
    },
    textContent: {
        title: {
            'en': () => 'Pinterest',
            'es': () => 'Pinterest',
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

export default pinterest;