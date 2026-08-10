import { describe, it, expect } from "vitest";
import { ClassExtractor } from "./extractor.js";

describe("ClassExtractor", () => {
  describe("constructor", () => {
    it("uses default include/exclude patterns when none provided", () => {
      const extractor = new ClassExtractor();
      expect(extractor.includePatterns).toEqual(['**/*.{html,jsx,tsx,vue,svelte}']);
      expect(extractor.excludePatterns).toEqual(['**/node_modules/**', '**/dist/**']);
    });

    it("accepts custom include/exclude patterns", () => {
      const extractor = new ClassExtractor({
        include: ['src/**/*.jsx'],
        exclude: ['**/test/**'],
      });
      expect(extractor.includePatterns).toEqual(['src/**/*.jsx']);
      expect(extractor.excludePatterns).toEqual(['**/test/**']);
    });
  });

  describe("shouldProcess", () => {
    it("includes files matching include patterns", () => {
      const extractor = new ClassExtractor({ include: ['**/*.html'] });
      expect(extractor.shouldProcess('src/index.html')).toBe(true);
    });

    it("excludes files matching exclude patterns", () => {
      const extractor = new ClassExtractor({
        include: ['**/*.html'],
        exclude: ['**/node_modules/**'],
      });
      expect(extractor.shouldProcess('node_modules/lib/index.html')).toBe(false);
    });

    it("handles brace expansion in patterns", () => {
      const extractor = new ClassExtractor({ include: ['**/*.{jsx,tsx}'] });
      expect(extractor.shouldProcess('src/App.jsx')).toBe(true);
      expect(extractor.shouldProcess('src/App.tsx')).toBe(true);
      expect(extractor.shouldProcess('src/App.html')).toBe(false);
    });

    it("normalizes backslashes in paths", () => {
      const extractor = new ClassExtractor({ include: ['src/**/*.html'] });
      expect(extractor.shouldProcess('src\\pages\\index.html')).toBe(true);
    });
  });

  describe("extractFromContent", () => {
    it("dispatches to HTML extractor for .html files", () => {
      const extractor = new ClassExtractor();
      const classes = extractor.extractFromContent('<div class="flex p-4"></div>', 'index.html');
      expect(classes).toContain('flex');
      expect(classes).toContain('p-4');
    });

    it("dispatches to JSX extractor for .jsx files", () => {
      const extractor = new ClassExtractor();
      const classes = extractor.extractFromContent('<div className="flex p-4"></div>', 'App.jsx');
      expect(classes).toContain('flex');
      expect(classes).toContain('p-4');
    });

    it("dispatches to JSX extractor for .tsx files", () => {
      const extractor = new ClassExtractor();
      const classes = extractor.extractFromContent('<div className="grid gap-4"></div>', 'App.tsx');
      expect(classes).toContain('grid');
      expect(classes).toContain('gap-4');
    });

    it("dispatches to Vue extractor for .vue files", () => {
      const extractor = new ClassExtractor();
      const vue = '<template><div class="flex"></div></template>';
      const classes = extractor.extractFromContent(vue, 'Component.vue');
      expect(classes).toContain('flex');
    });

    it("dispatches to Svelte extractor for .svelte files", () => {
      const extractor = new ClassExtractor();
      const classes = extractor.extractFromContent('<div class="flex"></div>', 'Component.svelte');
      expect(classes).toContain('flex');
    });

    it("returns empty array for unsupported file types", () => {
      const extractor = new ClassExtractor();
      expect(extractor.extractFromContent('body { color: red }', 'style.css')).toEqual([]);
    });

    it("returns empty array for empty content", () => {
      const extractor = new ClassExtractor();
      expect(extractor.extractFromContent('', 'index.html')).toEqual([]);
      expect(extractor.extractFromContent(null, 'index.html')).toEqual([]);
    });
  });

  describe("extractFromHTML", () => {
    it("extracts classes from class attributes with double quotes", () => {
      const extractor = new ClassExtractor();
      const html = '<div class="flex items-center justify-between p-4 bg-white"></div>';
      const classes = extractor.extractFromHTML(html);
      expect(classes).toEqual(['flex', 'items-center', 'justify-between', 'p-4', 'bg-white']);
    });

    it("extracts classes from class attributes with single quotes", () => {
      const extractor = new ClassExtractor();
      const html = "<div class='text-lg font-bold'></div>";
      const classes = extractor.extractFromHTML(html);
      expect(classes).toEqual(['text-lg', 'font-bold']);
    });

    it("extracts classes from multiple elements", () => {
      const extractor = new ClassExtractor();
      const html = `
        <div class="container mx-auto">
          <h1 class="text-2xl font-bold">Title</h1>
          <p class="text-gray-600">Content</p>
        </div>
      `;
      const classes = extractor.extractFromHTML(html);
      expect(classes).toContain('container');
      expect(classes).toContain('mx-auto');
      expect(classes).toContain('text-2xl');
      expect(classes).toContain('font-bold');
      expect(classes).toContain('text-gray-600');
    });

    it("handles classes with variants and modifiers", () => {
      const extractor = new ClassExtractor();
      const html = '<div class="hover:bg-blue-500 md:flex dark:text-white"></div>';
      const classes = extractor.extractFromHTML(html);
      expect(classes).toEqual(['hover:bg-blue-500', 'md:flex', 'dark:text-white']);
    });

    it("handles arbitrary values in classes", () => {
      const extractor = new ClassExtractor();
      const html = '<div class="w-[200px] bg-[#ff0000] grid-cols-[1fr_2fr]"></div>';
      const classes = extractor.extractFromHTML(html);
      expect(classes).toEqual(['w-[200px]', 'bg-[#ff0000]', 'grid-cols-[1fr_2fr]']);
    });

    it("handles empty class attribute", () => {
      const extractor = new ClassExtractor();
      const html = '<div class=""></div>';
      const classes = extractor.extractFromHTML(html);
      expect(classes).toEqual([]);
    });

    it("returns empty array for empty input", () => {
      const extractor = new ClassExtractor();
      expect(extractor.extractFromHTML('')).toEqual([]);
      expect(extractor.extractFromHTML(null)).toEqual([]);
    });

    it("handles multiple spaces between classes", () => {
      const extractor = new ClassExtractor();
      const html = '<div class="flex   items-center   p-4"></div>';
      const classes = extractor.extractFromHTML(html);
      expect(classes).toEqual(['flex', 'items-center', 'p-4']);
    });
  });

  describe("extractFromJSX", () => {
    it("extracts from static className with double quotes", () => {
      const extractor = new ClassExtractor();
      const code = 'return <div className="flex items-center gap-4">content</div>';
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('gap-4');
    });

    it("extracts from static className with single quotes", () => {
      const extractor = new ClassExtractor();
      const code = "return <div className='text-lg font-bold'>content</div>";
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('text-lg');
      expect(classes).toContain('font-bold');
    });

    it("extracts from className with brace-wrapped strings (double quotes)", () => {
      const extractor = new ClassExtractor();
      const code = 'return <div className={"flex items-center"}>content</div>';
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
    });

    it("extracts from className with brace-wrapped strings (single quotes)", () => {
      const extractor = new ClassExtractor();
      const code = "return <div className={'grid gap-4'}>content</div>";
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('grid');
      expect(classes).toContain('gap-4');
    });

    it("extracts static parts from template literals", () => {
      const extractor = new ClassExtractor();
      const code = 'return <div className={`flex items-center ${isActive ? "bg-blue-500" : "bg-gray-500"}`}>content</div>';
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
    });

    it("extracts from clsx calls", () => {
      const extractor = new ClassExtractor();
      const code = `const cls = clsx("flex items-center", isActive && "bg-blue-500");`;
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
    });

    it("extracts from classnames calls", () => {
      const extractor = new ClassExtractor();
      const code = `const cls = classnames("p-4 rounded", { active: isActive });`;
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('p-4');
      expect(classes).toContain('rounded');
    });

    it("extracts from cn utility calls", () => {
      const extractor = new ClassExtractor();
      const code = `const cls = cn("text-sm text-gray-600");`;
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('text-sm');
      expect(classes).toContain('text-gray-600');
    });

    it("extracts from classNames calls", () => {
      const extractor = new ClassExtractor();
      const code = `const cls = classNames("border border-red-500");`;
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('border');
      expect(classes).toContain('border-red-500');
    });

    it("handles multiple className attributes in a single file", () => {
      const extractor = new ClassExtractor();
      const code = `
        function App() {
          return (
            <div className="flex flex-col">
              <header className="bg-white shadow-sm p-4">
                <h1 className="text-2xl font-bold">Title</h1>
              </header>
              <main className="flex-1 p-6">Content</main>
            </div>
          );
        }
      `;
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('flex');
      expect(classes).toContain('flex-col');
      expect(classes).toContain('bg-white');
      expect(classes).toContain('shadow-sm');
      expect(classes).toContain('text-2xl');
      expect(classes).toContain('font-bold');
      expect(classes).toContain('flex-1');
      expect(classes).toContain('p-6');
    });

    it("handles responsive and state variants in JSX", () => {
      const extractor = new ClassExtractor();
      const code = '<Button className="md:flex hover:bg-blue-500 lg:grid-cols-3" />';
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('md:flex');
      expect(classes).toContain('hover:bg-blue-500');
      expect(classes).toContain('lg:grid-cols-3');
    });

    it("returns empty array for empty input", () => {
      const extractor = new ClassExtractor();
      expect(extractor.extractFromJSX('')).toEqual([]);
      expect(extractor.extractFromJSX(null)).toEqual([]);
    });
  });

  describe("extractFromVue", () => {
    it("extracts classes from template section", () => {
      const extractor = new ClassExtractor();
      const vue = `
        <template>
          <div class="flex items-center">
            <span class="text-lg">Hello</span>
          </div>
        </template>
        <script setup>
        import { ref } from 'vue';
        </script>
      `;
      const classes = extractor.extractFromVue(vue);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('text-lg');
    });

    it("extracts from :class bindings", () => {
      const extractor = new ClassExtractor();
      const vue = `
        <template>
          <div :class="p-4 rounded shadow-lg">content</div>
        </template>
      `;
      const classes = extractor.extractFromVue(vue);
      expect(classes).toContain('p-4');
      expect(classes).toContain('rounded');
      expect(classes).toContain('shadow-lg');
    });

    it("extracts from v-bind:class bindings", () => {
      const extractor = new ClassExtractor();
      const vue = `
        <template>
          <div v-bind:class="bg-white border">content</div>
        </template>
      `;
      const classes = extractor.extractFromVue(vue);
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border');
    });

    it("extracts both static class and :class bindings", () => {
      const extractor = new ClassExtractor();
      const vue = `
        <template>
          <div class="flex" :class="items-center gap-4">content</div>
        </template>
      `;
      const classes = extractor.extractFromVue(vue);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('gap-4');
    });

    it("handles Vue SFC without template section", () => {
      const extractor = new ClassExtractor();
      const vue = `
        <script setup>
        const x = 1;
        </script>
      `;
      const classes = extractor.extractFromVue(vue);
      expect(classes).toEqual([]);
    });

    it("returns empty array for empty input", () => {
      const extractor = new ClassExtractor();
      expect(extractor.extractFromVue('')).toEqual([]);
      expect(extractor.extractFromVue(null)).toEqual([]);
    });
  });

  describe("extractFromSvelte", () => {
    it("extracts from standard class attributes", () => {
      const extractor = new ClassExtractor();
      const svelte = `
        <div class="flex items-center p-4">
          <span class="text-lg font-bold">Hello</span>
        </div>
      `;
      const classes = extractor.extractFromSvelte(svelte);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('p-4');
      expect(classes).toContain('text-lg');
      expect(classes).toContain('font-bold');
    });

    it("extracts from class: directives", () => {
      const extractor = new ClassExtractor();
      const svelte = `
        <div class="base" class:active={isActive} class:highlighted={isHighlighted}>
          content
        </div>
      `;
      const classes = extractor.extractFromSvelte(svelte);
      expect(classes).toContain('base');
      expect(classes).toContain('active');
      expect(classes).toContain('highlighted');
    });

    it("handles Svelte components with script and style blocks", () => {
      const extractor = new ClassExtractor();
      const svelte = `
        <script>
          let isOpen = false;
        </script>

        <div class="container mx-auto">
          <button class="btn px-4 py-2" class:open={isOpen}>
            Toggle
          </button>
        </div>

        <style>
          .btn { cursor: pointer; }
        </style>
      `;
      const classes = extractor.extractFromSvelte(svelte);
      expect(classes).toContain('container');
      expect(classes).toContain('mx-auto');
      expect(classes).toContain('btn');
      expect(classes).toContain('px-4');
      expect(classes).toContain('py-2');
      expect(classes).toContain('open');
    });

    it("returns empty array for empty input", () => {
      const extractor = new ClassExtractor();
      expect(extractor.extractFromSvelte('')).toEqual([]);
      expect(extractor.extractFromSvelte(null)).toEqual([]);
    });
  });

  describe("addClasses and getAllClasses", () => {
    it("collects unique classes across multiple calls", () => {
      const extractor = new ClassExtractor();
      extractor.addClasses(['flex', 'p-4', 'bg-white']);
      extractor.addClasses(['flex', 'items-center', 'bg-white']);
      const all = extractor.getAllClasses();
      expect(all.sort()).toEqual(['bg-white', 'flex', 'items-center', 'p-4']);
    });

    it("ignores non-string and empty values", () => {
      const extractor = new ClassExtractor();
      extractor.addClasses(['flex', '', null, undefined, 123]);
      expect(extractor.getAllClasses()).toEqual(['flex']);
    });

    it("handles non-array input gracefully", () => {
      const extractor = new ClassExtractor();
      extractor.addClasses(null);
      extractor.addClasses(undefined);
      extractor.addClasses('not-array');
      expect(extractor.getAllClasses()).toEqual([]);
    });
  });

  describe("clear", () => {
    it("clears all collected classes", () => {
      const extractor = new ClassExtractor();
      extractor.addClasses(['flex', 'p-4']);
      expect(extractor.size).toBe(2);
      extractor.clear();
      expect(extractor.size).toBe(0);
      expect(extractor.getAllClasses()).toEqual([]);
    });
  });

  describe("size", () => {
    it("returns the count of unique classes", () => {
      const extractor = new ClassExtractor();
      extractor.addClasses(['flex', 'p-4', 'flex']);
      expect(extractor.size).toBe(2);
    });
  });

  describe("integration scenarios", () => {
    it("extracts from a complete React component file", () => {
      const extractor = new ClassExtractor();
      const code = `
        import React from 'react';
        import { cn } from './utils';

        export function Card({ title, children, variant }) {
          return (
            <div className="rounded-lg shadow-md overflow-hidden">
              <div className={\`p-4 \${variant === 'dark' ? 'bg-gray-900' : 'bg-white'}\`}>
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <div className={cn("text-gray-600", variant === 'dark' && "text-gray-300")}>
                  {children}
                </div>
              </div>
            </div>
          );
        }
      `;
      const classes = extractor.extractFromJSX(code);
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('shadow-md');
      expect(classes).toContain('overflow-hidden');
      expect(classes).toContain('p-4');
      expect(classes).toContain('text-xl');
      expect(classes).toContain('font-semibold');
      expect(classes).toContain('mb-2');
      expect(classes).toContain('text-gray-600');
    });

    it("full workflow: extract from multiple files and collect unique classes", () => {
      const extractor = new ClassExtractor();

      // HTML file
      const html = '<div class="container mx-auto p-4"><h1 class="text-2xl">Hello</h1></div>';
      extractor.addClasses(extractor.extractFromContent(html, 'index.html'));

      // JSX file
      const jsx = '<Button className="px-4 py-2 bg-blue-500 text-white rounded">Click</Button>';
      extractor.addClasses(extractor.extractFromContent(jsx, 'Button.jsx'));

      // Vue file
      const vue = '<template><div class="flex items-center"><slot/></div></template>';
      extractor.addClasses(extractor.extractFromContent(vue, 'Layout.vue'));

      // Svelte file
      const svelte = '<div class="grid grid-cols-3 gap-4">content</div>';
      extractor.addClasses(extractor.extractFromContent(svelte, 'Grid.svelte'));

      const allClasses = extractor.getAllClasses();
      expect(allClasses).toContain('container');
      expect(allClasses).toContain('mx-auto');
      expect(allClasses).toContain('px-4');
      expect(allClasses).toContain('bg-blue-500');
      expect(allClasses).toContain('flex');
      expect(allClasses).toContain('grid');
      expect(allClasses).toContain('grid-cols-3');
      expect(allClasses.length).toBeGreaterThan(10);
    });

    it("deduplicates classes across multiple file extractions", () => {
      const extractor = new ClassExtractor();

      extractor.addClasses(extractor.extractFromHTML('<div class="flex p-4"></div>'));
      extractor.addClasses(extractor.extractFromJSX('<div className="flex p-4"></div>'));
      extractor.addClasses(extractor.extractFromSvelte('<div class="flex p-4"></div>'));

      // Should only have unique values
      const allClasses = extractor.getAllClasses();
      const flexCount = allClasses.filter(c => c === 'flex').length;
      expect(flexCount).toBe(1);
    });
  });
});
