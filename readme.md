# Overview

p14-ui-kit is a library exporting 4 elements (3 components and 1 hook).  
Those 4 elements are related to the completion of the 14th OpenClassRooms project.

## Instalation

> npm install p14-ui-kit

or

> yarn add p14-ui-kit

## import

```js
import { useTable, Datepicker, ModalProvider, Modal, Select } from "p14-ui-kit";
```

# useTable

## Overview

`useTable` is a headless table utility not a table component.  
As such it doesn't provide any front-end so it perfectly fits into any application.

## QuickStart

`useTable` return a object containing everything you will need to build a table and intereact with it's state.

### Getting data

```jsx
const data = React.useMemo(
  () => [
    {
      score: 0.88037086,
      show: {
        name: "Snow",
        type: "Scripted",
        language: "English",
        genres: ["Comedy", "Family", "Fantasy"],
      },
    },
    {
      score: 0.65440583,
      show: {
        name: "Snow Queen",
        type: "Scripted",
        language: "English",
        genres: ["Adventure", "Family", "Fantasy"],
      },
    },
    {
      score: 0.64544654,
      show: {
        name: "Snow Lotus",
        type: "Scripted",
        language: "Korean",
        genres: ["Drama", "Fantasy", "Romance"],
      },
    },
    {
      score: 0.6404078,
      show: {
        name: "Snow White",
        type: "Scripted",
        language: "Korean",
        genres: ["Drama", "Comedy", "Romance"],
      },
    },
  ],
  []
);
```

### Define Columns

```jsx
const columns = React.useMemo(
  () => [
    {
      Header: "Score",
      accessor: "score",
    },
    {
      Header: "Name",
      accessor: "show.name",
    },
    {
      Header: "Type",
      accessor: "show.type",
    },
    {
      Header: "Language",
      accessor: "show.language",
    },
    {
      Header: "Genre(s)",
      accessor: "show.genres",
    },
  ],
  []
);
```

### Using the `useTable` hook

```js
const { headerGroups, rows } = useTable({ columns, data });
```

Table display :

```jsx
return (
  <table>
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th {...column.getHeaderProps()}>{column.header}</th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr {...row.getRowProps()}>
          {row.cells.map((cell) => {
            return <td {...cell.getCellProps()}>{cell.value}</td>;
          })}
        </tr>
      ))}
    </tbody>
  </table>
);
```

## Sorted Table

We keep the same data but we will add more definitions on columns and the useTable call.

`useTable` have build-in fonctions to sort numbers and string. For other type of data we can specify a sort function.  
In this exemples we will sort Genres by array length.

We could also specify a get function to change the display of the value for exemple we want "/" instead of the default "," array speration.

```jsx
const columns = React.useMemo(
  () => [
    {
      Header: "Score",
      accessor: "score",
    },
    {
      Header: "Name",
      accessor: "show.name",
    },
    {
      Header: "Type",
      accessor: "show.type",
    },
    {
      Header: "Language",
      accessor: "show.language",
    },
    {
      Header: "Genre(s)",
      accessor: "show.genres",
      sortFn: (a, b) => a.length - b.length,
      getFn: (array) => array.join("/"),
    },
  ],
  []
);
```

```js
const { headerGroups, rows, setSortBy } = useTable({ columns, data, useSortBy: true });
```

Notice we now have acces to `setSortBy` it can be used to sort one or multiple columns at once.  
It's accept an array of object containing the column accesor to be sorted with it's order.

Here is a exemple setting the `sortBy` property as an initial state for our table.  
(The table will be sorted by default).

```js
const { headerGroups, rows, setSortBy } = useTable({
  columns,
  data,
  useSortBy: true,
  initalState: { sortBy: [{ accessor: "show.genres", desc: false }] },
});
```

Now we can also use more props and data on our columns to display the sorting state and to sort a column on click.

```jsx
return (
  <table>
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th {...column.getHeaderProps()} {...column?.getSortByToggleProps()}>
              {column.header} <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr {...row.getRowProps()}>
          {row.cells.map((cell) => {
            return <td {...cell.getCellProps()}>{cell.value}</td>;
          })}
        </tr>
      ))}
    </tbody>
  </table>
);
```

## Table with pagination

We keep the same data but we will add one more definition on the useTable call.

```js
const {
  headerGroups,
  rows,
  // Pagination
  page,
  pageSize,
  pageCount,
  canPreviousPage,
  canNextPage,
  goToPage,
  previousPage,
  nextPage,
  setPageSize,
} = useTable({ columns, data: shows, usePagination: true });
```

