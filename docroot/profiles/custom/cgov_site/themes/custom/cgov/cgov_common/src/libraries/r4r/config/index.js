import createEventHandler from './cancer_gov/eventHandler';
import { awaitAnalyticsLibraryAvailability } from './cancer_gov/analyticsHandler';
import { exitDisclaimerEventHandler } from './cancer_gov/exitDisclaimerHandler';

// #########################################################################################
// #######¯\_(ツ)_/¯##### INTEGRATION / SHIM / PROXY / MIDDLEWARE ######¯\_(ツ)_/¯###########
// #########################################################################################

const CDEConfig = window.CDEConfig || {};
const apiEndpoint = CDEConfig.R4RAPIServer ? CDEConfig.R4RAPIServer : 'https://webapis.cancer.gov/r4r/v1';

// Explicit CSS overrides from CGOV styles
const customTheme = {
    'r4r-container': 'row',
    'searchbar__container': 'cancer-gov',
    'searchbar__button--submit': 'button',
    'browse__tile': 'arrow-link',
    'similar-resource__tile': 'arrow-link',
};

/**
 * A wrapper around the r4r library that creates a custom proxy and injects custom settings.
 * Finally a custom analytics event handler is created and subscribed to the proxy.
 *
 * @param {function} initializeR4R
 */
const initializeCancerGovTheme = initializeR4R => {
    const eventHandler = createEventHandler();

    eventHandler.subscribe(exitDisclaimerEventHandler);

    initializeR4R({
        appId: 'r4r-browser-cache',
        customTheme,
        historyProps: {
            // THIS IS HACKY. BRYAN NO LIKE!
            basename: '/research/resources',
        },
        eventHandler: eventHandler.onEvent,
        apiEndpoint,
    });



    awaitAnalyticsLibraryAvailability(eventHandler);
}

export default initializeCancerGovTheme;
