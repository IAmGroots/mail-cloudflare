---
version: alpha
name: OpenCode Mono Terminal
description: A stark, developer-first mono system with minimal color, crisp borders, and high editorial clarity.
colors:
  primary: "#201D1D"
  secondary: "#6B6767"
  tertiary: "#007AFF"
  neutral: "#FFFFFF"
  surface: "#F7F7F7"
  on-surface: "#201D1D"
  border: "#E5E7EB"
  muted-border: "#0F00001F"
  inverse-surface: "#0B0B0B"
  inverse-text: "#FDFCFD"
  success: "#1A8F4C"
  error: "#D92D20"
typography:
  headline-display:
    fontFamily: "Berkeley Mono"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: "57px"
    letterSpacing: "0px"
  headline-lg:
    fontFamily: "Berkeley Mono"
    fontSize: "31px"
    fontWeight: 700
    lineHeight: "37px"
    letterSpacing: "0px"
  headline-md:
    fontFamily: "Berkeley Mono"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "Berkeley Mono"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Berkeley Mono"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "32px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "Berkeley Mono"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Berkeley Mono"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Berkeley Mono"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "Berkeley Mono"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Berkeley Mono"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0px"
  code-md:
    fontFamily: "Berkeley Mono"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  code-sm:
    fontFamily: "Berkeley Mono"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 32px
  lg: 48px
  xl: 80px
  gutter: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.inverse-text}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px 8px 10px"
    height: "42px"
    width: "129px"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px 8px 10px"
    height: "42px"
    width: "129px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  code-panel:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-text}"
    rounded: "{rounded.none}"
    padding: "16px"
---

## Overview
OpenCode feels like a restrained developer tool: practical, fast, and intentionally monochrome with one vivid blue accent. The tone is professional but not corporate, mixing terminal nostalgia with modern SaaS clarity. Layouts are spacious, centered, and easy to scan, with very little decorative noise.

## Colors
- **Primary (#201D1D):** A deep espresso-black used for headline text, navigation, and the strongest UI surfaces. It gives the system its terminal-like seriousness.
- **Tertiary (#007AFF):** A saturated system blue reserved for action emphasis, links, and active states. It is the only loud hue and works as the interface’s signal color.
- **Neutral (#FFFFFF):** Clean white used for the main page background and lighter content panels. It keeps the experience open and highly legible.
- **Surface (#F7F7F7):** A soft off-white for nested containers and low-emphasis sections. It adds separation without introducing visible warmth.
- **On-surface (#201D1D):** The default readable foreground on light backgrounds. This is the primary copy color for most content.
- **Border (#E5E7EB):** A faint cool gray used for cards, input boundaries, and structural dividers. It supports the architecture without drawing attention.
- **Muted-border (#0F00001F):** A subtle translucent edge tone used where borders need to recede further, such as low-priority button outlines.
- **Inverse-surface (#0B0B0B):** Near-black used for dark showcase sections and code-oriented hero blocks. It creates a dramatic contrast shift.
- **Inverse-text (#FDFCFD):** A slightly softened white for text on dark surfaces, avoiding harsh pure-white glare.
- **Success (#1A8F4C):** A restrained green that can be used for confirmations without breaking the palette discipline.
- **Error (#D92D20):** A clear red for destructive or failed states, kept separate from the brand accent.

## Typography
Typography is entirely mono and highly branded, with Berkeley Mono as the core voice and IBM Plex Mono as the declared fallback. Headings are bold, compact, and architectural, while body text stays monospaced and airy enough to remain readable at longer lengths. The visual language leans into code aesthetics rather than editorial serif contrast.

Use `headline-display`, `headline-lg`, `headline-md`, and `headline-sm` for page titles, section headers, and marketing copy. Use `body-lg` and `body-md` for explanatory prose, with generous line heights to preserve the calm, technical tone. Use `label-lg`, `label-md`, and `label-sm` for nav items, tabs, buttons, and metadata. `code-md` and `code-sm` should be used for command snippets, terminal-like callouts, and inline shell/UI examples.

Letter spacing is neutral, not compressed or expanded, and there is no uppercase system treatment visible in the source. The feeling comes from weight, line length, and spacing rather than typographic decoration.

## Layout & Spacing
The layout follows a centered, fixed-max-width landing-page structure with large outer whitespace and clear vertical sectioning. Content blocks are aligned in a single column and separated by generous rhythm, making the page feel calm despite its information density.

The spacing scale is intentionally simple: `xs` 8px, `sm` 16px, `md` 32px, `lg` 48px, and `xl` 80px. Use 16px padding for standard cards, 32px or more between major sections, and stronger vertical breathing room in hero areas. Tabs, nav links, and code blocks should feel tightly organized but never cramped.

## Elevation & Depth
The system is almost flat. Depth is communicated through borders, tonal contrast, and inset-like nested regions rather than shadows. Since shadows are effectively absent, hierarchy should rely on surface color changes, delicate 1px outlines, and contrast between white and near-black panels.

Dark showcase sections act as the primary depth break, especially when a black or near-black field sits below a bright editorial top section. Cards and panels should remain crisp and minimal rather than floating.

## Shapes
The shape language is subtle and precise. Corners are mostly small-radius or nearly square, which reinforces the technical, utilitarian character. `rounded.sm` at 4px is the default for buttons and inputs, while cards use `rounded.md` at 8px for a slightly softer container edge.

Avoid pill shapes except for rare badges or status chips. The system should feel engineered, not playful.

## Components
Buttons are compact and functional. `button-primary` is the main CTA style: dark background, light text, 42px height, 129px minimum width, and 8px/16px padding with a slightly tighter left inset. `button-secondary` inverts that treatment with a white background and faint border, suitable for secondary actions. `button-tertiary` should be text-only or link-like, with no border and zero-radius treatment. Hover states should preserve the austere feel: use subtle color shifts, not glow or shadow.

Cards use the `card` token: white background, 1px border, 8px radius, and 16px padding. Keep cards flat and content-forward, with internal spacing doing the work. Inputs should mirror cards visually, with light borders and small radii so form controls feel like part of the same system.

Navigation links and tabs should use mono labels and minimal affordance. Active tab states can be indicated by a simple underline or darker text weight rather than filled pills. Code blocks and command panels should use `code-panel` styling: dark surface, light text, no shadow, and disciplined spacing. Inline monospace snippets should remain visually quiet, with emphasis only where needed for paths, commands, or model names.

## Do's and Don'ts
- Do keep layouts centered, spacious, and highly readable.
- Do use Berkeley Mono consistently for the brand’s technical voice.
- Do reserve blue for active links, primary actions, and selected states.
- Do prefer borders and contrast over shadows for hierarchy.
- Do keep corners small and utilitarian.
- Don't introduce gradients, glows, or decorative shadow systems.
- Don't mix in proportional display fonts or playful typography.
- Don't over-round buttons, cards, or inputs into pill shapes.