// File for fetching the dictionary definition of terms
import { GlossaryTerm } from './glossary-api-glossary-term';
declare global {
	interface CDEConfig {
		glossaryConfig?: {
			apiServer: string;
		};
	}
}

declare global {
	interface Window {
		/** The instance of the CDE config object. */
		CDEConfig: CDEConfig;
	}
}

// Fetch request
const fetchData = async (dataUrl: string) => {
	//const domainUrl = 'https://webapis.cancer.gov/glossary/v1';
	const domainUrl = window.CDEConfig?.glossaryConfig?.apiServer?.replace(
		/\/$/,
		''
	);

	// useFallback is added to every call made so I'm adding it here
	try {
		const fetchResponse = await fetch(
			domainUrl + dataUrl + '?useFallback=true'
		);
		if (!fetchResponse.ok) {
			throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
		}
		return fetchResponse;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw new Error(error as string);
	}
};

/**
 * Gets a term document by its ID.
 *
 * @param {string} dictionary the dictionary name
 * @param {string} audience 'Patient' or 'HealthProfessional'
 * @param {string} language The two char language code
 * @param {integer} id The term id
 * @param {boolean} useFallback If the term cannot be found with the dictionary & audience fallback to other audiences and dictionaries
 */
export const getTermById = async (
	dictionary: string,
	audience: string,
	language: string,
	id: string
): Promise<GlossaryTerm> => {
	const response = await fetchData(
		`/Terms/${dictionary}/${audience}/${language}/${id}`
	);
	const data = await response.json();
	return data;
};
