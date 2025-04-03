import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import preserveDirectives from "rollup-preserve-directives";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { name } from "./package.json";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preserveDirectives(),
    dts({ tsconfigPath: "tsconfig.app.json", insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name,
      fileName: name,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "tailwindcss"],
    },
  },
});
