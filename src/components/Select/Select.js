import React, { useMemo, useState, useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import PropTypes from "prop-types";

import ChevronDown from "../../assets/ChevronDown.svg";

import styles from "./Select.css";

export default function Select({
  options = [],
  onChange = () => {},
  value = "",
  styles: customStyles = {},
  name = "select",
  placeHolder = "Select...",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const label = useMemo(() => options.find((option) => option.value === value)?.label || placeHolder, [options, value]);
  const inputRef = useRef();
  const optionsRef = useRef();
  useOutsideClick([inputRef, optionsRef], () => setIsVisible(false));

  return (
    <div className={`${styles.select} ${isVisible ? styles.active : ""}`}>
      <input
        ref={inputRef}
        name={name}
        onClick={() => setIsVisible(true)}
        className={styles.input}
        value={label}
        readOnly
        style={customStyles?.input}
      />
      <ChevronDown height="1em" />
      {isVisible && (
        <div ref={optionsRef} className={styles.selectOptions} style={customStyles.options}>
          {options.map((option, index) => (
            <div
              key={index}
              className={styles.selectOption}
              style={customStyles.option}
              onClick={() => {
                setIsVisible(false);
                onChange(option?.value);
              }}
            >
              {option?.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Select.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })),
  onChange: PropTypes.func,
  value: PropTypes.string,
  styles: PropTypes.shape({
    input: PropTypes.object,
    options: PropTypes.object,
    option: PropTypes.object,
  }),
};
