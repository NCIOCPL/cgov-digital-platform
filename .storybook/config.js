import { configure } from "@storybook/react";

// import '../node_modules/react-uswds2/src/uswds/styles/uswds.scss';

function loadStories() {
  const projectReq = require.context("../src", true, /\.story\.js$/);
  projectReq.keys().forEach(filename => projectReq(filename));
}

configure(loadStories, module);
