# Mind the Gap - Gender Equality Statistics Dashboard

## Overview

Mind the Gap is a data visualization dashboard application that displays real-time gender equality statistics from the World Bank API. The application presents five key metrics: gender pay gap, leadership representation, maternal mortality rate, contraceptive access, and workforce participation across multiple countries (Global, US, UK, Canada). Users can view statistics either as a comprehensive dashboard or generate embeddable badges for individual metrics.

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
  - `/api/stats/:location` - Fetch all statistics for a specific location
  - `/api/stats/:location/:statType` - Fetch specific statistic for a location
- **Response Format**: JSON with structured statistics schema (value, detail, year, source)

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
- **Radix UI**: Complete suite of accessible, unstyled components
- **Lucide React**: Icon library for data visualization icons (TrendingDown, Users, Heart, etc.)
- **class-variance-authority**: Type-safe variant management for components
- **cmdk**: Command palette component

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