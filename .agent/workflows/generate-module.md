---
description: Automatically generate a new CMS module (Backend & Frontend)
---

# Generate Module Workflow

Follow these steps to generate a new module (e.g., `Events`, `Portfolio`, `Services`).

## 1. Backend Model
Create a new file in `backend/models/[ModuleName].js` using this template:
```javascript
const mongoose = require('mongoose');
const [ModuleName]Schema = new mongoose.Schema({
  // Specific fields for [ModuleName]
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('[ModuleName]', [ModuleName]Schema);
```

## 2. Backend Controller
Create `backend/controllers/[moduleName]Controller.js` with basic CRUD:
- Use `req.query.countryId` for filtering the list.
- Ensure all creation routes assign `countryId`.

## 3. Backend Routes
Register the routes in `backend/routes/[moduleName]Routes.js` and import into `server.js`.

## 4. Frontend Page
Create `frontend/src/pages/[ModuleName]List.jsx`:
- Use the `NewsCard` or a general `Table` component.
- Ensure the `countryId` is passed from the global `CountryContext`.

## 5. Sidebar Link
Add the new module to the `Sidebar.jsx` menu items.
