import initializeSortableTables from 'sortabletables-js';

const hook = '[data-sortable]';

// To use this custom sort method add 'data-sortable-type="date"' to the appropriate <th/> column header
const date = (a, b, sortUp) => {
    const a_date = new Date(a);
    const b_date = new Date(b);
    if(a_date === b_date) {
        return 0;
    }

    if(sortUp){
        return a_date > b_date ? 1 : -1;
    }
    return b_date > a_date ? 1 : -1;
}

const customSortFunctions = {
    date,
};

const customSettings = {
    hook,
    customSortFunctions,
}

const sortablejs = () => {
    initializeSortableTables(customSettings);
}

export default sortablejs;