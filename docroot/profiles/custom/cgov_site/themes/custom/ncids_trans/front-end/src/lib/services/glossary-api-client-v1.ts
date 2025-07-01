// // phpcs:disable
// // Make sure you delete the GlossaryServices from cgov/src/libraries
// // Also make sure you get rid of as much of popups as you can from cgov_common

// import axios from 'axios';

// let singletonInstance;

// class GlossaryApiClientV1 {

// 	/**
// 	 * Create a new instance of a Glossary API Client (v1)
// 	 *
// 	 * @param {axios} client an axiox client
// 	 */
// 	constructor(client) {
// 		this.client = client;
// 	}

const fetchData = async (dataUrl: string) => {
	const domainUrl = 'https://webapis.cancer.gov/glossary/v1';
	try {
		const response = await fetch(domainUrl + dataUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response; // Return the response object directly
	} catch (error) {
		console.error('Error fetching data:', error);
		throw new Error('Error Fetching Dictionary Data');
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
	dictionary: string,
	audience: string,
	language: string,
	name: string
) => {
	return fetchData(`/Terms/${dictionary}/${audience}/${language}/${name}`);
};

// 	/**
// 	 * Performs a get request to the API
// 	 * @param {string} actionUri the actions url
// 	 * @param {object} params any additional query params
// 	 */
// 	async getRequest(actionUri, params) {
// 		const res = await this.client.get(actionUri, { params });
// 		if (res.status === 200) {
// 			return res.data;
// 		} else {
// 			throw new Error(`Received ${res.status} code while fetching definition`);
// 		}
// 	}

// 	/**
// 	 * Gets an instance of the client using the CDEConfig's endpoint.
// 	 */
// 	static getDefaultInstance() {

// 		if (!singletonInstance) {
// 			const endpoint = window.CDEConfig.glossaryConfig.apiServer;
// 			if (!endpoint) {
// 				throw new Error("Glossary API Endpoint not set")
// 			}
// 			const client = axios.create({
// 				baseURL: endpoint.slice(-1) !== '/' ? endpoint + '/' : endpoint
// 			})

// 			singletonInstance = new GlossaryApiClientV1(client);
// 			Object.freeze(singletonInstance);
// 		}
// 		return singletonInstance;
// 	}
// }

// export default GlossaryApiClientV1;
