import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

const nitroOptions: Record<string, unknown> = {};
const procEnv = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
if (procEnv["VERCEL"]) {
  nitroOptions["preset"] = "vercel";
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          specifiers: ["server-only"],
        },
      },
      server: { entry: "server" },
    }),
    nitro(nitroOptions),
    react(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
});
