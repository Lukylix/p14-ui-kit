import React, { useMemo, useState, useRef, useEffect } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import PropTypes from "prop-types";

import ChevronDown from "../../assets/ChevronDown.svg";

import styles from "./Select.css";

export default function Select({
  options = [],
  onChange,
  value = "",
  styles: customStyles = {},
  name = "select",
  placeHolder = "Select...",
  isSearchable = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputLabel, setInputLabel] = useState(value);
  const fileredOptions = useMemo(() => {
    if (!isSearchable) return options;
    return options.filter((option) => option.label.toLowerCase().includes(inputLabel.toLowerCase()));
  }, [options, inputLabel, isSearchable]);

  useEffect(() => {
    const inputValue = options.find((option) => option.label === inputLabel)?.value;
    const valueLabel = options.find((option) => option.value === value)?.label;
    if (value !== inputValue) setInputLabel(valueLabel);
  }, [value]);

  const inputRef = useRef();
  const optionsRef = useRef();
  useOutsideClick([inputRef, optionsRef], () => setIsVisible(false));

  return (
    <div className={`${styles.select} ${isVisible ? styles.active : ""}`} styles={customStyles.container}>
      <input
        ref={inputRef}
        name={name}
        onClick={() => setIsVisible(true)}
        className={styles.input}
        value={inputLabel}
        placeholder={placeHolder}
        readOnly={!isSearchable}
        style={customStyles?.input}
        onChange={(e) => setInputLabel(e.target.value)}
      />
      <ChevronDown height="1em" />
      {isVisible && (
        <div ref={optionsRef} className={styles.selectOptions} style={customStyles.options}>
          {fileredOptions.map((option, index) => (
            <div
              key={index}
              className={styles.selectOption}
              style={customStyles.option}
              onClick={() => {
                setIsVisible(false);
                onChange?.(option?.value);
                setInputLabel(option?.label);
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
    container: PropTypes.object,
  }),
};
