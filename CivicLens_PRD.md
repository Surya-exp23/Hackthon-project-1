# CivicLens — Product Requirements Document
### AI-Powered Civic Intelligence Platform
**Tagline:** See the problem. Understand the impact. Drive the change.
**Prepared for:** Hack Devengers 1.0 (single-day build)

---

## 1. Executive Summary

CivicLens converts unstructured citizen observations (a photo + a short description) into structured, prioritized, geo-located civic intelligence. Instead of a dumb complaint form, every report flows through an AI classification pipeline, a deterministic priority engine, a duplicate/clustering system, and a live city map, ending in a department-facing admin command center that tells officials exactly what needs attention right now.

The build target is a Next.js + Express + MongoDB Atlas application, deployable on Vercel, using Gemini or OpenAI for image/text analysis and Mapbox or Leaflet for geospatial visualization. The MVP is scoped so a 2–4 person team can ship a demoable, visually premium product within one hackathon day.

---

## 2. Problem Statement

Civic issues (potholes, garbage overflow, broken streetlights, leaks, open manholes, damaged sidewalks, blocked drains, traffic hazards) are common, but citizens don't know where to report them, how severe they are, whether someone already reported the same thing, or what happens after submission. Existing systems are just `Citizen → Complaint → Database`, with no intelligence layer. This produces duplicate, unprioritized, un-triaged complaint dumps that overwhelmed municipal staff can't act on effectively.

---

## 3. Product Vision

CivicLens should feel like Linear (issue tracking clarity) crossed with Google Maps (geographic intelligence) and a modern fintech dashboard (data seriousness) — never like a government portal, a basic form, or a chatbot demo. The product converts a photo into a structured civic-intelligence record: `Category → Severity → Priority → Department → Location → Community Impact → Resolution`.

---

## 4. Goals

- Turn a photo + short text into a structured, actionable civic issue in under 15 seconds of perceived AI processing time.
- Give admins a single prioritized queue answering "what needs attention right now."
- Visually demonstrate geographic and community impact intelligence, not just a list of complaints.
- Be demoable end-to-end (citizen submit → AI → map → admin triage → resolution) in a 2-minute live demo.

## 5. Non-Goals (Hackathon Scope)

- No real municipal integration / no real department APIs.
- No production-grade image similarity (embedding-based) — text/category/geo heuristics only.
- No real-time websocket sync required for MVP (polling/refetch is acceptable).
- No native mobile app — responsive web only.
- No multilingual support, gamification, or predictive analytics in MVP.

---

## 6. Target Users & Personas

### Persona A — Ananya, the Citizen (Primary)
22, college student, commutes daily by two-wheeler. Sees a pothole on her route. Wants a fast, low-friction way to report it and some confidence it will actually be looked at. Cares about speed, trust, and visible outcomes.

### Persona B — Rajesh, the Civic Admin Officer
38, municipal engineer overseeing hundreds of complaints across departments. Needs to instantly see what's critical, avoid duplicate work, assign the right department, and track resolution performance. Cares about signal over noise.

### Persona C — Vikram, the Field Worker
29, works for Public Works. Gets assigned issues, needs the location, photo, and severity at a glance, and a simple way to mark progress and upload proof of resolution.

---

## 7. User Journeys

**Citizen journey:** Land on homepage → Report an Issue → Upload photo → Watch AI analyze → Review/correct classification → Confirm location → See duplicate/community-impact context → Submit → See success state → Track status on dashboard → Get notified on resolution.

**Admin journey:** Log in → Land on Command Center with top metrics + priority queue → Click top critical issue → Review AI analysis + duplicates → Assign department → Change status → Monitor via Analytics tab.

**Field worker journey (simplified for MVP):** Log in → See assigned issues list → Open issue → Update status → Upload resolution photo → Mark resolved.

---

## 8. Information Architecture

```
/                          Landing page
/login, /register          Auth
/report                    Multi-step report flow
/dashboard                 Citizen dashboard
/explore                   City map (public)
/issues/:id                Issue detail page
/profile                   Citizen profile

/admin                     Admin command center (protected: admin)
/admin/issues               Full issue table/queue
/admin/issues/:id           Admin issue detail (assign/status/merge)
/admin/map                  Full-screen admin map
/admin/analytics            Analytics dashboard

/worker                    Field worker view (protected: department)
/worker/issues/:id          Assigned issue detail
```

---

## 9. Feature Requirements (Full Spec)

### 9.1 Authentication
Email/password registration and login with roles `citizen | admin | department`. Passwords hashed with bcrypt (cost 12). JWT stored in httpOnly secure cookie; `GET /api/auth/me` resolves session. Protected routes via middleware checking role.

### 9.2 Report Creation
Multi-step flow (see §13) producing a `reports` document with AI-derived fields, priority score, and geolocation.

### 9.3 AI Civic Analysis
Backend-only call to an AI provider that returns structured JSON: category, severity, confidence, summary, recommended department, risk factors (see §21 for schema/prompt).

### 9.4 Priority Engine
Deterministic scoring combining AI severity with location risk, community impact, duplicate count, and age (see §11 formula).

### 9.5 Duplicate Detection
Geo-radius + category match + text similarity heuristic surfaces likely duplicates at submission time and lets citizen/admin merge into an existing issue (see §12).

