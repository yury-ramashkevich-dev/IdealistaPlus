# IdealistaPlus - Property Comparison Tool

## Project Overview

IdealistaPlus is a web application that enables users to compare multiple properties from Idealista.com side-by-side. Users click a browser bookmarklet while viewing any Idealista property page to automatically extract and import property data. Properties are displayed in a horizontally scrollable comparison table with sticky parameter labels.

## Key Features

- **Browser Bookmarklet**: One-click data extraction from Idealista property pages via bookmarklet
- **Client-Side Extraction**: JavaScript runs in browser to extract property data from DOM (no backend scraping required)
- **Table-Based Comparison**: Properties displayed as table columns with sticky parameter labels
- **Image Galleries**: Each property shows images in a carousel at the top of its column
- **Extended Property Data**: Extracts type, construction year, orientation, energy consumption, and emissions
- **Persistent Storage**: Comparisons saved to browser localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Monorepo Structure
The project uses a monorepo approach with pnpm workspaces:
- `packages/frontend/` - React application (Vite + Tailwind CSS)
- `packages/backend/` - Express API server (currently unused due to DataDome anti-bot protection)

### Technology Stack

**Frontend:**
- React 18+ (UI framework)
- Vite (build tool and dev server)
- Tailwind CSS (utility-first styling)
- Swiper.js (image carousels with lazy loading)
- Browser Bookmarklet (client-side data extraction)

**Backend (currently inactive):**
- Node.js 20+ LTS
- Express (REST API)
- Puppeteer (blocked by DataDome anti-bot protection)
- express-rate-limit (API protection)
- winston (logging)

**Development:**
- pnpm (package manager with workspace support)
- concurrently (run frontend + backend simultaneously)
- nodemon (backend hot-reload)

## Project Structure

```
IdealistaPlus/
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml          # Workspace definition
├── PROJECT_SPECIFICATION.md     # Detailed implementation plan
├── CLAUDE.md                    # This file
│
├── packages/
│   ├── frontend/               # React SPA
│   │   ├── src/
│   │   │   ├── App.jsx                                   # Main app component
│   │   │   ├── hooks/
│   │   │   │   └── useLocalStorage.js                    # localStorage persistence
│   │   │   ├── utils/
│   │   │   │   └── bookmarklet.js                        # Readable bookmarklet source
│   │   │   └── components/
│   │   │       ├── UI/ImageCarousel.jsx                  # Swiper carousel
│   │   │       ├── BookmarkletInstall/BookmarkletInstall.jsx  # Bookmarklet UI
│   │   │       └── ComparisonView/ComparisonContainer.jsx     # Table comparison layout
│   │   ├── vite.config.js                                # Vite config
│   │   └── tailwind.config.js
│   │
│   └── backend/                # Express API
│       └── src/
│           ├── server.js                      # Express entry point
│           ├── services/
│           │   └── puppeteer.service.js       # Core scraping logic
│           ├── controllers/
│           │   └── scraper.controller.js      # API handlers
│           ├── routes/
│           │   └── scraper.routes.js          # Route definitions
│           ├── middleware/
│           │   └── error.middleware.js        # Error handling
│           └── utils/
│               ├── validation.js              # URL validation
│               └── logger.js                  # Winston logger
```

## Data Flow

### Primary Flow (Bookmarklet)
1. **User Action**: User navigates to Idealista property page and clicks bookmarklet in their bookmarks bar
2. **Validation**: Bookmarklet checks if current page is valid Idealista property URL
3. **Extraction**: JavaScript extracts property data directly from page DOM (price, title, size, rooms, bathrooms, type, year, orientation, energy data, images, features, description)
4. **Encoding**: Property object is JSON-stringified and base64-encoded
5. **Import**: Opens app in new window/tab with hash parameter `#import=BASE64_JSON`
6. **Decoding**: App detects hash parameter, decodes property data
7. **Storage**: Property added to localStorage array
8. **Display**: Property appears in comparison table

### Secondary Flow (Backend - Currently Unused)
The backend Puppeteer scraping was implemented but is blocked by Idealista's DataDome anti-bot protection. The bookmarklet approach circumvents this by running extraction in the user's actual browser session.

## Key Components

### Bookmarklet: Client-Side Data Extraction
**File**: `packages/frontend/src/utils/bookmarklet.js`

The primary data extraction mechanism that:
- Runs in user's browser on Idealista property page
- Validates page is an Idealista property URL
- Extracts comprehensive property data using DOM selectors
- Supports both English and Spanish Idealista pages
- Base64-encodes extracted data
- Opens app in new window/tab with data in URL hash
- No backend required - bypasses anti-bot protection

**Critical Selectors**:
- Price: `.info-data-price`, `.price-row`
- Title: `.main-info__title-main`, `.main-info__title`
- Details: `.info-features span` (with language detection for rooms/bathrooms)
- Images: `.detail-multimedia img`, `.detail-multimedia-gallery img`, `.carousel-img`, `picture source`
- Features: `.details-property_features li`, `.details-property-feature-one li`
- Property Type: Extracted from features or title keywords
- Construction Year: Regex pattern matching in features
- Orientation: Direction keywords in features
- Energy Data: `.details-property_certified-energy li`, `.icon-energy-certificate-*`

