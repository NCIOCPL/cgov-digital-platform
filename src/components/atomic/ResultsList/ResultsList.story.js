import generateStories from '../../../../.storybook/generateStories';
import ResultsList from './ResultsList';
import mockResults from '../../../mocks/mock-results.json';

generateStories({
  component: { ResultsList },
  storyName: 'Elements | ResultsList',
  defaultProps: {
    results: mockResults
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
