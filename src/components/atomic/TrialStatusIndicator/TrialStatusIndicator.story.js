import generateStories from '../../../../.storybook/generateStories';
import TrialStatusIndicator from './TrialStatusIndicator';

generateStories({
  component: { TrialStatusIndicator },
  storyName: 'Elements | TrialStatusIndicator',
  defaultProps: {
  },
  stories: [
    {
      name: 'default'
    }
  ]
});
