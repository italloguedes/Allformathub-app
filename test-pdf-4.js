const pkg = require('pdftoimg-js');
console.log('Type:', typeof pkg);
console.log('Keys:', Object.keys(pkg));
if (typeof pkg === 'function') console.log('It is a function');
// Try to instatiate if class?
try {
    const instance = new pkg();
    console.log('Instantiated:', instance);
} catch (e) { }
