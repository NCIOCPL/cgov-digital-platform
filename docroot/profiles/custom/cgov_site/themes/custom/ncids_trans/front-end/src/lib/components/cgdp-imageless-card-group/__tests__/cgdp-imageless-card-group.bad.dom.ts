export const cgdpImagelessCardRowBadDom = () => {
	const div = document.createElement('div');

	// language=HTML
	div.innerHTML = `
		<div class="usa-section" data-eddl-bad-landing-row="">
			<div class="cgdp-imageless-card-group--three-card">
				<h2 class="cgdp-imageless-card-group__heading usa-sr-only"></h2>
				<ul>
					<li class="nci-card">
						<a href="https://www.google.com" aria-labelledby="paragraph-1525" data-eddl-landing-item="imageless_card" data-eddl-landing-item-link-type="External">
							<div class="nci-card__body">
								<span class="nci-card__title" id="paragraph-1525">Second Test of External Card with Longer Title</span>
								<p class="nci-card__description">This is the second external card in the 2-Imageless Card layout.</p>
							</div>
						</a>
					</li>
					<li class="nci-card">
						<a href="/about-cancer" aria-labelledby="paragraph-1527" data-eddl-landing-item="imageless_card" data-eddl-landing-item-link-type="Internal">
							<div class="nci-card__body">
								<span class="nci-card__title" id="paragraph-1527">This is an Override Title for About Cancer</span>
								<p class="nci-card__description">This is a test of the internal card in the 2-Imageless Card layout.</p>
							</div>
						</a>
					</li>
					<li class="nci-card">
						<a href="/about-nci/organization/nci-at-a-glance" aria-labelledby="paragraph-1526" data-eddl-landing-item="imageless_card" data-eddl-landing-item-link-type="">
							<div class="nci-card__body">
								<span class="nci-card__title" id="paragraph-1526">Test Multimedia Card</span>
								<p class="nci-card__description">This is a test of the multimedia card in the 2-Imageless Card layout.</p>
							</div>
						</a>
					</li>
				</ul>
			</div>
		</div>
	`;

	return div;
};
