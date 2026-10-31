# Jim's Cinema Log

A single-page dashboard that visualizes a year of filmgoing in New York City. Built with vanilla HTML, CSS, and JavaScript, with no frameworks or charting libraries.

Data is sourced from a personal spreadsheet on Dropbox and synced by a manually dispatchable GitHub Actions workflow, with cron-job.org triggering the regular runs.

## Dashboard

The dashboard is driven by the film log exported from the source spreadsheet. A generated manifest lists each year's data file; archive views load frozen snapshots for past years while keeping the current dashboard design, so the same stats, charts, filters, and logic remain available across years.

### Archive views

A year menu in the top-right corner links between every year listed in the data manifest. The dashboard year is inferred from the loaded film data, so archive views keep current-year behavior while capping time-based chart, calendar, and stat views at December 31 of the archived year.

### Masthead

Red *The Economist*-style masthead above an uppercase title ("{year} in cinema"), tucked tight against a light-weight font subtitle ("{first screening date}–{end date} · New York City"). Current year's end date uses the "end data day rule": today in New York if a film is logged today, otherwise yesterday. Archive end dates use the last screening date in the archive.

During June, a slim five-stripe pride accent in a softened rainbow palette extends from the right edge of the masthead. The accent is gated on the browser's real current month in New York time, independent of the dashboard year or its data. On page load the stripes drop into place one at a time, left to right; the cascade is disabled for users who prefer reduced motion.

The masthead links back to the home page, i.e. the current-year dashboard at the top of the page, from both the dashboard and the definition page.

### Stats row

Six summary cards cover total screenings, days at the cinema, average rating, total runtime, total spending, and unique NYC venues visited. Days at the cinema counts distinct screening dates against elapsed days using the same end data day rule. Average rating excludes unrated films and collapses rewatches to unique titles before averaging. Total spending combines per-screening prices (foreign tickets at their USD-converted value) with membership fees; unique venues exclude the `OTHER` catch-all. When a previous-year archive exists, an off-by-default toggle reveals same-date comparisons. Comparisons normalize Feb. 29 to Feb. 28; increases use signature red, flat or lower values use subdued gray. Spending comparisons include an annual membership payment from the previous year only once the comparison date reaches its payment date, while monthly subscription fees prorate through the comparison date. The row adapts from one line to wrapped layouts on smaller screens.

### Chart navigation

A floating liquid-glass pill, fixed top-center of the viewport with a matching red glass "J" badge to its left, holds one short tab per chart section. Pill and badge slide in once the charts reach the upper third of the viewport, i.e. once the title and stats row have scrolled past, and slide away again above that point. A scroll-spy lights the tab for the chart currently in view, and clicking a tab scrolls to its chart and records the section in the URL fragment, so refreshing or sharing the link returns to the same chart. Clicking the badge returns to the top of the page.

### Cumulative screenings

Full-width line chart tracking the running total of screenings over the year. The line stays flat between film days and slopes upward only across the day a screening was logged. The x-axis starts at January 1 and runs to the end of the current month, or of the next month in the last few days of the current one; after the dashboard year has ended it runs through December 31. Month labels sit centered between consecutive month-start ticks; on narrow mobile screens, when the axis spans most of the year, month labels collapse to single letters (J, F, M, ...) to keep them legible. The y-axis rounds up to a clean tick value, with right-aligned labels and faint horizontal gridlines. A dashed vertical marker indicates the end data day. If the chart extends through December 31, the marker is hidden.

On the current year's dashboard, an off-by-default "Show forecast" switch in the chart header extends the chart through December 31 and sketches how the year might finish. Every remaining day gets its own forecast. Each past year implies this year's count by that day two ways, the count so far scaled by how much that year grew between the same two dates, and the count so far plus whatever that year added between them; the forecast blends the average of each, weighted by its steadiness, so the curve follows the season's usual shape, and a salmon confidence area spans each day's 95% prediction interval, tightening as past years accumulate and the year fills in. The pool of past years reaches back to 2017, with 2020 and 2021 sitting out as covid-distorted (both still have their own archive views); 2017–2019 survive only as daily counts, so they inform the forecast without appearing as archive views. The forecast span is a grey band beneath a small "Forecast" label, and the y-axis rescales to make room; toggling animates the change, instantly for users who prefer reduced motion. The switch stays hidden until the end data day reaches March 1, before which too little of the season has been logged for either estimate to say much.

