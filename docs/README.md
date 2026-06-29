# Windrunner Documentation

Welcome to the Windrunner documentation! This guide will help you get started with zero-config Tailwind v4 runtime compilation in the browser.

## 📚 Documentation Structure

### Getting Started
- [Installation](./getting-started/installation.md) - Install and setup Windrunner
- [Quick Start](./getting-started/quick-start.md) - Get up and running in 5 minutes
- [Configuration](./getting-started/configuration.md) - Customize theme and options
- [Core Concepts](./getting-started/core-concepts.md) - How Windrunner works under the hood

### Framework Integration
- [React](./frameworks/react.md) - Integration with React & Hooks
- [Next.js](./frameworks/nextjs.md) - App Router, Pages Router, and SSR strategies
- [Vue](./frameworks/vue.md) - Vue 3 Composition API integration
- [Vanilla JavaScript](./frameworks/vanilla.md) - Pure JavaScript usage

### Guides
- [FOUC Prevention](./guides/fouc-prevention.md) - Prevent flash of unstyled content
- [Performance Optimization](./guides/performance.md) - Tips for production-grade performance
- [Dark Mode](./guides/dark-mode.md) - Implementing dark mode properly
- [Migration Guide](./guides/migration.md) - Migrate from traditional Tailwind or Play CDN
- [Troubleshooting](./guides/troubleshooting.md) - Common issues and solutions

### API Reference
- [windrunner()](./api/windrunner.md) - Auto-start runtime function
- [createWindrunner()](./api/create-windrunner.md) - Manual control runtime
- [compileClass()](./api/compile-class.md) - Compile single class to CSS
- [parseClass()](./api/parse-class.md) - Parse class into components

### Recipes
- [Custom Utilities](./recipes/custom-utilities.md) - Add project-specific utilities
- [Responsive Design](./recipes/responsive.md) - Mobile-first design patterns
- [Animations](./recipes/animations.md) - Custom animations and transitions
- [Forms](./recipes/forms.md) - Beautiful form styling
- [Loading States](./recipes/loading-states.md) - Skeleton screens and spinners

## 🚀 Quick Links

- [GitHub Repository](https://github.com/Bigetion/windrunner)
- [NPM Package](https://www.npmjs.com/package/windrunner)
- [Live Examples](../examples/)
- [Issue Tracker](https://github.com/Bigetion/windrunner/issues)

## 💡 Examples

Check out our example projects to see Windrunner in action:

1. **[Landing Page](../examples/landing.html)** - Modern marketing landing page
2. **[Todo App](../examples/todo-app/)** - React todo with dark mode
3. **[Coverage Demo](../examples/coverage/)** - Utility class coverage showcase

## 🤔 Need Help?

- [Troubleshooting Guide](./guides/troubleshooting.md)
- [GitHub Discussions](https://github.com/Bigetion/windrunner/discussions)
- [Report a Bug](https://github.com/Bigetion/windrunner/issues/new)

## 📖 Table of Contents

1. **Getting Started**
   - Why Windrunner?
   - Installation
   - Your first page
   - Configuration basics

2. **Core Concepts**
   - Runtime compilation
   - Mutation observer
   - Caching strategy
   - Performance characteristics

3. **Framework Integration**
   - React patterns
   - Next.js strategies
   - Vue best practices
   - Vanilla JS approaches

4. **Production Deployment**
   - FOUC prevention
   - Performance optimization
   - Bundle size analysis
   - When to use Windrunner

5. **Advanced Topics**
   - Custom theme extension
   - Manual instance control
   - Memory management
   - Multiple instances

## 🎯 Use Case Decision Matrix

| Use Case | Windrunner | Traditional Tailwind |
|----------|-----------|---------------------|
| **Rapid Prototyping** | ✅ Perfect | ⚠️ Requires setup |
| **Landing Pages** | ✅ Good | ✅ Better (smaller CSS) |
| **Internal Tools** | ✅ Perfect | ✅ Good |
| **Large SPAs** | ⚠️ Possible | ✅ Better |
| **E-commerce** | ⚠️ Consider carefully | ✅ Recommended |
| **No-Code Platforms** | ✅ Perfect | ❌ Can't use |
| **WordPress/Webflow** | ✅ Perfect | ⚠️ Complex setup |
| **SEO Critical** | ⚠️ Requires FOUC prevention | ✅ Better |
| **High Performance** | ⚠️ Runtime overhead | ✅ Zero runtime |

**Legend:**
- ✅ **Perfect/Recommended**: Best choice for this use case
- ✅ **Good**: Works well with minor considerations
- ⚠️ **Possible/Consider carefully**: Can work but has trade-offs
- ❌ **Not Recommended**: Better alternatives exist

---

## Contributing to Documentation

Found a typo or want to improve the docs? PRs are welcome!

1. Fork the repository
2. Create a docs branch: `git checkout -b docs/your-improvement`
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.
