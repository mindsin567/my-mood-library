import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.js"],
        include: ["src/**/*.{test,spec}.{js,jsx}"],
    },
    resolve: {
        alias: { "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src") },
    },
});
