import React, { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useOutsideClick from "../../hooks/useOutsideClick";

import { Select } from "../Select";
import ChevronLeft from "../../assets/ChevronLeft.svg";
import ChevronRight from "../../assets/ChevronRight.svg";

import styles from "./Datepicker.css";

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
      days.push({
        number: numberOfDaysInMonthBefore + i + 1,
        isCurrentMonth: false,
        month: month - 1 >= 0 ? month - 1 : 12,
        year: month - 1 >= 0 ? year : year - 1,
      });
    } else if (i >= numberOfDaysInMonth) {
      days.push({
        number: i - numberOfDaysInMonth + 1,
        isCurrentMonth: false,
        month: month + 1 <= 12 ? month + 1 : 1,
        year: month + 1 <= 12 ? year : year + 1,
      });
    } else {
      days.push({ number: i + 1, isCurrentMonth: true, month: month, year: year });
    }
  }
  return days;
};

const stylesSelect = {
  container: {
    width: "calc(50% - 1rem)",
    fontSize: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.25rem",
    fontSize: "0.8rem",
  },
  options: {
    fontSize: "0.8rem",
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
    totalDays: getNumberOfDaysInMonth(selected.getMonth(), selected.getFullYear()),
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
      setDaysTab(generateDaysTab(newViewDate.month, newViewDate.year));
      return newViewDate;
    });
  };

  const viewPreviousMonth = () => {
    setViewDate((viewDate) => {
      const newViewDate = {
        month: viewDate.month - 1 < 0 ? 11 : viewDate.month - 1,
        year: viewDate.month - 1 < 0 ? viewDate.year - 1 : viewDate.year,
      };
      setDaysTab(generateDaysTab(newViewDate.month, newViewDate.year));
      return newViewDate;
    });
  };

  const selectDay = (day) => {
    setIsVisible(false);
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

  const addZero = (number) => {
    return number < 10 ? `0${number}` : number;
  };

  const displayDate = () => {
    return `${addZero(selectedDate.date)}/${addZero(selectedDate.month + 1)}/${selectedDate.year}`;
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
          value={displayDate()}
          ref={inputRef}
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
          >
            <div
              className={`${styles.chevron} ${
                (datepickerProps?.className && `${datepickerProps?.className}__chevron`) || ""
              }`}
              onClick={viewPreviousMonth}
            >
              <ChevronLeft height="1.5rem" />
            </div>
            <Select
              options={selectMonthOptions}
              value={viewDate.month}
              onChange={(value) =>
                setViewDate((viewDate) => {
                  const newViewDate = { ...viewDate, month: value };
                  setDaysTab(generateDaysTab(newViewDate.month, newViewDate.year));
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
                  setDaysTab(generateDaysTab(newViewDate.month, newViewDate.year));
                  return newViewDate;
                })
              }
              styles={{ ...stylesSelect, container: { ...stylesSelect.container, width: "calc(4 * 1rem)" } }}
            />
            {/* <span>{`${monthLabels[viewDate.month]} ${viewDate.year}`}</span> */}
            <div
              className={`${styles.chevron} ${
                (datepickerProps?.className && `${datepickerProps?.className}__chevron`) || ""
              }`}
              onClick={viewNextMonth}
            >
              <ChevronRight height="1.5rem" />
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
          >
            {daysTab.map((day, i) => (
              <div
                onClick={() => selectDay(day)}
                className={
                  isSelectedDay(day)
                    ? `${styles.selectedDay} ${
                        (datepickerProps?.className && `${datepickerProps?.className}__selectedDay`) || ""
                      }`
                    : ""
                }
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
