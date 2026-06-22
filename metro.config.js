const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// On Windows, Metro's file map fails ("c:\C:\..." ENOENT) when the project
// root drive letter casing differs from the casing of resolved module paths.
// Force an uppercase drive letter so the root and module paths always match,
// regardless of how the dev server is launched (lowercase `c:` shells, etc.).
const normalizeWinDrive = (p) =>
  process.platform === "win32" && /^[a-z]:/.test(p)
    ? p.charAt(0).toUpperCase() + p.slice(1)
    : p;

const projectRoot = normalizeWinDrive(__dirname);

const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = (config.watchFolders ?? []).map(normalizeWinDrive);

// Never crawl the exported web build output at the project root. It contains a
// nested copy of node_modules that triggers ENOENT/Haste collisions during
// bundling. Scope this to the project root's `dist/` ONLY (NOT every `dist`
// folder, otherwise it would also block node_modules/*/dist/*).
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const projectDistBlock = new RegExp(
  escapeRegExp(path.join(projectRoot, "dist")) + "(\\\\|/).*"
);

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
    ? [config.resolver.blockList]
    : []),
  projectDistBlock,
];

module.exports = withNativeWind(config, { input: "./app/global.css" });
