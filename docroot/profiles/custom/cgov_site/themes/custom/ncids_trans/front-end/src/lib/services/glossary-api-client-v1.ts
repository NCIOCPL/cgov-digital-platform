// File for fetching the dictionary definition of terms

// Fetch request
const fetchData = async (dataUrl: string) => {
	const domainUrl = 'https://webapis.cancer.gov/glossary/v1';
	try {
		// useFallback is added to every call made so I'm adding it here
		const response = await fetch(domainUrl + dataUrl + '?useFallback=true');
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response; // Return the response object directly
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
	dictionary: string | undefined,
	audience: string | undefined,
	language: string | undefined,
	id: string | undefined
) => {
	const response = await fetchData(
		`/Terms/${dictionary}/${audience}/${language}/${id}`
	);
	const data = await response.json();
	return data;
};

/**
 * Gets a term document by its pretty url name.
 *
 * @param {string} dictionary the dictionary name
 * @param {string} audience 'Patient' or 'HealthProfessional'
 * @param {string} language The two char language code
 * @param {string} name The term pretty url name
 * @param {boolean} useFallback If the term cannot be found with the dictionary & audience fallback to other audiences and dictionaries
 */
export const getTermByName = async (
	dictionary: string | undefined,
	audience: string | undefined,
	language: string | undefined,
	name: string | undefined
) => {
	const response = await fetchData(
		`/Terms/${dictionary}/${audience}/${language}/${name}`
	);
	const data = await response.json();
	return data;
};