On the 2020 and 2021 archive views, a band in the forecast's grey shades the covid cinema closure, March 17, 2020 to March 4, 2021, under a "Covid-19 cinema closure" label.

A cursor trace reveals the cumulative count for any day from January 1 through the end data day: it snaps to the nearest day, and a tooltip shows the date and the screening count. On desktop the trace follows the mouse and disappears when the cursor leaves the chart. On touch, a press-and-drag traces; releasing leaves the tooltip in place until the user taps elsewhere. Hovering or tapping past the end data day marker is treated as outside the chart and hides the trace, but if a continuous touch drag crosses past the marker the tooltip clamps to the end data day and persists, including after the finger lifts. With the forecast on, the trace keeps working across the forecast span, where the tooltip shows the forecast screening count instead.

### Rating chart

Horizontal bar chart with numeric 1-to-10 labels. Bars are color-coded across a 10-step palette running from deep red (1) through pastel salmon (5) to pastel blue (6) and deep navy (10). An additional grey "Unrated" bar appears when applicable. Three text toggles (All / New releases / Repertory) subset by production year, with films from the current or previous year counted as new releases; a dedup switch collapses rewatches to unique titles. A shorts program counts as a new release only when every production year it lists is the current or previous year. Bar widths are anchored to the tallest bar across all films at the current dedup state, so switching between All / New / Rep doesn't rescale; only toggling dedup does. Bars animate between states on toggle.

### Production decade chart

Horizontal bar chart grouping films by the decade they were produced. Has its own dedup toggle; bars rescale to the tallest decade in the current view and animate between states.

A shorts program whose production years all fall in one decade counts toward that decade. When its years span multiple decades it lands in a "Various" bar that sits below the decade bars.

### Screening format chart

Horizontal stacked bar chart with one row per base projection format (DCP / 35mm / 70mm / 16mm). Within each bar, Standard segments render first, followed by premium tiers ordered by count; 3D variants render as a diagonal-stripe overlay within their tier's segment. Premium colors are assigned by usage rank, with ties broken consistently so colors don't shift as the data changes. Segment and row widths use a shared chart-wide count scale, so the same count renders at the same width anywhere in the chart and larger counts are always wider than smaller counts. Very small segments receive a temporary visibility boost while larger segments absorb the adjustment. Hovering any segment shows the subcategory name and count in a tooltip with a matching swatch. On touch devices, tapping or dragging along a bar updates the tooltip as the finger crosses subcategories, and it remains visible until the user taps elsewhere. A legend below the bars lists every premium tier present with its total, sorted by count.

### Runtime distribution

Vertical histogram with 5-minute bins. Has its own dedup toggle; bin structure stays fixed across views while heights rescale to the tallest bin in the current view and animate between states. The chart fills the available viewport width until the bars need more room, then becomes horizontally scrollable rather than dropping labels. Bar spacing scales with the available room so the histogram stays readable across viewport sizes. A horizontal axis line runs beneath the bars with downward tick marks at every bin boundary. When an outlier bin sits well apart from the main mass, the empty bins between them collapse into an elided gap: three dots sit inline with the x-axis labels and the axis line breaks into separate mass and outlier segments.

### Screening venue chart

Two-column horizontal bar chart sorted by count. Hovering a venue code reveals the full cinema name via tooltip. In two-column layout, each column positions its axis from that column's longest label, while both columns share the same bar scale so equal counts render at equal widths. The `OTHER` catch-all maps to "Non-NYC or non-standard venues", always sorts last when present, and uses the same grey as the rating chart's Unrated bar.

### Screening calendar

Monthly heatmap grid covering the whole dashboard year, January through December, with days after today in New York shown as faded outlines; phones leave out months that haven't started yet. Rows hold up to six months, wrapping to fewer per row on narrower screens. Hovering a tile with screenings shows a tooltip with film titles and color-coded rating badges (see the log table section below). Hovering an empty past tile shows "No screenings"; today's tile (when no film is logged yet) shows "Awaiting data" instead: unlike the subtitle and cumulative chart, the calendar treats today in New York as a live day whether or not a film has been logged, so the current day's tile is interactive even when empty. On the 2020 and 2021 views, days of the covid cinema closure are faintly hatched and show "Cinemas closed". Three text modes, each with its own legend:

