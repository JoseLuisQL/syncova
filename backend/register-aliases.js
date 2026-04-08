const Module = require('module');
const path = require('path');

const distRoot = path.join(__dirname, 'dist');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (typeof request === 'string' && request.startsWith('@/')) {
    request = path.join(distRoot, request.slice(2));
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
