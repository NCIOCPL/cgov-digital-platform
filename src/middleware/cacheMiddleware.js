const cacheMiddleware = ({ dispatch, getState }) => next => action => {
  next(action);

  if (action.type !== '@@cache/RETRIEVE') {
    return;
  }

  const { cacheKey } = action.payload;

  const store = getState();
  const cache = store.cache;
  // The cache will be empty on the first call (provided we haven't rehydrated from sessionStorage).
  if (cache != null) {
    // We want to see if there is a cached value. We cannot use a null test because we cache failed
    // responses as null to avoid future calls on the same value unnecessarily. Therefore, to test
    // whether a key has been cached or not, we check whether the key exists at all on the cached object.
    const cachedResults = cache[cacheKey];
    if (cachedResults) {
      dispatch({
        type: 'UPDATE_RESULTS',
        payload: {
          cacheKey,
        },
      });
      return;
    }
  }

  dispatch({
    ...action,
    type: '@@api/CTS',
  });
};

export default cacheMiddleware;
