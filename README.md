# HoloGrade

Pokémon TCG pre-grade estimator. Choose a photo of the front of a card and it finds the card, measures border centering, checks corners, edges and border specks, and estimates grades at PSA, BGS, CGC, ACE and TAG. It runs entirely in the browser with no account.

The whole app is one static file: `index.html`. Open it in a browser or host it on any static host (Cloudflare Pages, Netlify, GitHub Pages).

## Status

- Card finding, border detection, centering, corner/edge/border-speck wear, and the grader estimates all run on-device.
- The optional "read & inspect" step (card name and a face condition check) used Claude through the claude.ai artifact runtime (`window.claude.use('sample')`). That does not exist on a normal host, so on a static site the step switches itself off and the page measures only.
- Wear thresholds are starting guesses, not calibrated against cards with known grades.

## Run the checks

    node tests/graders.js        # prints grader estimates and syntax-checks the script

## Next steps

See `CLAUDE.md`.
