# CLAUDE.md for Multi-Country CMS

## Build and Run Commands
- **Backend**: `cd backend && npm install && npm run dev`
- **Frontend**: `cd frontend && npm install && npm run dev`

## Code Style & Standards
- **Imports**: Preferred absolute imports (if configured) or relative.
- **Naming**: 
  - Components: PascalCase (e.g., `BlogCard.jsx`)
  - Utilities/Hooks: camelCase (e.g., `useCountry.js`)
  - Models: PascalCase (e.g., `Country.js`)
- **Structure**: 
  - Controllers handle business logic.
  - Models handle schemas.
  - Services handle 3rd party integrations (Email, SMS, Storage).
- **Error Handling**: Standard Express error handling middleware.

## Multi-Country Architecture
- Every content document must have a `countryId`.
- Dashboard features a global country switcher.
- APIs filter content based on `countryId` query param.

## UI Patterns
- **Colors**: Primary: Blue (`#0ea5e9`), Sidebar: Slate-900.
- **Layout**: Sidebar navigation + Topbar with Country Selector.
- **Forms**: Centralized form components with validation.
