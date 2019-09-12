import React from 'react';
import { getDomElement, resetDom, setupDom } from '../testHelpers';
describe('testHelpers', () => {
  describe('getDomElement', () => {
    beforeEach(() => {
      setupDom();
    });
    afterEach(() => {
      resetDom();
    });
    it('returns a rendered element', () => {
      const element = getDomElement(<p>Ipsum lorem</p>);
      expect(element).toMatchSnapshot();
    });
    it('populates a rendered element in the DOM', () => {
      getDomElement(<p>Ipsum lorem</p>);
      expect(document.body).toMatchSnapshot();
    });
  });
  describe('setupDom', () => {
    it('renders a container element', () => {
      setupDom();
      expect(document.body).toMatchSnapshot();
    });
  });
  describe('resetDom', () => {
    it('removes container element from DOM', () => {
      resetDom();
      expect(document.body).toMatchSnapshot();
    });
  });
});
