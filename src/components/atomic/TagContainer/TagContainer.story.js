import React from 'react';
import generateStories from '../../../../.storybook/generateStories';
import TagContainer from './TagContainer';
import RemovableTag from '../RemovableTag';

generateStories({
  component: { TagContainer },
  storyName: 'Elements | TagContainer',
  defaultProps: {
  },
  defaultChildren: (
    <React.Fragment>
      <RemovableTag label="Blinotumomab" />
              <RemovableTag label="Bevacizumab" />
              <RemovableTag label="Anti-HER2 Antibody-drug Conjugate" />
              <RemovableTag label="Trastuzumab" />
              <RemovableTag label="Pentostatin" />
              <RemovableTag label="Cyclophosphamide" />
    </React.Fragment>
  ),
  stories: [
    {
      name: 'default'
    }
  ]
});
