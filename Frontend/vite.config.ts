import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), TanStackRouterVite({
    routesDirectory: "./app/routes",
    generatedRouteTree: "./app/routeTree.gen.ts",
  }), tsconfigPaths()],
  build: {
    outDir: "build/client",
  },
});
