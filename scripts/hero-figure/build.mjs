/**
 * Builds the home page hero figure: an isometric PET preform injection mold
 * on a two-platen press, drawn with the Anatomy kit (MIT, see kit/LICENSE).
 *
 *   node scripts/hero-figure/build.mjs                 writes the figure
 *   node scripts/hero-figure/build.mjs --preview <dir> also writes preview pages
 *
 * World units are millimetres: x is the mold's opening axis, y runs across the
 * press and z is up, with z = 0 on the bed top. Every path is computed here
 * once and written to public/images/hero/preform-mold.svg; the page only moves
 * pre-built groups (see moldCycle.ts), so no geometry code ships to the client.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const SVG_OUT = join(ROOT, "public/images/hero/preform-mold.svg");
const DATA_OUT = join(ROOT, "src/components/home/HeroBanner/moldFigure.generated.ts");

/* ------------------------------------------------------------------ model */

// PCO 1881 (28 mm) neck preform, as drawn: s runs from the sealing surface
// (s = 0) to the closed end.
const PF = {
  threadR: 13.7, // 27.4 mm thread OD
  neckR: 12.4,
  ringR: 16.6, // 33.2 mm support ring
  ringS: [19.2, 23.5],
  bodyR: 11.6,
  tipR: 10.9,
  length: 97,
  boreR: 10.8,
};
// Eight cavities, four rows of two. The neck ring slides run up the press and
// open sideways, so a released preform drops between its two halves.
const COLUMNS = [-45, 45];
const ROWS = [180, 240, 300, 360];
const CAVITIES = COLUMNS.flatMap((y) => ROWS.map((z) => ({ y, z })));

// Strokes. The neck rings carry each preform off its core: the stripper moves
// the mouth past the core tip, the slides then open wider than the support
// ring, and the opening leaves room for the preform to fall clear of the face.
const NECK_FACE = 0; // parting line: support ring underside, neck ring face
const MOUTH_X = PF.ringS[1]; // sealing surface, inside the neck rings
const CORE_TIP_X = MOUTH_X - 94.5; // 2.5 mm wall at the dome
const STRIP = Math.ceil(MOUTH_X - CORE_TIP_X + 8.5);
const STROKE = 210;
const SPLIT = 18; // per half: 36 mm between the halves, 33.2 mm support ring
const PREFORM_CLEAR = STROKE + MOUTH_X - STRIP - PF.length;

/* ----------------------------------------------------------------- layout */

const BED = { x: -630, y: -220, w: 1320, d: 440, r: 0 };
const BED_H = 110;
const HOLE = { x: 22, y: -96, w: 140, d: 192, r: 3 };
const RAIL_Y = 130;

const FIXED_PLATEN = { x: -268, y: -190, w: 76, d: 380, r: 4 };
const MOVING_PLATEN = { x: 150, y: -190, w: 76, d: 380, r: 4 };
const PLATEN_TOP = 500;
const MOVING_Z = 42; // the moving platen rides on shoes
const RAIL_END = MOVING_PLATEN.x + MOVING_PLATEN.w + STROKE + 22;

const MOLD_Y = 128;
const MOLD_Z = [100, 440];
const CLAMP_Y = 150;
const CLAMP_Z = [80, 460];
const PLATES = {
  hotClamp: [-192, -162],
  manifold: [-162, -86],
  cavity: [-86, NECK_FACE],
  stripper: [30, 58],
  core: [58, 120],
  coreClamp: [120, 150],
};
const NECK_BAR = { x: [NECK_FACE, 30], half: 22, z: [154, 386] };
const CAM = { x: [8, 30], y: 80, z: [390, 404] };
const PIN = { y: 104, z: [128, 412], r: 14, length: 176 };

const BARREL_Z = 270;
const BARREL = { x: [-490, -290], r: 34 };
const ROD = { gland: 474, r: 30 };
const CYL = { x: [474, 604], r: 64 };
const PEDESTAL = { x: 512, y: -62, w: 72, d: 124, r: 3 };
const VALVE = { x: 626, y: -56, w: 44, d: 112, r: 2 };

/* ----------------------------------------------------------------- camera */

const W = 980;
const H = 700;
const AZIMUTH = 64;
const ELEVATION = 30;
const extremes = [
  ...k.boxCorners(BED, -BED_H - 12, 0),
  [FIXED_PLATEN.x, FIXED_PLATEN.y, PLATEN_TOP + 46],
  [MOVING_PLATEN.x + STROKE + MOVING_PLATEN.w, MOVING_PLATEN.y, PLATEN_TOP + 46],
  [-438, 0, BARREL_Z + 52 + 168],
];
const P = k.fitProjection(extremes, W, H, { pad: 14, azimuth: AZIMUTH, elevation: ELEVATION });
const KS = G.scaleOf(P);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const plan = (x0, x1, y0, y1, r = 2) => ({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r });
const slab = (x0, x1, y0, y1, z0, z1, { r = 2, steps = 3, bevel = 0.8 } = {}) =>
  k.slabOf(plan(x0, x1, y0, y1, r), z0, z1 - z0, P, steps, bevel);
const alongX = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const towardCavity = (o) => G.frameOf(o, [-1, 0, 0], [0, 1, 0], [0, 0, -1]);
const alongY = (o) => G.frameOf(o, [0, 1, 0], [0, 0, 1], [1, 0, 0]);
const up = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const line = (a, b) => k.segment(a, b, P);
const unitOf = (vector) => {
  const o = at([0, 0, 0]);
  const p = at(vector);
  return [p[0] - o[0], p[1] - o[1]];
};
const g = (attrs, body) =>
  `<g${Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("")}>${body}</g>`;
