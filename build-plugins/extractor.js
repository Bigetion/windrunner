/**
 * Class Extraction Module for Windrunner Build Plugins
 * Extracts utility class names from source files for build-time CSS generation.
 * Supports: HTML, JSX/TSX, Vue SFCs, and Svelte components.
 *
 * @module build-plugins/extractor
 */

/**
 * Checks if a file path matches a glob pattern (simplified).
 * Supports *, **, and {ext1,ext2} patterns.
 * @param {string} filePath - The file path to test
 * @param {string} pattern - The glob pattern
 * @returns {boolean}
 */
function matchGlob(filePath, pattern) {
  // Normalize path separators
  const normalized = filePath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Convert glob to regex step by step
  let regexStr = '';
  let i = 0;

  while (i < normalizedPattern.length) {
    const char = normalizedPattern[i];

    if (char === '*') {
      if (normalizedPattern[i + 1] === '*') {
        // ** globstar - matches any number of path segments
        if (normalizedPattern[i + 2] === '/') {
          // **/  - matches zero or more directories
          regexStr += '(?:.+/|)';
          i += 3;
        } else {
          // ** at end - matches everything
          regexStr += '.*';
          i += 2;
        }
      } else {
        // Single * - matches anything except /
        regexStr += '[^/]*';
        i++;
      }
    } else if (char === '?') {
      regexStr += '[^/]';
      i++;
    } else if (char === '{') {
      // Brace expansion {a,b,c}
      const closeIdx = normalizedPattern.indexOf('}', i);
      if (closeIdx === -1) {
        regexStr += '\\{';
        i++;
      } else {
        const options = normalizedPattern.slice(i + 1, closeIdx).split(',').map(o => o.trim());
        // Escape dots in the options
        const escaped = options.map(o => o.replace(/[.+^$|()[\]\\]/g, '\\$&'));
        regexStr += `(?:${escaped.join('|')})`;
        i = closeIdx + 1;
      }
    } else if ('.+^$|()[]\\'.includes(char)) {
      // Escape regex special characters
      regexStr += '\\' + char;
      i++;
    } else {
      regexStr += char;
      i++;
    }
  }

  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(normalized);
}

/**
 * ClassExtractor - Extracts utility class names from various source file types.
 * Used by build tool plugins (Vite, Webpack, Rollup) for hybrid mode critical CSS generation.
 */
export class ClassExtractor {
  /**
   * @param {Object} options - Extractor options
   * @param {string[]} [options.include] - Glob patterns for files to include
   * @param {string[]} [options.exclude] - Glob patterns for files to exclude
   */
  constructor(options = {}) {
    this.includePatterns = options.include || ['**/*.{html,jsx,tsx,vue,svelte}'];
    this.excludePatterns = options.exclude || ['**/node_modules/**', '**/dist/**'];
    this.classSet = new Set();
  }

  /**
   * Check if a file should be processed based on include/exclude patterns
   * @param {string} filePath - Path to the file
   * @returns {boolean} - Whether the file should be processed
   */
  shouldProcess(filePath) {
    const normalized = filePath.replace(/\\/g, '/');

    // Check exclude patterns first
    for (const pattern of this.excludePatterns) {
      if (matchGlob(normalized, pattern)) {
        return false;
      }
    }

    // Check include patterns
    for (const pattern of this.includePatterns) {
      if (matchGlob(normalized, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract class names from file content based on file extension.
   * Dispatches to the appropriate extraction method.
   * @param {string} content - File content
   * @param {string} filePath - File path (used to determine file type)
   * @returns {string[]} - Array of extracted class names
   */
  extractFromContent(content, filePath) {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const ext = filePath.split('.').pop().toLowerCase();

    switch (ext) {
      case 'html':
        return this.extractFromHTML(content);
      case 'jsx':
      case 'tsx':
        return this.extractFromJSX(content);
      case 'vue':
        return this.extractFromVue(content);
      case 'svelte':
        return this.extractFromSvelte(content);
      default:
        return [];
    }
  }

  /**
   * Extract class names from HTML content.
   * Parses class="..." and class='...' attributes.
   * @param {string} html - HTML content
   * @returns {string[]} - Array of extracted class names
   */
  extractFromHTML(html) {
    if (!html || typeof html !== 'string') {
      return [];
    }

    const classes = [];

    // Match class="..." and class='...' (both double and single quotes)
    const classAttrRegex = /class\s*=\s*"([^"]*)"|class\s*=\s*'([^']*)'/gi;
    let match;

    while ((match = classAttrRegex.exec(html)) !== null) {
      const value = match[1] !== undefined ? match[1] : match[2];
      if (value) {
        const classList = value.split(/\s+/).filter(Boolean);
        classes.push(...classList);
      }
    }

    return classes;
  }

  /**
   * Extract class names from JSX/TSX content.
   * Handles:
   * - className="..." static strings
   * - className={'...'} brace-wrapped strings
   * - className={`...${var}...`} template literals (static parts only)
   * - clsx('...'), classnames('...'), cn('...'), classNames('...') utility calls
   * @param {string} code - JSX/TSX source code
   * @returns {string[]} - Array of extracted class names
   */
  extractFromJSX(code) {
    if (!code || typeof code !== 'string') {
      return [];
    }

    const classes = [];

    // Pattern 1: Static className="..." or className='...'
    const staticRegex = /className\s*=\s*"([^"]*)"|className\s*=\s*'([^']*)'/g;
    let match;

    while ((match = staticRegex.exec(code)) !== null) {
      const value = match[1] !== undefined ? match[1] : match[2];
      if (value) {
        const classList = value.split(/\s+/).filter(Boolean);
        classes.push(...classList);
      }
    }

    // Pattern 2: className={'...'} or className={"..."}
    const braceStringRegex = /className\s*=\s*\{\s*'([^']*)'\s*\}|className\s*=\s*\{\s*"([^"]*)"\s*\}/g;
    while ((match = braceStringRegex.exec(code)) !== null) {
      const value = match[1] !== undefined ? match[1] : match[2];
      if (value) {
        const classList = value.split(/\s+/).filter(Boolean);
        classes.push(...classList);
      }
    }

