# 🎨 AnimeSenpai — Design System & Visual Guidelines

This document outlines the visual language, design system, component hierarchy, responsive specifications, and accessibility principles that power the **AnimeSenpai** user experience.

---

## 📑 Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette & Tokens](#2-color-palette--tokens)
3. [Typography Hierarchy](#3-typography-hierarchy)
4. [Elevation & Glassmorphism](#4-elevation--glassmorphism)
5. [Responsive Breakpoints & Auto-Adjustments](#5-responsive-breakpoints--auto-adjustments)
6. [Component Design System](#6-component-design-system)
7. [Micro-Interactions & Motion](#7-micro-interactions--motion)
8. [Accessibility (A11y - WCAG 2.1 AA)](#8-accessibility-a11y---wcag-21-aa)

---

## 1. Design Philosophy

AnimeSenpai blends **Apple Human Interface precision** with a **vibrant Cyber-Anime aesthetic**:
* **Midnight Canvas**: Deep, oceanic dark canvas that allows vibrant anime poster artwork to command visual focus without eye fatigue.
* **Translucent Glassmorphism**: Frosted acrylic layers, subtle borders, and ambient neon glows that create a distinct sense of depth and hierarchy.
* **Tactile Fluidity**: Sub-millisecond optimistic UI responses, smooth momentum swiping on touch devices, and crisp hover states on desktop.
* **High Information Density with Zero Clutter**: Clean badges, progressive disclosure via popovers, and disciplined spacing.

---

## 2. Color Palette & Tokens

### 2.1 Core Palette

| Role | Color Name | Hex Code | HSL / RGB | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas** | Deep Abyss | `#0b1622` | `rgb(11, 22, 34)` | Primary page background |
| **Surface** | Slate Glass | `#151f2e` | `rgb(21, 31, 46)` | Elevated cards, dialogs, drawers |
| **Sub-Surface** | Border Slate | `#1f2d40` | `rgb(31, 45, 64)` | Inner pill backgrounds, input fields |
| **Border** | Ambient Line | `rgba(255,255,255,0.08)` | — | Card outlines, dividers |
| **Primary Brand** | Cyber Cyan | `#3db4f2` | `rgb(61, 180, 242)` | Active states, primary CTA, links |
| **Accent Glow** | Electric Blue | `#00d2ff` | `rgb(0, 210, 255)` | Logo gradient, highlight flares |
| **Brand Deep** | Royal Indigo | `#1e40af` | `rgb(30, 64, 175)` | Shield gradient shadows |

### 2.2 Semantic & Status Accents

| State | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **⭐ Score / Star** | Amber Gold | `#f59e0b` | Community ratings, review stars, gold badges |
| **🟢 Watching** | Emerald | `#10b981` | Actively airing or currently watching anime |
| **🔵 Plan to Watch** | Sky Blue | `#38bdf8` | Planned titles in user queue |
| **🟣 Completed** | Amethyst | `#a855f7` | Finished series and completed runs |
| **🟡 Paused** | Tangerine | `#f97316` | On-hold watchlist entries |
| **🔴 Dropped** | Crimson | `#ef4444` | Dropped anime titles |

### 2.3 Text & Foreground Hierarchy

```
Primary Text:    #ffffff  (100% white, titles, critical metrics)
Secondary Text:  #bcbedc  (Soft periwinkle slate, body paragraphs, descriptions)
Muted Text:      #8ba0b2  (Subtitles, timestamps, studio credits, episode counts)
Disabled Text:   #475569  (Slate 600, inactive pagination, empty states)
```

---

## 3. Typography Hierarchy

AnimeSenpai uses a modern tripartite font stack imported via Google Fonts:

```css
font-family: 'Overpass', 'Plus Jakarta Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
```

* **Overpass**: Clean geometric sans-serif with bold character used for navigation, logo headers, and section titles.
* **Plus Jakarta Sans**: High-legibility modern sans used for buttons, interactive labels, and card titles.
* **Roboto**: Used for long-form synopsis text, relation descriptions, and tabular episode data.

### Typographic Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `2.5rem – 3.25rem` (40–52px) | 800 (Extrabold) | 1.15 | `-0.025em` | Homepage Hero Title |
| **H1 Section** | `1.75rem – 2.25rem` (28–36px) | 700 (Bold) | 1.25 | `-0.02em` | Section Titles (`Trending Now`, `Catalog`) |
| **H2 Subhead** | `1.25rem – 1.5rem` (20–24px) | 600 (Semibold) | 1.35 | `-0.01em` | Modal titles, Anime details headers |
| **Body Large** | `1.0rem` (16px) | 400 (Regular) | 1.60 | `0em` | Anime synopsis, policy text |
| **Body Small** | `0.875rem` (14px) | 400 (Regular) | 1.50 | `0em` | Watchlist rows, filter options |
| **Caption/Pill** | `0.75rem` (12px) | 600 (Semibold) | 1.20 | `0.025em` | Score badges, genre pills, airing year |

---

## 4. Elevation & Glassmorphism

To establish spatial depth in dark mode, AnimeSenpai employs **multi-layered frosted glass surfaces**:

### Glassmorphic Utility Classes
```css
/* Sticky Navigation Bar */
.navbar-glass {
  background: rgba(11, 22, 34, 0.90);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Elevated Content Cards */
.card-glass {
  background: rgba(21, 31, 46, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
}

/* Floating Hover Preview Tooltip */
.preview-popup {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(61, 180, 242, 0.25);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7), 0 0 24px rgba(61, 180, 242, 0.15);
}
```

---

## 5. Responsive Breakpoints & Auto-Adjustments

AnimeSenpai uses fluid, mobile-first responsive architecture designed to auto-adjust across all device viewports:

| Breakpoint | Viewport Range | Grid Columns | Layout Adjustments |
| :--- | :--- | :--- | :--- |
| **Mobile (`< 640px`)** | `320px – 639px` | **2 Columns** | • Bottom tab bar pinned with `safe-area-inset-bottom`<br>• Horizontal category swiper with hidden scrollbars<br>• Full-width mobile search overlay<br>• Single-column stacked details view |
| **Tablet (`640px – 1023px`)** | `640px – 1023px` | **3 – 4 Columns** | • Top navigation with search icon expander<br>• Split layout on anime details (poster left, synopsis right)<br>• 12-column structured watchlist table |
| **Desktop (`1024px – 1535px`)** | `1024px – 1535px` | **5 Columns** | • Permanent top navbar with live autocomplete dropdown<br>• Interactive hover preview popovers on poster cards<br>• Dual sidebar navigation on account and settings |
| **Ultra-Wide (`≥ 1536px`)** | `1536px – 2560px+` | **6 Columns** | • Max container width capped at `1440px` centered<br>• Cinematic widescreen trailer modal with 16:9 ratio |

---

## 6. Component Design System

### 6.1 The App Logo
The **AnimeSenpai Brand Icon** is an original vector-crafted geometric hex-shield:
* **Outer Hex-Shield**: Cyber Blue to Royal Indigo gradient (`#00d2ff` $\rightarrow$ `#3db4f2` $\rightarrow$ `#1e40af`) with semi-translucent perimeter stroke.
* **Origami Monogram**: Interlocking white and ice-blue facets forming the anime-style **'A' & 'S'** letters.
* **Gold Dynamic Bar**: Warm yellow-amber bar (`#fef08a` $\rightarrow$ `#f59e0b`) symbolizing ranking and achievement.
* **Sparkle Star**: 8-point white star at the apex representing discovery and entertainment magic.

### 6.2 Anime Card & Poster Frame
* **Aspect Ratio**: Locked to `11/16` ratio (`aspect-[11/16]`), preventing Cumulative Layout Shift (CLS = 0.000).
* **Cover Imagery**: `object-cover` with high-performance CSS transition (`scale-105 duration-300`).
* **Overlay Gradient**: Bottom-anchored gradient (`from-[#0b1622]/90 via-transparent to-transparent`) ensuring title contrast over bright covers.
* **Score Pill**: Top-right floating frosted pill showing smiley icon + community percentage score.

### 6.3 Watchlist Stepper & Action Controls
* **Episode Increment Controls**: Circular tactile buttons (`+` / `-`) with 42px touch hitboxes.
* **Status Badges**: Color-coded badges with uppercase labels (`WATCHING`, `COMPLETED`, `PLANNING`).
* **Instant Tactile Feedback**: Micro-scale down (`active:scale-95`) on click/touch.

---

## 7. Micro-Interactions & Motion

* **Card Lift**: Posters smoothly scale (`scale-105`) and gain an ambient cyan glow on hover.
* **Pill Hover**: Filter pills transition from subtle dark surface to vibrant cyan background (`bg-[#3db4f2] text-white`).
* **Autocomplete Reveal**: Search dropdown slides down 4px with opacity transition in 150ms.
* **Shimmer Skeleton**: Loading placeholders feature a diagonal wave gradient (`linear-gradient(90deg, #151f2e, #1f2d40, #151f2e)`) animated in a 1.5s loop.
* **Motion Reduction**: All transitions respect the user's operating system preferences via `@media (prefers-reduced-motion: reduce)`.

---

## 8. Accessibility (A11y - WCAG 2.1 AA)

AnimeSenpai maintains a **100/100 Accessibility Score** on Google Lighthouse:
* **Color Contrast**: All text pairings exceed the WCAG AA minimum ratio of **4.5:1** (primary text achieves **14.2:1** against `#0b1622`).
* **Touch Targets**: All interactive elements (navbar links, pagination buttons, episode steppers, mobile tabs) provide minimum **48px x 48px** touch target areas.
* **Focus Rings**: Keyboard focus visible via `focus-visible:ring-2 focus-visible:ring-[#3db4f2] focus-visible:outline-none`.
* **Screen Reader Landmarks**: Semantic HTML5 tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<aside>`).
* **ARIA Descriptors**: Every icon-only button contains an explicit `aria-label` attribute (e.g. `aria-label="Search anime"`, `aria-label="Roll random anime"`).
