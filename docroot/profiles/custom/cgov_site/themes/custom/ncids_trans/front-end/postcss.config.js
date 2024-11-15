module.exports = {
	plugins: [
		[
			// This rule handles legacy CSS for the digital platform and adds a prefix
			// to all *-legacy.scss files to ensure that the styles are only applied to
			// elements within a .cgdpl container.
			//
			// Additionally, as it seems you can only use this plugin once, we also
			// have to handle the CKEditor styles here.  It adds a prefix to all selectors
			// for the WYSIWYG editor to ensure that the styles are only applied to
			// elements within a .ck-content container. This is necessary to prevent
			// CKEditor styles from leaking into the rest of the site after the
			// CKEditor 5 upgrade, which no longer uses an iframe.
			'postcss-prefix-selector',
			{
				prefix: '.cgdpl',
				transform(prefix, selector, prefixedSelector, filepath) {
					if (filepath.match(/-legacy\.scss$/)) {
						// Handle legacy CSS for the front-end
						return prefixedSelector;
					} else if (filepath.match(/r4r-app\/.*\.s?css$/)) {
						// Hack for legacy R4R app
						return prefixedSelector;
					} else if (filepath.match(/ckeditor\.scss$/)) {
						// Hack for ckeditor.
						if (selector.startsWith('.ck-content')) {
							return selector;
						} else if (selector.startsWith('.contentzone ')) {
							return selector.replace(/^\.contentzone/, '.ck-content');
						} else if (selector.startsWith('table.table-default')) {
							return selector.replace(
								/^table\.table-default/,
								'.ck-content .table table.table-default'
							);
						} else if (selector.startsWith('table[data-sortable]')) {
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
			},
		],
		['autoprefixer'],
	],
};