### Backend: Puppeteer Scraping Service (Inactive)
**File**: `packages/backend/src/services/puppeteer.service.js`

Original scraping approach, now superseded by bookmarklet due to DataDome blocking. Kept in codebase for reference but not used in production flow.

### Frontend: useLocalStorage Hook
**File**: `packages/frontend/src/hooks/useLocalStorage.js`

Custom React hook for persistent storage:
- Reads from localStorage on mount
- Auto-saves changes with 300ms debounce
- Handles JSON serialization errors
- Key: `'idealista-comparisons'`
- Value: Array of property objects

### Frontend: BookmarkletInstall Component
**File**: `packages/frontend/src/components/BookmarkletInstall/BookmarkletInstall.jsx`

Bookmarklet installation UI:
- Displays draggable bookmarklet button for user to add to bookmarks bar
- Contains minified bookmarklet code as `javascript:` URL
- Shows step-by-step usage instructions
- Fallback copy-to-clipboard button for mobile/no-drag support
- Sets href imperatively to avoid React warnings about `javascript:` URLs

### Frontend: ComparisonContainer Component
**File**: `packages/frontend/src/components/ComparisonView/ComparisonContainer.jsx`

Table-based comparison layout (replaces card-based design):
- Renders HTML `<table>` with fixed column widths
- Sticky left column for parameter labels (Price, Type, Size, etc.)
- Each property displayed as a table column
- Image carousel at top of each property column
- 11 comparison rows: Price, Type, Size, Rooms, Bathrooms, Year built, Orientation, Consumption, Emissions, Features (tags), Description (collapsible)
- Remove button overlaid on each property's image carousel
- Horizontal scrolling for multiple properties
- Empty state with instructions to use bookmarklet

### Frontend: App Component
**File**: `packages/frontend/src/App.jsx`

Main application orchestrator:
- Manages global state (properties array)
- Detects hash parameter `#import=BASE64_JSON` on mount and decodes imported properties
- Handles add/remove/clear operations
- Displays BookmarkletInstall component
- Passes properties to ComparisonContainer

## Development Workflow

### Initial Setup
```bash
# From project root
pnpm install              # Install all dependencies
pnpm dev                  # Start both frontend and backend
```

### Development Servers
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express API - optional, not used in primary flow)

### Hot Reload
- Frontend: Vite hot module replacement (instant)
- Backend: nodemon restarts on file changes

## API Endpoints

### POST /api/scraper/property
Scrapes property data from Idealista URL

**Request**:
```json
{
  "url": "https://www.idealista.com/inmueble/12345678/"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://www.idealista.com/inmueble/12345678/",
    "price": "450.000 €",
    "title": "Piso en calle Example, Barcelona",
    "size": "85 m²",
    "rooms": "3 hab.",
    "bathrooms": "2 baños",
    "description": "Property description...",
    "images": ["https://img3.idealista.com/..."],
    "features": ["Ascensor", "Aire acondicionado"],
    "scrapedAt": "2026-02-05T12:34:56.789Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid URL. Must be an Idealista property URL."
}
```

## localStorage Schema

**Key**: `'idealista-comparisons'`

**Value**: Array of property objects
```javascript
[
  {
    url: "https://www.idealista.com/inmueble/12345678/",
    price: "450.000 €",
    title: "Piso en calle Example, Barcelona",
    size: "85 m²",
    rooms: "3 hab.",
    bathrooms: "2 baños",
    propertyType: "Piso",                          // NEW: flat, apartment, house, etc.
    constructionYear: "2020",                      // NEW: year built
    orientation: "South",                          // NEW: north/south/east/west
    energyConsumption: "120 kWh/m² year",         // NEW: energy certificate consumption
    emissions: "25 kg CO₂/m² year",               // NEW: CO2 emissions
    description: "Full description text...",
    images: ["url1", "url2", ...],
    features: ["Ascensor", "Aire acondicionado", ...],
    scrapedAt: "2026-02-05T12:34:56.789Z"
  },
  // ... more properties
]
```

## Important Implementation Notes

### Data Extraction Architecture
1. **Bookmarklet Approach (Primary)**: Client-side extraction via browser bookmarklet
   - Runs in user's authenticated browser session
   - Bypasses DataDome anti-bot protection
   - No rate limiting issues
   - Works with dynamic JavaScript-loaded content
   - Supports both English and Spanish Idealista pages
   - User must manually navigate to each property page

2. **Backend Scraping (Deprecated)**: Puppeteer automated scraping
   - Blocked by Idealista's DataDome anti-bot protection
   - Even with realistic user-agents, delays, and headless Chrome configuration
   - Kept in codebase for reference but not functional
   - Would require CAPTCHA solving service or residential proxies to work

3. **Selector Maintenance**: HTML structure may change over time
   - Update selectors in `packages/frontend/src/utils/bookmarklet.js`
   - Test on both Spanish and English Idealista pages
   - Use fallback selectors for robustness
   - Monitor for DOM structure changes in Idealista updates

