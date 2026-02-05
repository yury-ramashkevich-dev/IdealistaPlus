# IdealistaPlus - Property Comparison Tool

## Project Overview

IdealistaPlus is a web application that enables users to compare multiple properties from Idealista.com side-by-side. Users can paste Idealista property URLs, and the application automatically extracts and displays key property information in an easy-to-compare format with horizontally scrollable columns.

## Key Features

- **URL-based Input**: Users paste Idealista property links to add properties
- **Automated Data Extraction**: Backend scrapes property details (price, size, rooms, images, features)
- **Side-by-Side Comparison**: Properties displayed in columns for easy comparison
- **Image Galleries**: Each property shows images in a carousel at the top
- **Persistent Storage**: Comparisons saved to browser localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Monorepo Structure
The project uses a monorepo approach with pnpm workspaces:
- `packages/frontend/` - React application (Vite + Tailwind CSS)
- `packages/backend/` - Express API server with Puppeteer

### Technology Stack

**Frontend:**
- React 18+ (UI framework)
- Vite (build tool and dev server)
- Tailwind CSS (utility-first styling)
- Swiper.js (image carousels with lazy loading)
- Axios (HTTP client for API calls)

**Backend:**
- Node.js 20+ LTS
- Express (REST API)
- Puppeteer (web scraping with headless Chrome)
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
│   │   │   ├── App.jsx                        # Main app component
│   │   │   ├── hooks/
│   │   │   │   ├── useLocalStorage.js         # localStorage persistence
│   │   │   │   └── usePropertyData.js         # API data fetching
│   │   │   ├── services/
│   │   │   │   └── api.js                     # Axios API client
│   │   │   └── components/
│   │   │       ├── UI/ImageCarousel.jsx       # Swiper carousel
│   │   │       ├── PropertyCard/PropertyCard.jsx
│   │   │       ├── UrlInput/UrlInputForm.jsx
│   │   │       └── ComparisonView/ComparisonContainer.jsx
│   │   ├── vite.config.js                     # Vite config + API proxy
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

1. **User Input**: User pastes Idealista URL in frontend form
2. **Validation**: Client-side checks if URL is valid Idealista property link
3. **API Request**: Frontend sends POST to `/api/scraper/property` with URL
4. **Scraping**: Backend launches Puppeteer to scrape property page
5. **Extraction**: Puppeteer extracts price, title, size, rooms, images, features
6. **Response**: Backend returns structured property data as JSON
7. **Display**: Frontend adds property to comparison view
8. **Persistence**: Property data saved to localStorage automatically

## Key Components

### Backend: Puppeteer Scraping Service
**File**: `packages/backend/src/services/puppeteer.service.js`

The core scraping logic that:
- Launches headless Chrome browser
- Navigates to Idealista property URL
- Waits for dynamic content to load
- Extracts data using DOM selectors
- Handles anti-bot measures (user-agent, delays)
- Reuses browser instance for performance
- Closes pages to prevent memory leaks

**Critical Selectors**:
- Price: `.info-data-price`
- Title: `.main-info__title-main`
- Details: `.info-features span`
- Images: `.detail-multimedia-gallery img`, `.carousel-img`
- Features: `.details-property_features li`

### Frontend: useLocalStorage Hook
**File**: `packages/frontend/src/hooks/useLocalStorage.js`

Custom React hook for persistent storage:
- Reads from localStorage on mount
- Auto-saves changes with 300ms debounce
- Handles JSON serialization errors
- Key: `'idealista-comparisons'`
- Value: Array of property objects

### Frontend: App Component
**File**: `packages/frontend/src/App.jsx`

Main application orchestrator:
- Manages global state (properties array)
- Handles add/remove/clear operations
- Coordinates between URL input and comparison view
- Displays errors and loading states

## Development Workflow

### Initial Setup
```bash
# From project root
pnpm install              # Install all dependencies
pnpm dev                  # Start both frontend and backend
```

### Development Servers
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express API)
- **Proxy**: Frontend proxies `/api/*` requests to backend (configured in Vite)

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
    description: "Full description text...",
    images: ["url1", "url2", ...],
    features: ["Ascensor", "Aire acondicionado", ...],
    scrapedAt: "2026-02-05T12:34:56.789Z"
  },
  // ... more properties
]
```

## Important Implementation Notes

### Web Scraping Considerations
1. **Anti-Bot Protection**: Idealista has bot detection
   - Use realistic user-agent strings
   - Add delays between requests (2-5 seconds)
   - Puppeteer with headless Chrome is necessary (Cheerio insufficient)

2. **Dynamic Content**: Property data loads via JavaScript
   - Must wait for selectors with `waitForSelector`
   - Use `networkidle2` wait condition
   - Images may be hidden in JavaScript variables

3. **Rate Limiting**: Backend enforces 50 requests per 15 minutes per IP

4. **Selector Maintenance**: HTML structure may change over time
   - Monitor scraping errors in logs
   - Update selectors as needed
   - Consider fallback selectors

### Performance Optimization
1. **Browser Reuse**: Puppeteer browser instance is reused across requests (don't launch new browser per scrape)
2. **Memory Management**: Always close pages after scraping
3. **Image Lazy Loading**: Frontend uses Swiper.js lazy loading
4. **localStorage Debouncing**: Writes debounced to 300ms

### Security
- CORS: Backend only allows frontend origin (localhost:5173 in dev)
- Rate limiting on all API endpoints
- URL validation on both client and server
- No sensitive data stored

## Testing

### Manual Testing Flow
1. Start dev servers: `pnpm dev`
2. Open http://localhost:5173
3. Paste Idealista URL and click "Add Property"
4. Verify property appears with correct data
5. Test image carousel navigation
6. Add more properties (test horizontal scroll)
7. Refresh page (test localStorage persistence)
8. Remove properties individually
9. Clear all properties

### API Testing
```bash
curl -X POST http://localhost:3001/api/scraper/property \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.idealista.com/inmueble/12345678/"}'
```

## Common Issues & Solutions

### Puppeteer Installation
**Issue**: Chromium download fails on Windows
**Solution**: Set `PUPPETEER_SKIP_DOWNLOAD=true` and use system Chrome

### Memory Leaks
**Issue**: Backend memory grows over time
**Solution**: Ensure pages are closed in `finally` blocks, verify browser reuse

### Scraping Failures
**Issue**: Selectors not found or data incomplete
**Solution**: Check if Idealista changed HTML structure, update selectors in `puppeteer.service.js`

### CORS Errors
**Issue**: Frontend can't reach backend
**Solution**: Verify Vite proxy config in `vite.config.js` and backend CORS middleware

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
```env
VITE_API_URL=http://localhost:3001/api
```

## Scripts Reference

### Root package.json
- `pnpm dev` - Start frontend and backend concurrently
- `pnpm dev:backend` - Start backend only
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
- Deploy to: Vercel, Netlify, or static hosting
- Set `VITE_API_URL` to production backend URL

### Backend
- Deploy to: Heroku, Railway, Render, or VPS
- Ensure Puppeteer dependencies installed
- Set environment variables
- Configure CORS for production frontend origin
- Consider scaling: Multiple instances with shared Redis for rate limiting

## Support & Documentation

- **Detailed Spec**: See [PROJECT_SPECIFICATION.md](PROJECT_SPECIFICATION.md)
- **Issues**: Check logs in terminal and browser DevTools console
- **Debugging**: Use `console.log` liberally, check Network tab for API calls

---

**Last Updated**: 2026-02-05
**Status**: Planning Phase - Implementation Ready
