import {
	checkNodeAncestryForClass,
	getNodeArray,
	keyHandler
} from 'Core/utilities';
import axios from 'axios';

// Triggered by 'click' listener on preview thumbnail
const injectIFrame = (videoHook, videoSource) => {
  axios.get(videoSource)
    .then(res => res.data)
    .then(iFrameString => {
      const parser = new DOMParser();
      const iFrameContainer = parser.parseFromString(iFrameString, "text/html");
      const iFrames = iFrameContainer.getElementsByTagName('iframe');
      const iFrame = iFrames[0];
      if(iFrame){
        // We need to append this so that the video in the iFrame begins playing
        // instantaneously, keeping up the illusion that the preview video was
        // the real thing.
        iFrame.src += "&autoplay=1";
        videoHook.innerHTML = ''; // Wipe out Play button and Thumbnail and Title
        videoHook.appendChild(iFrame);
        iFrame.focus();
      }
    })
};

const injectPreviewContents = parent => {
	const { videoUrl } = parent.dataset;

	// On click the preview elements will be deleted and replaced with iFrame stored by oEmbed
	const injectCB = () => injectIFrame(parent, videoUrl);
	const injectCBOnKeypress = keyHandler({
		fn: injectCB,
		keys:['Enter', ' ']
	});
	parent.addEventListener('click', injectCB, false);
	parent.addEventListener('keydown', injectCBOnKeypress, false);
	parent.classList.add('rendered');
};

// Inject custom video previews into any video hooks that are not a part of a carousel
const renderPreviewThumbnails = () => {
	const videoHooks = getNodeArray('.flex-video:not(.rendered)');

	// // Filter out any videos that are children of a carousel to avoid overwriting carousel injection points
	const filteredHooks = videoHooks.filter(hook => !checkNodeAncestryForClass(hook, 'yt-carousel'));
  filteredHooks.forEach(hook => injectPreviewContents(hook));
};

export default renderPreviewThumbnails
