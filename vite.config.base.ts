import react from '@vitejs/plugin-react-swc';

export const sharedReactPlugin = react({ disableOxcRecommendation: true });

export const sharedResolve = { tsconfigPaths: true };
