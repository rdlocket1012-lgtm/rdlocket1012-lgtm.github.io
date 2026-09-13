// Dynamic Expo config. Everything lives in app.json; this layer injects
// build-time secrets from the environment so they never live in git.
//
// Set MAPBOX_DOWNLOAD_TOKEN:
//   • locally  → .env  (gitignored)            e.g. MAPBOX_DOWNLOAD_TOKEN=sk.xxxx
//   • EAS      → `eas secret:create --name MAPBOX_DOWNLOAD_TOKEN --value sk.xxxx`
//
// The @rnmapbox/maps native SDK needs this "sk." download token at build time.
// (The runtime access token is the separate public EXPO_PUBLIC_MAPBOX_TOKEN.)

module.exports = ({ config }) => {
  const token = process.env.MAPBOX_DOWNLOAD_TOKEN ?? '';

  config.plugins = (config.plugins ?? []).map((plugin) =>
    Array.isArray(plugin) && plugin[0] === '@rnmapbox/maps'
      ? ['@rnmapbox/maps', { ...(plugin[1] ?? {}), RNMapboxMapsDownloadToken: token }]
      : plugin,
  );

  return config;
};
