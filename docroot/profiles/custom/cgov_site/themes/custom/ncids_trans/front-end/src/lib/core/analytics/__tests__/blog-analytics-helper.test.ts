import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen } from '@testing-library/dom';

import * as eddlUtil from '../eddl-util';
import {
	blogAnalyticsHelper,
	blogPagerAnalyticsHelper,
	blogRightRailAnalyticsHelper,
	blogSeriesListAnalyticsHelper,
	blogSubscribeAnalyticsHelper,
} from '../blog-analytics-helper';

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

const blogRightRailDom = `
	<div class="tablet-lg:grid-col-3">
		<div class="cgdp-blog-categories">
			<div class="usa-summary-box">
				<div class="usa-summary-box__body">
					<div class="usa-summary-box__heading">Categories</div>
					<div class="usa-summary-box__text">
						<ul class="usa-list usa-list--unstyled">
							<li><a href="/blog?topic=clinical-trials">Clinical Trials</a></li>
							<li><a href="/blog?topic=prevention">Prevention</a></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div class="cgdp-blog-archive">
			<div class="usa-accordion usa-accordion--bordered">
				<div class="usa-accordion__heading">
					<button class="usa-accordion__button" type="button">Archive</button>
				</div>
				<div class="usa-accordion__content" id="blog-archive-content">
					<ul class="usa-list usa-list--unstyled">
						<li><a href="/blog?year=2025">2025<span class="cgdp-blog-archive__total"> (12)</span></a></li>
						<li><a href="/blog?year=2024">2024</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
`;

const blogPostPagerDom = `
	<div class="cgdp-blog-post-pager">
		<div class="cgdp-blog-post-pager--older">
			<a class="usa-link" href="/blog/older-post">&lt; Older Post</a>
			<p><i>Older blog post title</i></p>
		</div>
		<div class="cgdp-blog-post-pager--newer">
			<a class="usa-link" href="/blog/newer-post">Newer Post &gt;</a>
			<p><i>Newer blog post title</i></p>
		</div>
	</div>
`;

const blogSeriesPagerDom = `
	<main class="cgdp-blog-series"></main>
	<div class="cgdp-blog-post-pager">
		<a class="cgdp-blog-post-pager--older usa-link" href="/blog?page=1">&lt; Older Posts</a>
		<a class="cgdp-blog-post-pager--newer usa-link" href="/blog?page=0">Newer Posts &gt;</a>
	</div>
`;

const blogSubscribeDom = `
	<div class="cgdp-blog-subscribe-link">
		<a class="usa-link" href="https://example.com/subscribe"><span>Subscribe</span></a>
	</div>
`;

describe('Blog analytics helper', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('initializes all blog analytics helpers', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML(
			'beforeend',
			`${blogSeriesListDom}${blogPostPagerDom}${blogRightRailDom}${blogSubscribeDom}`
		);

		blogAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: longTitle }));
		fireEvent.click(screen.getByRole('link', { name: '< Older Post' }));
		fireEvent.click(screen.getByRole('link', { name: 'Clinical Trials' }));
		fireEvent.click(screen.getByRole('link', { name: 'Subscribe' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'BlogSeries:List:LinkClick',
			'BlogSeries:List:LinkClick',
			expect.any(Object)
		);
		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Pager:LinkClick',
			'Blog:Pager:LinkClick',
			expect.any(Object)
		);
		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:RightRail:LinkClick',
			'Blog:RightRail:LinkClick',
			expect.any(Object)
		);
		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Subscribe:LinkClick',
			'Blog:Subscribe:LinkClick',
			expect.any(Object)
		);
	});
});

describe('Blog subscribe analytics helper', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when blog subscribe links do not exist', () => {
		expect(() => blogSubscribeAnalyticsHelper()).not.toThrow();
	});

	it('tracks subscribe clicks on blog post pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML('beforeend', blogSubscribeDom);

		blogSubscribeAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Subscribe' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Subscribe:LinkClick',
			'Blog:Subscribe:LinkClick',
			{
				location: 'Body',
				componentType: 'Subscribe',
				pageType: 'Blog Post',
			}
		);
	});

	it('tracks subscribe clicks on blog series pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogSeries">'
		);
		document.body.insertAdjacentHTML('beforeend', blogSubscribeDom);

		blogSubscribeAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Subscribe' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Subscribe:LinkClick',
			'Blog:Subscribe:LinkClick',
			{
				location: 'Body',
				componentType: 'Subscribe',
				pageType: 'Blog Series',
			}
		);
	});

	it('does not attach duplicate click handlers to subscribe links', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML('beforeend', blogSubscribeDom);

		blogSubscribeAnalyticsHelper();
		blogSubscribeAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Subscribe' }));

		expect(trackOtherSpy).toHaveBeenCalledTimes(1);
	});
});

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