const byDepth = (a, b) => k.depthOf([a.x ?? 0, a.y, a.z], P) - k.depthOf([b.x ?? 0, b.y, b.z], P);

/* --------------------------------------------------------- shared recipes */

// Every hose whose fluid moves: the page runs arrows along these screen
// polylines, ordered from the hose's start to its end.
const FLOWS = [];
const flowOf = (id, kind, route) => FLOWS.push({ id, kind, points: route.map((point) => at(point).map((v) => Math.round(v * 10) / 10)) });

/** Socket-head cap screws on a +x face: a counterbore ring and a dot. */
function capScrewsX(x, points, r = 4.2) {
  return (
    Ln(points.map(([y, z]) => G.circleOf(alongX([x, y, z]), 0, r, P, 20)).join(""), { tone: "lo" }) +
    Dots(points.map(([y, z]) => at([x, y, z])), { size: 0.5, tone: "mid" })
  );
}

/** Screws on a +y face. */
function capScrewsY(y, points, r = 4.2) {
  return (
    Ln(points.map(([x, z]) => G.circleOf(alongY([x, y, z]), 0, r, P, 20)).join(""), { tone: "lo" }) +
    Dots(points.map(([x, z]) => at([x, y, z])), { size: 0.5, tone: "mid" })
  );
}

/** Screws on a top face. */
function capScrewsTop(z, points, r = 4.2) {
  return (
    Ln(points.map(([x, y]) => k.ring(x, y, r, z, P, 20)).join(""), { tone: "lo" }) +
    Dots(points.map(([x, y]) => at([x, y, z])), { size: 0.5, tone: "mid" })
  );
}

/** A mold plate (thin in x, tall in z) with its screws. */
function moldPlate([x0, x1], y, [z0, z1], { tone = "hi", inset = 14, extra = "" } = {}) {
  const out = [S(slab(x0, x1, -y, y, z0, z1, { r: 3, steps: 3, bevel: 0.9 }), { tone, crease: "lo" })];
  const ys = [-y + inset, y - inset];
  const zs = [z0 + inset, z1 - inset];
  out.push(capScrewsX(x1, ys.flatMap((yy) => zs.map((zz) => [yy, zz]))));
  out.push(capScrewsTop(z1, [-y * 0.55, y * 0.55].map((yy) => [(x0 + x1) / 2, yy]), 3.6));
  out.push(extra);
  return out.join("");
}

/** A water fitting on a +y face: hex body, nipple and bore. */
function fittingY([x, y, z]) {
  const F = alongY([x, y, z]);
  return (
    S(G.disc(0, 6, 7.2, F, P, { steps: 6 }), { tone: "mid" }) +
    S(G.disc(6, 15, 4.6, F, P), { tone: "mid" }) +
    S(G.disc(15, 17, 5.4, F, P), { tone: "mid" }) +
    Ln(G.circleOf(F, 17, 2.6, P, 16), { tone: "lo" })
  );
}

/* ------------------------------------------------------------- base & bed */

function feet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BED, -BED_H - 12, BED_H, P)}"/>`];
  const spots = [];
  for (const x of [BED.x + 60, BED.x + BED.w / 2, BED.x + BED.w - 60]) for (const y of [BED.y + 50, BED.y + BED.d - 50]) spots.push({ x, y, z: 0 });
  spots.sort(byDepth);
  for (const { x, y } of spots) {
    out.push(S(k.cylinder(x, y, 26, -BED_H - 12, 4, P, 32), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 18, -BED_H - 8, 8, P, 32), { tone: "mid" }));
  }
  return out.join("");
}

// The bed is a box with a chute cut through it under the parting line. It is
// drawn as slabs so the far walls of the chute show, and its near strip is cut
// at the fixed platen so the part in front of the mold can be drawn after the
// preforms that fall into the chute.
const FRONT_Y = [HOLE.y + HOLE.d, BED.y + BED.d];
const SPLIT_X = FIXED_PLATEN.x + FIXED_PLATEN.w;
const BED_BACK = plan(BED.x, BED.x + BED.w, BED.y, HOLE.y, 0);
const BED_LEFT = plan(BED.x, HOLE.x, HOLE.y, HOLE.y + HOLE.d, 0);
const BED_RIGHT = plan(HOLE.x + HOLE.w, BED.x + BED.w, HOLE.y, HOLE.y + HOLE.d, 0);
const BED_FRONT_A = plan(BED.x, SPLIT_X, ...FRONT_Y, 0);
const BED_FRONT_B = plan(SPLIT_X, BED.x + BED.w, ...FRONT_Y, 0);

function bedPart(p, { seam = true } = {}) {
  return S(k.slabOf(p, -BED_H, BED_H, P, 2, 0), { tone: "mid", inner: seam ? Ln(k.sideSeam(p, -BED_H + 18, P, 2), { tone: "faint" }) : "" });
}

