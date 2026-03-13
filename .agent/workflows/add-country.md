---
description: Add a new country to the CMS system
---

# Add Country Workflow

To add a new country (e.g., UAE, Thailand):

## 1. Database Entry
Run a POST request to `/api/countries` or create a seed script:
```javascript
{
  "name": "Thailand",
  "code": "THA",
  "isActive": true
}
```

## 2. Admin UI
Ensure the `CountrySelector` component in the frontend is fetching the latest list from the backend `/api/countries` route.

## 3. Localization (Optional)
If adding a country with a different language, add its locale to the frontend localization service (if implemented).
