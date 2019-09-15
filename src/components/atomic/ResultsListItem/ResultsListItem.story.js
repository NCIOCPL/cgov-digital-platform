import generateStories from '../../../../.storybook/generateStories';
import ResultsListItem from './ResultsListItem';

generateStories({
  component: { ResultsListItem },
  storyName: 'Elements | ResultsListItem',
  defaultProps: {
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
