import { 
    attachHandlers,
    DEFAULT_AUDIO_FILE_TARGET_SELECTOR,
    AUDIO_FILE_DATA_ATTRIBUTE,
    initialize,
} from '../linkAudioPlayer';
import AudioPlayer from '../AudioPlayer'
jest.mock('../AudioPlayer');

describe('linkAudioPlayer', () => {
    beforeEach(() => {
        AudioPlayer.mockClear();
    })

    it('should attach a handler flag to any element with a given selector', () => {
        document.documentElement.innerHTML = `
            <a class="CDR_audiofile"/>
            <a href="www.test.com"/>
            <div class="CDR_audiofile"/>
        `

        const dummyPlayer = () => {};

        attachHandlers(DEFAULT_AUDIO_FILE_TARGET_SELECTOR, dummyPlayer);
        const actual = document.querySelectorAll(`[${AUDIO_FILE_DATA_ATTRIBUTE}]`).length;
        const expected = 1;
        expect(actual).toBe(expected);
    });

    it('should initialize an audio player once when one audiofile element is present', () => {
        document.documentElement.innerHTML = '<a href="/test" class="CDR_audiofile"/>';
        initialize(DEFAULT_AUDIO_FILE_TARGET_SELECTOR);
        expect(AudioPlayer).toBeCalled(); 
    })

    it('should initialize an audio player only once when multiple audiofile elements are present', () => {
        document.documentElement.innerHTML = '<a href="/test" class="CDR_audiofile"/><a href="/test" class="CDR_audiofile"/><a href="/test" class="CDR_audiofile"/>';
        initialize(DEFAULT_AUDIO_FILE_TARGET_SELECTOR);
        expect(AudioPlayer).toBeCalled(); 
    })

    it('should attach a handler to any element with a given selector', () => {
        document.documentElement.innerHTML = '<a href="/test" class="CDR_audiofile"/>';
        initialize(DEFAULT_AUDIO_FILE_TARGET_SELECTOR);
        const audiofile = document.querySelector(DEFAULT_AUDIO_FILE_TARGET_SELECTOR);
        audiofile.click();
        expect(AudioPlayer.mock.instances[0].play).toBeCalled();
    })

    it('should fail to play when no href is found on audio anchor element', () => {
        document.documentElement.innerHTML = '<a class="CDR_audiofile"/>';
        initialize(DEFAULT_AUDIO_FILE_TARGET_SELECTOR);
        const audiofile = document.querySelector(DEFAULT_AUDIO_FILE_TARGET_SELECTOR);
        audiofile.click();
        expect(AudioPlayer.mock.instances[0].play.mock.calls.length).toBe(0);
    })
})