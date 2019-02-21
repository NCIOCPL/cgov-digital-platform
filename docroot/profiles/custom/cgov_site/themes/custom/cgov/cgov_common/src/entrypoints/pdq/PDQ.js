import $ from 'jquery';
import './PDQ.scss';

const onDOMContentLoaded = () => {
    
    // move health professional/patient toggle up to article head
    $('.pdq-hp-patient-toggle').detach().insertAfter('h1');
}

document.addEventListener('DOMContentLoaded',onDOMContentLoaded);