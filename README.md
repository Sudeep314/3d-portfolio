# 3D Portfolio — Sudeep Kumar M V

An interactive **3D portfolio website**. Every skill domain is a planet orbiting
your name, and every project is a small moon you can click.

Built with **Three.js + WebGL**, in plain HTML / CSS / JavaScript. No build step,
no `npm install` — just open it and it runs.

There's also a **printable one-page resume** at `resume.html`, generated from the
same content file.

---

## How to run it

The site uses ES modules, so browsers need it served over HTTP (opening the
`index.html` file directly will fail with a CORS error).

**Easiest way (Windows):** double-click **`start.bat`**.
It boots a tiny local server and opens <http://localhost:8000> in your browser.
Keep the black window open while you work; `Ctrl+C` stops it.

**Manual way:**

```bash
cd portfolio-3d
python -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, `php -S`, VS Code "Live Server" extension).

---

## Where to put your stuff

```
portfolio-3d/
├── index.html          # page shell + nav + panel skeleton
├── resume.html         # printable one-page resume (same content, A4)
├── css/
│   ├── style.css       # all styling for the 3D site (dark space theme)
│   └── resume.css      # styling for the printable resume (light, print-ready)
├── js/
│   ├── content.js      # >>> EDIT THIS — all your details live here <<<
│   ├── app.js          # the Three.js engine (scene, camera, picking, UI)
│   └── resume.js       # renders resume.html from content.js
├── assets/
│   ├── profile.jpg     # your photo
│   └── resume.pdf      # optional — a PDF version, if you ever make one
├── start.bat           # one-click local server
└── README.md
```

### `js/content.js` is the only file you need to touch

Everything on the site — your name, tagline, skills, projects, timeline, contact
info, planet colours, orbit distances — comes from that one file. Change a
value, save, refresh the browser. That's it.

**To add a new planet:** copy an existing block inside `planets: [ ... ]` and
edit it. The 3D scene builds itself from whatever is in the list.

**To add a new project:** add it to the `projects: [ ... ]` array of whichever
planet it belongs to. It automatically appears as a clickable moon orbiting
that planet.

---

## The resume

`resume.html` is a clean, one-page A4 resume built from the **same**
`content.js` — education, projects, skills, achievements and contact details
all live in one place, so the website and the resume can never disagree.

To get a PDF: open `resume.html` → click **Print / Save as PDF** → in the print
dialog pick *Save as PDF*, margins *None*, and tick *Background graphics*.
It prints on exactly one A4 page.

If you ever make a real PDF, drop it in `assets/resume.pdf` and a
**Download PDF** button appears next to the printable-page link automatically.

---

## Controls

| Action | Result |
|---|---|
| Drag | Orbit the camera around your solar system |
| Scroll / pinch | Zoom in and out |
| Click a planet | Fly to it and open its details panel |
| Click a moon | Open that project |
| `R` | Reset the camera back to the overview |
| `Esc` | Close the side panel |
| Arrow keys | Rotate the camera |

---

## How the 3D scene is built

| Piece | Where | What it does |
|---|---|---|
| Starfield | `buildStarfield()` | 2,600 points on a sphere shell, slowly drifting |
| The Core | `coreGroup` | A glowing icosahedron with your name floating above it |
| Planets | `buildPlanet()` | One per skill domain, on a tilted orbit with a label and glow |
| Project moons | `buildPlanet()` | Small satellites orbiting each planet — one per project |
| Planet textures | `planetTexture()` | Painted at runtime on a 2D canvas — no image files needed |
| Camera | `cam` object | Spherical coordinates, damped toward their target each frame |
| Picking | `pickAt()` | A `Raycaster` turns your mouse into a 3D click |
| Side panel | `renderPanel()` | Turns `content.js` into the HTML drawer |

No external 3D models or textures are required — the planet surfaces, labels and
glows are all generated with the Canvas 2D API at load time, which keeps the
whole site a single small folder you can zip and send.

---

## Deploying later (GitHub Pages)

1. Create a repo and push this folder.
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → `main` / `root`.
3. Your site goes live at `https://yourusername.github.io/repo-name/`.

Everything already uses relative paths (`css/...`, `js/...`), so it works
unchanged. The only thing that needs internet is the Three.js CDN link.

---

## Notes

- The Three.js version is pinned to `0.160.0` in the import map inside
  `index.html` — don't change it unless you want to test a newer release.
- Performance is capped at device pixel ratio 2 (1.5 on phones).
- `prefers-reduced-motion` is respected for the UI animations.
