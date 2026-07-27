import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', 'data');
const MANIFEST_OUTPUT = resolve(DATA_DIR, 'manifest.json');
const MANIFEST_JS_OUTPUT = resolve(DATA_DIR, 'manifest.js');
const FX_CACHE_PATH = resolve(DATA_DIR, 'fx-rates.json');

const getCurrentYearInNewYork = () => Number(new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
}).format(new Date()));

const sheetNameForYear = year => String(year % 100).padStart(2, '0');

const getExistingDataYears = () => readdirSync(DATA_DIR)
  .flatMap(file => {
    const match = file.match(/^data-(\d{4})\.json$/);
    return match ? [match[1]] : [];
  });

const buildManifest = activeYear => {
  const years = [...new Set([...getExistingDataYears(), String(activeYear)])]
    .sort((a, b) => Number(a) - Number(b));
  return {
    defaultYear: String(activeYear),
    years: Object.fromEntries(years.map(year => [year, `data/data-${year}.json`])),
  };
};

const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = process.env;
if (!DROPBOX_APP_KEY || !DROPBOX_APP_SECRET || !DROPBOX_REFRESH_TOKEN) {
  console.error('Missing DROPBOX_APP_KEY, DROPBOX_APP_SECRET, or DROPBOX_REFRESH_TOKEN');
  process.exit(1);
}

// 1. Exchange refresh token for access token
const tokenRes = await fetch('https://api.dropboxapi.com/oauth2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: DROPBOX_REFRESH_TOKEN,
    client_id: DROPBOX_APP_KEY,
    client_secret: DROPBOX_APP_SECRET,
  }),
});
if (!tokenRes.ok) {
  console.error('Token exchange failed:', await tokenRes.text());
  process.exit(1);
}
const { access_token } = await tokenRes.json();

// 2. Download Cinema.xlsx
const dlRes = await fetch('https://content.dropboxapi.com/2/files/download', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Dropbox-API-Arg': JSON.stringify({ path: '/Cinema.xlsx' }),
  },
});
if (!dlRes.ok) {
  console.error('Download failed:', await dlRes.text());
  process.exit(1);
}
const xlsxBuffer = Buffer.from(await dlRes.arrayBuffer());

// 3. Parse the current New York year, falling back until the new sheet exists.
const XLSX = (await import('xlsx')).default;
const workbook = XLSX.read(xlsxBuffer, { type: 'buffer' });
const getRowsForYear = year => {
  const sheet = workbook.Sheets[sheetNameForYear(year)];
  return sheet ? XLSX.utils.sheet_to_json(sheet, { header: 1 }) : null;
};
const hasFilmRows = rows => rows?.some(r => r && typeof r[0] === 'number' && r[1]);
const currentYear = getCurrentYearInNewYork();
const activeYear = [currentYear, currentYear - 1].find(year => hasFilmRows(getRowsForYear(year)));
if (!activeYear) {
  const expectedSheets = [currentYear, currentYear - 1].map(sheetNameForYear).join('" or "');
  console.error(`Sheet "${expectedSheets}" not found with film rows. Available:`, workbook.SheetNames);
  process.exit(1);
}
const rows = getRowsForYear(activeYear);
const activeSheetName = sheetNameForYear(activeYear);
const excelEpochMs = Date.UTC(1899, 11, 30);
const excelSerialDateToDateString = serial => new Date(excelEpochMs + serial * 86400000).toISOString().slice(0, 10);

// A plain number in the price cell is USD; a foreign ticket is logged as an
// ISO currency code plus the local amount ("CNY50", "EUR14.50"). Anything
// else fails the run so a typo can't silently become a $0 screening.
const parsePriceCell = (cell, label) => {
  if (cell == null || typeof cell === 'number') return { amount: cell || 0, currency: 'USD' };
  const text = String(cell).trim();
  if (!text) return { amount: 0, currency: 'USD' };
  const match = text.match(/^([A-Za-z]{3})\s*(\d+(?:\.\d+)?)$/);
  if (!match) {
    console.error(`Unparseable price ${JSON.stringify(cell)} for ${label}; use a plain number (USD) or a currency code plus amount like "CNY50".`);
    process.exit(1);
  }
  return { amount: Number(match[2]), currency: match[1].toUpperCase() };
};

// A Chinese-language film's title cell carries the original and English
// titles together, e.g. "流浪地球 2 || The Wandering Earth 2". Normalize the
// separator spacing to the exact " || " the dashboard splits on, and fail on
// a half-empty pair rather than let a typo ship as a title.
const parseTitleCell = (cell, label) => {
  const text = String(cell);
  if (!text.includes('||')) return text;
  const parts = text.split('||').map(part => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    console.error(`Unparseable title ${JSON.stringify(cell)} for ${label}; use "original title || English title".`);
    process.exit(1);
  }
  return parts.join(' || ');
};

