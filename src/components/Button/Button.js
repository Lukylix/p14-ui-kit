import React from "react";
import PropTypes from "prop-types";

import styles from "./Button.css";

export default function Button({ children, ...args }) {
  return (
    <button className={styles.button} {...args}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
};

Button.defaultProps = {
  children: "Button",
};
