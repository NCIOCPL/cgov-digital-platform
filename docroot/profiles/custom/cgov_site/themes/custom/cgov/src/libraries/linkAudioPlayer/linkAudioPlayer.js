import AudioPlayer from './AudioPlayer';
import { getNodeArray } from '../../utilities/domManipulation';

export const AUDIO_FILE_DATA_ATTRIBUTE = "data-NCI-link-audio-file";
export const DEFAULT_AUDIO_FILE_TARGET_SELECTOR = 'a.CDR_audiofile';

/**
 * @param {function} player
 * @return {function} Event Handler Callback
 */
const handler = player => e => {
    // Disable the underlying anchor tag and retrieve it's stored reference to the mp3 file
    // e.preventDefault();
    const audiolink = e.target.dataset.pathname || e.target.pathname;

    // Basic check that underlying href to mp3 file exists
    if(audiolink){
        player.play(audiolink);
    }
}

/**
 * Event listeners are not a simple matter to catalog, so we use a data-attribute to self-identify audiolinks
 * that have already received player callbacks.
 * @param {HTMLElement} element
 * @return {boolean}
 */
const checkForAudioHandlerFlag = element => {
    return element.hasAttribute(AUDIO_FILE_DATA_ATTRIBUTE);
}

/**
 * @param {HTMLElement} element
 */
const attachHandlerFlag = element => {
    element.setAttribute(AUDIO_FILE_DATA_ATTRIBUTE, "");
}

/**
 * This is exposed as it will allow an audiolink to be dynamically set up after 
 * the initial page load using the same instance of an AudioPlayer
 * @param {HTMLElement} element
 * @param {function} player
 */
export const attachHandler = (element, player) => {
    element.addEventListener('click', handler(player));
}

/**
 * @param {string} selector
 * @param {function} player
 */
export const attachHandlers = (selector, player) => {
    // Audiofiles are generated on the backend as anchor tags with an mp3 file as a source
    const audiofiles = getNodeArray(selector);
    audiofiles.forEach(audiofile => {
        const hasHandlerAlready = checkForAudioHandlerFlag(audiofile);
        if(!hasHandlerAlready){
            attachHandlerFlag(audiofile);
            // We don't want to prevent the default event on the <a> element because doing so would 
            // cancel the user interaction event on mobile and prevent the sound from playing,
            // so we need to stash the url and use JavaScript to return undefined

            // pathname gives a local absolute path
            // audiofile.setAttribute('data-pathname',audiofile.pathname);

            // href includes domain for audio files hosted outside of main site
            audiofile.setAttribute('data-pathname',audiofile.href);
            audiofile.setAttribute('href','javascript:void(0)');

            attachHandler(audiofile, player);
        }
    })
}

/**
 *  * LINK AUDIO PLAYER
 * -----------------------
 * Audio files are currently included by the CDE as anchor tags with an MP3 as the source. In the past we 
 * used a library, jPlayer, to extend the anchor tags functionality and have Flash as a fallback for older browsers.
 * No longer needing to support pre audio element browsers, we can do this natively, but there are a few hoops to jump through.
 * In particular, Safari does not allow programmatic autoplaying of media elements, so a workaround has to be used.
 * 
 * @param {string} [selector = DEFAULT_AUDIO_FILE_TARGET_SELECTOR]
 * @return {AudioPlayer} Instance of Audio Player
 */
export const initialize = (selector = DEFAULT_AUDIO_FILE_TARGET_SELECTOR) => {
    const player = new AudioPlayer();
    attachHandlers(selector, player);

    // If another audiolink needs to be set up subsequent to page loads by the same module this audio player can be reused. 
    return player; 

    // TODO: OR Could attach a global listener at this point that subsequent library could broadcast to
    // TODO: OR set up a mutation listener instead of needing to be called manually when new elements are added. Future changes.
}

export default initialize;