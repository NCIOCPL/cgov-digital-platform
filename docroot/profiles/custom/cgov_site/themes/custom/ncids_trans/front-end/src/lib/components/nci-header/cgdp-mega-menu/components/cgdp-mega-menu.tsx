import CgdpJsx from '../../../../core/jsx';

import type {
	CgdpMegaMenuData,
	CgdpMegaMenuItemData,
	CgdpMegaMenuListData,
} from '../types';
import CgdpMegaMenuList from './cgdp-mega-menu-list';

type CgdpMegaMenuProps = {
	linkTracking: (data: { [key: string]: string | number }) => void;
	mmData: CgdpMegaMenuData;
};

/**
 * Mega Menu "Component".
 * @param linkTracking
 * @param {CgdpMegaMenuData} mmData the mega menu data.
 */
const CgdpMegaMenu: React.FunctionComponent<CgdpMegaMenuProps> = ({
	linkTracking,
	mmData,
}) => {
	const megaMenuItemsFactory = (item: CgdpMegaMenuItemData, index: number) => {
		switch (item.type) {
			case 'list':
				return (
					<CgdpMegaMenuList
						linkTracking={linkTracking}
						list={item as CgdpMegaMenuListData}
						index={index}
					/>
				);
			default:
				console.warn(`Unknown mega menu item type ${item.type}`);
				return <></>;
		}
	};

	// Chunk up our mega menu items in to multiple "rows" of 3.
	const items = mmData.items ?? [];
	const size = 3;
	const chunks = Array.from(
		{ length: Math.ceil(items.length / size) },
		(v, i) => items.slice(i * size, i * size + size)
	);

	const mmItemsPaneContents = chunks.map((row) => (
		<div className="grid-row grid-gap">
			{row.map((item) => {
				// Go from 0-based to 1 based.
				const index = items.indexOf(item) + 1;

				return (
					<div className="grid-col-4">{megaMenuItemsFactory(item, index)}</div>
				);
			})}
		</div>
	));

	return (
		<div id="megamenu-layer" className="nci-megamenu">
			<div className="grid-container">
				<div className="grid-row grid-gap-1">
					<div className="grid-col-3 nci-megamenu__primary-pane">
						<a
							onClick={() => {
								linkTracking({
									linkType: 'Primary Nav Label',
									heading: mmData.primary_nav_label,
									headingUrl: mmData.primary_nav_url,
									headingIndex: 0,
									label: mmData.primary_nav_label,
									url: mmData.primary_nav_url,
									listItemNumber: 0,
								});
							}}
							className="nci-megamenu__primary-link"
							href={mmData.primary_nav_url}
						>
							{mmData.primary_nav_label}
						</a>
					</div>
					<div className="nci-megamenu__items-pane grid-col-9">
						{mmItemsPaneContents}
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * Gets a CGDP Mega Menu as a HTMLElement
 * @param {CgdpMegaMenuData} mmData mega menu data
 * @param {string} id the id of the mega menu
 * @returns {HTMLElement} The mega menu contents
 */
const getCgdpMegaMenu = (mmData: CgdpMegaMenuData, id: string): HTMLElement => {
	// This is the link handler
	const linkTracking = (data: { [key: string]: string | number }) => {
		document.dispatchEvent(
			new CustomEvent('nci-header:mega-menu:linkclick', {
				bubbles: true,
				detail: {
					menuId: id,
					...data,
				},
			})
		);
	};
	const menu = <CgdpMegaMenu linkTracking={linkTracking} mmData={mmData} />;
	return menu as unknown as HTMLElement;
};

export default getCgdpMegaMenu;
