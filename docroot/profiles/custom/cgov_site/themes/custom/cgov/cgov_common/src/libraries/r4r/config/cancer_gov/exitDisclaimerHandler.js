/**
 * The exitDisclaimer script in ContentPage on CGov will only run on the initial page load. That means
 * once the user starts navigating r4r, none of the typical injection scripts will rerun. Certain functionality may need ]
 * to be manually retriggered, or replicated. In this particular case, for simplicity's sake, I have replicated the
 * exitDisclaimer script (with more limited functionality since there are less edge cases) and will subscribe it to location
 * changes in the eventHandler.
 */
export const exitDisclaimerInjector = () => {
  // Cleanup all old disclaimers (simple approach)
  const extantDisclaimers = document.querySelectorAll('.r4r-container .icon-exit-notification');
  // NOTE: IE11 does not support forEach on nodelists
  Array.from(extantDisclaimers).forEach(node => {
      node.parentNode.removeChild(node);
  });

  // Find all external links
  const allLinks = document.querySelectorAll('.r4r-container a');
  const externalLinks = Array.from(allLinks).filter(link => {
      return /^https?:\/\/([a-zA-Z0-9-]+\.)+/i.test(link.href)
              && !/^https?:\/\/([a-zA-Z0-9-]+\.)+gov/i.test(link.href)
                  && link.href !== "";
  })

  // Replicate the disclaimer used on CGOV
  const disclaimerLink = document.createElement('a');
  disclaimerLink.classList.add('icon-exit-notification');
  disclaimerLink.title = 'Exit Disclaimer';
  disclaimerLink.href = "/policies/linking";
  const innerSpan = document.createElement('span');
  innerSpan.classList.add('hidden');
  innerSpan.innerText = 'Exit Notification';
  disclaimerLink.appendChild(innerSpan);

  // Attach clones
  externalLinks.forEach(node => {
      node.parentNode.appendChild(disclaimerLink.cloneNode(true))
  });

  return externalLinks;
}

const triggerActions = [
  'LOAD NEW SEARCH RESULTS',
  'LOAD NEW FACET RESULTS',
  'LOAD RESOURCE',
  'PAGE NOT FOUND',
  'REGISTER ERROR',
]

// Listen for changes to the location and rerun the exitDisclaimerInjector
export const exitDisclaimerEventHandler = (events) => {
  if(events.some(({ type }) => triggerActions.includes(type))){
      setTimeout(() => {
          exitDisclaimerInjector();
      }, 100)
  }
}