### Performance Optimization
1. **Client-Side Extraction**: Bookmarklet runs directly in browser - no network overhead
2. **Image Lazy Loading**: Swiper.js lazy loads images in carousel
3. **localStorage Debouncing**: Writes debounced to 300ms
4. **Fixed Table Layout**: Table uses fixed column widths for consistent rendering performance

### Security
- **Data Privacy**: All extraction happens in user's browser, no data sent to external servers
- **localStorage Only**: Property data stored locally, never transmitted to backend
- **URL Validation**: Bookmarklet validates page is Idealista property before extraction
- **No Authentication Required**: Purely client-side application
- **Open Source**: Bookmarklet code readable in `packages/frontend/src/utils/bookmarklet.js`

## Testing

### Manual Testing Flow
1. Start frontend: `pnpm dev:frontend` (backend optional)
2. Open http://localhost:5173
3. Drag the green bookmarklet button to your bookmarks bar
4. Navigate to an Idealista property page (e.g., https://www.idealista.com/inmueble/...)
5. Click the bookmarklet in your bookmarks bar
6. App opens in new tab with property data imported
7. Verify property appears in comparison table with all fields populated
8. Test image carousel navigation in property column
9. Add more properties (test horizontal scroll)
10. Refresh page (test localStorage persistence)
11. Remove properties individually using X button
12. Clear all properties

### Bookmarklet Testing
1. Open browser console on Idealista property page
2. Paste readable bookmarklet code from `packages/frontend/src/utils/bookmarklet.js`
3. Execute to test extraction without installing bookmarklet
4. Check console for extracted data object
5. Verify all fields extracted correctly (especially new fields: propertyType, constructionYear, orientation, energyConsumption, emissions)

## Common Issues & Solutions

### Bookmarklet Not Working
**Issue**: Clicking bookmarklet does nothing or shows alert
**Solution**: Verify you're on an Idealista property page (URL must contain `/inmueble/`). Check browser console for errors.

### Missing Data Fields
**Issue**: Some property fields show as "—" in comparison table
**Solution**: Idealista page may not have that data, or selectors need updating. Check if field exists on Idealista page. Update selectors in `bookmarklet.js` if DOM structure changed.

### Images Not Loading
**Issue**: Image carousel empty or broken images
**Solution**: Check Idealista changed image markup. Update image selectors in bookmarklet. Verify images array in localStorage has valid URLs.

### Hash Import Not Working
**Issue**: Opening app with `#import=...` doesn't add property
**Solution**: Check base64 decoding in App.jsx. Verify bookmarklet encodes data correctly. Check browser console for JSON parse errors.

## Future Enhancements

- **Export**: Download comparison as PDF or Excel
- **Analytics**: Calculate price per m², highlight best value
- **Filtering**: Filter by price range, size, location
- **Sorting**: Sort properties by various criteria
- **Notes**: Add user notes to properties
- **Sharing**: Share comparison via URL (requires backend storage)
- **Alerts**: Price drop notifications
- **Accounts**: User authentication for cloud sync

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### Frontend (.env)
No environment variables required (bookmarklet approach is self-contained)

## Scripts Reference

### Root package.json
- `pnpm dev` - Start frontend only (backend not required)
- `pnpm dev:backend` - Start backend only (optional)
- `pnpm dev:frontend` - Start frontend only

### Backend package.json
- `pnpm dev` - Start with nodemon (auto-reload)
- `pnpm start` - Start in production mode

### Frontend package.json
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

## File Naming Conventions

- **React Components**: PascalCase (e.g., `PropertyCard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useLocalStorage.js`)
- **Services**: camelCase with `.service.js` suffix
- **Utilities**: camelCase with `.js` suffix
- **Config files**: kebab-case (e.g., `vite.config.js`)

## Code Style Guidelines

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS/JSX, double quotes for JSON
- **Semicolons**: Required
- **Arrow Functions**: Preferred for callbacks and functional components
- **Async/Await**: Preferred over `.then()` chains
- **Destructuring**: Use when accessing multiple properties
- **Template Literals**: Use for string interpolation

## Deployment Considerations

### Frontend
- Build: `pnpm --filter frontend build`
- Deploy to: Vercel, Netlify, or any static hosting
- Update bookmarklet code to point to production URL instead of `localhost:5173`
- Pure static site - no backend required
- No environment variables needed

### Backend (Optional)
- Not required for current bookmarklet-based flow
- If implementing alternative scraping method, deploy to VPS with residential proxies or CAPTCHA solving service
- Puppeteer blocked by DataDome without advanced anti-bot circumvention

## Support & Documentation

- **Detailed Spec**: See [PROJECT_SPECIFICATION.md](PROJECT_SPECIFICATION.md)
- **Issues**: Check logs in terminal and browser DevTools console
- **Debugging**: Use `console.log` liberally, check Network tab for API calls

---

**Last Updated**: 2026-02-07
**Status**: Active Development - Bookmarklet Flow Implemented
