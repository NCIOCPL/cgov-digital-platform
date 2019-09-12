import React from 'react';
import PropTypes from 'prop-types';
import './Fieldset.scss';

//  As a convenience, passing a name property will give that name to each
//  Checkbox or radio button child so they will all be the same.
//  @returns {node} The rendered DOM node
//  @param {object} props  The props

const Fieldset = ({ legend, children, name, onChange, id, helpUrl }) => {
  if (name) {
    children = React.Children.map(children, child =>
      React.cloneElement(child, { name, onChange: onChange })
    );
  }

  return (
    <fieldset id={`fieldset--${id}`} className="cts-fieldset">
      <legend className="cts-fieldset__legend"><span>{legend}</span></legend>
      <a
        href={helpUrl}
        className="text-icon-help"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Help"
      >
        ?
      </a>
      <div className="cts-fieldset__body">
      {children}
      </div>
    </fieldset>
  );
};

Fieldset.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  legend: PropTypes.string.isRequired,
  helpUrl: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func
};

Fieldset.defaultProps = {
};

export default Fieldset;