### 9.6 Community Impact Estimation
Derived metric combining report count, nearby POIs (schools/hospitals from a static/mock dataset or Mapbox POI search), and a simple daily-traffic estimate heuristic (see §13).

### 9.7 City Intelligence Map
Interactive map with color-coded severity markers, clustering, and category/status filters (see §14).

### 9.8 Admin Command Center
Top metrics, priority queue, department performance, resolution stats (see §15).

### 9.9 Issue Detail Page
Full record view for both citizens and admins with role-appropriate actions (see §16).

### 9.10 Notifications
In-app notification list (bell icon) generated on status changes; email is out of scope for MVP.

### 9.11 Status Timeline
`Reported → AI Verified → Assigned → In Progress → Resolved`, rendered as a stepped progress indicator on the issue detail page.

---

## 10. Detailed Screen Specifications

### 10.1 Landing Page
- **Hero:** Full-bleed section, near-black background, large kinetic-feeling headline "SEE THE PROBLEM. UNDERSTAND THE IMPACT. DRIVE THE CHANGE." in a bold sans-serif (Geist/Inter), subheading in muted gray, two CTAs: primary solid electric-blue "Report an Issue," secondary ghost "Explore City."
- **Hero visual:** Right or background layer showing an abstract dark map with 6–10 pulsing severity-colored dots and 2–3 floating glassmorphism-free issue cards (image thumbnail + category chip + priority number) that gently drift/parallax on mouse move. No stock photography.
- **Stats strip:** Animated counters — total issues logged, resolved this month, avg. resolution time, cities/wards covered (label clearly as demo data if seeded).
- **How it works:** 4-step horizontal sequence (Report → AI Analyzes → Prioritized → Resolved) with small line icons.
- **Feature highlights:** 3-column grid — AI Analysis, Duplicate Intelligence, Command Center — each with a short line of copy, no marketing fluff paragraphs.
- **Footer:** Minimal, links to Explore/Admin login/GitHub.

### 10.2 Report Issue Flow — see §13 (dedicated section).

### 10.3 Citizen Dashboard
- Greeting header: `Good morning, {name} 👋` + one-line contextual subtext.
- "My Reports" — horizontally scrollable / grid of report cards: thumbnail, category chip, status badge, priority number, relative date, location text.
- "Nearby Issues" — compact map or 3–4 card list of nearby open issues, "View all on map" link.
- "Your Impact" strip: e.g. "Your reports helped 12 issues get attention" — one clean stat, not a gamified badge wall.
- Empty state (no reports yet): illustration-free, text-first — "You haven't reported anything yet. See something? Report it." + CTA.

### 10.4 Explore / City Map (public)
- Full-width interactive map, filter chips along top (All / Critical / Roads / Waste / Water / Electricity / Open / In Progress / Resolved).
- Marker color = severity; clicking opens a slide-up (mobile) / side panel (desktop) issue preview card with a "View full report" link.
- Clustering at low zoom; declusters as user zooms in.

### 10.5 Issue Detail Page
- Header: `#CL-1042 · Pothole · HIGH PRIORITY` badge row.
- Large image (with graceful fallback if AI-failed / no image).
- AI Analysis card: category, severity, confidence %, department, AI summary paragraph, risk factors as chips.
- Priority card: large circular/radial score visual (e.g., 87/100) with a qualitative label (LOW IMPACT / MODERATE / HIGH IMPACT / CRITICAL).
- Location card: small embedded map + address text.
- Community Impact card: report count, estimated affected population, nearby schools/hospitals count.
- Status timeline (see §9.11).
- Activity feed: chronological list of `reportUpdates`.
- Similar/duplicate reports: small list of linked issues with distance + similarity %.
- Admin-only action bar (visible when role=admin): change status, assign department, merge duplicate, add note.

### 10.6 Admin Command Center
- Top metric row: Total Reports, Critical, Pending, Resolved (large numbers, animated count-up on load).
- Secondary metrics row: avg resolution time, resolution rate %, reports this week, highest-risk area, most common issue type.
- Priority Queue: ranked list, each row = category + short title, priority score, duplicate count, severity color tag, "Open" button.
- Department performance mini-table: department name, open count, avg resolution time.
- Tabs/side nav to Issues table, Map, Analytics.

### 10.7 Admin Issues Table
- Sortable/filterable table: ID, image thumb, category, severity, priority, status, department, reports (duplicate count), created date.
- Bulk-select not required for MVP; row click opens detail.

### 10.8 Analytics Page
- Charts: issues by category (bar), issues by status (donut), reports over time (line), resolution time trend (line). Use recharts.

### 10.9 Field Worker View (simplified)
- List of assigned issues (card list, no map required for MVP).
- Issue detail: image, location text, severity, status dropdown, note field, "mark resolved" button with optional resolution photo upload.

---

## 11. Priority Engine (Deterministic)

Do not rely solely on the AI's suggested priority — compute a transparent, explainable score server-side whenever a report is created, merged, or its duplicate count changes.

```
priorityScore (0–100) =
   clamp(
     SeverityWeight        (0–40)
   + CommunityImpactWeight (0–25)
   + LocationRiskWeight    (0–15)
   + DuplicateWeight       (0–15)
   + AgeWeight             (0–5)
   , 0, 100)
```

