import './video.scss';
import flexVideo from 'Core/libraries/videoPlayer/flexVideo';
import videoCarousel from 'Core/libraries/videoCarousel/video-carousel';
import { GoogleAPIKey } from 'Core/libraries/nciConfig/NCI.config';

//DOM Ready event
const onDOMContentLoaded = () => {
	/*** BEGIN video embedding
	 * This enables the embedding of YouTube videos and playlists as iframes.
	 ***/
	flexVideo();

	videoCarousel.apiInit(GoogleAPIKey);
};

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
