const componentExists = require("../../utils/componentExists");

const componentPath = "../src/components";

module.exports = {
  description: "Add a component",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "What should this element component be called?",
      default: "My Element",
      validate: value => {
        if (/.+/.test(value)) {
          const path = `../${componentPath}`;
          return componentExists(value, path)
            ? "A component with this name already exists"
            : true;
        }

        return "The name is required";
      }
    },
    {
      type: "list",
      choices: ["stateless-functional", "class-based"],
      name: "type",
      message: "What type of React component?",
      default: "stateless-functional"
    }
  ],
  actions: () => [
    {
      type: "add",
      path: `${componentPath}/{{ properCase name }}/{{ properCase name }}.jsx`,
      templateFile: "./templates/component/element--{{ type }}.jsx.hbs",
      abortOnFail: true
    },
    {
      type: "add",
      path: `${componentPath}/{{ properCase name }}/index.jsx`,
      templateFile: "./templates/component/element-index.jsx.hbs",
      abortOnFail: true
    },
    {
      type: "add",
      path: `${componentPath}/{{ properCase name }}/{{ properCase name }}.scss`,
      templateFile: "./templates/component/element.scss.hbs",
      abortOnFail: true
    },
    {
      type: "add",
      path: `${componentPath}/{{ properCase name }}/__tests__/{{ properCase name }}.test.js`,
      templateFile: "./templates/component/element.test.js.hbs",
      abortOnFail: true
    }
  ]
};
