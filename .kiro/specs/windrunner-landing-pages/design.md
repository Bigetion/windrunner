# Design Document: Windrunner Landing Pages Collection

## Overview

The Windrunner Landing Pages Collection is a comprehensive library of 50 production-ready, industry-specific landing page templates that showcase Windrunner's zero-config Tailwind v4 runtime capabilities. This design document outlines the architecture, component patterns, asset strategies, and implementation approach for the remaining 47 landing pages (3 are complete: SaaS/Tech, AI Platform, Restaurant).

### Design Goals

1. **Consistency**: Establish reusable patterns across all templates while maintaining industry-specific character
2. **Performance**: Ensure sub-2-second load times with FOUC prevention and optimized assets
3. **Maintainability**: Create clear, well-documented code that developers can easily customize
4. **Visual Excellence**: Deliver polished, production-ready designs that require minimal modification
5. **Accessibility**: Meet WCAG AA standards for all templates
6. **Scalability**: Design a system that can grow beyond 50 templates

### Technology Stack

- **Runtime**: Windrunner (zero-config Tailwind v4)
- **HTML**: Semantic HTML5 structure
- **Fonts**: Google Fonts (2 families maximum per template)
- **Images**: Picsum Photos CDN (https://picsum.photos/)
- **Icons**: Heroicons (inline SVG, MIT licensed)
- **Animations**: Custom CSS keyframes (defined in `<style>` block)
- **Build**: None required (zero-config runtime)


## Architecture

### File Structure

```
examples/
├── landing.html                 # ✓ Complete (SaaS/Tech)
├── landing-ai.html              # ✓ Complete (AI Platform)
├── landing-restaurant.html      # ✓ Complete (Restaurant)
├── landing-photography.html     # Phase 2
├── landing-gym.html             # Phase 2
├── landing-salon.html           # Phase 2
└── ... (47 remaining templates)
```

### Naming Convention

- **Pattern**: `landing-{industry}.html`
- **Format**: kebab-case, lowercase, hyphens for multi-word industries
- **Examples**: 
  - ✓ `landing-real-estate.html`
  - ✓ `landing-coffee-shop.html`
  - ✗ `landing-realestate.html`
  - ✗ `landing_coffee_shop.html`

### npm Scripts

Each template gets a serve script in `package.json`:

```json
{
  "scripts": {
    "serve:restaurant": "http-server -o /examples/landing-restaurant.html",
    "serve:photography": "http-server -o /examples/landing-photography.html"
  }
}
```


## Template Architecture

### Standard HTML Structure

Every template follows this consistent structure:

```html
<!doctype html>
<html lang="en">
<head>
  <!-- Required meta tags -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO-optimized title -->
  <title>{Brand Name} — {Value Proposition}</title>
  
  <!-- Google Fonts preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family={FontFamily}&display=swap" rel="stylesheet" />
  
  <!-- FOUC prevention -->
  <style>html{opacity:0;transition:opacity .2s ease}</style>
  
  <!-- Windrunner integration -->
  <script type="module">
    import { windrunner } from "../dist/index.esm.js";
    windrunner({ 
      autoStart: true, 
      onReady: () => document.documentElement.style.opacity = "1" 
    });
  </script>
  
  <!-- Custom animations (cannot be JIT-compiled) -->
  <style>
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    /* Additional custom animations as needed */
  </style>
</head>
<body class="bg-{color}-{shade} text-{color}-{shade} antialiased">
  <!-- Content sections -->
</body>
</html>
```


### FOUC Prevention Technique

**Problem**: Windrunner compiles utility classes at runtime, causing a brief flash of unstyled content.

**Solution**: Three-part technique:

1. **Hide on load**: `<style>html{opacity:0;transition:opacity .2s ease}</style>`
2. **Runtime detection**: Windrunner initialization with `onReady` callback
3. **Reveal when ready**: `onReady: () => document.documentElement.style.opacity = "1"`

**Result**: Smooth fade-in transition once styles are compiled (200ms duration).

### Section Organization

Standard landing page structure (in order):

1. **Navigation Bar** — Fixed/sticky header with logo, menu, CTA
2. **Hero Section** — Above-the-fold headline, subheadline, CTA buttons, visual element
3. **Features/Benefits** — 3-6 feature cards explaining value propositions
4. **Social Proof** — Testimonials, statistics, client logos, ratings
5. **Secondary Content** — Industry-specific (gallery, about, portfolio, menu, etc.)
6. **Pricing/CTA** — Pricing tables or strong conversion section
7. **Contact/Location** — Contact information, address, hours, map placeholder
8. **Footer** — Comprehensive footer with links, social media, copyright


## Asset Strategy

### Image Strategy: Picsum Photos

**Service**: https://picsum.photos/ (Free, CDN-backed, high-quality placeholder images)

**Standard Dimensions**:
- **Hero images**: 1200x800 (`https://picsum.photos/1200/800`)
- **Feature/card images**: 600x400 (`https://picsum.photos/600/400`)
- **Thumbnails**: 300x300 (`https://picsum.photos/300/300`)
- **Gallery squares**: 400x400 (`https://picsum.photos/400/400`)

**Query Parameters**:
- `?blur` — Blurred background effects
- `?grayscale` — Grayscale images for specific aesthetics
- `?random={seed}` — Consistent random images (use seed for repeatability)
- Specific IDs: `https://picsum.photos/id/{id}/width/height`

**Implementation Pattern**:

```html
<!-- Hero image with aspect ratio -->
<img 
  src="https://picsum.photos/1200/800?random=1" 
  alt="Professional photography studio workspace"
  loading="lazy"
  class="w-full h-full object-cover rounded-3xl"
/>

<!-- Background blur -->
<div 
  class="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
  style="background-image: url('https://picsum.photos/1200/800?blur=5')"
></div>
```

**Best Practices**:
- Use `loading="lazy"` for images below the fold
- Apply `aspect-ratio` utilities to prevent layout shift
- Use `object-cover` or `object-contain` for proper fitting
- Provide descriptive `alt` text for accessibility
- Use specific Picsum IDs for industry-relevant imagery where possible


### Icon Strategy: Heroicons

**Library**: https://heroicons.com/ (MIT licensed by Tailwind Labs)

**Icon Variants**:
- **Outline**: For navigation, subtle elements, secondary actions
- **Solid**: For primary actions, filled states, emphasis

**Standard Size**: `w-6 h-6` (24x24px) — adjust contextually

**Implementation Pattern**:

```html
<!-- Outline icon for navigation -->
<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
</svg>

<!-- Solid icon for primary action -->
<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
</svg>
```

**Color Theming with currentColor**:

```html
<!-- Icon inherits text color -->
<a href="#" class="flex items-center gap-2 text-blue-600 hover:text-blue-700">
  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">...</svg>
  <span>Learn more</span>
</a>
```

**Spacing Guidelines**:
- Icon + text inline: `gap-2` (8px)
- Icon + text in cards: `gap-3` (12px)
- Icon-only buttons: `p-2` or `p-3` padding

### Emoji Strategy

**Use Cases**:
- Hero section decorative elements
- Feature card icons (when appropriate for industry)
- Supplementary visual interest
- Casual, friendly brand tones

**Best Practices**:
- Use large emoji for impact: `text-6xl`, `text-7xl`, `text-8xl`, `text-9xl`
- Combine with animations: `animate-float` for playful effect
- Maintain professionalism: Use sparingly in formal industries (law, finance)


## Design System

### Color Strategy

Each template follows an industry-specific color psychology:

| Industry | Primary Color | Psychology | Example Palette |
|----------|---------------|------------|-----------------|
| Healthcare | Blue | Trust, calm, cleanliness | `blue-600`, `sky-500`, `cyan-400` |
| Environmental | Green | Nature, sustainability | `emerald-600`, `teal-500`, `lime-400` |
| Luxury | Gold/Purple | Prestige, elegance | `amber-600`, `purple-600`, `rose-400` |
| Tech/SaaS | Blue/Purple | Innovation, reliability | `violet-600`, `indigo-500`, `cyan-400` |
| Food/Restaurant | Warm tones | Appetite, warmth | `amber-600`, `orange-500`, `red-400` |
| Creative | Vibrant | Energy, creativity | `fuchsia-600`, `pink-500`, `purple-400` |
| Financial | Blue/Gray | Trust, stability | `slate-700`, `blue-600`, `gray-500` |
| Fitness | Red/Orange | Energy, strength | `red-600`, `orange-500`, `amber-400` |

**Color Application Pattern**:

```css
/* Background hierarchy */
bg-{color}-50      /* Lightest background */
bg-{color}-100     /* Light sections */
bg-white           /* Cards, content areas */
bg-{color}-900     /* Dark sections (testimonials, footer) */
bg-{color}-950     /* Darkest (dark mode style) */

/* Text hierarchy */
text-{color}-900   /* Primary headings */
text-{color}-700   /* Body text */
text-{color}-500   /* Secondary text */
text-{color}-400   /* Muted text */

/* Buttons/CTAs */
bg-{color}-600     /* Primary CTA */
hover:bg-{color}-700
bg-{color}-100     /* Secondary CTA */
border-{color}-600
```


### Typography System

**Font Selection by Industry**:

| Industry Type | Font Pairing | Character |
|---------------|-------------|-----------|
| Formal/Luxury | Playfair Display + Inter | Elegant, sophisticated |
| Modern/Tech | Inter (variable weight) | Clean, professional |
| Creative | Poppins + Inter | Friendly, approachable |
| Traditional | Lora + Open Sans | Classic, trustworthy |
| Playful | Quicksand + Inter | Fun, casual |

**Typography Scale** (Tailwind classes):

```css
/* Headings */
text-6xl md:text-7xl lg:text-8xl   /* Hero H1 */
text-4xl md:text-5xl                /* Section H2 */
text-2xl md:text-3xl                /* Sub-section H3 */
text-xl md:text-2xl                 /* Card headings */
text-lg                             /* Large body */

/* Body text */
text-base                           /* Standard (16px) */
text-sm                             /* Small (14px) */
text-xs                             /* Extra small (12px) */

/* Font weights */
font-black     /* 900 - Hero headlines only */
font-bold      /* 700 - Headings, CTAs */
font-semibold  /* 600 - Subheadings, labels */
font-medium    /* 500 - Navigation, buttons */
font-normal    /* 400 - Body text */
font-light     /* 300 - Subtle text (rare) */

/* Line height */
leading-tight    /* Headings (1.25) */
leading-normal   /* Default (1.5) */
leading-relaxed  /* Body paragraphs (1.625) */
```

**Responsive Typography Pattern**:

```html
<h1 class="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
  Your Headline
</h1>
<p class="text-base md:text-lg text-slate-600 leading-relaxed">
  Body paragraph with comfortable reading size
</p>
```


### Spacing System

**Tailwind Scale** (based on 4px unit):

```css
/* Container padding */
px-6           /* Mobile: 24px */
px-8           /* Tablet: 32px */
px-12          /* Desktop: 48px (rare) */

/* Section vertical spacing */
py-20          /* Standard section: 80px */
py-24          /* Large section: 96px */
py-28          /* Extra large: 112px */
py-32          /* Hero sections: 128px */

/* Component spacing */
gap-2          /* 8px - Tight spacing (icon + text) */
gap-3          /* 12px - Default spacing */
gap-4          /* 16px - Medium spacing */
gap-6          /* 24px - Large spacing (cards) */
gap-8          /* 32px - XL spacing (grid columns) */

/* Margin utilities */
mb-4           /* Small bottom margin: 16px */
mb-6           /* Medium: 24px */
mb-8           /* Large: 32px */
mb-12          /* XL: 48px */
mb-16          /* XXL: 64px (between major sections) */
```

**Consistent Spacing Application**:

- Navbar height: `h-16` or `h-20` (64px or 80px)
- Hero top padding: `pt-32` or `pt-40` (accounts for fixed navbar)
- Card padding: `p-6` or `p-8`
- Button padding: `px-6 py-3` (primary) or `px-4 py-2` (secondary)
- Grid gaps: `gap-6` (mobile), `gap-8` (desktop)

### Border Radius System

```css
rounded-lg      /* 8px - Buttons, small cards */
rounded-xl      /* 12px - Medium buttons, badges */
rounded-2xl     /* 16px - Cards, sections */
rounded-3xl     /* 24px - Large cards, feature sections */
rounded-full    /* Pills, circular elements, CTA buttons */
```

**Border radius application by component**:

- Primary CTAs: `rounded-full` or `rounded-xl`
- Feature cards: `rounded-2xl` or `rounded-3xl`
- Images: `rounded-xl`, `rounded-2xl`, or `rounded-3xl`
- Badges/pills: `rounded-full`
- Input fields: `rounded-lg` or `rounded-xl`


### Shadow & Depth System

```css
/* Elevation levels */
shadow-sm       /* Subtle: navbar, subtle cards */
shadow-md       /* Medium: dropdowns, popovers */
shadow-lg       /* Large: cards on hover, modals */
shadow-xl       /* XL: primary CTAs, featured cards */
shadow-2xl      /* XXL: hero images, major elements */

/* Colored shadows (for primary CTAs) */
shadow-{color}-900/20    /* 20% opacity */
shadow-{color}-900/30    /* 30% opacity */
shadow-{color}-900/40    /* 40% opacity */

/* Example usage */
class="shadow-xl shadow-blue-900/30"    /* Blue CTA with colored shadow */
```

**Shadow Application Pattern**:

- **Navbar**: `shadow-sm` (subtle)
- **Cards (default)**: `shadow-lg`
- **Cards (hover)**: `shadow-xl` or `shadow-2xl`
- **Primary CTAs**: `shadow-xl shadow-{primary-color}-900/30`
- **Hero images**: `shadow-2xl`
- **Floating badges**: `shadow-lg` or `shadow-xl`

### Border System

```css
/* Border widths */
border          /* 1px - Standard */
border-2        /* 2px - Emphasized */
border-4        /* 4px - Strong emphasis (rare) */

/* Border colors (transparency-based) */
border-white/5      /* Very subtle (dark backgrounds) */
border-white/10     /* Subtle (dark backgrounds) */
border-white/20     /* Visible (dark backgrounds) */
border-{color}-200  /* Light borders (light backgrounds) */
border-{color}-300  /* Medium borders */
border-{color}-500  /* Strong borders (CTAs) */
```

**Border Application**:

- Glass-morphism cards: `border border-white/10`
- Secondary CTAs: `border-2 border-{color}-600`
- Section dividers: `border-t border-{color}-200`
- Dark theme cards: `border border-white/5`


## Component Patterns

### Navigation Bar

**Standard Pattern** (fixed/sticky):

```html
<nav class="fixed top-0 inset-x-0 z-50 border-b border-{color}-200 bg-white/95 backdrop-blur-md shadow-sm">
  <div class="mx-auto max-w-7xl px-6 flex items-center justify-between h-20">
    <!-- Logo -->
    <div class="flex items-center gap-3">
      <div class="text-3xl">{emoji}</div>
      <span class="text-2xl font-bold text-{color}-900">{Brand}</span>
    </div>
    
    <!-- Desktop Navigation -->
    <div class="hidden md:flex items-center gap-8 text-sm font-medium text-{color}-700">
      <a href="#section" class="hover:text-{color}-900 transition-colors">Link</a>
      <!-- More links -->
    </div>
    
    <!-- CTA -->
    <a href="#cta" class="px-6 py-2.5 rounded-full bg-{color}-600 hover:bg-{color}-700 text-white text-sm font-semibold shadow-lg transition-all">
      Primary CTA
    </a>
  </div>
</nav>
```

**Variations**:
- **Light theme**: `bg-white/95 backdrop-blur-md border-{color}-200`
- **Dark theme**: `bg-slate-950/80 backdrop-blur-md border-white/10`
- **Transparent** (on hero): `bg-transparent` (becomes solid on scroll - requires JS)


### Hero Section

**Pattern A: Text-Heavy Hero**

```html
<section class="relative pt-40 pb-20 px-6 bg-gradient-to-br from-{color}-100 to-{color}-50">
  <div class="mx-auto max-w-4xl text-center">
    <!-- Badge -->
    <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-{color}-200/50 border border-{color}-300 text-{color}-900 text-sm font-medium mb-6">
      <span>✨</span>
      New Feature Launched
    </span>
    
    <!-- Headline -->
    <h1 class="text-6xl md:text-7xl font-black text-{color}-900 mb-6 leading-tight">
      Your Main Headline
      <span class="text-{color}-600">With Accent</span>
    </h1>
    
    <!-- Subheadline -->
    <p class="text-xl text-{color}-600 mb-10 max-w-2xl mx-auto">
      Compelling value proposition that explains what you do
    </p>
    
    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#" class="px-8 py-4 rounded-full bg-{color}-600 hover:bg-{color}-700 text-white font-semibold shadow-xl transition-all hover:scale-105">
        Primary CTA
      </a>
      <a href="#" class="px-8 py-4 rounded-full border-2 border-{color}-600 hover:bg-{color}-50 text-{color}-900 font-semibold transition-all">
        Secondary CTA
      </a>
    </div>
  </div>
</section>
```

**Pattern B: Split Hero (Text + Image)**

```html
<section class="relative pt-32 pb-20 px-6 bg-gradient-to-br from-{color}-100 to-{color}-50">
  <div class="mx-auto max-w-7xl">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Text Content -->
      <div class="animate-slide-up">
        <h1 class="text-5xl md:text-6xl font-black text-{color}-900 mb-6">
          Your Headline
        </h1>
        <p class="text-lg text-{color}-600 mb-8">
          Value proposition paragraph
        </p>
        <div class="flex gap-4">
          <!-- CTAs -->
        </div>
      </div>
      
      <!-- Hero Image -->
      <div class="relative">
        <img src="https://picsum.photos/1200/800?random=1" alt="Description" class="rounded-3xl shadow-2xl" />
      </div>
    </div>
  </div>
</section>
```


### Feature Cards

**Pattern: 3-Column Grid**

```html
<section class="py-20 px-6 bg-white">
  <div class="mx-auto max-w-7xl">
    <!-- Section Header -->
    <div class="text-center mb-16">
      <span class="inline-block px-4 py-1.5 rounded-full bg-{color}-100 text-{color}-800 text-sm font-semibold mb-4">
        Features
      </span>
      <h2 class="text-4xl md:text-5xl font-bold text-{color}-900 mb-4">
        Section Heading
      </h2>
      <p class="text-lg text-{color}-600 max-w-2xl mx-auto">
        Supporting description
      </p>
    </div>
    
    <!-- Feature Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Feature Card 1 -->
      <div class="group text-center p-8 rounded-3xl border-2 border-{color}-200 hover:border-{color}-300 hover:bg-{color}-50/50 transition-all">
        <div class="text-6xl mb-4">🎯</div>
        <h3 class="text-xl font-bold text-{color}-900 mb-3">Feature Title</h3>
        <p class="text-{color}-600 leading-relaxed">
          Feature description explaining the benefit
        </p>
      </div>
      
      <!-- More cards... -->
    </div>
  </div>
</section>
```

**Card Variations**:
- **Outline cards**: `border-2 hover:border-{color}-300`
- **Filled cards**: `bg-{color}-50 hover:bg-{color}-100`
- **Glass-morphism**: `bg-white/5 backdrop-blur-sm border border-white/10`
- **Icon-based**: Replace emoji with Heroicon SVG


### CTA Buttons

**Primary CTA Pattern**:

```html
<!-- Solid, high-contrast, action-oriented -->
<a href="#" class="px-8 py-4 rounded-full bg-{color}-600 hover:bg-{color}-700 text-white font-semibold shadow-xl shadow-{color}-900/30 transition-all hover:scale-105">
  Get Started Free
</a>
```

**Secondary CTA Pattern**:

```html
<!-- Outline, less emphasis -->
<a href="#" class="px-8 py-4 rounded-full border-2 border-{color}-600 hover:bg-{color}-50 text-{color}-900 font-semibold transition-all">
  Learn More
</a>
```

**Tertiary/Text Link Pattern**:

```html
<!-- Minimal, text-based -->
<a href="#" class="inline-flex items-center gap-2 text-{color}-600 hover:text-{color}-700 font-semibold transition-colors">
  View Details
  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
  </svg>
</a>
```

**CTA Copy Guidelines**:
- ✓ "Start Free Trial" (specific, action-oriented)
- ✓ "Book Your Session" (industry-specific)
- ✓ "Get Instant Access" (benefit-focused)
- ✗ "Click Here" (vague)
- ✗ "Submit" (generic)


### Testimonial Cards

**Pattern: 3-Column Testimonial Grid**

```html
<section class="py-20 px-6 bg-{color}-900">
  <div class="mx-auto max-w-7xl">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
        What Our Customers Say
      </h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Testimonial Card -->
      <div class="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
        <div class="flex gap-1 text-amber-400 mb-4">
          <span>⭐⭐⭐⭐⭐</span>
        </div>
        <p class="text-{color}-300 leading-relaxed mb-6 italic">
          "Testimonial quote that highlights a specific benefit or transformation."
        </p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-{color}-400 to-{color}-600 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <p class="font-semibold text-white">John Doe</p>
            <p class="text-sm text-{color}-400">CEO, Company Name</p>
          </div>
        </div>
      </div>
      
      <!-- More testimonials... -->
    </div>
  </div>
</section>
```

**Testimonial Best Practices**:
- Use realistic names and job titles
- Include 5-star ratings visually
- Keep quotes under 150 characters
- Use avatar initials or gradient circles
- Apply glassmorphism on dark backgrounds


### Pricing Tables

**Pattern: 3-Tier Pricing**

```html
<section class="py-24 px-6 bg-white">
  <div class="mx-auto max-w-7xl">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-{color}-900 mb-4">
        Simple Pricing
      </h2>
      <p class="text-lg text-{color}-600">Choose the plan that fits your needs</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Basic Plan -->
      <div class="rounded-3xl border border-{color}-200 bg-white p-8">
        <p class="text-sm font-semibold text-{color}-600 mb-2">Basic</p>
        <p class="text-4xl font-black text-{color}-900 mb-1">$19<span class="text-lg font-medium text-{color}-600">/mo</span></p>
        <p class="text-sm text-{color}-500 mb-8">Perfect for individuals</p>
        <ul class="space-y-3 text-sm text-{color}-600 mb-10">
          <li class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            Feature name
          </li>
        </ul>
        <button class="w-full px-6 py-3 rounded-xl border border-{color}-300 hover:bg-{color}-50 text-{color}-900 font-semibold transition-all">
          Choose Basic
        </button>
      </div>
      
      <!-- Pro Plan (Featured) -->
      <div class="relative rounded-3xl border-2 border-{color}-500 bg-{color}-50 p-8 shadow-xl">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-{color}-600 text-white text-xs font-bold">
          Most Popular
        </div>
        <!-- Similar structure with enhanced styling -->
      </div>
      
      <!-- Enterprise Plan -->
      <!-- Similar to Basic -->
    </div>
  </div>
</section>
```


### Footer

**Standard Footer Pattern**:

```html
<footer class="bg-{color}-950 border-t border-white/10 py-12 px-6">
  <div class="mx-auto max-w-7xl">
    <!-- Main Footer Content -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <!-- Brand Column -->
      <div class="col-span-1 md:col-span-2">
        <div class="flex items-center gap-3 mb-4">
          <div class="text-3xl">{emoji}</div>
          <span class="text-2xl font-bold text-white">{Brand}</span>
        </div>
        <p class="text-{color}-400 leading-relaxed mb-6 max-w-md">
          Brief company description or tagline
        </p>
        <!-- Social Media Icons -->
        <div class="flex items-center gap-4">
          <a href="#" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-{color}-400 hover:text-{color}-300 transition-colors">
            {Social Icon SVG}
          </a>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-sm font-bold text-white mb-4">Quick Links</h4>
        <ul class="space-y-2.5 text-sm text-{color}-400">
          <li><a href="#" class="hover:text-{color}-300 transition-colors">Link</a></li>
        </ul>
      </div>
      
      <!-- Resources -->
      <div>
        <h4 class="text-sm font-bold text-white mb-4">Resources</h4>
        <ul class="space-y-2.5 text-sm text-{color}-400">
          <li><a href="#" class="hover:text-{color}-300 transition-colors">Link</a></li>
        </ul>
      </div>
    </div>
    
    <!-- Footer Bottom -->
    <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-{color}-500">
      <p>© 2025 {Brand}. All rights reserved.</p>
      <div class="flex gap-6">
        <a href="#" class="hover:text-{color}-300 transition-colors">Privacy</a>
        <a href="#" class="hover:text-{color}-300 transition-colors">Terms</a>
      </div>
    </div>
  </div>
</footer>
```


## Animation System

### Custom Keyframes (Required in `<style>` block)

Windrunner cannot JIT-compile keyframe animations, so they must be defined in inline styles:

```css
<style>
  /* Entrance animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Continuous animations */
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  /* Animation utility classes */
  .animate-fade-in { animation: fadeIn 1s ease; }
  .animate-slide-up { animation: slideUp 0.8s ease both; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-glow { animation: glow 3s ease-in-out infinite; }
</style>
```

### Staggered Animation Delays

```css
<style>
  .animate-slide-up-1 { animation: slideUp 0.6s ease both; }
  .animate-slide-up-2 { animation: slideUp 0.6s 0.15s ease both; }
  .animate-slide-up-3 { animation: slideUp 0.6s 0.30s ease both; }
  .animate-slide-up-4 { animation: slideUp 0.6s 0.45s ease both; }
</style>
```

**Usage**:

```html
<div class="animate-slide-up-1">First element</div>
<div class="animate-slide-up-2">Second element</div>
<div class="animate-slide-up-3">Third element</div>
```


### Tailwind Transitions (JIT-compiled)

These work without custom definitions:

```html
<!-- Hover transitions -->
<button class="transition-colors duration-200 hover:bg-blue-700">
  Smooth color transition
</button>

<div class="transition-all duration-300 hover:scale-105 hover:shadow-xl">
  Scale and shadow on hover
</div>

<!-- Transform transitions -->
<div class="transition-transform duration-500 hover:-translate-y-2">
  Lift on hover
</div>
```

**Common Transition Patterns**:

```css
/* Button hover */
class="transition-all duration-200 hover:scale-105"

/* Card hover */
class="transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"

/* Link hover */
class="transition-colors duration-200 hover:text-blue-700"

/* Background hover */
class="transition-colors duration-300 hover:bg-blue-50"
```

### Animation Best Practices

1. **Duration Guidelines**:
   - Micro-interactions: 150-200ms
   - Hover effects: 200-300ms
   - Entrance animations: 600-800ms
   - Floating/continuous: 3-6 seconds

2. **Easing Functions**:
   - `ease` — Default, good for most animations
   - `ease-in-out` — Smooth start and end
   - `ease-out` — Entrance animations
   - `linear` — Progress indicators only

3. **Performance**:
   - Use `transform` over `top/left/margin`
   - Use `opacity` over `visibility`
   - Avoid animating `width`, `height`, `padding`
   - Apply `will-change` sparingly (performance hints)

4. **Accessibility**:
   - Respect `prefers-reduced-motion` (future enhancement)
   - Keep animations subtle, not distracting
   - Don't rely on animation to convey critical information


## Responsive Design Strategy

### Breakpoint System

Tailwind's default breakpoints:

```css
/* Mobile-first approach */
sm:   640px   /* Small tablets, large phones */
md:   768px   /* Tablets */
lg:   1024px  /* Laptops, small desktops */
xl:   1280px  /* Desktops */
2xl:  1536px  /* Large desktops */
```

### Responsive Patterns

**Grid Layouts**:

```html
<!-- 1 column → 2 columns → 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>

<!-- 1 column → 2 columns → 4 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Items -->
</div>

<!-- Split layout (1 column → 2 columns) -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div>Text content</div>
  <div>Image content</div>
</div>
```

**Typography Scaling**:

```html
<!-- Hero headline -->
<h1 class="text-5xl md:text-6xl lg:text-7xl font-black">
  Responsive Headline
</h1>

<!-- Section heading -->
<h2 class="text-3xl md:text-4xl lg:text-5xl font-bold">
  Section Title
</h2>

<!-- Body text -->
<p class="text-base md:text-lg leading-relaxed">
  Paragraph that grows slightly on larger screens
</p>
```

**Spacing Adjustments**:

```html
<!-- Section padding -->
<section class="py-16 md:py-20 lg:py-24 px-6">

<!-- Container max-width -->
<div class="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

<!-- Grid gaps -->
<div class="grid gap-6 md:gap-8 lg:gap-10">
```

**Visibility Utilities**:

```html
<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">Desktop navigation</div>

<!-- Show on mobile, hide on desktop -->
<div class="md:hidden">Mobile menu icon</div>
```


### Mobile-First Approach

**Design Strategy**:

1. Start with mobile layout (320-767px)
2. Add `md:` breakpoint for tablets (768-1023px)
3. Add `lg:` breakpoint for desktops (1024px+)

**Example**:

```html
<!-- Mobile: Stack vertically, full width buttons -->
<!-- Tablet: Row layout, smaller gaps -->
<!-- Desktop: Larger spacing, inline buttons -->
<div class="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
  <button class="w-full md:w-auto px-6 py-3">Primary</button>
  <button class="w-full md:w-auto px-6 py-3">Secondary</button>
</div>
```

### Touch Target Guidelines

**Minimum sizes** (mobile):

- Buttons: `min-h-11` (44px) or `py-3` (48px with padding)
- Links: `py-2` minimum (32px)
- Icon buttons: `w-11 h-11` (44x44px)

```html
<!-- Mobile-optimized button -->
<button class="w-full md:w-auto px-6 py-3.5 rounded-xl">
  Tap-friendly CTA
</button>

<!-- Icon button with proper touch target -->
<button class="w-11 h-11 rounded-lg flex items-center justify-center">
  <svg class="w-6 h-6">...</svg>
</button>
```


## Industry-Specific Patterns

### Photography/Videography Templates

**Key Characteristics**:
- **Portfolio focus**: Large image galleries, before/after sliders
- **Visual storytelling**: Hero section with stunning imagery
- **Color palette**: Black, white, and accent color (minimal distraction from work)
- **Typography**: Clean sans-serif (Inter, Poppins) to keep focus on visuals
- **Layout**: Masonry grid or full-width galleries

**Unique Sections**:
- Portfolio/Gallery section (prominent, above-the-fold consideration)
- Services/Packages section (wedding, portrait, commercial)
- Recent work showcase
- Behind-the-scenes or process section

### Gym/Fitness Templates

**Key Characteristics**:
- **Energy and motivation**: Bold colors (red, orange, yellow), high-energy imagery
- **Action-oriented**: Strong CTAs ("Start Your Transformation", "Join Now")
- **Social proof**: Before/after transformations, success stories
- **Color palette**: Red-600, orange-500, amber-400 (energy, strength)
- **Typography**: Bold, impactful fonts (Montserrat, Poppins)

**Unique Sections**:
- Class schedule or programs section
- Trainer profiles
- Transformation gallery (before/after)
- Membership pricing
- Free trial CTA section

### Salon/Spa Templates

**Key Characteristics**:
- **Luxury and relaxation**: Soft colors (rose, pink, lavender, gold)
- **Elegant design**: Serif fonts (Playfair Display), smooth animations
- **Visual appeal**: Beautiful imagery, calming aesthetics
- **Color palette**: Rose-400, pink-300, lavender-500, gold accents
- **Typography**: Elegant serif for headings, clean sans-serif for body

**Unique Sections**:
- Services menu (hair, nails, skincare)
- Stylist/specialist profiles
- Before/after gallery
- Booking/appointment section (prominent)
- Product showcase (if applicable)


### Real Estate Templates

**Key Characteristics**:
- **Trust and professionalism**: Blue, gray, white color schemes
- **Property showcase**: Large property cards with key details
- **Location-focused**: Map integrations, neighborhood information
- **Color palette**: Blue-600, slate-700, gray-500
- **Typography**: Professional sans-serif (Inter, Open Sans)

**Unique Sections**:
- Featured properties section (grid with property cards)
- Search/filter interface (placeholder)
- Agent profiles
- Testimonials from buyers/sellers
- Market statistics or recent sales

### Law Firm Templates

**Key Characteristics**:
- **Authority and trust**: Navy blue, gold, gray color schemes
- **Professional and formal**: Serif fonts, structured layouts
- **Credibility**: Awards, case results, years of experience
- **Color palette**: Navy-900, slate-700, gold-600 accents
- **Typography**: Formal serif (Lora, Merriweather) + clean sans-serif

**Unique Sections**:
- Practice areas section
- Attorney profiles with credentials
- Case results or success stories
- Consultation booking CTA
- Legal resources or blog preview

### Medical/Dental Clinic Templates

**Key Characteristics**:
- **Clean and trustworthy**: Light blue, white, green color schemes
- **Safety and care**: Calming colors, approachable imagery
- **Accessibility focus**: Clear navigation, readable fonts
- **Color palette**: Blue-500, sky-400, teal-500, white
- **Typography**: Clean, readable sans-serif (Inter, Open Sans)

**Unique Sections**:
- Services offered (with icons)
- Doctor/dentist profiles
- Insurance accepted
- Patient testimonials
- Appointment booking CTA (prominent)
- Office location and hours


### E-commerce Templates (Fashion, Jewelry, Bakery, Coffee)

**Key Characteristics**:
- **Product-focused**: Large product images, clear pricing
- **Visual appeal**: Lifestyle imagery, styled product shots
- **Shopping experience**: Clear CTAs, product cards, category navigation
- **Color palettes**:
  - Fashion: Black, white, with trend colors (rose, purple, teal)
  - Jewelry: Gold-600, rose-400, slate-900 (luxury)
  - Bakery: Amber-600, orange-500, warm tones
  - Coffee: Brown-700, amber-600, cream tones

**Unique Sections**:
- Featured products section (grid)
- Product categories
- Bestsellers or new arrivals
- About the brand story
- Customer reviews with product photos

### Event Planning Templates (Wedding, General Events)

**Key Characteristics**:
- **Emotional and aspirational**: Romantic or celebratory colors
- **Portfolio-heavy**: Past event galleries
- **Trust-building**: Client testimonials, vendor partnerships
- **Color palettes**:
  - Wedding: Rose-400, pink-300, gold-500 (romance, elegance)
  - General events: Vibrant multi-color (purple, teal, amber)

**Unique Sections**:
- Event gallery (past events with categories)
- Services offered (planning, coordination, design)
- Testimonials with event photos
- Packages/pricing
- Consultation booking


### Home Services Templates (Cleaning, Plumbing, Landscaping, etc.)

**Key Characteristics**:
- **Trust and reliability**: Blue, green, gray color schemes
- **Service area focus**: Location-based messaging
- **Quick booking**: Prominent phone numbers and contact forms
- **Color palettes**:
  - Cleaning: Blue-500, teal-400 (freshness, cleanliness)
  - Plumbing: Blue-600, gray-500 (trust, professionalism)
  - Landscaping: Green-600, emerald-500 (nature, growth)

**Unique Sections**:
- Services list with pricing ranges
- Service area map/locations
- Before/after gallery
- Emergency contact (for urgent services like plumbing)
- Customer testimonials with service badges

### Creative/Tech Templates (Agency, Startup, SaaS, Crypto)

**Key Characteristics**:
- **Modern and innovative**: Gradients, glass-morphism, bold colors
- **Feature-focused**: Technical capabilities, integrations
- **Tech-forward**: Futuristic aesthetics, animated elements
- **Color palettes**:
  - Agency: Multi-color gradients (purple, pink, teal)
  - Startup: Violet-600, indigo-500 (innovation)
  - Crypto/Web3: Cyan-400, indigo-600, purple-500 (futuristic)

**Unique Sections**:
- Product features (with demos or screenshots)
- Integration logos
- API documentation links
- Pricing tiers
- Developer resources


## Implementation Strategy

### Phase-Based Implementation

**Completed (Phase 1)**:
- ✓ landing.html (SaaS/Tech - Nexora)
- ✓ landing-ai.html (AI Platform - FluxAI)
- ✓ landing-restaurant.html (Restaurant - Bella Cucina)

**Phase 2: Business & Services (9 templates)**

Order of implementation:

1. **landing-photography.html** — Visual portfolio showcase
2. **landing-gym.html** — High-energy fitness
3. **landing-salon.html** — Elegant beauty services
4. **landing-real-estate.html** — Property listings focus
5. **landing-law-firm.html** — Professional legal services
6. **landing-accounting.html** — Financial trust and expertise
7. **landing-medical-clinic.html** — Healthcare services
8. **landing-dental.html** — Dental care focus
9. **landing-consulting.html** — Business consulting

**Rationale**: Start with service-based businesses that have clear patterns and established examples.

**Phase 3: E-commerce & Products (6 templates)**

1. **landing-fashion.html** — Clothing/apparel e-commerce
2. **landing-jewelry.html** — Luxury jewelry showcase
3. **landing-bakery.html** — Artisan bakery products
4. **landing-coffee-shop.html** — Coffee shop/cafe
5. **landing-beverage.html** — Beverage brand
6. **landing-furniture.html** — Furniture e-commerce

**Rationale**: Product-focused templates with heavy visual emphasis.


**Phase 4: Education & Events (5 templates)**

1. **landing-school.html** — Educational institution
2. **landing-online-course.html** — E-learning platform
3. **landing-music-school.html** — Music education
4. **landing-wedding-planner.html** — Wedding planning services
5. **landing-event-planning.html** — General event planning

**Rationale**: Education and event planning have unique content structures.

**Phase 5: Home Services (6 templates)**

1. **landing-cleaning.html** — Cleaning services
2. **landing-plumbing.html** — Plumbing services
3. **landing-landscaping.html** — Landscaping/lawn care
4. **landing-moving.html** — Moving/relocation services
5. **landing-pest-control.html** — Pest control services
6. **landing-roofing.html** — Roofing services

**Rationale**: Service-based with strong local/area focus.

**Phase 6: Creative & Entertainment (5 templates)**

1. **landing-creative-agency.html** — Creative design agency
2. **landing-podcast.html** — Podcast landing page
3. **landing-artist-portfolio.html** — Artist/creative portfolio
4. **landing-band.html** — Band/musician page
5. **landing-streaming.html** — Streaming/gaming

**Rationale**: Creative industries with unique branding needs.

**Phase 7: Automotive & Travel (4 templates)**

1. **landing-car-wash.html** — Car wash services
2. **landing-auto-repair.html** — Auto repair shop
3. **landing-travel-agency.html** — Travel booking
4. **landing-hotel.html** — Hotel/resort

**Rationale**: Travel and automotive services.


**Phase 8: Corporate & Tech (4 templates)**

1. **landing-startup.html** — Startup pitch page
2. **landing-b2b-saas.html** — Enterprise B2B SaaS
3. **landing-crypto.html** — Crypto/blockchain
4. **landing-nft.html** — NFT marketplace

**Rationale**: Tech-forward with modern aesthetics.

**Phase 9: Lifestyle & Wellness (4 templates)**

1. **landing-yoga.html** — Yoga studio
2. **landing-nutritionist.html** — Nutrition/dietitian
3. **landing-therapist.html** — Therapy/counseling
4. **landing-pet-services.html** — Pet grooming/care

**Rationale**: Wellness and lifestyle services.

**Phase 10: Specialty & Niche (4 templates)**

1. **landing-nonprofit.html** — Nonprofit organization
2. **landing-coworking.html** — Coworking space
3. **landing-childcare.html** — Childcare/daycare
4. **landing-insurance.html** — Insurance services

**Rationale**: Specialized industries with unique requirements.

### Parallel Work Opportunities

Templates can be developed in parallel when:

1. **Different developers**: Multiple team members can work on different phases simultaneously
2. **Different industries**: No design dependencies between phases
3. **Reusable patterns established**: Once Phase 2 is complete, patterns are proven

**Recommended parallel approach**:
- Developer 1: Phases 2-3 (Business & E-commerce)
- Developer 2: Phases 4-5 (Education & Home Services)
- Developer 3: Phases 6-7 (Creative & Travel)


### Template Development Workflow

**Step 1: Planning (10 min)**
- Review industry requirements (Requirement 19-25)
- Define color palette (primary, secondary, accent)
- Select Google Fonts (2 maximum)
- Choose hero layout pattern (text-heavy, split, visual-heavy)
- Identify unique sections needed

**Step 2: HTML Structure (20 min)**
- Create file: `examples/landing-{industry}.html`
- Copy template structure from completed example
- Update `<title>` with brand name and value proposition
- Add Google Fonts preconnect and URL
- Define custom keyframe animations

**Step 3: Navigation & Hero (30 min)**
- Build fixed/sticky navbar with logo, menu, CTA
- Create hero section (headline, subheadline, CTAs, visual)
- Apply industry-specific color palette
- Add entrance animations (fadeIn, slideUp)
- Use Picsum for hero image (if applicable)

**Step 4: Core Sections (60 min)**
- **Features section**: 3-6 feature cards with icons/emoji
- **Social proof**: Testimonials or statistics
- **Industry-specific sections**: Gallery, menu, pricing, etc.
- Apply consistent spacing and typography
- Use Heroicons for interface elements

**Step 5: Footer & CTAs (20 min)**
- Build comprehensive footer
- Add multiple CTA sections throughout
- Ensure CTAs are action-oriented and benefit-focused
- Add contact information

**Step 6: Polish & Animations (20 min)**
- Add hover states to all interactive elements
- Apply staggered entrance animations
- Add floating badges or decorative animations
- Test color contrast for accessibility

**Step 7: Testing & Validation (20 min)**
- Test at 375px (mobile), 768px (tablet), 1440px (desktop)
- Verify all animations work
- Check Windrunner integration (http-server)
- Validate HTML5 (W3C validator)
- Check color contrast (browser dev tools)

**Total time per template**: ~3 hours (experienced developer)


## Quality Standards

### Code Quality Checklist

**Structure**:
- [ ] Uses semantic HTML5 elements (`<nav>`, `<section>`, `<article>`, `<footer>`)
- [ ] Includes proper `<meta>` tags (charset, viewport)
- [ ] Has SEO-optimized `<title>` in format "{Brand} — {Value}"
- [ ] Includes HTML comments for major sections
- [ ] Uses consistent indentation (2 spaces)

**Windrunner Integration**:
- [ ] FOUC prevention implemented correctly
- [ ] Windrunner imports from relative path `../dist/index.esm.js`
- [ ] `onReady` callback sets opacity to "1"
- [ ] Custom keyframes defined in `<style>` block
- [ ] Only Tailwind v4-compatible utilities used

**Performance**:
- [ ] Google Fonts preconnect links present
- [ ] Images use `loading="lazy"` below the fold
- [ ] No external CSS dependencies
- [ ] Animations use `transform` and `opacity` (not layout properties)
- [ ] Loads in under 2 seconds on 3G

**Accessibility**:
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] All images have descriptive `alt` text
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators present (`focus:ring`, `focus:outline`)

