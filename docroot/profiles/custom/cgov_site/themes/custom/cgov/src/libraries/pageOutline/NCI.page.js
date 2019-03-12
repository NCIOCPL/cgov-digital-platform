import $ from 'jquery';
import { lang as text } from 'Core/libraries/nciConfig/NCI.config';

/*======================================================================================================
* function page.makeOutline
*
*	will generate an autocomplete box for an <input type="text"> element, using jQuery UI
*
* returns:
*  outline                                    (object)         The outline that is generated
* parameters:
*  root[document.querySelector('article')]    (DOM element)    The DOM element describing the root of the outline to be created
*
*====================================================================================================*/
export function makeOutline(root) {
	/* Algorithm derived from WHATWG HTML spec 4.3.11.1: https://html.spec.whatwg.org/multipage/semantics.html#outlines */
	var currentOutlineTarget,
		currentSection,
		stack,
		REGEX_HEADING = '^H[1-6]|HGROUP$',
		REGEX_SECTIONINGCONTENT = '^ARTICLE|ASIDE|NAV|SECTION$',
		REGEX_SECTIONINGROOT = '^BLOCKQUOTE|BODY|DETAILS|DIALOG|FIELDSET|FIGURE|TD$';

	function Section(node) {
		// A section is a container that corresponds to some nodes in the original DOM tree.
		this.node = node;

		// Each section can have one heading associated with it,
		this.heading = undefined;

		// and can contain any number of further nested sections.
		this.sections = [];

		this.container = undefined;
	}
	Section.prototype.setHeading = function(heading) {
		// verify that the heading is either a valid Element or an implied heading
		if (heading instanceof Element || heading.implied) {
			this.heading = heading;
		} else {
			throw new TypeError(heading + ' must be an HTML element.');
		}
	};
	Section.prototype.append = function(section) {
		// if one section, and that section is a valid Section
		if (!section.length && section instanceof Section) {
			section.setContainer(this);
			this.sections.push(section);
		}
		// if multiple sections
		else if (section.length) {
			for (var i = 0, len = section.length; i < len; i++) {
				this.append(section[i]);
			}
		} else {
			throw new TypeError(section + ' must be a Section.');
		}
	};
	Section.prototype.setContainer = function(container) {
		// verify that the container is a valid Section
		if (container instanceof Section) {
			this.container = container;
		} else {
			throw new TypeError(container + ' must be a Section.');
		}
	};

	function Outline(outlineTarget, section) {
		// The outline for a sectioning content element or a sectioning root element
		this.node = outlineTarget.node;

		// consists of a list of one or more potentially nested sections.
		this.sections = [];
		this.append(section);
	}
	Outline.prototype.append = function(section) {
		// verify that the section is a valid Section
		if (section instanceof Section) {
			this.sections.push(section);
		} else {
			throw new TypeError(section + ' must be a Section.');
		}
	};
	Outline.prototype.getLastSection = function() {
		return this.sections[this.sections.length - 1];
	};

	function OutlineTarget(node) {
		this.node = node;

		this.outline = undefined;

		this.parentSection = undefined;
	}
	OutlineTarget.prototype.setOutline = function(outline) {
		// verify that the outline is a valid Outline
		if (outline instanceof Outline) {
			this.outline = outline;
		} else {
			throw new TypeError(outline + ' must be an Outline.');
		}
	};
	OutlineTarget.prototype.setParentSection = function(parentSection) {
		// verify that the parent section is a valid Section
		if (parentSection instanceof Section) {
			this.parentSection = parentSection;
		} else {
			throw new TypeError(parentSection + ' must be a Section.');
		}
	};

	function isHeadingContent(heading) {
		return (heading instanceof Element) && (new RegExp(REGEX_HEADING, 'i').test(heading.tagName));
	}

	function isSectioningRoot(sectioningRoot) {
		return (sectioningRoot instanceof Element) && (new RegExp(REGEX_SECTIONINGROOT, 'i').test(sectioningRoot.tagName));
	}

	function isSectioningContent(sectioningContent) {
		return (sectioningContent instanceof Element) && (new RegExp(REGEX_SECTIONINGCONTENT, 'i').test(sectioningContent.tagName));
	}

	function isHidden(hidden) {
		return (hidden instanceof Element) &&
			(
				hidden.hasAttribute('hidden') ||
				hidden.getAttribute('aria-hidden') === "true" ||
				hidden.hasAttribute('data-outline-hidden')
			);
	}

	function getRank(heading) {
		if (isHeadingContent(heading)) {
			var tagName = heading.tagName.toUpperCase();

			// if heading is <h1>-<h6>
			if (tagName !== "HGROUP") {
				return -parseInt(tagName.substr(1));
			}

			// if heading is <hgroup>
			for (var i = 1; i <= 6; i++) {
				var headings = heading.getElementsByTagName('H' + i);

				if (headings.length) {
					return -parseInt(headings[0].tagName.toUpperCase().substr(1));
				}
			}

			// if heading is an <hgroup> but with no headings; see https://html.spec.whatwg.org/#the-hgroup-element
			return -1;
		} else if (heading.implied) {
			return;
		} else {
			throw new TypeError(heading + ' must be a Heading.');
		}
	}

	function stackTopNode() {
		if (stack.length) {
			return stack[stack.length - 1].node;
		} else {
			return;
		}
	}

	// TODO: jQuery data associations
	/* function associate(node, section, heading) {
		$(node).data('nci-outline', {'section': section, 'heading': heading});
	} */

	function onEnter(node) {
		var stackTop = stackTopNode();

		// If the top of the stack is a heading content element or an element with a hidden attribute
		if (isHeadingContent(stackTop) || isHidden(stackTop)) {
			// Do nothing.
			return;
		}

		// When entering an element with a hidden attribute
		if (isHidden(node)) {
			// Push the element being entered onto the stack. (This causes the algorithm to skip that element and any descendants of the element.)
			stack.push({
				node: node
			});
			return;
		}

		// When entering a sectioning content element
		if (isSectioningContent(node)) {
			// If current outline target is not null
			if (currentOutlineTarget !== null) {
				// If the current section has no heading,
				if (!currentSection.heading) {
					// create an implied heading and let that be the heading for the current section.
					currentSection.setHeading({
						implied: true
					});
				}

				// Push current outline target onto the stack.
				stack.push(currentOutlineTarget);
			}

			// Let current outline target be the element that is being entered.
			currentOutlineTarget = new OutlineTarget(node);

			// Let current section be a newly created section for the current outline target element.
			// Associate current outline target with current section.
			currentSection = new Section(node);

			// Let there be a new outline for the new current outline target, initialised with just the new current section as the only section in the outline.
			currentOutlineTarget.setOutline(new Outline(currentOutlineTarget.node, currentSection));
			return;
		}

		// When entering a sectioning root element
		if (isSectioningRoot(node)) {
			// If current outline target is not null,
			if (currentOutlineTarget !== null) {
				// push current outline target onto the stack.
				stack.push(currentOutlineTarget);
			}

			// Let current outline target be the element that is being entered.
			currentOutlineTarget = new OutlineTarget(node);

			// Let current outline target's parent section be current section.
			// NOTE: if currentSection === null, the root for the tree was a sectioning root element
			//if(currentSection !== null) {
				currentOutlineTarget.setParentSection(currentSection);
			//}

			// Let current section be a newly created section for the current outline target element.
			currentSection = new Section(node);

			// Let there be a new outline for the new current outline target, initialised with just the new current section as the only section in the outline.
			currentOutlineTarget.setOutline(new Outline(currentOutlineTarget.node, currentSection));
			return;
		}

		// When entering a heading content element
		if (isHeadingContent(node)) {
			var newSection;

			// If the current section has no heading,
			if (!currentSection.heading) {
				// let the element being entered be the heading for the current section.
				currentSection.setHeading(node);
			}

			// Otherwise, if the element being entered has a rank equal to or higher than the heading of the last section of the outline of the current outline target, or if the heading of the last section of the outline of the current outline target is an implied heading,
			else if (getRank(node) >= getRank(currentOutlineTarget.outline.getLastSection().heading) || currentOutlineTarget.outline.getLastSection().heading.implied) {
				// then create a new section
				newSection = new Section(node);

				// and append it to the outline of the current outline target element, so that this new section is the new last section of that outline.
				currentOutlineTarget.outline.append(newSection);

				// Let current section be that new section.
				currentSection = newSection;

				// Let the element being entered be the new heading for the current section.
				currentSection.setHeading(node);
			}
			// Otherwise, run these substeps:
			else {
				// Let candidate section be current section.
				var candidateSection = currentSection;

				// Heading loop:
				do {
					// If the element being entered has a rank lower than the rank of the heading of the candidate section,
					if (getRank(node) < getRank(candidateSection.heading)) {
						// then create a new section,
						newSection = new Section(node);

						// and append it to candidate section. (This does not change which section is the last section in the outline.)
						candidateSection.append(newSection);

						// Let current section be this new section.
						currentSection = newSection;

						// Let the element being entered be the new heading for the current section.
						currentSection.setHeading(node);

						// Abort these substeps.
						break;
					}

					// Let new candidate section be the section that contains candidate section in the outline of current outline target.
					var newCandidateSection = candidateSection.container;

					// Let candidate section be new candidate section.
					candidateSection = newCandidateSection;
				}
				// Return to the step labeled heading loop.
				while (true);
			}

			// Push the element being entered onto the stack. (This causes the algorithm to skip any descendants of the element.)
			stack.push({
				node: node
			});
			return;
		}
	}

	function onExit(node) {
		var stackTop = stackTopNode();

		// When exiting an element, if that element is the element at the top of the stack
		if (stackTop === node) {
			// Pop that element from the stack
			stack.pop();
		}

		// If the top of the stack is a heading content element or an element with a hidden attribute
		else if (isHeadingContent(stackTop) || isHidden(stackTop)) {
			// Do nothing.
		}

		// When exiting a sectioning content element, if the stack is not empty
		else if (isSectioningContent(node) && stack.length > 0) {
			// If the current section has no heading,
			if (!currentSection.heading) {
				// create an implied heading and let that be the heading for the current section.
				currentSection.setHeading({
					implied: true
				});
			}

			var targetBeingExited = currentOutlineTarget;

			// Pop the top element from the stack, and let the current outline target be that element.
			currentOutlineTarget = stack.pop();

			// Let current section be the last section in the outline of the current outline target element.
			currentSection = currentOutlineTarget.outline.getLastSection();

			// Append the outline of the sectioning content element being exited to the current section. (This does not change which section is the last section in the outline.)
			currentSection.append(targetBeingExited.outline.sections);
		}

		// When exiting a sectioning root element, if the stack is not empty
		else if (isSectioningRoot(node) && stack.length > 0) {
			// If the current section has no heading,
			if (!currentSection.heading) {
				// create an implied heading and let that be the heading for the current section.
				currentSection.setHeading({
					implied: true
				});
			}

			// Let current section be current outline target's parent section.
			currentSection = currentOutlineTarget.parentSection;

			// Pop the top element from the stack, and let the current outline target be that element.
			currentOutlineTarget = stack.pop();
		}

		// When exiting a sectioning content element or a sectioning root element (when the stack is empty)
		else if (isSectioningContent(node) || isSectioningRoot(node)) {
			// Note: The current outline target is the element being exited, and it is the sectioning content element or a sectioning root element at the root of the subtree for which an outline is being generated.

			// If the current section has no heading,
			if (!currentSection.heading) {
				// create an implied heading and let that be the heading for the current section.
				currentSection.setHeading({
					implied: true
				});
			}

			// Skip to the next step in the overall set of steps. (The walk is over.)
		}

		// TODO: In addition, whenever the walk exits a node, after doing the steps above, if the node is not associated with a section yet, associate the node with the section current section.
		// TODO: Associate all non-element nodes that are in the subtree for which an outline is being created with the section with which their parent element is associated.
		// TODO: Associate all nodes in the subtree with the heading of the section with which they are associated, if any.
		/* associate(node, currentSection, currentSection.heading); */
	}

	function walk(root, enter, exit) {
		var node = root;
		start: while (node) {
			enter(node);
			if (node.firstChild) {
				node = node.firstChild;
				continue start;
			}
			while (node) {
				exit(node);
				if (node == root) {
					node = null;
				} else if (node.nextSibling) {
					node = node.nextSibling;
					continue start;
				} else {
					node = node.parentNode;
				}
			}
		}
	}

	function createOutline(node) {
		if (isSectioningContent(node) || isSectioningRoot(node)) {
			// Let current outline target be null. (It holds the element whose outline is being created.)
			currentOutlineTarget = null;
			// Let current section be null. (It holds a pointer to a section, so that elements in the DOM can all be associated with a section.)
			currentSection = null;
			// Create a stack to hold elements, which is used to handle nesting. Initialise this stack to empty.
			stack = [];

			// Walk over the DOM in tree order, starting with the sectioning content element or sectioning root element at the root of the subtree for which an outline is to be created
			walk(node, onEnter, onExit);

			return currentOutlineTarget.outline;
		} else {
			throw new TypeError(node + ' must be a sectioning content element or a sectioning root element.');
		}
	}

	return createOutline(root);
};

