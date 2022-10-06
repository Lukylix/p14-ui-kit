import { useMemo, useState, useEffect } from "react";

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
  path.forEach((key) => (value = value?.[key]));
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

const getDataPaginate = (currentPage, pageSize, usePagination, data) => {
  if (!usePagination) return data;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
};

const sortNumber = (a, b) => a - b;
const sortString = (a, b) => a.localeCompare(b);
// const sortDate = (a, b) => new Date(a) - new Date(b);

const getSortTypeFunction = (value) => {
  if (isNaN(parseFloat(value))) return sortString;
  return sortNumber;
};

const getDataSorted = (data, sortBy, useSortBy, columns) => {
  if (!useSortBy) return data;
  const sortedData = [...data];
  sortBy.reverse().forEach((sort) => {
    const { accessor, desc } = sort;
    const customSortFunction = columns.find((column) => column.accessor === accessor)?.sortFn;
    sortedData.sort((a, b) => {
      const valueA = getValueFromPath(a, accessor.split("."));
      const valueB = getValueFromPath(b, accessor.split("."));
      if (customSortFunction) return customSortFunction(valueA, valueB) * (desc ? -1 : 1);
      const sortTypeFunction = getSortTypeFunction(valueA);
      return sortTypeFunction(valueA, valueB) * (desc ? -1 : 1);
    });
  });
  return sortedData;
};

const getSortByToggleProps = (isSorted, isSortedDesc, accessor, setSortBy) => () => ({
  onClick: () =>
    isSorted
      ? isSortedDesc
        ? setSortBy([])
        : setSortBy([{ accessor, desc: true }])
      : setSortBy([{ accessor, desc: false }]),
});

const getHeaderGroupsWithSortedBool = (headerGroups, sortBy, setSortByState, useSortBy) => {
  const headerGroupWithSorted = [...headerGroups];
  headerGroupWithSorted.forEach((headerGroup) => {
    headerGroup.headers.forEach((header) => {
      if (useSortBy) {
        header.isSorted = sortBy.some((sort) => sort.accessor === header.accessor);
        header.isSortedDesc = sortBy.some((sort) => sort.accessor === header.accessor && sort.desc);
        header.getSortByToggleProps = getSortByToggleProps(
          header.isSorted,
          header.isSortedDesc,
          header.accessor,
          setSortByState
        );
      } else {
        header.isSorted = false;
        header.isSortedDesc = false;
        header.getSortByToggleProps = () => {};
      }
    });
  });
  return headerGroupWithSorted;
};

export default function useTable({
  columns,
  data,
  usePagination = false,
  useSortBy = false,
  initalState: { page: { number = 1, size = 10 } = {}, sortBy = [] } = {},
}) {
  const headerGroups = useMemo(() => getHeaderGroups(columns), [columns]);

  const [currentPage, setCurrentPage] = useState(number);
  const [pageSize, setPageSize] = useState(size);

  const [sortByState, setSortByState] = useState(sortBy);

  const dataSorted = useMemo(
    () => getDataSorted(data, sortByState, useSortBy, columns),
    [data, sortByState, useSortBy, columns]
  );

  const headerGroupWithSortedProps = useMemo(
    () => getHeaderGroupsWithSortedBool(headerGroups, sortByState, setSortByState, useSortBy),
    [headerGroups, sortByState, setSortByState, useSortBy]
  );

  const dataPaginated = useMemo(
    () => getDataPaginate(currentPage, pageSize, usePagination, dataSorted),
    [currentPage, pageSize, dataSorted]
  );
  const pageCount = useMemo(() => Math.max(Math.ceil(dataSorted.length / pageSize), 1), [dataSorted, pageSize]);
  const canPreviousPage = useMemo(() => currentPage > 1, [currentPage]);
  const canNextPage = useMemo(() => currentPage < pageCount, [currentPage, pageCount]);

  // Prevent wrong page values
  useEffect(() => {
    goToPage(currentPage);
  }, [pageSize, pageCount]);

  const previousPage = () => setCurrentPage((currentPage) => (canPreviousPage ? currentPage - 1 : 1));
  const nextPage = () => setCurrentPage((currentPage) => (canNextPage ? currentPage + 1 : pageCount));
  const goToPage = (page) => {
    if (page < 1) return setCurrentPage(1);
    if (page > pageCount) return setCurrentPage(pageCount);
    setCurrentPage(page);
  };

  const rows = useMemo(
    () => getRows(dataPaginated, headerGroupWithSortedProps),
    [dataPaginated, headerGroupWithSortedProps]
  );
  return {
    headerGroups: headerGroupWithSortedProps,
    rows,
    /*Pagination*/
    page: currentPage,
    pageSize,
    pageCount,
    canPreviousPage,
    canNextPage,
    goToPage,
    previousPage,
    nextPage,
    setPageSize,
    /*Sort*/
    setSortBy: setSortByState,
  };
}
