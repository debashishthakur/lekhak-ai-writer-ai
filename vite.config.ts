import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable build optimizations
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: mode === 'development',
    
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-button',
            '@radix-ui/react-card',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-form',
            '@radix-ui/react-input',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          // Chart and data visualization
          'chart-vendor': ['recharts'],
          // Utilities
          'utils-vendor': ['clsx', 'class-variance-authority', 'tailwind-merge', 'lucide-react'],
          // Backend services
          'service-vendor': ['@supabase/supabase-js', '@tanstack/react-query']
        },
        // Better file naming for caching
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'index') {
            return 'app-[hash].js';
          }
          return '[name]-[hash].js';
        },
        entryFileNames: 'app-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Enable compression-friendly builds
    reportCompressedSize: false,
  },
  
  // CSS optimizations
  css: {
    devSourcemap: mode === 'development',
    postcss: {
      plugins: mode === 'production' ? [
        require('autoprefixer'),
        require('cssnano')({
          preset: 'default',
        })
      ] : []
    }
  },
  
  // Production optimizations
  define: {
    __DEV__: mode === 'development',
  },
  
  // Enable tree shaking
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ],
    exclude: mode === 'development' ? [] : ['@google-cloud/local-auth', 'googleapis', 'date-fns']
  }
}));
