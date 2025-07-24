import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import preserveDirectives from "rollup-preserve-directives";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { name } from "./package.json";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    preserveDirectives(),
    tailwindcss(),
    cssInjectedByJsPlugin({ topExecutionPriority: false }),
    dts({ tsconfigPath: "tsconfig.app.json", insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name,
      fileName: name,
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    emptyOutDir: true,
  },
});
