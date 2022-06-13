import { trackOther } from '../eddl-util';

describe('eddl-util', () => {
	afterEach(() => {
		delete (window as Partial<Window>).NCIDataLayer;
	});

	describe('trackOther', () => {
		it('should instantiate a new array if NCIDataLayer does not exist', () => {
			trackOther('testEvent', 'testlinkname', {});
			expect(window.NCIDataLayer).toEqual([
				{
					type: 'Other',
					event: 'testEvent',
					linkName: 'testlinkname',
					data: {},
				},
			]);
		});
	});
});
