# Idealista Property Comparison Application - Implementation Plan

## Overview
A web application that allows users to compare Idealista properties side-by-side by pasting property URLs. The app will extract key information (price, size, rooms, images) via web scraping and display properties in horizontally scrollable columns with localStorage persistence.

## Architecture
- **Frontend**: React 18+ with Vite, Tailwind CSS, Swiper.js for image carousels
- **Backend**: Node.js/Express API with Puppeteer for web scraping
- **Storage**: Browser localStorage (no database required)
- **Structure**: Monorepo using pnpm workspaces

## Technology Stack

### Frontend
- React 18.3+ (UI framework)
- Vite 5+ (build tool - faster than CRA)
- Tailwind CSS 3.4+ (styling)
- Swiper.js 11+ (image carousel with lazy loading)
- Axios 1.6+ (HTTP client)

### Backend
- Node.js 20+ LTS
- Express 4.19+
- Puppeteer 22+ (web scraping for JavaScript-rendered content)
- express-rate-limit 7+ (prevent abuse)
- winston 3+ (logging)

### Development Tools
- pnpm 8+ (workspace management)
- concurrently 8+ (run frontend + backend together)
- nodemon 3+ (backend auto-reload)

## Project Structure

```
d:\Personal\Professional\Code\IdealistaPlus\
├── package.json                          # Root workspace config
├── pnpm-workspace.yaml                   # pnpm workspace definition
├── .gitignore
├── README.md
│
├── packages/
│   ├── frontend/                         # React application
│   │   ├── package.json
│   │   ├── vite.config.js               # Vite config with proxy
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.jsx                  # React entry point
│   │       ├── App.jsx                   # Main app component
│   │       ├── index.css                 # Tailwind imports
│   │       ├── hooks/
│   │       │   ├── useLocalStorage.js    # localStorage persistence
│   │       │   └── usePropertyData.js    # API calls for scraping
│   │       ├── services/
│   │       │   └── api.js                # Axios API client
│   │       └── components/
│   │           ├── UI/
│   │           │   └── ImageCarousel.jsx # Swiper.js carousel
│   │           ├── PropertyCard/
│   │           │   └── PropertyCard.jsx  # Single property display
│   │           ├── UrlInput/
│   │           │   └── UrlInputForm.jsx  # URL input with validation
│   │           └── ComparisonView/
│   │               └── ComparisonContainer.jsx  # Horizontal scroll container
│   │
│   └── backend/                          # Express API
│       ├── package.json
│       ├── nodemon.json
│       ├── .env
│       └── src/
│           ├── server.js                 # Express app entry
│           ├── services/
│           │   └── puppeteer.service.js  # Core scraping logic
│           ├── controllers/
│           │   └── scraper.controller.js # API endpoint logic
│           ├── routes/
│           │   └── scraper.routes.js     # Route definitions
│           ├── middleware/
│           │   └── error.middleware.js   # Error handling
│           └── utils/
│               ├── validation.js         # URL validation
│               └── logger.js             # Winston logger setup
```

## Implementation Phases

### Phase 1: Project Setup (Day 1)

**1.1 Initialize Monorepo**
```bash
cd d:\Personal\Professional\Code\IdealistaPlus
pnpm init
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
```

Create root `package.json` with scripts:
```json
{
  "name": "idealista-plus",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm run dev:backend\" \"pnpm run dev:frontend\"",
    "dev:backend": "pnpm --filter backend dev",
    "dev:frontend": "pnpm --filter frontend dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**1.2 Initialize Frontend**
```bash
mkdir -p packages/frontend
cd packages/frontend
pnpm create vite . -- --template react
pnpm install
pnpm install -D tailwindcss postcss autoprefixer
pnpm install swiper axios
npx tailwindcss init -p
```

**1.3 Initialize Backend**
```bash
mkdir -p packages/backend/src
cd packages/backend
pnpm init
pnpm install express cors dotenv winston express-rate-limit
pnpm install puppeteer axios
pnpm install -D nodemon
```

**1.4 Create Configuration Files**
- `.gitignore` (node_modules, .env, dist, build, .DS_Store)
- `packages/backend/.env` (PORT=3001, NODE_ENV=development)
- `packages/frontend/.env` (VITE_API_URL=http://localhost:3001/api)
- `README.md` with setup instructions

### Phase 2: Backend Development (Days 2-3)

**2.1 Create Express Server** - `packages/backend/src/server.js`
- Setup Express with CORS (allow http://localhost:5173)
- Add rate limiting (50 requests per 15 minutes)
- Register scraper routes
- Add error handling middleware

**2.2 Implement Puppeteer Scraping Service** - `packages/backend/src/services/puppeteer.service.js`
- Browser initialization with anti-bot settings (proper user-agent, viewport)
- Navigate to Idealista property URL
- Wait for key elements to load (`.info-data-price`)
- Extract property data using page.evaluate():
  - Price (`.info-data-price`)
  - Title/Location (`.main-info__title-main`)
  - Size, rooms, bathrooms (`.info-features span`)
  - Images (handle JavaScript-hidden URLs)
  - Features (`.details-property_features li`)
  - Description (`.comment`)
- Return structured property object
- Close page after scraping (prevent memory leaks)

**Key Implementation Details:**
- Reuse browser instance across requests (don't launch new browser per scrape)
- Set 30-60 second timeout for scraping
- Handle dynamic content with `waitForSelector` and `networkidle2`
- Extract images from JavaScript variables if needed

**2.3 Create API Endpoints**
- `packages/backend/src/controllers/scraper.controller.js` - Handle POST /api/scraper/property
- `packages/backend/src/routes/scraper.routes.js` - Define routes
- `packages/backend/src/utils/validation.js` - Validate URL is from idealista.com/inmueble/
- `packages/backend/src/middleware/error.middleware.js` - Centralized error handling

**2.4 Add Logging**
- `packages/backend/src/utils/logger.js` - Winston logger setup
- Log scraping attempts, errors, and performance metrics

### Phase 3: Frontend Development (Days 4-6)

**3.1 Setup Tailwind CSS**

`packages/frontend/tailwind.config.js`:
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'idealista-green': '#00B389',
        'idealista-dark': '#1A1A1A',
      }
    },
  },
  plugins: [],
}
```

