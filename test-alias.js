const path = require('path');
const cwd = process.cwd();
const fwd = cwd.replace(/\\/g, '/');
const dbl = '//' + fwd.replace(/^\/+/, '');

console.log('cwd:', cwd);
console.log('fwd:', fwd);
console.log('dbl:', dbl);

// Test path.posix.normalize with double slash UNC
const test1 = '//192.168.168.182/Folder Redirection/Ccooper/Documents/GitHub/NyxCitadel/src/lib/prisma.ts';
console.log('\npath.posix.normalize:', path.posix.normalize(test1));

// Test what the normalizePath patch would do
function slash(p) { return p.replace(/\\/g, '/'); }
function normalizePath(id) {
  const normalized = path.posix.normalize(id.includes('\\') ? slash(id) : id);
  if (normalized.startsWith('/') && !normalized.startsWith('//')) {
    const slashed = slash(id);
    if (slashed.startsWith('//')) return '/' + normalized;
  }
  return normalized;
}

console.log('\nnormalizePath(dbl+src):', normalizePath(dbl + '/src/lib/prisma.ts'));
console.log('normalizePath(@/lib/prisma):', normalizePath('@/lib/prisma'));

// Simulate alias replacement
const alias = dbl + '/src';
const id = '@/lib/prisma';
const replaced = id.replace('@', alias);
console.log('\nalias value:', alias);
console.log('replaced:', replaced);
console.log('normalizePath(replaced):', normalizePath(replaced));

// Check fs.existsSync on the result
const fs = require('fs');
const normalized = normalizePath(replaced);
const withExt = normalized + '.ts';
console.log('\nwithExt:', withExt);
console.log('fs.existsSync(withExt):', fs.existsSync(withExt));

// Also test path.isAbsolute
console.log('\npath.isAbsolute(normalized):', path.isAbsolute(normalized));
console.log('path.posix.isAbsolute(normalized):', path.posix.isAbsolute(normalized));
