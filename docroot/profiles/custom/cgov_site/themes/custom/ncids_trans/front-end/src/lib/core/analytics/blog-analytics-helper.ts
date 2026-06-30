import { trackOther } from './eddl-util';

const EVENT_NAME = 'BlogSeries:List:LinkClick';
const BLOG_SERIES_LIST_SELECTOR =
	'.cgdp-blog-series .cgdp-block-blog-posts .usa-collection, .cgdp-blog-series .cgdp-block-blog-posts.usa-collection';
const COLLECTION_ITEM_SELECTOR = '.usa-collection__item';
const TRACKED_LINK_SELECTOR = '.usa-collection__heading a';
const BLOG_RIGHT_RAIL_LINK_SELECTOR =
	'.cgdp-blog-categories a, .cgdp-blog-archive a';
const BLOG_PAGER_LINK_SELECTOR = '.cgdp-blog-post-pager a';

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

		trackOther(EVENT_NAME, EVENT_NAME, {
			location: 'Body',
			componentType: 'Blog Series List',
			title: (target.textContent?.trim() || '_ERROR_').slice(0, 50),
			linkArea: 'Title',
			totalLinks: collectionItems.length,
			linkPosition:
				collectionItemIndex === -1 ? '_ERROR_' : collectionItemIndex + 1,
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