**Content**:
- [ ] Brand name sounds realistic for industry
- [ ] Placeholder copy is industry-appropriate
- [ ] CTAs are action-oriented and benefit-focused
- [ ] Contact information in standard format
- [ ] All content is professional and family-friendly


### Visual Consistency Checklist

**Color Application**:
- [ ] Primary color used for CTAs and key elements
- [ ] Secondary colors used for visual hierarchy
- [ ] Background colors follow light → dark progression
- [ ] Text colors have sufficient contrast
- [ ] Hover states use darker/lighter shades consistently

**Typography**:
- [ ] Maximum 2 Google Font families
- [ ] Heading scale is consistent (6xl → 5xl → 4xl → 3xl)
- [ ] Body text uses `text-base` or `text-lg`
- [ ] Line-height appropriate (`leading-tight` for headings, `leading-relaxed` for body)
- [ ] Font weights follow hierarchy (black for h1, bold for h2-h3)

**Spacing**:
- [ ] Section padding is consistent (`py-20` or `py-24`)
- [ ] Card padding is consistent (`p-6` or `p-8`)
- [ ] Grid gaps are consistent (`gap-6` or `gap-8`)
- [ ] Button padding follows standard (`px-6 py-3` or `px-8 py-4`)
- [ ] Margin between sections is consistent (`mb-16` or `mb-20`)

