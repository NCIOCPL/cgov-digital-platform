/**
 * Defines a referece to a nav in the drupal nav api.
 */
type DrupalNavApiReference = {
	/** The cgov_site_section id of the root of the nav. */
	id: string;
	/** The type of menu, section-nav or mobile-nav */
	menu_type: string;
};

export default DrupalNavApiReference;
