export const nciFeatureCardRowBadDom = () => {
	const div = document.createElement('div');

	// language=HTML
	div.innerHTML = `
		<section class="usa-section usa-section--light cgdp-feature-card-row" data-eddl-bad-landing-row="feature-card">
			<div class="grid-container">
				<h2 class="cgdp-feature-card-row__heading">Feature Card Row 1</h2>
				<ul class="nci-card-group">
					<li class="nci-card tablet-lg:grid-col-4">
						<a href="https://www.google.com" aria-labelledby="paragraph-743" data-eddl-landing-item="feature_card" data-eddl-landing-item-link-type="External">
							<picture class="nci-card__image">
								<img loading="lazy" src="/sites/default/files/styles/ncids_featured_16x9/public/cgov_image/ncids_promo_art_16x9/2023-05/override-placeholder-16x9.png?itok=r3dIgZ_u" width="1408" height="792" alt="Override Placeholder">
							</picture>
							<div class="nci-card__body">
								<span class="nci-card__title--bad" id="paragraph-743">External Card Title</span>
								<p class="nci-card__description--bad">Image using 16x9 and 4x3 Override Fields</p>
							</div>
						</a>
					</li>
					<li class="nci-card tablet-lg:grid-col-4">
						<a href="https://www.google.com" aria-labelledby="paragraph-744" data-eddl-landing-item="feature_card" data-eddl-landing-item-link-type="Internal">
							<picture class="nci-card__image">
								<img loading="lazy" src="/sites/default/files/styles/ncids_featured_16x9/public/cgov_image/media_image/2023-05/feature_card_test_cat_override_source.jpeg?h=5238be8d&amp;itok=jYGPlXTe" width="1408" height="792" alt="Feature Card Cat">
							</picture>
							<div class="nci-card__body">
								<span class="nci-card__title--bad" id="paragraph-744">Internal Card Title</span>
								<p class="nci-card__description--bad">This is a use case of the card using the images crops for 16x9 and 4x3</p>
							</div>
						</a>
					</li>
					<li class="nci-card tablet-lg:grid-col-4">
						<a href="https://www.google.com" aria-labelledby="paragraph-745" data-eddl-landing-item="feature_card" data-eddl-landing-item-link-type="">
							<picture class="nci-card__image">
								<img loading="lazy" src="/sites/default/files/styles/ncids_featured_16x9/public/cgov_image/ncids_promo_art_16x9/2023-05/feature_card_test_cat_16x9_override.jpeg?itok=g9HIJfvz" width="1408" height="792" alt="16x9 Override Image">
							</picture>
							<div class="nci-card__body">
								<span class="nci-card__title--bad" id="paragraph-745">Media Card Title</span>
								<p class="nci-card__description--bad">This uses the 4x3 crop and the 16x9 override</p>
							</div>
						</a>
					</li>
				</ul>
			</div>
		</section>
	`;

	return div;
};
