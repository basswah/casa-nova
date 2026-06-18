---
name: Casa Nova POS
description: Modern POS and inventory management for Syrian retail
colors:
  surface-bg-dark: "#121212"
  surface-bg-light: "#FFFFFF"
  surface-card-dark: "#1E1E1E"
  surface-card-light: "#F3F4F6"
  accent-gold-dark: "#D4AF37"
  accent-gold-light: "#B8960F"
  text-primary-dark: "#F9F9F9"
  text-primary-light: "#1A1A1A"
  text-muted-dark: "#9CA3AF"
  text-muted-light: "#6B7280"
  border-dark: "#374151"
  border-light: "#D1D5DB"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{accent-gold-dark}"
    textColor: "#121212"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-primary-light:
    backgroundColor: "{accent-gold-light}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-secondary-dark:
    backgroundColor: "transparent"
    textColor: "{accent-gold-dark}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    typography: "{typography.label}"
  input-dark:
    backgroundColor: "#1E1E1E"
    textColor: "{text-primary-dark}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    typography: "{typography.body}"
  input-light:
    backgroundColor: "#FFFFFF"
    textColor: "{text-primary-light}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    typography: "{typography.body}"
  card-dark:
    backgroundColor: "{surface-card-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-light:
    backgroundColor: "{surface-card-light}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{text-muted-dark}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
---

# Design System: Casa Nova POS

## 1. Overview

**Creative North Star: "The Cool-Gold Counter"**

Casa Nova POS is a point-of-sale interface designed for a Syrian retail counter. Its personality is modern, clean, and fast. The interface gets out of the cashier's way: every screen is scannable at a glance, actions are one click away, and the visual weight is evenly distributed between Arabic and English text.

The aesthetic is restrained professional. A single cool-gold accent provides the only color on an otherwise neutral dark surface. Shadows are used sparingly to create gentle elevation for interactive elements. The result is a tool that feels precise rather than playful, capable rather than flashy.

**Key Characteristics:**
- Dark-first with a cool-gold accent used on ≤10% of any screen
- Subtle shadows for elevation, never decorative
- Flat backgrounds with tonal layering (background → card surface → hover)
- Clean sans-serif typography with monospace for numerals and codes
- Soft borders (1px) define surface edges without visual noise

## 2. Colors

**Character:** A cool-gold accent on near-black and charcoal neutrals. The palette has three layers: background, surface, and accent. No secondary or tertiary colors exist; the restraint is intentional.

### Primary
- **Cool Gold** (dark: `oklch(75% 0.1 85)` / `#D4AF37`, light: `oklch(65% 0.1 85)` / `#B8960F`): The single accent. Used for primary CTAs, active nav items, headings in data displays, and the app title. Never used for body text, borders at rest, or decorative elements.

### Neutral
- **Near Black** (`oklch(12% 0.005 85)` / `#121212`): The canvas. Page background in dark mode.
- **Charcoal** (`oklch(20% 0.005 85)` / `#1E1E1E`): Cards, panels, inputs at rest, nav bar, modals.
- **Deep Gray** (`oklch(35% 0.005 85)` / `#374151`): Borders at rest, dividers.
- **Muted** (`oklch(60% 0.005 85)` / `#9CA3AF`): Secondary text, labels, placeholders.
- **Off-White** (`oklch(95% 0.005 85)` / `#F9F9F9`): Primary text in dark mode.
- **Light Canvas** (`oklch(98% 0.005 85)` / `#FFFFFF`): Page background in light mode.
- **Warm Gray** (`oklch(95% 0.005 85)` / `#F3F4F6`): Cards, panels, inputs in light mode.

### Named Rules

**The One-Accent Rule.** Cool Gold is the only accent color on any screen. It occupies ≤10% of the surface area. Its rarity is the point; overuse diminishes its signaling value.

**The Tonal Layer Rule.** Depth is conveyed through background lightness, not shadows at rest. The layer order is absolute: background (`#121212`) → surface (`#1E1E1E`) → interactive hover (`~#2A2A2A`). Shadows appear only on hover or for floating elements (modals, dropdowns, toasts).

## 3. Typography

**Display Font:** Inter, system-ui, -apple-system, sans-serif
**Body Font:** Inter, system-ui, -apple-system, sans-serif
**Label/Mono Font:** JetBrains Mono, monospace (for prices, quantities, SKUs, table numerals)

**Character:** Clean, neutral, and highly legible at small sizes. The sans pairing avoids personality so the product's speed and clarity speak first. Monospace is reserved for tabular data and prices, where alignment and precision matter.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 3vw, 2.25rem)`, 1.2): Page titles. Used once per page. Always in Cool Gold.
- **Title** (600, `1.25rem`, 1.3): Section headings, card titles. Off-white in dark, near-black in light.
- **Body** (400, `0.875rem`, 1.5): Table cells, product names, descriptions. Max line length 65ch.
- **Label** (500, `0.75rem`, 1.4, 0.02em letter-spacing): Form labels, column headers, button text. Uppercase only in table headers.
- **Mono** (400, `0.8125rem`, 1.4): Monetary values, SKU codes, quantities, and any right-aligned tabular data.

### Named Rules
**The Mono-For-Numbers Rule.** All prices, quantities, SKUs, and right-aligned table data use JetBrains Mono (or system monospace fallback). This ensures numerals align consistently across rows and columns.

