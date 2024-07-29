export const cgdpContentBlockDom = `
<div class="usa-section" data-eddl-landing-row>
	<div class="usa-prose cgdp-landing-content-block">
		<h2>Internal Link Testing</h2>
		<p><a href="/about-cancer" data-entity-type="node">Internal Managed Link</a></p>
		<p><a href="https://localhost/foo">Absolute link on same site</a></p>
		<h3>External Link Testing</h3>
		<p>See <a href="https://www.google.com">External Link</a></p>
		<h4>Media Link Testing</h4>
		<p><a href="/foo/bar" data-entity-type="media">Media Link</a></p>
		<h5>Email Link Testing</h5>
		<p><a href="mailto:somone@example.org">Email link</a></p>
		<h6>Other Link Testing</h6>
		<p><a href="tel:1-555-867-5309">Other link</a></p>
	</div>
</div>
<div class="usa-section" data-eddl-landing-row>
	<div class="usa-prose cgdp-landing-content-block">
		<p><a href="https://www.google.com">Link without heading</a></p>
		<div>
			<h2></h2>
			<p><a href="https://www.google.com">Link following empty heading</a></p>
		</div>
		<div>
			<h2>Naked Link Heading</h2>
			<a href="https://www.google.com">Naked Link following heading</a>
		</div>
		<div>
			<a href="https://www.google.com" data-testid="empty-link"></a>
		</div>
	</div>
</div>
`;
