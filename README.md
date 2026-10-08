# Polynomial Coaster

A roller-coaster game for practicing **end behavior** and **zero multiplicity** of polynomials.
Students build the track from the equation, then send a cart down it. If the ends and zeros are right,
the cart makes the whole ride. If not, it comes off at the first mistake.

No build step and no dependencies: open `index.html` in a browser.

## How a ride works

1. Click an end point on each side to say where the track goes. The track starts to draw as you click.
2. Click each zero to choose **pass through** (odd multiplicity) or **bounce** (even multiplicity).
3. Press **Ride**. The cart rolls along the student's own track, left to right, and derails at the first mistake.
   A clean ride swaps in the true graph.

## Modes

| Mode | What students see | What they do |
| --- | --- | --- |
| Factored form (easy) | `f(x) = -2(x + 3)(x - 1)²(x - 4)³` | Read the exponents and signs, build the track |
| Factor first (medium) | `f(x) = 2x³ - 2x² - 12x` | Factor to find the real zeros, mark them, then build the track |
| Synthetic division (expert) | | Planned, shown as locked on the start screen |

Each run is 8 rides with rising difficulty. Stars: 3 per ride, minus one for a derail and one for using hints.
The results screen tallies where carts came off (ends, pass vs. bounce, missed or extra zeros).

## Run locally

```bash
git clone <your-repo-url>
cd polynomial-coaster
npm start        # serves on http://localhost:8000 (needs python3)
```

or just double-click `index.html`.

## Tests

```bash
npm test
```

The tests run `game.js` under Node with a tiny DOM stub and check that:

- every generated problem's expanded form equals its factored form and all roots are in range
- the true track crosses at odd multiplicities, bounces at even ones, and matches the end behavior
- the student's live sketch is complete and consistent for correct answers, and is flagged when an end or zero is wrong
- a full ride succeeds for correct answers and derails at the first mistake for wrong ones

## Deploy with GitHub Pages

1. Create an empty repo on GitHub, then push this folder to `main`:
   ```bash
   git init -b main
   git add .
   git commit -m "Polynomial Coaster"
   git remote add origin https://github.com/<you>/polynomial-coaster.git
   git push -u origin main
   ```
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` runs the tests and publishes the site.
   Your game will be at `https://<you>.github.io/polynomial-coaster/`.

## Project layout

```
index.html        page shell and font links
styles.css        theme tokens (light and dark) and all styling
game.js           problem generators, track geometry, game state, rendering, ride animation
tests/            Node tests (no dependencies)
.github/workflows/pages.yml   test and deploy
```

## Extending it

- **New problem types (factor-first mode):** add an entry to the `TEMPL` array in `game.js`.
  A template's `make()` returns `makeProblem(a, roots, irrationalFactors, {h1, h2})`, where `h1` and `h2` are the first two hints.
  Templates unlock in array order as a run progresses.
- **Easy-mode difficulty:** see `genEasy` (levels change every 2 rides).
- **Expert mode (synthetic division):** the start screen already has a locked card. Add a mode key, a generator,
  and hints, then wire it into `startRun` and `nextRide`.
- **Colors and fonts:** all in the `:root` tokens at the top of `styles.css`.

## Accessibility

Zeros and end points are keyboard operable (Tab, then Enter or Space), state is shown with a glyph and a word as well as color,
and the layout follows the system light or dark theme. The ride always animates, with a gentler derail when
the system asks for reduced motion.

## License

MIT. Replace the name in `LICENSE` with yours.
