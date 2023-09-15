import ctsEnglishSettings from './ctsEnglishSettings';
import ctsSpanishSettings from './ctsSpanishSettings';

const basePaths = [
    {
        path: /^\/about-cancer\/treatment\/clinical-trials/,
        settings: ctsEnglishSettings
    },
    {
        // We need this to only be participate since clinical-trials
        // and clinical-trials-search are two different directories.
        // The URLs in the settings will add additional filtering.
        path: /^\/research\/participate/,
        settings: ctsEnglishSettings
    },
    {
        path: /^\/espanol\/cancer\/tratamiento/,
        settings: ctsSpanishSettings
    }
];

export default basePaths;
