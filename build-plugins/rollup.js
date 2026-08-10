/**
 * Rollup Plugin for Windrunner Hybrid Mode
 * Extracts utility class names from source files at build time and generates critical CSS.
 *
 * @module build-plugins/rollup
 * @example
 * // rollup.config.js
 * import { windrunnerRollupPlugin } from 'windrunner/rollup';
 *
 * export default {
 *   plugins: [
 *     windrunnerRollupPlugin({
 *       include: ['src/**\/*.{jsx,tsx}'],
 *       output: 'windrunner-critical.css',
 *       theme: { colors: { brand: '#FF6B6B' } }
 *     })
 *   ]
 * };
 */

import { ClassExtractor } from './extractor.js';
import { compileCriticalCss } from '../src/compiler.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Resolve glob patterns to file paths using a recursive directory walk.
 * @param {string[]} patterns - Glob include patterns
 * @param {string[]} ignore - Glob exclude patterns
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
 * Rollup plugin for Windrunner hybrid mode.
 * Scans source files during buildStart, extracts utility classes,
 * and emits critical CSS as a bundle asset.
 *
 * @param {Object} [options={}] - Plugin options
 * @param {string[]} [options.include] - Glob patterns for files to scan (default: ['src/**\/*.{html,jsx,tsx,vue,svelte}'])
 * @param {string[]} [options.exclude] - Glob patterns for files to exclude (default: ['**\/node_modules/**', '**\/dist/**'])
 * @param {string} [options.output] - Output filename for critical CSS asset (default: 'windrunner-critical.css')
 * @param {Object} [options.theme] - Theme overrides passed to compileCriticalCss
 * @returns {Object} - Rollup plugin object
 */
export function windrunnerRollupPlugin(options = {}) {
  const {
    include = ['src/**/*.{html,jsx,tsx,vue,svelte}'],
    exclude = ['**/node_modules/**', '**/dist/**'],
    output = 'windrunner-critical.css',
    theme = {},
  } = options;

  let extractedClasses = [];

  return {
    name: 'windrunner',

    async buildStart() {
      const cwd = process.cwd();
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
    },

    generateBundle() {
      if (extractedClasses.length === 0) return;

      const css = compileCriticalCss(extractedClasses, { theme });

      if (!css) return;

      this.emitFile({
        type: 'asset',
        fileName: output,
        source: css,
      });
    },
  };
}

export default windrunnerRollupPlugin;
