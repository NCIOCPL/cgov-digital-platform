import {
    cts,
    socialMedia,
    nciConnect,
} from './delighters';

/**
 * A rule is an object required to have a rule and delighter property. The third property exclude is optional. Exclude is an array of regular expressions and/or
 * objects containing a rule (regex) and whitelist (array) property.
 * 
 * NOTE: The function that tests rules is lazy and will only return the first match, so make sure a previous rule doesn't conflict with yours if it's not working.
 */
const rules = [
    {
        rule: /^\/$/,
        delighter: cts,
    },
    {
        rule: /^\/about-cancer\/treatment\/clinical-trials/i,
        delighter: cts,
        exclude: [
            /\/advanced-search$/i,
            {
                rule: /^\/about-cancer\/treatment\/clinical-trials\/search/i,
                whitelist: [
                    '/about-cancer/treatment/clinical-trials/search/help',
                    '/about-cancer/treatment/clinical-trials/search/trial-guide'
                ]
            },
        ]
    },
    {
        rule: /^\/social-media/i,
        delighter: socialMedia,
    },
    {
        rule: /^\/nci\/rare-brain-spine-tumor/i,
        delighter: nciConnect,
        exclude: [
            /\/refer-participate/i,
            /\/blog/i,
            /^\/nci\/rare-brain-spine-tumor\/about/i,
            /\/living\/finished-treatment/i,
            /\/living\/coping/i,
            /\/living\/stories/i
        ]
    },
];

export default rules;