import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isVercel = process.env.VERCEL === '1';
  const outDir = process.env.VITE_OUT_DIR || (isVercel ? 'dist' : '../sensu');
  
  return {
    // If we're on Vercel, use root. Otherwise, default to /sensu/ for Laragon.
    // The CLI --base flag will override this when we run build:hostinger.
    base: isVercel ? '/' : (outDir === '../sensu' ? '/sensu/' : '/'),

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

