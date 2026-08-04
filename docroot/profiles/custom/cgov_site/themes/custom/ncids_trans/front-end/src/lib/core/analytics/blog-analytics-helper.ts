import { trackOther } from './eddl-util';

const BLOG_SERIES_LIST_EVENT_NAME = 'BlogSeries:List:LinkClick';
const BLOG_RIGHT_RAIL_EVENT_NAME = 'Blog:RightRail:LinkClick';
const BLOG_PAGER_EVENT_NAME = 'Blog:Pager:LinkClick';
const BLOG_SERIES_LIST_SELECTOR =
	'.cgdp-blog-series .cgdp-block-blog-posts .usa-collection, .cgdp-blog-series .cgdp-block-blog-posts.usa-collection';
const COLLECTION_ITEM_SELECTOR = '.usa-collection__item';
const TRACKED_LINK_SELECTOR = '.usa-collection__heading a';
const BLOG_RIGHT_RAIL_LINK_SELECTOR =
	'.cgdp-blog-categories a, .cgdp-blog-archive a';
const BLOG_PAGER_LINK_SELECTOR = '.cgdp-blog-post-pager a';
const BLOG_ARCHIVE_TOTAL_SELECTOR = '.cgdp-blog-archive__total';

const blogSeriesListClickHandler =
	(collectionItems: HTMLElement[]) =>
	(evt: Event): void => {
		const target = evt.currentTarget;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const collectionItem = target.closest(COLLECTION_ITEM_SELECTOR);

		if (!(collectionItem instanceof HTMLElement)) {
			return;
		}

		const collectionItemIndex = collectionItems.indexOf(collectionItem);

		trackOther(BLOG_SERIES_LIST_EVENT_NAME, BLOG_SERIES_LIST_EVENT_NAME, {
			location: 'Body',
			componentType: 'Blog Series List',
			title: (target.textContent?.trim() || '_ERROR_').slice(0, 50),
			linkArea: 'Title',
			totalLinks: collectionItems.length,
			linkPosition:
				collectionItemIndex === -1 ? '_ERROR_' : collectionItemIndex + 1,
		});
	};

const getBlogPageType = (): string => {
	const pageType = (
		document.querySelector('meta[name="dcterms.type"]') as HTMLMetaElement
	)?.content;

	switch (pageType) {
		case 'cgvBlogPost':
			return 'Blog Post';
		case 'cgvBlogSeries':
			return 'Blog Series';
		default:
			if (document.querySelector('.cgdp-blog-series')) {
				return 'Blog Series';
			}

			return '_ERROR_';
	}
};

const getRightRailComponentType = (linkClicked: HTMLElement): string => {
	if (linkClicked.closest('.cgdp-blog-categories')) {
		return 'Category Box';
	}

	if (linkClicked.closest('.cgdp-blog-archive')) {
		return 'Archive Box';
	}

	return '_ERROR_';
};

const getRightRailLinkText = (linkClicked: HTMLElement): string => {
	const linkClone = linkClicked.cloneNode(true) as HTMLElement;

	linkClone
		.querySelectorAll(BLOG_ARCHIVE_TOTAL_SELECTOR)
		.forEach((archiveTotal) => archiveTotal.remove());

	return linkClone.textContent?.trim() || '_ERROR_';
};

const blogRightRailClickHandler = (evt: Event): void => {
	const target = evt.currentTarget as HTMLElement;

	trackOther(BLOG_RIGHT_RAIL_EVENT_NAME, BLOG_RIGHT_RAIL_EVENT_NAME, {
		location: 'Right Rail',
		componentType: getRightRailComponentType(target),
		pageType: getBlogPageType(),
		linkText: getRightRailLinkText(target),
	});
};

const getOlderNewer = (linkClicked: HTMLElement): string => {
	if (linkClicked.closest('.cgdp-blog-post-pager--older')) {
		return 'Older';
	}

	if (linkClicked.closest('.cgdp-blog-post-pager--newer')) {
		return 'Newer';
	}

	return '_ERROR_';
};

const blogPagerClickHandler = (evt: Event): void => {
	const target = evt.currentTarget as HTMLElement;

	trackOther(BLOG_PAGER_EVENT_NAME, BLOG_PAGER_EVENT_NAME, {
		location: 'Body',
		componentType: 'Blog Pager',
		pageType: getBlogPageType(),
		olderNewer: getOlderNewer(target),
	});
};

export const blogSeriesListAnalyticsHelper = (
	context: ParentNode = document
): void => {
	const blogSeriesLists = Array.from(
		context.querySelectorAll(BLOG_SERIES_LIST_SELECTOR)
	) as HTMLElement[];

	blogSeriesLists.forEach((blogSeriesList) => {
		const collectionItems = Array.from(
			blogSeriesList.querySelectorAll(COLLECTION_ITEM_SELECTOR)
		) as HTMLElement[];

		collectionItems.forEach((collectionItem) => {
			const trackedLinks = Array.from(
				collectionItem.querySelectorAll(TRACKED_LINK_SELECTOR)
			) as HTMLElement[];

			trackedLinks.forEach((link) => {
				if (link.dataset.blogSeriesListAnalyticsInit === 'true') {
					return;
				}

				link.dataset.blogSeriesListAnalyticsInit = 'true';
				link.addEventListener(
					'click',
					blogSeriesListClickHandler(collectionItems)
				);
			});
		});
	});
};

export const blogRightRailAnalyticsHelper = (
	context: ParentNode = document
): void => {
	const rightRailLinks = Array.from(
		context.querySelectorAll(BLOG_RIGHT_RAIL_LINK_SELECTOR)
	) as HTMLElement[];

	rightRailLinks.forEach((link) => {
		if (link.dataset.blogRightRailAnalyticsInit === 'true') {
			return;
		}

		link.dataset.blogRightRailAnalyticsInit = 'true';
		link.addEventListener('click', blogRightRailClickHandler);
	});
};

export const blogPagerAnalyticsHelper = (
	context: ParentNode = document
): void => {
	const pagerLinks = Array.from(
		context.querySelectorAll(BLOG_PAGER_LINK_SELECTOR)
	) as HTMLElement[];

	pagerLinks.forEach((link) => {
		if (link.dataset.blogPagerAnalyticsInit === 'true') {
			return;
		}

		link.dataset.blogPagerAnalyticsInit = 'true';
		link.addEventListener('click', blogPagerClickHandler);
	});
};

export const blogAnalyticsHelper = (context: ParentNode = document): void => {
	blogSeriesListAnalyticsHelper(context);
	blogRightRailAnalyticsHelper(context);
	blogPagerAnalyticsHelper(context);
};
