# Jim's Cinema Log

A single-page dashboard that visualizes a year of filmgoing in New York City. Built with vanilla HTML, CSS, and JavaScript, with no frameworks or charting libraries.

Data is sourced from a personal spreadsheet on Dropbox and synced by a manually dispatchable GitHub Actions workflow, with cron-job.org triggering the regular runs.

## Dashboard

The dashboard is driven by the film log and membership-fee total exported from the source spreadsheet. Year-specific data files are listed in generated `data/manifest.json` and `data/manifest.js` files; archive views load frozen snapshots for past years while keeping the current dashboard design, so the same stats, charts, filters, and New releases / Repertory logic remain available across years.

### Archive views

Past years are data archives, not design archives. A year menu in the top-right corner links between every year listed in the data manifest. The dashboard year is inferred from the loaded film data, so archive views keep current-year behavior while capping time-based chart, calendar, and stat views at December 31 of the archived year.

### Masthead

Red *The Economist*-style masthead above an uppercase Headline font title ("{year} in cinema"), tucked tight against an oversized light-weight Headline font subtitle ("{first screening date}–{end date} · New York City"). Current-year end dates follow the same data-day rule as the cumulative chart's marker line: today in New York if a film is logged today, otherwise yesterday. Archive end dates use the last screening date in the archive.

During June, a slim five-stripe pride accent in a softened rainbow palette extends from the right edge of the masthead without shrinking the logo. The accent is gated on the browser's real current month in New York time, independent of the dashboard year or its data. On page load the stripes drop into place one at a time, left to right, using the same easing as the page's entrance animations; the cascade is disabled for users who prefer reduced motion.

The masthead (pride stripes included) links back to the home page, i.e. the current-year dashboard at the top of the page with no chart fragment, from both the dashboard and the definition page.

### Stats row

Six summary cards cover total screenings, days at the cinema, average rating, total runtime, total spending, and unique NYC venues visited. Days at the cinema counts distinct screening dates against elapsed days using the same data-day rule as the cumulative chart. Average rating excludes unrated films and collapses rewatches to unique titles before averaging, matching the rating chart's dedup logic. Total spending combines per-screening prices (foreign tickets at their USD-converted value) with membership fees and ties to the page footnotes; unique venues exclude the `OTHER` catch-all. When a previous-year archive exists, an off-by-default toggle reveals same-date comparisons. Comparisons normalize Feb. 29 to Feb. 28; increases use signature red, flat or lower values use subdued gray, and spending comparisons prorate the previous year's membership fees through the comparison date. The row uses an editorial stat treatment and adapts from one line to wrapped layouts on smaller screens.

### Chart navigation

A floating liquid-glass pill, fixed top-center of the viewport, holds one short tab per section: Cumulative, Ratings, Decades, Formats, Runtimes, Venues, Calendar, Series, and Full log. It slides in once the first chart reaches the reading line (the upper third of the viewport), i.e. once the title and stats row have scrolled past, and slides away again above that point. The tab row scrolls horizontally when it overflows, with a hidden scrollbar and edge fades that only paint on a side that has more tabs offscreen.

While hidden, the pill flips to `visibility: hidden` after its slide-out so the idle backdrop filter costs nothing.

