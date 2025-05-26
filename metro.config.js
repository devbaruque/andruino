const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://docs.expo.dev/guides/customizing-metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Configuração para resolver problemas com bibliotecas Node.js
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Resolver aliases para módulos Node.js problemáticos
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': require.resolve('react-native-crypto'),
  'stream': require.resolve('readable-stream'),
  'events': require.resolve('events'),
  'util': require.resolve('util'),
};

// Blacklist para módulos problemáticos
config.resolver.blockList = [
  /node_modules\/ws\/lib\/websocket-server\.js$/,
  /node_modules\/ws\/lib\/sender\.js$/,
  /node_modules\/ws\/lib\/receiver\.js$/,
  /node_modules\/ws\/lib\/stream\.js$/,
];

// Configuração adicional para transformar
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config; 