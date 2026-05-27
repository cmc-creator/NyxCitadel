/**
 * Wrapper to run vitest on Windows UNC network shares where tinyglobby
 * cannot traverse paths. Monkey-patches tinyglobby.glob to use the `glob`
 * npm package which handles UNC paths correctly.
 */
const { createRequire } = require('module');
const req = createRequire(__filename);

// Patch tinyglobby BEFORE vitest loads it
const realGlob = req('glob');
const tinyglobby = req('tinyglobby');
const originalGlob = tinyglobby.glob;

tinyglobby.glob = async function(patterns, options) {
  const patternsArr = Array.isArray(patterns) ? patterns : [patterns];
  const cwd = options?.cwd || process.cwd();
  const absolute = options?.absolute || false;

  const results = [];
  for (const pattern of patternsArr) {
    // If pattern is already an absolute path (not a glob), check directly
    if (pattern.includes('*') || pattern.includes('?')) {
      const matches = realGlob.globSync(pattern, { cwd, absolute, dot: false });
      results.push(...matches);
    } else {
      results.push(pattern);
    }
  }

  // Normalize to forward slashes
  const sep = String.fromCharCode(92);
  return [...new Set(results)].map(f => f.split(sep).join('/'));
};

// Also patch globSync if present
if (tinyglobby.globSync) {
  tinyglobby.globSync = function(patterns, options) {
    const patternsArr = Array.isArray(patterns) ? patterns : [patterns];
    const cwd = options?.cwd || process.cwd();
    const absolute = options?.absolute || false;

    const results = [];
    for (const pattern of patternsArr) {
      if (pattern.includes('*') || pattern.includes('?')) {
        const matches = realGlob.globSync(pattern, { cwd, absolute, dot: false });
        results.push(...matches);
      } else {
        results.push(pattern);
      }
    }

    const sep = String.fromCharCode(92);
    return [...new Set(results)].map(f => f.split(sep).join('/'));
  };
}

// Now spawn vitest
const { spawnSync } = require('child_process');
const result = spawnSync(
  process.execPath,
  ['node_modules/vitest/vitest.mjs', 'run', '--reporter', 'verbose'],
  {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env },
  }
);
process.exit(result.status ?? 1);
