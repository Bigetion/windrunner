import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, existsSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

console.log(`🚀 Building windrunner v${pkg.version}...`);

const shared = {
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "neutral",
  target: "es2020", // More aggressive optimizations for modern browsers
  treeShaking: true,
  legalComments: "none", // Remove comments to save bytes
};

// ESM (with sourcemap for debugging)
await esbuild.build({
  ...shared,
  format: "esm",
  outfile: "dist/index.esm.js",
  sourcemap: true,
});

// CJS (with sourcemap for debugging)
await esbuild.build({
  ...shared,
  format: "cjs",
  platform: "node",
  outfile: "dist/index.js",
  sourcemap: true,
});

// Minified ESM (for CDN)
await esbuild.build({
  ...shared,
  format: "esm",
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  mangleProps: /^_internal/, // Mangle private properties for extra size reduction
  outfile: "dist/index.min.js",
});

// React entrypoint - ESM
await esbuild.build({
  entryPoints: ["src/react.js"],
  bundle: true,
  platform: "neutral",
  target: "es2020",
  format: "esm",
  external: ["react"], // React is a peer dependency
  treeShaking: true,
  legalComments: "none",
  sourcemap: true,
  loader: { ".js": "jsx" }, // Enable JSX for React components
  outfile: "dist/react.esm.js",
});

// React entrypoint - CJS
await esbuild.build({
  entryPoints: ["src/react.js"],
  bundle: true,
  platform: "node",
  target: "es2020",
  format: "cjs",
  external: ["react"], // React is a peer dependency
  treeShaking: true,
  legalComments: "none",
  sourcemap: true,
  loader: { ".js": "jsx" }, // Enable JSX for React components
  outfile: "dist/react.js",
});

const esm = readFileSync("dist/index.esm.js");
const min = readFileSync("dist/index.min.js");
const reactEsm = readFileSync("dist/react.esm.js");

console.log(`✅ Build complete:`);
console.log(`   dist/index.esm.js   — ${(esm.length / 1024).toFixed(1)} KB`);
console.log(`   dist/index.min.js   — ${(min.length / 1024).toFixed(1)} KB (CDN ready)`);
console.log(`   dist/react.esm.js   — ${(reactEsm.length / 1024).toFixed(1)} KB (React hooks)`);
console.log(`\n💡 CDN usage:`);
console.log(`   <script type="module">`);
console.log(`     import { windrunner } from "https://cdn.jsdelivr.net/npm/windrunner@${pkg.version}/dist/index.min.js";`);
console.log(`     windrunner({ autoStart: true });`);
console.log(`   </script>`);
console.log(`\n💡 React usage:`);
console.log(`   import { useWindrunner } from 'windrunner/react';`);

// copy TypeScript declaration to dist when available
const typesSrc = "src/index.d.ts";
if (existsSync(typesSrc)) {
  try {
    const typesText = readFileSync(typesSrc, "utf-8");
    writeFileSync("dist/index.d.ts", typesText, "utf-8");
    console.log(`\n   dist/index.d.ts     — TypeScript declarations bundled`);
  } catch (err) {
    console.warn("Could not write dist/index.d.ts:", err && err.message);
  }
}

// copy React TypeScript declarations
const reactTypesSrc = "src/react.d.ts";
if (existsSync(reactTypesSrc)) {
  try {
    const reactTypesText = readFileSync(reactTypesSrc, "utf-8");
    writeFileSync("dist/react.d.ts", reactTypesText, "utf-8");
    console.log(`   dist/react.d.ts     — React TypeScript declarations bundled`);
  } catch (err) {
    console.warn("Could not write dist/react.d.ts:", err && err.message);
  }
}
