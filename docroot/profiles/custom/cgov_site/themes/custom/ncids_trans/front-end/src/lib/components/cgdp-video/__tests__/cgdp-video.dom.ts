export const cgdpVideoDom = () => {
	const div = document.createElement('div');

	// language=HTML
	div.innerHTML = `
	<div class="usa-section" data-eddl-landing-row>
		<div data-eddl-landing-item="video">
			<figure class="cgdp-video">
				<div class="cgdp-video__media">
					<div id="ytplayer-jC8CUIID2HA" class="flex-video rendered" data-video-url="/media/oembed?url=https%3A//www.youtube.com/watch%3Fv%3Dk1MHY_AFNAM&amp;max_width=0&amp;max_height=0&amp;hash=J68Emy4PqueTaDce29HZKSeN3ghVE5ju-dliZhIFSOI" data-video-title="Hedge Maze">
						<div class="video-preview__container" tabindex="0" role="button" aria-label="Play video">
							<img loading="lazy" src="/sites/default/files/oembed_thumbnails/3lVXccSiwvvX77eL5mLlh3JZFaS5PyQdR5r0piWl_cE.jpg" width="480" height="360" alt="">
							<div class="video-preview__play-button">
							<svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
								<path class="play-button--bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#212121" fill-opacity="0.8"></path>
								<path d="M 45,24 27,14 27,34" fill="#fff"></path>
							</svg>
							</div>
							<p class="cgdp-video__title">Hedge Maze</p>
						</div>
					</div>
				</div>
			</figure>
		</div>
	</div>
	`;

	return div;
};