// 4. Transform rows
const films = [];
let membershipFees = 0;
const membershipPayments = [];
for (const r of rows) {
  // Membership rows hold the venue code in column P, fees paid in column Q,
  // and, for an annual membership, the payment date in column R (same serial
  // format as the screening date column). The AMC monthly subscription is a
  // running total with no date, so it stays out of the dated-payments list;
  // the dashboard prorates undated fees across the year and counts a dated
  // payment only once the comparison date reaches its payment date.
  if (r && typeof r[16] === 'number') {
    membershipFees += r[16];
    if (r[16] > 0 && typeof r[17] === 'number') {
      membershipPayments.push({ venue: r[15] || '', amount: r[16], date: excelSerialDateToDateString(r[17]) });
    }
  }
  if (!r || typeof r[0] !== 'number' || !r[1]) continue;

  const date = excelSerialDateToDateString(r[0]);
  const { amount, currency } = parsePriceCell(r[7], `${date} "${r[1]}"`);
  films.push({
    date,
    title: parseTitleCell(r[1], date),
    year: r[2],
    runtime: r[3],
    rating: r[4] ?? null,
    rewatch: r[5] === 'r',
    format: r[6] || 'DCP',
    price: amount,
    ...(currency !== 'USD' && amount > 0 ? { priceOriginal: amount, currency } : {}),
    venue: r[8] || '',
    series: r[9] || null,
  });
}

films.sort((a, b) => a.date.localeCompare(b.date));
membershipPayments.sort((a, b) => a.date.localeCompare(b.date));

// 5. Convert foreign prices to USD at each screening date's ECB reference
// rate (Frankfurter serves the most recent business day for weekends and
// holidays). Rates are cached in data/fx-rates.json so past conversions
// never drift across reruns; a rate can also be added there by hand if a
// currency ever falls outside ECB coverage.
//
// A date's fixing publishes around 16:00 CET that same day, so a screening
// logged from a timezone ahead of Frankfurt (a July 1 morning show in China
// while Frankfurt is still on June 30) needs a rate that does not exist yet.
// Until the screening date has ended in Frankfurt, convert with the latest
// published rate but keep it out of the cache, so a later sync re-fetches
// and locks in the date's own fixing.
const foreignFilms = films.filter(f => f.currency);
let fxCache = {};
try { fxCache = JSON.parse(readFileSync(FX_CACHE_PATH, 'utf8')); } catch {}
const todayInFrankfurt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
const provisionalRates = {};
const missingRates = [...new Set(foreignFilms
  .filter(f => typeof fxCache[f.currency]?.[f.date] !== 'number')
  .map(f => `${f.currency}|${f.date}`))];
let cacheChanged = false;
for (const missing of missingRates) {
  const [currency, date] = missing.split('|');
  const isFinal = date < todayInFrankfurt;
  const fxRes = await fetch(`https://api.frankfurter.dev/v1/${isFinal ? date : 'latest'}?base=${currency}&symbols=USD`);
  const rate = fxRes.ok ? (await fxRes.json()).rates?.USD : null;
  if (typeof rate !== 'number') {
    console.error(`No USD rate for ${currency} on ${date} (HTTP ${fxRes.status}); add {"${currency}": {"${date}": <rate>}} to data/fx-rates.json if this currency is outside ECB coverage.`);
    process.exit(1);
  }
  if (isFinal) {
    (fxCache[currency] ??= {})[date] = rate;
    cacheChanged = true;
  } else {
    (provisionalRates[currency] ??= {})[date] = rate;
    console.log(`Using provisional ${currency} rate for ${date}; the day's fixing is not published yet and a later sync will finalize it.`);
  }
}
if (cacheChanged) {
  const sortedCache = Object.fromEntries(Object.entries(fxCache)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, rates]) => [currency, Object.fromEntries(
      Object.entries(rates).sort(([a], [b]) => a.localeCompare(b)))]));
  writeFileSync(FX_CACHE_PATH, `${JSON.stringify(sortedCache, null, 2)}\n`);
}
for (const f of foreignFilms) {
  const rate = fxCache[f.currency]?.[f.date] ?? provisionalRates[f.currency][f.date];
  f.price = Math.round(f.priceOriginal * rate * 100) / 100;
}

// 6. Write year-specific data and the site manifest.
const output = resolve(DATA_DIR, `data-${activeYear}.json`);
const manifest = buildManifest(activeYear);
writeFileSync(output, JSON.stringify({ films, membershipFees, membershipPayments }));
writeFileSync(MANIFEST_OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(MANIFEST_JS_OUTPUT, `window.DASHBOARD_MANIFEST = ${JSON.stringify(manifest)};\n`);
const fxNote = foreignFilms.length ? ` (${foreignFilms.length} foreign-currency prices converted to USD)` : '';
console.log(`Wrote ${films.length} films and $${membershipFees} membership fees (${membershipPayments.length} dated payments) from sheet "${activeSheetName}" to data-${activeYear}.json${fxNote}`);
