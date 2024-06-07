import { legacyTrackOther } from 'Core/libraries/analytics/legacy-analytics-eddl-tracker';

describe('legacy-analytics-eddl-tracker', () => {
	afterEach(() => {
		delete (window as Partial<Window>).NCIDataLayer;
	});

	describe('legacyTrackOther', () => {
		it('should push an other event onto the EDDL with Props, Evars and Events set', () => {
			legacyTrackOther('testlinkname', 'testFunctionName', {
				Props: {
					11: 'dictionary_genetics',
					22: 'someString',
					24: 'anotherstring',
				},
				Evars: {
					11: 'dictionary_genetics',
					13: '+1',
					26: 'finalstring',
				},
				Events: [2],
			});
			expect(window.NCIDataLayer).toEqual([
				{
					type: 'Other',
					event: 'LegacyAnalytics:Other',
					linkName: 'testlinkname',
					data: {
						legacyFunction: 'testFunctionName',
						rawData: {
							props: {
								11: 'dictionary_genetics',
								22: 'someString',
								24: 'anotherstring',
							},
							eVars: {
								11: 'dictionary_genetics',
								13: '+1',
								26: 'finalstring',
							},
							events: [2],
						},
					},
				},
			]);
		});

		it('should push an other event onto the EDDL with only Props set', () => {
			legacyTrackOther('testlinkname', 'testFunctionName', {
				Props: {
					11: 'dictionary_genetics',
					22: 'someString',
					24: 'anotherstring',
				},
			});
			expect(window.NCIDataLayer).toEqual([
				{
					type: 'Other',
					event: 'LegacyAnalytics:Other',
					linkName: 'testlinkname',
					data: {
						legacyFunction: 'testFunctionName',
						rawData: {
							props: {
								11: 'dictionary_genetics',
								22: 'someString',
								24: 'anotherstring',
							},
							eVars: {},
							events: [],
						},
					},
				},
			]);
		});

		it('should push an other event onto the EDDL with only Evars set', () => {
			legacyTrackOther('testlinkname', 'testFunctionName', {
				Evars: {
					11: 'dictionary_genetics',
					13: '+1',
					26: 'finalstring',
				},
			});
			expect(window.NCIDataLayer).toEqual([
				{
					type: 'Other',
					event: 'LegacyAnalytics:Other',
					linkName: 'testlinkname',
					data: {
						legacyFunction: 'testFunctionName',
						rawData: {
							props: {},
							eVars: {
								11: 'dictionary_genetics',
								13: '+1',
								26: 'finalstring',
							},
							events: [],
						},
					},
				},
			]);
		});

		it('should push an other event onto the EDDL with only Events set', () => {
			legacyTrackOther('testlinkname', 'testFunctionName', {
				Events: [2],
			});
			expect(window.NCIDataLayer).toEqual([
				{
					type: 'Other',
					event: 'LegacyAnalytics:Other',
					linkName: 'testlinkname',
					data: {
						legacyFunction: 'testFunctionName',
						rawData: {
							props: {},
							eVars: {},
							events: [2],
						},
					},
				},
			]);
		});
	});
});
