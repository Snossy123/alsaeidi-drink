import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isVercel = process.env.VERCEL === '1';
  const outDir = process.env.VITE_OUT_DIR || (isVercel ? 'dist' : '../sensu');
  const base = process.env.VITE_BASE_PATH || '/';

  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir,
      emptyOutDir: true,
    }
  };
});

