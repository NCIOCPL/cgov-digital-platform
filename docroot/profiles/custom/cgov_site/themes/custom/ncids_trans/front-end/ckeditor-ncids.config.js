module.exports = {
	plugins: [
		[
			// The ckeditor css configured in the theme info applies to the entire
			// page with the change to CKEditor 5. We need to scope the css classes
			// to prevent CKEditor styles from leaking into the rest of the admin
			// site as CKEditor 5 no longer uses an iframe. It adds a prefix to all
			// selectors for the WYSIWYG editor to ensure that the styles are only
			// applied to elements within a .ck-content--ncids container.
			'postcss-prefix-selector',
			{
				prefix: '.ck-content--ncids',
				transform(prefix, selector, prefixedSelector, filepath) {
					if (filepath.match(/ckeditor-ncids\.scss$/)) {
						// Hack for ckeditor.
						if (selector.startsWith('.ck-content--ncids')) {
							return selector;
						} else if (selector.startsWith('.usa-prose')) {
							// In our modules, usa-prose is on the same element as .ck-content--ncids,
							// so we need to rewrite that selector to match both classes.
							return selector.replace(
								/^\.usa-prose/,
								'.ck-content--ncids.usa-prose'
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
