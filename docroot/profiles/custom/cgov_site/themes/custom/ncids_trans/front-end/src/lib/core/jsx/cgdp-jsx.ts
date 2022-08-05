/* ----------------------------------------------------------------------------
 * What is this monstrosity? It's a crude form of Vanilla JSX support.
 *
 * It provides basic JSX Pragma and PragmaFragment support to support Babel
 * TSX transpilation. It should be able to handle basic attributes, as well
 * as simple event handlers. Now it is not React, so don't expect reactivity.
 * Meaning your event handlers should be used for things like handling click
 * events for analytics, which is basically all we do on the frontend anyway.
 *
 * This might not work for certain attributes or elements. You might get some
 * weird TS typings as well. You also have to jump through a couple of casting
 * hoops to get TS to not complain. e.g.
 * const component = <MyComponent />;
 * document.appendChild(component as unknown as HTMLElement);
 * ------------------------------------------------------------------------- */

/**
 * Appends a child.
 * @param parent The parent
 * @param child The thing to add (can be an array);
 */
const appendChild = (parent: Node, child: Node | string) => {
	if (Array.isArray(child)) {
		child.forEach((nestedChild) => appendChild(parent, nestedChild));
	} else {
		parent.appendChild(
			typeof child === 'string' || child instanceof String
				? document.createTextNode(child as string)
				: child
		);
	}
};

type EventListener = (this: HTMLElement, event: Event) => unknown;

/**
 * JSX Props
 */
type JsxProps = {
	[key: string]: string | EventListener;
};

/**
 * JSX Child
 */
type JsxChild = Node | string;

/**
 * JSX Functional Components.
 */
type JsxFnComponent = (props: JsxProps, children: JsxChild[]) => HTMLElement;

/**
 * Splits "on" handlers
 * @param props
 * @returns
 */
const splitHandlersFromAttrs = (props: JsxProps) => {
	return Object.entries(props || {}).reduce(
		(ac, [name, value]) => {
			if (name.startsWith('on') && name.toLowerCase() in window) {
				return {
					...ac,
					handlers: {
						...ac.handlers,
						[name]: value,
					},
				};
			} else {
				return {
					...ac,
					attrs: {
						...ac.attrs,
						[name]: value,
					},
				};
			}
		},
		{
			handlers: {},
			attrs: {},
		}
	);
};

/**
 * Helper createElement function.
 * @param {string | JsxFnComponent} tag the name of the tag or a functional component
 * @param {JsxProps} props the props for this element
 * @param {JsxChild[]} children the child components
 */
export const createElement = (
	tag: string | JsxFnComponent,
	props: JsxProps,
	...children: JsxChild[]
): HTMLElement => {
	if (typeof tag === 'function') {
		return tag(props, children);
	}

	const splitProps = splitHandlersFromAttrs(props);

	const el = Object.assign(document.createElement(tag), splitProps.attrs);

	// Add event listeners.
	Object.entries(splitProps.handlers).forEach(([name, handler]) => {
		el.addEventListener(
			name.toLowerCase().substring(2),
			handler as EventListener
		);
	});

	for (const child of children) {
		appendChild(el, child);
	}
	return el;
};

/**
 * Creates a JSX Fragment
 * @param {JsxProps} props the props for this element
 * @param {JsxChild[]} children the child components
 */
export const Fragment = (
	props: JsxProps,
	...children: JsxChild[]
): (Node | string)[] => {
	return children;
};

export default {
	createElement,
	Fragment,
};
