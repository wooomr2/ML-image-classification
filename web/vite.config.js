import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  plugins: [tsconfigPaths()],
  resolve: {
    alias: { shared: resolve(__dirname, "./node_modules/shared") },
  },
  optimizeDeps: {
    include: ["shared"],
  },
  build: {
    outDir: "../dist",
    commonjsOptions: {
      include: ["shared"],
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, "./src/index.html"),
        viewer: resolve(__dirname, "./src/viewer.html"),
      },
      external: ["shared"],
    },
  },
});
