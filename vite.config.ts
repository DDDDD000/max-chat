import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    open: true,
  },
  base: command === "build" ? "/max-chat/" : "/",
}));
