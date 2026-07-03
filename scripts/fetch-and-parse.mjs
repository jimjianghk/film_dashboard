import { readdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', 'data');
const MANIFEST_OUTPUT = resolve(DATA_DIR, 'manifest.json');
const MANIFEST_JS_OUTPUT = resolve(DATA_DIR, 'manifest.js');

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

// 4. Transform rows
const films = [];
let membershipFees = 0;
for (const r of rows) {
  if (r && typeof r[16] === 'number') membershipFees += r[16];
  if (!r || typeof r[0] !== 'number' || !r[1]) continue;

  films.push({
    date: excelSerialDateToDateString(r[0]),
    title: String(r[1]),
    year: r[2],
    runtime: r[3],
    rating: r[4] ?? null,
    rewatch: r[5] === 'r',
    format: r[6] || 'DCP',
    price: r[7] || 0,
    venue: r[8] || '',
    series: r[9] || null,
  });
}

films.sort((a, b) => a.date.localeCompare(b.date));

// 5. Write year-specific data and the site manifest.
const output = resolve(DATA_DIR, `data-${activeYear}.json`);
const manifest = buildManifest(activeYear);
writeFileSync(output, JSON.stringify({ films, membershipFees }));
writeFileSync(MANIFEST_OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(MANIFEST_JS_OUTPUT, `window.DASHBOARD_MANIFEST = ${JSON.stringify(manifest)};\n`);
console.log(`Wrote ${films.length} films and $${membershipFees} membership fees from sheet "${activeSheetName}" to data-${activeYear}.json`);
