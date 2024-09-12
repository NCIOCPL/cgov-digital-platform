export const cgdpSummaryBoxDom = `
<div class="usa-section" data-eddl-landing-row>
	<div class="usa-summary-box cgdp-summary-box">
		<div class="usa-summary-box__body">
			<div class="usa-summary-box__heading">Summary Box Heading</div>
			<div class="usa-summary-box__text">
				<p><a href="/about-cancer" data-entity-type="node">Internal Managed Link</a></p>
				<p><a href="https://localhost/foo">Absolute link on same site</a></p>
				<p>See <a href="https://www.google.com">External Link</a></p>
				<p><a href="/foo/bar" data-entity-type="media">Media Link</a></p>
				<p><a href="mailto:somone@example.org">Email link</a></p>
				<p><a href="tel:1-555-867-5309">Other link</a></p>
			</div>
		</div>
	</div>
</div>
<div class="usa-section" data-eddl-landing-row>
	<div class="usa-summary-box cgdp-summary-box">
		<div class="usa-summary-box__body">
			<p><a href="https://www.google.com">Link without heading</a></p>
			<p><a href="https://www.google.com">Link following empty heading</a></p>
			<a href="https://www.google.com">Naked Link following heading</a>
			<a href="https://www.google.com" data-testid="empty-link"></a>
		</div>
	</div>
</div>
`;
