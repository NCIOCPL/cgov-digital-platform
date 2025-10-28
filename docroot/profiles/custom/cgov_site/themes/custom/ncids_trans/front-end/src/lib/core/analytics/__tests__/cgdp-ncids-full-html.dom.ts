export const cgdpFullHtmlDom = `
<section class="cgdp-article-body__section" aria-labelledby="test-links-in-body-container">
  <h2 class="cgdp-article-body__heading" id="test-links-in-body-container">
    <p>Test Links in Body Container</p>
  </h2>
  <div class="usa-prose usa-prose--ncids-full-html">
    <table border="0" cellpadding="4">
      <tbody>
        <tr>
          <th align="left" scope="row" valign="top"><strong>Telephone:</strong></th>
          <td><a href="tel:+1–800–555–1212">1–800–555–1212</a></td>
        </tr>
        <tr>
          <th align="left" scope="row" valign="top"><strong>E-mail:</strong></th>
          <td><a href="mailto:test@example.org">test@example.org</a></td>
        </tr>
        <tr>
          <th align="left" scope="row" valign="top"><strong>External:</strong></th>
          <td><a href="http://www.google.com">http://www.google.com</a></td>
        </tr>
        <tr>
          <th align="left" scope="row" valign="top"><strong>Internal:</strong></th>
          <td><a data-entity-substitution="canonical" data-entity-type="node" data-entity-uuid="a3464a4e-e0db-45b3-9b69-661ef35f5abc" data-cgov-yaml-query-type="cgov_home_landing" data-cgov-yaml-query-title="About Cancer" href="/about-cancer">content link</a></td>
        </tr>
        <tr>
          <th align="left" scope="row" valign="top"><strong>Media:</strong></th>
          <td><a data-entity-substitution="canonical" data-entity-type="media" data-entity-uuid="2a2069ae-7d76-49ea-8cf5-1d5b6ca48631" data-cgov-yaml-query-bundle="cgov_file" data-cgov-yaml-query-name="Test PDF File name" href="/research/progress/discovery/test-file-url">media link</a></td>
        </tr>
				<tr>
          <th align="left" scope="row" valign="top"><strong>Bad Link No Text</strong></th>
          <td><a href="/research/progress/discovery/test-file-url"></a></td>
        </tr>
      </tbody>
    </table>
  </div>
	<div class="cgdp-embed-media-wrapper">
  <div data-embed-button="insert_block_content" data-entity-embed-display="view_mode:block_content.embedded_feature_card" data-entity-type="block_content" data-entity-uuid="5f1c25b1-e7e0-4574-9b46-35960874d69a" data-cgov-yaml-query-type="cgov_external_link_block" data-cgov-yaml-query-info="External link block description" class="align-right embedded-entity cgdp-embed-feature-card" data-langcode="en" data-entity-embed-display-settings="[]">
    <div class="cgdp-embed-card">
      <div class="nci-card">
        <a href="https://www.google.com" aria-labelledby="block_content-36--2" data-eddl-landing-item="feature_card" data-eddl-landing-item-link-type="External">
          <picture class="nci-card__image">
            <img src="/sites/default/files/styles/ncids_featured_16x9/module/cgov_image/img/placeholder-16x9.png?itok=eQnQfVDC" alt="No Image Placeholder">
          </picture>

          <div class="nci-card__body">
            <span class="nci-card__title" id="block_content-36--2">Testing for Derek Override Title</span>
            <p class="nci-card__description">Testing for Derek - Override Description</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>
<div class="cgdp-embed-media-wrapper">
  <div data-embed-button="insert_block_content" data-entity-embed-display="view_mode:block_content.embedded_feature_card" data-entity-type="block_content" data-entity-uuid="5f1c25b1-e7e0-4574-9b46-35960874d69a" data-cgov-yaml-query-type="cgov_external_link_block" data-cgov-yaml-query-info="External link block description" class="align-right embedded-entity cgdp-embed-feature-card" data-langcode="en" data-entity-embed-display-settings="[]">
    <div class="cgdp-embed-card">
      <div class="nci-card">
        <a href="https://www.google.com" aria-labelledby="block_content-36--2" data-eddl-landing-item="feature_card" data-eddl-landing-item-link-type="External">
          <picture class="nci-card__image">
            <img src="/sites/default/files/styles/ncids_featured_16x9/module/cgov_image/img/placeholder-16x9.png?itok=eQnQfVDC" alt="No Image Placeholder">
          </picture>

          <div class="nci-card__body">
            <span class="nci-card__title" id="block_content-36--2">Testing for Derek Override Title</span>
            <p class="nci-card__description">Testing for Derek - Override Description</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>
</section>`;

export const emptySectionDom = `
<section class="cgdp-article-body__section" aria-labelledby="test-links-in-body-container">
  <h2 class="cgdp-article-body__heading" id="test-links-in-body-container">
    <p>Empty Section</p>
  </h2>
</section>`;

export const introBodyDom = `
<div class="cgdp-field-intro-text">
	<div class="usa-prose">
		<p> Certain medical procedures, such as <a data-gloss-id="304687" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" href="/publications/dictionaries/cancer-terms/def/304687" class="cgdp-definition-link">chest x-rays</a></p>
		<p>
		Telephone: <a href="tel:+1%E2%80%93800%E2%80%93555%E2%80%931212+">1–800–555–1212</a>,<br>
		E-mail: <a href="mailto:test@example.org">test@example.org</a>,<br>
		External: <a href="http://www.google.com">http://www.google.com</a>,<br>
		Internal: <a data-entity-substitution="canonical" data-entity-type="node" data-entity-uuid="a3464a4e-e0db-45b3-9b69-661ef35f5abc" href="/about-cancer">content link</a>,<br>
		Media: <a data-entity-substitution="canonical" data-entity-type="media" data-entity-uuid="2a2069ae-7d76-49ea-8cf5-1d5b6ca48631" href="/research/progress/discovery/test-file-url">media link</a>
		</p>
	</div>
</div>
`;
