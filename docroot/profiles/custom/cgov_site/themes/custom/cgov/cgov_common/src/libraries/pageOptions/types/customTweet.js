import { newWindow } from 'Utilities';
import {
    onClickAnalytics,
    getContent,
} from '../utilities';

const customTweet = {
    hook: 'a.social-share--custom-tweet',
    textContent: {
        title: {
            'en': () => 'Share on Twitter',
        },
    },
    classList: ['tl-link'],
    initialize: language => settings => node => {
        // Set up the node attributes that a content owner doesn't need to be responsible for
        const title = getContent(settings.textContent.title, language)();
        node.title = title;
        node.setAttribute('aria-label', title);
        settings.classList.forEach(className => node.classList.add(className));
        node.href = "#";

        const customTweetClickHandler = event => {
            event.preventDefault();
            // Extract attributes added by content owner to build a custom tweet window event
            const customTitle = event.target.dataset.title || '';
            const url = event.target.dataset.url || '';
            const link = `https://twitter.com/share?url=${ encodeURIComponent(url) }&text=${ encodeURIComponent(customTitle) }`;
            newWindow(link);
        }

        node.addEventListener('click', customTweetClickHandler);
        return node;
    },
    initializeAnalytics: node => {
        const tlCode = node.dataset.tlCode || '';
        const detail = {
            type: 'CustomTweetClick',
            args: [tlCode]
        };
        node.addEventListener('click', onClickAnalytics({ node, detail }))
        return node;
    },
};

export default customTweet;
