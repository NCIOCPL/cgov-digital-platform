export default {
	id: '1500001',
	langcode: 'en',
	label: 'Explore A',
	path: '/api-test/a',
	hasChildren: true,
	items: [
		{
			id: '1500002',
			langcode: 'en',
			label: 'A.1',
			path: '/api-test/a/1',
			hasChildren: true,
		},
		{
			id: '1500009',
			langcode: 'en',
			label: 'A.2',
			path: '/api-test/a/2',
			hasChildren: true,
		},
		{
			id: '1500014',
			langcode: 'en',
			label: 'A.3',
			path: '/api-test/a/3',
			hasChildren: true,
		},
		{
			id: '1500041',
			langcode: 'en',
			label: 'A.4',
			path: '/api-test/b/4/1',
			hasChildren: false,
		},
	],
	parent: {
		id: '1500000',
		langcode: 'en',
		label: 'Nav API Test Root',
		path: '/api-test',
		hasChildren: true,
	},
};