**Components**:
- [ ] Navbar height is `h-16` or `h-20`
- [ ] Primary CTAs use `rounded-full` or `rounded-xl`
- [ ] Cards use `rounded-2xl` or `rounded-3xl`
- [ ] Shadows are applied consistently
- [ ] Border radius is consistent across similar elements

**Imagery & Icons**:
- [ ] Picsum images use appropriate dimensions
- [ ] All images have `alt` text
- [ ] Heroicons are inline SVG with `currentColor`
- [ ] Icon size is consistent (`w-6 h-6` standard)
- [ ] Emoji size is appropriate for context


### Testing Strategy

**Manual Testing (Per Template)**:

1. **Visual Inspection** (15 min)
   - Open in Chrome, Firefox, Safari
   - Check rendering at 375px, 768px, 1024px, 1440px
   - Verify animations trigger correctly
   - Check hover states on all interactive elements
   - Verify FOUC prevention works (no flash of unstyled content)

2. **Responsive Testing** (10 min)
   - Use browser dev tools responsive mode
   - Test at mobile breakpoint (375px)
   - Test at tablet breakpoint (768px)
   - Test at desktop breakpoint (1440px)
   - Verify grid layouts adapt correctly
   - Ensure text is readable at all sizes

3. **Accessibility Testing** (10 min)
   - Tab through entire page (keyboard navigation)
   - Verify focus indicators are visible
   - Check color contrast in browser dev tools
   - Run Lighthouse accessibility audit
   - Verify headings follow logical hierarchy

