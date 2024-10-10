import renderPreviewThumbnails from 'Core/libraries/videoPlayer/flexVideo';
import initVideoAnalytics from './cgdp-video';

const initialize = (): void => {
	// init flexVideo
	renderPreviewThumbnails();

	//start analytics here
	initVideoAnalytics();
};

export default initialize;
