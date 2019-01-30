# Custom Event Handler

## Summary
Use this to broadcast events to a global custom event handler. Subscribe listeners to the global handler rather than to the element generating the event itself.

## Broadcasting:
### broadcastCustomEvent(eventType: string, { node: HTMLElement, data: object })
Use the method broadcastCustomEvent inside event listener callbacks. The first argument should be the event type as a string (used by the global handler to lookup matching listeners) and the second argument an object with two properties: a) "node", which is the DOM Node the event was triggered on b) "data", an optional object containing any custom data to be used by listeners.

## Listening:
### registerCustomEventListener(eventType: string, eventListener: function)
### eventListener(eventType: string, { node: HTMLElement, data: object })
Register a custom listener to the global custom event handler. The first argument is a string that matches the event type from the broadcast method. The second argument is a callback that takes two arguments (which match the arguments passed to broadcastCustomEvent).

Use the customEventListener to do logic and formatting and to directly call core NCIAnalytics methods like ClickParams.

## Example:

```javascript
// animatedButton.js
import { broadcastCustomEvent } from 'Core/libraries/customEventHandler';

const animatedButton = document.querySelector('#animated-button');
const onClick = event => {
  event.target.classlist.toggle('active');
  broadcastCustomEvent('NCI.animated-button.click', {
    node: event.target,
    data: {
      currentState: event.target.classlist.indexOf('active') !== -1 ? 'active' : 'inactive'
    }
  });
}
animatedButton.addEventListener('click', onClick);
```

```javascript
// analytics.js
import { registerCustomEventListener } from 'Core/libraries/customEventHandler';
...
const animatedButtonClickAnayticsEvent = (target, data) => {
  const { currentState } = data;
  const clickParams = new NCIAnalytics.ClickParams(target, 'nciglobal', 'o', 'NCI.animated-button.click');
  clickParams.Events = [42];
  clickParams.Evars = {
    43: 'Animated Button'
  };
  clickParams.Props = {
    44: currentState,
  };
  clickParams.LogToOmniture();
};
registerCustomEventListener('NCI.animated-button.click', animatedButtonClickAnalyticsEvent);
...
```
