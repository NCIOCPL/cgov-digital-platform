import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Handle play button on click handler.
 */
const playVideoClickHandler = (evt: Event): void => {
	const video = evt.currentTarget as HTMLElement;

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
 * Wire up component per cgdp requirements.
 */
const initVideoAnalytics = (): void => {
	const videoContainers = document.querySelectorAll(
		'[data-eddl-landing-item="video"]'
	);

	videoContainers.forEach((videoContainer) => {
		const video = videoContainer.querySelector('.cgdp-video');
		video?.addEventListener('click', playVideoClickHandler);
	});
};

export default initVideoAnalytics;
