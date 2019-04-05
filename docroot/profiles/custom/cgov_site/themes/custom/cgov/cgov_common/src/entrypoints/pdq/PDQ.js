// import $ from 'jquery';
import { getNodeArray } from 'Core/utilities/domManipulation';
import { lang } from 'Core/libraries/nciConfig/NCI.config';
import './PDQ.scss';

const language = document.documentElement.lang;

const onDOMContentLoaded = () => {
  // move health professional/patient toggle up to article head
  moveToggle();

  buildInThisSection(getNodeArray('#cgvBody .accordion > section'));

  citAnchorLinks();
}

document.addEventListener('DOMContentLoaded',onDOMContentLoaded);

/* TODO: create a field in the content type for 'hp-patient-toggle-link' */
const moveToggle = () => {
  const toggle = document.querySelector('#cgvBody .pdq-hp-patient-toggle');
  if(toggle) {
    const pageTitle = document.querySelector('#main h1');
    pageTitle.insertAdjacentElement('afterend',toggle);

  }
};

/* TODO: create an object or field on the content type that holds In This Section link structure */
const buildInThisSection = (sections) => {
  sections.map((section)=>{
    const headers = getNodeArray('h3, h4',section);
    
    // filter out "About This PDQ" section, sections with no h3's or h4's and sections with Key Points
    if(section.id !== '_AboutThis_1' && headers.length > 0 && !headers[0].id.match(/kpBox/)) {
      let nav = `<nav class="in-this-section role="navigation"><h6>${lang.InThisSection[language]}</h6><ul>`;
      headers.map((header,i) => {
        // check to see if we need to nest a new unordered list for h4's
        if( i !== 0 && headers[i-1].nodeName.toLowerCase() === 'h3' && header.nodeName.toLowerCase() === 'h4' ){
          nav += `<ul><li><a href="#${header.id}">${header.innerHTML}</a>`;
        } else {
          if(i === 0) {
            // this is the first item in the list
            nav += `<li><a href="#${header.id}">${header.innerHTML}</a>`;
          } else {
            // this is an h3 with a previous sibling of h3 or
            // this is an h4 with a previous sibling of h4
            nav += `</li><li><a href="#${header.id}">${header.innerHTML}</a>`;
          }
        }
        // next header is an h3 so close this nested list
        if (headers[i+1] && headers[i+1].nodeName.toLowerCase() === 'h3' && header.nodeName.toLowerCase() === 'h4') {
          nav += `</li></ul>`;
        }
      });
      nav += `</li></ul></nav>`;

      section.querySelector(".pdq-sections").insertAdjacentHTML('afterbegin',nav);
    }
  });
};

// fix citation anchor links
// if you see console errors that say something like: '#section_1.3 h2' is not a valid selector, they're coming from analytics.
const citAnchorLinks = () => {
  document.getElementById('cgvBody').addEventListener('click',(e)=>{
    if(e.target.hash && e.target.hash.match("#cit/")){
      e.preventDefault();
      const anchor = e.target.hash.replace("#cit/","");
      window.location.hash = anchor;
    }
  });
};