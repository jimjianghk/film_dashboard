# Jim's 2026 Cinema Log

A single-page dashboard that visualizes a year of moviegoing in New York City. Built with vanilla HTML, CSS, and JavaScript, with no frameworks or charting libraries.

Data is sourced from a personal spreadsheet on Dropbox and synced automatically via GitHub Actions.

## Dashboard

The page loads `data.json`, an object with `films` (array of film objects with date, title, year, runtime, rating (1–10 or null), rewatch flag, format, price, venue, and series) and `membershipFees` (sum of column Q from the spreadsheet, added to total spending in the hero stats).

### Masthead

Red Economist-style masthead above an uppercase Economist Sans Headline title ("2026 in cinema"), tucked tight against an oversized light-weight Economist Sans Headline subtitle ("Jan 1–{end date} · New York City"). The end date follows the same data-day rule as the cumulative chart's marker line: today in New York if a film is logged today, otherwise yesterday.

### Stats row

Six summary cards: total screenings, days at the cinema (distinct screening dates over days elapsed, denominator counts the current New York date only if a film is logged today, matching the cumulative chart's marker-line rule; the slash between numerator and denominator is rendered at weight 900 and horizontally squeezed to 75% width), average rating (excluding unrated films), total runtime in hours, total spending (per-screening prices plus membership fees, marked with an asterisk that ties to the page footnotes), and unique NYC venues visited. Values are set in Economist Sans Headline (condensed display cut) with a thick black accent bar to the left of each stat. In a single row the cards size to content and gaps distribute evenly across the viewport (including a matching trailing gap after the last card); at narrower breakpoints the row wraps to three, then two, equal-width columns.

### Cumulative screenings

Full-width SVG line chart tracking the running total of screenings over the year. The line uses step-after style: flat between film days and sloped upward only across the day a screening was logged. The x-axis runs from January 1 through the end of the current month if the active chart date is on or before its midpoint, otherwise through the end of the following month; after the dashboard year has ended, the active chart date is capped at December 31. Month labels sit centered between consecutive month-start ticks, and the bottom axis line and ticks match the runtime histogram. The y-axis top rounds the running total up to the next multiple of the chosen tick step, where the step is the smallest multiple of 10 producing 4–6 intervals (multiples of 5 are allowed when the total is ≤ 30 films); labels are right-aligned with faint horizontal gridlines. A dashed vertical marker indicates the most recent "data day": today in New York if a screening has been logged today, otherwise yesterday. When the marker falls on yesterday, the line terminates flat at that point regardless of whether yesterday had any screenings.

A cursor trace reveals the cumulative count for any day from January 1 through the data day. A thin vertical line and a small accent-colored dot snap to the nearest day, and a single-line tooltip in the format-chart style shows the date and the screening count. On desktop the trace follows the mouse and disappears when the cursor leaves the chart. On touch, a press-and-drag traces; releasing leaves the tooltip in place until the user taps elsewhere. Hovering or tapping past the data-day marker is treated as outside the chart and hides the trace, but if a continuous touch drag crosses past the marker the tooltip clamps to the data day and persists, including after the finger lifts.

### Rating chart

Horizontal bar chart with star labels (half-star to five stars). Bars are color-coded across a 10-step palette running from deep red (1) through pastel salmon (5) to pastel blue (6) and deep navy (10), inspired by the Economist's political-spectrum gradient. An additional grey "Unrated" bar appears when applicable. Three filter toggles (All / New releases / Repertory) subset by production year, and a dedup toggle collapses rewatches to unique titles. Bar widths are anchored to the tallest bar across all films at the current dedup state, so switching between All / New / Rep doesn't rescale; only toggling dedup does. Bars animate between states on toggle.

### Production decade chart

Horizontal bar chart grouping films by the decade they were produced. Has its own dedup toggle; bars rescale to the tallest decade in the current view and animate between states.

### Screening format chart

Horizontal stacked bar chart with one row per base projection format (DCP / 35mm / 70mm / 16mm). Within each bar, segments are grouped by premium tier (IMAX, Dolby Cinema, AMC Prime, VistaVision) and ordered by count; 3D variants render as a diagonal-stripe overlay within their tier's segment. Bar widths are proportional to the largest base-format total, so the DCP row dominates and rarer formats read accurately at scale. Hovering any segment shows the subcategory name and count. A legend below the bars lists every premium tier present with its total, sorted by count.

### Runtime distribution

Vertical histogram with 5-minute bins. Has its own dedup toggle; bin structure stays fixed across views while heights rescale to the tallest bin in the current view and animate between states. The chart always fills the available viewport width; once bars hit their min-width it becomes horizontally scrollable rather than dropping labels. Inter-bar gaps scale proportionally with bar width (~1/12 ratio) down to a 2px floor. A horizontal axis line runs beneath the bars with downward tick marks at every bin boundary. When an outlier bin is separated from the main mass by 5+ consecutive empty bins, those empty bins collapse into a gap sized at ~2× bar width. Three dots sit inline with the x-axis labels, the start of the elided range is labeled at the gap's left edge, and the axis line breaks into two segments (mass and outlier) each with a short extension past its endpoints.

### Screening venue chart

Two-column horizontal bar chart sorted by count. Hovering a venue code reveals the full cinema name via tooltip (e.g., METRO → Metrograph).

### Screening calendar

Monthly heatmap grid from January 1 through the current date in New York during the dashboard year, capped at December 31 once the year has ended. Rows cap at 4 months wide regardless of viewport, wrapping to fewer per row on narrower screens. Unlike the subtitle and cumulative chart, the calendar extends through today in New York during the active year regardless of whether a film has been logged, so the current day's tile is interactive even when empty. Two modes toggled by buttons:

- **Number of screenings**: tile color darkens with count across five discrete steps, from pale peach through red to deep crimson for 1–5+ films.
- **Average rating**: tile color interpolates translucently across the same rating palette as the bar chart. Days with only unrated screenings are grey.

Hovering a tile with screenings shows a tooltip with film titles and color-coded rating badges. Hovering an empty past tile shows "No screenings"; today's tile (when no film is logged yet) shows "Awaiting data" instead.

### Series list

All named screening series ranked by count. Each row shows the series name followed by inline venue badges (ordered by frequency) and the film count. Collapsed to 5 rows by default with an expand toggle.

### Complete log table

Sortable, filterable table of every screening. Nine columns: date, title, year, runtime, rating, format, price, venue, and series. Features:

- Click any header to sort (ascending/descending). Null ratings always sort to the bottom.
- Dropdown filters on date (by month), year (by decade), rating (1–10 plus N/A), format, venue, and series.
- Free-text search on title with IME composition support for CJK input.
- Rating badges are color-coded circles matching the bar chart palette, with text colors picked from within the same palette family for legible contrast. Unrated films show a grey badge with a horizontally narrowed em dash.
- The Price column header carries a dagger that ties to the page footnotes (per-row prices exclude membership fees).

### Page footnotes

A row of small notes between the log table and the footer carries the asterisk and dagger callouts referenced from the hero "Total spending" stat and the table's Price column header. Both notes sit inline, separated by a 25px gap.

## Design

- Cream paper background styled after *The Economist*
- Economist Sans throughout (with Economist Sans Headline for the page title and hero stat values), signature red masthead, black section rules, tabular figures
- Rating tiles blend translucently with the paper-cream background
- Fade-up entrance animations with staggered delays
- Responsive at 1200 / 1000 / 900 / 800 / 600 / 500px breakpoints

## Data pipeline

A GitHub Actions workflow (`.github/workflows/update-data.yml`) runs every 20 minutes, triggered externally by cron-job.org via `workflow_dispatch` (GitHub's own scheduled triggers drift by 5 to 30 minutes on free-tier repos):

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
