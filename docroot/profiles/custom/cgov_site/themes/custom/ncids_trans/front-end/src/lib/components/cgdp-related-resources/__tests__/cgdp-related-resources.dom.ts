export const cgdpRelatedResourcesDom = `
<aside class="cgdp-related-resources">
	<h2 class="nci-heading-h2">Related Resources</h2>
	<ul class="usa-list usa-list--unstyled">
		<li>
			<a class="usa-link" href="/about-cancer/coping/feelings/relaxation" data-list-item-type="cgov_internal_link">Learning to Relax</a>
		</li>
		<li>
			<a class="usa-link" href="/about-cancer/coping/feelings/relaxation" data-list-item-type="cgov_internal_link">Overridden Title</a>
		</li>
		<li>
			<a class="usa-link" href="https://www.google.com" data-list-item-type="cgov_external_link">External Card Title</a>
		</li>

		<li class="cgdp-media-link">
			<a class="usa-link" href="/research/progress/discovery/test-file-url" data-list-item-type="cgov_media_link">Test PDF File name</a>
			<span class="cgdp-media-link__filetype pdf">
				<span class="usa-sr-only">pdf file</span>
			</span>
			<span class="cgdp-media-link__filesize">(61 KB)</span>
		</li>
	</ul>
</aside>
`;

export const cgdpRelatedResourceErrorDom = `
<aside class="cgdp-related-resources">
	<ul class="usa-list usa-list--unstyled">
		<li>
			<a class="usa-link" href="/about-cancer/coping/feelings/relaxation">Bad Link</a>
		</li>
	</ul>
</aside>
`;

export const cgdpRelatedResourcesAccordionDom = `
<aside class="cgdp-related-resources usa-accordion usa-accordion--multiselectable" data-allow-multiple="">
	<h2 class="cgdp-related-resources__heading usa-accordion__heading">
		<button class="usa-accordion__button" aria-controls="acc5538" type="button" aria-expanded="false">Related Resources</button>
	</h2>
	<div class="usa-accordion__content" id="acc5538" hidden="">
		<ul class="usa-list usa-list--unstyled">
			<li>
      	<a class="usa-link" href="/about-cancer/coping/feelings/relaxation" data-list-item-type="cgov_internal_link">Learning to Relax</a>
      </li>
      <li>
      	<a class="usa-link" href="/about-cancer/coping/feelings/relaxation" data-list-item-type="cgov_internal_link">Overridden Title</a>
      </li>
	    <li>
      	<a class="usa-link" href="https://www.google.com" data-list-item-type="cgov_external_link">External Card Title</a>
      </li>
			<li class="cgdp-media-link">
      	<a class="usa-link" href="/research/progress/discovery/test-file-url" data-list-item-type="cgov_media_link">Test PDF File name</a>
        <span class="cgdp-media-link__filetype pdf">
        	<span class="usa-sr-only">pdf file</span>
        </span>
      	<span class="cgdp-media-link__filesize">(61 KB)</span>
      </li>
		</ul>
	</div>
</aside>
`;

export const cgdpRelatedResourcesBadAccordionDom = `
<aside class="cgdp-related-resources usa-accordion usa-accordion--multiselectable" data-allow-multiple="">
	<h2 class="cgdp-related-resources__heading usa-accordion__heading">
		<button data-testid="accordion-heading" class="usa-accordion__button" aria-controls="acc5538" type="button" aria-expanded="false"></button>
	</h2>
	<div class="usa-accordion__content" id="acc5538" hidden="">
		<ul class="usa-list usa-list--unstyled">
			<li>
      	<a class="usa-link" href="/about-cancer/coping/feelings/relaxation" data-list-item-type="cgov_internal_link">Learning to Relax</a>
      </li>
      <li>
      	<a class="usa-link" href="/about-cancer/coping/feelings/relaxation" data-list-item-type="cgov_internal_link">Overridden Title</a>
      </li>
	    <li>
      	<a class="usa-link" href="https://www.google.com" data-list-item-type="cgov_external_link">External Card Title</a>
      </li>
			<li class="cgdp-media-link">
      	<a class="usa-link" href="/research/progress/discovery/test-file-url" data-list-item-type="cgov_media_link">Test PDF File name</a>
        <span class="cgdp-media-link__filetype pdf">
        	<span class="usa-sr-only">pdf file</span>
        </span>
      	<span class="cgdp-media-link__filesize">(61 KB)</span>
      </li>
		</ul>
	</div>
</aside>
`;
