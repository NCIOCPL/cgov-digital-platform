import linkAudioPlayer from 'Core/libraries/linkAudioPlayer';

// SET UP AUDIO PLAYER EVENT HANDLER
// We need to rerun the linkAudioPlayer whenever a component that contains
// audio links is rerendered. For now, the only instance is the dictionary component,
// but we treat it as an array to make adding future components with audio links easier.
// We compose the handler with the root id as a dynamically attached value because we want to be
// able to dynamically scope the reinitialization call in a way that avoids affecting other
// audio links that might be on the page but not managed by the react app. (This is currently not the
// case for the search results page.)
const createAudioPlayerHandler = rootId => event => {
  const audioPlayerSelector = `#${ rootId } a.CDR_audiofile`;
  const eventsWeCareAbout = [
    '@@event/dictionary_load',
  ];

  eventsWeCareAbout.forEach((eventWeCareAbout) => {
    const eventType = event[0].type;
    if(eventType === eventWeCareAbout){
      linkAudioPlayer(audioPlayerSelector);
    }
  })
}

export default createAudioPlayerHandler;
