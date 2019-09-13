import React from 'react';
import generateStories from '../../../../.storybook/generateStories';
import Dropdown from './Dropdown';

generateStories({
  component: { Dropdown },
  storyName: 'Elements | Dropdown',
  defaultProps: {
    id: 'test-id',
    label: 'Example Dropdown Select Input',
    required: false,
    hasError: false,
    errorMessage: null,
    value: 'example-dropdown',
  },
  defaultChildren: (
    <>
      <option value="value1">Option A</option>
      <option value="value2">Option B</option>
      <option value="value3">Option C</option>
    </>
  ),
  stories: [
    {
      name: 'default',
    },
  ],
});
