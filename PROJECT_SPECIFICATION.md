# Idealista Property Comparison Application - Implementation Plan

## Overview
A web application that allows users to compare Idealista properties side-by-side using a browser bookmarklet. The app extracts comprehensive property information (price, size, rooms, type, year, orientation, energy data, images, features) via client-side JavaScript extraction and displays properties in a horizontally scrollable comparison table with localStorage persistence.

## Architecture
- **Frontend**: React 18+ with Vite, Tailwind CSS, Swiper.js for image carousels
- **Data Extraction**: Browser bookmarklet (client-side JavaScript DOM extraction)
- **Backend**: Node.js/Express API with Puppeteer (deprecated - blocked by DataDome anti-bot)
- **Storage**: Browser localStorage (no database required)
- **Structure**: Monorepo using pnpm workspaces

## Technology Stack

### Frontend
- React 18.3+ (UI framework)
- Vite 5+ (build tool - faster than CRA)
- Tailwind CSS 3.4+ (styling)
- Swiper.js 11+ (image carousel with lazy loading)
- Browser Bookmarklet (client-side data extraction)

### Backend (Currently Unused)
- Node.js 20+ LTS
- Express 4.19+
- Puppeteer 22+ (blocked by DataDome anti-bot protection)
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
│   │       │   └── useLocalStorage.js                    # localStorage persistence
│   │       ├── utils/
│   │       │   └── bookmarklet.js                        # Readable bookmarklet source
│   │       └── components/
│   │           ├── UI/
│   │           │   └── ImageCarousel.jsx                 # Swiper.js carousel
│   │           ├── BookmarkletInstall/
│   │           │   └── BookmarkletInstall.jsx            # Bookmarklet install UI
│   │           └── ComparisonView/
│   │               └── ComparisonContainer.jsx           # Table comparison layout
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

### Phase 2: Data Extraction Implementation (Days 2-3)

**2.1 Create Bookmarklet** - `packages/frontend/src/utils/bookmarklet.js`
- Validate page is Idealista property URL (`/inmueble/` in path)
- Extract property data using DOM selectors:
  - Price: `.info-data-price`, `.price-row`
  - Title: `.main-info__title-main`, `.main-info__title`
  - Size, rooms, bathrooms: `.info-features span` (with Spanish/English detection)
  - Property type: Extract from features or title keywords
  - Construction year: Regex pattern matching for 4-digit year
  - Orientation: North/south/east/west keywords in features
  - Energy consumption: `.details-property_certified-energy li`, consumption patterns
  - Emissions: CO2 emission patterns in energy data
  - Images: `.detail-multimedia img`, `.carousel-img`, `picture source`
  - Features: `.details-property_features li`
  - Description: `.comment .adCommentsBody`
- Base64-encode extracted data
- Open app with `#import=BASE64_JSON` hash parameter

**2.2 Create Bookmarklet UI Component** - `packages/frontend/src/components/BookmarkletInstall/BookmarkletInstall.jsx`
- Draggable bookmarklet button (green, Idealista branding)
- Step-by-step installation instructions
- Minified bookmarklet code as `javascript:` URL
- Fallback copy-to-clipboard for mobile
- Set href imperatively to avoid React warnings

**2.3 Backend (Optional/Deprecated)**
- Puppeteer implementation kept for reference
- Blocked by DataDome anti-bot protection
- Not functional without CAPTCHA solving or residential proxies

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

**3.3 Hash Import Logic**

In `packages/frontend/src/App.jsx`:
- Detect `#import=BASE64_JSON` hash parameter on mount
- Decode base64 and parse JSON property data
- Add to properties array and save to localStorage
- Clear hash from URL after import
- Handle decode/parse errors gracefully

**3.4 Build React Components**

`packages/frontend/src/components/UI/ImageCarousel.jsx`:
- Swiper.js implementation
- Navigation arrows and pagination dots
- Lazy loading for performance
- Fallback for no images available

