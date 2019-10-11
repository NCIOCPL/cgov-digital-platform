import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deepSearchObject } from './utilities';

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
  console.log(chiplistName + ' list: ' + JSON.stringify(list));
  const [chips, setChips] = useState([]);
  useEffect(() => {
    handleUpdate(chiplistName, [...chips]);
  }, [chips, chiplistName, handleUpdate]);
  const add = item => {
    //prevent dupes
    console.log(JSON.stringify(item));
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