/*======================================================================================================
	* function parseOutline
	*
	* This recursive function can be used to parse the document outline created by NCI.page.makeOutline
	*
	* Returns: the parsed listed (as a <ul><li>...</li></ul> nested list)
	* Parameters:
	*  root[]        (Outline || Section)    The root of the outline
	*  depth[]       (Number)                The current parsing depth (as an integer), to be compared against maxDepth
	*  maxDepth[]    (Number)                The maximum depth of the outline that should be parsed
	*  ignore[]      (Object)                An object containing things that should be ignored -- note that children will also be ignored
	*    ignore.node[]       ([Array])         An array of node types
	*    ignore.heading[]    (Array)         An array of heading levels that should be ignored
	*
	*====================================================================================================*/
export function parseOutline(root, depth, maxDepth, ignore) {
	var sections = root.sections,
		len = sections && sections.length,
		node,
		heading,
		$list,
		$currentLi;

	// verify that we _need_ to make a new list -- this could probably be optimized pre-recursion
	if(len > 0 && depth <= maxDepth) {
		// make a new list
		$list = $('<ul>');

		for(var i = 0; i < len; i++) {
			// get the node (sectioning container) and heading
			node = sections[i].node;
			heading = sections[i].heading;

			// if we should ignore this heading or node type, continue the loop and try the next section
			if(ignore && ((ignore.node && $(node).is(ignore.node.join(','))) || (ignore.heading && $(heading).is(ignore.heading.join(',')))) || heading.implied) {
				continue;
			}

			// make a new LI,
			$currentLi = $('<li>').append(
				// with an anchor tag pointing to the heading ID (if defined) or the node ID (if defined), or generate a new ID for the heading and use that
				// NOTE: This does not explicitly follow WHATWG's spec of jumping for interactive tables of contents
				$('<a>').attr('href', '#' + (heading.id || node.id || $(heading).uniqueId().prop('id')))
					// set the HTML of the anchor tag to the heading's innerHTML
					// NOTE: '.html' should be used instead of '.text' for i18n reasons (and italicized headings [see ALCHEMIST], etc.)
					.html(heading.innerHTML)
			);

			if(node.hasAttribute('data-display-excludedevice')) {
				$currentLi.attr('data-display-excludedevice', node.getAttribute('data-display-excludedevice'));
			}

			$list.append($currentLi);

			// recurse, and append the UL generated by the children (if any exists)
			$currentLi.append(parseOutline(sections[i], depth + 1, maxDepth, ignore));
		}

		if($list.children().length > 0) {
			return $list;
		}
	}
};

