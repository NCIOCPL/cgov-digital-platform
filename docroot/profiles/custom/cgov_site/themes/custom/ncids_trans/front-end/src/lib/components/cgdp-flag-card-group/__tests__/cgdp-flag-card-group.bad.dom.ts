export const cgdpFlagCardGroupBadDom = () => {
	const div = document.createElement('div');

	div.innerHTML = `
		<div class="usa-section" data-eddl-bad-landing-row="">
			<h2 class="nci-heading-h3 padding-bottom-2">
				The Optional Flag Card Group Heading
			</h2>
			<ul class="cgdp-flag-card-group">
				<li class="cgdp-flag-card">
					<a href="/about-cancer" aria-labelledby="paragraph-2391" data-eddl-landing-item="flag_card" data-eddl-landing-item-link-type="Internal">
						<picture media="(min-width: 640px)" class="cgdp-flag-card__image">
							<img src="/sites/default/files/styles/ncids_promo_1x1/module/cgov_image/img/placeholder-1x1.png?itok=6LApdh5r" alt="No Image Placeholder">
						</picture>
						<div class="cgdp-flag-card__content">
							<h3 class="cgdp-flag-card__title--bad" id="paragraph-2391">About Cancer</h3>
							<p class="cgdp-flag-card__description--bad">This flag card is an internal link to About Cancer</p>
						</div>
					</a>
				</li>
				<li class="cgdp-flag-card">
					<a href="https://www.google.com" aria-labelledby="paragraph-2392" data-eddl-landing-item="flag_card" data-eddl-landing-item-link-type="External">
						<picture media="(min-width: 640px)" class="cgdp-flag-card__image">
							<img src="/sites/default/files/styles/ncids_promo_1x1/module/cgov_image/img/placeholder-1x1.png?itok=6LApdh5r" alt="No Image Placeholder">
						</picture>
						<div class="cgdp-flag-card__content">
							<h3 class="cgdp-flag-card__title--bad" id="paragraph-2391">External Card Title</h3>
							<p class="cgdp-flag-card__description--bad">External Flag Card</p>
						</div>
					</a>
				</li>
				<li class="cgdp-flag-card">
					<a href="/about-cancer" aria-labelledby="paragraph-2393" data-eddl-landing-item="flag_card" data-eddl-landing-item-link-type="">
						<picture media="(min-width: 640px)" class="cgdp-flag-card__image">
							<img src="/sites/default/files/styles/ncids_promo_1x1/module/cgov_image/img/placeholder-1x1.png?itok=6LApdh5r" alt="No Image Placeholder">
						</picture>
						<div class="cgdp-flag-card__content">
							<h3 class="cgdp-flag-card__title--bad" id="paragraph-2391">Card Number 3</h3>
							<p class="cgdp-flag-card__description--bad">Three Cards here</p>
						</div>
					</a>
				</li>
				<li class="cgdp-flag-card">
					<a href="/about-cancer" aria-labelledby="paragraph-2394" data-eddl-landing-item="flag_card" data-eddl-landing-item-link-type="Internal">
						<picture media="(min-width: 640px)" class="cgdp-flag-card__image">
							<img src="/sites/default/files/styles/ncids_promo_1x1/module/cgov_image/img/placeholder-1x1.png?itok=6LApdh5r" alt="No Image Placeholder">
						</picture>
						<div class="cgdp-flag-card__content">
							<h3 class="cgdp-flag-card__title--bad" id="paragraph-2391">Fourth Card</h3>
							<p class="cgdp-flag-card__description--bad">Four Flag Cards.</p>
						</div>
					</a>
				</li>
				<li class="cgdp-flag-card">
					<a href="/about-cancer" aria-labelledby="paragraph-2395" data-eddl-landing-item="flag_card" data-eddl-landing-item-link-type="Internal">
						<picture media="(min-width: 640px)" class="cgdp-flag-card__image">
							<img src="/sites/default/files/styles/ncids_promo_1x1/module/cgov_image/img/placeholder-1x1.png?itok=6LApdh5r" alt="No Image Placeholder">
						</picture>
						<div class="cgdp-flag-card__content">
							<h3 class="cgdp-flag-card__title--bad" id="paragraph-2391">There are Five Cards</h3>
							<p class="cgdp-flag-card__description--bad">This flag card is fifth.</p>
						</div>
					</a>
				</li>
			</ul>
		</div>
	`;

	return div;
};
