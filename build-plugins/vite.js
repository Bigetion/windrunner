/**
 * Vite Plugin for Windrunner Hybrid Mode
 * Extracts utility class names from source files at build time and generates critical CSS.
 * 
 * @module build-plugins/vite
 * @example
 * // vite.config.js
 * import { defineConfig } from 'vite';
 * import { windrunnerPlugin } from 'windrunner/vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     windrunnerPlugin({
 *       include: ['src/**\/*.{jsx,tsx}'],
 *       output: 'windrunner-critical.css',
 *       theme: { colors: { brand: '#FF6B6B' } },
 *       injectIntoHtml: true,
 *     })
 *   ]
 * });
 */

import { ClassExtractor } from './extractor.js';
import { compileCriticalCss } from '../src/compiler.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Resolve glob patterns to file paths using a simple recursive directory walk.
 * Avoids external dependency on `glob` package.
 * @param {string[]} patterns - Glob patterns (simplified: supports ** and extensions)
 * @param {string[]} ignore - Patterns to ignore
 * @param {string} cwd - Current working directory
 * @returns {Promise<string[]>} - Matched file paths
 */
async function resolveFiles(patterns, ignore, cwd) {
  const extractor = new ClassExtractor({ include: patterns, exclude: ignore });
  const files = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(cwd, fullPath);

      if (entry.isDirectory()) {
        // Skip excluded directories quickly
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
          continue;
        }
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (extractor.shouldProcess(relativePath)) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(cwd);
  return files;
}

/**
 * Vite plugin for Windrunner hybrid mode.
 * Scans source files during build, extracts utility classes, and emits critical CSS.
 *
 * @param {Object} [options={}] - Plugin options
 * @param {string[]} [options.include] - Glob patterns for files to scan (default: ['src/**\/*.{html,jsx,tsx,vue,svelte}'])
 * @param {string[]} [options.exclude] - Glob patterns for files to exclude (default: ['**\/node_modules/**', '**\/dist/**'])
 * @param {string} [options.output] - Output filename for critical CSS asset (default: 'windrunner-critical.css')
 * @param {Object} [options.theme] - Theme overrides passed to compileCriticalCss
 * @param {boolean} [options.injectIntoHtml] - Whether to inject critical CSS inline into HTML (default: false)
 * @param {boolean} [options.emitFile] - Whether to emit the CSS as a bundle asset (default: true)
 * @returns {Object} - Vite plugin object
 */
export function windrunnerPlugin(options = {}) {
  const {
    include = ['src/**/*.{html,jsx,tsx,vue,svelte}'],
    exclude = ['**/node_modules/**', '**/dist/**'],
    output = 'windrunner-critical.css',
    theme = {},
    injectIntoHtml = false,
    emitFile = true,
  } = options;

  let extractedClasses = [];
  let compiledCss = '';
  let projectRoot = '';

  return {
    name: 'windrunner',

    configResolved(config) {
      projectRoot = config.root || process.cwd();
    },

    async buildStart() {
      const cwd = projectRoot || process.cwd();
      const extractor = new ClassExtractor({ include, exclude });

      const files = await resolveFiles(include, exclude, cwd);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const classes = extractor.extractFromContent(content, file);
          extractor.addClasses(classes);
        } catch {
          // Skip files that cannot be read
        }
      }

      extractedClasses = extractor.getAllClasses();

      if (extractedClasses.length > 0) {
        compiledCss = compileCriticalCss(extractedClasses, { theme });
      } else {
        compiledCss = '';
      }
    },

    generateBundle() {
      if (!emitFile || !compiledCss) return;

      this.emitFile({
        type: 'asset',
        fileName: output,
        source: compiledCss,
      });
    },

    transformIndexHtml(html) {
      if (!injectIntoHtml || !compiledCss) return html;

      const styleTag = `<style data-windrunner-critical>${compiledCss}</style>`;

      // Inject before closing </head>
      if (html.includes('</head>')) {
        return html.replace('</head>', `${styleTag}\n</head>`);
      }

      // Fallback: inject at start of document
      return `${styleTag}\n${html}`;
    },
  };
}

export default windrunnerPlugin;
