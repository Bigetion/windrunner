/**
 * Webpack Plugin for Windrunner Hybrid Mode
 * Extracts utility class names from source files at build time and generates critical CSS.
 *
 * @module build-plugins/webpack
 * @example
 * // webpack.config.js
 * const { WindrunnerWebpackPlugin } = require('windrunner/webpack');
 *
 * module.exports = {
 *   plugins: [
 *     new WindrunnerWebpackPlugin({
 *       include: ['src/**\/*.{jsx,tsx}'],
 *       output: 'assets/windrunner-critical.css',
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
 * Webpack plugin for Windrunner hybrid mode.
 * Scans source files before compilation, extracts utility classes,
 * and adds critical CSS to the build output.
 */
export class WindrunnerWebpackPlugin {
  /**
   * @param {Object} [options={}] - Plugin options
   * @param {string[]} [options.include] - Glob patterns for files to scan
   * @param {string[]} [options.exclude] - Glob patterns for files to exclude
   * @param {string} [options.output] - Output filename for critical CSS asset
   * @param {Object} [options.theme] - Theme overrides passed to compileCriticalCss
   */
  constructor(options = {}) {
    this.options = {
      include: ['src/**/*.{html,jsx,tsx,vue,svelte}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      output: 'windrunner-critical.css',
      theme: {},
      ...options,
    };

    this.extractedClasses = [];
  }

  /**
   * Apply the plugin to the webpack compiler.
   * @param {Object} compiler - Webpack compiler instance
   */
  apply(compiler) {
    const pluginName = 'WindrunnerWebpackPlugin';

    compiler.hooks.beforeCompile.tapPromise(pluginName, async () => {
      const cwd = compiler.context || process.cwd();
      const extractor = new ClassExtractor({
        include: this.options.include,
        exclude: this.options.exclude,
      });

      const files = await resolveFiles(
        this.options.include,
        this.options.exclude,
        cwd
      );

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const classes = extractor.extractFromContent(content, file);
          extractor.addClasses(classes);
        } catch {
          // Skip files that cannot be read
        }
      }

      this.extractedClasses = extractor.getAllClasses();
    });

    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      if (this.extractedClasses.length === 0) return;

      const css = compileCriticalCss(this.extractedClasses, {
        theme: this.options.theme,
      });

      if (!css) return;

      // Add CSS to compilation assets using the webpack RawSource interface
      const outputPath = this.options.output;
      compilation.assets[outputPath] = {
        source: () => css,
        size: () => css.length,
      };
    });
  }
}

export default WindrunnerWebpackPlugin;
