import React, { forwardRef } from "react";

import { Datepicker } from "../../dist/esm/index.js";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Datepicker",
  component: Datepicker,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    dayLabels: {
      control: {
        type: "array",
      },
    },
    monthLabels: {
      control: {
        type: "array",
      },
    },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Datepicker {...args} />;

export const Default = Template.bind({});

export const CustomInput = Template.bind({});
CustomInput.args = {
  customInput: forwardRef(({ value, ...props }, ref) => (
    <button {...props} ref={ref}>
      {value}
    </button>
  )),
};
