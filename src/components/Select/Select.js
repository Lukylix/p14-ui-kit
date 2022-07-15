import React, { useMemo, useState, useRef, useEffect } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import PropTypes from "prop-types";

import ChevronDown from "../../assets/ChevronDown.svg";

import styles from "./Select.css";

export default function Select({
  options = [],
  onChange,
  value = "",
  className = "",
  styles: customStyles = {},
  name = "select",
  placeHolder = "Select...",
  isSearchable = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputLabel, setInputLabel] = useState(value);
  const [hoverIndex, setHoverIndex] = useState(null);
  const inputRef = useRef();
  const optionsRef = useRef();
  const selectedRef = useRef();
  useOutsideClick([inputRef, optionsRef], () => setIsVisible(false) && setHoverIndex(null));

  const fileredOptions = useMemo(() => {
    if (!isSearchable || !inputLabel) return options;
    return options.filter((option) => option.label.toLowerCase().includes(inputLabel.toLowerCase()));
  }, [options, inputLabel, isSearchable]);

  // Scroll to selected value on open
  useEffect(() => {
    if (!isVisible) return;
    selectedRef?.current?.scrollIntoView({ block: "center" });
  }, [isVisible, selectedRef]);

  useEffect(() => {
    const inputValue = options.find((option) => option.label === inputLabel)?.value;
    const valueLabel = options.find((option) => option.value === value)?.label;
    if (inputValue !== undefined && value !== inputValue) setInputLabel(valueLabel);
  }, [value]);

  const handleKeyDown = (event) => {
    switch (event.code) {
      case "ArrowDown":
        if (hoverIndex === null) return setHoverIndex(0);
        setHoverIndex((prevHoverIndex) => (prevHoverIndex + 1 > fileredOptions.length - 1 ? 0 : prevHoverIndex + 1));
        break;
      case "ArrowUp":
        if (hoverIndex === null) return setHoverIndex(fileredOptions.length - 1);
        setHoverIndex((prevHoverIndex) => (prevHoverIndex - 1 < 0 ? fileredOptions.length - 1 : prevHoverIndex - 1));
        break;
      case "Enter":
        if (hoverIndex === null) setHoverIndex(0);

        setInputLabel(fileredOptions[hoverIndex].label);
        onChange(fileredOptions[hoverIndex].value);
        setHoverIndex(null);
        setIsVisible(false);
        event.stopPropagation();
        break;
      case "Tab":
        if (hoverIndex !== null) {
          setInputLabel(fileredOptions[hoverIndex].label);
          onChange(fileredOptions[hoverIndex].value);
          setHoverIndex(null);
        }
        setIsVisible(false);
        event.stopPropagation();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`${styles.select} ${className || ""} ${
        isVisible ? `${className && `${className}--active`} ${styles.active}` : ""
      }`}
      style={customStyles?.container}
    >
      <input
        ref={inputRef}
        name={name}
        onClick={() => setIsVisible(true)}
        onFocus={() => setIsVisible(true)}
        className={`${styles.input} ${className && `${className}__input`}`}
        value={inputLabel}
        placeholder={placeHolder}
        readOnly={!isSearchable}
        style={customStyles?.input}
        onChange={(e) => setInputLabel(e.target.value) && setHoverIndex(0)}
        onKeyDown={handleKeyDown}
      />
      <ChevronDown height="1em" />
      {isVisible && (
        <div
          ref={optionsRef}
          className={`${styles.selectOptions} ${className && `${className}__selectOptions`}`}
          style={customStyles?.options}
          onKeyDown={handleKeyDown}
        >
          {fileredOptions.map((option, index) => (
            <div
              key={index}
              className={`${styles.selectOption} ${className && `${className}__selectOption`} ${
                index === hoverIndex && `${styles.hover} ${className && `${className}__selectOption--hover`}`
              }`}
              style={customStyles?.option}
              ref={value === option.value ? selectedRef : null}
              onClick={() => {
                // Prevent useClickOutside from triggering
                setTimeout(() => {
                  setIsVisible(false);
                }, 0);

                onChange?.(option?.value);
                setInputLabel(option?.label);
                setHoverIndex(null);
              }}
              onMouseEnter={() => setHoverIndex(index)}
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
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  styles: PropTypes.shape({
    input: PropTypes.object,
    options: PropTypes.object,
    option: PropTypes.object,
    container: PropTypes.object,
  }),
};
