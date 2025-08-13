import { trackOther } from '../../../../core/analytics/eddl-util';
import renderPreviewThumbnails from '../../../../../../../../cgov/src/libraries/videoPlayer/flexVideo';

/**
 * Gets the title of the video
 * @param {Element} videoEl - The video element to search.
 */
const getTitle = (videoEl: Element): string => {
	const element = videoEl.querySelector('.cgdp-video__title');
	const title = element?.textContent?.trim();

	return title || 'Not Defined';
};

/**
 * Click handler for the video link click.
 */
const videoLinkClickHandler = (videoEl: Element) => () => {
	trackOther('Body:EmbeddedMedia:LinkClick', 'Body:EmbeddedMedia:LinkClick', {
		location: 'Body',
		componentType: 'Embedded Video',
		mediaType: 'Video',
		linkText: getTitle(videoEl),
		linkType: 'play',
	});
};

/**
 * Wires up the embedded video for the cdgp requirements.
 */
const initialize = () => {
	renderPreviewThumbnails();

	const videoEls = document.querySelectorAll('.cgdp-video');

	if (videoEls === null) return;

	videoEls.forEach((videoElement) => {
		const video = videoElement.querySelector('.flex-video');
		video?.addEventListener('click', videoLinkClickHandler(videoElement), {
			capture: true,
			passive: true,
		});
	});
};

export default initialize;
