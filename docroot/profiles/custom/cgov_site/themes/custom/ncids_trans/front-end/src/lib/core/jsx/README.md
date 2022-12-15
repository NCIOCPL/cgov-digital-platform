# Custom Cancer.gov Digital Platform JSX Pragma

## What is this monstrosity?
Its a crude form of Vanilla JSX support.

It provides basic JSX Pragma and PragmaFragment support to support Babel TSX transpilation. It should be able to handle basic attributes, as well as simple event handlers. Now it is not React, so don't expect reactivity. Meaning your event handlers should be used for things like handling click events for analytics, which is basically all we do on the frontend anyway.

Really it was a choice between handlebars or someother templating system and JSX. JSX is supported by Typescript/Babel and allows for event handlers. Most of the other templating engines are only for producing HTML elements. Oh and it is much smaller.

## How to Use
It is pretty simple:
1. Create a .tsx file.
2. Make the first line be `import CgdpJsx from '<some-path>/jsx'`
3. Make JSX

Simple Example:
```
import CgdpJsx from '<some-path>/jsx'

const doThing = () => {
	document.getElementById('thing');
	const element = <Thing prop1='chicken' />
}

type ThingProps = {
	prop1: string
}

const Thing: React.FunctionComponent<ThingProps> = ({prop1}) => {
	return (
		<div>{prop1}</div>
	);
}
```

## Some Gotchas

### Any event handler defined on an element will never be detatched and will become a zombie.
This is ok, because we are a static site and when you go to another page, everything is reloaded. However if you pretend like this is react and keep rebuilding the UX when people click on things, just remember that those event handers do not go away. So keep event handlers to things that are "simple" like analytics tracking. A simple show/hide is probably ok if you reuse the contents and don't try an recreate the DOM every show/hide.

### For intellesense we had to add @types/react. This is not react.
So `@types/react` supplies things like the typing for the JSX namespace, which is how Typescript interprets JSX as. JSX is actually pretty simple to understand what happens. `const myComponent = <div id="foo">hello world</div>` gets turned into `const myComponent = CgdpJsx.createElement('div', { id: 'foo' }, "hello world");` and CgdpJsx returns a type of HTMLElement.

From a typescript standpoint, `<div id="foo">hello world</div>` has a type of ReactElement. ReactElement != HTMLElement. ReactElement is actually an extension of JSXElementConstructor. See, while TS "knows" about things like JSXElementConstructor, it does not *KNOW* about them. It requires you to supply a type definition of all those types that something that handles JSX would use. Now we could go define everything, but React has already implemented all the JSX* types that are needed.

So this is good enough for a crude form of JSX support. The only gotcha is that if you want to convert a component to HTMLElement, you have to jump through a hoop. In the above example, `myComponent` can be casted by doing `const myHtmlElement = myComponent as unknown as HTMLElement`. Since we know `CgdpJsx.createElement` returns a HTML element, we know that it won't be an issue.

I have tried to setup the pragma functions such that they do not reference react, and your JS should not have to reference react either except for `React.FunctionComponent<T>` for your functional component definition. You just might see a lot of names with react in it in your intellesense.

### Testing
I mean, there are some tests, but there are sooo many attributes and whatnot. So you may encounter issues. This is really for those complicated components that are more than just adding a single element to the dom.

## What was done to make it work?
Well, this was more of a pain than just setting up the pragma functions.

* Package.json:
  * Added `@babel/plugin-transform-react-jsx`
	* Added `@types/react`
* Babel Config
  * Added JSX pragma to preset-typescript
	* Enabled `@babel/plugin-transform-react-jsx` plugin
	  * Added JSX pragma to plugin
* tsconfig
  * Added JSX pragma to config