**The Gold-For-Titles Rule.** Display-level text is always in Cool Gold. Title-level text and below is never in Cool Gold. This preserves the accent's signaling power for the highest hierarchy level only.

## 4. Elevation

The system is flat by default with controlled shadow elevation for interactive and floating states. At rest, surfaces are separated by tonal layering (background vs. card). Shadows are applied only when an element lifts above the surface plane.

### Shadow Vocabulary
- **Surface Hover** (`0 2px 8px rgba(0,0,0,0.15)`): Applied on hover to interactive cards, product grid items, and table rows. Creates a subtle lift without changing the background color.
- **Floating** (`0 8px 24px rgba(0,0,0,0.2)`): Modals, dialogs, dropdowns, and the toast container. These elements float above all page content.

### Named Rules
**The Flat-At-Rest Rule.** No shadows on cards, panels, or surfaces in their default state. Depth is achieved exclusively through tonal background differences until an element is interacted with.

## 5. Components

### Buttons
- **Shape:** Gently curved edges (8px radius).
- **Primary (dark mode):** Cool Gold fill (`#D4AF37`), near-black text (`#121212`), 12px 24px padding. On hover: 5% lighter gold (`#D9B84A`), shadow `0 2px 8px rgba(0,0,0,0.15)`. Active: scale to 0.98.
- **Primary (light mode):** Cool Gold fill (`#B8960F`), white text, same padding and radius.
- **Secondary:** Transparent background, Cool Gold text, 1px Cool Gold border at 20% opacity. On hover: 10% gold background tint.
- **Danger:** Red-600 fill (`#DC2626`), white text. On hover: darker red.
- **Disabled:** 40% opacity, no hover effects.

### Inputs / Fields
- **Style:** Charcoal background (`#1E1E1E`), 1px soft border (`#374151`), 8px radius, 10px 12px padding.
- **Focus:** Border shifts to Cool Gold (`#D4AF37`), subtle ring inset (2px Cool Gold at 20% opacity).
- **Label:** 12px, 500 weight, 0.02em letter-spacing, Muted color, 8px bottom margin.
- **Error:** Border shifts to Red-500 (`#EF4444`), red tinted background.
- **Disabled:** 40% opacity, no focus ring.

### Cards / Containers
- **Corner Style:** Noticeably curved (12px radius).
- **Background:** Charcoal (`#1E1E1E`) in dark, Warm Gray (`#F3F4F6`) in light.
- **Shadow Strategy:** None at rest (Flat-At-Rest Rule). Surface Hover shadow on interactive cards.
- **Border:** 1px Deep Gray (`#374151`) in dark, 1px light gray in light.
- **Internal Padding:** 24px (lg spacing). Dense card variants use 16px.

### Navigation (Header)
- **Style:** Horizontal bar, full width, Charcoal background with 1px bottom border.
- **Links:** Muted text at rest (`#9CA3AF`), 8px 16px padding, 8px radius.
- **Hover:** Text transitions to white, no background change.
- **Active:** Cool Gold fill background, near-black text. The active link is visually distinct from all others.
- **Responsive:** No mobile collapse. All links stay visible.

### Tables
- **Style:** Full width, no horizontal dividers (only row dividers).
- **Header:** Charcoal background, Label typography (12px, 500, uppercase), Muted text.
- **Rows:** Alternating background (Charcoal / near-black), Body typography. On hover: slight lightening (`rgba(255,255,255,0.03)`).
- **Cells:** Left-aligned for text, right-aligned for numbers. Mono font for numeric cells.

### Modals
- **Style:** Floating container, 12px radius, Charcoal background, centered with near-black overlay at 50% opacity.
- **Animation:** Scale 0.95 → 1.0 + fade in (200ms, ease-out).
- **Header:** Title in Display typography, Cool Gold. Close button top-right.
- **Footer:** Primary + Secondary buttons, right-aligned.

## 6. Do's and Don'ts

### Do:
- **Do** use Cool Gold for the primary CTA on every page: exactly one per screen, always the action that completes the user's primary task.
- **Do** use Mono for all numeric values in tables: prices, quantities, SKUs, dates in numeral form.
- **Do** use tonal layering for depth: background → surface → hover, each step 6-8% lighter in lightness.
- **Do** apply the Surface Hover shadow on interactive elements: product grid tiles, table rows, clickable cards.
- **Do** use the Floating shadow on modals, dropdowns, and toasts only.
- **Do** keep form inputs consistent: 8px radius, 10px 12px padding, Charcoal background, 1px Deep Gray border.
- **Do** use 12px radius for containers that hold grouped content (cards, modals, dialogs).

### Don't:
- **Don't** use Cool Gold for body text, labels, borders at rest, or decorative elements. Reserve it for CTAs, active nav, and Display-level headings.
- **Don't** use shadows at rest. The system is flat by default; tonal layering provides depth.
- **Don't** use gradient text, glassmorphism, or side-stripe borders.
- **Don't** use bounce or elastic easing for animations. Use ease-out exponential curves (cubic-bezier(0.16, 1, 0.3, 1)).
- **Don't** use identical card grids with icon + heading + text repeated. Cards must serve a distinct purpose.
- **Don't** reach for modals as the first layout choice. Consider inline expansion or progressive disclosure first.
- **Don't** use `<div>` wrappers where fragments suffice. Layout should be minimal.
- **Don't** use `#000` or `#fff`. Tint every neutral toward the brand's hue.