`packages/frontend/src/components/BookmarkletInstall/BookmarkletInstall.jsx`:
- Draggable green bookmarklet button
- Installation instructions (drag to bookmarks bar)
- Minified bookmarklet code
- Copy-to-clipboard fallback

`packages/frontend/src/components/ComparisonView/ComparisonContainer.jsx`:
- HTML `<table>` with fixed column widths
- Sticky left column for parameter labels
- Each property as table column (300px width)
- 11 comparison rows:
  - Price
  - Type (propertyType)
  - Size
  - Rooms
  - Bathrooms
  - Year built (constructionYear)
  - Orientation
  - Consumption (energyConsumption)
  - Emissions
  - Features (tags with show more/less)
  - Description (collapsible with show more/less)
- Image carousel at top of each property column
- Remove button overlaid on carousel
- Title as clickable link to Idealista
- Empty state with bookmarklet instructions

**3.5 Create Main App Component**

`packages/frontend/src/App.jsx`:
- Use useLocalStorage hook to persist properties array
- Detect and decode `#import=BASE64_JSON` hash on mount
- Header with title and "Clear All" button
- BookmarkletInstall component for user onboarding
- ComparisonContainer with all properties
- handleRemoveProperty: Filter out by URL
- handleClearAll: Confirm, then clear array
- No URL input form (replaced by bookmarklet)

**3.6 Configure Vite**

`packages/frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
    // No proxy needed - bookmarklet approach doesn't use backend
  }
});
```

### Phase 4: Integration & Testing (Days 7-8)

**4.1 Setup Development Environment**
- Install concurrently in root package.json
- Create dev scripts to run frontend + backend together
- Test hot-reloading works for both

**4.2 Manual Testing Checklist**
- [ ] Drag bookmarklet to bookmarks bar successfully
- [ ] Navigate to Idealista property page
- [ ] Click bookmarklet - app opens with property imported
- [ ] Verify all 11 data fields extracted correctly (including new fields: type, year, orientation, consumption, emissions)
- [ ] Verify images load and carousel works
- [ ] Test on Spanish Idealista page - data extracts correctly
- [ ] Test on English Idealista page - data extracts correctly
- [ ] Click bookmarklet on non-property page - shows error alert
- [ ] Add 3-5 properties - horizontal scroll works in table
- [ ] Refresh page - properties persist from localStorage
- [ ] Remove property via X button - updates immediately
- [ ] Clear all - confirmation dialog, then clears
- [ ] Test mobile responsive design

**4.3 Error Handling Tests**
- Clicking bookmarklet on non-Idealista page
- Clicking bookmarklet on Idealista search results (not property page)
- Property page with missing data fields (some fields null)
- Malformed hash import parameter
- localStorage quota exceeded (unlikely but possible)
- Browser blocking `javascript:` URLs (some browsers require user approval)

**4.4 Performance Verification**
- Image lazy loading working in carousel (check Network tab)
- Bookmarklet extraction is instant (<1 second)
- App opens quickly with imported data
- Fast initial load (<3 seconds)
- Smooth horizontal scrolling in table with multiple properties
- Table rendering performant with fixed column widths

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

### Frontend (10 files)
1. `packages/frontend/src/App.jsx` - Main application component with hash import logic
2. `packages/frontend/src/main.jsx` - React entry point
3. `packages/frontend/src/index.css` - Tailwind imports
4. `packages/frontend/src/hooks/useLocalStorage.js` - localStorage hook
5. `packages/frontend/src/utils/bookmarklet.js` - Readable bookmarklet source code
6. `packages/frontend/src/components/UI/ImageCarousel.jsx` - Swiper carousel
7. `packages/frontend/src/components/BookmarkletInstall/BookmarkletInstall.jsx` - Bookmarklet UI with minified code
8. `packages/frontend/src/components/ComparisonView/ComparisonContainer.jsx` - Table comparison layout
9. `packages/frontend/tailwind.config.js` - Tailwind configuration
10. `packages/frontend/vite.config.js` - Vite configuration

