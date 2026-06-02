import viteTsconfigPaths from 'vite-tsconfig-paths';
import eslint from 'vite-plugin-eslint';
import { defineConfig } from 'vite';
import { sharedReactPlugin } from './vite.config.base';

export default defineConfig(() => {
  return {
    base: '',
    plugins: [sharedReactPlugin, eslint(), viteTsconfigPaths()],
    server: {
      open: true,
      port: 5000,
    },
    build: {
      outDir: 'build',
    },
  };
});
