# Opening Night, the recap ticket (design)

Date: 2026-07-07
Folder: `/openingnight/`
Working title: **The One Where She Said Yes**

## What this is

A new ticket in the passport for Josie to tap: the recap of the July 2-3 weekend
where Matt asked her to be his girlfriend and she said yes. This is the first
episode filed under **The Residency** rather than The Redemption Tour, because it
IS the residency's opening night (the reveal page already bills "Opening Night:
Chicago, the night she said yes").

Follows the proven Season Three (`homeshow/`) architecture: a single
self-contained `index.html`, Friends-style tap-through scenes with inline SVG
vignettes, speech bubbles, a progress bar, PostHog analytics, no build step,
static-hosting safe. Mobile-first at iPhone width.

## The true story it retells (source: Matt + message archive)

Night one, Thursday July 2:
1. Matt arrives; Dash (her dog) and Josie's smile at the door.
2. Dinner at Armand's, Arlington Heights. It starts raining.
4. They leave Armand's for ice cream, rain picking up.
5. The twist: a flashback to May 20, the last time they were at Armand's,
   when Matt hugged her goodnight instead of kissing her. The stumble that
   started the whole redemption tour bit.
6. Back to the same crosswalk, now in pouring rain. Matt asks. She says yes.
   Not according to plan. Perfect.

Day one, Friday July 3:
7. Spa morning, because Matt insisted.
8. Brunch.
9. The Harry Potter store, where Matt nerds out (wands, trains, trees).
10. Dinner at **Tre Dita** (note: correct spelling per the messages), the first
    dinner as an official couple. Josie in the brown dress. "You look amazing."

Finale: a letter card. Unexpected, a lot of right place right time.
"I am so happy you're in my life, Josie. You have really added to it."

## Scene list

1. Title card: SEASON 5 / THE ONE WHERE / She Said Yes
2. The Door (tap to knock: door opens, Dash bounds out, her smile)
3. Armand's (tap: first raindrops streak the window)
5. Ice Cream (tap for a scoop; rain heavier)
6. The Flashback (rewind treatment, sepia; May 20, the hug)
7. The Crosswalk (pouring rain; the ask; TAP for the yes; hearts + downpour)
8. Interstitial card: "Not according to plan. / Absolutely perfect."
9. The Spa (tap to relax: steam rises)
10. Brunch (tap to clink)
11. The Harry Potter Store (tap to cast: sparkles)
12. Tre Dita (the brown dress; tap: candle + heart; "You look amazing.")
13. The Letter (cream ticket card, the closing message, back-to-passport link)

## Integration

- `passport-stage.js`: add a 7th stamp slot (bottom-left page, stamps already
  overlap page content by design) and append the destination in BOTH places
  `destinations` is constructed. Stamp: no `THE RESIDENCY`, title `Opening
  Night`, place `THE ONE WHERE SHE SAID YES`, date `JUL 2-3 2026`, gold, glow,
  go `RELIVE IT`.
- `residency/index.html` + `residency/fallback.html`: a ticket-styled link to
  `/openingnight/` in the payoff, above Past Tours, so she finds it from the
  front door.

## Analytics

Same public PostHog token. Events: `openingnight_scene` {scene},
`openingnight_yes_reached`, `openingnight_finale`, plus autocapture pageview.

## Constraints

- No em dashes anywhere in copy.
- No WebGL dependency; CSS/SVG only, so no fallback page is needed.
- Decorative animations respect prefers-reduced-motion (continuous loops off).

## Revisions (2026-07-07, post-ship)

- Door caption says Chicago, not Illinois.
- The two-houses scene was removed at Matt's request; the reel is 12 scenes.
- Cold open added before the title card: the Love Is Blind interview chair,
  'what do you want' / 'I want to be somebody to someone because of who I am,
  and I hope that person is here', with the handwritten aside that because of
  LIB he'd find that person on Rainey Street. 13 scenes again.
- Soundtrack is Someone To You by BANNERS (openingnight/song.mp3, cache-busted
  ?v=2), started by the hub on the stamp tap (overlay pattern) or standalone on
  first tap. It replaced One Life, which shipped earlier the same day.
