import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["node_modules/**", "dist/**", "e2e/**"],
  },
  resolve: {
    alias: {
      "@pmhc/types": fileURLToPath(new URL("packages/types/src/index.ts", import.meta.url)),
      "@pmhc/onboarding": fileURLToPath(new URL("packages/onboarding/src/index.ts", import.meta.url)),
      "@pmhc/rules": fileURLToPath(new URL("packages/rules/src/index.ts", import.meta.url)),
      "@pmhc/sync": fileURLToPath(new URL("packages/sync/src/index.ts", import.meta.url)),
      "@pmhc/client": fileURLToPath(new URL("packages/client/src/index.ts", import.meta.url)),
      "@pmhc/ui": fileURLToPath(new URL("packages/ui/src/index.ts", import.meta.url)),
    },
  },
  cacheDir: `${root}/node_modules/.vite`,
});
