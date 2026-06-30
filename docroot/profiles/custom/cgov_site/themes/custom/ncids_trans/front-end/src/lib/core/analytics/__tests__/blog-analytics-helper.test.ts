import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../eddl-util';
import { blogSeriesListAnalyticsHelper } from '../blog-analytics-helper';

jest.mock('../eddl-util');

const longTitle =
	'This blog title is intentionally longer than fifty characters for analytics';

const blogSeriesListMultipleTitleLinksDom = `
  <main class="cgdp-blog-series">
    <div class="cgdp-block-blog-posts">
      <ul class="usa-collection">
        <li class="usa-collection__item">
          <div class="usa-collection__body">
            <div class="usa-collection__heading">
              <a class="usa-link" href="/first-title">First Title Link</a>
            </div>
            <div class="usa-collection__heading">
              <a class="usa-link" href="/second-title">Second Title Link</a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </main>
`;

const blogSeriesListDom = `
	<main class="cgdp-blog-series">
		<div class="cgdp-block-blog-posts">
			<ul class="usa-collection">
				<li class="usa-collection__item">
					<img class="usa-collection__img" src="/first.jpg" alt="">
					<div class="usa-collection__body">
						<div class="usa-collection__heading">
							<a class="usa-link" href="/first-post">First Blog Post</a>
						</div>
					</div>
				</li>
				<li class="usa-collection__item">
					<div class="usa-collection__body">
						<div class="usa-collection__heading">
							<a class="usa-link" href="/second-post">${longTitle}</a>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</main>
`;

describe('Blog series list analytics helper', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when blog series lists do not exist', () => {
		expect(() => blogSeriesListAnalyticsHelper()).not.toThrow();
	});

	it('tracks title clicks', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', blogSeriesListDom);

		blogSeriesListAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: longTitle }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'BlogSeries:List:LinkClick',
			'BlogSeries:List:LinkClick',
			{
				location: 'Body',
				componentType: 'Blog Series List',
				title: longTitle.slice(0, 50),
				linkArea: 'Title',
				totalLinks: 2,
				linkPosition: 2,
			}
		);
	});

	it('uses the clicked title link text as the analytics title', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML(
			'beforeend',
			blogSeriesListMultipleTitleLinksDom
		);

		blogSeriesListAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Second Title Link' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'BlogSeries:List:LinkClick',
			'BlogSeries:List:LinkClick',
			{
				location: 'Body',
				componentType: 'Blog Series List',
				title: 'Second Title Link',
				linkArea: 'Title',
				totalLinks: 1,
				linkPosition: 1,
			}
		);
	});

	it('does not attach duplicate click handlers', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML('beforeend', blogSeriesListDom);

		blogSeriesListAnalyticsHelper();
		blogSeriesListAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: longTitle }));

		expect(trackOtherSpy).toHaveBeenCalledTimes(1);
	});
});
