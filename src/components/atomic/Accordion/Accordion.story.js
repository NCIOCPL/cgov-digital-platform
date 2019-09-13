import React from 'react';
import generateStories from '../../../../.storybook/generateStories';
import Accordion from './Accordion';
import AccordionItem from './AccordionItem';

generateStories({
  component: { Accordion },
  storyName: 'Elements | Accordion',
  defaultProps: {
    bordered: false
  },
  defaultChildren: (
    <React.Fragment>
      <AccordionItem title="First Amendment" expanded>
        <p>Congress shall make no law respecting an establishment of ...</p>
      </AccordionItem>
      <AccordionItem>
        <span>Second Amendment</span>
        <p>A well regulated Militia, being necessary to the security ...</p>
      </AccordionItem>
    </React.Fragment>
  ),
  stories: [
    {
      name: 'default',
    },
  ],
});
