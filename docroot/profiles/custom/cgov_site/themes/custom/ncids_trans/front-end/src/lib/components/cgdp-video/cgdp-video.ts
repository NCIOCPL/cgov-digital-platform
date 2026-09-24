import { trackOther } from '../../core/analytics/eddl-util';
import renderPreviewThumbnails from '../../../../../../cgov/src/libraries/videoPlayer/flexVideo';

const getVideoTitle = (video: HTMLElement): string => {
	const titleElement =
		video.closest('[data-video-title]') ||
		video.querySelector('[data-video-title]');

	return titleElement instanceof HTMLElement
		? titleElement.dataset.videoTitle || '_ERROR_'
		: '_ERROR_';
};

/**
 * Handle play button click analytics call
 */
const playVideoClickHandler = ({ currentTarget }: Event): void => {
	const title = getVideoTitle(currentTarget as HTMLElement);

	trackOther('Body:EmbeddedMedia:LinkClick', 'Body:EmbeddedMedia:LinkClick', {
		location: 'Body',
		componentType: 'Embedded Video',
		mediaType: 'Video',
		mediaTitle: title.slice(0, 50),
		linkText: 'Play Video',
		linkType: 'play',
	});
};

/**
 * Initialize component
 * Wire up component per cgdp requirements.
 */
const initialize = (): void => {
	// init flexVideo
	renderPreviewThumbnails();

	//start analytics here
	const videoContainers = document.querySelectorAll('.cgdp-video');

	if (videoContainers.length === 0) return;

	videoContainers.forEach((videoContainer) => {
		const video = videoContainer.querySelector('.flex-video');
		video?.addEventListener('click', playVideoClickHandler, {
			capture: true,
			passive: true,
		});
	});
};

export default initialize;
