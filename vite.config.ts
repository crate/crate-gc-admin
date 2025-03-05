import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import eslint from 'vite-plugin-eslint';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    // depending on your application, base can also be "/"
    base: '',
    plugins: [react(), eslint(), viteTsconfigPaths()],
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      port: 5000,
    },
    define: {
      'process.env': env,
    },
    build: {
      outDir: 'build',
    },
  };
});
