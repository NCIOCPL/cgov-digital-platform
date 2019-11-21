import React from 'react';
import PropTypes from 'prop-types';
import './Accordion.scss';

class Accordion extends React.Component {
  static propTypes = {
    bordered: PropTypes.bool,
    children: PropTypes.node,
    classes: PropTypes.string,
    startCollapsed: PropTypes.bool
  };

  static defaultProps = {
    bordered: false,
    classes: '',
    startCollapsed: false
  };

  constructor(props) {
    super(props);

    this.state = {
      activeIndex: props.startCollapsed ? -1 : 0,
    };
  }

  //  Before the component mounts, loop through the children to see if any of
  //  them have the `expanded` prop.  This allows consumers of this class to
  //  specify which specific item they want expanded when the component is
  //  rendered.
  //
  //  If no items have `expanded` passed as a prop, then the default behavior
  //  will take effect.
  //
  //  If more than one item has `expanded`, the last one wins and a console
  //  warning will be printed.
  _initialExpand() {
    let foundExpandedItem = false;
    let children = React.Children.toArray(this.props.children);
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (child.props.expanded) {
        if (foundExpandedItem) {
          console.warn(
            'Only one AccordionItem can be expanded at a time. You have marked more than one for expansion by default.'
          ); // eslint-disable-line no-console
        }
        this.setState({ activeIndex: i });
        foundExpandedItem = true;
      }
    }
  }
  //  Sets the active accordion item.
  //
  //  This method is assigned as the `action` of child {@link AccordionItem}
  //  components.  When the user clicks on a header of one of the accordion items,
  //  it will invoke this method with its index.  We can simply update our state,
  //  which will cause the children to be re-rendered so that the correct item
  //  has its content displayed.
  //
  //  To collapse all the items, pass -1 as the value.
  //
  //  @param {Number} index The item index that should be the active item.
  //
  componentDidMount() {
    this._initialExpand();
  }

  setActiveItem(index) {
    this.setState({ activeIndex: index });
  }

  render() {
    let index = 0;
    let children = React.Children.map(this.props.children, child => {
      let i = index++;
      return React.cloneElement(child, {
        accordionIndex: i,
        action: this.setActiveItem.bind(this),
        expanded: i === this.state.activeIndex,
      });
    });
    return (
      <div
        className={`cts-accordion ${
          this.props.bordered ? 'cts-accordion--bordered' : ''
        } ${this.props.classes}`}
      >
        {children}
      </div>
    );
  }
}

export default Accordion;
