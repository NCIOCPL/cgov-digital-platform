import renderPreviewThumbnails from 'Core/libraries/videoPlayer/flexVideo';
import initVideoAnalytics from './cgdp-inline-video-analytics';

const initialize = (): void => {
	// init flexVideo
	renderPreviewThumbnails();

	//start analytics here
	initVideoAnalytics();
};

export default initialize;
