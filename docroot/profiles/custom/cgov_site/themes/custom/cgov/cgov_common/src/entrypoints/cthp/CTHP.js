import './CTHP.scss';
import dropdownInjector from 'Libraries/cthpDropdown';
import patternInjector from 'Core/libraries/patternInjector';
import accordionSettings from 'Core/libraries/patternInjector/configs/cthp.js';

const onDOMContentLoaded = () => {
    dropdownInjector();
    patternInjector(accordionSettings);
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
