import {
    getDocumentLanguage,
    getNodeArray,
} from 'Utilities';
import pageOptionsTypes from './types';

const getPageOptionsNodes = (pageOptionsTypes) => {
    const pageOptions = Object.entries(pageOptionsTypes).reduce((acc, [type, settings]) => {
        const { hook, link, windowSettings, initialize, initializeAnalytics } = settings;
        const lang = getDocumentLanguage(window.document);
        const nodes = getNodeArray(hook)
            .map(initialize(lang)(settings))
            .map(initializeAnalytics)
        acc[type] = { hook, link, nodes, windowSettings };
        return acc;
    }, {})
    return pageOptions;
}

const initialize = () => {
    const pageOptions = getPageOptionsNodes(pageOptionsTypes);
    return pageOptions;
}

export default initialize;
