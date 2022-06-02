import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";

import { filterChildrenByType } from "../../utils";

import styles from "./Modal.css";

const ModalContext = createContext();

export function ModalOpen({ children, onClick, ...args }) {
  const { setIsVisible } = useContext(ModalContext);
  return (
    <div style={{ width: "fit-content" }} {...args} onClick={() => setIsVisible(true) && onClick?.()}>
      {children}
    </div>
  );
}

Modal.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};

export function Modal({ children, buttonProps, displayCloseButton = true, _type = "Modal", ...args }) {
  const { isVisible, setIsVisible } = useContext(ModalContext);
  return (
    <>
      {isVisible && (
        <div className={styles.modalContent} {...args}>
          {displayCloseButton && (
            <button className={styles.closeButton} {...buttonProps} onClick={() => setIsVisible(false)}>
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

export function ModalProvider({ children, isVisible = false, setIsVisible = () => {}, onClose = () => {} }) {
  const [internalIsVisible, setInternalIsVisible] = useState(isVisible || false);

  useEffect(() => {
    if (isVisible !== undefined && isVisible !== internalIsVisible) setInternalIsVisible(isVisible);
  }, [isVisible]);

  const setIsVisibleBoth = (isVisible) => {
    setInternalIsVisible(isVisible);
    setIsVisible(isVisible);
    if (!isVisible) onClose();
  };

  const [modalChildren, otherChildren] = useMemo(() => filterChildrenByType(children, ["Modal"]), [children]);

  return (
    <ModalContext.Provider value={{ isVisible: internalIsVisible, setIsVisible: setIsVisibleBoth }}>
      {modalChildren}
      {otherChildren}
    </ModalContext.Provider>
  );
}
