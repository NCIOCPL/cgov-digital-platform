/**
 * AUDIO PLAYER
 * 
 * Creating a detached audio element, changing the url to match a desired mp3 file, and then triggering it to play audio sounds
 * relatively straightforward. Sadly, there are issues with browser support/browser permissions. This class is an attempt to handle
 * all paths necessary for our currently supported browsers.
 */
class AudioPlayer {

    constructor(){
        this.player = document.createElement("audio");
    }

    /**
     * @param {string} url
     */
    play(url){
        this.player.src = url;
        const playPromise = this.player.play();

        // IE11 supports HTML5 audio but does not return a promise, unlike other browsers.
        if(playPromise !== undefined){
            playPromise.catch(_ => {
                // Play was rejected (likely because of a permissions error in Safari or Mobile Chrome,
                // that does not allow autoplaying of audio/video elements (ie dynamically triggered))
                // First fallback workaround is to use an audio buffer.

                // Safari only supports webkitAudioContext, so we need to 'polyfill'
                const AudioContext = window.AudioContext || window.webkitAudioContext || false;
                
                if(AudioContext){
                    const context = new AudioContext();

                    const playAudioBuffer = audioBuffer => {
                        const playSound = context.createBufferSource();
                        playSound.buffer = audioBuffer;
                        playSound.connect(context.destination);
                        playSound.start(0);
                    };

                    const handleDecodeAudioDataFailure = err => console.log(err);
                    
                    // We don't need to polyfill fetch (thank goodness) because IE11 does support HTML5 audio without
                    // permissions issues, unlike Safari.
                    fetch(url)
                        .then(response => response.arrayBuffer())
                        .then(arrayBuffer => context.decodeAudioData(arrayBuffer, playAudioBuffer, handleDecodeAudioDataFailure))
                }
                else{
                    // FML: Permission denied and no audio context, but promises are supported -- what kind of browser are you in?
                    // If we need to support browsers (mobile?) that will reach this sad path, we can
                    // manually trigger the original anchor link (there are a variety of ways to work around the preventDefault).
                }
            })
        }
    }
}

export default AudioPlayer;