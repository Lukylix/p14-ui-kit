import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import postcss from "rollup-plugin-postcss";
import svgr from "@svgr/rollup";

const packageJson = require("./package.json");

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    external: ["react", "react-dom", "prop-types"],
    plugins: [
      babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      resolve(),
      replace({
        ENV: JSON.stringify(process.env.NODE_ENV || "development"),
        preventAssignment: true,
      }),
      svgr(),
      postcss({
        modules: true,
      }),
    ],
  },
];
