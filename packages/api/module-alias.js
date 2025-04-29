const moduleAlias = require('module-alias');
const path = require('path');

// Register module aliases for runtime path resolution
moduleAlias.addAliases({
  '@': path.resolve(__dirname, 'dist/src'),
});

// Export the configuration for potential reuse
module.exports = moduleAlias;

