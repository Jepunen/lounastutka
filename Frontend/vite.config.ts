import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), TanStackRouterVite({
    routesDirectory: "./app/routes",
    generatedRouteTree: "./app/routeTree.gen.ts",
  }), tsconfigPaths()],
  server: {
    proxy: {
      "/api": {
        target: "http://backend:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build/client",
  },
});