Then we display the table with pagination.

```jsx
return (
  <>
    <table>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.header}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr {...row.getRowProps()}>
            {row.cells.map((cell) => {
              return <td {...cell.getCellProps()}>{cell.value}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
    <div className="pagination">
      <button onClick={() => goToPage(0)} disabled={!canPreviousPage}>
        {"<<"}
      </button>
      <button onClick={() => previousPage()} disabled={!canPreviousPage}>
        {"<"}
      </button>
      <button onClick={() => nextPage()} disabled={!canNextPage}>
        {">"}
      </button>
      <button onClick={() => goToPage(pageCount)} disabled={!canNextPage}>
        {">>"}
      </button>
      <span>
        Page{" "}
        <strong>
          {page} of {pageCount}
        </strong>
      </span>
      <span>
        | Go to page:{" "}
        <input
          type="number"
          defaultValue={page}
          onChange={(e) => goToPage(Number(e.target.value))}
          style={{ width: "100px" }}
        />
      </span> <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
        }}
      >
        {[1, 2, 5, 10, 20].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  </>
);
```

We can also specify the inital page and per page number to display.

```js
const {
  headerGroups,
  rows,
  // Pagination
  page,
  pageSize,
  pageCount,
  canPreviousPage,
  canNextPage,
  goToPage,
  previousPage,
  nextPage,
  setPageSize,
} = useTable({ columns, data: shows, usePagination: true, initalState: { page: { number: 1, size: 10 } } });
```

## Multiple headers layers

Columns definition also support nested layers of headers.

```jsx
const columns = React.useMemo(
  () => [
    {
      Header: "Score / Name",
      columns: [
        {
          Header: "Score",
          accessor: "score",
        },
        {
          Header: "Name",
          accessor: "show.name",
        },
      ],
    },
    {
      Header: "Type",
      accessor: "show.type",
    },
    {
      Header: "Language",
      accessor: "show.language",
    },
    {
      Header: "Genre(s)",
      accessor: "show.genres",
    },
  ],
  []
);
```

`useTable` will automaticly calculate colSpan and other props.  
So you can still use any of the previously given method of table rendering.

# Datepicker

The `Datepicker` component use by default a read only text input.
You can pass any props to this input but some will be erased like value, onFocus and onClick.

```jsx
return (
  <label htmlFor="date-of-birth">Date of Birth</label>
  <Datepicker inputProps={{ id: "date-of-birth", name: "date-of-birth" }} />
);
```

In this exemple we can retrive the Datepicker value like any other input inside a form (using formData for exemple).

## Controlled

You can also use this datePicker like a controlled input by using onChange and selected prop.

```jsx
const [dateOfBirth, setDateOfBirth] = React.useState(new Date());
return (
  <label htmlFor="date-of-birth">Date of Birth</label>
  <Datepicker selected={dateOfBirth} onChange={setDateOfBirth} inputProps={{ id: "date-of-birth", name: "date-of-birth" }} />
);
```

## Changing labels

```js
const dayLabels = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
const monthLabels = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
```

```jsx
return (
  <label htmlFor="date-of-birth">Date of Birth</label>
  <Datepicker dayLabels={dayLabels} motnhLabels={monthLabels} inputProps={{ id: "date-of-birth", name: "date-of-birth" }} />
);
```

## Specify selectable years

```js
const years = [1998, 1999, 2000];
```

For big ranges you can also create a function.

```js
const range = (start, end) => {
  const array = [];
  for (let i = start; i <= end; i++) {
    array.push(i);
  }
  return array;
};
const years = range(1998, 2050);
```

```jsx
return (
  <label htmlFor="date-of-birth">Date of Birth</label>
  <Datepicker years={years} inputProps={{ id: "date-of-birth", name: "date-of-birth" }} />
);
```

## Custom Input

