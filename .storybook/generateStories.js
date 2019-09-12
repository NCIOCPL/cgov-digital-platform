import React from 'react'
import { storiesOf } from '@storybook/react'
import { withA11y } from '@storybook/addon-a11y'
import { withInfo } from '@storybook/addon-info'
import { withKnobs, text, number, object, boolean } from '@storybook/addon-knobs'
import StoryRouter from 'storybook-react-router'

function generateStories(data) {
  const componentName = Object.keys(data.component)[0]
  const component = data.component[componentName]
  const storyName = data.storyName ? data.storyName : toTitleCase(componentName)
  const storybook = storiesOf(storyName, module)
  storybook.addDecorator(withA11y)
  storybook.addDecorator(withKnobs)
  storybook.addDecorator(StoryRouter())

  if (!data.stories) {
    data.stories = [
      {
        name: 'default',
      },
    ]
  }

  if (!data.infoSummary) {
    data.infoSummary = ''
  }

  data.stories.forEach(function (story) {
    generateStory(storybook, story, component, data)
  })
}

/* This is used to make the Info button adhere to color contrast standards */
const infoStyles = (stylesheet) => {
  return {
    ...stylesheet,
    button: {
      ...stylesheet.button,
      base: {
        ...stylesheet.button.base,
        background: '#155884',
        minWidth: '50px',
        textAlign: 'left',
      },
      topRight: {
        ...stylesheet.button.topRight,
        bottom: 0,
        borderRadius: '5px 0 0 0',
        top: 'initial',
      }
    },
  }
}

function generateStory(storybook, story, component, data) {
  storybook.add(story.name,
    withInfo({
      styles: infoStyles,
      text: data.infoSummary,
    })
      (() => {
        const props = generateStoryData(data.defaultProps, story.props)
        const children = getChildren(data.defaultChildren, story.children)
        const template = generateStoryTemplate(component, props, children)

        return template
      })
  )
}

function generateStoryTemplate(component, props, children) {
  return React.createElement(component, props, children)
}

function toTitleCase(str) {
  return str.replace(/([A-Z])/g, ' $1').trim()
}

function getChildren(defaultChildren, storyChildren) {
  if (storyChildren) {
    return storyChildren
  }
  return defaultChildren
}

function generateStoryData(defaultProps, storyProps) {
  const props = {
    ...defaultProps,
    ...storyProps,
  }

  return {
    ...generateKnobs(props),
  }
}

function generateKnobs(props) {
  if (!props) { return }

  const propKeys = Object.keys(props)
  return propKeys.reduce((acc, cur) => {
    const curValue = props[cur]

    const knobMethod = getKnobMethod(curValue)

    if (knobMethod) {
      acc[cur] = knobMethod(cur, curValue)
    }
    else {
      acc[cur] = curValue
    }

    return acc
  }, {})
}

// determines type of value and returns the corresponding function that knobs uses for it
function getKnobMethod(value) {
  switch (typeof value) {
    case 'boolean':
      return boolean
    case 'string':
      return text
    case 'number':
      return number
    case 'object':
      return object
    // while knobs does have an array type, it apparently doesn't work if your array contains objects.

    // switch (Object.prototype.toString.call(value)) {
    //   case '[object Object]':
    //     return object
    //   case '[object Array]':
    //     return array
    // }
    default:
      return false
  }
}

export default generateStories
