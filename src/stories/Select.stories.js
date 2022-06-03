import React, { useState } from "react";

import { Select } from "../../dist/esm/index.js";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Select",
  component: Select,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

const options = [
  {
    label: "Vue.js",
    value: "vue",
  },
  {
    label: "React",
    value: "react",
  },
  {
    label: "Angular",
    value: "angular",
  },
  {
    label: "Ember.js",
    value: "ember",
  },
  {
    label: "Polymer",
    value: "polymer",
  },
  {
    label: "Svelte",
    value: "svelte",
  },
];

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  const [value, seValue] = React.useState();
  return (
    <div>
      <Select {...args} value={value} onChange={(value) => seValue(value)} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  options,
};

export const Searchable = Template.bind({});
Searchable.args = {
  options,
  isSearchable: true,
};
