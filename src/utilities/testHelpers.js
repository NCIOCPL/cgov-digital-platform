import React from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';

export const TEST_ELEMENT_ID = 'test';

// renders an element in a test `document` and returns it.
export const getDomElement = element => {
  const instance = mount(<MemoryRouter>{element}</MemoryRouter>);
  const renderedElement = instance.getDOMNode();

  // Jest ships with `jsdom` which simulates a DOM environment. this environment
  // is cleared on every file run as each is its own thread... so, `document` will
  // reset per test file.
  document.getElementById(TEST_ELEMENT_ID).appendChild(renderedElement);

  return renderedElement;
};

// sets up a test DOM - a container to populate in tests.
export const setupDom = () => {
  document.body.innerHTML = `<div id="${TEST_ELEMENT_ID}"></div>`;
};

// restets a test DOM.
export const resetDom = () => {
  document.body.innerHTML = '';
};

export const renderWithRouter = (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {}
) => {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
};
