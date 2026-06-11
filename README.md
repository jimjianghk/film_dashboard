# Jim's 2026 Cinema Log

A single-page dashboard that visualizes a year of filmgoing in New York City. Built with vanilla HTML, CSS, and JavaScript, with no frameworks or charting libraries.

Data is sourced from a personal spreadsheet on Dropbox and synced automatically via GitHub Actions.

## Dashboard

The default page loads `data.json`, an object with `films` (array of film objects with date, title, year, runtime, rating (1–10 or null), rewatch flag, format, price, venue, and series) and `membershipFees` (sum of column Q from the spreadsheet, added to total spending in the hero stats). Archive views use the same `index.html` route with a year query and load frozen year-specific snapshots using the same JSON shape; for example, `?2025` loads `data-2025.json`.

### Archive views

Past years are data archives, not design archives: all years use the current `index.html` renderer. A year menu in the top-right corner links between every available year. The dashboard year is inferred from the first film date in the loaded data, so archive views keep the same chart, calendar, stats, and New releases / Repertory logic while capping time-based chart, calendar, and stat views at December 31 of the archived year.

### Masthead

Red *The Economist*-style masthead above an uppercase Headline font title ("2026 in cinema"), tucked tight against an oversized light-weight Headline font subtitle ("{first screening date}–{end date} · New York City"). Current-year end dates follow the same data-day rule as the cumulative chart's marker line: today in New York if a film is logged today, otherwise yesterday. Archive end dates use the last screening date in the archive.

### Stats row

Six summary cards: total screenings, days at the cinema (distinct screening dates over days elapsed, denominator counts the current New York date only if a film is logged today, matching the cumulative chart's marker-line rule; the slash between numerator and denominator is rendered at weight 900 and horizontally squeezed to 75% width), average rating (excluding unrated films; rewatches collapse to unique titles before averaging, matching the rating chart's dedup logic), total runtime in hours, total spending (per-screening prices plus membership fees, marked with an asterisk that ties to the page footnotes), and unique NYC venues visited (excluding the `OTHER` catch-all). Values are set in sans Headline (condensed display cut) with a thick black accent bar to the left of each stat. When a previous-year archive exists, an off-by-default toggle below the cards reveals comparisons against the same point of the prior year and extends the black stat bars to the comparison line. The comparison text fades in and out, the bars animate between short and extended states, and wrapped stat rows plus following page content move to their new positions. Comparisons normalize Feb. 29 to Feb. 28; increases use signature red, while flat or lower values use the same gray as the stat label. The spending comparison includes membership fees, but prorates the previous year's membership fees evenly by day through the comparison date. In a single row the cards size to content and gaps distribute evenly across the viewport (including a matching trailing gap after the last card); at narrower breakpoints the row wraps to three, then two columns, with a slightly wider right column on narrow mobile screens to keep the days-at-cinema value on one line.

### Cumulative screenings

Full-width SVG line chart tracking the running total of screenings over the year. The line uses step-after style: flat between film days and sloped upward only across the day a screening was logged. The x-axis runs from January 1 through the end of the current month if the active chart date is on or before the month's two-thirds point, otherwise through the end of the following month; after the dashboard year has ended, the active chart date is capped at December 31. Month labels sit centered between consecutive month-start ticks, and the bottom axis line and ticks match the runtime histogram. On viewports 500px and narrower, when the axis spans 11 or more months, labels collapse to single letters (J, F, M, ...) to keep them legible. The y-axis top rounds the running total up to the next multiple of the chosen tick step, where the step is the smallest multiple of 10 producing 4–6 intervals (multiples of 5 are allowed when the total is ≤ 30 films); labels are right-aligned with faint horizontal gridlines. A dashed vertical marker indicates the most recent "data day": today in New York if a screening has been logged today, otherwise yesterday. When the marker falls on yesterday, the line terminates flat at that point regardless of whether yesterday had any screenings. If the chart extends through December 31, the marker is hidden.

A cursor trace reveals the cumulative count for any day from January 1 through the data day. A thin vertical line and a small accent-colored dot snap to the nearest day, and a single-line thin-border tooltip shows the date and the screening count. On desktop the trace follows the mouse and disappears when the cursor leaves the chart. On touch, a press-and-drag traces; releasing leaves the tooltip in place until the user taps elsewhere. Hovering or tapping past the data-day marker is treated as outside the chart and hides the trace, but if a continuous touch drag crosses past the marker the tooltip clamps to the data day and persists, including after the finger lifts.

