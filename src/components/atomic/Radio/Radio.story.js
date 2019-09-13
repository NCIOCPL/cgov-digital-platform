import generateStories from '../../../../.storybook/generateStories';
import Radio from './Radio';

generateStories({
  component: { Radio },
  storyName: 'Elements | Radio',
  defaultProps: {
    id: 'storybook-radio',
    label: 'Example Radio',
    value: null,
    defaultChecked: false
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
