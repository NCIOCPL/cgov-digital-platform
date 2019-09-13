import generateStories from '../../../../.storybook/generateStories';
import Pager from './Pager';

generateStories({
  component: { Pager },
  storyName: 'Elements|Pager',
  defaultProps: {
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
