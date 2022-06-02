import React from "react";

/**
 * Gets the string type of the component or core html (JSX) element.
 * React Fragments will return type 'react.fragment'.
 * Priority will be given to the prop '_type'.
 *
 * @param {ReactNode} component - The component to type check
 * @returns {string} - The string representation of the type
 */
export const typeOfComponent = (component) =>
  component?.props?._type ||
  component?.type?.toString().replace("Symbol(react.fragment)", "react.fragment") ||
  undefined;

/**
 * Gets all children by specified type.
 * This function will check the prop '_type' first and then the 'type' string to match core html elements.
 * To find a React Fragment, search for type 'react.fragment'.
 *
 * @param {ReactNode} children - JSX children
 * @param {string[]} types - Types of children to match
 * @returns {[ReactNode[], ReactNode[]]} - Array of matching children
 */

export function filterChildrenByType(children, types) {
  const filteredChildren = [];
  const nonMatchingChildren = [];
  React.Children.forEach(children, (child) => {
    if (types.includes(typeOfComponent(child))) {
      filteredChildren.push(child);
    } else {
      if (typeof child?.props?.children === "object") {
        const [filteredChilds, nonMatchingChilds] = filterChildrenByType(child.props.children, types);
        filteredChilds.forEach((filteredChild) => filteredChildren.push(filteredChild));
        nonMatchingChildren.push({ ...child, props: { ...child.props, children: nonMatchingChilds } });
      } else {
        nonMatchingChildren.push(child);
      }
    }
  });
  return [filteredChildren, nonMatchingChildren];
}