- **SeverityWeight** — map AI severity to a base score: critical=40, high=30, medium=18, low=8. Multiply by AI `confidence` (floor at 0.5 to avoid zeroing out low-confidence-but-real reports): `severity_base * max(confidence, 0.5)`.
- **CommunityImpactWeight** — `min(25, duplicateCount * 4 + nearbyPOIBoost)`, where `nearbyPOIBoost` = +6 if a school is within 200m, +6 if a hospital is within 200m, +3 if a major road is within 100m (capped contribution).
- **LocationRiskWeight** — category-based static risk table, e.g. Road Damage/Pothole=15, Traffic Hazard=15, Open Drainage=12, Water Leakage=10, Streetlight=8, Garbage/Waste=6, Sidewalk=6, Other=4.
- **DuplicateWeight** — `min(15, relatedReports.length * 3)`.
- **AgeWeight** — `min(5, daysUnresolved)` (older unresolved issues nudge upward so nothing silently rots).

Recompute on: report creation, new duplicate merge, and a scheduled/manual "recalculate aging" pass (can be a button in admin for demo purposes rather than a cron job).

Display: large radial/gauge component, numeric score + qualitative label: 0–39 LOW, 40–64 MODERATE, 65–84 HIGH IMPACT, 85–100 CRITICAL.

---

## 12. Duplicate Detection

At submission time (after AI classification, before final save), the backend runs a duplicate-check query:

1. **Geospatial filter:** MongoDB `$geoNear` / `$geoWithin` on `reports.location` within a configurable radius (default 150m).
2. **Category filter:** same `category` (or same `issueType`).
3. **Temporal filter:** created within the last 30 days (configurable) unless still open.
4. **Text similarity:** compare new `aiSummary`/`description` against candidates using a lightweight similarity score — for the hackathon, use either (a) a call to the AI provider asking it to return a 0–1 similarity score given both summaries, or (b) a fast local heuristic (token-overlap / cosine similarity on TF-IDF of the two short strings) to avoid extra API latency. Recommended: local heuristic first, AI-confirm only if score is borderline (0.4–0.7).
5. Combine into a single similarity % show to the user: `similarity = 0.4*geoScore + 0.3*categoryMatch + 0.3*textScore`.

If similarity ≥ 0.75 → show "Possible Duplicate" panel with the existing issue's ID, distance, similarity %, and current report count, and offer **Merge into this issue** vs **Report as new**. If merged: increment `relatedReports` array + report count on the parent issue, recompute its priority, and mark the new submission's `duplicateOf` field instead of creating a fully independent open issue.

---

## 13. Report Issue Experience (Step-by-Step)

**Step 1 — Capture:** "What did you find?" + large upload dropzone (drag/drop or file picker), camera capture on mobile. Client-side validation: JPEG/PNG/WebP only, max 8MB, min 300×300px. Immediate thumbnail preview.

**Step 2 — AI Processing (animated, sequential status lines, ~2–4s each, can be simulated client-side while the real request runs in parallel):**
```
Analyzing image...
Detecting civic issue...
Assessing severity...
Checking nearby reports...
Calculating priority...
```
Backend call sequence: upload image to storage → call `POST /api/reports/analyze` → run duplicate-check → return combined payload.

**Step 3 — Review AI Result:** Show category, severity, confidence, AI summary, recommended department as editable fields (dropdowns for category/severity so a citizen can correct misclassification — corrections are logged but do not currently retrain anything in MVP).

**Step 4 — Location:** Default to browser geolocation (`navigator.geolocation`), show pin on embedded map, allow manual drag-to-adjust or address search fallback (Mapbox Geocoding API). Reverse-geocode to a human-readable area name (e.g., "Sardarpura").

**Step 5 — Confirmation:** Summary card — category, severity, computed priority, location text, and (if any) the duplicate-match panel from §12. Submit button: "Submit Report."

**Success state:** Animated checkmark, report ID shown (`#CL-1042`), CTA "View your report" / "Report another."

**Failure states:**
- AI call fails/times out → "We couldn't analyze this image. You can still continue manually." + manual category/severity dropdowns, submission still succeeds with `confidence: null`, `aiSummary: null`.
- Image invalid → inline validation message, block progression to Step 2.
- Geolocation denied → fallback directly to manual map/search, no blocking error.

---

## 14. City Intelligence Map

