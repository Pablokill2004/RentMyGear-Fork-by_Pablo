import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import os from "os";

// Vitest has a fixed 60s worker-start timeout. On cold machines (fresh clone,
// CI sandboxes, low core count) spawning one fork per test file at once causes
// worker startup to exceed it. Cap concurrency relative to available CPUs.
const maxWorkers = Math.max(
  2,
  Math.floor((os.availableParallelism?.() ?? os.cpus().length) / 4)
);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.tsx"],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    testTimeout: 30000,
    maxWorkers,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