### Rating chart

Horizontal bar chart with numeric 1-to-10 labels; the first row is labeled "1 out of 10" and the remaining rows use numbers only. Bars are color-coded across a 10-step palette running from deep red (1) through pastel salmon (5) to pastel blue (6) and deep navy (10), inspired by *The Economist's* political-spectrum gradient. An additional grey "Unrated" bar appears when applicable. Three text toggles (All / New releases / Repertory), with the active state shown by an underline and inactive states faded, subset by production year; a dedup switch collapses rewatches to unique titles. Bar widths are anchored to the tallest bar across all films at the current dedup state, so switching between All / New / Rep doesn't rescale; only toggling dedup does. Bars animate between states on toggle.

### Production decade chart

Horizontal bar chart grouping films by the decade they were produced. Has its own dedup toggle; bars rescale to the tallest decade in the current view and animate between states.

### Screening format chart

Horizontal stacked bar chart with one row per base projection format (DCP / 35mm / 70mm / 16mm). Within each bar, Standard segments render first, followed by premium tiers (IMAX, Dolby Cinema, AMC Prime, VistaVision) ordered by count; 3D variants render as a dark diagonal-stripe overlay within their tier's segment. Standard segments use the accent red, while premium colors are assigned by usage rank from the sequence `#efa489`, `#6290bf`, `#293f84`, `#7e7f71`: base formats are scanned from highest total to lowest, then premium tiers within each base are ranked by count, with Dolby before IMAX before Prime before VistaVision for ties. Segment and row widths use a shared chart-wide count scale, so the same count renders at the same width anywhere in the chart and larger counts are always wider than smaller counts. Counts with a natural width below 3px receive a phased visibility boost that fades out by 10 screenings; large segments absorb any overflow. Hovering any segment shows the subcategory name and count in a tooltip, led by a legend-style square swatch in the segment color; 3D swatches reuse the same diagonal stripe overlay as the chart segment. On touch devices, tapping or dragging along a bar updates the tooltip as the finger crosses subcategories, and it remains visible until the user taps elsewhere. A legend below the bars lists every premium tier present with its total, sorted by count.

### Runtime distribution

Vertical histogram with 5-minute bins. Has its own dedup toggle; bin structure stays fixed across views while heights rescale to the tallest bin in the current view and animate between states. The chart always fills the available viewport width; once bars hit their min-width it becomes horizontally scrollable rather than dropping labels. Inter-bar gaps scale proportionally with bar width (~1/12 ratio) down to a 2px floor. A horizontal axis line runs beneath the bars with downward tick marks at every bin boundary. When an outlier bin is separated from the main mass by 4+ consecutive empty bins, those empty bins collapse into a gap sized at ~2× bar width. Three dots sit inline with the x-axis labels, the start of the elided range is labeled at the gap's left edge, and the axis line breaks into two segments (mass and outlier) each with a short extension past its endpoints.

### Screening venue chart

Two-column horizontal bar chart sorted by count, with a subtitle that says "Hover on label to see full venue name" on fine-pointer hover devices and "Tap on label to see full venue name" on touch-first devices. Hovering a venue code reveals the full cinema name via tooltip (e.g., METRO → Metrograph). In two-column layout, each column positions its axis from that column's longest label, while both columns share the same bar scale so equal counts render at equal widths. The `OTHER` catch-all maps to "Non-NYC or non-standard venues", always sorts last when present, and uses the same grey as the rating chart's Unrated bar.

### Screening calendar

Monthly heatmap grid from January 1 through the current date in New York during the dashboard year, capped at December 31 once the year has ended. Rows cap at 4 months wide regardless of viewport, wrapping to fewer per row on narrower screens. Unlike the subtitle and cumulative chart, the calendar extends through today in New York during the active year regardless of whether a film has been logged, so the current day's tile is interactive even when empty. Two text modes are toggled with an underline/faded inactive treatment and an animated legend:

