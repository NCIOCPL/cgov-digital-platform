module.exports = {
	plugins: [
		[
			// The ckeditor css configured in the theme info applies to the entire
			// page with the change to CKEditor 5. We need to scope the css classes
			// to prevent CKEditor styles from leaking into the rest of the admin
			// site as CKEditor 5 no longer uses an iframe. It adds a prefix to all
			// selectors for the WYSIWYG editor to ensure that the styles are only
			// applied to elements within a .ck-content--legacy container.
			'postcss-prefix-selector',
			{
				prefix: '.ck-content--legacy',
				transform(prefix, selector, prefixedSelector, filepath) {
					if (filepath.match(/ckeditor-old-wysiwyg\.scss$/)) {
						// Hack for ckeditor.
						if (selector.startsWith('.ck-content')) {
							return selector;
						} else if (selector.startsWith('.contentzone ')) {
							return selector.replace(/^\.contentzone/, '.ck-content--legacy');
						} else if (selector.startsWith('table.table-default')) {
							return selector.replace(
								/^table\.table-default/,
								'.ck-content--legacy .table table.table-default'
							);
						} else if (selector.startsWith('table[data-sortable]')) {
							return selector.replace(
								/table\[data-sortable\]/,
								'.ck-content--legacy .table table[data-sortable]'
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
