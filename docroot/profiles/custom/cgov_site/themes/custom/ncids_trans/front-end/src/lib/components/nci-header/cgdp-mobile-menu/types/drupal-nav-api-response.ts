import DrupalNavApiNavItem from './drupal-nav-api-nav-item';
import DrupalNavApiParentInfo from './drupal-nav-api-parent-info';

/**
 * This is the response returned by the nav API.
 */
type DrupalNavApiResponse = {
	/** The root nav item in the nav. (This is the whole tree) */
	nav: DrupalNavApiNavItem;
	/**
	 * The infomation of the next navigation above this one.
	 * NOTE: The API will return an empty array in the case of there not being
	 * a parent nav.
	 */
	parent_info: DrupalNavApiParentInfo | [];
};

export default DrupalNavApiResponse;
