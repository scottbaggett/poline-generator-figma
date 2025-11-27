# Figma Plugin Setup

This project can run as both a web app and a Figma plugin.

## Building the Plugin

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build both the UI and plugin code:
   ```bash
   pnpm build
   ```

   This will:
   - Build the React UI to `dist/index.html` and assets
   - Build the plugin code to `dist/code.js`
   - Copy `manifest.json` to `dist/`

## Loading in Figma

1. Open Figma Desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to the `dist` folder and select `manifest.json`
4. The plugin will appear in your plugins menu

## Using the Plugin

1. Run the plugin from **Plugins** → **Development** → **Poline-ish Generator**
2. Generate or customize your color palette
3. Click **"Create Figma Styles"** to create paint styles in your Figma file
4. The styles will be created under the "Poline" folder in your local styles

## Development

- `pnpm dev` - Run the web app locally (for testing outside Figma)
- `pnpm build` - Build both UI and plugin code
- `pnpm build:ui` - Build only the UI
- `pnpm build:plugin` - Build only the plugin code

## File Structure

- `code.ts` - Plugin code that runs in Figma's sandbox (can access Figma API)
- `index.html` / `App.tsx` - UI code that runs in an iframe (cannot access Figma API directly)
- `manifest.json` - Plugin configuration
- `dist/` - Built files (load this folder in Figma)

