module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind", unstable_transformImportMeta: true }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
          },
        },
      ],
      "@babel/plugin-proposal-export-namespace-from",
      "@babel/plugin-transform-class-static-block",
      // NOTE: babel-preset-expo on SDK 54 injects react-native-reanimated/plugin
      // and react-native-worklets/plugin automatically. Do NOT add them here.
    ],
  };
};
