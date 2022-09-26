export const usaFooterDomMock = (): string => {
	return `
		<footer class="usa-footer usa-footer--nci-big" id="nci-footer" aria-label="Footer">
			<div class="grid-container usa-footer__return-to-top">
				<a href="#">Return to top</a>
			</div>
			<div class="usa-footer__primary-section">
				<div class="grid-container">
					<div class="grid-row grid-gap">
						<div class="tablet:grid-col-8">
							<nav class="usa-footer__nav" aria-label="Footer navigation">
								<div class="grid-row grid-gap-4">
									<div class="mobile-lg:grid-col-6 desktop:grid-col-4">
										<section class="usa-footer__primary-content usa-footer__primary-content--collapsible">
											<h4 class="usa-footer__primary-link">About</h4>
											<ul class="usa-list usa-list--unstyled">
												<li class="usa-footer__secondary-link">
													<a href="/about-website">About this Website</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/espanol">en Español</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/policies/copyright-reuse">Reuse & Copyright</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/social-media">Social Media</a>
												</li>
											</ul>
										</section>
									</div>
									<div class="mobile-lg:grid-col-6 desktop:grid-col-4">
										<section class="usa-footer__primary-content usa-footer__primary-content--collapsible">
											<h4 class="usa-footer__primary-link">Resources</h4>
											<ul class="usa-list usa-list--unstyled">
												<li class="usa-footer__secondary-link">
													<a href="/contact">Contact Us</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/publications">Publications</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/publications/dictionaries/cancer-terms">Dictionary of Cancer Terms</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/about-cancer/treatment/clinical-trials/search">Find a Clinical Trial</a>
												</li>
												<li>
													<a data-testid="bad-link"></a>
												</li>
											</ul>
										</section>
									</div>
									<div class="mobile-lg:grid-col-6 desktop:grid-col-4">
										<section class="usa-footer__primary-content usa-footer__primary-content--collapsible">
											<h4 class="usa-footer__primary-link">Policies</h4>
											<ul class="usa-list usa-list--unstyled">
												<li class="usa-footer__secondary-link">
													<a href="/policies/accessibility">Accessibility</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/policies/foia">FOIA</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/policies/privacy-security">Privacy & Security</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="/policies/disclaimer">Disclaimers</a>
												</li>
												<li class="usa-footer__secondary-link">
													<a href="https://www.hhs.gov/vulnerability-disclosure-policy/index.html">Vulnerability Disclosure</a>
												</li>
											</ul>
										</section>
									</div>
									<div class="mobile-lg:grid-col-6 desktop:grid-col-4">
										<section class="usa-footer__primary-content usa-footer__primary-content--collapsible">
											<h4 class="usa-footer__primary-link"></h4>
											<ul class="usa-list usa-list--unstyled">
												<li class="usa-footer__secondary-link">
													<a data-testid="bad-collapse"></a>
												</li>
											</ul>
										</section>
									</div>
								</div>
							</nav>
						</div>
						<div class="tablet:grid-col-4">
							<div class="usa-sign-up">
								<h3 class="usa-sign-up__heading">Sign up for email updates</h3>
								<form onsubmit="return false;" aria-label="Footer subscribe" class="usa-form" accept-charset="UTF-8" method="post" target="_blank" id="signup" novalidate>
									<input type="hidden" name="category_id" id="category_id" value="USNIHNCI_C25" 	/>
									<div class="usa-form-group">
										<label class="usa-label" for="email">
											Enter your email address
										</label>
										<input class="usa-input width-full" id="email" name="email" type="email" value="" />
									</div>
									<button class="usa-button usa-button--accent-warm" type="submit">
										Sign up
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="usa-footer__secondary-section">
				<div class="grid-container">
					<div class="grid-row grid-gap">
						<div class="usa-footer__logo grid-row desktop:grid-col-5">
							<div class="mobile-lg:grid-col-auto desktop:margin-bottom-3">
								<p class="usa-footer__logo-heading">
									<span class="logo__agency-name">National Cancer Institute </span>
									<span class="logo__parent-organization">At the National Institute of Health</span>
								</p>
							</div>
						</div>
						<div class="usa-footer__contact-links mobile-lg:grid-col-7">
							<h3 class="usa-footer__contact-heading">Contact Us</h3>
							<div class="usa-footer__address">
								<div class="usa-footer__contact-info grid-row grid-gap">
									<div class="tablet:grid-col-auto">
										<a href="https://livehelp.cancer.gov/">Live Chat</a>
									</div>
									<div class="tablet:grid-col-auto">
										<a href="tel:1-800-4-CANCER">1-800-4-CANCER</a>
									</div>
									<div class="tablet:grid-col-auto">
										<a href="mailto:NCIinfo@nih.gov">NCIinfo@nih.gov</a>
									</div>
									<div class="tablet:grid-col-auto">
										<a class="no-exit-notification" href="https://nci.az1.qualtrics.com/jfe/form/SV_aeLLobt6ZeGVn5I">Site Feedback</a>
									</div>
								</div>
							</div>
						</div>
						<div class="usa-footer__contact-links">
							<div class="usa-footer__address">
								<div class="usa-footer__contact-info">
									<div>
										<a data-testid="bad-contact-link"></a>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="grid-row grid-gap">
						<div class="usa-footer__social-links desktop:grid-col-5">
							<h3 class="usa-footer__social-heading">Follow us</h3>
							<div class="grid-row grid-gap-1 nci-big__social">
								<div class="grid-col-auto">
									<a class="usa-social-link usa-social-link--facebook no-exit-notification"
										 href="https://www.facebook.com/cancer.gov">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"  class="usa-icon" role="img" aria-labelledby="facebook-title">
											<title id="facebook-title">Facebook</title>
											<rect fill="none" height="24" width="24"/>
											<path d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-2 c-0.55,0-1,0.45-1,1v2h3v3h-3v6.95C18.05,21.45,22,17.19,22,12z"/>
										</svg>
									</a>
								</div>
								<div class="grid-col-auto">
									<a class="usa-social-link usa-social-link--twitter no-exit-notification"
										 href="https://twitter.com/thenci">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="usa-icon" role="img" aria-labelledby="twitter-title">
											<title id="twitter-title">Twitter</title>
											<path id="Twitter" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5,8.1c0,.1,0,.21,0,.31a6.81,6.81,0,0,1-6.86,6.86,6.74,6.74,0,0,1-3.69-1.08,5.63,5.63,0,0,0,.58,0,4.79,4.79,0,0,0,3-1A2.41,2.41,0,0,1,7.8,13.51a1.75,1.75,0,0,0,.46.05,2.59,2.59,0,0,0,.63-.08A2.42,2.42,0,0,1,7,11.11v0a2.33,2.33,0,0,0,1.09.3A2.43,2.43,0,0,1,7.3,8.16a6.84,6.84,0,0,0,5,2.53,2.59,2.59,0,0,1-.07-.55,2.41,2.41,0,0,1,2.41-2.41,2.38,2.38,0,0,1,1.77.76A4.67,4.67,0,0,0,17.9,7.9a2.39,2.39,0,0,1-1.06,1.34,4.55,4.55,0,0,0,1.39-.39A5,5,0,0,1,17,10.1Z"/>
										</svg>
									</a>
								</div>
								<div class="grid-col-auto">
									<a class="usa-social-link usa-social-link--instagram no-exit-notification"
										 href="https://www.instagram.com/nationalcancerinstitute/">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="usa-icon"  role="img" aria-labelledby="instagram-title">
											<title id="instagram-title">Instagram</title>
											<g id="Instagram">
												<path d="M12,10a2,2,0,1,0,2,2A2,2,0,0,0,12,10Z"/>
												<path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm6,12.69A3.32,3.32,0,0,1,14.69,18H9.31A3.32,3.32,0,0,1,6,14.69V9.31A3.32,3.32,0,0,1,9.31,6h5.38A3.32,3.32,0,0,1,18,9.31Z"/>
												<path d="M16.94,9.31a2.25,2.25,0,0,0-2.25-2.25H9.31A2.25,2.25,0,0,0,7.06,9.31v5.38a2.25,2.25,0,0,0,2.25,2.25h5.38a2.25,2.25,0,0,0,2.25-2.25h0ZM12,15.09A3.09,3.09,0,1,1,15.09,12,3.09,3.09,0,0,1,12,15.09Zm3.77-5.75a.79.79,0,0,1-.55.23.83.83,0,0,1-.55-.23.78.78,0,0,1,0-1.11A.82.82,0,0,1,15.22,8a.78.78,0,0,1,.55,1.33Z"/>
											</g>
										</svg>
									</a>
								</div>
								<div class="grid-col-auto">
									<a class="usa-social-link usa-social-link--youtube no-exit-notification"  href="https://www.youtube.com/NCIgov">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="usa-icon" role="img" aria-labelledby="youtube-title">
											<title id="youtube-title">Youtube</title>
											<g id="YouTube">
												<path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.75,12.91A1.49,1.49,0,0,1,16.69,16a34.65,34.65,0,0,1-4.69.26A34.65,34.65,0,0,1,7.31,16a1.49,1.49,0,0,1-1.06-1.06A15.88,15.88,0,0,1,6,12a15.88,15.88,0,0,1,.25-2.91A1.49,1.49,0,0,1,7.31,8,34.65,34.65,0,0,1,12,7.77,34.65,34.65,0,0,1,16.69,8a1.49,1.49,0,0,1,1.06,1.06A15.88,15.88,0,0,1,18,12,15.88,15.88,0,0,1,17.75,14.91Z"/>
												<polygon points="10.77 13.78 13.91 12 10.77 10.22 10.77 13.78"/>
											</g>
										</svg>
									</a>
								</div>
								<div class="grid-col-auto">
									<a class="usa-social-link usa-social-link--linkedin no-exit-notification"  href="https://www.linkedin.com/company/nationalcancerinstitute/">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="usa-icon"  role="img" aria-labelledby="linkedin-title">
											<title id="linkedin-title">Linkedin</title>
											<g id="final">
												<path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M8.912001,17.584H6.584v-7.472h2.328001V17.584z
                          M7.744,9.104C6.992,9.104,6.4,8.488,6.4,7.76c0-0.752,0.592-1.344,1.344-1.344c0.728,0,1.343999,0.592,1.343999,1.344
                          C9.087999,8.488,8.472,9.104,7.744,9.104z M17.6,17.584h-2.328v-3.64c0-0.856-0.024001-1.967999-1.216001-1.967999
                          s-1.392,0.927999-1.392,1.912v3.696H10.36v-7.472h2.224v1.008h0.024c0.464-0.752,1.296-1.216001,2.199999-1.192
                          c2.352001,0,2.792,1.552001,2.792,3.544001C17.6,13.472,17.6,17.584,17.6,17.584z"/>
											</g>
										</svg>
									</a>
								</div>
							</div>
						</div>
						<div class="usa-footer__social-links">
							<a class="usa-social-link no-exit-notification" data-testid="bad-social">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24">
									<rect fill="none" height="24" width="24"/>
									<path d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-2 c-0.55,0-1,0.45-1,1v2h3v3h-3v6.95C18.05,21.45,22,17.19,22,12z"/>
								</svg>
							</a>
						</div>
						<div class="usa-footer__contact-links desktop:grid-col-7">
							<div class="usa-footer__address height-full">
								<div class="usa-footer__contact-info grid-row grid-gap height-full">
									<address>
										<a href="https://www.hhs.gov/">U.S. Department of Health and Human Services </a>
										<a href="https://www.nih.gov/">National Institutes of Health </a>
										<a href="https://www.cancer.gov/">National Cancer Institute </a>
										<a href="https://usa.gov/">USA.gov</a>
									</address>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	`;
};
