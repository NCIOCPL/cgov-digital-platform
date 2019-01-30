import {
    onClickShareButton,
    onClickAnalytics,
    getContent,
} from '../utilities';

const facebook =  {
    hook: '.social-share--facebook a',
    link: url => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    windowSettings: {},
    textContent: {
        title: {
            'en': () => 'Facebook',
            'es': () => 'Facebook',
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
}

export default facebook;