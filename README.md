# ASCII Raycaster Shooter — Full Build Roadmap

## How to use this document

Each phase has the same shape:

- **Goal** — the one sentence that defines "done"
- **Research first** — go read/watch these _before_ writing code
- **Files** — exactly what to create
- **Build** — function signatures and what each must do. **The bodies are yours.** That's the point.
- **Done when** — a concrete, testable checkpoint
- **Pitfalls** — the specific things that will waste your evening

Rules for yourself:

1. **Do not skip ahead.** Phase 2 is unreadable without Phase 1's coordinate system in your head.
2. **Do not add a library** unless the roadmap says to. Every one you add early is a layer between you and understanding.
3. **When something works, stop and read your own code.** Ask "why does this line exist?" If you can't answer, you copied it.
4. **Commit at every "Done when" checkpoint.** Small commits, plain messages.

Rough calibration: Phases 0–3 are the core learning. Phases 4–6 are game design. Phase 7 is conventional web work. If you only ever finish Phase 3, you will have learned more than most tutorial-completers.

---

# PHASE 0 — Environment and project skeleton

**Goal:** Open a folder, edit a file, see the change in a browser, and have it under version control.

## Research first

- What a text editor vs an IDE is (10 min skim, don't overthink)
- What Git is: commit, staging area, remote. Ignore branches for now.
- What "localhost" and a port number mean
- Why you can't just double-click an HTML file forever (`file://` vs `http://`, and why ES modules break under `file://`)

## Install

| Tool                                | What it is                             | Notes                                                                   |
| ----------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| **VS Code**                         | Your editor                            | Free, from code.visualstudio.com                                        |
| **Live Server** (VS Code extension) | Tiny local web server with auto-reload | Search "Live Server" by Ritwick Dey in the Extensions panel             |
| **Git**                             | Version control                        | git-scm.com. On Windows this also gives you Git Bash, a usable terminal |
| **Node.js (LTS)**                   | JavaScript outside the browser         | You won't use it until Phase 7, but install now so it's done            |

Verify each in a terminal:

```
git --version
node --version
npm --version
```

If any of those error, the install didn't finish. Fix it now, not in Phase 7.

## Folder structure

Create this exactly. Empty files are fine.

```
ascii-shooter/
├── index.html
├── style.css
├── src/
│   └── main.js
├── assets/
├── .gitignore
└── README.md
```

`.gitignore` contents for now:

```
node_modules/
.DS_Store
*.log
```

`README.md` — write three lines describing what you're building. You'll thank yourself in month four.

## Build

**`index.html`** must contain:

- The HTML5 doctype and basic document structure
- A `<link>` to `style.css`
- A single `<canvas id="screen">` element
- A `<script type="module" src="src/main.js"></script>` — note `type="module"`, this matters and is why you need Live Server

**`style.css`** must:

- Remove default body margin
- Set a dark background
- Make the canvas display as a block, centered
- Set `image-rendering: pixelated` on the canvas (you'll want this later)

**`src/main.js`** — for now, one line that logs something to the console.

## Done when

You right-click `index.html` → "Open with Live Server", the browser opens at something like `http://127.0.0.1:5500`, and your log message appears in DevTools console (F12). Then:

```
git init
git add .
git commit -m "Project skeleton"
```

## Pitfalls

- **Opening the file directly instead of via Live Server.** ES modules are blocked on `file://`. You'll get a CORS error that looks terrifying and means nothing.
- **Forgetting `type="module"`.** Then `import` throws a syntax error later.
- Spaces or non-ASCII characters in your folder path. Avoid them.

---

# PHASE 1 — Canvas, the game loop, and 2D movement

**Goal:** A top-down view of a grid map with a dot you can drive around using WASD, that can't walk through walls.

No 3D yet. This phase builds the coordinate system and the loop that everything else runs inside.

## Research first

- **Canvas 2D basics.** MDN's "Canvas API" tutorial, first three sections only. You need: `getContext('2d')`, `fillRect`, `clearRect`, `fillStyle`, `beginPath`/`moveTo`/`lineTo`/`stroke`.
- **`requestAnimationFrame`.** What it is, why it's not `setInterval`.
- **Delta time.** Why you multiply movement by elapsed time instead of a fixed number. Search "game loop delta time" — read one article, it's a 5-minute concept with big consequences.
- **Radians.** `Math.cos`, `Math.sin`, `Math.atan2`. Specifically: given an angle, `cos` gives you the x component of a unit vector and `sin` gives the y. Internalize this — Phase 2 is nothing but this.
- **Canvas coordinate system:** y increases _downward_. This will confuse you exactly once.
- **`keydown`/`keyup` events** and why you don't move the player inside the event handler.

## Files

```
src/
├── main.js          # entry point, wires everything together
├── loop.js          # the game loop
├── input.js         # keyboard state
├── map.js           # the level grid
├── player.js        # player state and movement
└── render2d.js      # top-down debug renderer
```

## Build

### `map.js`

```js
export const TILE_EMPTY = 0;
export const TILE_WALL  = 1;

export const map = [ /* 2D array of numbers */ ];

export const MAP_W = /* ... */;
export const MAP_H = /* ... */;

// Returns the tile value at grid cell (cx, cy).
// Must return TILE_WALL for anything outside the map bounds —
// this is your free out-of-bounds protection for the whole project.
export function tileAt(cx, cy) { }

// True if a *world-space* point is inside a solid tile.
export function isSolid(x, y) { }
```

Hand-author the map as a literal array. Start with a 16×16 room with a couple of internal walls. Writing it as an array of strings and converting is fine and more readable — `"1111111111"` etc.

**Key decision, make it now and never change it:** one map tile = 1.0 world unit. The player at `x: 3.5, y: 2.5` is in the centre of cell (3, 2). Every later phase depends on this.

### `input.js`

```js
// Attaches keydown/keyup listeners. Call once at startup.
export function initInput() {}

// True if the key is currently held.
export function isDown(code) {}
```

Use `event.code` (`"KeyW"`, `"ArrowLeft"`) not `event.key`. Store held keys in a `Set` or plain object. **Do not move the player in the event handler** — handlers fire at the OS repeat rate, not your frame rate. Handlers only record state; the loop reads it.

Also call `event.preventDefault()` for arrow keys so the page doesn't scroll.

### `player.js`

```js
export const player = {
  x: 3.5,
  y: 3.5,
  angle: 0, // radians, 0 = facing +x
  moveSpeed: 3.0, // world units per second
  turnSpeed: 2.5, // radians per second
};

// Advance the player by dt seconds based on current input.
export function updatePlayer(dt) {}
```

`updatePlayer` must:

1. Turn left/right (A/D or arrows) by `turnSpeed * dt`
2. Compute a forward vector from `angle` using cos/sin
3. Compute a strafe vector (the forward vector rotated 90°)
4. Sum the desired movement from W/S/Q/E into `dx, dy`
5. **Collide on each axis separately.** Try moving x; if the new position is solid, don't. Then try y independently. This gives you wall-sliding for free — moving diagonally into a wall slides along it instead of sticking.
6. Use a small collision radius (~0.2) rather than testing the exact point, so you can't clip corners.

Step 5 is the single most important detail in this phase. Testing both axes together makes movement feel awful and you won't know why.

### `loop.js`

```js
// Starts the loop. `update(dt)` and `render()` are called each frame.
export function startLoop(update, render) {}
```

Track `lastTime`. Each frame compute `dt = (now - lastTime) / 1000`. **Clamp `dt` to a maximum** (~0.1s) — otherwise when you alt-tab away and return, one enormous `dt` teleports the player through a wall.

### `render2d.js`

```js
// Draws the map grid, the player dot, and a short line showing facing.
export function renderTopDown(ctx, canvas) {}
```

Pick a scale (e.g. 24 pixels per tile) and multiply world coords by it. Clear the canvas first, every frame.

### `main.js`

Get the canvas and context, size the canvas, call `initInput()`, then `startLoop(updatePlayer, () => renderTopDown(ctx, canvas))`.

## Done when

You can drive a dot around a room, it stops at walls, it slides along them when you push diagonally, and movement speed feels identical whether the tab is busy or not.

Commit: `"Phase 1: game loop, input, top-down movement"`

## Pitfalls

- Forgetting `clearRect` → smearing trails.
- Moving inside the keydown handler → stuttery, OS-dependent movement.
- Not clamping `dt` → teleporting through walls after alt-tab.
- Combining axes in collision → sticking on walls.
- Using degrees somewhere and radians elsewhere. Pick radians everywhere.

---

# PHASE 2 — The raycaster

**Goal:** The same map, rendered as a first-person 3D view made of vertical coloured strips.

This is the phase that makes the project real. Budget real time for it — the code is short, the understanding is not.

## Research first

**The canonical resource:** Lode Vandevenne's raycasting tutorial ("Lode's Computer Graphics Tutorial — Raycasting"). It's in C++ but the math translates directly and it is the reference every other tutorial is derived from. Read part 1 twice.

Also useful: search "DDA algorithm raycasting" and "Wolfenstein 3D raycasting explained". A video walkthrough alongside Lode's text helps.

Concepts you must actually understand, not just copy:

- **Why one ray per screen column.** The screen is W pixels wide, you cast W rays.
- **DDA (Digital Differential Analyzer).** Instead of stepping along the ray in tiny increments (slow and imprecise), you jump directly from grid line to grid line. You always know which boundary you'll cross next, so you take the smaller of the two distances and step.
- **The fisheye problem.** If you use Euclidean distance from player to wall, straight walls bulge outward. You need _perpendicular_ distance — the projection of the ray onto the camera's forward axis. Two ways to fix it: multiply by `cos(rayAngle - playerAngle)`, or use the DDA's `perpWallDist` formulation directly. Understand _why_ it happens before you apply either.
- **Projection.** Wall column height on screen is inversely proportional to distance. `lineHeight = screenHeight / perpDist`, then centre it vertically.
- **Which side was hit.** DDA tells you whether you crossed a vertical or horizontal grid line. Shade them differently — this is what makes corners readable.

## Files

```
src/
├── raycast.js       # the ray casting itself
└── render3d.js      # turning rays into strips on screen
```

## Build

### `raycast.js`

```js
// Casts a single ray from (px, py) at world angle `rayAngle`.
// Returns { dist, side, tileX, tileY, tileType, wallX }
//   dist     — PERPENDICULAR distance (fisheye already corrected)
//   side     — 0 if a vertical grid line was hit, 1 if horizontal
//   tileX/Y  — which map cell was hit
//   tileType — the value from the map array
//   wallX    — 0..1, where along the wall face the hit landed
export function castRay(px, py, rayAngle) {}

// Casts one ray per screen column. Returns an array of length `columns`.
export function castRays(px, py, playerAngle, fov, columns) {}
```

`wallX` you won't use this phase, but you will in Phase 3 for wall texturing, and adding it later means re-deriving the DDA. Do it now.

Set FOV to `Math.PI / 3` (60°). Wider looks fish-eyed even with correction; narrower feels claustrophobic.

**Ray angle per column:** the naive `startAngle + (i / columns) * fov` is _slightly_ wrong — it distributes angles evenly rather than distributing points evenly across a flat projection plane. It's visually acceptable and much easier to reason about. Use it, note the compromise in a comment, and revisit if it bothers you later.

### `render3d.js`

```js
// Draws ceiling, floor, and one vertical strip per ray.
export function renderFirstPerson(ctx, canvas, hits) {}
```

For each hit:

1. `lineHeight = canvas.height / hit.dist`
2. `drawStart = (canvas.height - lineHeight) / 2`
3. Choose a colour: base colour from `tileType`, darkened if `side === 1`, darkened further with distance
4. `fillRect(columnIndex * columnWidth, drawStart, columnWidth, lineHeight)`

Fill ceiling and floor as two solid rects first, then draw strips over them.

### Wire it up

Add a key (e.g. Tab or M) that toggles between `renderTopDown` and `renderFirstPerson`. Keep the 2D view forever — it is your debugger for every phase that follows. When something breaks in Phase 5, the top-down view with rays drawn on it will tell you why.

## Done when

You can walk around in first person. Walls get taller as you approach. Straight walls look straight, not curved. Corners are visible because of side shading. Toggling to the top-down view shows the same world.

Commit: `"Phase 2: raycaster"`

## Pitfalls

- **Fisheye.** If walls bulge, you're using Euclidean distance. This is the #1 bug in this phase.
- **Division by zero** when a ray is perfectly axis-aligned. Guard it, or nudge the angle by a tiny epsilon.
- **Off-by-one in the DDA step** → you detect the wall one cell late and can see through corners.
- Casting rays every frame for a canvas 1000px wide is 1000 rays. That's fine. Don't optimize yet.
- Getting a black screen and panicking. Add `console.log` of the first ray's result. Check `dist` is a sane positive number.

---

# PHASE 3 — The ASCII renderer

**Goal:** Replace coloured strips with a grid of characters. This is where the game becomes _yours_ rather than a tutorial output.

## Research first

- **Monospace font metrics.** `ctx.measureText`, and why a monospace font makes a character grid possible at all.
- **Offscreen canvas / glyph atlas.** Search "canvas glyph atlas" or "sprite sheet canvas". The principle: rendering text is expensive, rendering an image is cheap, so render each character once into an offscreen canvas and blit copies.
- **`ctx.drawImage` with 9 arguments** (source rect + dest rect). This is the single most useful canvas call you'll learn.
- **How to profile.** DevTools → Performance tab. Record 5 seconds, find what's eating frame time. Learn this now; it turns "it feels slow" into "`fillText` is 80% of my frame."
- **ASCII/ANSI art density ramps.** The classic is `" .:-=+*#%@"` — increasing visual density. Search "ascii brightness ramp".

## Design decisions to make

Write these down in your README before coding:

- **Grid dimensions.** Something like 120×60 characters. Bigger = more detail, more cells to draw. Your ray count now equals your column count, not your pixel width — a big performance win.
- **The density ramp.** Nearer = denser character. Decide your ramp string.
- **Colour palette.** Keep it small (8–16 colours). This matters for the atlas: an atlas of `chars × colours` is only viable if colours are few.
- **Wall differentiation.** Different tile types get different character sets. A brick wall might be `#`, a door `=`, a pillar `|`.

## Build

### `glyphAtlas.js`

```js
// Renders every (character, colour) pair into an offscreen canvas.
// Returns { canvas, cellW, cellH, indexOf(char, colorIndex) }
export function buildGlyphAtlas(chars, colors, fontSize, fontFamily) {}
```

The atlas is a grid: characters across, colours down. `indexOf` returns the source x/y to feed `drawImage`.

Build this **once at startup**, not per frame.

### `asciiScreen.js`

A character framebuffer — the ASCII equivalent of a pixel buffer.

```js
export function createScreen(cols, rows) {} // { cols, rows, chars, colors }

export function clearScreen(screen, char, colorIndex) {}

// Write one cell. Must bounds-check and silently ignore out-of-range.
export function setCell(screen, cx, cy, char, colorIndex) {}

// Blit the whole buffer to canvas using the atlas.
export function drawScreen(ctx, screen, atlas) {}
```

Store `chars` and `colors` as flat typed arrays (`Uint8Array`) indexed `cy * cols + cx`, not a 2D array of objects. You'll be touching thousands of cells per frame.

### `renderAscii.js`

```js
// Replaces render3d.js. Writes wall columns into the character screen.
export function renderAsciiView(screen, hits) {}
```

For each column:

1. Compute `lineHeight` in _character rows_ instead of pixels
2. Pick a character from the ramp based on distance
3. Pick a colour index based on distance and `side`
4. Fill the column's cells from `drawStart` to `drawEnd`
5. Fill ceiling and floor cells with their own characters (`.` for floor, space for ceiling works well)

**Optional but excellent:** use `hit.wallX` to vary the character _along_ the wall, giving you texture. A brick pattern from `wallX` and the row index looks remarkable in ASCII.

## Performance path

Do these in order, and **measure between each**:

1. **Naive:** `ctx.fillText` per cell. Works. Probably 15–30fps at 120×60. Profile it and see for yourself.
2. **Glyph atlas + `drawImage`:** should get you comfortably to 60fps. This is where most projects stop, correctly.
3. **WebGL instancing** (much later, optional): one draw call for the whole grid. Only do this if you _want_ to learn WebGL, not because you need the speed.

Step 1 exists so you experience the problem before applying the solution. Skipping it means the atlas is cargo cult.

## Done when

You walk around a first-person world rendered entirely in characters, at a stable 60fps, and it looks like something you'd want to show someone.

Commit: `"Phase 3: ASCII renderer"`

## Pitfalls

- **Non-monospace font** → cells drift out of alignment. Set `font` explicitly to a monospace family and verify with `measureText`.
- **Fractional cell positions** → blurry glyphs. Round destination coordinates to integers.
- Rebuilding the atlas every frame. Build once.
- Using `<pre>` and `innerHTML` instead of canvas. It'll work at first and become unfixable later.
- Too many colours in the atlas → huge offscreen canvas. Keep the palette small.

---

# PHASE 4 — Shooting and the first enemy

**Goal:** A letter that stands in the world, faces you, and dies when you shoot it.

## Research first

- **Billboard sprites in a raycaster.** This is the hard part. Lode's tutorial part 3 covers sprite rendering — read it.
- **Z-buffer.** You already have one: the per-column distances from `castRays`. Store them; use them to decide whether a sprite column is hidden behind a wall.
- **Camera-space transform.** Converting a world position into "how far in front of me, how far to the side" using an inverse camera matrix. It's a 2×2 matrix inverse and Lode gives it to you — but derive it once on paper so you know what it's doing.
- **Hitscan vs projectile weapons.** Start with hitscan (instant ray, like a pistol). Projectiles come later.

## Build

### `zbuffer` — extend Phase 2

`castRays` should now also return a `Float32Array` of per-column distances, or you keep the hits array and read `dist` from it. Either is fine; just make it explicit.

### `sprites.js`

```js
// An entity that renders as a character billboard.
// { x, y, char, colorIndex, scale, alive }

// Sorts sprites far-to-near, transforms to camera space, and writes
// their cells into the screen buffer, respecting the z-buffer.
export function renderSprites(screen, sprites, player, zbuffer, fov) {}
```

Per sprite:

1. Position relative to player: `dx = sprite.x - player.x`, likewise dy
2. Transform into camera space (forward distance and lateral offset)
3. **Skip if forward distance <= 0** — it's behind you
4. Project to a screen column and a height, same inverse-distance rule as walls
5. For each column the sprite covers: if `spriteDist < zbuffer[col]`, draw its cells; otherwise skip (a wall is in front)

Sorting far-to-near matters once you have overlapping enemies.

### `weapon.js`

```js
// Fires a hitscan ray from the player's centre. Returns the sprite hit, or null.
export function fireHitscan(player, sprites, maxRange) {}

// Tracks cooldown so holding the key doesn't fire every frame.
export function updateWeapon(dt) {}
```

For hit detection, the simplest correct approach: cast a ray forward, step along it in small increments, and at each step check whether any living sprite is within a small radius of that point — and stop if you hit a wall first. Not the most elegant, entirely adequate, and easy to reason about.

### Feedback

A hit needs to be _felt_. In ASCII you have great options: flash the enemy's character to a different glyph for 100ms, spawn a brief `*` burst, shake the view by offsetting the character grid by one row for two frames.

## Done when

An enemy letter stands in the room, correctly disappears behind walls, grows as you approach, and vanishes with visible feedback when you shoot it.

Commit: `"Phase 4: sprites and shooting"`

## Pitfalls

- **Not checking for sprites behind the camera** → they appear mirrored in front of you. Very confusing, very common.
- Forgetting the z-buffer → enemies visible through walls.
- Not sorting → nearer enemies drawn under farther ones.
- No fire-rate cooldown → one keypress kills everything in the room.

---

# PHASE 5 — Enemy AI and real levels

**Goal:** Enemies that chase and attack you, in a level you authored as a text file.

## Research first

- **Finite state machines.** Search "game AI finite state machine". You need: idle → alert → chase → attack → dead. This is a `switch` statement and a `state` string. Resist anything more elaborate.
- **Line of sight.** You already have a ray caster; a sight check is a ray from enemy to player that stops at walls.
- **Pathfinding — deliberately deferred.** Start with "move directly toward the player." It's bad in complex maps and _perfectly fine_ in open rooms. Only add A* (search "A* pathfinding grid") if the dumb version visibly fails, and treat it as a bonus module.

## Build

### `level.js`

```js
// Parses a level from a text format into { map, spawns, playerStart, meta }
export function parseLevel(text) {}

// Loads a level file over fetch.
export async function loadLevel(path) {}
```

Design a text level format. Since your whole game is characters, this should be delightful:

```
name: Entry Hall
next: level2
---
################
#..............#
#..g.......g...#
#....######....#
#....#....#....#
#.@..#....#..k.#
################
```

Where `#` is wall, `.` floor, `@` player start, `g` a grunt, `k` a key item. Legend in a comment or a separate section.

Store levels in `assets/levels/`. Fetch them at runtime. **This is the moment you learn `fetch` and `async`/`await`** — take the time, it's the foundation of Phase 7.

### `enemy.js`

```js
// { x, y, char, hp, state, target, lastSeenX, lastSeenY, cooldown }

export function updateEnemy(enemy, dt, player, map) {}

// True if there's an unobstructed line from (x1,y1) to (x2,y2).
export function hasLineOfSight(x1, y1, x2, y2, map) {}
```

State behaviours:

- **idle** — stand still, check line of sight periodically (not every frame; every 200ms is plenty)
- **alert** — brief pause, change character or colour so the player _sees_ they've been noticed
- **chase** — move toward the player; if sight is lost, head to last-known position, then return to idle
- **attack** — in range and in sight, deal damage on a cooldown
- **dead** — leave a corpse character on the floor. Free atmosphere.

Different enemy types = different letters, speeds, hp, and ranges. `g` grunt, `S` a slow tank, `f` a fast weak one. A data table of enemy types, not a class hierarchy.

### Player health and death

Add `hp` to the player, a damage function, a death state, and a restart. Keep it minimal — you're proving the loop closes, not building a UI.

## Done when

You load a level from a text file, enemies notice you, chase you around corners, damage you, and you can die and restart.

Commit: `"Phase 5: enemy AI and level loading"`

## Pitfalls

- Running expensive sight checks every frame for every enemy. Stagger them.
- Enemies clustering into one spot on top of each other. Add simple separation: push apart if two are within a small radius.
- Enemies walking through walls — they need the same axis-separated collision the player has. Extract that into a shared function now.
- Building a class hierarchy for enemy types. Use a data table.

---

# PHASE 6 — Game structure, progression, and the save adapter

**Goal:** Menus, multiple levels, and progress that persists — behind an interface you'll later swap for a real backend.

## Research first

- **State machines again**, this time for the whole game: menu → playing → paused → level complete → game over.
- **`localStorage`.** Read it, note it's synchronous and string-only, note it's per-browser and lost when someone clears data. That limitation is _why_ Phase 7 exists.
- **JSON serialization.** `JSON.stringify` / `JSON.parse`, and what doesn't survive the round trip (functions, `undefined`, `Map`, `Set`).
- **The adapter pattern** (a.k.a. programming against an interface). This is a genuinely important idea and this is the perfect place to learn it.

## Build

### `saveAdapter.js` — the important one

Define the interface first, in a comment, before writing any implementation:

```js
// SaveAdapter interface:
//   async getProgress()            -> { levelsCompleted: [], currentLevel, stats }
//   async setProgress(progress)    -> void
//   async isAuthenticated()        -> boolean

export class LocalSaveAdapter {
  async getProgress() {}
  async setProgress(progress) {}
  async isAuthenticated() {
    return false;
  }
}
```

**Every method is `async` even though `localStorage` is synchronous.** This is the whole trick. When you replace it with an HTTP-backed adapter in Phase 7, no calling code changes. Get this right and Phase 7 is a swap; get it wrong and Phase 7 is a rewrite.

Nothing in your game may touch `localStorage` directly. Only the adapter.

### `gameState.js`

```js
export const STATES = { MENU, PLAYING, PAUSED, LEVEL_COMPLETE, GAME_OVER };

export function setState(newState) {}
export function updateGame(dt) {} // dispatches on current state
export function renderGame(screen) {}
```

Only `PLAYING` runs the world update. Menus are just different things written into the same character screen — which is a genuine pleasure when everything is already ASCII. No DOM overlays needed.

### `progression.js`

```js
export function completeLevel(levelId, stats) {}
export function isLevelUnlocked(levelId) {}
export function getNextLevel(levelId) {}
```

Decide what a save actually contains. Be conservative — every field is a field you have to migrate later:

- Levels completed
- Best time / kill count per level (optional)
- Current level
- Settings (volume, key bindings)

**Do not save mid-level position.** Checkpoint at level boundaries only. It's a hundred times simpler and players don't miss it.

## Done when

You can start from a menu, play through three levels, quit, come back, and your progress is there.

Commit: `"Phase 6: game states, progression, save adapter"`

## Pitfalls

- Letting `localStorage` calls leak outside the adapter. Grep for it before moving on.
- Synchronous adapter methods. They must be `async` from day one.
- Saving too much state. Small saves migrate easily.
- Building the pause menu in HTML/DOM. Render it into the character screen — it's more work than you think to keep two rendering systems in sync.

---

# PHASE 7 — The backend

**Goal:** Accounts, server-side saves, and the game deployed on the internet.

This is the phase where the tools you already use at work start applying. It should feel noticeably more familiar than Phases 2–5.

## Research first

- **Node.js and npm.** `package.json`, `npm install`, dependencies vs devDependencies, what `node_modules` is and why it's gitignored.
- **Express.** Routing, middleware, `req`/`res`, error handling middleware.
- **HTTP fundamentals.** Methods, status codes, headers, cookies. Specifically what `httpOnly`, `secure`, and `sameSite` do on a cookie.
- **Session auth vs JWT.** Read one comparison. For a game with a server you control, sessions are the simpler and safer default.
- **Password hashing.** bcrypt or argon2. Never anything else, never your own.
- **SQL basics.** SELECT, INSERT, UPDATE, WHERE, JOIN. Enough to know what your ORM generates.
- **Prisma.** Schema definition, migrations, the generated client.
- **CORS.** What it is and why it will bite you the first time your frontend and API are on different origins.

## Structure

Restructure the repo:

```
ascii-shooter/
├── client/          # everything from Phases 0-6
├── server/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── progress.js
│   │   ├── middleware/
│   │   └── db.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── README.md
```

## Build

### Database schema

```
User:      id, email (unique), passwordHash, createdAt
Progress:  id, userId (FK), levelId, completedAt, bestTime, kills
Session:   handled by your session store
```

Start with **SQLite** for local development. It's a file, needs no server, and Prisma makes moving to Postgres later a config change. Don't start with Postgres.

### Endpoints

```
POST   /api/auth/register    { email, password }
POST   /api/auth/login       { email, password }
POST   /api/auth/logout
GET    /api/auth/me          -> current user or 401

GET    /api/progress         -> the user's progress
PUT    /api/progress         { levelId, stats }
```

### Things to get right

- **Hash passwords with bcrypt.** Never store or log plaintext.
- **Validate input at the boundary.** Use `zod` — a small, genuinely pleasant library.
- **Rate-limit auth endpoints.** `express-rate-limit`. Login especially.
- **`httpOnly`, `secure`, `sameSite: 'lax'` cookies.** Session ID never touches JavaScript.
- **Never trust the client's claims about progress.** A client saying "I completed level 9" should be sanity-checked against what it has already completed. You don't need to be airtight for a hobby game, but think about it — this is your professional instinct and it applies here.
- **Distinguish 401 from 403 correctly.** 401 = you aren't authenticated. 403 = you are, but you may not do this. You know exactly why this matters.

### `HttpSaveAdapter`

```js
export class HttpSaveAdapter {
  async getProgress() {} // GET /api/progress
  async setProgress(p) {} // PUT /api/progress
  async isAuthenticated() {} // GET /api/auth/me
}
```

Same interface as `LocalSaveAdapter`. Choose which to instantiate at startup based on whether the user is logged in. **If you designed Phase 6 correctly, this is the only new file and nothing else changes.** That moment is worth the wait.

### Guest → account migration

The tutorial is guest mode. When a guest registers, their `localStorage` progress should transfer. Read local progress, register, push it to the server, clear local. Handle the failure case — network error mid-migration shouldn't lose their save.

### Deployment

- **Frontend:** static files. Netlify, Vercel, or Cloudflare Pages, all free.
- **Backend:** Render, Railway, or Fly.io have usable free/cheap tiers for a Node service.
- **Database:** whatever your host offers as managed Postgres, or SQLite on a persistent volume.
- Environment variables for secrets. `.env` locally, gitignored, never committed.
- HTTPS everywhere, or `secure` cookies won't work.

## Done when

Someone else, on their own machine, can visit a URL, play as a guest, register, and find their progress on a different device.

Commit: `"Phase 7: backend, auth, deployment"`

## Pitfalls

- CORS errors on first deploy. Expect them, don't panic.
- Cookies not sent cross-origin — you need `credentials: 'include'` on fetch _and_ proper CORS config server-side.
- `secure: true` cookies failing on `http://localhost`. Make it environment-dependent.
- Committing `.env`. Check your `.gitignore` before the first push.
- Building auth UI in HTML forms and fighting the game's canvas focus. Render login into the ASCII screen too, if you can bear it — or use a clean DOM overlay only for auth and hide it during play.

---

# PHASE 8 — Everything else

Once Phase 7 ships, these are all independent and can be done in any order or not at all:

- **Audio.** Web Audio API. Procedurally generated beeps fit the aesthetic perfectly and skip asset sourcing entirely.
- **Mouse look.** Pointer Lock API. Transforms the feel of the game.
- **Weapon variety.** Projectiles, spread, ammo, reload.
- **Doors and keys.** Requires animated tile state.
- **Minimap.** You already wrote it in Phase 1.
- **Particles.** Debris, muzzle flash — all characters, all cheap.
- **Level editor.** Since levels are text, an in-browser editor is a weekend and is enormously satisfying.
- **Mobile/touch controls.**
- **WebGL renderer.** The performance rewrite, purely as a learning exercise.
- **Automated tests.** Your professional instinct will itch here. Good targets: raycaster math (given a known map and ray, assert the distance), collision resolution, level parsing, save adapter contract (run the same test suite against both implementations — that's the real payoff of the adapter design).

---

# Cross-cutting practices

**Version control.** Commit at every checkpoint. Push to GitHub from Phase 0 — a private repo is fine. When something breaks badly you want to be able to go back.

**Debug view.** Keep the top-down renderer forever. Draw the rays on it. Draw enemy states as labels. It is the difference between fixing a bug in ten minutes and fixing it in three evenings.

**A debug HUD.** FPS, player position and angle, entity count, current state. Cheap to write, endlessly useful.

**Read your own code.** After each phase, reread the phase before it. You'll find things you don't understand and things you'd now write differently. Both are the learning.

**When stuck for more than an hour:** switch from "why doesn't this work" to "what do I actually know is true?" Log values. Check assumptions one at a time. The bug is almost always a coordinate system, an off-by-one, or radians vs degrees.

**Do not refactor while a feature is half-finished.** Get it working, commit, _then_ clean it up. Committing first means you can always get back to working.

---

# Research reading list

Bookmark these now:

- **MDN Web Docs** — Canvas API, `requestAnimationFrame`, `fetch`, `localStorage`. The reference, not a tutorial.
- **Lode's Computer Graphics Tutorial, Raycasting parts 1–3** — the canonical raycasting source. Everything else is derived from it.
- **javascript.info** — the best free deep JavaScript reference. Read the sections on closures, `this`, prototypes, and promises when you hit them.
- **Red Blob Games** — beautiful interactive explanations of pathfinding, line-of-sight, and grid math. Worth reading for pleasure.
- **Express documentation** — the guide, not just the API reference.
- **Prisma documentation** — the getting-started section covers 90% of what you need.
- **OWASP Cheat Sheet Series** — the authentication and session management sheets, when you reach Phase 7.

---

# The one rule

**Get to the end of Phase 3 before you make any architectural decision you'd defend in a code review.**

The single biggest risk to this project is not difficulty. It is spending three weeks choosing a state management pattern for a game with eleven variables. Ugly code that runs teaches you more than beautiful code that doesn't exist — and you'll rewrite it later knowing exactly _why_ the first version was wrong, which is the only way that lesson ever really lands.