function bedBack() {
  const out = [bedPart(BED_BACK), bedPart(BED_LEFT), bedPart(BED_FRONT_A)];
  // the chute goes right through the bed; its floor is the dark below
  out.push(`<path class="mf-void" d="${k.onTop(k.ringOf(HOLE, 3), -BED_H, P, true)}"/>`);
  // a wear strip lining the chute's far lip
  out.push(Ln(line([HOLE.x, HOLE.y, -14], [HOLE.x + HOLE.w, HOLE.y, -14]), { tone: "faint" }));
  out.push(Ln(line([HOLE.x, HOLE.y, -14], [HOLE.x, HOLE.y + HOLE.d, -14]), { tone: "faint" }));
  // label plate on the bed's near face
  const labelX = -470;
  const face = BED.y + BED.d;
  out.push(S(k.slabOf(plan(labelX, labelX + 120, face, face + 1.2, 1), -82, 50, P, 2, 0), { tone: "lo", crease: "none" }));
  out.push(
    Ln(
      [
        [labelX + 12, labelX + 92, -62],
        [labelX + 12, labelX + 70, -50],
        [labelX + 12, labelX + 104, -38],
      ]
        .map(([a, b, z]) => line([a, face + 1.2, z], [b, face + 1.2, z]))
        .join(""),
      { tone: "lo", free: true },
    ),
  );
  out.push(Dots([[5, -76], [115, -76], [5, -38], [115, -38]].map(([dx, z]) => at([labelX + dx, face + 1.2, z])), { size: 0.4 }));
  return out.join("");
}

