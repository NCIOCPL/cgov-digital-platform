import {
    onClickAnalytics,
    getContent,
} from '../utilities';
import {
    getNodeArray,
} from 'Core/utilities/domManipulation';

const getCurrentFontSize = () => {
    const testElement = document.querySelector('.resize-content') || document.getElementById('cgvBody');
    const size = parseFloat(window.getComputedStyle(testElement).getPropertyValue('font-size'), 10);
    const fontSize =
        size < 19
        ? 'Normal'
        : size < 23
        ? 'Medium'
        : size < 27
        ? 'Large'
        : 'Extra Large';
    return fontSize;
}

const resize = {
    hook: '.page-options--resize a',
    textContent: {
        title: {
            'en': () => 'Font Resizer',
            'es': () => 'Control de tamaño de fuente',
        },
    },
    initialize: language => settings => node => {
        const title = getContent(settings.textContent.title, language)();
        node.title = title;
        node.setAttribute('aria-label', title);

        const clickHandler = resizeableElements => {
            const multiplier = 1.2;
            let originalSize = parseFloat(window.getComputedStyle(document.body).getPropertyValue('font-size'), 10);
            let currentSize = 0;

            return event => {
                event.preventDefault();
                currentSize = parseFloat(window.getComputedStyle(resizeableElements[0]).getPropertyValue('font-size'), 10);
                let newSize = currentSize * multiplier;
                newSize = newSize > 30 ? originalSize : newSize;
                resizeableElements.forEach(el => {
                    el.style.fontSize = newSize + "px";
                })
            };
        }

        const resizeableElements = getNodeArray(".resize-content");
        if(resizeableElements.length){
            node.addEventListener('click', clickHandler(resizeableElements));
        }

        return node;
    },
    initializeAnalytics: node => {
        const mouseleaveHandler = () => {
            const fontSize = getCurrentFontSize();
            const detail = {
                type: 'fontResizer',
                args: [fontSize],
            };
            onClickAnalytics({ node, detail })();
            node.removeEventListener('mouseleave', mouseleaveHandler);
        }

        node.addEventListener('click', () => {
            node.addEventListener('mouseleave', mouseleaveHandler)
        })
        return node;
    },
};

export default resize;
