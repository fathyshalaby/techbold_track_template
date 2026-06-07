// Turbopack has no `.js` -> `.ts` extension aliasing, so NodeNext-style relative
// imports (e.g. `./tickets.js`) in workspace TS packages fail to resolve. This
// loader strips the `.js` suffix from relative specifiers so they resolve to the
// `.ts` sources during both dev and build.
module.exports = function stripJsExtension(source) {
  return source.replace(/(from\s+["']\.{1,2}\/[^"']*?)\.js(["'])/g, "$1$2");
};
