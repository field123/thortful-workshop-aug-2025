// api/index.mjs
export default import('../dist/throful-workshop/server/server.mjs')
  .then(m => m.app); // m.app is the Express handler exported by Angular’s server
