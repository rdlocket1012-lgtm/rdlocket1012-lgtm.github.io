module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
    ],
    // react-native-worklets/plugin must be listed last. Required by
    // react-native-reanimated v4 (used internally by expo-router/screens).
    plugins: ['react-native-worklets/plugin'],
  };
};