    // Pattern 3: Template literals className={`...`} - extract static parts
    const templateRegex = /className\s*=\s*\{\s*`([^`]*)`\s*\}/g;
    while ((match = templateRegex.exec(code)) !== null) {
      const template = match[1];
      // Extract static portions (before/between ${} expressions)
      const staticParts = template.split(/\$\{[^}]*\}/);
      for (const part of staticParts) {
        const classList = part.split(/\s+/).filter(Boolean);
        classes.push(...classList);
      }
    }

    // Pattern 4: clsx/classnames/cn/classNames utility calls
    // Matches the first string argument: clsx('classes here', ...)
    const clsxRegex = /(?:clsx|classnames|cn|classNames)\s*\(\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g;
    while ((match = clsxRegex.exec(code)) !== null) {
      const value = match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[3]);
      if (value) {
        // For template literals in clsx, also handle ${} expressions
        const staticParts = value.split(/\$\{[^}]*\}/);
        for (const part of staticParts) {
          const classList = part.split(/\s+/).filter(Boolean);
          classes.push(...classList);
        }
      }
    }

    // Pattern 5: Also extract from class="..." for JSX files that contain HTML-like markup
    const htmlClassRegex = /\bclass\s*=\s*"([^"]*)"|class\s*=\s*'([^']*)'/g;
    while ((match = htmlClassRegex.exec(code)) !== null) {
      const value = match[1] !== undefined ? match[1] : match[2];
      if (value) {
        const classList = value.split(/\s+/).filter(Boolean);
        classes.push(...classList);
      }
    }

    return classes;
  }

  /**
   * Extract class names from Vue Single File Component (SFC).
   * Handles:
   * - Static class="..." in <template>
   * - :class="..." and v-bind:class="..." bindings (string literal values)
   * @param {string} content - Vue SFC content
   * @returns {string[]} - Array of extracted class names
   */
  extractFromVue(content) {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const classes = [];

    // Extract from <template> section
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
    if (templateMatch) {
      const templateContent = templateMatch[1];

      // Standard class attributes
      classes.push(...this.extractFromHTML(templateContent));

      // :class bindings with string values
      const bindClassRegex = /(?::class|v-bind:class)\s*=\s*"([^"]*)"|(?::class|v-bind:class)\s*=\s*'([^']*)'/g;
      let match;
      while ((match = bindClassRegex.exec(templateContent)) !== null) {
        const value = match[1] !== undefined ? match[1] : match[2];
        if (value) {
          // Try to extract class names from Vue binding expressions
          // Handle simple string values and object/array keys
          const classList = value.split(/\s+/).filter(Boolean);
          classes.push(...classList);
        }
      }
    }

    // Also check <script> section for any class references
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      // Extract string literals that look like class names from script
      const jsxClasses = this.extractFromJSX(scriptMatch[1]);
      classes.push(...jsxClasses);
    }

    return classes;
  }

  /**
   * Extract class names from Svelte component files.
   * Svelte uses standard HTML class="..." syntax plus class: directives.
   * @param {string} content - Svelte component content
   * @returns {string[]} - Array of extracted class names
   */
  extractFromSvelte(content) {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const classes = [];

    // Svelte uses standard class="..." attributes
    classes.push(...this.extractFromHTML(content));

    // Svelte class: directives - class:name={condition}
    const classDirectiveRegex = /class:([a-zA-Z0-9_-]+)/g;
    let match;
    while ((match = classDirectiveRegex.exec(content)) !== null) {
      if (match[1]) {
        classes.push(match[1]);
      }
    }

    return classes;
  }

  /**
   * Get all unique extracted class names collected so far.
   * @returns {string[]} - Array of unique class names
   */
  getAllClasses() {
    return Array.from(this.classSet);
  }

  /**
   * Add class names to the internal set.
   * Deduplicates automatically.
   * @param {string[]} classes - Array of class names to add
   */
  addClasses(classes) {
    if (!Array.isArray(classes)) return;
    for (const cls of classes) {
      if (cls && typeof cls === 'string') {
        this.classSet.add(cls);
      }
    }
  }

  /**
   * Clear all collected classes.
   */
  clear() {
    this.classSet.clear();
  }

  /**
   * Get the count of unique extracted classes.
   * @returns {number}
   */
  get size() {
    return this.classSet.size;
  }
}
