# The Residency — design spec

**Date:** 2026-06-29
**Author:** Matt (with Claude)
**Status:** Approved direction, pending spec review

## One-line

Retire **The Redemption Tour** and reveal its successor, **The Residency**, as a single
cinematic reveal page Josie opens *after she has already said yes to being his girlfriend* —
the old tour poster gets crossed out and re-billed as the new era. Nothing is deleted; every
past "tour" stays viewable.

## Context

- The site lives at `mattyeeredemptiontour.com` (repo: `~/Desktop/redemptiontour`, GitHub Pages).
- The current front door `/` is a 3D **Passport** (`index.html` + `passport-stage.js`) whose
  stamps are each date/era: The Movie (`themovie/`), **The Redemption Tour** (`redemptiontour/`),
  Season Two (`next/`), Season Three (`homeshow/`), After Dark (`afterdark/`), Season Four
  (`stars/`). So "The Redemption Tour" is effectively the name of the whole universe, and the
  passport is already a back-catalog of past dates.
- Matt teased Josie that he is "ending the redemption tour in favor of a new one… bet you didn't
  expect that," to be explained at the July 2–3 Chicago run. This page is the payoff of that
  open loop.
- **Critical framing:** Matt gives this to her *after* she says yes, in person. It is a
  celebration/trophy, **not** a proposal mechanism. There is no question to answer on the page
  and no answer-capture flow.

## Goals

1. Cross out "The Redemption Tour" and reveal "The Residency" in a way that feels like the same
   beloved poster, restamped — high recognition, high delight.
2. Celebrate "she said yes" without asking anything or over-promising future commitments.
3. Keep every past experience fully viewable ("Past Tours"), nothing deleted.
4. Zero risk to the currently live site.

## Non-goals (YAGNI)

- No proposal/ask flow, no yes/no buttons, no answer capture, no database writes.
- No rebuild of the Passport or the existing sub-experiences.
- No re-branding of the archived sub-experiences — they keep their Redemption Tour branding on
  purpose; they are the *past* tours.
- No domain change. The URL stays `mattyeeredemptiontour.com` (and the page winks at that).

## Name

**The Residency.** A touring act that is done touring and commits to one venue / one person
indefinitely — the literal resolution of "ending the tour." Chosen over The World Tour, The
Forever Tour, Officially Yours.

## Tone

Cheeky + warm: self-deprecating tour-promoter voice (Matt's register, matching the original
Redemption Tour), with the sincerity landing at the end. No em dashes in copy.

## Architecture

New self-contained folder **`/residency/`**:

```
residency/
  index.html      # the reveal (self-contained: inline CSS reusing the gig-poster tokens, inline JS)
  assets/         # only if a headliner image is reused; otherwise none
```

- Reuses the design system from `redemptiontour/styles.css`: fonts Anton (`--f-display`),
  Special Elite (`--f-type`), Caveat (`--f-script`); palette oxblood/`--paper`/`--gold`/`--red`;
  film grain; the `.soldout` stamp pattern; the `.confetti` pattern; the marquee `.ticker`.
- **"Past Tours"** links to the Passport hub (`/`), which already presents every season including
  the Redemption Tour. Opens in its own tab/window (`target="_blank"`) so the reveal stays put and
  the past is viewable in a separate window, exactly as Matt asked.
- **Nothing else is modified.** `redemptiontour/` and all other folders are untouched.

**Go-live:** keep the reveal at `/residency/` so the shared domain's front door does not spoil it
early. At the moment Matt gives it to her he either (a) texts the direct `/residency/` link, or
(b) promotes it to the front door. Promotion is a separate, optional, one-line step decided later;
this spec does not change `/` now.

## The reveal — beat by beat

A single page that advances on tap (and auto-advances with sensible timeouts as a fallback),
mirroring the tap-to-continue pattern already used in `next/` and the Redemption Tour screens.

1. **The old poster.** Renders the familiar Redemption Tour poster: "ONE DATE · ONE SHOT — the
   redemption tour," Matt headlining, Chicago, the dates. Looks like the thing she already loves.
2. **The verdict.** A stamp slams down (reusing the `.soldout` stamp animation/feel):
   `✓ MISSION: REDEEMED`. Beat: the tour did its job.
3. **The cross-out.** A hand-drawn (Caveat) red slash strikes through "THE REDEMPTION TOUR."
   Marquee reads `TOUR CONCLUDED`.
4. **The re-bill.** Struck title fades; `THE RESIDENCY` stamps in large. Tagline:
   `now playing · indefinitely`.
5. **She said yes.** Ticker flips to `SHE SAID YES`, confetti drops, the headliner line updates
   `MATT` → `MATT & JOSIE` (she is promoted from "ticket holder" on the old poster to co-headliner).
6. **The new lineup.** The Residency's billing scrolls in, poster-styled (content below).
7. **Footer + archive.** A `🎟 Past Tours →` button to the passport, plus a wink:
   "yeah, the URL still says redemptiontour. some names you keep. ❤️"

Accessibility / responsiveness:
- Honors `prefers-reduced-motion`: stamps/cross-out/confetti reduce to simple fades; content is
  fully readable with no motion.
- Built mobile-first and verified at 393px width first (Matt's priority), then up.
- The whole reveal is reachable by tapping through; no gesture is required to see the content.

## The new lineup (Matt's content — editable inline)

Starting copy; Matt edits any line directly in `residency/index.html`:

```
        NOW PLAYING · THE RESIDENCY
   ──────────────────────────────────────
   HEADLINING        Matt & Josie
   OPENING NIGHT     Chicago · the night she said yes
   THE RUN           indefinite · no last show
   ── the recurring bill ──
   ★ Passenger Princess ............ nightly
   ★ Dash & Osito .......... co-headlining (veto rights retained)
   ★ Wed Wobbin ............. residency favorite
   ★ The Josie Fund ........ now fully vested
   ★ Pancake-Off / Costco Sundays
   ──────────────────────────────────────
   no refunds · no last call · no encore needed — she said yes
```

## Analytics

Optional, consistent with the rest of the site: load the same PostHog public token and fire a
single `residency_revealed` event (and per-beat events if cheap). No inputs are captured. Safe to
omit entirely; the page must work with PostHog absent.

## Open items for Matt

- Confirm/replace any lineup line.
- Decide go-live method (direct link vs. front-door promotion) at the time, not now.
- Optional: a real headliner photo for beat 1, or keep it type-only.