`packages/frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**3.2 Create Custom Hooks**

`packages/frontend/src/hooks/useLocalStorage.js`:
- Store/retrieve properties from localStorage
- Key: 'idealista-comparisons'
- Auto-save with 300ms debounce
- Handle JSON parse/stringify errors gracefully

`packages/frontend/src/hooks/usePropertyData.js`:
- Call backend scraping API
- Manage loading and error states
- Return fetchProperty function

**3.3 Create API Service**

`packages/frontend/src/services/api.js`:
- Axios instance with baseURL (http://localhost:3001/api)
- 60-second timeout for scraping operations
- POST /scraper/property endpoint function
- Error handling with user-friendly messages

**3.4 Build React Components**

`packages/frontend/src/components/UI/ImageCarousel.jsx`:
- Swiper.js implementation
- Navigation arrows and pagination dots
- Lazy loading for performance
- Fallback for no images available

`packages/frontend/src/components/PropertyCard/PropertyCard.jsx`:
- Display property images at top (ImageCarousel)
- Show key parameters: price (large, green), title, size, rooms, bathrooms
- List features as tags (first 5, show "+X more" if more exist)
- Remove button (X in top-right corner)
- "View on Idealista →" link
- Fixed width: 350px for consistent layout

`packages/frontend/src/components/UrlInput/UrlInputForm.jsx`:
- Input field for Idealista URL
- "Add Property" button
- Client-side URL validation (must include idealista.com and /inmueble/)
- Show loading spinner during scraping
- Display error messages
- Clear input on success

`packages/frontend/src/components/ComparisonView/ComparisonContainer.jsx`:
- Horizontal scrollable container (overflow-x-auto)
- Display PropertyCard components in a row with gap
- Empty state: "No properties to compare yet" with icon
- Smooth scrolling behavior

**3.5 Create Main App Component**

`packages/frontend/src/App.jsx`:
- Use useLocalStorage hook to persist properties array
- Use usePropertyData hook for API calls
- Header with title and "Clear All" button
- UrlInputForm for adding properties
- Error display section
- ComparisonContainer with all properties
- handleAddProperty: Validate not duplicate, fetch data, add to array
- handleRemoveProperty: Filter out by URL
- handleClearAll: Confirm, then clear array

**3.6 Configure Vite**

`packages/frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
```

### Phase 4: Integration & Testing (Days 7-8)

**4.1 Setup Development Environment**
- Install concurrently in root package.json
- Create dev scripts to run frontend + backend together
- Test hot-reloading works for both

**4.2 Manual Testing Checklist**
- [ ] Add valid Idealista property URL - data appears correctly
- [ ] Verify images load and carousel works
- [ ] Try invalid URL - error message appears
- [ ] Try duplicate URL - error message appears
- [ ] Add 3-5 properties - horizontal scroll works
- [ ] Refresh page - properties persist from localStorage
- [ ] Remove property - updates immediately
- [ ] Clear all - confirmation dialog, then clears
- [ ] Test rate limiting - 50 requests work, 51st gets 429 error
- [ ] Test mobile responsive design

**4.3 Error Handling Tests**
- Invalid Idealista URL format
- Non-existent property (404 on Idealista)
- Network timeout
- Idealista anti-bot detection
- localStorage quota exceeded (unlikely but possible)

**4.4 Performance Verification**
- Image lazy loading working (check Network tab)
- No memory leaks (Puppeteer pages/browser properly closed)
- Fast initial load (<3 seconds)
- Smooth scrolling with multiple properties

### Phase 5: Polish & Documentation (Day 9)

**5.1 UI/UX Refinements**
- Add loading skeleton for PropertyCard during fetch
- Improve error messages with actionable suggestions
- Add tooltips for features/buttons
- Responsive design for mobile (optional: vertical stack toggle)

**5.2 Documentation**
- README.md with:
  - Project description
  - Setup instructions
  - How to run locally
  - Tech stack
  - Known limitations
  - Future enhancements
- Add comments to complex code sections

**5.3 Production Preparation**
- Add build scripts
- Environment variable documentation
- Deployment considerations (Heroku, Vercel, Netlify)

## Critical Files to Create

### Backend (8 files)
1. `packages/backend/src/server.js` - Express app entry point
2. `packages/backend/src/services/puppeteer.service.js` - Core scraping logic
3. `packages/backend/src/controllers/scraper.controller.js` - API endpoint handler
4. `packages/backend/src/routes/scraper.routes.js` - Route definitions
5. `packages/backend/src/middleware/error.middleware.js` - Error handling
6. `packages/backend/src/utils/validation.js` - URL validation
7. `packages/backend/src/utils/logger.js` - Winston logger
8. `packages/backend/.env` - Environment variables

### Frontend (12 files)
1. `packages/frontend/src/App.jsx` - Main application component
2. `packages/frontend/src/main.jsx` - React entry point
3. `packages/frontend/src/index.css` - Tailwind imports
4. `packages/frontend/src/hooks/useLocalStorage.js` - localStorage hook
5. `packages/frontend/src/hooks/usePropertyData.js` - API hook
6. `packages/frontend/src/services/api.js` - Axios client
7. `packages/frontend/src/components/UI/ImageCarousel.jsx` - Swiper carousel
8. `packages/frontend/src/components/PropertyCard/PropertyCard.jsx` - Property display
9. `packages/frontend/src/components/UrlInput/UrlInputForm.jsx` - URL input
10. `packages/frontend/src/components/ComparisonView/ComparisonContainer.jsx` - Comparison layout
11. `packages/frontend/tailwind.config.js` - Tailwind configuration
12. `packages/frontend/vite.config.js` - Vite configuration with proxy

### Root (3 files)
1. `package.json` - Workspace configuration and scripts
2. `pnpm-workspace.yaml` - Workspace definition
3. `.gitignore` - Git ignore rules

## localStorage Schema

```javascript
// Key: 'idealista-comparisons'
// Value: Array of property objects
[
  {
    "url": "https://www.idealista.com/inmueble/12345678/",
    "price": "450.000 €",
    "title": "Piso en calle Example, 123, Barcelona",
    "size": "85 m²",
    "rooms": "3 hab.",
    "bathrooms": "2 baños",
    "description": "Full property description...",
    "images": [
      "https://img3.idealista.com/blur/WEB_DETAIL/0/id.prop_detail.jpeg",
      "https://img3.idealista.com/blur/WEB_DETAIL/0/id.prop_detail_2.jpeg"
    ],
    "features": [
      "Ascensor",
      "Aire acondicionado",
      "Calefacción"
    ],
    "scrapedAt": "2026-02-05T12:34:56.789Z"
  }
]
```

## Key Technical Considerations

### Web Scraping Challenges
1. **Anti-Bot Protection**: Idealista may block automated requests
   - Use realistic user-agent and browser settings
   - Add 2-5 second delays between requests
   - Consider rotating user-agents if needed

2. **Dynamic Content**: Images and data loaded via JavaScript
   - Use Puppeteer (not Cheerio) for JavaScript rendering
   - Wait for selectors with `waitForSelector`
   - Extract image URLs from JavaScript variables

3. **Rate Limiting**: Prevent server abuse
   - Backend: 50 requests per 15 minutes per IP
   - Client-side: Debounce URL submissions

4. **Selector Changes**: Idealista HTML may change
   - Use multiple selector strategies (primary + fallback)
   - Log errors for monitoring
   - Plan for periodic maintenance

### Performance Optimization
1. **Frontend**:
   - Lazy load images with Swiper.js
   - Debounce localStorage writes (300ms)
   - Use React.memo for PropertyCard if performance issues

2. **Backend**:
   - Reuse Puppeteer browser instance (critical!)
   - Close pages after scraping to free memory
   - Set timeout limits (30-60 seconds)

### CORS & Security
- Backend CORS: Allow only frontend origin
- Rate limiting on all API endpoints
- URL validation on both client and server
- No sensitive data in localStorage

## Verification & Testing

### End-to-End Test Flow
1. **Setup**: Run `pnpm dev` from root directory
2. **Access**: Open http://localhost:5173 in browser
3. **Add Property**:
   - Paste valid Idealista URL (e.g., https://www.idealista.com/inmueble/12345678/)
   - Click "Add Property"
   - Verify loading spinner appears
   - Wait for property to appear in comparison view
4. **Verify Property Display**:
   - Images appear and carousel works
   - Price, title, size, rooms, bathrooms displayed
   - Features listed
   - "View on Idealista" link works
5. **Test Persistence**:
   - Refresh browser (F5)
   - Verify property still appears (localStorage working)
6. **Test Multiple Properties**:
   - Add 2-3 more properties
   - Verify horizontal scroll works
   - All properties aligned side-by-side
7. **Test Remove**:
   - Click X button on a property
   - Verify it's removed immediately
8. **Test Clear All**:
   - Click "Clear All" button
   - Confirm dialog appears
   - Verify all properties removed

### API Testing
```bash
# Test scraping endpoint directly
curl -X POST http://localhost:3001/api/scraper/property \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.idealista.com/inmueble/12345678/"}'

