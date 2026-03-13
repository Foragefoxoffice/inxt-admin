# Multi-Country CMS — Implementation Task Tracker
> Last Updated: 2026-03-13

## STATUS LEGEND
- [ ] TODO
- [~] IN PROGRESS
- [x] DONE
- [!] BLOCKED

---

## PART 1 — Backend Foundation
- [x] Fix server.js: activate DB connection + uncomment routes
- [x] Create .env from template
- [x] Create User model (auth, roles: admin/editor)
- [x] Create News model (title, slug, date, location, status, countryId)
- [x] Create Career model (title, department, description, countryId)
- [x] Create Applicant model (name, email, resume, jobId, countryId)
- [x] Create Newsletter model (email, status, countryId)
- [x] Create Media model (filename, url, size, type)
- [x] Auth middleware (JWT verify + role check)
- [x] Multer middleware (file uploads)
- [x] Utils: slugify, pagination helper, response formatter
- [x] Seed script: initial countries + admin user

## PART 2 — Backend API Routes & Controllers
- [x] Auth routes: POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
- [x] Countries routes: GET/POST/PUT/DELETE /api/countries
- [x] Blogs routes: GET/POST/PUT/DELETE /api/blogs (with ?countryId, ?search, ?page)
- [x] News routes: GET/POST/PUT/DELETE /api/news
- [x] Careers routes: GET/POST/PUT/DELETE /api/careers
- [x] Applicants routes: GET /api/applicants (view + filter)
- [x] Newsletter routes: GET /api/newsletter, PATCH status, GET /api/newsletter/export
- [x] Media routes: POST /api/media/upload, GET /api/media, DELETE /api/media/:id
- [x] Dashboard route: GET /api/dashboard/stats

## PART 3 — Frontend Foundation
- [x] Rewrite App.jsx: React Router v7 with protected routes
- [x] AuthContext: login/logout/session persistence
- [x] CountryContext: global activeCountryId + switcher
- [x] Redux store: slices for auth, country, ui
- [x] Axios API client (base URL + JWT interceptor)
- [x] MainLayout: Sidebar + Topbar + Country Selector wired up
- [x] ProtectedRoute component
- [x] Login page (JWT-based)

## PART 4 — Frontend Pages
- [x] Dashboard: stats cards + activity summary
- [x] Blog List: table with search + status filter
- [x] Blog Create/Edit: form with TipTap rich text editor
- [x] News List: table with search + status filter
- [x] News Create/Edit: form with date/location/rich text
- [x] Careers List: table with department filter
- [x] Careers Create/Edit: form with rich text description
- [x] Applicants: view-only table with resume link
- [x] Newsletter: subscriber table + status filter + CSV export
- [x] Media Library: upload + browse + select modal
- [x] Countries: manage countries (admin only)

## PART 5 — Design & Polish
- [x] Glassmorphism cards (glass-card utility class in Tailwind)
- [x] Framer Motion page transitions
- [x] lucide-react icons throughout
- [x] Responsive tables with pagination
- [x] Toast notifications (success/error feedback)
- [x] Loading skeletons
- [x] Empty state components

---

## ARCHITECTURE NOTES
- Every model has `countryId` reference to Country collection
- All GET list endpoints support: ?countryId=, ?search=, ?page=, ?limit=
- API response format: { success: true, data: [...], pagination: { total, page, pages } }
- JWT stored in localStorage, sent as Bearer token
- File uploads: POST /api/media/upload → returns URL path
- Roles: 'admin' (full access), 'editor' (content only, no countries/settings)
