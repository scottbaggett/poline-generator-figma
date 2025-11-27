import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { copyFileSync } from 'fs';
import { build } from 'vite';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        viteSingleFile(),
        {
          name: 'build-plugin-code',
          writeBundle: {
            sequential: true,
            async handler() {
              // Copy manifest
              try {
                copyFileSync(
                  path.resolve(__dirname, 'manifest.json'),
                  path.resolve(__dirname, 'dist', 'manifest.json')
                );
                console.log('✓ Copied manifest.json to dist');
              } catch (err) {
                console.warn('Could not copy manifest.json:', err);
              }

              // Build plugin code
              await build({
                configFile: false,
                build: {
                  lib: {
                    entry: path.resolve(__dirname, './src/code.ts'),
                    name: 'plugin',
                    fileName: () => 'code.js',
                    formats: ['iife'],
                  },
                  outDir: 'dist',
                  emptyOutDir: false,
                  rollupOptions: {
                    output: {
                      extend: true,
                      inlineDynamicImports: true,
                    },
                  },
                },
                define: {
                  'process.env.NODE_ENV': JSON.stringify('production'),
                },
              });
              console.log('✓ Built code.js');
            },
          },
        },
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        assetsInlineLimit: 100000000,
        chunkSizeWarningLimit: 100000000,
        cssCodeSplit: false,
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, './index.html'),
          },
          output: {
            inlineDynamicImports: true,
          },
        },
        target: 'es2020',
        minify: 'esbuild',
      },
    };
});
