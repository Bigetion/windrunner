# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-06-30

### 🎉 Major Features

#### Plugin System
- **NEW**: Complete plugin API for custom utilities and variants
- Add `plugin()` helper to create plugin definitions
- Add `PluginRegistry` class for managing custom utilities and variants
- Support pattern-based utilities with RegExp matching
- Support custom variants with selector transformation
- Access to theme and config in plugin context
- Plugins have priority over built-in utilities (allows overriding)
- Full TypeScript definitions for plugin API

**Plugin API:**
```javascript
import { windrunner, plugin } from 'windrunner';

const myPlugin = plugin(({ addUtility, addVariant, theme }) => {
  addUtility('glass', 'backdrop-filter: blur(10px);');
  addUtility(/^text-stroke-(\d+)$/, (match) => `...`);
  addVariant('parent-hover', (sel) => `.parent:hover ${sel}`);
});

windrunner({ plugins: [myPlugin] });
```

#### Comprehensive Documentation
- **NEW**: Complete documentation structure with 3,000+ lines
- Quick Start guide (5-minute setup)
- React integration guide (hooks, patterns, troubleshooting)
- Next.js integration guide (App Router, Pages Router, SSR strategies)
- FOUC Prevention guide (5 strategies with comparison matrix)
- Performance Optimization guide (5 strategies, monitoring, benchmarking)
- Production deployment checklists
- "When to Use Windrunner" decision matrices

### 📦 Example Plugins
- Text Stroke plugin (text outline effects)
- Glass Morphism plugin (glassmorphism effects)
- Custom Variants plugin (parent-hover, loading, etc.)

### 🔧 Developer Experience
- Add `defineUtilities()` helper for creating utility sets
- Add `defineResponsiveUtilities()` helper for responsive patterns
- Improved TypeScript definitions
- 68 comprehensive tests (all passing)

### 📊 Bundle Impact
- ESM: 140.4 KB (was 136.5 KB, +3%)
- Min: 88.5 KB (was 78 KB, +13% with full plugin system)
- Zero breaking changes - fully backward compatible

### 🐛 Bug Fixes
- None (this is a feature release)

### ⚠️ Breaking Changes
- None - fully backward compatible with v1.0.x

---

## [1.0.3] - 2026-06-28
- Add backdrop variant and extend pseudo-class/pseudo-element support

## [1.0.2] - 2026-06-27
- Bug fixes and improvements

## [1.0.1] - 2026-06-26
- chore(release): merge dev into master (d4f7527)
- chore: remove tmp-debug.mjs and apply compiler fix (d37537a)
- feat: add Tailwind feature support for filters, layout, transforms, interactivity, and typography (5a2d0d5)
- docs: update demo links and examples (59d93ee, b9771c9, 107773f)

## [1.0.0] - previous
- Initial release
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-06-25
- Initial public-ready release
