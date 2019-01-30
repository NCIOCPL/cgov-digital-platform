import { 
    onClickAnalytics,
    getContent,
} from '../utilities';

const print = {
    hook: '.page-options--print a',
    textContent: {
        title: {
            'en': () => 'Print',
            'es': () => 'Imprimir',
        },
    },
    initialize: language => settings => node => {
        const title = getContent(settings.textContent.title, language)();
        node.title = title;
        node.setAttribute('aria-label', title);
        node.addEventListener('click', event => {
            event.preventDefault();
            window.print();
        })
        return node;
    },
    initializeAnalytics: node => {
        const detail = {
            type: 'PrintLink',
        };
        node.addEventListener('click', onClickAnalytics({ node, detail }))
        return node;
    },
};

export default print;