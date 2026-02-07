module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Preserve viewBox for proper scaling
          removeViewBox: false,
          // Keep IDs (needed for references, styling, accessibility)
          cleanupIds: false,
          // Don't merge paths that might break visual appearance
          mergePaths: false,
          // Keep title/desc for accessibility
          removeTitle: false,
          removeDesc: false,
        },
      },
    },
    // Remove comments
    'removeComments',
    // Remove metadata
    'removeMetadata',
    // Sort attributes for better gzip compression
    'sortAttrs',
    // Remove empty attributes
    'removeEmptyAttrs',
    // Remove empty containers
    'removeEmptyContainers',
  ],
};
