import ctsEnglishSettings from './ctsEnglishSettings';
import ctsSpanishSettings from './ctsSpanishSettings';

const basePaths = [
    {
        path: /^\/about-cancer\/treatment\/clinical-trials/,
        settings: ctsEnglishSettings
    },
    {
        path: /^\/espanol\/cancer\/tratamiento/,
        settings: ctsSpanishSettings
    }
];

export default basePaths;