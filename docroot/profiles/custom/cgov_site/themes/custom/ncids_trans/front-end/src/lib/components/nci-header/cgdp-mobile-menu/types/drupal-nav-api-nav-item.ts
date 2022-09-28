/**
 * This is a navigation item as returned by the Nav API, USED by the mobile
 * menu adapter.
 */
type DrupalNavApiNavItem = {
	/** The id of the cgov site section */
	id: string;
	/** The label of the cgov site section */
	label: string;
	/** the path of the item */
	path: string;
	/** used for sorting. The smaller the number the higher the priority. */
	weight: string;
	/**
	 * The language of the node.
	 * **This is not guaranteed to be the language.**
	 * */
	langcode: 'en' | 'es';
	/** The child nav items. This should always exist, but could be empty */
	children: DrupalNavApiNavItem[];
};

export default DrupalNavApiNavItem;
