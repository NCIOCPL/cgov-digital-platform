import {
    getDelighterSettings,
    buildDelighter,
} from './utilities';
import './index.scss';
import rules from './rules';

let isInitialized = false;

/**
 * Add a floating delighter anchor element to the DOM in the event that the current path matches
 * a rule specifying a specific delighter element.
 *
 * @param {String} [containerSelector = '.page-options-container'] Valid DOM selector.
 */
const init = (containerSelector = '.page-options-container') => {
    if(isInitialized) {
        return;
    }
    else {
        isInitialized = true;
    }

    const pathName = location.pathname.toLowerCase();
    const delighterSettings = getDelighterSettings(pathName, rules);

    if(delighterSettings) {
        const delighterParent = document.querySelector(containerSelector);
        // Don't try and attach the delighter if no valid injection point was found.
        if(!delighterParent){
            return;
        }
        const delighterElement = buildDelighter(delighterSettings);
        delighterParent.appendChild(delighterElement);

        // TODO: This allows us to add more custom CSS rules to siblings when delighter isn't present
        // At the moment it is not being used so I'm leaving it here just in case.
        // delighterParent.classList.append('floating-delighter--active');

        return delighterElement;
    }
}

export default init;
