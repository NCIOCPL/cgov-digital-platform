import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

import headerInit from '../nci-header';

describe('nci-header', () => {
	let consoleError: jest.SpyInstance;

	beforeEach(() => {
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
			return null;
		});
	});

	afterEach(() => {
		consoleError.mockRestore();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it('logs warning when there is no header', async () => {
		headerInit();
		expect(consoleError).toHaveBeenCalledWith(
			'Cannot find nci header element.'
		);
	});
});
