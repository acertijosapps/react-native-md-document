const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const libRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [libRoot];

const sharedModules = [
    'react',
    'react-native',
    'react-native-reanimated',
    'react-native-gesture-handler',
];

config.resolver.extraNodeModules = sharedModules.reduce((acc, name) => {
    acc[name] = path.resolve(projectRoot, 'node_modules', name);
    return acc;
}, {});

config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

const escaped = libRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [
    new RegExp(
        `${escaped}/node_modules/(react|react-native|react-native-reanimated|react-native-gesture-handler)/.*`,
    ),
];

module.exports = config;
