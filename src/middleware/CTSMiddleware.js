import { receiveData } from '../store/actions';
const queryString = require('query-string');

/**
 * This middleware serves two purposes (and could perhaps be broken into two pieces).
 * 1. To set up API requests with all the appropriate settings
 * 2. To handle the attendant responses and failures. Successful requests will need to be cached and then
 * sent to the store. Failures will need to be taken round back and shot.
 * @param {Object} services
 */
const createCTSMiddleware = services => ({
  dispatch,
  getState,
}) => next => async action => {
  next(action);

  if (action.type !== '@@api/CTS') {
    return;
  }
 
  const { service: serviceName, cacheKey, requests } = action.payload;
  const service = services[serviceName]();

  const getAllRequests = requests => {
    return Promise.all(
      requests.map(async request => {
        if (request.payload) {
          // get descendant data and map to cache based on maintype code

          const {
            requests: nestedRequests,
            cacheKey: nestedKey,
          } = request.payload;

          const nestedResponses = await getAllRequests(nestedRequests);

          return {
            [nestedKey]:
              nestedResponses.length > 1
                ? [
                    Object.assign(
                      {},
                      ...nestedResponses.map(res => ({ ...res }))
                    ),
                  ]
                : nestedResponses[0],
          };
        } else {
          const { method, requestParams, fetchHandlers } = request;
          const response =
            method === 'searchTrials'
              ? await service[method](...Object.values(requestParams))
              : await service[method](...Object.values(requestParams));
          let body = {};
          
          // if search results, add total and starting index
          if (response.terms) {
            body = response.terms;
          } else {
            body = response;
          }
          let formattedBody = body;

          if (fetchHandlers) {
            const { formatResponse } = fetchHandlers;
            formattedBody = formatResponse ? formatResponse(body) : body;
          }
          return formattedBody;
        }
      })
    );
  };

  if (service !== null && requests) {
    try {
      const results = await getAllRequests(requests);
      const valueToCache =
        requests.length > 1
          ? [Object.assign({}, ...results.map(result => ({ ...result })))]
          : results;
      dispatch(receiveData(cacheKey, ...valueToCache));
    } catch (err) {
      console.log(err);
    }
  }
};

export default createCTSMiddleware;
