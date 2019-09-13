import generateStories from '../../../../.storybook/generateStories';
import Pager from './Pager';

generateStories({
  component: { Pager },
  storyName: 'Elements|Pager',
  defaultProps: {
    data: [...Array(101).keys()],
    numberToShow: 10,
  },
  stories: [
    {
      name: 'default',
    },
  ],
});