- **Number of screenings**: tile color darkens with count across five discrete steps, from pale peach through red to deep crimson for 1–5+ films. The legend shows five adjacent blocks labeled from "1 screening" to "5 or more".
- **Total runtime**: tile color follows the day's combined runtime on a fixed scale, so the color-to-runtime mapping stays consistent across years. Days of 1.5 hours or shorter take the palest color and days of 6 hours or longer the darkest; in between, the color shades continuously, darkening fastest through the shorter runtimes where most days fall and leveling off toward 6 hours. The legend shows the full color range as a continuous spectrum, labeled from "1.5h or shorter" to "6h or longer".
- **Average rating**: tile color interpolates translucently across the same rating palette as the bar chart, with a softened 5-to-6 bridge to keep midrange averages legible. Days with only unrated screenings are grey at the same translucency. The legend shows a matching continuous spectrum at the same opacity, labeled from "Rated 1" to "Rated 10", plus a detached translucent grey key when unrated days are present.

### Festivals and series table

Every named festival or series in a sortable table with five columns: series name, venue (each venue the series played at, most frequent first), month (the months it screened in, with consecutive months shown as a range), number of screenings, and average rating. The average covers only rated screenings and appears in the same circular badge as the log: a whole number when it lands on one, otherwise to one decimal in a slightly smaller type, with the badge color following the same continuous rating scale as the calendar's average-rating view. A series with no rated screening shows the grey unrated badge instead. Rows sort by screening count, highest first, by default, with ties in the order the series first appeared during the year. Clicking a header sorts by that column; unrated series always sort last on rating, and names order ignoring leading articles as titles do in the log table. Sorting by venue splits a series that played more than one venue into a row per venue, each showing that venue's own months, its screenings as a share of the series total ("23 (out of 24)"), and the average of its own screenings. The table scrolls within a viewport, and has the same horizontal overflow behavior as the log table (see below).

### Complete log table

Sortable, filterable table of every screening. Nine columns: date, title, year, runtime, rating, format, price, venue, and series. Features:

- Click any header to sort (ascending/descending). Null ratings always sort to the bottom. Shorts programs sort by their oldest listed year when sorting oldest-first and by their newest when sorting newest-first. Sorting by title or series ignores a leading English, French, Italian, or Spanish article (the, a, an, le, la, les, l', un, el, los), so *The Godfather* files under G and *L'avventura* under A; the series filter menu orders its options the same way.
- A shorts program's Year cell lists each production year on its own line.
- A "Rewatches only" switch in the Title header filters the table to rewatches.
- Chinese-language films are logged bilingually, with an English title in gray after the original title in Chinese, an en space apart, wrapping as if the pair were one title; sorting by title places these rows by their English titles.
- Dropdown filters on date (by month), year (by decade), rating (1–10 plus N/A), format, venue, and series. A shorts program appears under every decade at least one of its production years belongs to.
- Free-text search on title that works with CJK input methods and finds a bilingually logged film by either title.
- When the table overflows horizontally, a `>>>` cue marks more columns; clicking it scrolls right.
- Rating badges are color-coded circles matching the bar chart palette. Unrated films show a grey badge.
- A screening paid in a foreign currency shows its original local price in the Price cell (e.g. CN¥50 or €14.50), while sorting on the column uses the USD-converted value so every row orders on one scale.

### Page footnotes

A row of small notes between the log table and the footer carries the symbol callouts referenced from the hero "Total spending" stat, the forecast switch on the cumulative chart, the decade chart's Various bar, the Format column (and the format chart's DCP row), and the Price column header. Symbols run in a fixed sequence (asterisk, dagger, double dagger, chapter sign, then those same four doubled) assigned in page order to whichever notes are present: the forecast note, stating the counting basis of the estimates and the band's 95% meaning, appears only while its switch does, and the Various note only when multi-decade shorts programs exist, with the remaining symbols shifting to close the gaps and every marker following suit. When the year includes foreign-currency tickets, the asterisk note extends to explain that non-USD prices are converted using market exchange rates.

