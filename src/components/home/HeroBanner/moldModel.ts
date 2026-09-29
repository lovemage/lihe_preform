/**
 * Wireframe geometry for the hero intro: a single-cavity PET closure
 * compression mold stack. Units are arbitrary; y is the mold axis.
 * Every part is a flat list of line segments [x1,y1,z1,x2,y2,z2, ...].
 */

export type MoldPart = {
  label: string;
  /** Segments in assembled position. */
  segs: Float32Array;
  /** Vertical offset in the exploded view. */
  explodeY: number;
  /** Radius and y used to anchor the callout label (assembled). */
  anchorR: number;
  anchorY: number;
  accent?: boolean;
};

type Out = number[];

const TAU = Math.PI * 2;

function circle(out: Out, r: number, y: number, n = 48, cx = 0, cz = 0) {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU;
    const a1 = ((i + 1) / n) * TAU;
    out.push(
      cx + r * Math.cos(a0), y, cz + r * Math.sin(a0),
      cx + r * Math.cos(a1), y, cz + r * Math.sin(a1),
    );
  }
}

function cylinder(out: Out, r: number, y0: number, y1: number, n = 48, verticals = 12) {
  circle(out, r, y0, n);
  circle(out, r, y1, n);
  for (let i = 0; i < verticals; i++) {
    const a = (i / verticals) * TAU;
    const x = r * Math.cos(a);
    const z = r * Math.sin(a);
    out.push(x, y0, z, x, y1, z);
  }
}

function tube(out: Out, rOuter: number, rInner: number, y0: number, y1: number, verticals = 12) {
  cylinder(out, rOuter, y0, y1, 56, verticals);
  cylinder(out, rInner, y0, y1, 40, verticals / 2);
  for (let i = 0; i < verticals; i++) {
    const a = (i / verticals) * TAU;
    const c = Math.cos(a);
    const s = Math.sin(a);
    out.push(rInner * c, y1, rInner * s, rOuter * c, y1, rOuter * s);
    out.push(rInner * c, y0, rInner * s, rOuter * c, y0, rOuter * s);
  }
}

function box(out: Out, w: number, d: number, y0: number, y1: number) {
  const x = w / 2;
  const z = d / 2;
  const corners: [number, number][] = [[-x, -z], [x, -z], [x, z], [-x, z]];
  for (let i = 0; i < 4; i++) {
    const [ax, az] = corners[i];
    const [bx, bz] = corners[(i + 1) % 4];
    out.push(ax, y0, az, bx, y0, bz);
    out.push(ax, y1, az, bx, y1, bz);
    out.push(ax, y0, az, ax, y1, az);
  }
}

function helix(out: Out, r: number, y0: number, y1: number, turns: number, perTurn = 32) {
  const n = Math.round(turns * perTurn);
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const a0 = t0 * turns * TAU;
    const a1 = t1 * turns * TAU;
    out.push(
      r * Math.cos(a0), y0 + (y1 - y0) * t0, r * Math.sin(a0),
      r * Math.cos(a1), y0 + (y1 - y0) * t1, r * Math.sin(a1),
    );
  }
}

function build(fn: (out: Out) => void) {
  const out: Out = [];
  fn(out);
  return new Float32Array(out);
}

export const MOLD_PARTS: MoldPart[] = [
  {
    label: "DIE PLATE",
    explodeY: -3.2,
    anchorR: 2.3,
    anchorY: -1.45,
    segs: build((o) => {
      box(o, 4.6, 4.6, -1.7, -1.2);
      circle(o, 1.75, -1.2, 56);
      for (const [bx, bz] of [[1.8, 1.8], [-1.8, 1.8], [1.8, -1.8], [-1.8, -1.8]]) {
        circle(o, 0.2, -1.2, 16, bx, bz);
        circle(o, 0.2, -1.7, 16, bx, bz);
      }
    }),
  },
  {
    label: "COOLING CIRCUIT",
    explodeY: -2.1,
    anchorR: 2.6,
    anchorY: -0.6,
    segs: build((o) => {
      for (const y of [-1.0, -0.6, -0.2]) circle(o, 1.42, y, 48);
      o.push(1.42, -1.0, 0, 1.42, -0.2, 0);
      o.push(-1.42, -1.0, 0, -1.42, -0.2, 0);
      for (const y of [-1.0, -0.2]) {
        o.push(1.42, y, 0, 2.6, y, 0);
        circle(o, 0.12, y, 12, 2.6, 0);
      }
    }),
  },
  {
    label: "MOLD CAVITY",
    explodeY: -0.6,
    anchorR: 1.95,
    anchorY: -0.4,
    segs: build((o) => {
      tube(o, 1.7, 1.05, -1.2, 0.05, 16);
      cylinder(o, 1.95, 0.05, 0.25, 56, 16);
      circle(o, 1.05, 0.25, 40);
    }),
  },
  {
    label: "CLOSURE · PP / HDPE",
    explodeY: 1.6,
    anchorR: 1.0,
    anchorY: -0.62,
    accent: true,
    segs: build((o) => {
      cylinder(o, 1.0, -0.95, -0.3, 48, 36);
      circle(o, 0.6, -0.3, 32);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        o.push(0.6 * Math.cos(a), -0.3, 0.6 * Math.sin(a), 1.0 * Math.cos(a), -0.3, 1.0 * Math.sin(a));
      }
      helix(o, 0.9, -0.88, -0.45, 2.5);
      circle(o, 1.03, -0.82, 48);
    }),
  },
  {
    label: "STRIPPER SLEEVE",
    explodeY: 2.2,
    anchorR: 1.1,
    anchorY: 0.6,
    segs: build((o) => {
      tube(o, 1.1, 0.9, 0.25, 0.95, 12);
    }),
  },
  {
    label: "COMPRESSION PUNCH",
    explodeY: 4.2,
    anchorR: 0.88,
    anchorY: 0.0,
    segs: build((o) => {
      cylinder(o, 0.88, -0.9, 0.55, 40, 12);
      circle(o, 0.7, -0.9, 32);
      cylinder(o, 0.45, 0.55, 2.7, 24, 6);
      cylinder(o, 0.75, 2.0, 2.2, 32, 8);
    }),
  },
  {
    label: "PUNCH HOLDER",
    explodeY: 4.6,
    anchorR: 1.7,
    anchorY: 2.87,
    segs: build((o) => {
      box(o, 3.2, 3.2, 2.7, 3.05);
      circle(o, 0.48, 3.05, 24);
      circle(o, 0.48, 2.7, 24);
    }),
  },
];

/** Simplified silhouette used for the ring of turret stations. */
export const GHOST_STATION = build((o) => {
  cylinder(o, 1.7, -1.2, 0.25, 20, 6);
  cylinder(o, 0.88, 0.25, 0.95, 16, 4);
  cylinder(o, 0.45, 0.95, 2.7, 12, 4);
  box(o, 2.4, 2.4, 2.7, 3.05);
});

/** Rotary turret rings that carry the stations. */
export const TURRET = build((o) => {
  circle(o, 3.3, -1.4, 72);
  circle(o, 4.6, -1.4, 96);
  circle(o, 5.9, -1.4, 120);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU;
    o.push(3.3 * Math.cos(a), -1.4, 3.3 * Math.sin(a), 5.9 * Math.cos(a), -1.4, 5.9 * Math.sin(a));
  }
});
