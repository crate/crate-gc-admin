'use strict';

// Minimal ESM-to-CJS transformer for pure-ESM node_modules packages.
// Used specifically for rettime, which msw 2.13.x depends on but ships only as .mjs.
// Handles named imports/exports only — sufficient for rettime's actual surface area.
module.exports = {
  process(sourceText) {
    let code = sourceText;

    // import { X, Y } from './path' → const { X, Y } = require('./path')
    code = code.replace(
      /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?/gm,
      (_, namedImports, modulePath) =>
        `const {${namedImports}} = require('${modulePath}');`,
    );

    // export { X, Y } → module.exports = { X, Y }
    code = code.replace(
      /^export\s+\{([^}]+)\}\s*;?/gm,
      (_, namedExports) => `module.exports = {${namedExports}};`,
    );

    return { code };
  },
};
