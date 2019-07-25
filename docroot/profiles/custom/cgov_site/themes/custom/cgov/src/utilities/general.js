// Other libraries are free to subscribe to realtime events
// but in its current state, only one listener can access cached events.
export const createEventHandler = (useCache = true) => {
  let isCaching = useCache;
  let eventQueue = [];
  let listeners = [];

  const onEvent = (...args) => {
      if(isCaching){
          eventQueue = [...eventQueue, args];
      }
      publish(args);
  }

  // This is a one time use. Once the cache is dumped it stops receiving new events.
  const dumpCache = listener => {
      isCaching = false;
      const queue = [ ...eventQueue ];
      eventQueue = [];
      queue.forEach(event => {
          listener(event);
      });
  }

  const publish = event => {
      listeners.forEach(listener => listener(event));
  }

  const subscribe = listener => {
      let isSubscribed = true;
      listeners = [...listeners, listener];

      const unsubscribe = () => {
          if(!isSubscribed){
              return;
          }

          isSubscribed = false;
          listeners = listeners.filter(list => list !== listener);
      }

      return unsubscribe;
  }

  const options = {
    onEvent,
    publish,
    subscribe,
  }

  if(useCache){
    options.dumpCache = dumpCache;
  }

  return options;
}
