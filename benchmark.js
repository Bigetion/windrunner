/**
 * Performance benchmark for Windrunner optimizations
 * Measures compilation speed improvements
 */

import { compileClass, parseClass } from "./src/compiler.js";

const testClasses = [
  "flex",
  "bg-blue-500",
  "text-xl",
  "mt-4",
  "p-6",
  "rounded-lg",
  "shadow-md",
  "hover:bg-blue-600",
  "md:text-2xl",
  "lg:grid-cols-3",
  "border-gray-200",
  "opacity-75",
  "transition-colors",
  "duration-300",
  "gap-4",
  "items-center",
  "justify-between",
  "w-full",
  "h-screen",
  "min-h-[500px]",
  "bg-gradient-to-r",
  "from-blue-500",
  "to-purple-600",
  "ring-2",
  "ring-offset-2",
  "focus:outline-none",
  "group-hover:translate-x-2",
  "md:hover:scale-105",
  "dark:bg-gray-800",
  "placeholder-gray-400",
  "!important-class",
  "bg-blue-500/50",
  "backdrop-blur-sm",
  "divide-y",
  "divide-gray-200",
  "space-x-4",
  "transform",
  "rotate-45",
  "scale-150",
  "translate-x-4",
  "blur-sm",
  "grayscale",
  "animate-spin",
  "cursor-pointer",
  "select-none",
  "overflow-hidden",
  "truncate",
  "uppercase",
  "font-bold",
  "leading-tight",
  "tracking-wide",
];

function benchmark(name, fn, iterations = 10000) {
  // Warmup
  for (let i = 0; i < 100; i++) fn();
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  const duration = end - start;
  const perOp = duration / iterations;
  
  console.log(`${name}:`);
  console.log(`  Total: ${duration.toFixed(2)}ms`);
  console.log(`  Per operation: ${(perOp * 1000).toFixed(2)}μs`);
  console.log(`  Operations/sec: ${(1000 / perOp).toFixed(0)}`);
  console.log();
  
  return duration;
}

console.log("🚀 Windrunner Performance Benchmark\n");
console.log("=" .repeat(50));
console.log();

// Test 1: Single class compilation (cold)
console.log("📊 Test 1: Single class compilation (diverse classes)");
console.log("-".repeat(50));
benchmark("compileClass() - diverse", () => {
  const randomClass = testClasses[Math.floor(Math.random() * testClasses.length)];
  compileClass(randomClass);
});

// Test 2: Repeated class compilation (cache hit)
console.log("📊 Test 2: Repeated class compilation (cache benefit)");
console.log("-".repeat(50));
benchmark("compileClass() - repeated 'flex'", () => {
  compileClass("flex");
});

// Test 3: Parse class performance
console.log("📊 Test 3: parseClass performance (with cache)");
console.log("-".repeat(50));
const screens = { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" };
benchmark("parseClass() - repeated", () => {
  parseClass("md:hover:bg-blue-500", screens);
});

// Test 4: Batch compilation (realistic scenario)
console.log("📊 Test 4: Batch compilation (50 diverse classes)");
console.log("-".repeat(50));
benchmark("Batch compile 50 classes", () => {
  for (let i = 0; i < testClasses.length; i++) {
    compileClass(testClasses[i]);
  }
}, 200);

// Test 5: Prefix routing efficiency
console.log("📊 Test 5: Prefix categories performance");
console.log("-".repeat(50));
const prefixCategories = {
  "Layout (flex)": "flex",
  "Spacing (mt-4)": "mt-4",
  "Typography (text-xl)": "text-xl",
  "Colors (bg-blue-500)": "bg-blue-500",
  "Borders (rounded-lg)": "rounded-lg",
  "Effects (shadow-md)": "shadow-md",
  "Transforms (rotate-45)": "rotate-45",
  "Filters (blur-sm)": "blur-sm",
};

for (const [name, className] of Object.entries(prefixCategories)) {
  const duration = benchmark(`  ${name}`, () => compileClass(className), 5000);
}

console.log("=" .repeat(50));
console.log("✅ Benchmark complete!");
console.log();
console.log("Key Improvements:");
console.log("  ✓ Prefix router reduces builder checks from 30+ to 1-3");
console.log("  ✓ Parse cache eliminates repeated parsing overhead");
console.log("  ✓ Pre-compiled regex patterns avoid recreation");
console.log("  ✓ Cached patterns in resolvers speed up validation");
