# The Itinerary Screen — Design

**Date:** 2026-06-02
**Site:** The Redemption Tour (`matt-innrcirql/redemptiontour`)

## Goal
Add a new, interactive **Itinerary** screen revealing the plan for the night,
themed to match the existing vintage gig-poster SPA and made delightful for Josie.

The actual itinerary:
- **Dinner** — 6:00 PM @ Bazaar Meat, Chicago
- **The walk** — ~10–15 min stroll down the Magnificent Mile
- **Drinks** — 8:45 PM @ Terrace 16

## Entry point
On the **Poster** (front page), below the "Claim Your Ticket" CTA, a handwritten
script line: *"Josie — tap here to view your itinerary 🎟"*. Tapping routes to a new
`itinerary` screen in the existing state machine (same pattern as dates/rider/ticket).

## The excitement gate (reveal mechanic)
The itinerary opens **locked**. Before the timeline reveals:
- Prompt: *"Before the tour begins… how excited are we, on a scale of 1 to 5?"*
- Five tappable stars (1–5). Any pick unlocks; copy reacts to the choice (5 = best).
- Playful mandatory-items note: *bring your smile + your personality (non-negotiable)*.
- "Unlock the night →" button triggers the staggered reveal animation.
- Pick saved to localStorage + emitted to PostHog (`itinerary_excitement`).

## Animated reveal timeline
Vertical "tour stops" timeline. On unlock, three stops cascade in (staggered
fade/slide). The walk is a dashed connector segment between the two venues.

| # | Stop | Time | Detail |
|---|------|------|--------|
| I | Dinner | 6:00 PM | Bazaar Meat, Chicago |
| — | the walk | ~10–15 min | down the Magnificent Mile |
| II | Drinks | 8:45 PM | Terrace 16 |

## Extras
- **Map links** — each venue links to Google Maps (`📍 View on map`).
- **Add to calendar** — one button builds a downloadable `.ics` (6:00 dinner →
  ~10:45 end), generated client-side, no external service. Date = chosen night
  (defaults to the preferred Sat Jun 6 if none chosen).

## Style / mechanics
- Reuses `.paper`, `.panel`, `.screen-enter`, display/script/type fonts, red/gold/teal palette.
- New `Itinerary` component in `screens.jsx`; new CSS appended to `styles.css` (mobile-first).
- `app.jsx`: add `itinerary` to the screen switch AND to the boot-guard `needed` list.
- Cache-bust `?v=N` bumped on deploy (6 → 7).

## Mobile
Mobile-optimized: single-column timeline, large tap targets (≥44px), star picker
sized for thumbs, buttons wrap, type clamps. Verified at 390px viewport before deploy.
