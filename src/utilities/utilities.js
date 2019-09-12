import ReactDOM from 'react-dom';
let index = 0;

export const uniqueIdForComponent = component => {
  let node = ReactDOM.findDOMNode(component); // eslint-disable-line react/no-find-dom-node
  if (node) {
    if (node.hasAttribute('data-reactid')) {
      return 'data-reactid-' + node.getAttribute('data-reactid');
    }
  }
  return `component-unique-id-${index++}`;
};
