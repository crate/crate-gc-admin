import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import packageJson from './package.json';
import preserveDirectives from 'rollup-preserve-directives';

export default defineConfig(() => {
  return {
    // depending on your application, base can also be "/"
    base: '',
    plugins: [
      react(),
      viteTsconfigPaths(),
      dts({
        tsconfigPath: 'tsconfig.build.json',
      }),

      // Fix https://github.com/vitejs/vite/issues/15012#issuecomment-2049888711
      preserveDirectives() as Plugin,
    ],
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      port: 5000,
    },
    build: {
      outDir: 'dist',
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: packageJson.name,
        fileName: format => `index.${format}.js`,
      },
      rollupOptions: {
        input: 'src/index.ts',
        external: ['react', 'react-dom', 'react-router-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-router-dom': 'ReactRouterDOM',
          },
        },
      },
      sourcemap: true,
      emptyOutDir: true,
    },
  };
});
