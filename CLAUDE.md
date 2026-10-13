# HoloGrade — project notes for Claude Code

## What this is
Single-file static web app (`index.html`: HTML, CSS and one IIFE script). No build step, no dependencies except Google Fonts (Space Grotesk, JetBrains Mono). It began as a claude.ai artifact called DeadCenter and was renamed HoloGrade. Public site: holograde.uk (a separate Lovable-built site; this tool is meant to become the scanner).

## Layout of index.html
- CSS tokens on `:root`, dark first, light under `prefers-color-scheme: light`. Style matches holograde.uk: near-black, teal eyebrows, blue-violet-pink gradient (`--holo`).
- Start screen (`#start`): hero, dropzone, how-it-works, tips, sample buttons, info sections.
- Flow (`#flow`): six-step scan strip (`#steps`), scan log (`#scanLog`) shown while `S.scan` is true, tabbed viewer (flattened card / photo with draggable corners), results column.
- Script: `/*PURE_START*/ … /*PURE_END*/` holds pure functions with no DOM: homography/flatten (504×704 px, 8 px/mm), `detectBorders`, `pair`, `tierFor`, `findCard`, `GRADERS` + `estimateGrader/estimateAll`, `analyseCondition`, `stepWidth`. Tests extract this block with `new Function`. Keep it DOM-free.
- Below the pure block: state `S`, `makeSample`, `setSource/loadFile/autoCorners`, `render/renderGraders`, drag handlers, scan sequencing (`startScan/startReveal/finishScan`), identify/inspect (`identify`, `applyInspection`).

## Facts to keep straight
- Centering ladders per grader are in `GRADERS`. BGS is approximate (Beckett publishes only the Pristine 10 centering). BGS and ACE show ranges; the lift limits (BGS 1, ACE 2) are this app's own assumption. SGC is deliberately omitted.
- Front only. Back centering is not measured.
- Without the AI step the result is labelled "Up to PSA N" because grime, creases and scratches on the card face are not measured.
- Scan sequence timings (about 0.5 s per check) are presentation pacing over real results.
- Border detection assumes a standard bordered card.

## Known gaps / next work
1. **Rate limiting and daily cap.** The `/api/inspect` Vercel serverless function holds the Anthropic key server-side (`ANTHROPIC_API_KEY` env var). Add per-IP rate limiting and a global daily cap, and fall back to measure-only when the cap is hit.
2. **Free name lookup option.** In-browser OCR (Tesseract.js) on the name/number crop plus a free card database (e.g. TCGdex), with manual entry as a fallback.
3. **On-device face check.** An early experiment (blotchiness and dark flecks in pale areas) gave numbers on one worn card but cannot be thresholded without clean real-card photos. Needs a small calibration set.
4. **Calibrate** `TH` (corner/edge/surface thresholds) against cards with known grades.
5. Privacy page, since images go to a third party when AI is on.

## Testing
- `node tests/graders.js` for estimate logic and a syntax check.
- For UI checks use Playwright against `index.html`. Stub the AI by intercepting `fetch` calls to `api.anthropic.com` and returning a canned JSON response.