function bedFront() {
  const out = [bedPart(BED_RIGHT, { seam: false }), bedPart(BED_FRONT_B)];
  // section joint bolts where the two near strips meet
  out.push(capScrewsY(FRONT_Y[1], [[SPLIT_X + 14, -30], [SPLIT_X + 14, -80]], 4));
  // chute rim: a flat steel frame inset into the bed top
  out.push(Ln(k.planOutline(k.insetPlan(HOLE, -8), 0, P, 3), { tone: "lo" }));
  out.push(Dots(k.corners(k.insetPlan(HOLE, -8), 5).map(([x, y]) => at([x, y, 0])), { size: 0.45 }));
  // stroke ruler beside the near rail, zero where the closed shoe's face sits
  const strip = plan(MOVING_PLATEN.x + 4, MOVING_PLATEN.x + 4 + STROKE + 16, RAIL_Y + 26, RAIL_Y + 36, 1);
  out.push(S(k.slabOf(strip, 0, 0.8, P, 2), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + 4 + STROKE, 10, 5, strip.y + 0.6, 0.8, [3, 6], P);
  out.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
  out.push(Dots([at([strip.x + 1.6, strip.y + 7.5, 0.8]), at([strip.x + strip.w - 1.6, strip.y + 7.5, 0.8])], { size: 0.4 }));
  // vents on the near face under the clamp side
  const face = FRONT_Y[1];
  const vents = [];
  for (let x = 330; x <= 600; x += 18) vents.push(k.pathOf([[x, -62], [x + 8, -62], [x + 8, -26], [x, -26]].map(([vx, vz]) => at([vx, face, vz])), true));
  out.push(Ln(vents.join(""), { tone: "lo" }));
  return out.join("");
}

function rail(y) {
  const p = plan(SPLIT_X, RAIL_END, y - 11, y + 11, 1.5);
  const out = [S(k.slabOf(p, 0, 18, P, 2, 0.6), { tone: "mid" })];
  out.push(Ln(k.lineOnTop([p.x, y], [p.x + p.w, y], 18, P), { tone: "faint" }));
  const bolts = [];
  for (let x = p.x + 30; x < p.x + p.w - 10; x += 60) bolts.push([x, y]);
  out.push(capScrewsTop(18, bolts, 3));
  // end stop with a buffer facing the shoe
  out.push(S(slab(RAIL_END, RAIL_END + 20, y - 20, y + 20, 0, 40, { r: 2, bevel: 0.6 }), { tone: "mid" }));
  out.push(capScrewsTop(40, [[RAIL_END + 10, y - 10], [RAIL_END + 10, y + 10]], 2.4));
  return out.join("");
}

/* --------------------------------------------------------- injection unit */

function injectionUnit() {
  const out = [];
  // carriage rails and the carriage block
  for (const y of [-56, 56]) {
    out.push(S(slab(-620, -300, y - 8, y + 8, 0, 14, { r: 1.5, steps: 2, bevel: 0.5 }), { tone: "mid" }));
    out.push(Dots([-590, -470, -420, -330].map((x) => at([x, y, 14])), { size: 0.4 }));
  }
  out.push(S(slab(-606, -490, -84, 84, 14, 40, { r: 2, bevel: 0.8 }), { tone: "mid" }));
  out.push(capScrewsTop(40, [[-590, -68], [-590, 68], [-506, -68], [-506, 68]], 3.4));
  // pedestal and injection cylinder housing
  const pedestal = plan(-594, -502, -64, 64, 3);
  out.push(S(k.slabOf(pedestal, 40, 160, P, 3, 1), { tone: "mid", inner: Ln(k.sideSeam(pedestal, 120, P, 3), { tone: "faint" }) }));
  out.push(S(slab(-606, -490, -82, 82, 200, 344, { r: 4, bevel: 1.2 }), { tone: "mid" }));
  out.push(capScrewsX(-490, [[-66, 216], [66, 216], [-66, 328], [66, 328]], 4.6));
  out.push(capScrewsY(82, [[-590, 216], [-506, 216], [-590, 328], [-506, 328]], 4.6));
  out.push(Ln(k.planOutline(plan(-594, -502, -70, 70, 3), 344, P, 3), { tone: "faint" }));
  // screw drive motor on the housing
  const motor = up([-548, 0, 344]);
  out.push(S(G.disc(0, 8, 34, motor, P), { tone: "mid" }));
  out.push(S(G.disc(8, 70, 30, motor, P), { tone: "mid" }) + k.fadedSvg(G.ribsOf(motor, 12, 62, 30, 36, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" }));
  out.push(S(G.disc(70, 76, 24, motor, P), { tone: "mid" }));
  // barrel with heater bands
  const F = alongX([BARREL.x[0], 0, BARREL_Z]);
  const length = BARREL.x[1] - BARREL.x[0];
  const bands = [[30, 56], [80, 106], [130, 156]];
  out.push(S(G.disc(0, 6, 46, F, P), { tone: "mid" }));
  let s = 6;
  for (const [a, b] of bands) {
    out.push(S(G.disc(s, a, BARREL.r, F, P), { tone: "hi" }));
    out.push(S(G.disc(a, b, BARREL.r + 5, F, P), { tone: "mid" }) + k.fadedSvg(G.ribsOf(F, a, b, BARREL.r + 5, 28, P, { fade: [0.15, 0.6] }), { tone: "faint" }));
    s = b;
  }
  out.push(S(G.disc(s, length, BARREL.r, F, P), { tone: "hi" }));
  // nozzle into the fixed platen's locating ring
  out.push(S(G.solidOf([[length, 26], [length + 10, 26], [length + 10, 15], [length + 22, 10, 1]], F, P), { tone: "mid" }));
  // feed throat and hopper
  out.push(S(slab(-462, -414, -40, 40, BARREL_Z + 26, BARREL_Z + 52, { r: 2, bevel: 0.6 }), { tone: "mid" }));
  const hopper = up([-438, 0, BARREL_Z + 52]);
  out.push(S(G.disc(0, 14, 20, hopper, P), { tone: "mid" }));
  out.push(
    S(G.solidOf([[14, 20], [22, 20], [86, 64, 1], [92, 66], [150, 66]], hopper, P), {
      tone: "hi",
      inner: Ln(G.arcOf(hopper, 92, 66, P) + G.arcOf(hopper, 120, 66, P), { tone: "faint" }),
    }),
  );
  out.push(S(G.disc(150, 158, 70, hopper, P), { tone: "mid" }));
  out.push(Ln(G.circleOf(hopper, 158, 60, P), { tone: "faint" }));
  out.push(S(G.disc(158, 168, 12, hopper, P), { tone: "mid" }));
  return out.join("");
}

/* --------------------------------------------------------------- platens */

/** A cast pocket on a +y face: a closed rounded outline, so it has no ends. */
function pocketY(y, [x0, x1], [z0, z1], r = 6) {
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 3);
  return k.pathOf(ring.map(([x, z]) => at([x, y, z])), true);
}

function platen(p, z0, pockets = [], extra = "") {
  const out = [S(k.slabOf(p, z0, PLATEN_TOP - z0, P, 4, 1.4), { tone: "mid", crease: "faint", inner: Ln(k.sideSeam(p, PLATEN_TOP - 40, P, 4), { tone: "faint" }) })];
  const xf = p.x + p.w;
  // T-slots across the face, edge to edge, and the top groove
  out.push(Ln([z0 + 70, PLATEN_TOP - 70].map((z) => line([xf, p.y + p.r, z], [xf, p.y + p.d - p.r, z])).join(""), { tone: "faint" }));
  // the face's near corner, where the slots run out
  out.push(Ln(line([xf, p.y + p.d - p.r, z0], [xf, p.y + p.d - p.r, PLATEN_TOP]), { tone: "faint" }));
  out.push(Ln(k.planOutline(k.insetPlan(p, 8), PLATEN_TOP, P, 3), { tone: "faint" }));
  out.push(Ln(pockets.map(([zA, zB]) => pocketY(p.y + p.d, [p.x + 12, p.x + p.w - 12], [zA, zB])).join(""), { tone: "lo" }));
  out.push(capScrewsTop(PLATEN_TOP, [[p.x + p.w / 2, p.y + 40], [p.x + p.w / 2, p.y + p.d - 40]], 6));
  // lifting eye on the top
  out.push(S(G.disc(0, 24, 6, up([p.x + p.w / 2, 0, PLATEN_TOP]), P), { tone: "mid" }));
  out.push(S(G.ringBand(-5, 5, 13, 22, alongY([p.x + p.w / 2, 0, PLATEN_TOP + 24 + 13]), P), { tone: "mid" }));
  out.push(extra);
  return out.join("");
}

const PLATEN_SCREWS = (z0) => [[-160, z0 + 30], [160, z0 + 30], [-160, PLATEN_TOP - 30], [160, PLATEN_TOP - 30]];

function fixedPlaten() {
  const p = FIXED_PLATEN;
  const extra = [
    capScrewsX(p.x + p.w, PLATEN_SCREWS(0), 7),
    // water manifold on the near side face
    S(slab(p.x + 10, p.x + 64, p.y + p.d, p.y + p.d + 18, 150, 390, { r: 2, bevel: 0.6 }), { tone: "mid" }),
    capScrewsY(p.y + p.d + 18, [[p.x + 37, 162], [p.x + 37, 378]], 3.4),
    Dots([210, 250, 290, 330].map((z) => at([p.x + 37, p.y + p.d + 18, z])), { size: 0.9, tone: "lo" }),
  ].join("");
  return platen(p, 0, [[30, 128], [404, 456]], extra);
}

function movingPlaten() {
  const p = MOVING_PLATEN;
  const out = [];
  // shoes on both rails
  for (const y of [-RAIL_Y, RAIL_Y]) {
    out.push(S(slab(p.x + 4, p.x + p.w - 4, y - 16, y + 16, 18, MOVING_Z, { r: 2, bevel: 0.6 }), { tone: "mid" }));
    out.push(capScrewsY(y + 16, [[p.x + 18, 30], [p.x + p.w - 18, 30]], 2.6));
  }
  // the pointer that reads the stroke off the ruler
  out.push(S(slab(p.x, p.x + 8, RAIL_Y + 16, RAIL_Y + 30, 22, 28, { r: 1, steps: 2, bevel: 0 }), { tone: "mid" }));
  out.push(Ln(line([p.x + 4, RAIL_Y + 30, 22], [p.x + 4, RAIL_Y + 30, 2]), { tone: "lit" }));
  const xf = p.x + p.w;
  const boss = alongX([xf, 0, BARREL_Z]);
  out.push(
    platen(
      p,
      MOVING_Z,
      [[84, 254], [296, 456]],
      [
        capScrewsX(xf, PLATEN_SCREWS(MOVING_Z), 7),
        // the clamp ram lands on a flanged boss
        S(G.disc(0, 18, 58, boss, P), { tone: "mid" }),
        Dots(G.dotsOf(boss, 18, 48, 8, P, { all: true }), { size: 0.5 }),
      ].join(""),
    ),
  );
  return out.join("");
}

/** The clamp ram: one rod from the platen boss into the cylinder's gland. */
function clampRod() {
  const F = towardCavity([ROD.gland, 0, BARREL_Z]);
  const tip = ROD.gland - (MOVING_PLATEN.x + MOVING_PLATEN.w + 18);
  const rod = G.rodOut(F, 0, tip, ROD.r, P, { stroke: STROKE });
  return { clip: rod.clip, svg: S(rod.paths, { tone: "hi" }) };
}

/** The clamp cylinder on its pedestal, gland facing the mold, fed by two hoses. */
function clampCylinder() {
  const F = alongX([CYL.x[0], 0, BARREL_Z]);
  const len = CYL.x[1] - CYL.x[0];
  const out = [];
  out.push(S(k.slabOf(PEDESTAL, 0, BARREL_Z - CYL.r, P, 3, 1), { tone: "mid", inner: Ln(k.sideSeam(PEDESTAL, 24, P, 3), { tone: "faint" }) }));
  out.push(S(G.disc(0, 16, CYL.r + 10, F, P), { tone: "mid" }) + Dots(G.dotsOf(F, 0, CYL.r + 5, 12, P, { all: true }), { size: 0.5 }));
  out.push(Ln(G.circleOf(F, 0, ROD.r + 3, P), { tone: "lo" }));
  out.push(S(G.disc(16, len - 16, CYL.r, F, P), { tone: "hi", inner: Ln(G.arcOf(F, 34, CYL.r, P) + G.arcOf(F, len - 34, CYL.r, P), { tone: "faint" }) }));
  out.push(S(G.disc(len / 2 - 8, len / 2 + 8, CYL.r + 3, F, P), { tone: "mid" }));
  out.push(S(G.disc(len - 16, len, CYL.r + 10, F, P), { tone: "mid" }) + Dots(G.dotsOf(F, len, CYL.r + 5, 12, P, { all: true }), { size: 0.5 }));
  // valve block on the bed and the two hoses up to the cylinder ports
  out.push(S(k.slabOf(VALVE, 0, 70, P, 3, 0.8), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(VALVE, 4), 70, P, 3), { tone: "faint" }));
  for (const [id, x, y] of [["rod", CYL.x[0] + 30, -24], ["cap", CYL.x[1] - 30, 24]]) {
    const top = BARREL_Z + Math.sqrt(CYL.r ** 2 - y ** 2);
    out.push(S(G.disc(0, 10, 9, up([x, y, top]), P), { tone: "mid" }));
    const route = G.fillet([[x, y, top + 10], [x, y, top + 46], [VALVE.x + VALVE.w / 2, y, top + 46], [VALVE.x + VALVE.w / 2, y, 78]], 26, 10, { P, tube: 6 });
    out.push(tubePieces(route, 6, P, { maxLength: 400 }).map((piece) => tubeSvg(piece, { tone: "hi" })).join(""));
    out.push(S(G.disc(0, 8, 9, up([VALVE.x + VALVE.w / 2, y, 70]), P), { tone: "mid" }));
    flowOf(id, "oil", route); // forward: out of the cylinder, back to the valve
  }
  return out.join("");
}

/* -------------------------------------------------------------- hot half */

// Cooling water: in at the lower fitting, out at the upper one, each hosed
// across to a port on the manifold on the fixed platen's near face.
const WATER_X = -44;
function waterHoses() {
  const out = [];
  const manifold = FIXED_PLATEN.x + 64;
  const lane = FIXED_PLATEN.y + FIXED_PLATEN.d + 9;
  for (const [id, z] of [["water-in", 210], ["water-out", 330]]) {
    out.push(S(G.disc(0, 6, 7.5, alongX([manifold, lane, z]), P), { tone: "mid" }));
    const route = G.fillet([[WATER_X, MOLD_Y + 17, z], [WATER_X, lane, z], [manifold + 6, lane, z]], 14, 8, { P, tube: 4.5 });
    out.push(tubePieces(route, 4.5, P, { maxLength: 400 }).map((piece) => tubeSvg(piece, { tone: "hi" })).join(""));
    // forward runs from the plate to the manifold; water comes in the other way on the lower hose
    flowOf(id, "water", id === "water-in" ? [...route].reverse() : route);
  }
  return out.join("");
}

function hotHalf() {
  const out = [];
  out.push(moldPlate(PLATES.hotClamp, CLAMP_Y, CLAMP_Z, { tone: "mid", inset: 12 }));
  // manifold plate with the hot runner connector box on top
  out.push(moldPlate(PLATES.manifold, MOLD_Y, MOLD_Z, { inset: 16 }));
  const box = plan(-150, -98, -70, 52, 2);
  out.push(S(k.slabOf(box, MOLD_Z[1], 44, P, 3, 0.8), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(box, 4), MOLD_Z[1] + 44, P, 3), { tone: "faint" }));
  out.push(capScrewsTop(MOLD_Z[1] + 44, k.corners(box, 7), 2.2));
  for (const y of [-40, 12]) {
    const F = up([-124, y, MOLD_Z[1] + 44]);
    out.push(S(G.disc(0, 14, 11, F, P), { tone: "mid" }) + S(G.disc(14, 20, 8, F, P), { tone: "mid" }));
  }
  // cavity plate: parting face with eight cavity bores and their neck ring
  // tapers, and the leader pin bushings
  const face = [];
  for (const { y, z } of CAVITIES) {
    const F = alongX([NECK_FACE, y, z]);
    face.push(`<path class="mf-void" d="${G.circleOf(F, 0, PF.bodyR + 0.4, P, 40)}"/>`);
    face.push(Ln(G.circleOf(F, 0, PF.ringR + 3, P, 48) + G.circleOf(F, 0, PF.ringR + 7, P, 48), { tone: "lo" }));
  }
  for (const y of [-PIN.y, PIN.y])
    for (const z of PIN.z) {
      const F = alongX([NECK_FACE, y, z]);
      face.push(`<path class="mf-void" d="${G.circleOf(F, 0, PIN.r + 0.3, P, 40)}"/>`);
      face.push(Ln(G.circleOf(F, 0, PIN.r + 6, P, 40), { tone: "lo" }));
    }
  // water in and out on the near side, one pair between each two rows
  const fittings = [];
  for (const z of [210, 330]) fittings.push(fittingY([WATER_X, MOLD_Y, z]));
  // nameplate: the drawing's one engraved label
  const tag = plan(-78, -8, MOLD_Y, MOLD_Y + 1.2, 1);
  const nameplate = [
    S(k.slabOf(tag, 384, 36, P, 2, 0), { tone: "lo", crease: "none" }),
    k.faceTextSvg(k.sideMatrix([-72, MOLD_Y + 1.2], 405, P, "left"), "LIHE · PCO 1881", { size: 7, tone: "mid" }),
    Ln(line([-72, MOLD_Y + 1.2, 412], [-30, MOLD_Y + 1.2, 412]), { tone: "lo", free: true }),
    Dots([[-74, 416], [-12, 416], [-74, 388], [-12, 388]].map(([x, z]) => at([x, MOLD_Y + 1.2, z])), { size: 0.4 }),
  ];
  out.push(moldPlate(PLATES.cavity, MOLD_Y, MOLD_Z, { inset: 13, extra: face.join("") + fittings.join("") + nameplate.join("") }));
  return out.join("");
}

/* ------------------------------------------------------------- cold half */

// Everything on the cold half is drawn closed; the page moves it.

/** The clip that hides a part inside the cavity plate: only x >= 0 shows. */
function clipFromFace(y, z, r, id) {
  const ring = (x, radius) => Array.from({ length: 56 }, (_, i) => at([x, y + radius * Math.cos((i / 56) * Math.PI * 2), z + radius * Math.sin((i / 56) * Math.PI * 2)]));
  const hull = G.hullOf([...ring(NECK_FACE, r), ...ring(NECK_FACE + 26, r + 12), ...ring(NECK_FACE + STROKE + 160, r + 12)]);
  return `<clipPath id="${id}"><path d="${k.pathOf(hull, true)}"/></clipPath>`;
}

function leaderPin(y, z) {
  const F = towardCavity([PLATES.stripper[0], y, z]);
  const profile = [[0, PIN.r], [PIN.length - 12, PIN.r], [PIN.length - 4, PIN.r - 4, 1], [PIN.length, PIN.r - 9]];
  return S(G.solidOf(profile, F, P), { tone: "mid", inner: Ln(G.arcOf(F, PIN.length - 40, PIN.r, P), { tone: "faint" }) });
}

function core({ y, z }) {
  const F = towardCavity([NECK_BAR.x[1], y, z]);
  const reach = NECK_BAR.x[1] - CORE_TIP_X;
  const dome = Array.from({ length: 7 }, (_, i) => {
    const a = ((i + 1) / 7) * (Math.PI / 2);
    return [reach - 8.4 + 8.4 * Math.sin(a), 8.4 * Math.cos(a), i < 6 ? 1 : 0];
  });
  const neck = NECK_BAR.x[1] - MOUTH_X;
  return S(G.solidOf([[0, 10.6], [neck + 2, 10.6], [neck + 12, 8.9, 1], [reach - 8.4, 8.4, 1], ...dome], F, P), {
    tone: "mid",
    inner: Ln(G.arcOf(F, neck + 30, 8.9, P), { tone: "faint" }),
  });
}

/** One preform, built on its core with the mold closed. */
function preform({ y, z }) {
  const F = towardCavity([MOUTH_X, y, z]);
  const [ringA, ringB] = PF.ringS;
  const dome = Array.from({ length: 9 }, (_, i) => {
    const a = ((i + 1) / 9) * (Math.PI / 2);
    return [PF.length - PF.tipR + PF.tipR * Math.sin(a), PF.tipR * Math.cos(a), i < 8 ? 1 : 0];
  });
  const body = [[ringB, PF.neckR], [ringB + 4, PF.bodyR + 0.4, 1], [ringB + 9, PF.bodyR, 1], [PF.length - PF.tipR, PF.tipR], ...dome];
  const neck = [[0, PF.threadR - 0.8], [1.2, PF.threadR], [16.4, PF.threadR], [16.4, PF.neckR], [ringA, PF.neckR]];
  const pet = { tone: "hi", lit: true, className: "mf-pet" };
  const crests = [3.5, 7.8, 12.1].map((s) => G.arcOf(F, s, PF.threadR, P)).join("");
  return [
    S(G.solidOf(body, F, P, { smooth: { rows: 3 } }), { ...pet, inner: Ln(G.arcOf(F, 52, PF.bodyR - 0.3, P), { tone: "faint" }) }),
    S(G.disc(ringA, ringB, PF.ringR, F, P), pet),
    S(G.solidOf(neck, F, P), { ...pet, inner: Ln(crests, { tone: "lo" }) }),
    // the mouth: sealing surface round the bore
    `<path class="mf-void" d="${G.circleOf(F, 0, PF.boreR, P, 40)}"/>`,
    Ln(G.circleOf(F, 0, PF.boreR, P, 40), { tone: "lit" }),
  ].join("");
}

/**
 * A neck ring slide: one bar per half per column, running up the press. The
 * half nearer the viewer's side of each pair shows the half-bores on its face.
 */
function neckBar(y, side) {
  const [x0, x1] = NECK_BAR.x;
  const [z0, z1] = NECK_BAR.z;
  const [y0, y1] = side < 0 ? [y - NECK_BAR.half, y] : [y, y + NECK_BAR.half];
  const out = [S(slab(x0, x1, y0, y1, z0, z1, { r: 1.5, steps: 2, bevel: 0.6 }), { tone: "hi", crease: "lo" })];
  if (side < 0) {
    // the half-bore: thread and support ring grooves on the parting face
    const grooves = ROWS.flatMap((z) => [z - PF.ringR, z - PF.threadR, z + PF.threadR, z + PF.ringR].map((zz) => line([x0, y1, zz], [x1, y1, zz])));
    out.push(Ln(grooves.join(""), { tone: "lo" }));
  } else {
    out.push(capScrewsY(y1, ROWS.map((z) => [(x0 + x1) / 2, z]), 2.8));
  }
  out.push(capScrewsTop(z1, [[(x0 + x1) / 2, (y0 + y1) / 2]], 2.4));
  return out.join("");
}

/** The cam rail across the top of the slides: it drives them apart. */
function camRail() {
  const [x0, x1] = CAM.x;
  const out = [S(slab(x0, x1, -CAM.y, CAM.y, ...CAM.z, { r: 1.5, steps: 2, bevel: 0.6 }), { tone: "mid" })];
  // the angled cam tracks, edge to edge across the rail's top
  const tracks = COLUMNS.flatMap((y) => [-1, 1].map((side) => k.lineOnTop([x0, y + side * 6], [x1, y + side * (6 + SPLIT)], CAM.z[1], P)));
  out.push(Ln(tracks.join(""), { tone: "lo" }));
  out.push(capScrewsY(CAM.y, [[(x0 + x1) / 2, (CAM.z[0] + CAM.z[1]) / 2]], 2.4));
  return out.join("");
}

function stripperPlate() {
  return moldPlate(PLATES.stripper, MOLD_Y, MOLD_Z, { inset: 12 });
}

function corePlates() {
  const fittings = [210, 330].map((z) => fittingY([88, MOLD_Y, z])).join("");
  return moldPlate(PLATES.core, MOLD_Y, MOLD_Z, { inset: 14, extra: fittings }) + moldPlate(PLATES.coreClamp, CLAMP_Y, CLAMP_Z, { tone: "mid", inset: 12 });
}

/* --------------------------------------------------------------- compose */

const defs = [];
const layers = [];
const push = (svg, attrs = null) => layers.push(attrs ? g(attrs, svg) : svg);

push(feet());
push(bedBack());
push(injectionUnit());
push(fixedPlaten());
push(rail(-RAIL_Y));
push(hotHalf());
push(waterHoses());
push("", { "data-flows": "water" });

const pins = [];
for (const y of [-PIN.y, PIN.y])
  for (const z of PIN.z) {
    const id = `mf-pin-${y > 0 ? "n" : "f"}${z}`;
    defs.push(clipFromFace(y, z, PIN.r + 0.3, id));
    pins.push({ y, z, svg: g({ "clip-path": `url(#${id})` }, g({ "data-m": "open" }, leaderPin(y, z))) });
  }
pins.filter((p) => p.y < 0).sort(byDepth).forEach((p) => push(p.svg));

// The gap, column by column from the back: the cores with their preforms, the
// slide half on the far side, the preforms of this column once they fall
// (in front of the cores, which are past their mouths, and between the two
// halves they drop through), then the slide half on the near side.
for (const y of COLUMNS) {
  const column = CAVITIES.map((c, i) => ({ ...c, i })).filter((c) => c.y === y).sort(byDepth);
  for (const c of column) {
    const id = `mf-cav-${c.i}`;
    defs.push(clipFromFace(c.y, c.z, PF.bodyR + 0.4, id));
    push(g({ "clip-path": `url(#${id})` }, g({ "data-m": "open" }, core(c)) + g({ "data-slot": c.i }, g({ "data-pf": c.i }, preform(c)))));
  }
  push(neckBar(y, -1), { "data-m": "neck-a" });
  push("", { "data-fall": y });
  push(neckBar(y, 1), { "data-m": "neck-b" });
}
push(camRail(), { "data-m": "strip" });
push(bedFront());
push(rail(RAIL_Y));
pins.filter((p) => p.y > 0).sort(byDepth).forEach((p) => push(p.svg));
push(stripperPlate(), { "data-m": "strip" });
push(corePlates(), { "data-m": "open" });
push(movingPlaten(), { "data-m": "open" });
const rod = clampRod();
defs.push(`<clipPath id="mf-rod"><path d="${rod.clip}"/></clipPath>`);
push(g({ "clip-path": "url(#mf-rod)" }, g({ "data-m": "open" }, rod.svg)));
push(clampCylinder());
push("", { "data-flows": "oil" });

const LABEL =
  "Isometric drawing of an eight-cavity PET preform injection mold on a two-platen press. The hot half, with its hot runner manifold and cavity plate, is bolted to the fixed platen beside the injection barrel and hopper. The cold half, with eight cores, a stripper plate and split neck ring slides, rides the moving platen on two rails, driven by the clamp cylinder. Each cycle the mold closes and is filled and cooled, then opens; the neck rings strip the preforms off the cores, open, and drop them through the chute in the bed.";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg mf-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${LABEL}"><defs>${defs.join("")}</defs>${layers.join("")}</svg>`;

// Each preform falls from its axis height until it is below the near bed strip.
const HIDDEN_Z = -100;
const DATA = {
  width: W,
  height: H,
  ex: unitOf([1, 0, 0]),
  ey: unitOf([0, 1, 0]),
  ez: unitOf([0, 0, 1]),
  stroke: STROKE,
  strip: STRIP,
  split: SPLIT,
  cavities: CAVITIES.length,
  columns: COLUMNS,
  drops: CAVITIES.map(({ z }) => z - HIDDEN_Z),
  flows: FLOWS,
  // the middle of the mold's travel, where phones crop in
  focus: ((p) => [p[0] / W, p[1] / H])(at([(PLATES.hotClamp[0] + MOVING_PLATEN.x + STROKE) / 2, 0, 250])),
};

mkdirSync(dirname(SVG_OUT), { recursive: true });
writeFileSync(SVG_OUT, svg);
writeFileSync(join(dirname(DATA_OUT), "iso.css"), "/* Anatomy kit styles (MIT), written by scripts/hero-figure/build.mjs. */\n" + k.ISO_CSS.trim() + "\n");
writeFileSync(
  DATA_OUT,
  "// Generated by scripts/hero-figure/build.mjs. Do not edit by hand.\n" +
    `export const MOLD_FIGURE = ${JSON.stringify(DATA, null, 2)} as const;\n`,
);
console.log(
  `wrote ${SVG_OUT.replace(ROOT + "/", "")} (${(svg.length / 1024).toFixed(0)} KB) · ${layers.length} layers · strip ${STRIP} mm · preform clears the cavity face by ${PREFORM_CLEAR.toFixed(1)} mm · ${KS.toFixed(3)} px/mm`,
);

/* ---------------------------------------------------------------- preview */

if (process.argv.includes("--preview")) {
  const dir = process.argv[process.argv.indexOf("--preview") + 1];
  mkdirSync(dir, { recursive: true });
  const { readFileSync } = await import("node:fs");
  const css = readFileSync(join(ROOT, "src/components/home/HeroBanner/moldFigure.css"), "utf8");
  for (const [name, [o, s, n, f]] of Object.entries({ closed: [0, 0, 0, 0], open: [1, 0, 0, 0], stripped: [1, 1, 1, 0], falling: [1, 1, 1, 0.45] })) {
    const script = `
const D = ${JSON.stringify(DATA)};
const tr = (x, y, z) => "translate(" + (D.ex[0]*x + D.ez[0]*z).toFixed(2) + " " + (D.ex[1]*x + D.ez[1]*z + y).toFixed(2) + ")";
const set = (sel, x, z, y = 0) => document.querySelectorAll(sel).forEach((el) => el.setAttribute("transform", tr(x, y, z)));
const open = ${o} * D.stroke, strip = ${s} * D.strip, split = ${n} * D.split;
set('[data-m="open"]', open, 0);
set('[data-m="strip"]', open - strip, 0);
const ey = D.ey;
document.querySelectorAll('[data-m="neck-a"]').forEach((el, i) => el.setAttribute("transform", "translate(" + (D.ex[0]*(open-strip) - ey[0]*split).toFixed(2) + " " + (D.ex[1]*(open-strip) - ey[1]*split).toFixed(2) + ")"));
document.querySelectorAll('[data-m="neck-b"]').forEach((el, i) => el.setAttribute("transform", "translate(" + (D.ex[0]*(open-strip) + ey[0]*split).toFixed(2) + " " + (D.ex[1]*(open-strip) + ey[1]*split).toFixed(2) + ")"));
document.querySelectorAll('[data-pf]').forEach((el) => {
  el.setAttribute("transform", tr(open - strip, 0, -${f} * D.drops[+el.dataset.pf]));
  if (${f} > 0) document.querySelector('[data-fall="' + D.columns[+el.dataset.pf >= 4 ? 1 : 0] + '"]').appendChild(el);
});`;
    const html = `<!doctype html><meta charset="utf-8"><title>mold ${name}</title><style>${k.ISO_CSS}${css}</style><body class="iso" style="margin:0;background:#0b1828"><div class="iso-plate mf" style="margin:24px;max-width:1100px">${svg}</div><script>${script}</script></body>`;
    writeFileSync(join(dir, `mold-${name}.html`), html);
  }
  console.log("wrote previews to", dir);
}
