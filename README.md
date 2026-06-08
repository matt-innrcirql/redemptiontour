# mattyeeredemptiontour.com

A passport of every date — Josie lands on the **hub** and taps a stamp to revisit any one.

## Structure

```
/                     → the Passport hub (index.html, self-contained)
/redemptiontour/      → "The Redemption Tour" (Chicago, Jun 2026) — the first stamp
/<next-date>/         → each future date is its own folder
CNAME                 → mattyeeredemptiontour.com (covers the whole site)
```

## Adding a new date

1. Create a folder, e.g. `paris/`, with that date's site inside (`index.html` + assets, relative paths).
2. Add one entry to the `DESTINATIONS` array near the bottom of the root `index.html`:
   ```js
   { no:'STAMP II', title:'…', place:'CITY · REGION', date:'MON 2026', href:'paris/', kind:'navy', rot:2 }
   ```
3. Commit & push — a new stamp appears on the hub automatically.

No DNS changes are ever needed; everything lives under the one domain + cert.
