import React from 'react';
import { render, mount } from 'enzyme';
import Pager from '../Pager';

const defaultProps = {
  data: [...Array(55).keys()],
  startFromPage: 0,
  numberToShow: 10,
  callback: jest.fn(),
};

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(<Pager {...props} />);
  return component;
};

describe('Pager', () => {
  describe('Render', () => {
    it('should match a snapshot', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });

    // it('divides the total number of items with the number of items to show and renders one item for each division', () => {
    //   const component = setup(mount, defaultProps);
    //   const divisions = Math.ceil(defaultProps.data.length / defaultProps.numberToShow);
    //   expect(component.find('.pager__num')).toHaveLength(divisions);
    // });
  });

  describe('Logic', () => {
    it('should invoke the callback when a page number is clicked or pressed, returning a slice of the array', () => {
      const component = setup(mount, defaultProps);
      const startFromPageTwo = 1 * defaultProps.numberToShow;
      const slicedArray = defaultProps.data.slice(
        startFromPageTwo,
        startFromPageTwo + defaultProps.numberToShow
      );
      const pages = component.find('.pager__num');
      pages.at(1).simulate('click');
      expect(defaultProps.callback).toHaveBeenCalledWith(slicedArray);
    });
  });
});
