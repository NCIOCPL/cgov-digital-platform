import React from 'react';
import PropTypes from 'prop-types';
import Utilities from '../../../utilities/utilities';
import InputLabel from '../InputLabel';
import './TextInput.scss';

class TextInput extends React.Component {
  static propTypes = {
    action: PropTypes.func,
    allowedChars: PropTypes.object,
    classes: PropTypes.string,
    disabled: PropTypes.bool,
    enableSpellCheck: PropTypes.bool,
    errorMessage: PropTypes.string,
    id: PropTypes.string.isRequired,
    inputHelpText: PropTypes.string,
    isValid: PropTypes.bool,
    label: PropTypes.string.isRequired,
    labelHidden: PropTypes.bool,
    labelHint: PropTypes.string,
    maxLength: PropTypes.number,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    placeHolder: PropTypes.string,
    required: PropTypes.bool,
    modified: PropTypes.bool,
    type: PropTypes.oneOf([
      'text',
      'email',
      'password',
      'search',
      'url',
      'date',
      'month',
      'tel',
      'week',
      'number',
    ]),
    validators: PropTypes.array,
    value: PropTypes.string,
  };

  static defaultProps = {
    action: () => {},
    classes: '',
    type: 'text',
    enableSpellCheck: false,
    required: false,
    modified: false,
    disabled: false,
  };

  constructor(props) {
    super(props);

    let pristine = true;
    if (this.props.value || this.props.errorMessage) {
      pristine = false;
    }

    this.state = {
      value: this.props.value || '',
      isPristine: pristine,
      isValid: this.props.isValid ? true : false,
      hasError: this.props.errorMessage ? true : false,
      errorMessageBody: this.props.errorMessage,
    };

    // Generate an HTML ID if one was not provided
    this.id = this.props.id || Utilities.uniqueIdForComponent();
  }

  componentDidUpdate(prevProps) {
    // If a errorMessage is passed after initial render, adjust the state accordingly
    if (prevProps.errorMessage !== this.props.errorMessage) {
      this.setState({
        isPristine: false,
        isValid: false,
        hasError: this.props.errorMessage !== '',
        errorMessageBody: this.props.errorMessage,
      });
    }
  }

  render() {
    let error,
      helpText,
      ariaLabel = null;
      
    if (this.state.hasError) {
      error = (
        <span className="cts-input__error-message" role="alert">
          {this.state.errorMessageBody}
        </span>
      );
    }
    if (this.props.inputHelpText) {
      helpText = (
        <span className="cts-input__help-text">{this.props.inputHelpText}</span>
      );
    }

    ariaLabel = this.props.labelHidden
      ? { 'aria-label': this.props.label }
      : { 'aria-labelledby': this.props.id + '-label' };

    return (
      <div className={`cts-input-group ${this.state.hasError? 'cts-input-group--error ' : ''}${this.props.classes}`}>
        {this.props.labelHidden ? null : (
          <InputLabel
            label={this.props.label}
            labelHint={this.props.labelHint}
            htmlFor={this.id}
            hasError={this.state.hasError}
            required={this.props.required} />
        )}
        {error}
        <input
          id={this.id}
          name={this.props.name || this.id}
          type={this.props.type}
          value={this.state.value}
          className={`cts-input ${this.state.hasError? 'cts-input--error ' : ''}${this.props.classes} ${
            (this.props.modified) ? 'cts-input--modified' : ''
          }`}
          required={this.props.required}
          maxLength={this.props.maxLength}
          placeholder={this.props.placeHolder}
          aria-required={this.props.required}
          disabled={this.props.disabled}
          onBlur={this._handleBlur.bind(this)}
          onChange={this._handleChange.bind(this)}
          spellCheck={this.props.enableSpellCheck ? true : false}
          {...ariaLabel}
        />
        {helpText}
      </div>
    );
  }

  _validate() {
    let validators = this.props.validators;
    // Check if field empty
    if (!this.state.value) {
      // If it's required, say so
      if (this.props.required) {
        this.setState({
          hasError: true,
          isValid: false,
          errorMessage: 'This field is required',
        });
      } else {
        // is empty so reset isValid and hasError
        this.setState({
          isValid: false,
          hasError: false,
          errorMessage: null,
        });
      }
    }
    // If validator(s) were sent as a prop, test them next
    else if (validators) {
      // eslint-disable-next-line
      for (let validator of validators) {
        // check is validator is forced 'no validation'
        if (!validator.pattern && !validator.isValid(this.state.value)) {
          this.setState({
            hasError: true,
            isValid: false,
            errorMessage: validator.message,
          });
          break;
        } else {
          this.setState({
            hasError: false,
            isValid: true,
          });
        }
      }
    }
    // must be required field with a value, so no error
    else {
      this.setState({
        hasError: false,
        errorMessage: null,
      });
    }
  }

  //  onBlur event on input
  _handleBlur() {
    if (
      (this.props.required || this.props.validators || this.props.onBlur) &&
      !this.state.isPristine
    ) {
      this._validate();
      this.props.onBlur();
    }
  }

  //  his function runs every time the user changes the contents of the input.
  //  @param {event} event The event
  _handleChange(event) {
    // Check if allowedChars validator exists. If it does, check the last char
    // entered against the validator. If validation fails, return thereby preventing
    // the value from being added to the state.
    if (this.props.allowedChars) {
      let input = event.target.value.slice(-1);
      if (!this.props.allowedChars.isValid(input)) {
        return;
      }
    }

    // Call action handler prop
    this.props.action(event);

    // Commit the input's value to state.value.
    this.setState({ value: event.target.value }, () => {
      // React docs suggest this callback should generally go in ComponentDidUpdate,
      // however since both this callback actions update the state, they must
      // go here because changing state in ComponentDidUpdate would cause a
      // recursive loop and blow up the call stack
      if (this.state.value && this.state.isPristine) {
        this.setState({ isPristine: false });
      }
      // if
      if (this.state.hasError || this.state.isValid) {
        this._validate();
      }
    });
  }
}

export default TextInput;