Custom input can be any html element.  
If you want to learn more about `forwardRef` here is the [React Documentation](https://reactjs.org/docs/forwarding-refs.html).

```jsx
const customInput = React.forwardRef(({ value, ...props }, ref) => (
  <button {...props} ref={ref}>
    {value}
  </button>
));
```

```jsx
return (
  <label htmlFor="date-of-birth">Date of Birth</label>
  <Datepicker customInput={customInput} inputProps={{ id: "date-of-birth", name: "date-of-birth" }} />
);
```

## Styling

You can style the input and the date picker by using `inputProps` and `datepickerProps` respectively.

### Input

You can pass the `style prop` to the input to modify the default style or you can erase it by specifying a `className`.

```jsx
return (
  <label htmlFor="date-of-birth">Date of Birth</label>
  <Datepicker inputProps={{ id: "date-of-birth", name: "date-of-birth" , style : {}, className: "Custom input"}} />
);
```

### Datepicker

The recommended way to style the datepciker is by specifying a `className`, this className is used as a base to create childrens classNames.
Here is a list of generated classNames using `datepicker` as a start.

```
datepicker
datepicker__header
datepicker__chevron
datepicker__dayLabels
datepicker__dayNumbers
datepicker__selectedDay
datepicker__hoverDay
```

```jsx
return (
  <label htmlFor="date-of-birth">Date of Birth</label>
  <Datepicker datepickerProps={{ className: "datepicker" }} inputProps={{ id: "date-of-birth", name: "date-of-birth" }} />
);
```

# Select

The `Select` component use text input as such id and name props are recommended.

First we create a options composed of values and labels.

```js
const options = [
  {
    label: "Alabama",
    value: "AL",
  },
  {
    label: "Alaska",
    value: "AK",
  },
  {
    label: "American Samoa",
    value: "AS",
  },
  {
    label: "Arizona",
    value: "AZ",
  },
];
```

The recommended way to use `Select` is like a controlled input, it help getting the value instead of the label.

```jsx
const [selectedState, setSelectedState] = useState("");
return (
  <>
    <label htmlFor="state">State</label>
    <Select id="state" name="state" options={states} value={selectedState} onChange={setSelectedState} />
  </>
);
```

## Seachable input

You can make a input searchable by passing `isSearchable` prop.

```jsx
const [selectedState, setSelectedState] = useState("");
return (
  <>
    <label htmlFor="state">State</label>
    <Select isSearchable id="state" name="state" options={states} value={selectedState} onChange={setSelectedState} />
  </>
);
```

## Placeholder

By default the placeholder is "Select..." you can change it by using the `placeHolder` prop.

```jsx
const [selectedState, setSelectedState] = useState("");
return (
  <>
    <label htmlFor="state">State</label>
    <Select
      placeHolder="Select state..."
      id="state"
      name="state"
      options={states}
      value={selectedState}
      onChange={setSelectedState}
    />
  </>
);
```

## Styling

### ClassName

You can pass your `className` as a `prop`, this className is used as a base to create childrens classNames.
Here is a list of generated classNames using `select` as a start.

```
select
select--active
select__input
select__selectOptions
select__selectOption
select__selectOption--hover
```

```jsx
const [selectedState, setSelectedState] = useState("");
return (
  <>
    <label htmlFor="state">State</label>
    <Select
      id="state"
      name="state"
      className="select"
      options={states}
      value={selectedState}
      onChange={setSelectedState}
    />
  </>
);
```

### Style object

You can also pass a styles object that will be dispached to coresponding child elements.  
Here is the structure of this object:

```js
const styles = {
  container: {},
  input: {},
  options: {},
  option: {},
};
```

# Modal

The modal component need a parent `ModalProvider` to be used, this provider will reorder elements and put any children modal to the top.

```jsx
const [isVisible, setIsVisible] = useState(false);
return (
  <ModalProvider>
    <h1>A nice title</h1>
    <button onClick={() => setIsVisible(true)}>Open Modal</button>
    <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
      <h1>Modal Content</h1>
    </Modal>
  </ModalProvider>
);
```

So the modal and it's content will be first in the dom then the tittle and button will follow.

## Close button

The default close button can be hidden by using `displayCloseButton` prop then you can implement your own button and styles.

```jsx
const [isVisible, setIsVisible] = useState(false);
return (
  <ModalProvider>
    <h1>A nice title</h1>
    <button onClick={() => setIsVisible(true)}>Open Modal</button>
    <Modal isVisible={isVisible} displayCloseButton={false}>
      <button onClick={() => setIsVisible(false)}>&times;</button>
      <h1>Modal Content</h1>
    </Modal>
  </ModalProvider>
);
```

You can also keep the default close button and modify is style and behavior by passing the `buttonProps` prop.

```jsx
const [isVisible, setIsVisible] = useState(false);
return (
  <ModalProvider>
    <h1>A nice title</h1>
    <button onClick={() => setIsVisible(true)}>Open Modal</button>
    <Modal
      isVisible={isVisible}
      buttonProps={{ onClick: () => console.log("button clicked"), className: "closeModalButton" }}
    >
      <h1>Modal Content</h1>
    </Modal>
  </ModalProvider>
);
```

## Modal container props

The `Modal` container is a simple div as such it can accept any div props directly.  
Passing className to the `Modal` component will erase is default styling.
