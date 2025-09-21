import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // '/api'で始まるリクエストをプロキシする
        target: "http://localhost:2024", // バックエンドのURL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // '/api'を削除して転送
      },
    },
  },
});
