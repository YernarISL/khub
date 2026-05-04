## Purpose
This document defines the visual and interaction rules that the AI agent must follow when generating or modifying the application UI.

The goal is to keep the product:
- clean
- modern
- calm and trustworthy
- dashboard-oriented
- easy to scan
- lightweight and production-like

This application is not a playful consumer app. It is a serious productivity dashboard for teachers, students, and managers.

---

## Product Direction
The UI should feel like:
- a polished work dashboard
- a research/operations workspace
- a calm productivity tool with intelligence in the background

The AI agent must optimize for:
- clarity over decoration
- structured information over empty visual effects
- fast comprehension
- strong hierarchy
- elegant spacing
- subtle premium feel

Avoid designs that look:
- generic AI demo
- overly futuristic
- noisy
- dense
- childish
- overly colorful
- too enterprise/banker-like

---

## Core Visual Style

### Overall aesthetic
Use a minimal, soft, modern dashboard style with:
- white and very light gray surfaces
- subtle borders
- gentle shadows
- rounded corners
- restrained accent colors
- lots of whitespace
- strong typographic hierarchy

### Mood
The interface should feel:
- calm
- intelligent
- organized
- confident
- helpful

### Visual language
Prefer:
- card-based layouts
- compact summary widgets
- soft gradients only when needed
- icon + label combinations
- small badges and chips for metadata
- clean content previews

Do not use:
- heavy neon effects
- aggressive shadows
- overly saturated backgrounds
- complex glassmorphism
- excessive blur
- ornamental design

---

## Layout Principles

### Page structure
Use a dashboard structure with:
- a clear top header
- a main summary section
- quick action cards
- a featured AI assistant block
- a materials/content section

The page should generally follow this order:
1. greeting / page title
2. quick stats or summary widgets
3. primary actions
4. AI assistant highlight
5. recent materials / data cards

### Grid behavior
Prefer responsive grid layouts:
- mobile: 1 column
- tablet: 2 columns where useful
- desktop: 3–4 column composition

Use wide layouts carefully. Do not stretch content too much on large screens. Maintain a readable max width.

### Alignment
Keep alignment strict and clean:
- consistent left alignment for content blocks
- visual grouping with equal spacing
- cards should line up in a clear rhythm

---

## Typography

### Tone
Typography should be clear and professional.

### Hierarchy
Use a strong typographic hierarchy:
- Page title: large, bold, confident
- Section titles: medium-large, bold
- Card titles: medium, bold
- Supporting text: smaller, muted
- Metadata: compact, subtle

### Rules
- Use bold text only where needed
- Keep body text readable and short
- Prefer concise labels over long descriptions
- Avoid all-caps except for tiny badges or tags

### Readability
Text must never feel crowded. Ensure enough line height and spacing between title, subtitle, and metadata.

---

## Spacing and Rhythm

### General spacing
The UI must breathe.

Use:
- generous outer padding
- consistent gaps between blocks
- balanced internal padding inside cards
- compact but not cramped controls

### Card spacing
Cards should have:
- comfortable padding
- clear separation between header and content
- enough whitespace around thumbnails, icons, and text

### Rhythm rule
Do not mix random spacing values. Keep spacing visually consistent across the page.

---

## Color System

### Base palette
The design should stay mostly neutral:
- background: very light gray or off-white
- cards: white
- borders: soft gray
- primary text: slate / near-black
- secondary text: muted gray

### Accent colors
Use a small set of accents only:
- blue for primary/productive actions
- green for success/status
- indigo or violet for the AI assistant area

### Rule for accents
Accent colors must support hierarchy, not dominate the page.

### Background usage
Use colored backgrounds sparingly:
- only for special blocks
- only for status areas
- only for visual emphasis on one or two components

Do not flood the page with colored panels.

---

## Surfaces, Borders, and Shadows

### Cards
Cards should feel soft and elevated but not heavy.

Preferred card treatment:
- white background
- 1px light border
- small shadow
- rounded corners
- subtle hover lift or shadow increase

### Borders
Borders should be visible enough to structure content, but never harsh.

### Shadows
Use shadows lightly:
- default shadow should be very subtle
- hover shadow may increase slightly
- avoid dramatic drop shadows

---

## Shape Language

### Corner radius
Use rounded shapes consistently.

Preferred shapes:
- cards: rounded-xl or rounded-2xl
- buttons: rounded-lg or pill-style for primary CTAs
- badges: fully rounded or small rounded pills
- thumbnails: soft rounded rectangles

### Consistency
Do not mix sharp and soft shapes randomly. The entire UI should feel part of the same system.

---

## Components and Patterns

### Cards
Cards are the main building blocks.
They should be used for:
- summary widgets
- content previews
- action groups
- AI assistant promo blocks
- upload placeholders

A good card usually contains:
- title
- short supporting text
- optional icon or thumbnail
- one primary action

### Buttons
Buttons should have distinct roles:
- primary button: strongest action, solid accent color
- secondary button: soft outline or subtle fill
- ghost button: minimal, for lightweight actions

Button labels should be short and action-oriented.

