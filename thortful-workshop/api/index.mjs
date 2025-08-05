// api/index.mjs
let handler;

export default async function(req, res) {
  if (!handler) {
    const module = await import('../dist/thortful-workshop/server/server.mjs');
    handler = module.app;
  }
  return handler(req, res);
}