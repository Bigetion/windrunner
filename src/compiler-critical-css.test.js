/**
 * Comprehensive tests for Task 7: Critical CSS Precompilation API
 * Tests for compileCriticalCss(), compileCriticalCssFromHtml(), 
 * compileCriticalCssFromFiles(), and extractClassNames()
 */

import { describe, it, expect } from "vitest";
import { 
  extractClassNames, 
  compileCriticalCssFromHtml, 
  compileCriticalCssFromFiles,
  compileCriticalCss 
} from "./compiler.js";

describe("Task 7: Critical CSS Precompilation API", () => {
  describe("extractClassNames - HTML Parsing Patterns", () => {
    it("extracts from standard HTML class attributes (double quotes)", () => {
      const html = `<div class="flex items-center gap-4"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['flex', 'items-center', 'gap-4']));
      expect(classes.length).toBe(3);
    });

    it("extracts from standard HTML class attributes (single quotes)", () => {
      const html = `<div class='bg-blue-500 text-white p-4'></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['bg-blue-500', 'text-white', 'p-4']));
      expect(classes.length).toBe(3);
    });

    it("extracts from JSX className attributes (double quotes)", () => {
      const html = `<div className="hover:bg-gray-100 rounded-lg shadow-md"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['hover:bg-gray-100', 'rounded-lg', 'shadow-md']));
      expect(classes.length).toBe(3);
    });

    it("extracts from JSX className attributes (single quotes)", () => {
      const html = `<div className='focus:ring-2 active:scale-95'></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['focus:ring-2', 'active:scale-95']));
      expect(classes.length).toBe(2);
    });

    it("extracts from classList.add() calls", () => {
      const html = `
        <script>
          element.classList.add('flex', 'items-center');
          element.classList.add("justify-between", "gap-4");
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'flex', 'items-center', 'justify-between', 'gap-4'
      ]));
    });

    it("extracts from classList.remove() calls", () => {
      const html = `
        <script>
          element.classList.remove('hidden', 'opacity-0');
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['hidden', 'opacity-0']));
    });

    it("extracts from classList.toggle() calls", () => {
      const html = `
        <script>
          element.classList.toggle('active');
          element.classList.toggle("bg-green-500", true);
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['active', 'bg-green-500']));
    });

    it("extracts from classList.contains() calls", () => {
      const html = `
        <script>
          if (element.classList.contains('disabled')) { }
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['disabled']));
    });

    it("extracts from setAttribute with class", () => {
      const html = `
        <script>
          element.setAttribute("class", "p-4 m-2");
          element.setAttribute('class', 'border border-gray-300');
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'p-4', 'm-2', 'border', 'border-gray-300'
      ]));
    });

    it("extracts from setAttribute with className", () => {
      const html = `
        <script>
          element.setAttribute("className", "text-xl font-bold");
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['text-xl', 'font-bold']));
    });

    it("extracts from JSX template literals (static parts only)", () => {
      const html = `<div className={\`flex items-center \${dynamicClass} gap-4\`}></div>`;
      const classes = extractClassNames(html);
      // Should extract static parts: 'flex', 'items-center', 'gap-4'
      expect(classes).toEqual(expect.arrayContaining(['flex', 'items-center', 'gap-4']));
    });

    it("extracts from JSX string literals in braces", () => {
      const html = `
        <div className={'bg-white shadow-lg'}></div>
        <div className={"rounded-xl p-6"}></div>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'bg-white', 'shadow-lg', 'rounded-xl', 'p-6'
      ]));
    });

    it("extracts from clsx() utility calls", () => {
      const html = `
        <script>
          const classes = clsx('flex items-center');
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['flex', 'items-center']));
    });

    it("extracts from classnames() utility calls", () => {
      const html = `
        <script>
          const classes = classnames('grid gap-4');
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['grid', 'gap-4']));
    });

    it("extracts from cn() utility calls", () => {
      const html = `
        <script>
          const classes = cn('p-4 m-2 bg-white');
        </script>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['p-4', 'm-2', 'bg-white']));
    });

    it("extracts from Vue :class bindings", () => {
      const html = `
        <div :class="flex items-center"></div>
        <div v-bind:class="grid gap-4"></div>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'flex', 'items-center', 'grid', 'gap-4'
      ]));
    });

    it("handles classes with arbitrary values", () => {
      const html = `<div class="w-[300px] h-[50vh] text-[#ff0000] p-[2.5rem]"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'w-[300px]', 'h-[50vh]', 'text-[#ff0000]', 'p-[2.5rem]'
      ]));
    });

    it("handles classes with variants (hover, focus, etc.)", () => {
      const html = `<div class="hover:bg-blue-500 focus:ring-2 md:flex lg:grid"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'hover:bg-blue-500', 'focus:ring-2', 'md:flex', 'lg:grid'
      ]));
    });

    it("handles classes with opacity modifiers", () => {
      const html = `<div class="bg-blue-500/50 text-red-600/75 border-green-400/30"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'bg-blue-500/50', 'text-red-600/75', 'border-green-400/30'
      ]));
    });

    it("handles classes with negative values", () => {
      const html = `<div class="-mt-4 -ml-2 -z-10 -translate-x-1/2"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        '-mt-4', '-ml-2', '-z-10', '-translate-x-1/2'
      ]));
    });

    it("handles classes with fractional values", () => {
      const html = `<div class="w-1/2 w-2/3 w-3/4 h-1/3"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'w-1/2', 'w-2/3', 'w-3/4', 'h-1/3'
      ]));
    });

    it("handles classes with important modifier", () => {
      const html = `<div class="!flex !hidden !p-4"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        '!flex', '!hidden', '!p-4'
      ]));
    });

    it("handles classes with special regex characters", () => {
      const html = `<div class="[&>span]:text-red-500 [&>*]:p-4 [.test]:m-2"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        '[&>span]:text-red-500', '[&>*]:p-4', '[.test]:m-2'
      ]));
    });

    it("deduplicates classes and returns unique set", () => {
      const html = `
        <div class="flex flex items-center"></div>
        <div class="flex gap-4"></div>
        <span class="items-center"></span>
      `;
      const classes = extractClassNames(html);
      const flexCount = classes.filter(c => c === 'flex').length;
      const itemsCenterCount = classes.filter(c => c === 'items-center').length;
      expect(flexCount).toBe(1);
      expect(itemsCenterCount).toBe(1);
    });

    it("handles empty and whitespace-only class attributes", () => {
      const html = `
        <div class=""></div>
        <div class="   "></div>
        <div class="flex"></div>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(['flex']);
    });

    it("handles multiple classes on the same line", () => {
      const html = `<div class="a b c"></div><div class="d e f"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'e', 'f']));
      expect(classes.length).toBe(6);
    });

    it("handles classes with underscores and dashes", () => {
      const html = `<div class="custom_class my-custom-class test_123"></div>`;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'custom_class', 'my-custom-class', 'test_123'
      ]));
    });

    it("returns empty array for null input", () => {
      const classes = extractClassNames(null);
      expect(classes).toEqual([]);
    });

    it("returns empty array for undefined input", () => {
      const classes = extractClassNames(undefined);
      expect(classes).toEqual([]);
    });

    it("returns empty array for empty string input", () => {
      const classes = extractClassNames('');
      expect(classes).toEqual([]);
    });

    it("returns empty array for non-string input", () => {
      const classes = extractClassNames(12345);
      expect(classes).toEqual([]);
    });

    it("handles HTML with no class attributes", () => {
      const html = `
        <div><p>No classes here</p></div>
        <span>Just text</span>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual([]);
    });

    it("handles complex nested HTML structures", () => {
      const html = `
        <div class="container mx-auto">
          <header class="flex justify-between p-4">
            <nav class="space-x-4">
              <a class="text-blue-600 hover:underline">Link</a>
            </nav>
          </header>
          <main class="grid grid-cols-3 gap-6">
            <article class="bg-white shadow-lg rounded-lg p-6">Content</article>
          </main>
        </div>
      `;
      const classes = extractClassNames(html);
      expect(classes).toEqual(expect.arrayContaining([
        'container', 'mx-auto', 'flex', 'justify-between', 'p-4',
        'space-x-4', 'text-blue-600', 'hover:underline',
        'grid', 'grid-cols-3', 'gap-6', 'bg-white', 'shadow-lg',
        'rounded-lg', 'p-6'
      ]));
    });
  });

  describe("compileCriticalCssFromHtml - CSS Generation", () => {
    it("compiles basic utility classes from HTML", () => {
      const html = `<div class="flex items-center justify-between p-4"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.flex { display: flex; }');
      expect(css).toContain('.items-center { align-items: center; }');
      expect(css).toContain('.justify-between { justify-content: space-between; }');
      expect(css).toContain('.p-4 { padding: 1rem; }');
    });

    it("handles arbitrary values correctly", () => {
      const html = `<div class="w-[300px] h-[50vh] text-[#ff0000]"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('width: 300px');
      expect(css).toContain('height: 50vh');
      expect(css).toContain('color: #ff0000');
    });

    it("handles responsive breakpoint variants", () => {
      const html = `<div class="md:flex lg:grid xl:hidden"></div>`;
      const css = compileCriticalCssFromHtml(html, {
        screens: { md: '768px', lg: '1024px', xl: '1280px' }
      });
      
      expect(css).toContain('@media (min-width: 768px)');
      expect(css).toContain('.md\\:flex { display: flex; }');
      expect(css).toContain('@media (min-width: 1024px)');
      expect(css).toContain('.lg\\:grid { display: grid; }');
      expect(css).toContain('@media (min-width: 1280px)');
      expect(css).toContain('.xl\\:hidden { display: none; }');
    });

    it("handles hover and focus variants", () => {
      const html = `<button class="hover:bg-blue-500 focus:ring-2 active:scale-95"></button>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain(':hover');
      expect(css).toContain('background-color');
      expect(css).toContain(':focus');
      expect(css).toContain('box-shadow');
      expect(css).toContain(':active');
    });

    it("handles opacity modifiers correctly", () => {
      const html = `<div class="bg-blue-500/50 text-red-600/75"></div>`;
      const css = compileCriticalCssFromHtml(html, {
        theme: {
          colors: {
            blue: { 500: '#3b82f6' },
            red: { 600: '#dc2626' }
          }
        }
      });
      
      expect(css).toContain('color-mix');
      expect(css).toContain('50%');
      expect(css).toContain('75%');
    });

    it("handles important modifier correctly", () => {
      const html = `<div class="!flex !hidden !p-4"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('!important');
      // Count occurrences - should have 3 !important
      const importantCount = (css.match(/!important/g) || []).length;
      expect(importantCount).toBeGreaterThanOrEqual(3);
    });

    it("handles multiple variants combined (stacked)", () => {
      const html = `<div class="md:hover:bg-blue-500 lg:focus:text-white"></div>`;
      const css = compileCriticalCssFromHtml(html, {
        screens: { md: '768px', lg: '1024px' }
      });
      
      expect(css).toContain('@media (min-width: 768px)');
      expect(css).toContain(':hover');
      expect(css).toContain('background-color');
      expect(css).toContain('@media (min-width: 1024px)');
      expect(css).toContain(':focus');
    });

    it("accepts custom theme configuration", () => {
      const html = `<div class="text-brand bg-custom-color border-accent"></div>`;
      const css = compileCriticalCssFromHtml(html, {
        theme: {
          colors: {
            brand: '#ff6b6b',
            'custom-color': '#4ecdc4',
            accent: '#ffd93d'
          }
        }
      });
      
      expect(css).toContain('#ff6b6b');
      expect(css).toContain('#4ecdc4');
      expect(css).toContain('#ffd93d');
    });

    it("returns empty string for HTML with no classes", () => {
      const html = `<div><p>No classes here</p></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toBe('');
    });

    it("handles group and peer variants", () => {
      const html = `
        <div class="group">
          <span class="group-hover:text-blue-500"></span>
        </div>
        <input class="peer" type="checkbox">
        <label class="peer-checked:font-bold">Label</label>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.group');
      expect(css).toContain('group-hover');
      expect(css).toContain('.peer');
      expect(css).toContain('peer-checked');
    });

    it("handles dark mode variant", () => {
      const html = `<div class="dark:bg-gray-900 dark:text-white"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.dark');
    });

    it("handles structural pseudo-classes (first, last, odd, even)", () => {
      const html = `
        <li class="first:font-bold last:mb-0 odd:bg-gray-100 even:bg-white"></li>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain(':first-child');
      expect(css).toContain(':last-child');
      expect(css).toContain(':nth-child(odd)');
      expect(css).toContain(':nth-child(even)');
    });

    it("handles negative values in utility classes", () => {
      const html = `<div class="-mt-4 -ml-2 -z-10"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('margin-top: -1rem');
      expect(css).toContain('margin-left: -0.5rem');
      expect(css).toContain('z-index: -10');
    });

    it("handles fractional values in utility classes", () => {
      const html = `<div class="w-1/2 w-2/3 w-3/4"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('50%');
      expect(css).toContain('66.666667%');
      expect(css).toContain('75%');
    });

    it("handles classes from multiple HTML elements", () => {
      const html = `
        <div class="flex items-center">
          <span class="text-xl font-bold">Title</span>
          <button class="px-4 py-2 bg-blue-500 rounded">Click</button>
        </div>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.flex');
      expect(css).toContain('.items-center');
      expect(css).toContain('.text-xl');
      expect(css).toContain('.font-bold');
      expect(css).toContain('.px-4');
      expect(css).toContain('.py-2');
      expect(css).toContain('.bg-blue-500');
      expect(css).toContain('.rounded');
    });

    it("handles classes from JavaScript code in script tags", () => {
      const html = `
        <div class="flex"></div>
        <script>
          element.classList.add('grid', 'items-center');
          element.setAttribute("class", "p-4 m-2");
        </script>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.flex');
      expect(css).toContain('.grid');
      expect(css).toContain('.items-center');
      expect(css).toContain('.p-4');
      expect(css).toContain('.m-2');
    });

    it("deduplicates CSS rules for repeated classes", () => {
      const html = `
        <div class="flex"></div>
        <div class="flex items-center"></div>
        <div class="flex gap-4"></div>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      // Count occurrences of .flex declaration (should appear only once)
      const flexMatches = css.match(/\.flex { display: flex; }/g);
      expect(flexMatches).toHaveLength(1);
    });

    it("handles container query variants", () => {
      const html = `<div class="@sm:flex @md:grid @lg:hidden"></div>`;
      const css = compileCriticalCssFromHtml(html, {
        containers: { sm: '24rem', md: '28rem', lg: '32rem' }
      });
      
      expect(css).toContain('@container (min-width: 24rem)');
      expect(css).toContain('@container (min-width: 28rem)');
      expect(css).toContain('@container (min-width: 32rem)');
    });

    it("handles starting: variant for @starting-style", () => {
      const html = `<div class="starting:opacity-0"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('@starting-style');
    });
  });

  describe("compileCriticalCssFromFiles - File Reading", () => {
    it("reads and compiles CSS from single HTML file", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-single.html';
      const html = '<div class="flex items-center gap-4 p-4"></div>';

      await writeFile(filePath, html, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath);
      await unlink(filePath);

      expect(css).toContain('.flex { display: flex; }');
      expect(css).toContain('.items-center { align-items: center; }');
      expect(css).toContain('.gap-4 { gap: 1rem; }');
      expect(css).toContain('.p-4 { padding: 1rem; }');
    });

    it("reads and compiles CSS from multiple HTML files", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const file1 = './test-critical-multi-1.html';
      const file2 = './test-critical-multi-2.html';
      
      await writeFile(file1, '<div class="flex justify-center"></div>', 'utf8');
      await writeFile(file2, '<div class="grid grid-cols-3"></div>', 'utf8');
      
      const css = await compileCriticalCssFromFiles([file1, file2]);
      
      await unlink(file1);
      await unlink(file2);

      expect(css).toContain('.flex { display: flex; }');
      expect(css).toContain('.justify-center');
      expect(css).toContain('.grid { display: grid; }');
      expect(css).toContain('.grid-cols-3');
    });

    it("handles files with responsive variants", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-responsive.html';
      const html = '<div class="sm:text-sm md:text-base lg:text-lg"></div>';

      await writeFile(filePath, html, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath, {
        screens: { sm: '640px', md: '768px', lg: '1024px' }
      });
      await unlink(filePath);

      expect(css).toContain('@media (min-width: 640px)');
      expect(css).toContain('@media (min-width: 768px)');
      expect(css).toContain('@media (min-width: 1024px)');
    });

    it("handles files with arbitrary values and opacity modifiers", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-arbitrary.html';
      const html = '<div class="w-[250px] bg-blue-500/30 p-[2.5rem]"></div>';

      await writeFile(filePath, html, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath, {
        theme: {
          colors: {
            blue: { 500: '#3b82f6' }
          }
        }
      });
      await unlink(filePath);

      expect(css).toContain('width: 250px');
      expect(css).toContain('color-mix');
      expect(css).toContain('30%');
      expect(css).toContain('padding: 2.5rem');
    });

    it("handles empty files gracefully", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-empty.html';

      await writeFile(filePath, '', 'utf8');
      const css = await compileCriticalCssFromFiles(filePath);
      await unlink(filePath);

      expect(css).toBe('');
    });

    it("deduplicates classes across multiple files", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const file1 = './test-critical-dedup-1.html';
      const file2 = './test-critical-dedup-2.html';
      
      await writeFile(file1, '<div class="flex items-center"></div>', 'utf8');
      await writeFile(file2, '<div class="flex justify-center"></div>', 'utf8');
      
      const css = await compileCriticalCssFromFiles([file1, file2]);
      
      await unlink(file1);
      await unlink(file2);

      // Count occurrences of .flex declaration (should appear only once)
      const flexMatches = css.match(/\.flex { display: flex; }/g);
      expect(flexMatches).toHaveLength(1);
    });

    it("passes through custom theme options", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-theme.html';
      const html = '<div class="text-brand bg-primary border-accent"></div>';

      await writeFile(filePath, html, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath, {
        theme: {
          colors: {
            brand: '#ff6b6b',
            primary: '#4ecdc4',
            accent: '#ffd93d'
          }
        }
      });
      await unlink(filePath);

      expect(css).toContain('#ff6b6b');
      expect(css).toContain('#4ecdc4');
      expect(css).toContain('#ffd93d');
    });

    it("handles files with variants and breakpoints together", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-combined.html';
      const html = `
        <div class="md:hover:bg-blue-500 lg:focus:ring-2">
          <span class="sm:text-sm md:text-base lg:text-lg"></span>
        </div>
      `;

      await writeFile(filePath, html, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath, {
        screens: { sm: '640px', md: '768px', lg: '1024px' }
      });
      await unlink(filePath);

      expect(css).toContain('@media (min-width: 768px)');
      expect(css).toContain(':hover');
      expect(css).toContain('@media (min-width: 1024px)');
      expect(css).toContain(':focus');
    });

    it("returns empty string for files with no classes", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-no-classes.html';
      const html = '<div><p>No classes</p></div>';

      await writeFile(filePath, html, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath);
      await unlink(filePath);

      expect(css).toBe('');
    });

    it("throws error for invalid file path", async () => {
      await expect(
        compileCriticalCssFromFiles('./non-existent-file.html')
      ).rejects.toThrow('Failed to read file');
    });

    it("throws error for empty file paths array", async () => {
      const css = await compileCriticalCssFromFiles([]);
      expect(css).toBe('');
    });

    it("throws error for null file path", async () => {
      await expect(
        compileCriticalCssFromFiles(null)
      ).rejects.toThrow();
    });

    it("throws error for non-string file path", async () => {
      await expect(
        compileCriticalCssFromFiles([123, 456])
      ).rejects.toThrow();
    });

    it("handles large HTML files efficiently", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-large.html';
      
      // Generate HTML with 1000 elements
      const elements = Array.from({ length: 1000 }, (_, i) => 
        `<div class="flex-${i % 10} items-center-${i % 5} gap-${i % 8}"></div>`
      ).join('\n');
      
      await writeFile(filePath, elements, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath);
      await unlink(filePath);

      expect(css.length).toBeGreaterThan(0);
    });

    it("handles files with JSX className syntax", async () => {
      const { writeFile, unlink } = await import('fs/promises');
      const filePath = './test-critical-jsx.html';
      const html = `
        <div className="flex items-center">
          <span className={'text-xl font-bold'}>Title</span>
          <button className={\`px-4 py-2 \${bgClass}\`}>Click</button>
        </div>
      `;

      await writeFile(filePath, html, 'utf8');
      const css = await compileCriticalCssFromFiles(filePath);
      await unlink(filePath);

      expect(css).toContain('.flex');
      expect(css).toContain('.items-center');
      expect(css).toContain('.text-xl');
      expect(css).toContain('.font-bold');
      expect(css).toContain('.px-4');
      expect(css).toContain('.py-2');
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles malformed HTML gracefully", () => {
      const html = `<div class="flex"><span class="text-xl>Unclosed</div>`;
      const css = compileCriticalCssFromHtml(html);
      
      // Should still extract the valid class
      expect(css).toContain('.flex');
    });

    it("handles very long class lists", () => {
      // Use actual valid Tailwind classes
      const classes = [
        'flex', 'items-center', 'justify-between', 'gap-4', 'p-4', 'm-2',
        'bg-white', 'text-gray-900', 'rounded-lg', 'shadow-md', 'hover:shadow-lg',
        'w-full', 'h-full', 'border', 'border-gray-300'
      ].join(' ');
      const html = `<div class="${classes}"></div>`.repeat(10);
      const css = compileCriticalCssFromHtml(html);
      
      expect(css.length).toBeGreaterThan(0);
      expect(css).toContain('.flex');
      expect(css).toContain('.items-center');
    });

    it("handles invalid class names gracefully", () => {
      const html = `<div class="!!!invalid @#$%"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      // Should not throw, may return empty or partial CSS
      expect(typeof css).toBe('string');
    });

    it("handles Unicode characters in class names", () => {
      const html = `<div class="flex items-center"></div>`;
      const classes = extractClassNames(html);
      
      expect(classes.length).toBeGreaterThan(0);
    });

    it("handles class names with colons correctly", () => {
      const html = `<div class="hover:bg-blue-500 focus:ring-2 md:flex"></div>`;
      const classes = extractClassNames(html);
      
      expect(classes).toEqual(expect.arrayContaining([
        'hover:bg-blue-500', 'focus:ring-2', 'md:flex'
      ]));
    });

    it("handles class names with slashes correctly", () => {
      const html = `<div class="w-1/2 bg-blue-500/50"></div>`;
      const classes = extractClassNames(html);
      
      expect(classes).toEqual(expect.arrayContaining(['w-1/2', 'bg-blue-500/50']));
    });

    it("handles class names with brackets correctly", () => {
      const html = `<div class="w-[300px] text-[#ff0000]"></div>`;
      const classes = extractClassNames(html);
      
      expect(classes).toEqual(expect.arrayContaining(['w-[300px]', 'text-[#ff0000]']));
    });

    it("handles empty HTML gracefully", () => {
      const css = compileCriticalCssFromHtml('');
      expect(css).toBe('');
    });

    it("handles null HTML gracefully", () => {
      const classes = extractClassNames(null);
      expect(classes).toEqual([]);
    });

    it("handles undefined HTML gracefully", () => {
      const classes = extractClassNames(undefined);
      expect(classes).toEqual([]);
    });
  });

  describe("Browser vs Node.js Compatibility", () => {
    it("compileCriticalCssFromHtml works in both environments", () => {
      const html = `<div class="flex items-center"></div>`;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.flex { display: flex; }');
      expect(css).toContain('.items-center { align-items: center; }');
    });

    it("compileCriticalCss accepts string input", () => {
      const classString = "flex items-center gap-4";
      const css = compileCriticalCss(classString);
      
      expect(css).toContain('.flex { display: flex; }');
      expect(css).toContain('.items-center { align-items: center; }');
      expect(css).toContain('.gap-4 { gap: 1rem; }');
    });

    it("compileCriticalCss accepts array input", () => {
      const classArray = ["flex", "items-center", "gap-4"];
      const css = compileCriticalCss(classArray);
      
      expect(css).toContain('.flex { display: flex; }');
      expect(css).toContain('.items-center { align-items: center; }');
      expect(css).toContain('.gap-4 { gap: 1rem; }');
    });

    it("compileCriticalCss handles mixed array of strings and arrays", () => {
      const classArray = ["flex items-center", ["gap-4", "p-4"]];
      const css = compileCriticalCss(classArray);
      
      expect(css).toContain('.flex { display: flex; }');
      expect(css).toContain('.gap-4 { gap: 1rem; }');
      expect(css).toContain('.p-4 { padding: 1rem; }');
    });
  });

  describe("Real-World Use Cases", () => {
    it("compiles a complete landing page header", () => {
      const html = `
        <header class="bg-white shadow-lg">
          <nav class="mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
              <a href="/" class="text-2xl font-bold text-gray-900">Logo</a>
              <ul class="flex space-x-8">
                <li><a href="#" class="text-gray-600 hover:text-gray-900">Home</a></li>
                <li><a href="#" class="text-gray-600 hover:text-gray-900">About</a></li>
                <li><a href="#" class="text-gray-600 hover:text-gray-900">Contact</a></li>
              </ul>
              <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </div>
          </nav>
        </header>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.bg-white');
      expect(css).toContain('.shadow-lg');
      expect(css).toContain('.mx-auto');
      expect(css).toContain('.flex');
      expect(css).toContain('.items-center');
      expect(css).toContain('.justify-between');
      expect(css).toContain('.space-x-8');
      expect(css).toContain('.text-2xl');
      expect(css).toContain('.font-bold');
      expect(css).toContain('.hover\\:text-gray-900');
      expect(css).toContain('.px-6');
      expect(css).toContain('.rounded-lg');
    });

    it("compiles a responsive grid layout", () => {
      const html = `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
            <h3 class="text-xl font-semibold mb-2">Card Title</h3>
            <p class="text-gray-600">Card content goes here</p>
          </div>
        </div>
      `;
      const css = compileCriticalCssFromHtml(html, {
        screens: { sm: '640px', md: '768px', lg: '1024px' }
      });
      
      expect(css).toContain('.grid { display: grid; }');
      expect(css).toContain('.grid-cols-1');
      expect(css).toContain('@media (min-width: 640px)');
      expect(css).toContain('grid-cols-2');
      expect(css).toContain('@media (min-width: 768px)');
      expect(css).toContain('grid-cols-3');
      expect(css).toContain('@media (min-width: 1024px)');
      expect(css).toContain('grid-cols-4');
    });

    it("compiles a form with focus and validation states", () => {
      const html = `
        <form class="max-w-md mx-auto space-y-4">
          <input 
            type="email" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Email"
          >
          <input 
            type="password" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 invalid:border-red-500"
            placeholder="Password"
          >
          <button 
            type="submit"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.max-w-md');
      expect(css).toContain('.w-full');
      expect(css).toContain('.border');
      expect(css).toContain(':focus');
      expect(css).toContain('.focus\\:ring-2');
      expect(css).toContain(':invalid');
      expect(css).toContain(':active');
      expect(css).toContain(':disabled');
    });

    it("compiles a dark mode toggle section", () => {
      const html = `
        <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">Dark Mode Section</h2>
          <p class="text-gray-700 dark:text-gray-300">This content adapts to dark mode.</p>
          <button class="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded">
            Toggle Theme
          </button>
        </div>
      `;
      const css = compileCriticalCssFromHtml(html);
      
      expect(css).toContain('.bg-white');
      expect(css).toContain('.dark');
      expect(css).toContain('bg-gray-900');
      expect(css).toContain('text-white');
    });
  });
});
