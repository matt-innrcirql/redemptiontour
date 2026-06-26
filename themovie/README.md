# themovie/ — Season Five: The Movie

A cinematic on-rails recap of the story so far that ends by unlocking the July 2-3 date.
Self-contained `index.html` in the same house style as the other stamps (passport gold/burgundy,
film grain, PostHog, shared `/db.js` for RSVP). Built on Canvas2D + CSS so it runs on every phone
(no WebGPU needed). Matches the proven Season Four pattern: ambient canvas behind crisp DOM text.

## How it plays
Poster (PLAY) → short film-leader countdown → 9 tap-to-advance scenes (the real beats + real
texts) → a "NOW BOOKING" reveal of the next date with a one-tap RSVP that persists via `DB.save`.

## Everything editable is in one place
Top of the `<script>` in `index.html`: the `CONFIG` object.
- `CONFIG.scenes[]` — captions, the text exchanges, and each scene's `mood` (canvas palette).
- `CONFIG.reveal` — the next-date copy (the `beats`), the RSVP question, and the confirm note.
- `CONFIG.song` — currently points at `../stars/song.mp3` as a placeholder.

## TODO before it ships to Josie
- [ ] CONFIRM Josie's iOS version (gates whether a WebGPU/aperture 3D upgrade is even an option; the
      current Canvas2D build runs regardless).
- [ ] Drop a `themovie/song.mp3` (something warm/cinematic) and set `CONFIG.song = 'song.mp3'`.
- [ ] Finalize the `CONFIG.reveal` next-date copy once the date details are locked. NOTE baked in:
      Jul 2 (Thu) is a Cubs OFF-DAY, so the Cubs live on Jul 3 (Fri, vs Cardinals, 3:05pm CT, Wrigley).
      Also confirm city: this is written as CHICAGO (Ritz spa + Wrigley); the relationship notes
      mention an Austin visit, so double-check which one July 2-3 actually is.
- [ ] (optional) Add real photos: set `photo:'assets/xyz.jpg'` on a scene and drop files in themovie/assets.
- [ ] (optional) Promote to the hub's featured "press here" stamp + reflect "YOU'RE IN" after RSVP
      (mirror the Season Four / stars logic in the root index.html; currently added as a normal
      DESTINATIONS entry so it is present and testable).
- [ ] DECISION: ship this Canvas2D version (safe, runs everywhere) or spike a 3D upgrade
      (Three.js/WebGL2 is consistent with Season Four; aperture/WebGPU only if Josie is on iOS 26+).

## Status
v1 built locally 2026-06-25. NOT pushed (Josie has the live link). Review locally first:
open `themovie/index.html`, or open the hub `index.html` and tap the Season Five stamp.
