import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import { uglify } from "rollup-plugin-uglify";
import postcss from "rollup-plugin-postcss";

const packageJson = require("./package.json");

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    external: ["react", "prop-types"],
    plugins: [
      babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      resolve(),
      commonjs(),
      replace({
        ENV: JSON.stringify(process.env.NODE_ENV || "development"),
        preventAssignment: true,
      }),
      postcss({
        modules: true,
      }),
      process.env.NODE_ENV === "production" && uglify(),
    ],
  },
];
