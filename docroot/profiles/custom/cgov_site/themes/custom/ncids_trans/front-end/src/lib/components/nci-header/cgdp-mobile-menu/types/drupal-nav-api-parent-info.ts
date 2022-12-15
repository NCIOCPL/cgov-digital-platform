import DrupalApiNavItem from './drupal-nav-api-nav-item';
import DrupalNavInfo from './drupal-nav-api-reference';

/**
 * This is the information about the next nav to fetch for the nav from the API.
 */
type DrupalNavApiParentInfo = {
	closest_id_in_parent: string;
	parent_link_item: DrupalApiNavItem;
	parent_nav: DrupalNavInfo;
};

export default DrupalNavApiParentInfo;
