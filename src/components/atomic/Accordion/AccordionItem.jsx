import React from 'react';
import PropTypes from 'prop-types';
import Utilities from '../../../utilities/utilities';

class AccordionItem extends React.Component {
  static propTypes = {
    accordionIndex: PropTypes.number,
    action: PropTypes.func,
    children: PropTypes.node,
    expanded: PropTypes.bool,
    titleCollapsed: PropTypes.string,
    titleExpanded: PropTypes.string
  };

  static defaultProps = {
    action: function() {},
    expanded: false,
    title: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      uuid: '',
    };
  }

  //  Generates a unique ID for this element using the {@link Utilities}
  //  function {@link uniqueIdForComponent}.
  //
  //  This must happen after the component has been mounted because the
  //  {@link uniqueIdForComponent} method will check to see if the DOM element
  //  has a `data-reactid` attribute and use that if present.  This helps keep
  //  continuity between what was rendered on the server and what the client
  //  sees.
  //
  //  After retrieving the appropriate unique ID, we set our state's `uuid`
  //  variable to that ID which will cause the component to re-render.

  componentDidMount() {
    let id = Utilities.uniqueIdForComponent(this);
    this.setState({ uuid: id });
  };

  //  Click handler for the title element.
  //
  //  This method calls the method defined in our `action` prop (usually set
  //  by the parent {@link Accordion} class) with our index to make ourselves
  //  the active element and show our content.
  //
  //  If this item is currently active, it will pass -1 as the value to the
  //  parent {@link Accordion} so that it will collapse the item.
  makeActive = () => {
    if (this.props.expanded) {
      this.props.action(-1);
    } else {
      this.props.action(this.props.accordionIndex);
    }
  };

  //  Renders the title element of this accordion item.
  //
  //  This element will act as a button and invoke our {@link makeActive}
  //  method whenever it is clicked.
  //
  //  See the class documentation for more information on how to supply the value
  //  for this element.
  //
  //  @returns {Node} The rendered DOM node.
  renderTitleElement() {
    let element;
    if (this.props.titleCollapsed.length > 0) {
      element = <span>{(this.props.expanded && this.props.titleExpanded)? this.props.titleExpanded : this.props.titleCollapsed}</span>;
    } else {
      if (React.Children.count(this.props.children) !== 2) {
        throw new Error('Either a title or 2 child elements must be supplied.');
      }
      let children = React.Children.toArray(this.props.children);
      element = children[0];
    }
    return (
      <h2 className="cts-accordion__heading" aria-expanded={this.props.expanded}>
        <button
          className="cts-accordion__button"
          aria-expanded={this.props.expanded}
          aria-controls={`${this.state.uuid}-content`}
          onClick={this.makeActive}
        >
          {element}
        </button>
      </h2>
    );
  };

  //  Renders our content element
  //
  //  @returns {Node} The rendered DOM node

  renderContentElement() {
    let children = React.Children.toArray(this.props.children);
    let element = children.length === 2 ? children[1] : children[0];
    return (
      <div
        id={`${this.state.uuid}-content`}
        className="cts-accordion__content"
        aria-hidden={!this.props.expanded}
      >
        {element}
      </div>
    );
  };

  render() {
    // Ensure there are only 2 children.
    if (React.Children.count(this.props.children) > 2) {
      throw new Error(
        'AccordionItem elements must have no more than 2 children.'
      );
    }

    return (
      <React.Fragment>
        {this.renderTitleElement()}
        {this.renderContentElement()}
      </React.Fragment>
    );
  };
}

export default AccordionItem;
