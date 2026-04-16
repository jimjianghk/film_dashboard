# Jim's 2026 Cinema Log

A single-page dashboard that visualizes a year of moviegoing in New York City. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no charting libraries.

Data is sourced from a personal spreadsheet on Dropbox and synced automatically via GitHub Actions.

## Dashboard

The page loads `data.json` — an array of film objects with date, title, year, runtime, rating (1–10 or null), rewatch flag, format, price, venue, and series.

### Stats row

Six summary cards: total screenings, average rating (excluding unrated films), total runtime in hours, total spent, unique venues visited, and rewatch count.

### Rating chart

Horizontal bar chart with star labels (half-star to five stars). Bars are color-coded red-to-green. An additional grey "Unrated" bar appears when applicable. Three filter toggles (All / New Releases / Repertory) subset by production year, and a dedup toggle collapses rewatches to unique titles. Bar widths are anchored to the global max so the scale stays stable across filters.

### Production decade chart

Horizontal bar chart grouping films by the decade they were produced. Has its own dedup toggle.

### Screening format chart

Bubble chart sized by log-scaled count. Shows format name, count, and percentage.

### Runtime distribution

Vertical histogram with 5-minute bins. Has its own dedup toggle. Alternate x-axis labels are hidden on narrow screens.

### Screening venue chart

Two-column horizontal bar chart sorted by count. Hovering a venue code reveals the full cinema name via tooltip (e.g., METRO → Metrograph).

### Screening calendar

Monthly heatmap grid from January 1 through the current date. Two modes toggled by buttons:

- **Number of screenings** — tile opacity increases with count (30% / 55% / 80% / 100% for 1–4+ films).
- **Average rating** — tile color interpolates across the red-to-green rating scale. Days with only unrated screenings are grey.

Hovering a tile shows a tooltip with film titles and color-coded rating badges.

### Series list

All named screening series ranked by count. Each row shows the series name, venues (ordered by frequency), and film count. Collapsed to 5 rows by default with an expand toggle.

### Complete log table

Sortable, filterable table of every screening. Nine columns: date, title, year, runtime, rating, format, price, venue, and series. Features:

- Click any header to sort (ascending/descending). Null ratings always sort to the bottom.
- Dropdown filters on date (by month), year (by decade), rating (1–10 plus N/A), format, venue, and series.
- Free-text search on title with IME composition support for CJK input.
- Rating badges are color-coded to match the bar chart. Unrated films show a grey dash.

## Design

- Dark theme with gold (#d4a44c) accent
- Film-grain SVG noise overlay at low opacity
- Four fonts: Playfair Display (headings/values), DM Sans (body), JetBrains Mono (labels/data), Noto Serif SC (CJK fallback)
- Fade-up entrance animations with staggered delays
- Responsive at 1200 / 1000 / 800 / 500px breakpoints

## Data pipeline

A GitHub Actions workflow (`.github/workflows/update-data.yml`) runs hourly:

1. Downloads `Cinema.xlsx` from Dropbox using OAuth2 refresh token flow
2. Parses the spreadsheet's sheet `"26"` with the `xlsx` library
3. Transforms rows into JSON (Excel serial dates → ISO dates, column mapping)
4. Commits `data.json` if it changed

### Secrets required

| Secret | Purpose |
|---|---|
| `DROPBOX_APP_KEY` | Dropbox OAuth2 app key |
| `DROPBOX_APP_SECRET` | Dropbox OAuth2 app secret |
| `DROPBOX_REFRESH_TOKEN` | Long-lived refresh token (offline access) |

These are stored as repository secrets in GitHub.

### Running locally

```bash
export DROPBOX_APP_KEY=...
export DROPBOX_APP_SECRET=...
export DROPBOX_REFRESH_TOKEN=...
node scripts/fetch-and-parse.mjs
```

To preview the dashboard, serve the repo root with any static server:

```bash
python3 -m http.server 8000
```
