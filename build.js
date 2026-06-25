import * as esbuild from "esbuild";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

console.log(`🚀 Building windrunner v${pkg.version}...`);

const shared = {
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "neutral",
};

// ESM
await esbuild.build({
  ...shared,
  format: "esm",
  outfile: "dist/index.esm.js",
});

// CJS
await esbuild.build({
  ...shared,
  format: "cjs",
  platform: "node",
  outfile: "dist/index.js",
});

// Minified ESM (for CDN)
await esbuild.build({
  ...shared,
  format: "esm",
  minify: true,
  outfile: "dist/index.min.js",
});

const esm = readFileSync("dist/index.esm.js");
const min = readFileSync("dist/index.min.js");

console.log(`✅ Build complete:`);
console.log(`   dist/index.esm.js  — ${(esm.length / 1024).toFixed(1)} KB`);
console.log(`   dist/index.min.js  — ${(min.length / 1024).toFixed(1)} KB (CDN ready)`);
console.log(`\n💡 CDN usage:`);
console.log(`   <script type="module">`);
console.log(`     import { windrunner } from "https://cdn.jsdelivr.net/npm/windrunner@${pkg.version}/dist/index.min.js";`);
console.log(`     windrunner({ autoStart: true });`);
console.log(`   </script>`);
