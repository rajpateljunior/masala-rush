# Masala Rush: NOTES

Last reviewed: 2026-10-11 (written from a read of the repo at commit `5fb7495`).

## What it is
A cute Cooking Fever–style Indian cooking game. Three restaurants, eight levels each (24 total): Mumbai (Marine Drive Tapri: samosa, chai, vada pav), Chennai (Mylapore Tiffin Room: dosa, idli, medu vada, filter kaapi), Delhi (Chandni Chowk Tandoor: naan, tikka, butter chicken, dal, biryani, lassi).
Live: https://rajpateljunior.github.io/masala-rush/ · Repo: `rajpateljunior/masala-rush`

## Design decisions (Raj's)
- Cooking Fever–style: tap-driven stations, customers with orders and patience, coins earned per dish, upgrades bought between levels.
- New dishes and add-ons are introduced one per level, with an intro card explaining each (`INTRO`).
- Level 8 of each restaurant is a rush level.
- Progression: level N unlocks after earning at least 1 star on level N-1. The next restaurant unlocks after at least 1 star on level 8 of the previous one.
- Per restaurant upgrades: stations (3 tiers), plates (2 tiers), decor (3 tiers). Costs are in `REST[...].cost`.
- Offline-first PWA, no external art or audio files.

## Architecture
- Single `index.html` (~150 KB) with inline CSS and two `<script>` blocks. **No `src/` folder and no build script in this repo**: edit `index.html` directly.
- Sections in the main script, in order: helpers, art primitives, food art (SVG strings), plates and dishes, vessels, customers, scenes, game data, save, audio (WebAudio synth), stage and screens, modals, level runtime, rendering, customers, input, loop, wiring, save codes.
- Fonts (Baloo family, incl. Devanagari and Tamil subsets) are self-hosted in `fonts/`. Icons in `icons/` (180, 192, 512, maskable 512, favicon 64).
- Service worker `sw.js`: cache-first with background refresh. Cache name is `masala-rush-<hash>`; the ASSETS list is hard-coded in `sw.js`.

## Data tables (all in `index.html`, "game data" section)
- `NAME`: display names. `COOK`: cook and burn times per food. `DISH`: recipes and prices. `ADD`: add-on prices. `ACCEPT`: which add-ons each base takes.
- `REST`: per restaurant: stations, ingredient sources, plate, decor, upgrade costs, customer dialogue.
- `ORDER`: restaurant order. `LEVELS`: per level new items (`u`), customer count (`n`), order size range (`k`), `rush` flag.
- `INTRO`: intro-card text for each new item.

## Save format
- `localStorage` key `masala-rush-save-v1`. Object shape: `{ v:1, coins, stars:{mumbai:[],chennai:[],delhi:[]}, best:{…}, up:{mumbai:{},…}, music, sfx, t }` (`t` = last-saved timestamp).
- `mergeSave()` fills any missing field from defaults, so adding new fields is backward compatible. Keep it that way.
- Copy-and-paste save code: prefix `MASALA1-` followed by base64 of the JSON (see "save codes" section). Existing codes must keep loading.
- Optional cloud sync via `window.claude` (`db` and `user`), which only does anything when the page runs inside Claude. On the GitHub Pages site it silently does nothing. Newest `t` wins.
- Separate flag: `localStorage` key `mr-install-hint` hides the install hint.

## Updating checklist
1. Edit `index.html`.
2. Change the `CACHE` name in `sw.js` (otherwise installed copies keep the old version). The current name looks hash-stamped, but the tool that stamped it is not in the repo, so bump it by hand with any new suffix, e.g. `masala-rush-v<date>`.
3. If a file is added, add it to `ASSETS` in `sw.js`.
4. Keep save loading backward compatible. Update this file.

## Rotation / layout fitting
- `fit()` scales the 400-wide stage to `#app`. `refit()` (just below `fitGame()`) calls it, and is triggered by `resize`, `orientationchange`, `visualViewport` resize, a `ResizeObserver` on `#app`, `pageshow` and `visibilitychange`, plus re-checks at 60/200/450/900 ms after any of those.
- Why: on iOS the `resize` event can fire before rotation has settled, leaving the previous orientation's layout (cut-off display). Fixed 2026-10-11. Do not go back to a single `resize` listener.
- Test: Playwright at iPhone SE/14/Pro Max, iPad mini/Air and desktop, rotating portrait/landscape/portrait/landscape mid-level, with resize events suppressed to mimic the iOS race. Checks that stage, hud, scene, counter, stations and pantry all sit inside `#app`. Test script is not checked in.

## Known issues / untested
- Rotation fix verified in headless Chromium only, not on a real iPhone/iPad (the real iOS timing could not be reproduced exactly).
- Not verified on a real iPhone by this session: touch feel, iOS audio, install flow. (Last commit message says the install hint was corrected for Chrome/Firefox/Edge on iOS as well as Safari; I did not re-test that.)
- Cloud sync only works inside Claude and has not been exercised from here.
- No balance bot or simulation exists in this repo, so level difficulty and economy have not been checked here.
- No tests are checked in.

## Ideas not yet done
- None recorded. Add Raj's wishlist here.
