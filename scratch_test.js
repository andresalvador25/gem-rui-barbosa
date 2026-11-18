const React = require('react');
const ReactDOMServer = require('react-dom/server');

// We can load the built bundle or test App
try {
  // Let's inspect the bundle or require JSX through esbuild or @babel/register
  console.log('Testing render simulation...');
} catch(e) {
  console.error(e);
}
