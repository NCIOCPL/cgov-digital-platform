import USATableSortable from '../../../usa-table';

let _initialized = false;

/**
 * Initialize sortable USA Tables
 */
const initialize = (): void => {
	if (!_initialized) {
		_initialized = true;
		USATableSortable.createAll();
	}
};
export default initialize;
