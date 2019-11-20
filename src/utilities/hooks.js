import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deepSearchObject } from './utilities';
import axios from 'axios';

const queryString = require('query-string');

// Hooks to share common logic between multiple components

export const useCachedValues = cacheKeys => {
  const [currentVals, setCurrentVals] = useState({
    ...cacheKeys.map(key => ({ [key]: [] })),
  });
  const cache = useSelector(store => store.cache);
  useEffect(() => {
    const newVals = Object.assign(
      {},
      ...cacheKeys.map(key => {
        const result = deepSearchObject(key, cache);
        return { [key]: result[0] || [] };
      })
    );
    setCurrentVals(newVals);
  }, [cache]);
  return currentVals;
};

export const useChipList = (chiplistName, handleUpdate) => {
  const list = useSelector(store => store.form[chiplistName]);
  const [chips, setChips] = useState([]);
  useEffect(() => {
    handleUpdate(chiplistName, [...chips]);
  }, [chips, chiplistName, handleUpdate]);
  const add = item => {
    //prevent dupes
    const newChips = [...chips, { label: item }];
    setChips([...new Set(newChips)]);
  };
  const remove = item => {
    let newChips = chips.filter(value => {
      return value.label !== item;
    });
    setChips([...newChips]);
  };

  return {
    list,
    add,
    remove,
  };
};

// showing and hiding a react modal component
export const useModal = () => {
  const [isShowing, setIsShowing] = useState(false);
  function toggleModal() {
    setIsShowing(!isShowing);

    if (!isShowing) {
      document.getElementById('main-content').classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }
  return {
    isShowing,
    toggleModal,
  };
};


// fetches cache id for clinical trials print service
export const usePrintApi = (idList = {}, printAPIUrl = '') => {
  const [data, setData] = useState({ hits: [] });
  const [url, setUrl] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      const headers = {
        'Content-Type': 'application/json',
      };
      try {
        const result = await axios.post(url, idList, {
          headers: headers,
        });
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    if (url && url !== '') {
      fetchData();
    }
  }, [url]);

  const doPrint = () => {
    setUrl(printAPIUrl);
  };

  return [{ data, isLoading, isError, doPrint }];
};