export const lang = (function(lang) {
	if(lang.indexOf('es') === 0) {
		return 'es';
	} else {
		return 'en';
	}
})(document.documentElement.lang);

/*======================================================================================================
	* function buildOTP
	*
	* This function can be used to create an "On This Page" section on any content with a raw HTML or Ephox
	* body field.
	*
	* Returns: the built "On This Page" block
	* Parameters: null
	*
	*====================================================================================================*/
export function buildOTP() {

	var options = {
		class: "on-this-page hide-otp-on-collapse",
		placement: {
			insert: 'prependTo',
			to: '[data-otp-selector]'
		},
		ignore: {
			heading: ['h6', '.ignore-this h2', '.callout-box h3', '.callout-box-full h3', '.callout-box-left h3', '.callout-box-right h3', '.card-thumbnail h3', '.feature-card h3'],
			node: ['aside']
		},
		maxLevel: $('[data-otp-depth]')[0] ? $('[data-otp-depth]').data('otp-depth') : 1
	},

		$nav = $('<nav>').addClass(options.class).attr('role', "navigation")
			.append($('<h6>').text(text.OnThisPage[lang])),
		articleRoot = $('article').data('nci-outline').sections[0]
		;

	$nav.append(parseOutline(articleRoot, 1, options.maxLevel, options.ignore));

	$nav[options.placement.insert](options.placement.to);

	return $nav;
}
