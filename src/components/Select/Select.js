import React, { useMemo, useState, useRef, useEffect } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import PropTypes from "prop-types";

import ChevronDown from "../../assets/ChevronDown.svg";

import styles from "./Select.css";
import { scrollCenterFromParent } from "../../utils/utils";

export default function Select({
  options = [],
  onChange,
  value = "",
  className = "",
  styles: customStyles = {},
  name = "select",
  id,
  placeHolder = "Select...",
  isSearchable = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputLabel, setInputLabel] = useState(options.find((option) => option.value === value)?.label || "");
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef();
  const optionsRef = useRef();
  const selectedRef = useRef();
  useOutsideClick([containerRef], (event) => {
    setIsVisible(false);
    setHoverIndex(null);
  });

  const fileredOptions = useMemo(() => {
    if (!isSearchable || !inputLabel) return options;
    return options.filter((option) => option.label.toLowerCase().includes(inputLabel.toLowerCase()));
  }, [options, inputLabel, isSearchable]);

  // Scroll to selected value on open
  useEffect(() => {
    (() => {
      if (!isVisible) return;
      scrollCenterFromParent(optionsRef, selectedRef);
    })();
  }, [isVisible, selectedRef]);

  useEffect(() => {
    (() => {
      const inputValue = options.find((option) => option.label === inputLabel)?.value;
      const valueLabel = options.find((option) => option.value === value)?.label;
      if (valueLabel === undefined) return;
      if (value !== inputValue) setInputLabel(valueLabel);
    })();
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
        onChange?.(fileredOptions[hoverIndex].value);
        setHoverIndex(null);
        setIsVisible(false);
        event.stopPropagation();
        break;
      case "Tab":
        if (hoverIndex !== null) {
          setInputLabel(fileredOptions[hoverIndex].label);
          onChange?.(fileredOptions[hoverIndex].value);
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
      ref={containerRef}
    >
      <input
        name={name}
        id={id}
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
                /* setTimeout necessary when using useClickOudide on parent component
                  useOutsideClick can only look for child nodes inside the dom
                  so we delay the deletion at the end of the call stack (0ms timeout)
                */
                setTimeout(() => setIsVisible(false), 0);
                setInputLabel(option?.label);
                onChange?.(option?.value);
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
  name: PropTypes.string,
  id: PropTypes.string,
  placeHolder: PropTypes.string,
  isSearchable: PropTypes.bool,
};