# Should return:
# {
#   "success": true,
#   "data": { /* property object */ }
# }
```

### Error Handling Tests
- Invalid URL: Should show "Please enter a valid Idealista property URL"
- Duplicate URL: Should show "This property is already in your comparison"
- Network error: Should show "Failed to scrape property"
- Rate limit exceeded: Should show appropriate error message

### Performance Checks
- Open DevTools → Network tab
- Verify images lazy load (only visible images loaded initially)
- Check memory usage doesn't grow over time
- Verify backend logs show browser reuse (not launching new browser per request)

## Estimated Timeline
- **Day 1**: Project setup, initialize monorepo, install dependencies
- **Days 2-3**: Backend development, implement Puppeteer scraping
- **Days 4-6**: Frontend development, React components, Tailwind styling
- **Days 7-8**: Integration testing, bug fixes, error handling
- **Day 9**: Polish, documentation, final testing

Total: ~9 days for MVP

## Implementation Milestones

### Milestone 1: Project Bootstrap
**Goal**: Initialize monorepo structure with all configuration files

**Deliverables**:
- Root package.json with workspace scripts
- pnpm-workspace.yaml configured
- Frontend package initialized with Vite + React
- Backend package initialized with Express
- Configuration files (.gitignore, .env files, Tailwind config)
- Project compiles and runs (empty apps)

**Success Criteria**: Running `pnpm dev` starts both frontend and backend servers without errors

### Milestone 2: Backend Core - Web Scraping
**Goal**: Implement working Puppeteer scraping service

**Deliverables**:
- Express server with CORS and rate limiting
- Puppeteer service that scrapes Idealista properties
- API endpoint: POST /api/scraper/property
- URL validation utility
- Error handling middleware
- Winston logger setup

**Success Criteria**: Can successfully scrape a real Idealista property URL via API call and receive structured JSON data

### Milestone 3: Frontend Foundation
**Goal**: Create React app structure with basic components

**Deliverables**:
- Tailwind CSS configured with custom colors
- useLocalStorage hook
- usePropertyData hook
- API service with Axios
- Basic App.jsx structure

**Success Criteria**: App renders with proper styling, can make API calls (even if components aren't complete)

### Milestone 4: Frontend UI Components
**Goal**: Build all user-facing components

**Deliverables**:
- ImageCarousel component (Swiper.js)
- PropertyCard component
- UrlInputForm component
- ComparisonContainer component
- Complete App.jsx with all handlers

**Success Criteria**: Full user flow works - add property, view in comparison, remove property, clear all

### Milestone 5: Integration & Testing
**Goal**: End-to-end functionality with localStorage persistence

**Deliverables**:
- Vite proxy configured for backend
- localStorage persistence working
- Error handling for all edge cases
- Manual testing checklist completed
- Performance verification

**Success Criteria**: Can add multiple properties, refresh page (data persists), remove properties, horizontal scroll works

### Milestone 6: Polish & Documentation
**Goal**: Production-ready application with documentation

**Deliverables**:
- README.md with setup instructions
- Loading states and error messages polished
- Responsive design verified
- Code comments added
- Build scripts configured

**Success Criteria**: New developer can clone repo, run setup, and start development following README

## Milestone Execution Workflow

**Before starting each milestone:**
1. Create/update `todo.md` with specific action items for the milestone
2. List files to be created/modified
3. Define verification steps

**After completing each milestone:**
1. Mark all actions as done in `todo.md`
2. Verify success criteria met
3. Ask user for approval before proceeding to next milestone

## Future Enhancements
- Export comparison as PDF/Excel
- Price per m² calculation and "best value" highlighting
- Filter and sort properties
- User notes on properties
- Share comparison via URL (requires backend storage)
- Price drop alerts
- User authentication for cloud sync
