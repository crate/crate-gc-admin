import viteTsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    // depending on your application, base can also be "/"
    base: '',
    plugins: [react(), eslint(), viteTsconfigPaths()],
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      port: 5000,
    },
    build: {
      outDir: 'build',
    },
  };
});
