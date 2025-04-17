// Apply our patch
require('./patches/apply-patches');

// Now load connect-flash
const flash = require('connect-flash');

// Create a mock request with session
const req = { session: {} };

// Apply the flash middleware to the request
flash()(req, {}, () => {});

// Use req.flash with an array to trigger the isArray check
const count = req.flash('test', ['test1', 'test2']);
console.log('Flash added items count:', count);

// Retrieve the items
const items = req.flash('test');
console.log('Flash items retrieved:', items);

console.log('Test completed - if no deprecation warning appears, the patch was successful!'); 