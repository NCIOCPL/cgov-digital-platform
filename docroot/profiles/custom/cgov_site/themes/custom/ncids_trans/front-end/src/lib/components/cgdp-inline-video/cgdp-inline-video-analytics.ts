import { landingClickTracker } from '../../core/analytics/landing-page-contents-helper';

/**
 * Handle play button on click handler.
 */
const playVideoClickHandler = (evt: Event): void => {
	const video = evt.currentTarget as HTMLElement;

	landingClickTracker(
		video,
		'InlineVideo',
		1,
		1,
		'Inline Video',
		'Not Defined',
		'Standard YouTube Video',
		video.dataset.videoTitle || '_ERROR_',
		'Video Player',
		'Play',
		'Play',
		1,
		'Play'
	);
};

/**
 * Wire up component per cgdp requirements.
 */
const initVideoAnalytics = (): void => {
	const videoContainers = document.querySelectorAll(
		'[data-eddl-landing-item="inline_video"]'
	);

	videoContainers.forEach((videoContainer) => {
		const video = videoContainer.querySelector('.cgdp-video');
		video?.addEventListener('click', playVideoClickHandler);
	});
};

export default initVideoAnalytics;