describe('Blog pager analytics helper', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when blog pager links do not exist', () => {
		expect(() => blogPagerAnalyticsHelper()).not.toThrow();
	});

	it('tracks older post clicks on blog post pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML('beforeend', blogPostPagerDom);

		blogPagerAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: '< Older Post' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Pager:LinkClick',
			'Blog:Pager:LinkClick',
			{
				location: 'Body',
				componentType: 'Blog Pager',
				pageType: 'Blog Post',
				olderNewer: 'Older',
			}
		);
	});

	it('tracks newer post clicks on blog post pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML('beforeend', blogPostPagerDom);

		blogPagerAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Newer Post >' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Pager:LinkClick',
			'Blog:Pager:LinkClick',
			{
				location: 'Body',
				componentType: 'Blog Pager',
				pageType: 'Blog Post',
				olderNewer: 'Newer',
			}
		);
	});

	it('tracks older posts clicks on blog series pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogSeries">'
		);
		document.body.insertAdjacentHTML('beforeend', blogSeriesPagerDom);

		blogPagerAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: '< Older Posts' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Pager:LinkClick',
			'Blog:Pager:LinkClick',
			{
				location: 'Body',
				componentType: 'Blog Pager',
				pageType: 'Blog Series',
				olderNewer: 'Older',
			}
		);
	});

	it('tracks newer posts clicks on blog series pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogSeries">'
		);
		document.body.insertAdjacentHTML('beforeend', blogSeriesPagerDom);

		blogPagerAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Newer Posts >' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:Pager:LinkClick',
			'Blog:Pager:LinkClick',
			{
				location: 'Body',
				componentType: 'Blog Pager',
				pageType: 'Blog Series',
				olderNewer: 'Newer',
			}
		);
	});

	it('does not attach duplicate click handlers to pager links', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML('beforeend', blogPostPagerDom);

		blogPagerAnalyticsHelper();
		blogPagerAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: '< Older Post' }));

		expect(trackOtherSpy).toHaveBeenCalledTimes(1);
	});
});

describe('Blog right rail analytics helper', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		document.head.innerHTML = '';
		jest.resetAllMocks();
	});

	it('does not blow up when blog right rail links do not exist', () => {
		expect(() => blogRightRailAnalyticsHelper()).not.toThrow();
	});

	it('tracks category clicks on blog post pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML('beforeend', blogRightRailDom);

		blogRightRailAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Clinical Trials' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:RightRail:LinkClick',
			'Blog:RightRail:LinkClick',
			{
				location: 'Right Rail',
				componentType: 'Category Box',
				pageType: 'Blog Post',
				linkText: 'Clinical Trials',
			}
		);
	});

	it('tracks archive clicks on blog series pages', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogSeries">'
		);
		document.body.insertAdjacentHTML('beforeend', blogRightRailDom);

		blogRightRailAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: '2025 (12)' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:RightRail:LinkClick',
			'Blog:RightRail:LinkClick',
			{
				location: 'Right Rail',
				componentType: 'Archive Box',
				pageType: 'Blog Series',
				linkText: '2025',
			}
		);
	});

	it('uses the blog series layout as a page type fallback', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.body.insertAdjacentHTML(
			'beforeend',
			`<main class="cgdp-blog-series"></main>${blogRightRailDom}`
		);

		blogRightRailAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: 'Prevention' }));

		expect(trackOtherSpy).toHaveBeenCalledWith(
			'Blog:RightRail:LinkClick',
			'Blog:RightRail:LinkClick',
			{
				location: 'Right Rail',
				componentType: 'Category Box',
				pageType: 'Blog Series',
				linkText: 'Prevention',
			}
		);
	});

	it('does not attach duplicate click handlers to right rail links', () => {
		const trackOtherSpy = jest.spyOn(eddlUtil, 'trackOther');
		document.head.insertAdjacentHTML(
			'beforeend',
			'<meta name="dcterms.type" content="cgvBlogPost">'
		);
		document.body.insertAdjacentHTML('beforeend', blogRightRailDom);

		blogRightRailAnalyticsHelper();
		blogRightRailAnalyticsHelper();
		fireEvent.click(screen.getByRole('link', { name: '2024' }));

		expect(trackOtherSpy).toHaveBeenCalledTimes(1);
	});
});
