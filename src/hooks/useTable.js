import { useMemo } from "react";

const getLastPaths = (item, path = [], paths = []) => {
  let isLastLayer = true;
  if (typeof item === "object") {
    Object.keys(item).forEach((key) => {
      getLastPaths(item[key], [...path, key], paths);
      if (typeof item[key] === "object") isLastLayer = false;
    });
  } else {
    isLastLayer = false;
  }
  if (isLastLayer) paths.push(path);
  return paths;
};

const pathsToNextArray = (paths) => {
  paths.forEach((path, index) => {
    let indexToRemove;
    if (path.length > 1) {
      for (let i = path.length - 2; i >= 0; i--) {
        const element = path[i];
        if (!isNaN(parseInt(element))) {
          indexToRemove = i;
          break;
        }
      }
      paths[index] = paths[index].slice(0, indexToRemove + 1);
    } else {
      paths[index] = [];
    }
  });
  const jsonPaths = paths.map((path) => JSON.stringify(path));
  const uniqueJsonPaths = jsonPaths.filter((path, index) => jsonPaths.indexOf(path) === index);
  const uniquePaths = uniqueJsonPaths.map((path) => JSON.parse(path));
  return uniquePaths;
};

const alignHeaderGroupsTree = (columns, paths) => {
  const maxPathLength = paths.reduce((acc, path) => (acc < path.length ? path.length : acc), 0);
  const shortLenghtIndexes = paths.reduce(
    (acc, path, index) => (path.length === maxPathLength ? acc : [...acc, index]),
    []
  );
  if (shortLenghtIndexes.length === 0) return;
  let topLevelIndex;
  shortLenghtIndexes.forEach((index) => {
    const path = paths[index];
    if (topLevelIndex !== path[0]) {
      topLevelIndex = path[0];
      columns[topLevelIndex] = { Header: "", columns: [columns[topLevelIndex]] };
    }
    paths[index] = [topLevelIndex, "columns", ...path];
  });
  alignHeaderGroupsTree(columns, paths);
};

const getValueFromPath = (item, path) => {
  let value = item;
  path.forEach((key) => (value = value[key]));
  return value;
};

const getHeaderProps = (header, depth, colSpan) => () => ({
  colSpan,
  key: `header_${header}_${depth}`,
  role: "columnheader",
});

const getHeaderGroupProps = (depth, index) => () => ({
  key: `headerGroup_${depth}${index}`,
  role: "row",
});

const getHeaderGroup = (columns, paths, headerGroups) => {
  const headerGroupIndex = headerGroups.length;
  const depth = paths.reduce((acc, path) => {
    const arrayDepth = path.reduce((acc, column) => (!isNaN(parseInt(column)) ? acc + 1 : acc), 0);
    return acc < arrayDepth ? arrayDepth : acc;
  }, 0);
  paths.forEach((path, index) => {
    const { Header, accessor, columns: subcolumns } = getValueFromPath(columns, path);
    const colSpan = getLastPaths(subcolumns).length;
    headerGroups[headerGroupIndex] = {
      getHeaderGroupProps: getHeaderGroupProps(depth, headerGroupIndex),
      headers: [
        ...(headerGroups[headerGroupIndex]?.headers || []),
        {
          header: Header,
          depth,
          accessor,
          columns: subcolumns,
          getHeaderProps: getHeaderProps(Header, depth, colSpan),
        },
      ],
    };
  });
  return headerGroups;
};

const getHeaderGroups = (columns) => {
  let paths = getLastPaths(columns);
  alignHeaderGroupsTree(columns, paths);
  let headerGroups = [];
  while (paths[0].length > 0) {
    getHeaderGroup(columns, paths, headerGroups);
    paths = pathsToNextArray(paths);
  }
  return headerGroups.reverse();
};

const getRowProps = (index) => () => ({ role: "row", key: `row_${index}` });
const getCellProps = (index, accessor) => () => ({ role: "cell", key: `cell_${index}_${accessor}` });

const getRows = (data, headerGroup) => {
  let rows = [];
  const columns = headerGroup[headerGroup.length - 1].headers;
  data.forEach((item, index) => {
    const row = { id: `${index}`, index, cells: [], getRowProps: getRowProps(index) };
    columns.forEach((column) => {
      const { accessor } = column;
      let value = getValueFromPath(item, accessor.split("."));
      if (Array.isArray(value)) value = value.join(", ");
      row.cells.push({
        value,
        getCellProps: getCellProps(index, accessor),
      });
    });
    rows.push(row);
  });
  return rows;
};

export default function useTable({ columns, data }) {
  const headerGroups = useMemo(() => getHeaderGroups(columns), [columns]);
  const rows = useMemo(() => getRows(data, headerGroups), [data, headerGroups]);
  console.log("rows", rows);
  return { headerGroups, rows };
}