4. **Performance Testing** (5 min)
   - Run Lighthouse performance audit
   - Verify load time under 2 seconds (local server)
   - Check for console errors
   - Verify images load properly
   - Confirm Windrunner initializes correctly

5. **HTML Validation** (5 min)
   - Run through W3C HTML validator
   - Fix any validation errors
   - Ensure semantic HTML is used correctly

**Testing Checklist per Phase**:
- [ ] All templates in phase tested individually
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari)
- [ ] Responsive testing at all breakpoints
- [ ] Accessibility validation passes
- [ ] No console errors
- [ ] HTML validation passes
- [ ] Performance meets standards (< 2s load)


### Performance Benchmarks

**Target Metrics** (via Lighthouse):

- **Performance Score**: 90+ (good), 95+ (excellent)
- **Accessibility Score**: 90+ (minimum), 95+ (target)
- **Best Practices Score**: 90+ (minimum)
- **SEO Score**: 80+ (minimum)

**Load Time Targets**:
- **Time to First Byte (TTFB)**: < 200ms (local server)
- **First Contentful Paint (FCP)**: < 500ms
- **Largest Contentful Paint (LCP)**: < 1.5s
- **Total Load Time**: < 2s (3G connection)

**File Size Targets**:
- **HTML file size**: < 100KB (uncompressed)
- **Inline styles**: < 5KB (only keyframe animations)
- **Zero external CSS**: All styling via Windrunner runtime

