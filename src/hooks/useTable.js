import { useMemo, useState, useEffect } from "react";
/**
 * Recursive function returning an array with index, key syntax
 * representing the full paths to smallest headers.
 * @param {string | object | any[]} item
 * @param {string[]} paths
 * @param {string[]} path
 * @returns {string[]} full paths
 */
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
/**
 * Return an array with index, key syntax representing the full paths to next headers
 * @param {string[]} paths
 * @returns  {string[]} full paths to next layer
 */
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

/**
 * Modify columns (future header group) and the full paths to smallest header
 * so i take into account the final header tree (add empty headers)
 */
const alignHeaderGroupsTree = (columns, paths) => {
  const maxPathLength = paths.reduce((acc, path) => (acc < path.length ? path.length : acc), 0);
  const shortLengthIndexes = paths.reduce(
    (acc, path, index) => (path.length === maxPathLength ? acc : [...acc, index]),
    []
  );
  if (shortLengthIndexes.length === 0) return;
  let topLevelIndex;
  shortLengthIndexes.forEach((index) => {
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

/**
 * Add one header Group (header layer) with its properties.
 */
const getHeaderGroup = (columns, paths, headerGroups) => {
  const headerGroupIndex = headerGroups.length;
  const depth = paths.reduce((acc, path) => {
    const arrayDepth = path.reduce((acc, column) => (!isNaN(parseInt(column)) ? acc + 1 : acc), 0);
    return acc < arrayDepth ? arrayDepth : acc;
  }, 0);
  paths.forEach((path) => {
    const { Header, accessor, getFn, sortFn, columns: subcolumns } = getValueFromPath(columns, path);
    const colSpan = getLastPaths(subcolumns).length;
    headerGroups[headerGroupIndex] = {
      getHeaderGroupProps: getHeaderGroupProps(depth, headerGroupIndex),
      headers: [
        ...(headerGroups[headerGroupIndex]?.headers || []),
        {
          header: Header,
          depth,
          accessor,
          getFn, // Needed for getRows
          sortFn, // Needed for getDataSorted
          columns: subcolumns,
          getHeaderProps: getHeaderProps(Header, depth, colSpan),
        },
      ],
    };
  });
  return headerGroups;
};
/**
 * Return Complete Headers Groups ready to be rendered (without sort properties).
 */
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
/**
 * Returns all rows with properties ready to be rendered.
 */
const getRows = (data, headerGroup) => {
  let rows = [];
  const columns = headerGroup[headerGroup.length - 1].headers;
  data.forEach((item, index) => {
    const row = { id: `${index}`, index, cells: [], getRowProps: getRowProps(index) };
    columns.forEach((column) => {
      const { accessor, getFn } = column;
      let value = getValueFromPath(item, accessor.split("."));
      if (typeof getFn === "function") value = getFn(value);
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
/**
 * Return only the data needed for the current page.
 */
const getDataPaginate = (currentPage, pageSize, usePagination, data) => {
  if (!usePagination) return data;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
};

const sortNumber = (a, b) => a - b;
const sortString = (a, b) => a.localeCompare(b);

const getSortTypeFunction = (value) => {
  if (isNaN(parseFloat(value))) return sortString;
  return sortNumber;
};
/**
 * Sort the data using provided accesors and optional sort functions.
 */
const getDataSorted = (data, sortBy, useSortBy, headerGroups) => {
  if (!useSortBy) return data;
  const sortedData = [...data];
  sortBy.reverse().forEach((sort) => {
    const { accessor, desc } = sort;
    const customSortFunction = headerGroups[headerGroups.length - 1].headers.find(
      (column) => column.accessor === accessor
    )?.sortFn;
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
/**
 * Create the onClick property sorting the current column.
 */
const getSortByToggleProps = (isSorted, isSortedDesc, accessor, setSortBy) => () => ({
  onClick: () =>
    isSorted
      ? isSortedDesc
        ? setSortBy([])
        : setSortBy([{ accessor, desc: true }])
      : setSortBy([{ accessor, desc: false }]),
});
/**
 * Add to header groups the sorted properties.
 */
const getHeaderGroupsWithSortedBool = (headerGroups, sortBy, setSortByState, useSortBy) => {
  const headerGroupWithSorted = [...headerGroups];

  headerGroupWithSorted.forEach((headerGroup) => {
    headerGroup.headers.forEach((header) => {
      header.isSorted = false;
      header.isSortedDesc = false;
      header.getSortByToggleProps = () => {};
    });
  });
  if (useSortBy) {
    headerGroupWithSorted[headerGroupWithSorted.length - 1].headers.forEach((header) => {
      header.isSorted = sortBy.some((sort) => sort.accessor === header.accessor);
      header.isSortedDesc = sortBy.some((sort) => sort.accessor === header.accessor && sort.desc);
      header.getSortByToggleProps = getSortByToggleProps(
        header.isSorted,
        header.isSortedDesc,
        header.accessor,
        setSortByState
      );
    });
  }
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
    () => getDataSorted(data, sortByState, useSortBy, headerGroups),
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
