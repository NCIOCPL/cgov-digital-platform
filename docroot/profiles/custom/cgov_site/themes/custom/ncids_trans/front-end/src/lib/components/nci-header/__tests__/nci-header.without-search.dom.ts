export const headerWithoutSearch = () => {
	const div = document.createElement('div');

	// language=HTML
	div.innerHTML = `
		<header id="nci-header" class="nci-header nci-header--extended">
			<div class="nci-header__navbar">
				<div class="nci-logo" id="extended-mega-logo">
					<a href="#" aria-label="Homepage">
						<img src="https://www.cancer.gov/profiles/custom/cgov_site/themes/custom/cgov/static/images/design-elements/logos/nci-logo-full.svg" alt="" />
					</a>
				</div>

				<div class="nci-header-nav__secondary">
					<button class="usa-button nci-header-mobilenav__open-btn">Menu</button>
				</div>
			</div>

			<nav aria-label="Primary navigation" class="nci-header-nav">
				<div class="nci-header-nav__inner">
					<ul class="nci-header-nav__primary">
						<li class="nci-header-nav__primary-item">
							<a data-menu-id="1234" class="nci-header-nav__primary-link" href="#">
								<span>First Section</span>
							</a>
						</li>
						<li class="nci-header-nav__primary-item">
							<a data-menu-id="2345" class="nci-header-nav__primary-link" href="#">
								<span>Second Section</span>
							</a>
						</li>
						<li class="nci-header-nav__primary-item">
							<a class="nci-header-nav__primary-link" data-megamenu-disabled="true" href="#">
								<span>Third Section</span>
							</a>
						</li>
						<li class="nci-header-nav__primary-item">
							<a data-menu-id="4567" class="nci-header-nav__primary-link" href="#">
								<span>Fourth Section</span>
							</a>
						</li>
						<li class="nci-header-nav__primary-item">
							<a data-menu-id="5678" class="nci-header-nav__primary-link" href="#">
								<span>Fifth Section</span>
							</a>
						</li>
					</ul>
				</div>
			</nav>
		</header>
	`;

	return div;
};