**Asset Loading**:
- Google Fonts: 2 families maximum, using `display=swap`
- Picsum images: Lazy-loaded below the fold
- Heroicons: Inline SVG (no external requests)
- No external JavaScript dependencies (except Windrunner)

### Browser Compatibility

**Minimum Support**:
- Chrome/Edge: Latest version
- Firefox: Latest version
- Safari: Latest version (macOS and iOS)

**Feature Support**:
- CSS Grid and Flexbox: Required
- CSS Custom Properties: Not required (Tailwind utilities only)
- ES6 Modules: Required (Windrunner integration)
- Backdrop-filter: Used but gracefully degrades

**Graceful Degradation**:
- If JavaScript disabled: Show unstyled HTML content
- If Windrunner fails: Opacity remains 0 (page hidden - acceptable tradeoff)
- If fonts fail to load: System fonts as fallback


## Documentation Requirements

### Per-Template Documentation

Each template includes a header comment block:

```html
<!--
  Template: {Industry Name} Landing Page
  Brand: {Brand Name}
  Description: {Brief description of template purpose}
  
  Color Theme:
  - Primary: {color}-{shade}
  - Secondary: {color}-{shade}
  - Accent: {color}-{shade}
  
  Fonts:
  - Heading: {Font Family}
  - Body: {Font Family}
  
  Key Features:
  - {Feature 1}
  - {Feature 2}
  - {Feature 3}
  
  Phase: {Phase Number}
  Status: Complete
  Last Updated: {Date}
-->
```

