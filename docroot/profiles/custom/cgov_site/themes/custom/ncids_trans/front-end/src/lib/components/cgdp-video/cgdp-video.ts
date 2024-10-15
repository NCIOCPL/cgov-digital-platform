import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';
import renderPreviewThumbnails from '../../../../../../cgov/src/libraries/videoPlayer/flexVideo';

/**
 * Handle play button on click handler.
 */
const playVideoClickHandler = (evt: Event): void => {
	const video = evt.currentTarget as HTMLElement;
	//const video = clickTarget.querySelector(`[data-video-title]`) as HTMLElement;

	landingClickTracker(
		video,
		'InlineVideo', // linkName
		1, // containerItems
		1, // containerItemsIndex
		'Inline Video', // componentType
		'Not Defined', // componentTheme
		'Standard YouTube Video', // componentVariant
		video.dataset.videoTitle || '_ERROR_', // title
		'Video Player', // linkType
		'Play', // linkText
		'Play', // linkArea
		1, // totalLinks
		1 // linkPosition
	);
};

/**
 * Initialize component
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	// init flexVideo
	renderPreviewThumbnails();

	//start analytics here
	const videoContainers = document.querySelectorAll(
		'[data-eddl-landing-item="video"]'
	);

	videoContainers.forEach((videoContainer) => {
		const video = videoContainer.querySelector('.flex-video');
		video?.addEventListener('click', playVideoClickHandler, {
			capture: true,
			passive: true,
		});
	});
};

export default initialize;
