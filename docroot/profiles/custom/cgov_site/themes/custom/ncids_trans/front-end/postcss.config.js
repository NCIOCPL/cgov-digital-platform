module.exports = {
	plugins: [
		[
			'postcss-prefix-selector',
			{
				prefix: '.cgdpl',
				transform(prefix, selector, prefixedSelector, filepath) {
					console.log(filepath);
					if (filepath.match(/-legacy\.scss$/)) {
						return prefixedSelector;
					} else if (filepath.match(/r4r-app\/.*\.s?css$/)) {
						// Hack for legacy R4R app
						return prefixedSelector;
					}
					return selector;
				},
			},
		],
		['autoprefixer'],
	],
};
