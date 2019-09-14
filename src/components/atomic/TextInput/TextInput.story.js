import generateStories from '../../../../.storybook/generateStories';
import TextInput from './TextInput';
import { text } from '@storybook/addon-knobs';

generateStories({
  component: { TextInput },
  storyName: 'Elements | TextInput',
  defaultProps: {
    id: 'mockid',
    label: 'Input Label',
    type: "text",
    placeHolder: 'placeholder text',
    required: false,
    labelHidden: false
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
