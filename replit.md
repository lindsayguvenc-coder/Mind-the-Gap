# Mind the Gap - Gender Equality Statistics Dashboard

## Overview
Mind the Gap is a data visualization dashboard displaying real-time gender equality statistics from the World Bank API across five key metrics: gender pay gap, leadership representation, maternal mortality rate, contraceptive access, and workforce participation. It covers Global, United States, United Kingdom, Canada, and Mexico. Users can view interactive dashboards with historical trend charts, generate embeddable badges, export data in CSV/JSON, and share statistics on social media. The project aims to make women's issues impossible to ignore through data visibility, reinforcing this mission with the tagline "Mind it. Measure it. Move it."

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses **React with TypeScript** for type safety and component-based design, built with **Vite** for performance, and **Wouter** for lightweight routing. **Shadcn/ui** components, built on **Radix UI**, provide an accessible and customizable UI. Styling is managed with **Tailwind CSS**, using **Inter** for UI and **JetBrains Mono** for numerical data, with an HSL-based theme supporting light/dark mode and a Salmon accent color. **TanStack Query** handles data fetching with caching, while `useState` manages local UI state. **Recharts** is used for interactive historical trend line charts.

### Backend Architecture
The backend is an **Express.js** server running on **Node.js** (with `tsx` for development and `esbuild` for production). It exposes a **RESTful API** with endpoints for fetching statistics, trends, exporting data (CSV/JSON), generating SVG/PNG comparison badges, and social media share cards. Responses are JSON. An in-memory cache with a 24-hour expiration reduces calls to the World Bank API.

### Data Storage Solutions
**PostgreSQL** with **Drizzle ORM** is used, connecting to Neon serverless PostgreSQL. While primarily leveraging external APIs, Drizzle defines type-safe schema structures. `connect-pg-simple` manages PostgreSQL-backed sessions for persistence.

### Build and Deployment Architecture
The development environment uses Vite for HMR and an Express middleware. Production involves Vite building the React app to `dist/public` and esbuild bundling the server to `dist/index.js`, with Express serving static assets.

## External Dependencies

### Primary Data Source
- **World Bank API**: Base URL `https://api.worldbank.org/v2`, providing key gender equality indicators (e.g., female employment, maternal mortality) with JSON responses.

### UI Component Libraries
- **Google Fonts**: Inter (UI) and JetBrains Mono (data display) for typography.
- **Radix UI**: Accessible, unstyled components (Dialog, Dropdown, Select).
- **Lucide React**: Icon library.
- **Recharts**: Data visualization library for line charts.
- **class-variance-authority**: Type-safe variant management.
- **cmdk**: Command palette component.