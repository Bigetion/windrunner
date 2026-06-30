# Component System Design Document

## Goal
Bootstrap-style component utilities for Windrunner with runtime compilation.

## Design Decision: Direct Property Compilation (Option 2)

### Approach
Component classes compile **directly to CSS properties**, NOT to separate utility rules.

### Example

**Input HTML:**
```html
<button class="btn-primary-lg">Click me</button>
```

**Generated CSS:**
```css
.btn-primary-lg {
  /* Base properties */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 200ms;
  cursor: pointer;
  
  /* Variant properties (primary) */
  background-color: oklch(0.623 0.214 259.1);
  color: oklch(100% 0 0);
  
  /* Size properties (lg) */
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
}

.btn-primary-lg:hover {
  background-color: oklch(0.546 0.245 262.9);
}

.btn-primary-lg:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**ONE CSS RULE** for the component class, with all properties inline.

---

## Architecture

### 1. Component Definition
```javascript
{
  base: 'inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded',
  variants: {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600'
  },
  sizes: {
    sm: 'px-2 py-1 text-sm',
    lg: 'px-6 py-3 text-lg'
  }
}
```

### 2. Compilation Flow

```
Input: "btn-primary-lg"
  ↓
Parse component token
  ↓ { component: 'btn', variant: 'primary', size: 'lg' }
  ↓
Collect utility classes
  ↓ ['inline-flex', 'items-center', 'px-6', 'py-3', 'bg-blue-500', ...]
  ↓
Convert utilities to CSS properties (NEW HELPER FUNCTION)
  ↓ { display: 'inline-flex', alignItems: 'center', padding: '...', ... }
  ↓
Generate single CSS rule
  ↓
Output: ".btn-primary-lg { display: inline-flex; align-items: center; ... }"
```

### 3. Key Implementation Details

**NEW: Utility-to-Property Converter**
```javascript
function utilityToProperties(utilityClass, theme) {
  // "px-4" → { paddingLeft: '1rem', paddingRight: '1rem' }
  // "bg-blue-500" → { backgroundColor: 'oklch(...)' }
  // "text-white" → { color: 'oklch(100% 0 0)' }
  // "rounded" → { borderRadius: '0.25rem' }
  
  // Use existing builder functions but extract declarations
  // instead of returning full CSS rules
}
```

**Pseudo-class Handling**
```javascript
// "hover:bg-blue-600" inside component definition
// Generate additional rule:
// .btn-primary-lg:hover { background-color: oklch(...); }
```

**Important Modifier**
```javascript
// "!btn-primary" → all properties get !important
```

---

## Advantages of This Approach

✅ **Works with existing HTML** - Element keeps `class="btn-primary"`, CSS applies  
✅ **One rule per component** - Much more efficient than 30+ utility rules  
✅ **Proper cascade** - Component rules work with CSS specificity normally  
✅ **DevTools friendly** - Inspector shows `.btn-primary { ... }` clearly  
✅ **Smaller CSS output** - Consolidated properties vs repeated utility selectors  
✅ **Simpler implementation** - No class name manipulation needed  

---

## Implementation Checklist

### Phase 1: Core System
- [ ] Create `utilityToProperties()` converter function
- [ ] Extend component parser to handle all syntax
- [ ] Generate consolidated CSS rules
- [ ] Handle pseudo-classes (hover, focus, etc.)
- [ ] Handle pseudo-elements (before, after)
- [ ] Support responsive variants
- [ ] Support important modifier

### Phase 2: Pre-built Components
- [ ] Button components (8 variants, 5 sizes)
- [ ] Form components (input, select, checkbox, radio, label)
- [ ] Card components (with parts: header, body, footer)
- [ ] Alert components
- [ ] Badge components
- [ ] Navigation components

### Phase 3: Testing & Docs
- [ ] Unit tests for component system
- [ ] Integration tests (browser)
- [ ] Component showcase page
- [ ] API documentation
- [ ] Migration examples

---

## Rejected Approaches

### ❌ Approach 1: Expand to Multiple Utility Rules
**Problem:** Generated CSS for `.inline-flex`, `.px-4`, but element has `class="btn-primary"`  
**Result:** CSS selectors don't match element classes - styles never apply

### ❌ Approach 3: CSS Variables
**Problem:** Too complex, limited browser support for dynamic vars  
**Result:** Not suitable for all properties (display, position, etc.)

---

## Next Steps

1. Create new branch: `feature/component-system-v2`
2. Implement `utilityToProperties()` converter
3. Build component compilation pipeline
4. Test with single component (btn-primary)
5. Expand to full component library
6. Write tests
7. Create showcase

---

## Notes

- Keep existing plugin system untouched (it works perfectly)
- Components are syntactic sugar over utilities
- Goal: 90% Bootstrap use cases with 100% Tailwind flexibility
- Must work with variants (hover:btn-primary, md:btn-lg, etc.)
- Must support custom user components via plugin API

---

**Status:** Design finalized, ready for implementation  
**Start Date:** Tomorrow  
**Estimated Time:** 4-6 hours for complete implementation
