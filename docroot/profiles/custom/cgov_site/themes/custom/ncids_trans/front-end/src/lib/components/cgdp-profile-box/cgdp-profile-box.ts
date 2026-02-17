import { trackOther } from '../../core/analytics/eddl-util';

/**
 * Enum for field type.
 */
enum FieldTypes {
	/** field_linkedin_handle */
	Linkedin = 'LinkedIn Profile Handle',
	/** field_twitter_handle */
	Twitter = 'Twitter Profile Handle',
	/** field_twitter_handle */
	Email = 'Email Address',
	/** field_scientific_publications */
	Publications = 'Publications............',
	/** Something was clicked we didn't expect. */
	Other = 'Other',
}

/**
 * Enum for the type of link.
 */
enum LinkTypes {
	/** For external links */
	External = 'External',
	/** For mailto links */
	Email = 'Email',
	/** For internal links (managed and unmanaged) */
	Internal = 'Internal',
	/** For any other link with a protocol */
	Other = 'Other',
}

/**
 * Tracks a language toggle click.
 * @param profileBoxType 'Biography' or 'Cancer Center'
 * @param profileBoxTitle Heading of profile box
 * @param profileField Type of profile field
 * @param linkType 'External' | 'Internal' | 'Email' | 'Other'
 */
const track = (
	profileBoxType: string,
	profileBoxTitle: string,
	profileField: string,
	linkType: string
) => {
	trackOther('Inner:ProfileBox:LinkClick', 'Inner:ProfileBox:LinkClick', {
		location: 'Body',
		componentType: 'Profile Box',
		profileBoxType: profileBoxType,
		profileBoxTitle: profileBoxTitle,
		profileField: profileField,
		linkType: linkType,
	});
};

/**
 * Click handler for link clicks.
 * @param evt the event.
 */
const linkClickHandler: EventListener = (evt: Event) => {
	const target = evt.currentTarget as HTMLElement;
	const profileBoxElement = target.closest('.cgdp-profile-box') as HTMLElement;
	const profileBoxType = getProfileBoxType(profileBoxElement);
	const profileBoxTitle = getProfileBoxHeading(profileBoxElement);
	const profileField = getProfileBoxField(target as HTMLAnchorElement);
	const linkType = getLinkType(target as HTMLAnchorElement);

	track(profileBoxType, profileBoxTitle, profileField, linkType);
};

/**
 * Gets Profile Box type from class.
 * @param profileBoxElement
 */
const getProfileBoxType = (profileBoxElement: HTMLElement): string => {
	const profileBoxType = profileBoxElement.classList.contains(
		'cgdp-profile-box--biography'
	)
		? 'Biography'
		: 'Cancer Center';

	return profileBoxType;
};

/**
 * Gets title from heading element.
 * @param profileBoxElement
 */
const getProfileBoxHeading = (profileBoxElement: HTMLElement): string => {
	const profileBoxHeading = profileBoxElement.querySelector(
		'.cgdp-profile-box__heading'
	) as HTMLElement;

	return !profileBoxHeading?.textContent
		? '_ERROR_'
		: profileBoxHeading.textContent.trim();
};

/**
 * Gets the label of the field of the link clicked.
 * @param link Link clicked.
 */
const getProfileBoxField = (link: HTMLAnchorElement): string => {
	// what's the best way to grab the field name?
	// const profileField = profileBoxElement.parentElement;

	switch (true) {
		case link.classList.contains('cgdp-profile-box__linkedin'):
			return FieldTypes.Linkedin;
		case link.classList.contains('cgdp-profile-box__twitter'):
			return FieldTypes.Twitter;
		case link.classList.contains('cgdp-profile-box__email'):
			return FieldTypes.Email;
		case link.classList.contains('cgdp-profile-box__publications'):
			return FieldTypes.Publications;
		default:
			return FieldTypes.Other;
	}
};

/**
 * Gets type of link: External, Internal, Email, or other.
 * @param link Link clicked.
 */
const getLinkType = (link: HTMLAnchorElement): string => {
	switch (link.protocol) {
		case 'http:':
		case 'https:': {
			if (link.hostname === window.location.hostname) {
				return LinkTypes.Internal;
			} else {
				return LinkTypes.External;
			}
		}
		case 'mailto:':
			return LinkTypes.Email;
		default:
			return LinkTypes.Other;
	}
};

/**
 * Wires up profile box for the cdgp requirements.
 */
const initialize = () => {
	const links = document.querySelectorAll('.cgdp-profile-box a');
	links.forEach((element: Node) => {
		const link = element as HTMLElement;
		link.addEventListener('click', linkClickHandler);
	});
};

export default initialize;
