# Mind the Gap - Gender Equality Statistics Dashboard

## Overview

Mind the Gap is a comprehensive data visualization dashboard application that displays real-time gender equality statistics from the World Bank API. The application presents five key metrics: gender pay gap, leadership representation, maternal mortality rate, contraceptive access, and workforce participation across 5 locations (Global, United States, United Kingdom, Canada, and Mexico). 

Users can:
- View all statistics in an interactive dashboard with expandable historical trend charts (2015-2024)
- Generate embeddable badges for individual metrics
- Export statistics in CSV or JSON formats for research/analysis
- Share individual statistics on social media (Twitter, LinkedIn, Facebook) with pre-generated stat cards

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Choice: React with TypeScript**
- **Rationale**: Type safety for complex data structures and API responses, component-based architecture for reusable metric cards
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing

**UI Component System: Shadcn/ui with Radix UI**
- **Problem Addressed**: Need for accessible, customizable components without heavyweight framework dependencies
- **Chosen Solution**: Shadcn/ui components built on Radix UI primitives
- **Benefits**: Copy-paste component architecture, full customization control, accessible by default
- **Design System**: Material Design principles adapted for data-focused applications (specified in `design_guidelines.md`)

**Styling Architecture**
- **CSS Framework**: Tailwind CSS with custom configuration
- **Typography**: Inter for UI elements, JetBrains Mono for numerical data display
- **Theme System**: HSL-based color variables for light/dark mode support
- **Accent Color**: Orange (#ffc569 / 42 100% 71%) used for highlights, selections, and active states
- **Layout Primitives**: Consistent spacing scale (2, 4, 6, 8, 12) from Tailwind units

**State Management**
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Rationale**: Built-in caching, automatic refetching, loading/error states
- **Local State**: React useState for UI interactions (country selection, badge configuration)

### Backend Architecture

**Server Framework: Express.js**
- **Runtime**: Node.js with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundled, optimized server code

**API Design Pattern: RESTful**
- **Endpoints Structure**:
  - `/api/stats/:country` - Fetch all statistics for a specific country
  - `/api/trends/:stat/:country` - Fetch historical time-series data (2015-2024) for a specific statistic and country
  - `/api/export/:country?format=csv|json` - Export all statistics in CSV or JSON format with proper download headers
  - `/api/badge/:stat/:country1/:country2` - Generate embeddable SVG comparison badge (500x120) showing two locations side-by-side
  - `/api/badge-png/:stat/:country1/:country2` - Generate PNG comparison badge (500x120) from SVG for email signature compatibility
  - `/api/share/:stat/:country` - Generate social media share card (1200x630 SVG) optimized for Twitter/LinkedIn/Facebook
- **Response Format**: JSON with structured statistics schema (value, detail, year, source)
- **Security**: All badge endpoints include whitelist validation for stat/country params and SVG text sanitization to prevent injection attacks

**Data Caching Strategy**
- **Problem**: World Bank API rate limits and slow response times
- **Solution**: In-memory server-side cache with 24-hour expiration
- **Implementation**: Simple object-based cache with timestamp validation
- **Benefits**: Reduced external API calls, faster response times, decreased load on World Bank servers

### Data Storage Solutions

**Database Configuration: PostgreSQL with Drizzle ORM**
- **Connection**: Neon serverless PostgreSQL (via `@neondatabase/serverless`)
- **ORM Choice**: Drizzle for type-safe database queries
- **Schema Location**: `shared/schema.ts` for shared types between frontend/backend
- **Migration Strategy**: Drizzle Kit for schema migrations (`drizzle.config.ts`)
- **Current Usage**: Minimal - schema defines type structures but primary data source is external API

**Session Management**
- **Strategy**: `connect-pg-simple` for PostgreSQL-backed sessions
- **Rationale**: Persistent sessions across server restarts, scalable session storage

### External Dependencies

**Primary Data Source: World Bank API**
- **Base URL**: `https://api.worldbank.org/v2`
- **Key Indicators**:
  - `SL.EMP.WORK.FE.WE.ZS` - Female employment metrics
  - Leadership representation data
  - Maternal mortality statistics
  - Contraceptive prevalence data
  - Workforce participation rates
- **Response Format**: JSON with nested array structure
- **Data Freshness**: 2020-2024 date range for most indicators

**Font Delivery: Google Fonts**
- **Fonts**: Inter (UI), JetBrains Mono (data display)
- **Loading Strategy**: Preconnect to Google Fonts domains for performance

**UI Component Libraries**
- **Radix UI**: Complete suite of accessible, unstyled components (Dialog, Dropdown, Select, etc.)
- **Lucide React**: Icon library for data visualization icons (TrendingDown, Users, Heart, Share2, Download, etc.)
- **Recharts**: Data visualization library for historical trend charts (LineChart with responsive containers)
- **class-variance-authority**: Type-safe variant management for components
- **cmdk**: Command palette component

**Data Visualization**
- **Library**: Recharts v2.15.2
- **Chart Types**: Line charts for historical trends
- **Features**: Responsive containers, tooltips, grid overlays, themed styling matching application design
- **Integration**: Charts load on-demand when user expands stat cards to minimize initial data fetching

### Build and Deployment Architecture

**Development Environment**
- **Hot Module Replacement**: Vite middleware integrated with Express server
- **Template Reloading**: Dynamic index.html reloading with cache busting
- **Error Handling**: Runtime error overlay via Replit Vite plugin

**Production Build Process**
1. Frontend: Vite builds React app to `dist/public`
2. Backend: esbuild bundles server to single `dist/index.js` file
3. Static serving: Express serves compiled frontend assets

**Path Resolution**
- **Client Aliases**: `@/` for client source, `@shared/` for shared types
- **Asset Handling**: `@assets/` for attached assets directory
- **Module Resolution**: Bundler mode for TypeScript compatibility

### Authentication and Authorization

**Current State**: Basic structure with user schema defined
- **User Storage**: In-memory storage with interface for future database integration
- **Session Management**: PostgreSQL-backed sessions configured but not actively used
- **Future Extension Point**: Authentication system designed for easy integration

## Recent Updates (November 2025)

### Location Coverage
- **Supported Locations**: Global, United States, United Kingdom, Canada, Mexico
- **Total Coverage**: 5 locations with comprehensive World Bank API data
- **Implementation**: TypeScript types, backend country code mappings, and frontend selectors
- **Data Source**: All locations fetch real-time data from World Bank API with location-specific fallbacks

### Historical Trend Analysis
- **Feature**: Interactive expandable trend charts on each statistic card
- **Data Range**: 2015-2024 (10 years of historical data)
- **Visualization**: Recharts LineChart with responsive design
- **Caching**: Trend data cached per stat/country combination for 24 hours
- **User Experience**: Click chevron button on any stat card to reveal/hide historical trends
- **Data Quality**: Filters null values, sorts chronologically, handles missing years gracefully

### Data Export Functionality
- **Formats**: CSV and JSON
- **Implementation**: `/api/export/:country` endpoint with query parameter `?format=csv|json`
- **CSV Structure**: Headers include Metric, Value, Detail, Year, Source
- **Download Behavior**: Proper Content-Disposition headers trigger browser downloads
- **File Naming**: `mind-the-gap-{country}-{date}.{format}`
- **UI Integration**: Dropdown button in dashboard header with format selection

### Social Media Sharing
- **Feature**: Share individual statistics on social media platforms
- **Implementation**: SVG-based share cards (1200x630) optimized for social media
- **Technical Decision**: SVG chosen over PNG for infinite scalability, smaller file sizes, and broad web support
- **Platforms**: Twitter, LinkedIn, Facebook with platform-specific sharing URLs
- **Share Card Design**: Gradient background, large typography, branding, source attribution
- **Copy Feature**: Direct link copying for manual sharing or embedding
- **UI Integration**: Share button on each stat card opens dialog with preview and platform buttons

### Email Signature Badge Support
- **Problem Solved**: Gmail and most email clients don't support SVG images in signatures
- **Solution**: Dual-format badge generation with format-specific use cases
- **Badge Format**: Comparison badges showing Global vs. selected location side-by-side
- **Endpoints**: 
  - SVG: `/api/badge/:stat/:country1/:country2` (500x120 SVG with two-column comparison)
  - PNG: `/api/badge-png/:stat/:country1/:country2` (500x120 PNG converted via Sharp)
- **Badge Design**: Two-column layout with translucent boxes showing values for both locations
- **UI Enhancement**: 
  - Global location always displayed (fixed)
  - User selects comparison location (US, UK, Canada, or Mexico)
  - Badge preview shows real-time data for both locations
  - Format selector for PNG (email) vs SVG (web)
- **Default Selection**: PNG format selected by default for optimal email client support
- **Security**: Comprehensive input validation, whitelist checking, and SVG text sanitization to prevent injection attacks
- **Performance**: Server-side Sharp conversion ensures consistent rendering across all email clients
- **Use Cases**: 
  - PNG: Gmail signatures, Outlook signatures, email marketing campaigns showing global vs local comparison
  - SVG: Website embedding, web documentation, modern web platforms with comparison data

### Tagline Implementation
- **Tagline**: "Mind it. Measure it. Move it."
- **Purpose**: Reinforces action-oriented mission and brand identity across all touchpoints
- **Frontend Implementation**:
  - Dashboard page (`/dashboard`): Italic subtitle below "Mind the Gap" heading with `data-testid="text-tagline"`
  - Badge Selector page (`/badges`, `/`, `/badge`): Italic subtitle below "Mind the Gap" heading with `data-testid="text-tagline"`
- **Badge Assets**:
  - SVG/PNG Badges (500x120): Tagline rendered at y="32" with font-size 8px, italic styling, 75% opacity
  - Share Cards (1200x630): Tagline rendered at y="108" with font-size 16px, italic styling, 75% opacity
- **Styling Consistency**: All instances use italic font-style and lighter opacity (75%) for visual hierarchy
- **Routing Update**: Added `/badges` route to match user expectations (complements existing `/` and `/badge` routes)

### Mission Statement
- **Location**: Bottom of Dashboard and Badge Selector pages in dedicated card with light background
- **Content**: Three-paragraph mission statement ending with tagline in italic
- **Purpose**: Communicates core mission to make women's issues impossible to ignore through data visibility

### Data Attribution & Source Information
- **Badge Attribution**: "Source: World Bank" text added at bottom of all badges (SVG/PNG) in small 7px font with subtle opacity
- **Embed Code Enhancement**: Title attribute added with detailed source information: "{Statistic}: Global vs {Location} - Data from World Bank API, updates daily. Click to view Mind the Gap dashboard."
- **Link Behavior**: All embedded badges link to dashboard (`/dashboard`) for full statistics and context
- **Hover Information**: Title attribute provides source details on hover, enhancing transparency and credibility