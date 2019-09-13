import ReactDOM from 'react-dom';

let index = 0;

//  Provides utility functions for components in this library.
//
//  All the functions on this class should be defined as static functions so this
//  class acts more like a namespace than a class that you create instances of.
//
//  See each method's documentation for more infomation about what this class
//  provides.
export default class Utilities {
  //  Returns a unique identifier for the supplied component instance.
  //
  //  This method should only be called from `componentDidMount`.
  //
  //  This method attempts to re-use an existing unique ID (e.g. `data-reactid`)
  //  as much as possible.  If no such unique ID exists, it will generate a
  //  UUID to use for the component instance.
  //
  //  @param {React.Component} component The React component to compute a unique
  //                                     identifier for.
  //  @returns {String} A unique identifier for the supplied component.

  static uniqueIdForComponent(component) {
    let node = ReactDOM.findDOMNode(component); // eslint-disable-line react/no-find-dom-node
    if (node) {
      if (node.hasAttribute('data-reactid')) {
        return 'data-reactid-' + node.getAttribute('data-reactid');
      }
    }
    return `component-unique-id-${index++}`;
  }

  /**
   * A higher order function to handle key events. Especially useful in cases where you want multiple keys to
   * trigger the same event. Pass in the callback you want the keypress to trigger and an array
   * of keys (using either reserved keychar strings or the numeric keycode),
   * and get back out a wrapped version of your function to use as an eventListener callback that is
   * set to trigger only in cases where the keypress event is triggered by
   * one of the specified keys.
   *
   * Additional paramaters allow you to control the stopPropagation and preventDefault handling of the browser.
   * @param {Object} options
   * @param {function} [options.fn = () => {}]
   * @param {Array<Number|String>} [options.keys = []]
   * @param {boolean} [options.stopProp = false]
   * @param {boolean} [options.prevDef = false]
   * @return {function} A wrapped version of your function to pass to use as an eventListener callback
   */
  static keyHandler = (options = {}) => e => {
    if (typeof options !== 'object' || options === null) {
      return;
    }

    const {
      fn = () => {},
      keys = ['Enter', ' '],
      stopProp = true,
      prevDef = true,
    } = options;

    if (keys.indexOf(e.key) !== -1) {
      stopProp && e.stopPropagation();
      prevDef && e.preventDefault();
      return fn();
    }
  };
}
