import generateStories from '../../../../.storybook/generateStories';
import Toggle from './Toggle';

generateStories({
  component: { Toggle },
  storyName: 'Elements | Toggle',
  defaultProps: {
    id: 'mockid',
    label: 'mockToggle',
    defaultChecked: false
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
