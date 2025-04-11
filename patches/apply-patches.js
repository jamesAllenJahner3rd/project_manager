/**
 * Runtime patch for connect-flash to fix the util.isArray deprecation warning
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');

// Backup the original _load method
const originalLoad = Module._load;

// Override the _load method to intercept connect-flash/lib/flash.js
Module._load = function(request, parent, isMain) {
  if (request === 'connect-flash/lib/flash' || request.endsWith('connect-flash/lib/flash.js')) {
    // Load our patched version instead
    const patchedPath = path.join(__dirname, 'flash-lib/flash.js');
    console.log('Applied patch for connect-flash: Fixed util.isArray deprecation warning');
    // Use the original _load method to load our patched file
    return originalLoad(patchedPath, parent, isMain);
  }
  // Otherwise, use the original _load method
  return originalLoad.apply(this, arguments);
};

console.log('Patch system initialized'); 