- **Number of screenings**: tile color darkens with count across five discrete steps, from pale peach through red to deep crimson for 1–5+ films. The legend shows five adjacent blocks labeled from "1 screening" to "5 or more".
- **Average rating**: tile color interpolates at 75% opacity across the same rating palette as the bar chart, with a softened 5-to-6 bridge to keep midrange averages legible. Days with only unrated screenings are grey at the same 75% opacity. The legend shows a matching 75%-opacity continuous spectrum labeled from "Rated 1" to "Rated 10", plus a detached translucent grey key when unrated days are present.

Hovering a tile with screenings shows a tooltip with film titles and color-coded rating badges. Hovering an empty past tile shows "No screenings"; today's tile (when no film is logged yet) shows "Awaiting data" instead.

### Series list

All named screening series ranked by count. Each row shows the series name followed by inline venue badges (ordered by frequency) and the film count. Collapsed to 5 rows by default with an expand toggle.

### Complete log table

Sortable, filterable table of every screening. Nine columns: date, title, year, runtime, rating, format, price, venue, and series. Features:

- Click any header to sort (ascending/descending). Null ratings always sort to the bottom.
- A "Rewatches only" switch in the Title header filters the table to rewatches.
- Dropdown filters on date (by month), year (by decade), rating (1–10 plus N/A), format, venue, and series. Menus overhang their button by 4px per side while keeping option text aligned with the button text, open at natural width (the series menu caps at the table's right edge; viewport overflow clips rather than widening the page), and close when the page or table scrolls.
- Free-text search on title with IME composition support for CJK input.
- Rating badges are color-coded circles matching the bar chart palette, with text colors picked from within the same palette family for legible contrast. Unrated films show a grey badge with a horizontally narrowed em dash.
- The Format column header carries a dagger that ties to the page footnotes (DCP includes other digital), and the Price column header carries a double dagger (per-row prices exclude membership fees).

### Page footnotes

A row of small notes between the log table and the footer carries the asterisk, dagger, and double dagger callouts referenced from the hero "Total spending" stat, the Format column (and the format chart's DCP row), and the Price column header. The notes sit inline, separated by a 25px gap. An underlined "What counts as a screening?" link follows the callouts and opens the standalone definition page.

### Screening definition page

The `/definition` page explains the counting rules behind the screening totals. It keeps the shared masthead and "Go back" navigation, then switches to a white article-style page with a red sans pre-title, serif headline and body copy, a thin divider rule below the headline, a drop cap, and small-cap treatments for the opening words and short abbreviations.

### Sparse mode

When the year has fewer than 5 logged films, the masthead and stats row render as usual but the charts grid, every chart and table section, and the Format and Price column footnotes are hidden. In their place, a large sans font note reads "Visualizations will display when there are more film entries." so the page stays presentable early in the year.

## Design

- Cream paper background styled after *The Economist*
- Sans font throughout (with Headline for the page title and hero stat values), signature red masthead, black section rules, tabular figures
- Standalone definition page uses a white article-style layout with serif reading text, drop cap, small caps, and a thin grey headline divider
- Rating tiles blend translucently with the paper-cream background
- Liquid glass floating layer: chart tooltips, venue name tips, the log table's filter menus, the year menu panel, and the sticky log table header render as Apple-style translucent glass (warm white tint, backdrop blur and saturation, a masked 1px specular gradient ring, thin curved edge glints, soft warm-umber shadows; one-line tooltips are capsules)
- Chromium browsers add true edge refraction on top: each glass element gets a runtime-generated SVG displacement map (a signed-distance-field lens that keeps the center optically flat and bends the backdrop outward across a rim band), applied via `backdrop-filter: url()` with three slightly diverging passes recombined per color channel for a prismatic fringe; this tier is gated by engine detection because Safari and Firefox parse but silently ignore SVG filters in `backdrop-filter`
- Glass degrades gracefully: browsers without backdrop-filter keep the original flat solid design, and `prefers-reduced-transparency` or `prefers-contrast` restore solid, high-contrast surfaces
- Fade-up entrance animations with staggered delays
- Responsive at 1200 / 1000 / 900 / 800 / 600 / 500px breakpoints

## Data pipeline

A GitHub Actions workflow (`.github/workflows/update-data.yml`) runs every 10 minutes, triggered externally by cron-job.org via `workflow_dispatch` (GitHub's own scheduled triggers drift by 5 to 30 minutes on free-tier repos):

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
