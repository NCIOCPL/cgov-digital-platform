import { trackOther } from '../../lib/core/analytics/eddl-util';

export const cgdpErrorPageLinkAnalyticsInit = (errorPage: Element): void => {
	const links = Array.from(errorPage.querySelectorAll('a'));

	links.forEach((link) => {
		link.addEventListener('click', () => {
			trackOther('ErrorPage:LinkClick', 'ErrorPage:LinkClick', {
				location: 'Body',
				linkText: link.textContent?.trim() || '_ERROR_',
			});
		});
	});
};

export const cgdpErrorPageSearchAnalyticsInit = (
	searchForm: HTMLFormElement | null,
	searchInput: HTMLInputElement | null
): void => {
	searchForm?.addEventListener('submit', () => {
		trackOther('ErrorPage:Search', 'ErrorPage:Search', {
			location: 'Body',
			searchTerm: searchInput?.value || '',
		});
	});
};
