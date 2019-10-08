import generateStories from '../../../../.storybook/generateStories';
import Modal from './Modal';

generateStories({
  component: { Modal },
  storyName: 'Elements | Modal',
  defaultProps: {
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
