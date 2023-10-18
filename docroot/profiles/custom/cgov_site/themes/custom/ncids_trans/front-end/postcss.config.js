const postcssPrefixSelector = require('postcss-prefix-selector');
module.exports = {

	plugins: [
    postcssPrefixSelector({
			prefix: '.cgdpl',
			transform(prefix, selector, prefixedSelector, filepath) {
				if (filepath.match(/-legacy\.scss$/)) {
					return prefixedSelector;
				} else if (filepath.match(/r4r-app\/.*\.s?css$/)) {
					// Hack for legacy R4R app
					return prefixedSelector;
				}
				return selector;
			},
    }),
    postcssPrefixSelector({
			prefix: '.ck-content',
			transform(prefix, selector, prefixedSelector, filepath) {
				if (filepath.match(/ckeditor\.scss$/)) {
					if (selector.startsWith('.ck-content')) {
						return selector;
					} else if (selector.startsWith('.contentzone ')) {
						return selector.replace(/^\.contentzone/, '.ck-content');
					} else if (selector.startsWith('table.table-default')) {
						return selector.replace(
							/^table\.table-default/,
							'.ck-content .table table.table-default'
						);
					}
					else if (selector.startsWith('table[data-sortable]')) {
						return selector.replace(
							/table\[data-sortable\]/,
							'.ck-content .table table[data-sortable]'
						);
					} else {
						return prefixedSelector;
					}
				}
				return selector;
			},
    }),
		['autoprefixer'],
  ],
};
