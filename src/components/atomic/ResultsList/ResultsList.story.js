import generateStories from '../../../../.storybook/generateStories';
import ResultsList from './ResultsList';

generateStories({
  component: { ResultsList },
  storyName: 'Elements | ResultsList',
  defaultProps: {
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
