import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: { shared: resolve(__dirname, "./node_modules/shared") },
  },
  optimizeDeps: {
    include: ["shared"],
  },
  build: {
    commonjsOptions: {
      include: ["shared"],
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      external: ["shared"],
    },
  },
});
