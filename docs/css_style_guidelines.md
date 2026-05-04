## CSS & Frontend Style Guide

### 1. Architecture and Naming (BEM-oriented)
Use a methodology similar to **BEM (Block Element Modifier)**, with mandatory use of context-based prefixes.

*   **Prefixes:** Always start classes with a context prefix (e.g., `.admin-`, `.auth-`, `.landing-`).
*   **Separators:** Use a single hyphen `-` to separate words.
*   **Structure:**
    *   **Wrapper/Container:** The wrapper for the entire page or a large section.
    *   **Element:** A component of a block (e.g., `-navigation`, `-links`).
    *   **Action/Component:** Buttons and interactive elements (e.g., `-btn`, `-input`).

> **Example:** `.admin-page-header` (block), `.admin-page-header-nav` (element).

### 2. Property Structure in a Rule
To ensure readability, properties within a selector should be arranged in the following order:
1.  **Positioning** (`position`, `z-index`, `top/right/bottom/left`).
2.  **Block Model and Dimensions** (`display`, `flex/grid`, `width/height`, `margin`, `padding`).
3.  **Typography** (`font`, `color`, `text-align`).
4.  **Visual** (`background`, `border`, `border-radius`, `box-shadow`).
5.  **Miscellaneous** (`cursor`, `transition`, `opacity`).

### 3. Layout Rules
*   **Flexbox:** The preferred alignment method. Always use `gap` instead of `margin` to create spacing between adjacent elements within a container.
*   **Sizes:** Avoid hard-coded `height` values. Use `min-height` or `height: auto` to prevent content from being cut off.
*   **Box Sizing:** `box-sizing: border-box` is always implied.

### 4. Colors and Constants
AI should use CSS variables to ensure consistency. If variables are not specified, use the current palette:
*   `--bg-main: #f5f7fb;`
*   `--bg-card: #ffffff;`
*   `--br-radius-lg: 15px;`
*   `--br-radius-sm: 12px;`

### 5. Responsiveness (Responsive Design)
*   Instead of fixed `px` values for container margins (such as `100px`), use `max-width` and `margin: 0 auto`.
*   Example of a standard container:
```css
.admin-page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px; /* 20px - safe zone for mobile devices */
}
```

### 6. Anti-Patterns
1.  **Do not** use `!important` unless absolutely necessary (e.g., overriding third-party libraries).
2.  **Do not** use inline styles (style=“...”).
3.  **Do not** name classes based on their visual appearance (e.g., `.white-button-15px`). Use functional names: `.admin-back-btn`.