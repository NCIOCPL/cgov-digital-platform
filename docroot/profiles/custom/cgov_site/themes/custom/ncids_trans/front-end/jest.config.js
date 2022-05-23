const path = require('path');

const config = {
	verbose: true,
	preset: 'ts-jest',
	transform: {
		'^.+\\.(ts|tsx)?$': 'ts-jest',
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
	testMatch: ['**/?(*.)+(test).[t]s?(x)'],
	testEnvironment: 'jsdom',
	collectCoverage: true,
	collectCoverageFrom: [
		// NOTE: For now we are only collecting coverage for the new library
		// JS being made. There should be a lot less complaints about trying
		// to hit our coverage thresholds if it is only for new code.
		'src/lib/**/*.{js,jsx,ts,tsx}',
		'!src/**/*.test.{js,jsx,ts,tsx}',
		'!**/__tests__/**',
		'!src/**/*.d.ts',
		'!src/**/*.mock.ts',
		'!src/**/index.ts',
		'!src/index.ts',
	],
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 85,
			lines: 85,
		},
	},
	// We have to duplicate the WebPack aliases in here for Jest.
	moduleNameMapper: {
		"^Core/(.*)$": path.resolve(__dirname, '../../cgov/src' + '/$1'),
		"^Utilities/(.*)$": path.resolve(__dirname, '../../cgov/src/utilities' + '/$1'),
		"^Polyfills/(.*)$": path.resolve(__dirname, '../../cgov/src/polyfills' + '/$1'),
		// The only thing in styles is the sprite. So we can point this at our
		// local copy.
		"^Styles/(.*)$": path.resolve(__dirname, './src/styles' + '/$1'),
		"^Libraries/(.*)$": path.resolve(__dirname, '../../cgov/cgov_common/src/libraries' + '/$1'),
		// This is used to reference sprites.
		"^ImageDist/(.*)$": path.resolve(__dirname, "../dist/images" + '/$1'),
	}
};
module.exports = config;
