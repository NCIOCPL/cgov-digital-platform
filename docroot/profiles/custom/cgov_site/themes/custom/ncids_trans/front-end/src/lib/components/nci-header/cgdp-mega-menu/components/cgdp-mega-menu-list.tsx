import CgdpJsx from '../../../../core/jsx';
import type { CgdpMegaMenuListData } from '../types';

type CgdpMegaMenuListProps = {
	linkTracking: (data: { [key: string]: string | number }) => void;
	list: CgdpMegaMenuListData;
	index: number;
};

/**
 * Component representing a Mega Menu List.
 * @param {CgdpMegaMenuListProps} props the attributes for hte component
 * @returns {HTMLElement} The rendered component
 */
const CgdpMegaMenuList: React.FunctionComponent<CgdpMegaMenuListProps> = ({
	linkTracking,
	list,
	index,
}) => {
	const itemsList =
		list.list_items && list.list_items.length > 0 ? (
			<ul className="nci-megamenu__sublist">
				{list.list_items.map((listItem, listItemNumber) => (
					<li className="nci-megamenu__sublist-item">
						<a
							className="nci-megamenu__sublist-item-link"
							href={listItem.url}
							onClick={() =>
								linkTracking({
									linkType: 'List Item',
									heading: list.title,
									headingUrl: list.title_url,
									headingIndex: index,
									label: listItem.label,
									url: listItem.url,
									listItemNumber: listItemNumber + 1,
								})
							}
						>
							{listItem.label}
						</a>
					</li>
				))}
			</ul>
		) : (
			<></>
		);
	return (
		<ul className="nci-megamenu__list">
			<li className="nci-megamenu__list-item">
				<a
					onClick={() =>
						linkTracking({
							linkType: 'List Heading',
							heading: list.title,
							headingUrl: list.title_url,
							headingIndex: index,
							label: list.title,
							url: list.title_url,
							listItemNumber: 0,
						})
					}
					className="nci-megamenu__list-item-link"
					href={list.title_url}
				>
					{list.title}
				</a>
				{itemsList}
			</li>
		</ul>
	);
};

export default CgdpMegaMenuList;
