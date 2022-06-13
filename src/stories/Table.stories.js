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