### Backend (8 files - Optional/Reference Only)
1. `packages/backend/src/server.js` - Express app entry point
2. `packages/backend/src/services/puppeteer.service.js` - Core scraping logic (blocked by DataDome)
3. `packages/backend/src/controllers/scraper.controller.js` - API endpoint handler
4. `packages/backend/src/routes/scraper.routes.js` - Route definitions
5. `packages/backend/src/middleware/error.middleware.js` - Error handling
6. `packages/backend/src/utils/validation.js` - URL validation
7. `packages/backend/src/utils/logger.js` - Winston logger
8. `packages/backend/.env` - Environment variables

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
    "propertyType": "Piso",                          // NEW: flat, apartment, house, etc.
    "constructionYear": "2020",                      // NEW: year built
    "orientation": "South",                          // NEW: north/south/east/west
    "energyConsumption": "120 kWh/m² year",         // NEW: energy certificate
    "emissions": "25 kg CO₂/m² year",               // NEW: CO2 emissions
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

### Data Extraction Challenges
1. **Anti-Bot Protection (Backend Approach - Failed)**:
   - Idealista uses DataDome anti-bot protection
   - Blocks Puppeteer/automated browsers even with realistic settings
   - Would require CAPTCHA solving service or residential proxies
   - **Solution**: Switched to bookmarklet approach

2. **Bookmarklet Approach (Current)**:
   - Runs in user's actual browser session (bypasses anti-bot)
   - No rate limiting concerns (user manually navigates)
   - Works with dynamic JavaScript-loaded content
   - Must handle both Spanish and English page variations
   - User must be on Idealista property page when clicking bookmarklet

3. **Dynamic Content**: Images and data loaded via JavaScript
   - Bookmarklet runs after page fully loads
   - Access to all DOM elements and JavaScript variables
   - Extract images from multiple sources (img tags, picture sources, data attributes)

4. **Selector Changes**: Idealista HTML may change
   - Use multiple selector strategies (primary + fallback)
   - Test on both Spanish (.es) and English Idealista sites
   - Plan for periodic maintenance of bookmarklet selectors
   - Readable source in `bookmarklet.js` for easy updates

### Performance Optimization
1. **Frontend**:
   - Lazy load images with Swiper.js
   - Debounce localStorage writes (300ms)
   - Table uses fixed column widths for consistent rendering
   - React re-renders optimized by stable property keys (URL)

2. **Bookmarklet**:
   - Minified to reduce size (<10KB)
   - Synchronous DOM extraction (instant)
   - Base64 encoding happens in user's browser
   - Opens app in new window without blocking current page

### Security & Privacy
- **Data Privacy**: All extraction happens in user's browser, no external transmission
- **localStorage Only**: Property data never sent to backend or external servers
- **URL Validation**: Bookmarklet checks page URL before extraction
- **No Authentication**: Purely client-side application, no user accounts
- **Open Source**: Bookmarklet code is readable and auditable
- **No Sensitive Data**: Only public property listing data stored in localStorage

## Verification & Testing

### End-to-End Test Flow
1. **Setup**: Run `pnpm dev:frontend` from root directory
2. **Access**: Open http://localhost:5173 in browser
3. **Install Bookmarklet**:
   - Drag green "+ IdealistaPlus" button to bookmarks bar
   - Verify bookmarklet appears in bookmarks
