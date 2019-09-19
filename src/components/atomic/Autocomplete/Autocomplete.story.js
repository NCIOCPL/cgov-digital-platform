import generateStories from '../../../../.storybook/generateStories';
import Autocomplete from './Autocomplete';

generateStories({
  component: { Autocomplete },
  storyName: 'Elements | Autocomplete',
  defaultProps: {
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
