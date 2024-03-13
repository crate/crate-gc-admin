import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { colors } from './src/constants/colors';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    // depending on your application, base can also be "/"
    base: '',
    plugins: [react(), viteTsconfigPaths()],
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
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            // basics
            '@primary-color': colors.blue,
            '@body-background': '#F1F1F1',
            '@border-color-split': '#D4D4D4', // tailwind neutral-300

            // sidemenu colors
            '@layout-sider-background': '#262626', // Tailwind Neutral 800
            '@menu-dark-bg': '#262626', // Tailwind Neutral 800
            '@menu-dark-inline-submenu-bg': '#262626', // Tailwind Neutral 800
            '@menu-highlight-color': colors.blue,
            '@menu-dark-color': '#e5e5e5', // Tailwind Neutral 300

            // slider widget colors
            '@slider-track-background-color': colors.blue,
            '@slider-track-background-color-hover': colors.blue,
            '@slider-dot-border-color-active': colors.blue,
            '@slider-handle-color-hover': colors.blue,
            '@slider-handle-color-focus': colors.blue,
            '@slider-handle-color': colors.blue,

            // tabs
            '@tabs-highlight-color': colors.blue,

            // Table
            '@table-header-color': '#737373', // tailwind neutral-500
            '@table-border-color': '#e5e5e5', // tailwind neutral-200

            // inputs
            '@error-color': '#ef4444', // tailwind red-500

            // chunky form inputs
            '@border-radius-base': '4px',
            '@form-padding-vertical-base': '6px',
            '@input-border-color': '#a3a3a3', // tailwind neutral-400
            '@modal-footer-border-width': '1px',
            '@modal-header-border-width': '1px',
            '@select-border-color': '#a3a3a3', // tailwind neutral-400
          },
          javascriptEnabled: true,
        },
      },
    },
  };
});