4. **Add Property**:
   - Navigate to Idealista property page (e.g., https://www.idealista.com/inmueble/12345678/)
   - Click "IdealistaPlus" bookmarklet in bookmarks bar
   - App opens in new window/tab with property imported
5. **Verify Property Display**:
   - Property appears as column in comparison table
   - Images appear in carousel at top
   - All 11 rows populated: Price, Type, Size, Rooms, Bathrooms, Year, Orientation, Consumption, Emissions, Features, Description
   - Title is clickable link to Idealista
   - Features displayed as green tags
   - Description truncated with "Show more" button
6. **Test Persistence**:
   - Refresh browser (F5)
   - Verify property still appears (localStorage working)
7. **Test Multiple Properties**:
   - Navigate to 2-3 more Idealista properties
   - Click bookmarklet on each
   - Verify horizontal scroll works in table
   - All properties aligned as columns
8. **Test Remove**:
   - Click X button overlaid on property's image carousel
   - Verify property column removed immediately
9. **Test Clear All**:
   - Click "Clear All" button
   - Confirm dialog appears
   - Verify all properties removed

### Bookmarklet Testing
```javascript
// Test bookmarklet extraction in browser console
// 1. Navigate to Idealista property page
// 2. Open browser DevTools console
// 3. Paste readable bookmarklet code from packages/frontend/src/utils/bookmarklet.js
// 4. Execute code
// 5. Check that app opens with property data

// Or test extraction only (without opening app):
// Replace window.open() with console.log() in bookmarklet code
// Verify extracted data object in console
```

### Error Handling Tests
- Click bookmarklet on non-Idealista page: Should show alert "Please navigate to an Idealista property page first"
- Click bookmarklet on Idealista search page (not property): Should show alert
- Property with missing fields: Table cells show "—" for null values
- Malformed hash import: App handles gracefully without crashing
- Browser blocks javascript: URLs: User must approve in browser settings

### Performance Checks
- Open DevTools → Network tab
- Verify images lazy load in carousel (only visible images loaded initially)
- Bookmarklet extraction is instant (<1 second)
- App import from hash is fast (<500ms)
- Table scrolling is smooth with 5+ properties
- No memory leaks (check with multiple imports)

## Estimated Timeline
- **Day 1**: Project setup, initialize monorepo, install dependencies
- **Days 2-3**: Bookmarklet development, data extraction logic, hash import
- **Days 4-6**: Frontend development, React components, table layout, Tailwind styling
- **Days 7-8**: Integration testing, bug fixes, error handling, bookmarklet refinement
- **Day 9**: Polish, documentation, final testing

Total: ~9 days for MVP

**Note**: Original backend Puppeteer approach attempted but abandoned due to DataDome anti-bot protection. Bookmarklet approach implemented as primary solution.

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

### Milestone 2: Data Extraction - Bookmarklet Implementation
**Goal**: Implement working bookmarklet data extraction

**Deliverables**:
- Readable bookmarklet source in `utils/bookmarklet.js`
- Extraction logic for all 11+ property fields
- Support for Spanish and English Idealista pages
- Base64 encoding and hash parameter generation
- BookmarkletInstall component with minified code
- Hash import logic in App.jsx

**Success Criteria**: Can click bookmarklet on Idealista property page and see property imported in app with all fields populated

### Milestone 3: Frontend Foundation
**Goal**: Create React app structure with basic components

**Deliverables**:
- Tailwind CSS configured with custom colors
- useLocalStorage hook
- Hash import detection and decoding logic
- Basic App.jsx structure
- BookmarkletInstall component

**Success Criteria**: App renders with proper styling, can detect and decode hash imports, displays bookmarklet installation UI

### Milestone 4: Frontend UI Components
**Goal**: Build all user-facing components

**Deliverables**:
- ImageCarousel component (Swiper.js)
- ComparisonContainer component with table layout
- 11 comparison rows with proper rendering
- Features and description cells with show more/less
- Complete App.jsx with all handlers

**Success Criteria**: Full user flow works - install bookmarklet, import property, view in table, remove property, clear all

### Milestone 5: Integration & Testing
**Goal**: End-to-end functionality with localStorage persistence

**Deliverables**:
- localStorage persistence working
- Bookmarklet works on Spanish and English pages
- Error handling for all edge cases (wrong page, missing data, malformed hash)
- Manual testing checklist completed
- Performance verification (instant extraction, smooth scrolling)

**Success Criteria**: Can install bookmarklet, import multiple properties from Idealista, refresh page (data persists), remove properties, table horizontal scroll works smoothly

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