### README.md Update

For each template, update project README with:

```markdown
#### Phase {X}: {Phase Name}

| Template | Industry | Status | Color Theme | Key Features |
|----------|----------|--------|-------------|--------------|
| `landing-{industry}.html` | {Industry} | ✓ Complete | Blue-600, Sky-500 | Portfolio showcase, Contact form |
```

### npm Scripts

Add serve script to `package.json` for each template:

```json
{
  "scripts": {
    "serve:{industry}": "http-server -o /examples/landing-{industry}.html"
  }
}
```


## Reusable Code Snippets

### Reusable Animation Keyframes (Copy to all templates)

```css
<style>
  /* Standard entrance animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Continuous animations */
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  /* Utility classes */
  .animate-fade-in { animation: fadeIn 1s ease; }
  .animate-slide-up { animation: slideUp 0.8s ease both; }
  .animate-slide-up-1 { animation: slideUp 0.6s ease both; }
  .animate-slide-up-2 { animation: slideUp 0.6s 0.15s ease both; }
  .animate-slide-up-3 { animation: slideUp 0.6s 0.30s ease both; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
</style>
```

### Reusable HTML Components

**Section Header Pattern**:

```html
<div class="text-center mb-16">
  <span class="inline-block px-4 py-1.5 rounded-full bg-{color}-100 text-{color}-800 text-sm font-semibold mb-4">
    {Section Label}
  </span>
  <h2 class="text-4xl md:text-5xl font-bold text-{color}-900 mb-4">
    {Section Heading}
  </h2>
  <p class="text-lg text-{color}-600 max-w-2xl mx-auto">
    {Section Description}
  </p>
</div>
```