A scroll-spy lights the tab for the chart under the reading line: a chart takes over as soon as its top enters the upper third of the viewport and holds through the gap to the next one. The active tab renders as a red chip (the same treatment as the table filter menus' selected option) and auto-centers itself in the pill without fighting manual panning. When Rating and Production decade sit side by side on wide viewports they act as one stop: both tabs light together and clicking either scrolls to the shared row top; on stacked layouts geometry splits them back into separate stops automatically.

Clicking a tab smooth-scrolls the chart to rest just below the nav and records the section in the URL fragment without adding history entries. On refresh the page re-anchors to that fragment after the charts render, since the browser's own fragment scroll fires against the pre-render placeholder layout; the spy likewise holds the nav back until the dashboard has rendered (and re-runs on any layout change via a body ResizeObserver), so it never flashes a tab computed against placeholder geometry. The nav is inert and hidden from assistive tech while offscreen, respects reduced-motion and reduced-transparency preferences, and venue name tips share the cursor tooltips' z-order so every tooltip floats above the nav when they overlap.

### Cumulative screenings

Full-width line chart tracking the running total of screenings over the year. The line stays flat between film days and slopes upward only across the day a screening was logged. The x-axis starts at January 1 and extends a little past the latest data so the line isn't crammed against the right edge; after the dashboard year has ended it runs through December 31. Month labels sit centered between consecutive month-start ticks, and the bottom axis line and ticks match the runtime histogram. On narrow mobile screens, when the axis spans most of the year, month labels collapse to single letters (J, F, M, ...) to keep them legible. The y-axis rounds up to a clean tick value, with right-aligned labels and faint horizontal gridlines. A dashed vertical marker indicates the most recent "data day": today in New York if a screening has been logged today, otherwise yesterday. When the marker falls on yesterday, the line terminates flat at that point regardless of whether yesterday had any screenings. If the chart extends through December 31, the marker is hidden.

A cursor trace reveals the cumulative count for any day from January 1 through the data day. A thin vertical line and a small accent-colored dot snap to the nearest day, and a single-line thin-border tooltip shows the date and the screening count. On desktop the trace follows the mouse and disappears when the cursor leaves the chart. On touch, a press-and-drag traces; releasing leaves the tooltip in place until the user taps elsewhere. Hovering or tapping past the data-day marker is treated as outside the chart and hides the trace, but if a continuous touch drag crosses past the marker the tooltip clamps to the data day and persists, including after the finger lifts.

### Rating chart

Horizontal bar chart with numeric 1-to-10 labels; the first row is labeled "1 out of 10" and the remaining rows use numbers only. Bars are color-coded across a 10-step palette running from deep red (1) through pastel salmon (5) to pastel blue (6) and deep navy (10), inspired by *The Economist's* political-spectrum gradient. An additional grey "Unrated" bar appears when applicable. Three text toggles (All / New releases / Repertory), with the active state shown by an underline and inactive states faded, subset by production year; a dedup switch collapses rewatches to unique titles. A shorts program counts as a new release only when every production year it lists is the current or previous year; including even one older year sends it to Repertory. Bar widths are anchored to the tallest bar across all films at the current dedup state, so switching between All / New / Rep doesn't rescale; only toggling dedup does. Bars animate between states on toggle.

### Production decade chart

Horizontal bar chart grouping films by the decade they were produced. Has its own dedup toggle; bars rescale to the tallest decade in the current view and animate between states.

A shorts program whose production years all fall in one decade counts toward that decade. When its years span multiple decades it lands in a "Various" bar that sits below the decade bars, marked with a dagger that ties to a page footnote; the footnote reads singular or plural to match the bar's count.

### Screening format chart

Horizontal stacked bar chart with one row per base projection format (DCP / 35mm / 70mm / 16mm). Within each bar, Standard segments render first, followed by premium tiers ordered by count; 3D variants render as a diagonal-stripe overlay within their tier's segment. Premium colors are assigned by usage rank, with deterministic tie-breaking so colors stay consistent as the data changes. Segment and row widths use a shared chart-wide count scale, so the same count renders at the same width anywhere in the chart and larger counts are always wider than smaller counts. Very small segments receive a temporary visibility boost while larger segments absorb the adjustment. Hovering any segment shows the subcategory name and count in a tooltip with a matching swatch; 3D swatches reuse the same stripe treatment as the chart segment. On touch devices, tapping or dragging along a bar updates the tooltip as the finger crosses subcategories, and it remains visible until the user taps elsewhere. A legend below the bars lists every premium tier present with its total, sorted by count.

### Runtime distribution

Vertical histogram with 5-minute bins. Has its own dedup toggle; bin structure stays fixed across views while heights rescale to the tallest bin in the current view and animate between states. The chart fills the available viewport width until the bars need more room, then becomes horizontally scrollable rather than dropping labels. Bar spacing scales with the available room so the histogram stays readable across viewport sizes. A horizontal axis line runs beneath the bars with downward tick marks at every bin boundary. When an outlier bin is separated from the main mass by 4+ consecutive empty bins, those empty bins collapse into an elided gap. Three dots sit inline with the x-axis labels, the start of the elided range is labeled at the gap's left edge, and the axis line breaks into separate mass and outlier segments.

### Screening venue chart

Two-column horizontal bar chart sorted by count, with a subtitle that says "Hover on label to see full venue name" on fine-pointer hover devices and "Tap on label to see full venue name" on touch-first devices. Hovering a venue code reveals the full cinema name via tooltip (e.g., METRO → Metrograph). In two-column layout, each column positions its axis from that column's longest label, while both columns share the same bar scale so equal counts render at equal widths. The `OTHER` catch-all maps to "Non-NYC or non-standard venues", always sorts last when present, and uses the same grey as the rating chart's Unrated bar.

### Screening calendar

Monthly heatmap grid from January 1 through the current date in New York during the dashboard year, capped at December 31 once the year has ended. Rows cap at 4 months wide regardless of viewport, wrapping to fewer per row on narrower screens. Unlike the subtitle and cumulative chart, the calendar extends through today in New York during the active year regardless of whether a film has been logged, so the current day's tile is interactive even when empty. Three text modes are toggled with an underline/faded inactive treatment and an animated legend:

- **Number of screenings**: tile color darkens with count across five discrete steps, from pale peach through red to deep crimson for 1–5+ films. The legend shows five adjacent blocks labeled from "1 screening" to "5 or more".
- **Total runtime**: tile color follows the day's combined runtime across a continuous spectrum interpolated from the same five-step screenings palette. The scale is fixed so the color-to-runtime mapping stays consistent across years: 1 hour or shorter takes the lightest color and 7 hours or longer the darkest, with values outside that band clamped to the endpoints. The legend shows the matching continuous spectrum labeled from "1h or shorter" to "7h or longer".
- **Average rating**: tile color interpolates translucently across the same rating palette as the bar chart, with a softened 5-to-6 bridge to keep midrange averages legible. Days with only unrated screenings are grey at the same translucency. The legend shows a matching continuous spectrum at the same opacity, labeled from "Rated 1" to "Rated 10", plus a detached translucent grey key when unrated days are present.

Hovering a tile with screenings shows a tooltip with film titles and color-coded rating badges. Hovering an empty past tile shows "No screenings"; today's tile (when no film is logged yet) shows "Awaiting data" instead.

### Series list

All named screening series ranked by count. Each row shows the series name followed by inline venue badges (ordered by frequency) and the film count. Collapsed to 5 rows by default with an expand toggle.

### Complete log table

Sortable, filterable table of every screening. Nine columns: date, title, year, runtime, rating, format, price, venue, and series. Features:

- Click any header to sort (ascending/descending). Null ratings always sort to the bottom. Shorts programs sort by their oldest listed year when sorting oldest-first and by their newest when sorting newest-first.
- A shorts program's Year cell lists each production year on its own line, at the same line spacing as the Series column.
- A "Rewatches only" switch in the Title header filters the table to rewatches.
- Dropdown filters on date (by month), year (by decade), rating (1–10 plus N/A), format, venue, and series. A shorts program appears under every decade at least one of its production years belongs to. Menus align visually with their trigger, size to their options, avoid widening the page, and close when the page or table scrolls.
- Free-text search on title with IME composition support for CJK input.
- When the table overflows horizontally, edge fades and an opacity-rippling `>>>` cue indicate additional columns; clicking the cue advances the table to the right, and both fade away after the user scrolls horizontally past a small threshold.
- Rating badges are color-coded circles matching the bar chart palette, with text colors picked from within the same palette family for legible contrast. Unrated films show a grey badge with a horizontally narrowed em dash.
- The Format column header carries a dagger that ties to the page footnotes (DCP includes other digital), and the Price column header carries a double dagger (per-row prices exclude membership fees). When the decade chart shows a Various bar, the dagger belongs to its footnote instead, so these headers shift to a double dagger and a chapter sign.
- A screening paid in a foreign currency shows its original local price in the Price cell (e.g. CN¥50 or €14.50), while sorting on the column uses the USD-converted value so every row orders on one scale.

### Page footnotes

A row of small notes between the log table and the footer carries the asterisk, dagger, and double dagger callouts referenced from the hero "Total spending" stat, the Format column (and the format chart's DCP row), and the Price column header. When multi-decade shorts programs are present, a dagger note for the decade chart's Various bar slots in right after the asterisk, the DCP note moves to a double dagger, and the membership-fees exclusion moves to a chapter sign, with the matching column headers and DCP row label following suit. When the year includes foreign-currency tickets, the asterisk note extends to explain that non-USD prices are converted using market exchange rates. The notes sit inline, evenly spaced.

### Screening definition page

The `/definition` page explains the counting rules behind the screening totals. It is reached from a dotted-underline "What's a screening?" link (with a circular info icon) that sits beside the year-on-year comparison toggle below the stats row. The page keeps the shared masthead and "Go back" navigation, then switches to a white article-style page with a red sans pre-title, serif headline and body copy, a thin divider rule below the headline, a drop cap, and small-cap treatments for the opening words and short abbreviations. The counting rules are laid out as a numbered list, most items carrying an italic worked example (double features, standalone shorts, TV blocks, loop or installation visits), with a closing note on what does not count.

### Sparse mode

When the year has fewer than 5 logged films, the masthead and stats row render as usual but the charts grid, every chart and table section, and the Format and Price column footnotes are hidden. In their place, a large sans font note reads "Visualizations will display when there are more film entries." so the page stays presentable early in the year.

## Design

- Cream paper background styled after *The Economist*
- Sans font throughout (with Headline for the page title and hero stat values), signature red masthead, black section rules, tabular figures
- Standalone definition page uses a white article-style layout with serif reading text, drop cap, small caps, and a thin grey headline divider
- Rating tiles blend translucently with the paper-cream background
- Liquid glass floating layer: chart tooltips, venue name tips, the log table's filter menus, the year menu panel, the chart navigation pill, and the sticky log table header render as translucent glass with soft highlights, subtle depth, and capsule-style one-line tooltips
- Browsers without backdrop-filter support keep the flatter solid design
- Reduced-transparency and high-contrast preferences restore solid, high-contrast surfaces
- Fade-up entrance animations with staggered delays
- Responsive at 1200 / 1000 / 900 / 800 / 600 / 500px breakpoints

## Data

The film log is maintained in a personal spreadsheet and exported by a GitHub Actions workflow that can be run manually or triggered on a schedule from cron-job.org. Each sync checks the current year in New York time, looks for that two-digit spreadsheet sheet, and falls back to the previous year until the new sheet has at least one dated film row. The updater writes `data/data-<year>.json` directly and refreshes `data/manifest.json` plus `data/manifest.js`, so the previous year remains the archive as soon as the new year takes over. Membership fees are tracked separately from per-screening prices, then folded into the total-spending stat and year-over-year comparison logic.

A shorts program (one screening of several short films) is logged as a single row whose year cell lists every short's production year separated by commas (e.g. "2013, 2025, 2026"). The exported JSON carries that string through unchanged, and the dashboard parses the listed years wherever production years matter: the rating chart's New releases / Repertory split, the decade chart, and the log table's Year column, sorting, and decade filter.

A screening paid in a foreign currency is logged in the same price cell as an ISO currency code plus the local amount ("CNY50", "EUR14.50"; case-insensitive, optional space, no comma separators). The exporter converts it to USD at the screening date's ECB reference rate via the Frankfurter API, with weekend and holiday screenings using the most recent business day's rate. The exported film keeps `price` in USD (so totals, comparisons, and sorting stay in one currency) and adds `priceOriginal` and `currency` for the log table's local-price display. Fetched rates are cached in committed `data/fx-rates.json`, keyed by currency and date, so past conversions never drift across reruns and the sync survives API outages; a rate can be added there by hand if a currency falls outside ECB coverage. Because a date's fixing publishes around 16:00 CET that same day, a screening synced before its date has ended in Frankfurt (say a July 1 morning show in China) converts at the latest published rate without entering the cache, and a later sync re-fetches and locks in the date's own fixing. Any other text in a price cell fails the sync loudly rather than exporting a broken price.

## Deployment

The site is served by GitHub Pages at [jimsfilms.nyc](https://jimsfilms.nyc/), built from the `main` branch, so every push (including each data sync commit) deploys automatically.

A companion workflow, `retry-pages-deploy.yml`, watches the built-in Pages deployment and handles failures. When a deploy fails, it re-runs the failed job with escalating backoff (1, 10, then 30 minutes). Pages can occasionally wedge on a single commit and reject every re-run of it, so once the retries are exhausted the workflow pushes an empty "Redeploy Pages" commit to force a fresh deploy under a new SHA. If that commit also fails to deploy, the workflow stops and leaves a failed run in the Actions tab as the signal for manual attention. Before each retry it checks whether a newer commit has already deployed, so it never overwrites the site with stale content.
