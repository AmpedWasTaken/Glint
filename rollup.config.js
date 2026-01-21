import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

const input = "src/index.ts";

const jsBuild = {
  input,
  output: [
    {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named"
    },
    {
      file: "dist/glint.js",
      format: "iife",
      sourcemap: true,
      name: "Glint"
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    postcss({
      extract: "glint.css",
      minimize: true
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist/types"
    }),
    terser()
  ]
};

const dtsBuild = {
  input: "dist/types/index.d.ts",
  output: {
    file: "dist/index.d.ts",
    format: "es"
  },
  plugins: [dts()],
  external: [/\.css$/]
};

export default [jsBuild, dtsBuild];