**Floating Badge Pattern**:

```html
<div class="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
  <div class="flex items-center gap-2">
    <span class="text-2xl">{emoji}</span>
    <div>
      <p class="text-xs text-{color}-500">{Label}</p>
      <p class="font-bold text-{color}-700">{Value}</p>
    </div>
  </div>
</div>
```

**Social Proof Stats Pattern**:

```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
  <div>
    <p class="text-4xl font-black text-{color}-900">{Number}<span class="text-{color}-600">+</span></p>
    <p class="text-sm text-{color}-500 mt-1">{Metric}</p>
  </div>
  <!-- Repeat for other stats -->
</div>
```

**CTA Section Pattern**:

```html
<section class="py-28 px-6 bg-gradient-to-br from-{color}-100 to-{color}-50 relative overflow-hidden">
  <div class="absolute inset-0 opacity-10">
    <!-- Decorative elements -->
  </div>
  <div class="relative mx-auto max-w-4xl text-center">
    <h2 class="text-5xl md:text-6xl font-black text-{color}-900 mb-6">
      {Compelling Headline}
    </h2>
    <p class="text-xl text-{color}-600 mb-10 max-w-2xl mx-auto">
      {Value proposition}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#" class="px-10 py-5 rounded-full bg-{color}-600 hover:bg-{color}-700 text-white font-bold text-lg shadow-2xl transition-all hover:scale-105">
        {Primary CTA}
      </a>
      <a href="#" class="px-10 py-5 rounded-full border-2 border-{color}-700 hover:bg-white text-{color}-900 font-bold text-lg transition-all">
        {Secondary CTA}
      </a>
    </div>
  </div>
</section>
```


