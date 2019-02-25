// import $ from 'jquery';
import { getNodeArray } from 'Core/utilities/domManipulation';
import './PDQ.scss';

const onDOMContentLoaded = () => {
  // move health professional/patient toggle up to article head
  moveToggle();

  buildInThisSection(getNodeArray('#cgvBody .accordion > section'));
}

document.addEventListener('DOMContentLoaded',onDOMContentLoaded);


const moveToggle = () => {
  const toggle = document.querySelector('.pdq-hp-patient-toggle', '#cgvBody');
  const pageTitle = document.querySelector('h1', '#main');
  pageTitle.insertAdjacentElement('afterend',toggle);
}

const buildInThisSection = (sections) => {
  sections.map((section)=>{
    const headers = getNodeArray('h3, h4',section);
    
    // filter out "About This PDQ" section, sections with no h3's or h4's and sections with Key Points
    if(section.id !== '_AboutThis_1' && headers.length > 0 && !headers[0].id.match(/kpBox/)) {
      let nav = `<nav class="in-this-section role="navigation"><h6>In This Section</h6><ul>`;
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

      section.firstElementChild.insertAdjacentHTML('afterend',nav);
    }
  });
}