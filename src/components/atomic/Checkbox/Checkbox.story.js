import generateStories from '../../../../.storybook/generateStories';
import Checkbox from './Checkbox';

generateStories({
  component: { Checkbox },
  storyName: 'Elements|Checkbox',
  defaultProps: {
    id: 'storybook-checkbox',
    label: 'Example Checkbox',
    value: null,
    name: 'storybook-checkbox'
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
