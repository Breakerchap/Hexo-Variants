const test = require("node:test");
const assert = require("node:assert/strict");

const patterns = require("../shape-pattern-helpers.js");

function shiftCells(cells, dq, dr) {
  return cells.map((cell) => ({ q: cell.q + dq, r: cell.r + dr }));
}

test("hex shape rules match translated and rotated patterns", () => {
  const rule = patterns.buildPatternRule({
    grid: "hex",
    outcome: "win",
    owner: 1,
    cells: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 2, r: -1 }
    ]
  });

  assert.ok(rule);

  const translated = [
    { q: 5, r: 2 },
    { q: 6, r: 2 },
    { q: 6, r: 1 },
    { q: 7, r: 1 }
  ];
  assert.ok(patterns.findPatternMatch(rule, translated));

  const rotated = [
    { q: 4, r: -3 },
    { q: 4, r: -2 },
    { q: 5, r: -3 },
    { q: 5, r: -2 }
  ];
  assert.ok(patterns.findPatternMatch(rule, rotated));
});

test("square shape rules match quarter turns", () => {
  const rule = patterns.buildPatternRule({
    grid: "square",
    outcome: "loss",
    owner: 0,
    cells: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: 0 },
      { q: 2, r: 1 }
    ]
  });

  assert.ok(rule);
  assert.ok(patterns.findPatternMatch(rule, [
    { q: 5, r: 5 },
    { q: 5, r: 6 },
    { q: 5, r: 7 },
    { q: 4, r: 7 }
  ]));
});

test("octagon shape rules preserve mixed octagon and diamond tiles", () => {
  const rule = patterns.buildPatternRule({
    grid: "octagon",
    cells: [
      { q: 0, r: 0 },
      { q: 1, r: 1 },
      { q: 2, r: 0 }
    ]
  });

  assert.ok(rule);
  assert.ok(patterns.findPatternMatch(rule, [
    { q: 4, r: 4 },
    { q: 3, r: 5 },
    { q: 4, r: 6 }
  ]));
});

test("triangle shape rules produce rotated variants and match translated copies", () => {
  const rule = patterns.buildPatternRule({
    grid: "triangle",
    cells: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: 0 }
    ]
  });

  assert.ok(rule);
  assert.ok(rule.variants.length >= 3);
  assert.ok(patterns.findPatternMatch(rule, shiftCells(rule.variants[1].cells, 6, 4)));
});

test("radial grids are not accepted for translated shape rules", () => {
  assert.equal(patterns.supportsGrid("radial"), false);
  assert.equal(patterns.buildPatternRule({ grid: "radial", cells: [{ q: 0, r: 0 }] }), null);
});
