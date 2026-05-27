// Preloaded via node --require before vitest starts.
// Patches tinyglobby to use the `glob` npm package so UNC network share
// paths (\\server\share\...) are traversable on Windows.
const { createRequire } = require('module');
const req = createRequire(__filename);
const realGlob = req('glob');
const tinyglobby = req('tinyglobby');
const sep = String.fromCharCode(92);

function normalizeSlashes(s) {
  return s.split(sep).join('/');
}

function runGlob(patterns, options) {
  const patternsArr = Array.isArray(patterns) ? patterns : [patterns];
  const cwd = options && options.cwd ? options.cwd : process.cwd();
  const absolute = !!(options && options.absolute);
  const results = [];
  for (const pattern of patternsArr) {
    const matches = realGlob.globSync(pattern, {
      cwd,
      absolute,
      dot: false,
      ignore: (options && options.ignore) ? options.ignore : [],
    });
    results.push(...matches);
  }
  return [...new Set(results)].map(normalizeSlashes);
}

tinyglobby.glob = async function(patterns, options) {
  return runGlob(patterns, options);
};

if (tinyglobby.globSync) {
  tinyglobby.globSync = function(patterns, options) {
    return runGlob(patterns, options);
  };
}
