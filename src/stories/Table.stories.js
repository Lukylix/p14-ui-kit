import React, { useState, useMemo } from "react";

import { useTable } from "../../dist/esm/index.js";
import shows from "./data/shows.json";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Table",
  component: Default,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = ({ columns }) => {
  const { headerGroups, rows } = useTable({ columns, data: shows });
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
        ;
      </tbody>
    </table>
  );
};

const PaginationTemplate = ({ columns }) => {
  const {
    headerGroups,
    rows,
    page,
    pageSize,
    pageCount,
    canPreviousPage,
    canNextPage,
    goToPage,
    previousPage,
    nextPage,
    setPageSize,
  } = useTable({ columns, data: shows });
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
          ;
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => goToPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => goToPage(pageCount)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {page} of {pageCount}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={page}
            onChange={(e) => goToPage(Number(e.target.value))}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
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
};

export const Default = Template.bind({});
Default.args = {
  columns: [
    {
      Header: "TV Show",
      columns: [
        {
          Header: "Name",
          accessor: "show.name",
        },
        {
          Header: "Type",
          accessor: "show.type",
        },
      ],
    },
    {
      Header: "Plop",
      columns: [
        {
          Header: "Details",
          columns: [
            {
              Header: "Cat1",
              columns: [
                {
                  Header: "Language",
                  accessor: "show.language",
                },
                {
                  Header: "Genre(s)",
                  accessor: "show.genres",
                },
              ],
            },
            {
              Header: "Cat2",
              columns: [
                {
                  Header: "Runtime",
                  accessor: "show.runtime",
                },
                {
                  Header: "Status",
                  accessor: "show.status",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const OneLayerHeader = Template.bind({});
OneLayerHeader.args = {
  columns: [
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
    {
      Header: "Runtime",
      accessor: "show.runtime",
    },
    {
      Header: "Status",
      accessor: "show.status",
    },
  ],
};

export const Pagination = PaginationTemplate.bind({});
Pagination.args = {
  columns: [
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
    {
      Header: "Runtime",
      accessor: "show.runtime",
    },
    {
      Header: "Status",
      accessor: "show.status",
    },
  ],
};
