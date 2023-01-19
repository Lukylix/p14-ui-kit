import React, { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useOutsideClick from "../../hooks/useOutsideClick";

import { Select } from "../Select";
import ChevronLeft from "../../assets/ChevronLeft.svg";
import ChevronRight from "../../assets/ChevronRight.svg";

import styles from "./Datepicker.css";

/**
 * @param {number} start
 * @param {number} end
 * @returns {number[]} A array of numbers ranging from start to end
 */
const range = (start, end) => {
  const array = [];
  for (let i = start; i <= end; i++) {
    array.push(i);
  }
  return array;
};

const getNumberOfDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 *
 * @param {number} month
 * @param {number} year
 * @returns {{number: number, isCurrentMonth: boolean, month: number, year: number,}[]} An array of days infos needed to generate the desired tab
 */
const generateDaysTab = (month, year) => {
  let days = [];
  const numberOfDaysInMonth = getNumberOfDaysInMonth(month, year);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDayOfMonth = new Date(year, month, numberOfDaysInMonth).getDay();
  const numberOfDaysToAddBefore = firstDayOfMonth;
  const numberOfDaysToAddAfter = 6 - lastDayOfMonth;
  const numberOfDaysInMonthBefore = getNumberOfDaysInMonth(month - 1, year);
  for (let i = 0 - numberOfDaysToAddBefore; i < numberOfDaysInMonth + numberOfDaysToAddAfter; i++) {
    if (i < 0) {
      // Previous month days
      days.push({
        number: numberOfDaysInMonthBefore + i + 1,
        isCurrentMonth: false,
        month: month - 1 >= 0 ? month - 1 : 12,
        year: month - 1 >= 0 ? year : year - 1,
      });
    } else if (i >= numberOfDaysInMonth) {
      // Next month days
      days.push({
        number: i - numberOfDaysInMonth + 1,
        isCurrentMonth: false,
        month: month + 1 <= 12 ? month + 1 : 1,
        year: month + 1 <= 12 ? year : year + 1,
      });
    } else {
      // Current month days
      days.push({ number: i + 1, isCurrentMonth: true, month: month, year: year });
    }
  }
  return days;
};

const stylesSelect = {
  container: {
    fontSize: "0.70em",
    width: "100%",
  },
  input: {
    width: "100%",
  },
  options: {
    height: "200px",
  },
};

export default function Datepicker({
  dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  years: selectYearsOptionsProp = range(1900, new Date().getFullYear() + 100),
  inputProps = {},
  datepickerProps = {},
  selected = new Date(),
  onChange = () => {},
  customInput = null,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    date: selected.getDate(),
    month: selected.getMonth(),
    year: selected.getFullYear(),
  });
  const [viewDate, setViewDate] = useState({
    month: selectedDate.month,
    year: selectedDate.year,
  });

  const selectMonthOptions = useMemo(() => monthLabels.map((label, index) => ({ label, value: index })), [monthLabels]);
  const selectYearOptions = useMemo(
    () => selectYearsOptionsProp.map((year) => ({ label: year, value: year })),
    [selectYearsOptionsProp]
  );

  const [daysTab, setDaysTab] = useState(generateDaysTab(selectedDate.month, selectedDate.year));

  const datepickerBodyRef = useRef();
  const inputRef = useRef();
  useOutsideClick([datepickerBodyRef, inputRef], () => setIsVisible(false));

  const viewNextMonth = () => {
    setViewDate((viewDate) => {
      const newViewDate = {
        month: viewDate.month + 1 > 11 ? 0 : viewDate.month + 1,
        year: viewDate.month + 1 > 11 ? viewDate.year + 1 : viewDate.year,
      };
      const daysTab = generateDaysTab(newViewDate.month, newViewDate.year);
      // Prevent hover index being out of range
      if (hoverDayTabIndex > daysTab.length - 1) setHoverDayTabIndex(hoverDayTabIndex - 7);
      setDaysTab(daysTab);
      return newViewDate;
    });
  };

  const viewPreviousMonth = () => {
    setViewDate((viewDate) => {
      const newViewDate = {
        month: viewDate.month - 1 < 0 ? 11 : viewDate.month - 1,
        year: viewDate.month - 1 < 0 ? viewDate.year - 1 : viewDate.year,
      };
      const daysTab = generateDaysTab(newViewDate.month, newViewDate.year);
      // Prevent hover index being out of range
      if (hoverDayTabIndex > daysTab.length - 1) setHoverDayTabIndex(hoverDayTabIndex - 7);
      setDaysTab(daysTab);
      return newViewDate;
    });
  };

  const selectDay = (day) => {
    /* setTimeout necessary when using useClickOutside on parent component.
      useOutsideClick can only look for child nodes inside the dom
      so we delay the deletion at the end of the call stack (0ms timeout)
    */
    setTimeout(() => setIsVisible(false), 0);
    setSelectedDate({
      date: day.number,
      month: day.month,
      year: day.year,
      totalDays: getNumberOfDaysInMonth(day.month, day.year),
    });
    onChange(new Date(day.year, day.month, day.number));
  };

  const isSelectedDay = (day) => {
    return day.number === selectedDate.date && day.month === selectedDate.month && day.year === selectedDate.year;
  };

  const displayDate = () => {
    return new Date(selectedDate.year, selectedDate.month, selectedDate.date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleKeyDownHeader = (event) => {
    switch (event.code) {
      case "ArrowRight":
        viewNextMonth();
        break;
      case "ArrowLeft":
        viewPreviousMonth();
        break;
      default:
        break;
    }
  };

  const [hoverDayTabIndex, setHoverDayTabIndex] = useState(daysTab.findIndex((day) => isSelectedDay(day)));
  const handleKeyDownBody = (event) => {
    switch (event.code) {
      case "ArrowRight":
        if ((hoverDayTabIndex + 1) % 7 !== 0) return setHoverDayTabIndex(hoverDayTabIndex + 1);
        viewNextMonth();
        break;
      case "ArrowLeft":
        if (hoverDayTabIndex % 7 !== 0) return setHoverDayTabIndex(hoverDayTabIndex - 1);
        viewPreviousMonth();
        break;
      case "ArrowUp":
        if (hoverDayTabIndex - 7 >= 0) setHoverDayTabIndex(hoverDayTabIndex - 7);
        break;
      case "ArrowDown":
        if (hoverDayTabIndex + 7 < daysTab.length) setHoverDayTabIndex(hoverDayTabIndex + 7);
        break;
      case "Enter":
      case "Tab":
        if (hoverDayTabIndex < daysTab.length && hoverDayTabIndex > 0) selectDay(daysTab[hoverDayTabIndex]);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.datepicker}>
      {customInput ? (
        customInput.render({ value: displayDate(), onClick: () => setIsVisible(true) }, inputRef)
      ) : (
        <input
          type="text"
          className={styles.input}
          readOnly={true}
          {...inputProps}
          ref={inputRef}
          value={displayDate()}
          onFocus={() => {
            inputProps?.onFocus?.();
            setIsVisible(true);
            // Return view to selected date
            setViewDate({ year: selectedDate.year, month: selectedDate.month });
            setDaysTab(generateDaysTab(selectedDate.month, selectedDate.year));
          }}
          onClick={() => {
            inputProps?.onClick?.();
            setIsVisible(true);
            // Return view to selected date
            setViewDate({ year: selectedDate.year, month: selectedDate.month });
            setDaysTab(generateDaysTab(selectedDate.month, selectedDate.year));
          }}
        />
      )}

      {isVisible && (
        <div
          {...datepickerProps}
          className={`${styles.body} ${datepickerProps?.className || ""}`}
          ref={datepickerBodyRef}
        >
          <div
            className={`${styles.header} ${
              (datepickerProps?.className && `${datepickerProps?.className}__header`) || ""
            }`}
            tabIndex={0}
            onKeyDown={handleKeyDownHeader}
          >
            <div
              className={`${styles.chevron} ${
                (datepickerProps?.className && `${datepickerProps?.className}__chevron`) || ""
              }`}
              onClick={viewPreviousMonth}
            >
              <ChevronLeft height="1.5em" />
            </div>
            <Select
              options={selectMonthOptions}
              value={viewDate.month}
              onChange={(value) =>
                setViewDate((viewDate) => {
                  const newViewDate = { ...viewDate, month: value };
                  const daysTab = generateDaysTab(newViewDate.month, newViewDate.year);
                  if (hoverDayTabIndex > daysTab.length - 1) setHoverDayTabIndex(hoverDayTabIndex - 7);
                  setDaysTab(daysTab);
                  return newViewDate;
                })
              }
              styles={stylesSelect}
            />
            <Select
              options={selectYearOptions}
              value={viewDate.year}
              onChange={(value) =>
                setViewDate((viewDate) => {
                  const newViewDate = { ...viewDate, year: value };
                  const daysTab = generateDaysTab(newViewDate.month, newViewDate.year);
                  if (hoverDayTabIndex > daysTab.length - 1) setHoverDayTabIndex(hoverDayTabIndex - 7);
                  setDaysTab(daysTab);
                  return newViewDate;
                })
              }
              /** Width = (4 number + 1 chevron)ch + padding right + padding left */
              styles={{ ...stylesSelect, input: { ...stylesSelect.input, width: "calc(5ch + 0.5em  + 1.7em)" } }}
            />
            <div
              className={`${styles.chevron} ${
                (datepickerProps?.className && `${datepickerProps?.className}__chevron`) || ""
              }`}
              onClick={viewNextMonth}
            >
              <ChevronRight height="1.5em" />
            </div>
          </div>
          <div
            className={`${styles.dayLabels} ${
              (datepickerProps?.className && `${datepickerProps?.className}__dayLabels`) || ""
            }`}
          >
            {dayLabels.map((label, i) => (
              <div key={i}>{label}</div>
            ))}
          </div>
          <div
            className={`${styles.dayNumbers} ${
              (datepickerProps?.className && `${datepickerProps?.className}__dayNumbers`) || ""
            }`}
            tabIndex={0}
            onKeyDown={handleKeyDownBody}
          >
            {daysTab.map((day, i) => (
              <div
                onClick={() => selectDay(day)}
                className={
                  isSelectedDay(day)
                    ? `${styles.selectedDay} ${
                        (datepickerProps?.className && `${datepickerProps?.className}__selectedDay`) || ""
                      }`
                    : i === hoverDayTabIndex
                    ? `${styles.hoverDay} ${
                        (datepickerProps?.className && `${datepickerProps?.className}__hoverDay`) || ""
                      }`
                    : ""
                }
                onMouseEnter={() => setHoverDayTabIndex(i)}
                key={i}
              >
                {day.number}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const arrayOfLength = (expectedLength) => (props, propName, componentName) => {
  const arrayPropLength = props[propName].length;

  if (arrayPropLength !== expectedLength) {
    return new Error(
      `Invalid array length ${arrayPropLength} (expected ${expectedLength}) for prop ${propName} supplied to ${componentName}. Validation failed.`
    );
  }
};

Datepicker.propTypes = {
  dayLabels: arrayOfLength(7),
  monthLabels: arrayOfLength(12),
  years: PropTypes.arrayOf(PropTypes.number),
  inputProps: PropTypes.object,
  datepickerProps: PropTypes.object,
  selected: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
};

Datepicker.defaultProps = {
  dayLabels: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  monthLabels: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  inputProps: {},
  datepickerProps: {},
};