## Error Handling

### Common Issues & Solutions

**Issue: FOUC still visible**
- **Cause**: Windrunner initialization delay or error
- **Solution**: Verify import path `../dist/index.esm.js` is correct
- **Solution**: Check browser console for errors
- **Solution**: Ensure `onReady` callback syntax is correct

**Issue: Animations not working**
- **Cause**: Keyframes not defined in `<style>` block
- **Solution**: Copy standard keyframe definitions to template
- **Solution**: Verify animation class names match keyframe names
- **Cause**: CSS syntax error in keyframe definition
- **Solution**: Validate CSS syntax

**Issue: Images not loading (Picsum)**
- **Cause**: Network connectivity or Picsum service down
- **Solution**: Use specific Picsum IDs instead of random
- **Solution**: Add fallback background colors
- **Fallback**: Replace with emoji placeholders temporarily

**Issue: Icons not displaying**
- **Cause**: SVG syntax error or missing viewBox
- **Solution**: Copy SVG code directly from heroicons.com
- **Solution**: Verify `viewBox="0 0 24 24"` attribute present
- **Solution**: Check `fill` or `stroke` attributes

**Issue: Layout breaks on mobile**
- **Cause**: Missing responsive breakpoint classes
- **Solution**: Add `md:` and `lg:` prefixes for larger screens
- **Solution**: Test at 375px width in browser dev tools
- **Solution**: Use `flex-col md:flex-row` for row layouts

**Issue: Colors not matching design**
- **Cause**: Incorrect Tailwind color names or shades
- **Solution**: Verify color exists in Tailwind v4
- **Solution**: Use standard shades: 50, 100, 200, ..., 900, 950
- **Reference**: Check completed templates for patterns


## Design Decisions & Rationale

### Why Picsum Photos?

**Decision**: Use Picsum Photos for all placeholder images instead of real images or emoji-only

**Rationale**:
- **Realistic appearance**: Templates look production-ready with actual photos
- **Zero cost**: Free, unlimited usage via CDN
- **Performance**: CDN-backed, fast loading
- **Flexibility**: Query parameters for blur, grayscale, specific dimensions
- **No licensing issues**: Free to use without attribution
- **Easy replacement**: Developers can swap URLs with their own images

### Why Heroicons?

**Decision**: Use Heroicons as the primary icon library

**Rationale**:
- **Tailwind ecosystem**: Created by Tailwind Labs, perfect compatibility
- **MIT license**: Free for commercial use
- **Inline SVG**: No external requests, full styling control via `currentColor`
- **Two variants**: Outline (subtle) and solid (emphasis) for visual hierarchy
- **Comprehensive**: 200+ icons cover most use cases
- **Consistent style**: Professional, modern aesthetic

### Why Inline SVG over Icon Fonts?

**Decision**: Use inline SVG instead of icon fonts (Font Awesome, etc.)

**Rationale**:
- **No external dependencies**: Keeps templates zero-config
- **Better performance**: No additional HTTP requests
- **Full styling control**: CSS `currentColor` inheritance
- **Accessibility**: Better screen reader support
- **Crisp rendering**: SVG scales perfectly at any size
- **Selective inclusion**: Only include icons actually used


### Why 2 Google Fonts Maximum?

**Decision**: Limit templates to 2 Google Font families

**Rationale**:
- **Performance**: Each font family adds ~20-40KB and HTTP request
- **Visual hierarchy**: 1 font for headings + 1 for body is sufficient
- **Loading time**: Fewer fonts = faster initial render
- **Design clarity**: Too many fonts creates visual chaos
- **Best practice**: Professional sites rarely use more than 2-3 fonts

### Why Fixed/Sticky Navbar?

**Decision**: Use fixed or sticky navbar for all templates

**Rationale**:
- **Accessibility**: Primary navigation always available
- **CTAs always visible**: Contact/booking buttons remain accessible
- **Modern pattern**: Expected by users on landing pages
- **Mobile-friendly**: Especially important on mobile where scrolling is common
- **Conversion optimization**: Keeps primary CTA within reach

### Why Mobile-First Approach?

**Decision**: Design mobile layout first, then enhance for larger screens

**Rationale**:
- **Usage patterns**: 50%+ traffic comes from mobile devices
- **Progressive enhancement**: Easier to add complexity than remove it
- **Tailwind default**: Tailwind utilities are mobile-first by default
- **Performance**: Mobile constraints force better performance decisions
- **Accessibility**: Mobile layouts tend to be simpler and more accessible


## Future Enhancements

### Potential Improvements (Post-MVP)

**Advanced Animations**:
- Scroll-triggered animations (Intersection Observer API)
- Parallax effects for hero sections
- Lottie animations for illustrations
- Page transition effects

**Interactivity**:
- Mobile hamburger menu with smooth transitions
- Sticky navbar that changes on scroll
- Smooth scroll to anchor links
- Image lightbox/gallery modals
- Accordion FAQs
- Tab-based content sections

**Forms & Validation**:
- Contact form with client-side validation
- Newsletter signup forms
- Booking/reservation forms
- Multi-step forms (for complex services)

**Advanced Features**:
- Dark mode toggle (Tailwind dark: variants)
- Language selector for i18n
- Cookie consent banners
- Live chat integration placeholder
- Social media feed integration

**Asset Management**:
- WebP image format support
- Responsive images with `<picture>` element
- Image optimization guidance
- Video backgrounds for hero sections

**Developer Experience**:
- Template customization guide
- Color theme generator tool
- Component library documentation
- Figma design system export

**These enhancements are OUT OF SCOPE for the current 50-template collection but represent future opportunities.**


## Summary

This design document provides comprehensive guidance for implementing 47 additional landing page templates for the Windrunner project. The design establishes:

### Key Design Principles

1. **Consistency**: Reusable component patterns across all templates
2. **Flexibility**: Industry-specific theming while maintaining core structure
3. **Performance**: Sub-2-second load times with FOUC prevention
4. **Maintainability**: Clear code organization and documentation
5. **Accessibility**: WCAG AA compliance for all templates

### Core Architecture

- **File structure**: Simple flat structure in `examples/` directory
- **Template structure**: Standard HTML5 with Windrunner integration
- **Asset strategy**: Picsum Photos + Heroicons + emoji
- **Animation system**: Custom keyframes + Tailwind transitions
- **Responsive design**: Mobile-first with Tailwind breakpoints

### Implementation Approach

- **Phased development**: 10 phases, 47 templates total
- **Parallel work**: Multiple developers can work simultaneously on different phases
- **Time estimate**: ~3 hours per template for experienced developer
- **Quality gates**: Code quality, visual consistency, accessibility, performance

### Success Metrics

- All 47 templates completed and tested
- Each template loads in < 2 seconds
- Accessibility score of 90+ (Lighthouse)
- Zero console errors
- W3C HTML validation passes
- Responsive at 375px, 768px, 1440px breakpoints

This design ensures the Windrunner Landing Pages Collection becomes a comprehensive, production-ready resource for developers building modern landing pages with zero-config Tailwind v4.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Status**: Ready for Implementation

