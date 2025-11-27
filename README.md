# Poline Generator

A visual color palette generator built with [Poline](https://github.com/meodai/poline) - a library for creating perceptually uniform color palettes through HSL interpolation.

## Features

- **Multi-anchor palettes** - Define multiple color anchor points and generate smooth gradients between them
- **Position functions** - Choose from 8 interpolation curves (Linear, Exponential, Quadratic, Cubic, Quartic, Sinusoidal, Arc Sinusoidal, Arc)
- **Hue shifting** - Apply rotational hue adjustments across the palette
- **Closed loops** - Generate palettes that seamlessly loop back to the starting color
- **Inverted lightness** - Flip the lightness direction for dark-to-light or light-to-dark gradients
- **Export formats** - Copy colors as HEX, HSL, RGB, or LCH values

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Build

```bash
# Build the UI
pnpm build:ui

# Build the Figma plugin
pnpm build:plugin

# Build both
pnpm build
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- [Poline](https://github.com/meodai/poline) for color interpolation
- D3 for color space conversions
- Radix UI primitives
