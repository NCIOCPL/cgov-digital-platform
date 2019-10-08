import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './Modal.scss';

const Modal = ({ children, isShowing, hide }) => {
  const modalCloseRef = useRef(null);

  useEffect(() => {
    let closebtn = document.getElementById('modalCloseRef');
    if(closebtn){
      closebtn.focus();
    }
  }, [isShowing]);

  return isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <div className="cts-modal__overlay" onClick={hide}></div>
          <div
            className="cts-modal"
            role="dialog"
            tabIndex="-1"
            aria-describedby="cts-modal-body"
          >
            <div className="cts-modal__header">
              <button
                id="modalCloseRef"
                ref={modalCloseRef}
                type="button"
                className="modal-close-btn"
                aria-label="Close Dialog"
                onClick={hide}
              >
                <span className="close-icon" aria-hidden="true">
                  X
                </span>
              </button>
            </div>
            <div id="cts-modal-body" className="cts-modal__body">
              {children}
            </div>
          </div>
        </React.Fragment>,
        document.getElementById('modal-root')
      )
    : null;
};

Modal.propTypes = {
  children: PropTypes.node,
  isShowing: PropTypes.bool,
  hide: PropTypes.func,
};

Modal.defaultProps = {
  children: <></>,
  isShowing: false,
};

export default Modal;
