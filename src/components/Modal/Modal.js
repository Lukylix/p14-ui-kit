import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { filterChildrenByType } from "../../utils";

import styles from "./Modal.css";

export function Modal({
  isVisible,
  setIsVisible,
  children,
  buttonProps: { onClick: onClickButton, ...buttonProps } = {},
  displayCloseButton = true,
  _type = "Modal",
  ...args
}) {
  return (
    <>
      {isVisible && (
        <div className={styles.modalContent} {...args}>
          {displayCloseButton && (
            <button
              className={styles.closeButton}
              {...buttonProps}
              onClick={() => setIsVisible?.(false) && onClickButton?.()}
            >
              x
            </button>
          )}
          {children}
        </div>
      )}
    </>
  );
}

Modal.propTypes = {
  children: PropTypes.node,
  _type: PropTypes.string,
};

Modal.defaultProps = {
  _type: "Modal",
  displayCloseButton: true,
};

export function ModalProvider({ children }) {
  const [modalChildren, otherChildren] = useMemo(() => filterChildrenByType(children, ["Modal"]), [children]);

  return (
    <>
      {modalChildren}
      {otherChildren}
    </>
  );
}
