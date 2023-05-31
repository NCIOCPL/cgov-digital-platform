export const nciCtaStripDom = () => {
	const div = document.createElement('div');

	// language=HTML
	div.innerHTML = `
		<section class="usa-section usa-section--dark" data-eddl-landing-row>
			<div class="grid-container" data-eddl-landing-item="cta_strip">
				<ul class="nci-cta-strip">
					<li><a href="https://www.google.com" class="usa-button" data-eddl-landing-item-link-type="External">Button 1</a></li>
					<li><a href="/test/internal-promo-block-test-article" class="usa-button" data-eddl-landing-item-link-type="Internal">Button 2</a></li>
					<li><a href="/test/internal-promo-block-test-article-0" aria-label="Internal Button Alt Text" class="usa-button"></a></li>
				</ul>
			</div>
		</section>
	`;

	return div;
};