- Library: Leaflet + OpenStreetMap tiles for hackathon speed/reliability and zero-cost API keys (Mapbox is a valid swap if a key is available and better clustering/styling is wanted — architecture should keep the map provider behind a thin `MapProvider` component so it's swappable).
- Marker color by severity: 🔴 Critical `#EF4444`, 🟠 High `#F97316`, 🟡 Medium `#EAB308`, 🟢 Low/Resolved `#22C55E`.
- Clustering via `leaflet.markercluster` (or Mapbox GL's built-in clustering if Mapbox is chosen).
- Filter bar: category chips + status chips, client-side filtering of the already-fetched `GET /api/map/issues` result set (avoid refetching per filter toggle for snappier feel).
- Marker click → popup/side-panel preview card (thumbnail, category, priority, "View Report" link) — never navigate away immediately, keep the map state.
- Mobile: map goes full-screen with a floating filter button and a bottom sheet for the selected issue.

---

## 15. Admin Command Center (Backend Support)

Metrics are computed via MongoDB aggregation pipelines against `reports`:
- Total/Critical/Pending/Resolved counts → `$group` by `status`/`severity`.
- Avg resolution time → average of `(resolvedAt - createdAt)` across resolved reports.
- Resolution rate → resolved / total.
- Reports this week → `createdAt >= startOfWeek`.
- Highest-risk area → group by a coarse geohash/ward field (or nearest-named-area string) ordered by summed priority.
- Most common issue → group by `category`, sort desc.
- Department performance → group by `recommendedDepartment`/`assignedDepartment` with open count and avg resolution time.

Priority Queue = `reports.find({status: {$ne: 'resolved'}}).sort({priorityScore: -1}).limit(10)`.

---

## 16. Issue Detail Page — Data & Actions

**Citizen view:** read-only, can mark "Still an issue" / "Looks resolved" (writes a `reportUpdates` entry, does not change canonical status directly — feeds an admin confirmation signal).

**Admin view actions:**
- Change status (`open → assigned → in_progress → resolved`), writes a `reportUpdates` entry + updates `reports.status`.
- Assign department, writes `assignedDepartment` + `reportUpdates` entry.
- Merge duplicate: pick another report ID, sets `duplicateOf`, moves its data into `relatedReports` of the canonical issue, recomputes priority.
- Add note (free text, becomes a `reportUpdates` entry with `type: 'note'`).

**Field worker view actions:** status update (`in_progress → resolved`), add progress note, upload resolution proof image (stored, linked as `resolutionImageUrl` on the report).

---

## 17. UI/UX Design System

### 17.1 Typography
Primary font: **Inter** or **Geist** (system-ui fallback). Headline weight 700–800, body weight 400–500. Strong size hierarchy: display 48–64px, H1 32–40px, H2 24px, H3 18–20px, body 15–16px, caption 12–13px.

### 17.2 Layout
Max content width ~1280px, generous section padding (80–120px vertical on landing, 24–32px in app shell). 8px spacing scale (4/8/12/16/24/32/48/64). Cards: `border-radius: 12–16px`, 1px subtle border (not heavy shadow-only cards), single consistent shadow token for elevation, not five different shadow strengths.

### 17.3 Design Tokens (example CSS variables)

```css
:root {
  --bg: #0B0D10;
  --surface: #14171C;
  --surface-2: #1B1F26;
  --border: #262B33;
  --text-primary: #F5F6F7;
  --text-secondary: #9AA1AC;
  --accent: #3B82F6;      /* electric blue */
  --accent-2: #7C6CF6;    /* subtle violet */
  --critical: #EF4444;
  --high: #F97316;
  --medium: #EAB308;
  --low: #22C55E;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-elevated: 0 8px 24px rgba(0,0,0,0.35);
  --font-sans: 'Inter', 'Geist', system-ui, sans-serif;
}

[data-theme="light"] {
  --bg: #FAFAFA;
  --surface: #FFFFFF;
  --surface-2: #F2F3F5;
  --border: #E5E7EB;
  --text-primary: #101317;
  --text-secondary: #5B6270;
  --shadow-elevated: 0 8px 24px rgba(15,15,20,0.08);
}
```

Status colors stay semantically fixed across both themes (critical=red, high=orange, medium=yellow, low/resolved=green) — only backgrounds/surfaces invert; do a proper token remap, not a CSS `invert()`.

### 17.4 Components
Use shadcn/ui as the base primitive layer (Button, Card, Dialog, Dropdown, Tabs, Toast, Skeleton, Badge) themed via the tokens above; avoid stock shadcn defaults with no customization.

---

## 18. Animation Guidelines (Framer Motion)

- **Page transitions:** 150–200ms fade + 8px slide-up, `ease-out`.
- **AI processing:** sequential text-line reveal (each line fades in ~600ms apart) with a subtle pulsing dot/ring, not a generic spinner.
- **Cards:** hover → `translateY(-2px)` + shadow bump, 120ms.
- **Statistics:** count-up animation on mount (0 → value over ~800ms, eased).
- **Map markers:** scale-in on appear (0.8 → 1, spring), smooth pan/zoom via the map library's native transitions.
- **Status timeline:** each completed step's connector line animates fill left-to-right on load.
- **Modals/dialogs:** spring entrance (`stiffness: 300, damping: 30`), scale 0.96 → 1 + fade.
- **Success state:** checkmark path draws in (SVG stroke-dashoffset animation) over ~500ms.

Explicitly avoid: bouncing icons, confetti/particles, animating more than 2–3 elements simultaneously on any screen, animation on every hover of every element.

---

## 19. Responsive Behavior

- **Desktop (1024px+):** sidebar navigation + main content area for dashboard/admin; map sits inline within its section.
- **Tablet (768px+):** sidebar collapses to icon rail or top tab bar; cards reflow to 2-column grids.
- **Mobile (375–414px):** bottom tab navigation replaces sidebar entirely; dashboard content stacks single-column; map becomes full-screen with floating controls; report flow steps become full-screen swappable panels instead of a wizard-in-a-card.

Citizen mobile nav: `Home · Explore · Report (elevated/center FAB style) · Reports · Profile`.
Admin mobile nav: `Overview · Issues · Map · Analytics · Profile`.

---

## 20. Frontend Architecture

- Next.js App Router, TypeScript, Tailwind CSS.
- Server Components by default for data-fetch-heavy pages (dashboard, admin overview, issue detail read view); Client Components only where interactivity is required (report flow wizard, map, charts, forms, theme toggle).
- Folder structure (`apps/web`):
```
app/
  (marketing)/page.tsx           landing
  (auth)/login/page.tsx
  (auth)/register/page.tsx
  (citizen)/dashboard/page.tsx
  (citizen)/report/page.tsx
  (citizen)/explore/page.tsx
  (citizen)/profile/page.tsx
  issues/[id]/page.tsx
  admin/page.tsx
  admin/issues/page.tsx
  admin/issues/[id]/page.tsx
  admin/map/page.tsx
  admin/analytics/page.tsx
  worker/page.tsx
  worker/issues/[id]/page.tsx
components/        shared UI (cards, badges, priority-gauge, status-timeline)
features/
  reports/         report-flow steps, hooks
  map/             map wrapper, marker, clustering
  admin/           queue, metrics, tables
hooks/             useAuth, useReports, useMap
lib/               apiClient.ts, fetcher.ts, formatters.ts
```
- Data fetching: a thin `apiClient` wrapping `fetch` against the Express API base URL, with typed responses shared via `packages/types`.

---

## 21. Backend Architecture

- Node.js + Express + TypeScript, deployed as Vercel Serverless Functions via a single catch-all handler (`api/index.ts` exporting the Express app; Vercel routes `/api/*` to it) — this avoids needing a separate always-on server.
- Folder structure (`apps/api`):
```
controllers/   auth, reports, ai, map, admin, notifications
routes/        mirrors controllers
models/        Mongoose schemas (User, Report, Department, ReportUpdate, Notification)
services/      aiService.ts, priorityService.ts, duplicateService.ts, storageService.ts, geoService.ts
middleware/    auth.ts (JWT verify), requireRole.ts, validate.ts, errorHandler.ts, upload.ts
utils/         asyncHandler.ts, logger.ts
```
- Frontend ↔ backend communication: Next.js calls the Express API over HTTPS at `${API_BASE_URL}/api/...`; auth uses an httpOnly cookie set by the API on the same top-level domain (or a bearer token in `Authorization` header stored in memory if cross-domain cookies are impractical during the hackathon — document whichever is chosen in the README).

---

## 22. API Specification

All authenticated endpoints require either the session cookie or `Authorization: Bearer <token>`. Error responses use `{ "error": { "code": string, "message": string } }`.

| Method | Endpoint | Purpose | Auth | Request Body | Response | Errors |
|---|---|---|---|---|---|---|
| POST | /api/auth/register | Create account | none | `{name,email,password,role?}` | `{user, token}` | 400 validation, 409 email exists |
| POST | /api/auth/login | Login | none | `{email,password}` | `{user, token}` | 401 invalid credentials |
| POST | /api/auth/logout | Clear session | citizen+ | — | `{success:true}` | — |
| GET | /api/auth/me | Current user | citizen+ | — | `{user}` | 401 unauthenticated |
| POST | /api/reports | Create report | citizen | `{imageUrl,description,location,category?,severity?}` | `{report}` | 400 validation |
| GET | /api/reports | List reports (filterable) | citizen+ | query: `status,category,severity,near,radius,page,limit` | `{reports[],total}` | 400 bad query |
| GET | /api/reports/:id | Report detail | citizen+ | — | `{report, updates[], related[]}` | 404 not found |
| PATCH | /api/reports/:id | Edit own report (pre-processing only) | owner | `{description?}` | `{report}` | 403 not owner, 404 |
| DELETE | /api/reports/:id | Delete own report | owner/admin | — | `{success:true}` | 403, 404 |
| POST | /api/reports/analyze | Run AI analysis on an uploaded image | citizen | `{imageUrl,description?}` | AI JSON schema (§23) | 502 AI failure (graceful) |
| POST | /api/reports/:id/duplicate-check | Recompute duplicate candidates | citizen/admin | `{}` | `{candidates:[{reportId,similarity,distanceMeters}]}` | 404 |
| POST | /api/reports/:id/merge | Merge into target issue | citizen/admin | `{targetReportId}` | `{report}` | 404, 409 already merged |
| GET | /api/map/issues | Map marker payload | public | query: `bbox?,status?,category?` | `{issues:[{id,lat,lng,severity,category,status}]}` | — |
| GET | /api/analytics | Aggregate metrics | admin | query: `range?` | `{totals,byCategory,byStatus,trend}` | 403 |
| GET | /api/notifications | List notifications | citizen+ | — | `{notifications[]}` | — |
| PATCH | /api/notifications/:id/read | Mark read | citizen+ | — | `{success:true}` | 404 |
| PATCH | /api/admin/reports/:id/status | Change status | admin/department | `{status,note?}` | `{report}` | 403, 404 |
| PATCH | /api/admin/reports/:id/assign | Assign department | admin | `{department}` | `{report}` | 403, 404 |
| POST | /api/upload | Upload image, returns URL | citizen+ | multipart form-data | `{url}` | 400 invalid file, 413 too large |

---

## 23. AI Architecture

`services/aiService.ts` is the single point of contact with the AI provider (Gemini or OpenAI) — the key is never exposed to the frontend; all calls happen server-side.

**Input:** image (base64 or public URL) + optional citizen description.

**Prompt intent (send as system/instruction message):**
> "You are a civic-issue classification system. Analyze the image (and description if provided) of a potential civic infrastructure problem. Respond ONLY with strict JSON matching the given schema — no prose, no markdown fences. Categories: road_damage, pothole, garbage_waste, streetlight, water_leakage, drainage, sidewalk, traffic_hazard, public_infrastructure, other. Severity: low, medium, high, critical. Provide a confidence between 0 and 1, a 1–2 sentence professional summary, a recommended department, and 2–4 short risk factors."

**Output schema:**
```json
{
  "category": "pothole",
  "issueType": "road_pothole",
  "severity": "high",
  "confidence": 0.92,
  "summary": "Large road-surface damage that may pose a safety risk to two-wheelers and traffic.",
  "recommendedDepartment": "public_works",
  "riskFactors": ["large road surface damage", "potential two-wheeler hazard"]
}
```

**Failure handling:** wrap the provider call with a timeout (~8s) and try/catch; on failure or malformed JSON (fails schema validation via zod), return `{ success: false }` to the frontend, which falls into the manual-classification fallback described in §13. Never let an AI failure block report submission.

**Provider abstraction:** `aiService.analyze(image, description)` internally dispatches to `providers/gemini.ts` or `providers/openai.ts` based on `AI_PROVIDER` env var, so swapping providers touches one file.

---

## 24. Image Processing / Storage

- Client-side: validate type/size before upload, show live preview, optional client-side compression (e.g., `browser-image-compression`) to keep uploads under ~2MB before sending.
- Storage: **Cloudinary** (simplest for a hackathon — free tier, direct unsigned/signed upload, automatic URL-based transformations, no bucket/IAM setup). Vercel Blob is an acceptable alternative if the team is fully committed to the Vercel ecosystem. Do not store binary image data in MongoDB — only store the resulting URL string.
- Upload flow: frontend requests a signed upload payload from `POST /api/upload` (or uploads directly to Cloudinary using an unsigned preset for hackathon speed) → gets back a URL → that URL is passed to `/api/reports/analyze` and later saved on the report.

---

## 25. Maps / Geospatial Architecture

- `reports.location` stored as GeoJSON `{ type: "Point", coordinates: [lng, lat] }` with a `2dsphere` index for `$geoNear`/`$geoWithin` queries (duplicate detection, "nearby issues", map bounding-box queries).
- `GET /api/map/issues` accepts an optional bounding box (`bbox=minLng,minLat,maxLng,maxLat`) for viewport-based loading; for MVP it's acceptable to just return all non-archived issues if data volume is small (seed data ~40–60 reports).
- Reverse geocoding for human-readable area names via Nominatim (OSM, free) or Mapbox Geocoding if Mapbox is chosen.

---

## 26. Authentication & Authorization

- Registration/login via email + password; bcrypt hash stored in `passwordHash`, never plaintext, never returned in API responses.
- JWT (short-lived access token, e.g. 7 days for hackathon simplicity) signed with `JWT_SECRET`, delivered as httpOnly `secure` `sameSite=lax` cookie in production.
- `middleware/auth.ts` verifies token and attaches `req.user`; `middleware/requireRole(['admin'])` guards admin/department-only routes.
- Frontend route protection: server-side check in layout/page (redirect to `/login` if no valid session) for `/dashboard`, `/admin/*`, `/worker/*`.

---

## 27. Admin System — see §15 and §16 (Command Center + Issue Detail actions).

---

## 28. Notification System

- On any `reportUpdates` write (status change, assignment, resolution), also insert a `notifications` document for the report's owning citizen: `{userId, title, message, type, read:false}`.
- `GET /api/notifications` returns the current user's notifications sorted by `createdAt desc`; unread count badge in the navbar bell icon.
- Email/push notifications are explicitly out of scope for MVP (documented as Future Scope).

---

## 29. Analytics

Aggregation endpoint `GET /api/analytics` returns:
```json
{
  "totals": {"total":248,"critical":42,"pending":31,"resolved":175},
  "byCategory": [{"category":"pothole","count":58}, ...],
  "byStatus": [{"status":"open","count":40}, ...],
  "trend": [{"date":"2026-08-01","count":6}, ...],
  "avgResolutionHours": 46.2,
  "resolutionRate": 0.71
}
```
Rendered via recharts: bar (by category), donut (by status), line (trend, resolution-time trend).

---

## 30. Error, Loading & Empty States

- **Loading (AI):** sequential text lines as in §13 Step 2, plus a subtle pulsing ring — never a bare spinner with no context.
- **AI failure:** "We couldn't analyze this image. You can still continue manually." + manual fields, submission unblocked.
- **Empty map/dashboard:** "No civic issues nearby. Looks good around here. 🌱"
- **API/network failure:** toast + inline retry button; never a blank white screen — always show the last-known state or a clear message.
- **Invalid image:** inline red helper text under the dropzone specifying the exact problem (format/size/dimensions).
- **404 (issue not found):** dedicated not-found state with a link back to Explore.
- **Skeleton loaders:** used for dashboard cards, issue table rows, and issue detail while data is in flight — never a full-page spinner for already-scaffolded layouts.

---

## 31. Security

- bcrypt password hashing (cost 12); JWT in httpOnly secure cookie; CSRF-acceptable because API is same-site or token-based.
- Input validation on every mutating endpoint via zod schemas in `middleware/validate.ts`.
- Rate limiting on `/api/auth/*` and `/api/reports/analyze` (e.g., `express-rate-limit`, ~20 req/min/IP) to protect the AI budget and prevent brute-force login.
- File upload validation: MIME-type allowlist, size cap, re-encode/strip metadata where practical.
- AI and storage API keys live only in server-side env vars, never `NEXT_PUBLIC_*`.
- CORS restricted to the deployed frontend origin.
- Mongoose schemas + parameterized queries prevent injection; never build queries via raw string concatenation.
- Sanitize/escape any user-supplied text rendered in the UI (React does this by default; avoid `dangerouslySetInnerHTML`).
- Admin/department routes double-guarded: middleware role check server-side + UI-level redirect client-side.

---

## 32. Performance

- Server Components for static/read-heavy pages to minimize client JS.
- `next/image` for all report images (automatic optimization, lazy loading).
- Map component lazy-loaded (`dynamic(() => import(...), { ssr:false })`) since it's a heavy client-only dependency.
- MongoDB indexes: `2dsphere` on `reports.location`, compound index on `{status:1, priorityScore:-1}` for the priority queue, index on `userId` for "my reports."
- Debounce/throttle map filter interactions; cache `GET /api/map/issues` response client-side for the session where reasonable.

---

## 33. Testing Strategy

- **Auth:** registration success/duplicate-email, login success/failure, unauthenticated access to protected routes blocked, role-restricted routes reject wrong roles.
- **Reports:** create with valid/invalid payloads, fetch list with filters, update by owner vs non-owner (403), delete permissions.
- **AI:** mocked successful analysis response validated against schema; malformed provider JSON handled gracefully; provider timeout triggers fallback path; missing image rejected before AI call.
- **Duplicate detection:** two reports within radius+category flagged as duplicate; reports outside radius/different category not flagged; merge action correctly updates both records and recomputed priority.
- **Map:** valid/invalid coordinate handling, bounding-box query returns only in-bounds issues, filters narrow results correctly.
- **Admin:** status change writes a `reportUpdates` entry and updates `report.status`; department assignment persists; merge action is idempotent (can't merge into an already-merged report).
- **Responsive:** manual pass at 375/768/1024/1440 breakpoints for landing, dashboard, report flow, admin, and map.

---

## 34. Deployment Architecture

```
User → Vercel (Next.js frontend + Express API as serverless functions)
      → MongoDB Atlas (cluster, 2dsphere index enabled)
      → AI Provider API (Gemini/OpenAI)
      → Cloudinary (image storage)
```

Express is exported as a single handler and deployed under `api/[[...slug]].ts` (Vercel catch-all) so all `/api/*` routes are served serverless without needing a separately hosted backend — this keeps the whole app on one Vercel project for a fast hackathon deploy.

### 34.1 Environment Variables

```
MONGODB_URI=
JWT_SECRET=
AI_PROVIDER=gemini            # or openai
AI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_MAP_TILE_URL=     # if using Leaflet/OSM, or NEXT_PUBLIC_MAPBOX_TOKEN if Mapbox
API_BASE_URL=                 # frontend → backend base URL
CORS_ORIGIN=
```
No server secret is ever prefixed `NEXT_PUBLIC_`; only genuinely public values (map tile URL, public Mapbox token if used) get that prefix.

### 34.2 Production Deployment Checklist
- [ ] MongoDB Atlas cluster created, IP allowlist set to `0.0.0.0/0` (hackathon) or Vercel's egress ranges, `2dsphere` index created on `reports.location`.
- [ ] All env vars set in Vercel project settings (not committed to git).
- [ ] Cloudinary unsigned upload preset configured (or signed flow wired through `/api/upload`).
- [ ] Seed script run against the Atlas cluster before demo.
- [ ] CORS origin matches the deployed domain.
- [ ] Admin demo account credentials documented (not committed with real secrets).

---

## 35. Seed / Demo Data

Ship a `scripts/seed.ts` that inserts:
- 3 demo users: 1 citizen, 1 admin, 1 department/field worker.
- 40–60 realistic reports spread across categories (potholes, garbage overflow, broken streetlights, water leakage, open manholes, damaged sidewalks) with varied severities/statuses/timestamps, clustered around a handful of real-looking coordinate hotspots so the map and "duplicate" features look alive immediately.
- A few intentionally near-duplicate reports (same category, <100m apart) so the duplicate-detection demo works reliably without relying on live judge input.
- Pre-populated `reportUpdates` and `notifications` so the timeline/activity feed isn't empty on first look.

The dashboard and map must look populated the moment the app is opened — never depend on judges creating data live.

---

## 36. MVP Scope (Hackathon Priority Order)

**Must Have:** Landing page, auth, citizen dashboard, report flow, image upload, AI analysis, severity, department recommendation, priority score, MongoDB persistence, interactive map, issue detail page, admin dashboard, status management, responsive design, Vercel deployment.

**Should Have:** Duplicate detection, community impact, notifications, analytics, department assignment, resolution proof upload.

**Nice to Have (cut first if time runs short):** Advanced image-embedding similarity, real-time websocket updates, sophisticated geospatial analytics, predictive AI, gamification, multilingual support.

If time is constrained, protect the Must Have list at all costs — cut Should Have items before touching it, and never start Nice to Have work until Must Have is fully demo-ready.

## 37. Future Scope (Post-Hackathon)

- Real municipal department integrations / ticketing system webhooks.
- Push/email/SMS notifications.
- Embedding-based image similarity for stronger duplicate detection.
- Predictive maintenance (forecasting where issues are likely to recur).
- Public transparency dashboard per ward/constituency.
- Multilingual citizen-facing UI.
- Native mobile app with camera-first reporting.

---

## 38. Demo Flow (2 Minutes)

1. Open with: *"Imagine you're on your way to college and you find a dangerous pothole."*
2. Open CivicLens, click **Report an Issue**.
3. Upload a pothole photo.
4. Show the animated AI processing sequence.
5. Reveal category, severity, confidence.
6. Reveal the computed priority score.
7. Show the "Possible Duplicate" panel with nearby reports.
8. Show the Community Impact numbers (affected population, nearby school/hospital).
9. Submit the report → success state with report ID.
10. Open the City Intelligence Map, show the new marker among existing ones.
11. Switch to the Admin Command Center — show the issue now in the Priority Queue.
12. Assign it to Public Works, change status to "In Progress."
13. Open the issue detail page, show the status timeline updating.
14. Close with: *"CivicLens doesn't just collect complaints. It converts citizen observations into actionable civic intelligence."*

---

## 39. Hackathon Pitch — Judging Differentiators

1. **Real-world impact** — addresses an obvious, universal civic problem, not a contrived hackathon idea.
2. **AI with purpose** — AI performs classification and decision support, not a superficial chatbot bolted onto a form.
3. **Geospatial intelligence** — issues are visible spatially, not buried in a table.
4. **Community intelligence** — independent reports from different citizens converge into one tracked issue.
5. **Actionability** — every report is routed to a department and ranked, not just archived.
6. **Product-grade experience** — the interface reads as a funded startup's shipped product, not a weekend prototype.

---

## 40. Success Metrics (Demo/Judging Proxies)

- Time from photo upload to structured AI result shown: < 5s perceived.
- Priority queue correctly surfaces the highest-severity/most-duplicated issue at the top.
- Duplicate detection correctly flags at least one seeded near-duplicate pair live in the demo.
- Zero blank/broken states during the full demo path across desktop and mobile viewport.
- Map, dashboard, and admin panel all visibly populated on first load (seed data working).

---

## 41. Implementation Priority & Development Milestones (Single-Day Build)

**Hour 0–1:** Repo scaffold (monorepo), env setup, MongoDB Atlas connected, base auth (register/login/me), design tokens + Tailwind config wired.

**Hour 1–3:** Report model + `POST /api/reports`, image upload to Cloudinary, `aiService` with one provider wired and schema-validated, priority engine v1.

**Hour 3–5:** Report flow UI (all 5 steps + success state), citizen dashboard, issue detail page (citizen view).

**Hour 5–7:** Map (Leaflet + clustering + filters), duplicate detection service + UI panel, community impact calculation.

**Hour 7–9:** Admin command center (metrics + priority queue + issues table), status/assign/merge actions, admin issue detail actions.

**Hour 9–10:** Landing page polish, dark/light theme, animations pass (Framer Motion), responsive pass across breakpoints.

**Hour 10–11:** Seed script + run against Atlas, notifications, analytics page/charts.

**Hour 11–12:** Deploy to Vercel end-to-end, bug bash, demo rehearsal, README + env var documentation.

## 42. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI provider rate limits/latency during live demo | Cache/pre-warm a known demo image's AI response; always have the manual-fallback path tested and ready as a backup. |
| Map library integration eats too much time | Default to Leaflet + OSM (zero-key, well-documented) rather than Mapbox unless a team member has prior Mapbox experience. |
| Express-on-Vercel serverless quirks (cold starts, file size limits) | Test the deployed `/api/*` path early (hour 1–2), not at the end; keep the Express app stateless and lightweight. |
| Seed data looks fake/sparse | Write realistic, varied seed reports early so the whole team is developing against a populated app, not an empty one. |
| Scope creep into Nice-to-Have features | Lock the Must Have list (§36) and revisit only after it is fully working and deployed. |
| Duplicate/priority logic feels like a black box to judges | Always show the *why* — visible risk factors, visible formula components (duplicate count, community impact) — not just a bare number. |

---

*End of PRD — implementation-ready for an AI coding agent (Claude Code, Cursor, Antigravity, or similar) to build CivicLens end-to-end.*
