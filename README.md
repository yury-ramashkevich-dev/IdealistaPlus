# IdealistaPlus

Compare [Idealista](https://www.idealista.com) properties side-by-side. Extract property data with a browser bookmarklet and view it in an interactive comparison table.

## Quick Start

```bash
# Clone and install
git clone https://github.com/yury-ramashkevich-dev/IdealistaPlus.git
cd IdealistaPlus
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser.

## How It Works

1. **Install the bookmarklet** — drag the green "+ IdealistaPlus" button to your bookmarks bar
2. **Browse Idealista** — navigate to any property page (e.g. `idealista.com/inmueble/12345/`)
3. **Click the bookmarklet** — it extracts property data from the page
4. **Compare** — the app opens with the property added to your comparison table

The bookmarklet runs in your own browser session, so there are no bot-detection issues. Data is stored in localStorage and persists across sessions.

### Extracted Fields

Price, property type, size, rooms, bathrooms, year built, orientation, energy consumption, emissions, features, description, and images. Supports both Spanish and English Idealista pages.

## Tech Stack

- **React 18** + **Vite** — fast development and builds
- **Tailwind CSS** — utility-first styling
- **Swiper.js** — image carousels
- **Vitest** + **React Testing Library** — test suite

## Project Structure

```
IdealistaPlus/
├── packages/frontend/
│   ├── src/
│   │   ├── App.jsx                              # Main app + hash import handler
│   │   ├── hooks/useLocalStorage.js             # localStorage persistence
│   │   ├── utils/bookmarklet.js                 # Bookmarklet source (reference)
│   │   ├── components/
│   │   │   ├── BookmarkletInstall/              # Install UI + minified bookmarklet
│   │   │   ├── ComparisonView/                  # Table-based comparison
│   │   │   └── UI/                              # ImageCarousel, ErrorBoundary
│   │   └── test/setup.js                        # Test configuration
│   ├── public/favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   ├── vitest.config.js
│   └── tailwind.config.js
├── package.json
└── pnpm-workspace.yaml
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (http://localhost:5173) |
| `pnpm build` | Production build to `packages/frontend/dist/` |
| `pnpm test` | Run tests in watch mode |
| `pnpm test -- run` | Run tests once |

## Deployment

Build and serve the `packages/frontend/dist/` folder from any static hosting (Vercel, Netlify, GitHub Pages, etc.).

The bookmarklet URL is detected automatically from `window.location.origin`, so it works on any host without configuration.

## License

MIT
