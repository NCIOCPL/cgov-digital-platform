import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

export const useChipList = (chiplistName, handleUpdate) => {
  const [chips, setChips] = useState([])
  useEffect(() => {
    handleUpdate({
      target: {
        value: [...chips],
        name: chiplistName,
      },
    })
  }, [chips, chiplistName, handleUpdate]);
  const add = (item) => {
    //prevent dupes
    const newChips = [...chips, { label: item }];
    setChips([...new Set(newChips)]);
  };
  const remove = (item) => {
    let newChips = chips.filter((value) => {
      return value.label !== item;
    });
    console.log('newChips: ', newChips);
    setChips([...newChips]);
  };
  const list = useSelector(store => store.search[chiplistName]);

  return {
    list,
    add,
    remove
  }
}