### Badges
Use badges to indicate:
- content type
- status
- recency
- category
- featured state

Badges should be small, compact, and visually quiet.

### Icons
Use icons only where they improve scanability.
Icons should:
- be small
- support meaning
- be aligned with text
- not appear decorative without purpose

### Thumbnails / previews
When showing documents or materials:
- use a thumbnail preview if available
- otherwise use a clean placeholder block
- keep preview areas consistent in height and style

### Empty states / placeholders
Empty states should be actionable.
They should invite the user to:
- upload material
- create something new
- start an AI task

Do not leave empty states feeling dead or decorative.

---

## Dashboard Composition Rules

### Header area
The top header should contain:
- a clear greeting or title
- a short explanatory subtitle
- optional quick stats or summary chips

### Quick stats
Stats widgets should be compact and scannable.
They should show:
- label
- value or status
- small icon

### Primary action area
The user should always have a clear next step.
Examples:
- upload PDF
- start sandbox
- ask AI agent
- view all materials

### AI assistant block
The AI area should stand out visually but still fit the design system.
Recommended treatment:
- light tinted background or gradient
- strong icon + label
- short prompt-like copy
- one clear CTA

### Materials section
The content section should feel like a library or workspace.
Use clean content cards with:
- preview image
- file type badge
- title
- short metadata

---

## Interaction and Hover Behavior

### Hover
Hover effects should be subtle and useful:
- slightly stronger shadow
- slight border color shift
- tiny visual lift
- soft background change

### Transitions
Transitions should be smooth and quick.
Avoid flashy animation.

### Click targets
Click targets must be obvious.
Any card or primary action should look clickable.

### Feedback
The UI should provide visible feedback on:
- hover
- active
- focus
- disabled
- loading

---

## Responsive Behavior

### Mobile
On mobile:
- stack sections vertically
- remove nonessential side-by-side complexity
- keep primary actions high in the page
- make cards full-width

### Tablet
On tablet:
- use two-column or mixed grid layouts
- keep cards reasonably tall and readable

### Desktop
On desktop:
- use a richer grid
- keep the page balanced
- avoid excessively wide text blocks

### Rule
The responsive version must preserve the same visual language. Only the layout should change, not the identity.

---

## Content Density

This is a productivity tool, so density is allowed, but it must remain comfortable.

### Allowed density
- summary widgets
- compact metadata
- multiple cards in a row
- short action groups

### Not allowed density
- walls of text
- cluttered controls
- too many competing visual accents
- low-contrast labels

---

## What the AI Agent Must Preserve
If editing existing UI, the agent must preserve:
- calm neutral background
- card-based architecture
- rounded corners
- soft shadows
- blue/indigo/green accent logic
- compact summary widgets
- clear hierarchy
- polished dashboard feel

---

## What the AI Agent Must Avoid
Do not generate UI that is:
- too empty and lifeless
- too busy
- too playful
- too futuristic
- too many gradients
- too many accent colors
- inconsistent in spacing
- inconsistent in corner radius
- inconsistent in hover behavior
- hard to scan

Do not redesign the app into a different product category.

---

## Native CSS Implementation Rules
This project uses React and native CSS, not Tailwind.

### CSS expectations
The AI agent must:
- create maintainable class-based CSS
- keep styles modular and reusable
- avoid inline styles unless necessary
- use CSS variables for reusable tokens
- keep responsive rules organized

### Suggested structure
Use files such as:
- `docs/ui-guidelines.md`
- `src/styles/theme.css`
- `src/styles/layout.css`
- `src/styles/components.css`

### CSS variable approach
Prefer tokens like:
- `--color-bg`
- `--color-surface`
- `--color-border`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-primary`
- `--radius-card`
- `--shadow-card`
- `--space-4`
- `--space-6`

### Component classes
Keep component names semantic and clear:
- `.page-shell`
- `.dashboard-header`
- `.summary-grid`
- `.summary-card`
- `.action-card`
- `.assistant-card`
- `.materials-grid`
- `.material-card`

---

## Recommended Design Token Direction

### Colors
- background: very light neutral
- surface: white
- border: soft slate gray
- primary: blue
- success: green
- assistant accent: indigo
- muted text: gray/slate

### Radius
- cards: medium to large
- buttons: medium or pill-like
- badges: pill

### Shadows
- cards: subtle
- hover: slightly stronger
- focus: clear but not loud

### Motion
- transition duration: short and smooth
- use animation only to support clarity

---

## Prompting Rule for the AI Agent
When asked to generate UI, the agent should follow this process:
1. identify the page purpose
2. preserve the current design language
3. use the spacing, radius, and color system above
4. build clear hierarchy first
5. add decorative detail only if it improves usability
6. output maintainable React + CSS code

The agent should not invent a new visual direction unless explicitly asked.

---

## Final Quality Check
Before finishing any UI change, the agent must check:
- Does the layout feel organized?
- Is the hierarchy obvious?
- Are actions easy to find?
- Do cards feel consistent?
- Is the page visually calm?
- Does the design match a real product?
- Is the CSS clean and reusable?

If the answer is no to any of these, revise the UI before delivering it.

