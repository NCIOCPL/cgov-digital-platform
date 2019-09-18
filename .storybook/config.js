import { configure } from "@storybook/react";

import '../src/__nci-dev__common.css';
import './storybook-shim.css';
import '../src/styles/main.scss';

function loadStories() {
  const projectReq = require.context("../src", true, /\.story\.js$/);
  projectReq.keys().forEach(filename => projectReq(filename));
}

configure(loadStories, module);
