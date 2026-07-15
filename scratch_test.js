const { login } = require('./lib/cms-client.js');

const session = {
  id: 'test-session',
  targetCookies: []
};

console.log('Testing login proxy to cmsmarks...');

// Use the ES import in a node script by using dynamic import or changing require since cms-client is ES module.
// Since Next.js is configured for ES modules, we can run it using dynamic import in Node.
import('./lib/cms-client.js').then(async (mod) => {
  try {
    const result = await mod.login(session, '2201854', '14112003');
    console.log('Result:', result);
    console.log('Session Cookies Saved:', session.targetCookies);
  } catch (e) {
    console.error('Error during test:', e);
  }
}).catch(err => {
  console.error('Failed to import module:', err);
});
