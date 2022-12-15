/** An item in the Mobile Menu Adapter's internal nav tree */
type AdapterTreeItem = {
	/** The id of the cgov site section */
	id: string;
	/** The parent id of this item */
	parentId: string | null;
	/** The label of the cgov site section */
	label: string;
	/** the path of the item */
	path: string;
	/**
	 * The language of the node.
	 * **This is not guaranteed to be the language.**
	 * */
	langcode: 'en' | 'es';
	/** The child nav items. This should always exist, but could be empty */
	children: AdapterTreeItem[];
};

export default AdapterTreeItem;