### Screening definition page

The `/definition` page explains the counting rules behind the screening totals. It is reached from a "What's a screening?" link that sits beside the year-on-year comparison toggle below the stats row. The page keeps the shared masthead and "Go back" navigation, then switches to a white article-style page.

### Sparse mode

When the year has fewer than 5 logged films, the masthead and stats row render as usual but the charts grid, every chart and table section, and the Format and Price column footnotes are hidden. In their place, a short note says the charts will appear once more films are logged, so the page stays presentable early in the year.

## Design

- Cream paper background styled after *The Economist*
- Sans font throughout (with Headline for the page title and hero stat values), signature red masthead, black section rules, tabular figures
- Standalone definition page uses a white article-style layout with serif reading text, drop cap, small caps, and a thin grey headline divider
- Rating tiles blend translucently with the paper-cream background
- Liquid glass floating layer: chart tooltips, venue name tips, the log table's filter menus, the year menu panel, the chart navigation pill, and the log and series table headers render as translucent glass with soft highlights, subtle depth, and capsule-style one-line tooltips
- Browsers that can't render the glass effect keep the flatter solid design
- Reduced-transparency and high-contrast preferences restore solid, high-contrast surfaces
- Fade-up entrance animations with staggered delays
- Responsive layouts step down from wide desktop to small phone widths

## Data

The film log is maintained in a personal spreadsheet, one sheet per year, and exported by a GitHub Actions workflow that can be run manually or triggered on a schedule from cron-job.org. Each sync targets the current year in New York time, falling back to the previous year until the new year's sheet has its first dated film row. The updater writes the year's data file and refreshes the manifest, so the previous year becomes the archive as soon as the new year takes over. Membership fees are tracked separately from per-screening prices, annual payments carrying their payment dates, then folded into the total-spending stat and year-over-year comparison logic.

A shorts program (one screening of several short films) is logged as a single row whose year cell lists every short's production year separated by commas (e.g. "2013, 2025, 2026"). The exported JSON carries that string through unchanged, and the dashboard parses the listed years wherever production years matter: the rating chart's New releases / Repertory split, the decade chart, and the log table's Year column, sorting, and decade filter.

A Chinese-language film is logged with its original and English titles in one cell, separated by " || " (e.g. "流浪地球 2 || The Wandering Earth 2"). The exporter fails the sync on a half-empty pair rather than export a broken title. The combined string carries through the JSON unchanged. The log table and the calendar tooltip show the English half in gray after the original title; every other view shows the original title alone.

A screening paid in a foreign currency is logged in the same price cell as an ISO currency code plus the local amount (e.g. "CNY50", "EUR14.50"). The exporter converts it to USD at the screening date's ECB reference rate via the Frankfurter API, with weekend and holiday screenings using the most recent business day's rate. The exported price stays in USD, so totals, comparisons, and sorting share one currency, while the original amount is kept alongside for the log table's local-price display. Fetched rates are cached in the committed `data/fx-rates.json`, so past conversions never drift across reruns and the sync survives API outages; a rate can be added there by hand if a currency falls outside ECB coverage. A screening synced before its date's rate has published converts provisionally at the latest available rate, and a later sync locks in the date's own rate. Any other text in a price cell fails the sync loudly rather than exporting a broken price.

## Deployment

The site is served by GitHub Pages at [jimsfilms.nyc](https://jimsfilms.nyc/), built from the `main` branch, so every push (including each data sync commit) deploys automatically.

A companion workflow, `retry-pages-deploy.yml`, watches the built-in Pages deployment and handles failures. When a deploy fails, it re-runs the failed job a few times with escalating backoff. Pages can occasionally wedge on a single commit and reject every re-run of it, so once the retries are exhausted the workflow pushes an empty "Redeploy Pages" commit to force a fresh deploy under a new SHA. If that commit also fails to deploy, the workflow stops and leaves a failed run in the Actions tab as the signal for manual attention. Before each retry it checks whether a newer commit has already deployed, so it never overwrites the site with stale content.
