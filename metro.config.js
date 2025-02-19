const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

// Obtém a configuração padrão do Metro
let config = getDefaultConfig(__dirname);

// Aplica NativeWind
config = withNativeWind(config, { input: "./src/styles/global.css" });

// Aplica React Native Reanimated
config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
