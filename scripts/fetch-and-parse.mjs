import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'data', 'data.json');

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

// 3. Parse sheet "26"
const XLSX = (await import('xlsx')).default;
const workbook = XLSX.read(xlsxBuffer, { type: 'buffer' });
const sheet = workbook.Sheets['26'];
if (!sheet) {
  console.error('Sheet "26" not found. Available:', workbook.SheetNames);
  process.exit(1);
}
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
const excelEpochMs = Date.UTC(1899, 11, 30);
const excelSerialDateToDateString = serial => new Date(excelEpochMs + serial * 86400000).toISOString().slice(0, 10);

// 4. Transform rows
const films = [];
let membershipFees = 0;
for (const r of rows) {
  if (r && typeof r[16] === 'number') membershipFees += r[16];
  if (!r || !r[1]) continue;

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

// 5. Write data.json
writeFileSync(OUTPUT, JSON.stringify({ films, membershipFees }));
console.log(`Wrote ${films.length} films and $${membershipFees} membership fees to data.json`);
