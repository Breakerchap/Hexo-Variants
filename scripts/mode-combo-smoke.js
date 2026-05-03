const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert/strict");
const PROJECT_ROOT = fs.existsSync(path.resolve(process.cwd(), "game.js"))
  ? process.cwd()
  : path.resolve(__dirname, "..");
const MAX_EGYPTIAN_REMOVALS_PER_TURN = 2;

class FakeClassList {
  constructor(initial = "") {
    this.tokens = new Set();
    this.setFromString(initial);
  }

  setFromString(value) {
    this.tokens.clear();
    String(value || "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((token) => this.tokens.add(token));
  }

  add(...tokens) {
    tokens.filter(Boolean).forEach((token) => this.tokens.add(token));
  }

  remove(...tokens) {
    tokens.filter(Boolean).forEach((token) => this.tokens.delete(token));
  }

  toggle(token, force) {
    if (force === true) {
      this.tokens.add(token);
      return true;
    }
    if (force === false) {
      this.tokens.delete(token);
      return false;
    }
    if (this.tokens.has(token)) {
      this.tokens.delete(token);
      return false;
    }
    this.tokens.add(token);
    return true;
  }

  contains(token) {
    return this.tokens.has(token);
  }

  toString() {
    return Array.from(this.tokens).join(" ");
  }
}

function createMatcher(selector) {
  if (selector === ".modeToggle") {
    return (element) => element.classList.contains("modeToggle");
  }
  if (selector === ".modeToggle.active") {
    return (element) => element.classList.contains("modeToggle") && element.classList.contains("active");
  }
  return () => false;
}

function walkDescendants(element, visit) {
  for (const child of element.children) {
    visit(child);
    walkDescendants(child, visit);
  }
}

class FakeElement {
  constructor(tagName = "div", id = "") {
    this.tagName = String(tagName).toUpperCase();
    this.id = id;
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.attributes = {};
    this.style = {};
    this.eventListeners = new Map();
    this._classList = new FakeClassList();
    this.textContent = "";
    this.innerHTML = "";
    this.value = "";
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.clientWidth = 0;
    this.clientHeight = 0;
    this.width = 0;
    this.height = 0;
  }

  get classList() {
    return this._classList;
  }

  get className() {
    return this._classList.toString();
  }

  set className(value) {
    this._classList.setFromString(value);
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "class") {
      this.className = String(value);
    }
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  addEventListener(type, handler) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type).push(handler);
  }

  querySelectorAll(selector) {
    const matcher = createMatcher(selector);
    const results = [];
    walkDescendants(this, (element) => {
      if (matcher(element)) {
        results.push(element);
      }
    });
    return results;
  }

  getBoundingClientRect() {
    const width = this.clientWidth || this.width || 0;
    const height = this.clientHeight || this.height || 0;
    return {
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height
    };
  }
}

function createFakeContext2d() {
  const noop = () => {};
  return {
    clearRect: noop,
    setTransform: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    closePath: noop,
    fill: noop,
    stroke: noop,
    arc: noop,
    fillText: noop,
    save: noop,
    restore: noop,
    setLineDash: noop
  };
}

class FakeCanvasElement extends FakeElement {
  constructor(id = "") {
    super("canvas", id);
    this.clientWidth = 140;
    this.clientHeight = 120;
    this.width = 140;
    this.height = 120;
    this._context2d = createFakeContext2d();
  }

  getContext(type) {
    if (type !== "2d") {
      return null;
    }
    return this._context2d;
  }
}

class FakeDocument {
  constructor() {
    this.elementsById = new Map();
  }

  register(element) {
    if (element.id) {
      this.elementsById.set(element.id, element);
    }
    return element;
  }

  getElementById(id) {
    return this.elementsById.get(id) || null;
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  querySelector() {
    return null;
  }
}

function makeSandbox() {
  const document = new FakeDocument();
  const ids = [
    "appRoot",
    "modePicker",
    "newGameBtn",
    "historyBackBtn",
    "historyForwardBtn",
    "centreBtn",
    "turnBig",
    "subturnText",
    "roundText",
    "movesLeftText",
    "duckPhaseText",
    "winnerText",
    "modeName",
    "modeSummary",
    "egyptianCapControls",
    "egyptianCapInput",
    "egyptianCapSummaryText",
    "log",
    "overlayTitle",
    "overlayHint",
    "coordText",
    "zoomText",
    "timerMinutesInput",
    "timerIncrementInput",
    "timerEnabledInput",
    "applyTimerBtn",
    "timerSummaryText",
    "p1ClockText",
    "p2ClockText",
    "onlineCreateBtn",
    "onlineJoinBtn",
    "onlineLeaveBtn",
    "onlineRoomInput",
    "onlineStatusText",
    "onlineRoomText",
    "onlineRoleText",
    "toggleMenuBtn",
    "turnOrderInput",
    "turnOrderSummaryText",
    "boardClockP1",
    "boardClockP2",
    "boardClockP1Time",
    "boardClockP2Time"
  ];

  for (const id of ids) {
    document.register(new FakeElement("div", id));
  }
  document.register(new FakeCanvasElement("board"));

  const appRoot = document.getElementById("appRoot");
  appRoot.className = "app";
  document.getElementById("modePicker").className = "modePickerGrid";
  document.getElementById("timerMinutesInput").value = "5";
  document.getElementById("timerIncrementInput").value = "2";
  document.getElementById("timerEnabledInput").checked = true;
  document.getElementById("egyptianCapInput").value = "12";
  document.getElementById("turnOrderInput").value = "p1First";
  document.getElementById("boardClockP1").className = "boardClock boardClockP1";
  document.getElementById("boardClockP2").className = "boardClock boardClockP2";

  let nextAnimationId = 1;
  let nextTimerId = 1;
  const timers = new Map();

  const sandbox = {
    console,
    Math,
    Date,
    Map,
    Set,
    Array,
    Object,
    Number,
    String,
    Boolean,
    JSON,
    URL,
    URLSearchParams,
    structuredClone,
    document,
    location: {
      protocol: "http:",
      host: "localhost:8080",
      href: "http://localhost:8080/index.html",
      search: ""
    },
    navigator: { userAgent: "node" },
    devicePixelRatio: 1,
    requestAnimationFrame: (callback) => {
      const id = nextAnimationId += 1;
      callback();
      return id;
    },
    cancelAnimationFrame: () => {},
    setTimeout: (callback) => {
      const id = nextTimerId += 1;
      timers.set(id, { callback, interval: false });
      callback();
      return id;
    },
    clearTimeout: (id) => {
      timers.delete(id);
    },
    setInterval: (callback) => {
      const id = nextTimerId += 1;
      timers.set(id, { callback, interval: true });
      return id;
    },
    clearInterval: (id) => {
      timers.delete(id);
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  return sandbox;
}

function loadScript(sandbox, fileName) {
  const fullPath = path.resolve(PROJECT_ROOT, fileName);
  const source = fs.readFileSync(fullPath, "utf8");
  vm.runInContext(source, sandbox, { filename: fullPath });
}

function keyOf(hex) {
  return `${hex.q},${hex.r}`;
}

function parseKey(key) {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
}

function equalHex(a, b) {
  return Boolean(a && b && a.q === b.q && a.r === b.r);
}

function hexDistance(hex) {
  const s = -hex.q - hex.r;
  return Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(s));
}

function buildCandidateHexes(radius, reverse = false) {
  const hexes = [];
  for (let q = -radius; q <= radius; q += 1) {
    for (let r = -radius; r <= radius; r += 1) {
      hexes.push({ q, r });
    }
  }
  hexes.sort((a, b) => (
    hexDistance(a) - hexDistance(b)
      || a.q - b.q
      || a.r - b.r
  ));
  if (reverse) {
    hexes.reverse();
  }
  return hexes;
}

function buildRadialCandidateHexes(maxRing, reverse = false) {
  const sectors = 12;
  const hexes = [{ q: 0, r: 0 }];
  for (let ring = 1; ring <= maxRing; ring += 1) {
    for (let sector = 0; sector < sectors; sector += 1) {
      hexes.push({ q: ring, r: sector });
    }
  }
  if (reverse) {
    hexes.reverse();
  }
  return hexes;
}

function stateFingerprint(state) {
  return JSON.stringify(state);
}

function getOwnerStoneCount(state, owner) {
  return Object.values(state.cells).filter((cell) => cell.kind === "stone" && cell.owner === owner).length;
}

function assertStateInvariants(sandbox, state) {
  assert.ok(Array.isArray(state.modeKeys), "modeKeys should be an array");
  assert.ok(!state.modeKeys.includes("greek"), "greek mode key should never survive normalisation");
  assert.ok(Number.isInteger(state.movesLeftInTurn) && state.movesLeftInTurn >= 0, "movesLeftInTurn must be a non-negative integer");

  const hasEgyptian = state.modeKeys.includes("egyptian");
  const hasEgyptianRemoval = sandbox.hasEgyptianRemovalPhase(state);
  const cap = sandbox.getEgyptianStoneCap(state);
  const owner1 = getOwnerStoneCount(state, 1);
  const owner2 = getOwnerStoneCount(state, 2);
  const removalsThisTurn = state.egyptianRemovalsThisTurn || {};

  for (const owner of [1, 2]) {
    const removalCount = Math.trunc(Number(removalsThisTurn[owner]) || 0);
    assert.ok(removalCount >= 0, "egyptian removal count should not be negative");
    assert.ok(removalCount <= MAX_EGYPTIAN_REMOVALS_PER_TURN, "egyptian removals should be capped per turn");
  }

  if (hasEgyptian) {
    if (hasEgyptianRemoval) {
      const removal = state.egyptianRemoval;
      assert.ok(removal && (removal.owner === 1 || removal.owner === 2), "egyptian removal state owner should be valid");
      assert.ok(removal.remaining > 0, "egyptian removal remaining should be positive");
      const currentOwnerCount = removal.owner === 1 ? owner1 : owner2;
      const overflow = Math.max(0, currentOwnerCount - cap);
      const alreadyRemoved = Math.trunc(Number(removalsThisTurn[removal.owner]) || 0);
      const removalSlotsRemaining = Math.max(0, MAX_EGYPTIAN_REMOVALS_PER_TURN - alreadyRemoved);
      assert.ok(removal.remaining <= overflow, "pending egyptian removals should not exceed overflow");
      assert.ok(removal.remaining <= removalSlotsRemaining, "pending egyptian removals should respect the per-turn cap");
      if (state.lastPlacement) {
        assert.equal(
          sandbox.canSelectEgyptianRemovalHex(state, state.lastPlacement),
          false,
          "just-placed stone must not be selectable during egyptian removal"
        );
      }
    } else if (!state.modeKeys.includes("echo")) {
      assert.ok(owner1 <= cap && owner2 <= cap, "stone counts should respect egyptian cap when no removal is pending");
    }
  } else {
    assert.equal(hasEgyptianRemoval, false, "egyptian removal should not run when egyptian mode is inactive");
  }

  for (const birdKind of ["duck", "kingDuck"]) {
    const birdHex = state.birds?.[birdKind];
    if (birdHex) {
      assert.equal(Boolean(state.cells[keyOf(birdHex)]), false, `${birdKind} should not overlap a stone`);
    }
    const copyHex = state.birdEchoCopies?.[birdKind];
    if (copyHex) {
      assert.equal(Boolean(state.cells[keyOf(copyHex)]), false, `${birdKind} echo copy should not overlap a stone`);
    }
  }
}

function pickLegalPlacement(sandbox, state, candidateHexes) {
  for (const hex of candidateHexes) {
    if (sandbox.isLegalPlacement(state, hex)) {
      return hex;
    }
  }
  return null;
}

function pickBirdTarget(sandbox, state, candidateHexes) {
  const action = sandbox.normaliseBirdAction(state.currentBirdMoveKind) || { birdKind: "duck" };
  const birdKind = action.birdKind;
  const currentBirdHex = state.birds[birdKind];
  for (const hex of candidateHexes) {
    if (currentBirdHex && equalHex(currentBirdHex, hex)) {
      continue;
    }
    if (sandbox.isHexOpenForBird(state, hex, birdKind)) {
      return hex;
    }
  }
  return null;
}

function pickEgyptianRemovalHex(sandbox, state, reverse = false) {
  const owner = state.egyptianRemoval.owner;
  const entries = Object.entries(state.cells)
    .map(([key, cell]) => ({ hex: parseKey(key), cell }))
    .filter((entry) => entry.cell.kind === "stone" && entry.cell.owner === owner)
    .sort((a, b) => reverse ? b.cell.serial - a.cell.serial : a.cell.serial - b.cell.serial);

  for (const entry of entries) {
    if (sandbox.canSelectEgyptianRemovalHex(state, entry.hex)) {
      return entry.hex;
    }
  }
  return null;
}

function runScenario(sandbox, modeKeys, reverse = false) {
  const timerConfig = { enabled: false, initialMinutes: 5, incrementSeconds: 0 };
  sandbox.window.newGame(modeKeys, timerConfig, "p1First");

  const capControls = sandbox.document.getElementById("egyptianCapControls");
  assert.equal(
    capControls.hidden,
    !modeKeys.includes("egyptian"),
    "egyptian n controls should only be visible when egyptian mode is selected"
  );

  const candidateHexes = modeKeys.includes("radialGrid")
    ? buildRadialCandidateHexes(44, reverse)
    : buildCandidateHexes(14, reverse);
  const maxActions = 100;

  for (let step = 0; step < maxActions; step += 1) {
    const state = sandbox.HexTicTacToeInternals.game.state;
    assertStateInvariants(sandbox, state);

    if (state.winner) {
      const before = stateFingerprint(state);
      sandbox.clickPlacement({ q: 0, r: 0 });
      assert.equal(stateFingerprint(state), before, "clicks after winner should not mutate state");
      return;
    }

    if (sandbox.hasEgyptianRemovalPhase(state)) {
      if (state.lastPlacement) {
        const beforeProtected = stateFingerprint(state);
        sandbox.clickPlacement({ ...state.lastPlacement });
        assert.equal(
          stateFingerprint(state),
          beforeProtected,
          "protected just-placed egyptian stone should not be removable"
        );
      }
      const target = pickEgyptianRemovalHex(sandbox, state, reverse);
      assert.ok(target, "expected a valid egyptian removal target");
      sandbox.clickPlacement(target);
      continue;
    }

    if (state.duckPhase) {
      const action = sandbox.normaliseBirdAction(state.currentBirdMoveKind) || { birdKind: "duck" };
      const currentBirdHex = state.birds[action.birdKind];
      if (currentBirdHex) {
        const beforeCurrent = stateFingerprint(state);
        sandbox.clickPlacement({ ...currentBirdHex });
        assert.equal(stateFingerprint(state), beforeCurrent, "bird should not be able to move onto its current hex");
      }
      const birdTarget = pickBirdTarget(sandbox, state, candidateHexes);
      assert.ok(birdTarget, "expected a legal bird move target");
      sandbox.clickPlacement(birdTarget);
      continue;
    }

    const beforeIllegal = stateFingerprint(state);
    sandbox.clickPlacement({ q: 99, r: -99 });
    assert.equal(stateFingerprint(state), beforeIllegal, "illegal far placement should not mutate state");

    const legalHex = pickLegalPlacement(sandbox, state, candidateHexes);
    assert.ok(legalHex, "expected at least one legal placement");
    sandbox.clickPlacement(legalHex);
  }
  assertStateInvariants(sandbox, sandbox.HexTicTacToeInternals.game.state);
}

function allModeCombos(modeKeys) {
  const combos = [];
  const total = 1 << modeKeys.length;
  for (let mask = 0; mask < total; mask += 1) {
    const combo = [];
    for (let i = 0; i < modeKeys.length; i += 1) {
      if (mask & (1 << i)) {
        combo.push(modeKeys[i]);
      }
    }
    combos.push(combo);
  }
  return combos;
}

function runTriangleWinDirectionChecks(context) {
  const makeState = context.HexTicTacToeInternals.makeInitialState;
  assert.equal(typeof makeState, "function", "expected makeInitialState helper");
  assert.equal(typeof context.stepTriangleLine, "function", "expected stepTriangleLine helper");
  assert.equal(typeof context.auditWholeBoardForWinner, "function", "expected auditWholeBoardForWinner helper");

  function buildTriangleStateFromLine(lineHexes) {
    const state = makeState(["triangleGrid"], { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, 12);
    let serial = 0;
    for (const hex of lineHexes) {
      serial += 1;
      state.cells[keyOf(hex)] = {
        owner: 1,
        kind: "stone",
        serial
      };
    }
    state.moveSerial = serial;
    state.lastPlacement = { ...lineHexes[lineHexes.length - 1] };
    return state;
  }

  function buildLineHexes(lineKind, length = 6, start = { q: -14, r: -11 }) {
    const line = [{ ...start }];
    let current = { ...start };
    for (let i = 1; i < length; i += 1) {
      current = context.stepTriangleLine(current, lineKind, true);
      line.push({ ...current });
    }
    return line;
  }

  const directions = [
    { name: "tip-axis A", kind: "tipA" },
    { name: "tip-axis B", kind: "tipB" },
    { name: "tip-axis C", kind: "tipC" },
    { name: "side-axis A", kind: "sideA" },
    { name: "side-axis B", kind: "sideB" },
    { name: "side-axis C", kind: "sideC" }
  ];

  for (const dir of directions) {
    const line = buildLineHexes(dir.kind, 6);
    assert.equal(new Set(line.map((hex) => keyOf(hex))).size, line.length, `line should not self-overlap for ${dir.name}`);
    const state = buildTriangleStateFromLine(line);
    const winner = context.auditWholeBoardForWinner(state);
    assert.equal(winner, 1, `triangle winner should resolve for ${dir.name}`);

    const almost = line.slice(0, 5);
    const almostState = buildTriangleStateFromLine(almost);
    const almostWinner = context.auditWholeBoardForWinner(almostState);
    assert.equal(almostWinner, 0, `triangle winner should not trigger early for ${dir.name}`);
  }
}

function runSquareWinDirectionChecks(context) {
  const makeState = context.HexTicTacToeInternals.makeInitialState;
  assert.equal(typeof makeState, "function", "expected makeInitialState helper");
  assert.equal(typeof context.auditWholeBoardForWinner, "function", "expected auditWholeBoardForWinner helper");

  function buildSquareStateFromLine(lineHexes) {
    const state = makeState(["squareGrid"], { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, 12);
    let serial = 0;
    for (const hex of lineHexes) {
      serial += 1;
      state.cells[keyOf(hex)] = {
        owner: 1,
        kind: "stone",
        serial
      };
    }
    state.moveSerial = serial;
    state.lastPlacement = { ...lineHexes[lineHexes.length - 1] };
    return state;
  }

  function buildLineHexes(axis, length = 6, start = { q: -12, r: -12 }) {
    return Array.from({ length }, (_, idx) => ({
      q: start.q + (axis.q * idx),
      r: start.r + (axis.r * idx)
    }));
  }

  const directions = [
    { name: "horizontal", axis: { q: 1, r: 0 } },
    { name: "vertical", axis: { q: 0, r: 1 } },
    { name: "diagonal down-right", axis: { q: 1, r: 1 } },
    { name: "diagonal up-right", axis: { q: 1, r: -1 } }
  ];

  for (const dir of directions) {
    const line = buildLineHexes(dir.axis, 6);
    assert.equal(new Set(line.map((hex) => keyOf(hex))).size, line.length, `line should not self-overlap for ${dir.name}`);
    const state = buildSquareStateFromLine(line);
    const winner = context.auditWholeBoardForWinner(state);
    assert.equal(winner, 1, `square winner should resolve for ${dir.name}`);

    const almost = line.slice(0, 5);
    const almostState = buildSquareStateFromLine(almost);
    const almostWinner = context.auditWholeBoardForWinner(almostState);
    assert.equal(almostWinner, 0, `square winner should not trigger early for ${dir.name}`);
  }
}

function runOctagonWinDirectionChecks(context) {
  const makeState = context.HexTicTacToeInternals.makeInitialState;
  assert.equal(typeof makeState, "function", "expected makeInitialState helper");
  assert.equal(typeof context.auditWholeBoardForWinner, "function", "expected auditWholeBoardForWinner helper");

  function buildOctagonStateFromLine(lineHexes) {
    const state = makeState(["octagonGrid"], { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, 12);
    let serial = 0;
    for (const hex of lineHexes) {
      serial += 1;
      state.cells[keyOf(hex)] = {
        owner: 1,
        kind: "stone",
        serial
      };
    }
    state.moveSerial = serial;
    state.lastPlacement = { ...lineHexes[lineHexes.length - 1] };
    return state;
  }

  function buildLineHexes(axis, length = 6, start = { q: -12, r: -12 }) {
    return Array.from({ length }, (_, idx) => ({
      q: start.q + (axis.q * idx),
      r: start.r + (axis.r * idx)
    }));
  }

  const directions = [
    { name: "horizontal octagons", axis: { q: 2, r: 0 } },
    { name: "vertical octagons", axis: { q: 0, r: 2 } },
    { name: "diagonal alternating", axis: { q: 1, r: 1 } },
    { name: "anti-diagonal alternating", axis: { q: 1, r: -1 } }
  ];

  for (const dir of directions) {
    const line = buildLineHexes(dir.axis, 6);
    assert.equal(new Set(line.map((hex) => keyOf(hex))).size, line.length, `line should not self-overlap for octagon ${dir.name}`);
    const state = buildOctagonStateFromLine(line);
    const winner = context.auditWholeBoardForWinner(state);
    assert.equal(winner, 1, `octagon winner should resolve for ${dir.name}`);

    const almost = line.slice(0, 5);
    const almostState = buildOctagonStateFromLine(almost);
    const almostWinner = context.auditWholeBoardForWinner(almostState);
    assert.equal(almostWinner, 0, `octagon winner should not trigger early for ${dir.name}`);
  }
}

function runRadialWinDirectionChecks(context) {
  const makeState = context.HexTicTacToeInternals.makeInitialState;
  assert.equal(typeof makeState, "function", "expected makeInitialState helper");
  assert.equal(typeof context.auditWholeBoardForWinner, "function", "expected auditWholeBoardForWinner helper");
  assert.equal(typeof context.getMirrorCellForMode, "function", "expected getMirrorCellForMode helper");

  function buildRadialStateFromLine(lineHexes) {
    const state = makeState(["radialGrid"], { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, 12);
    let serial = 0;
    for (const hex of lineHexes) {
      serial += 1;
      state.cells[keyOf(hex)] = {
        owner: 1,
        kind: "stone",
        serial
      };
    }
    state.moveSerial = serial;
    state.lastPlacement = { ...lineHexes[lineHexes.length - 1] };
    return state;
  }

  const directions = [
    {
      name: "spoke without centre",
      line: Array.from({ length: 6 }, (_, idx) => ({ q: idx + 2, r: 3 }))
    },
    {
      name: "spoke from centre",
      line: [{ q: 0, r: 0 }, ...Array.from({ length: 5 }, (_, idx) => ({ q: idx + 1, r: 7 }))]
    },
    {
      name: "spoke through centre",
      line: [
        { q: 2, r: 1 },
        { q: 1, r: 1 },
        { q: 0, r: 0 },
        { q: 1, r: 7 },
        { q: 2, r: 7 },
        { q: 3, r: 7 }
      ]
    },
    {
      name: "ring",
      line: Array.from({ length: 6 }, (_, idx) => ({ q: 4, r: idx + 2 }))
    },
    {
      name: "ring wrapping across sector zero",
      line: [9, 10, 11, 0, 1, 2].map((sector) => ({ q: 5, r: sector }))
    }
  ];

  for (const dir of directions) {
    assert.equal(new Set(dir.line.map((hex) => keyOf(hex))).size, dir.line.length, `line should not self-overlap for radial ${dir.name}`);
    const state = buildRadialStateFromLine(dir.line);
    const winner = context.auditWholeBoardForWinner(state);
    assert.equal(winner, 1, `radial winner should resolve for ${dir.name}`);

    const almost = dir.line.slice(0, 5);
    const almostState = buildRadialStateFromLine(almost);
    const almostWinner = context.auditWholeBoardForWinner(almostState);
    assert.equal(almostWinner, 0, `radial winner should not trigger early for ${dir.name}`);
  }

  const gappedSpokeState = buildRadialStateFromLine([
    { q: 0, r: 0 },
    { q: 3, r: 4 },
    { q: 4, r: 4 },
    { q: 5, r: 4 },
    { q: 6, r: 4 },
    { q: 7, r: 4 }
  ]);
  assert.equal(
    context.auditWholeBoardForWinner(gappedSpokeState),
    0,
    "radial spoke should not bridge a gap back to the centre"
  );

  const mirrorState = makeState(["radialGrid"], { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, 12);
  const mirrored = context.getMirrorCellForMode(mirrorState, { q: 3, r: 2 });
  assert.equal(mirrored.q, 3, "radial mirror should stay on the same ring");
  assert.equal(mirrored.r, 8, "radial mirror should flip to the opposite sector");
  const mirroredCentre = context.getMirrorCellForMode(mirrorState, { q: 0, r: 0 });
  assert.equal(mirroredCentre.q, 0, "radial centre should mirror to itself");
  assert.equal(mirroredCentre.r, 0, "radial centre should mirror to itself");
}

function runEgyptianEchoRemovalChecks(context) {
  const makeState = context.HexTicTacToeInternals.makeInitialState;
  assert.equal(typeof makeState, "function", "expected makeInitialState helper");
  assert.equal(typeof context.placeStone, "function", "expected placeStone helper");
  assert.equal(typeof context.resolveEchoes, "function", "expected resolveEchoes helper");
  assert.equal(typeof context.enforceStoneCapAfterPlacement, "function", "expected egyptian cap helper");

  const timerConfig = { enabled: false, initialSeconds: 300, incrementSeconds: 0 };
  const cappedState = makeState(["egyptian", "echo"], timerConfig, 6);
  const initialStones = [
    { q: 0, r: 0 },
    { q: 1, r: 0 },
    { q: 2, r: 0 },
    { q: 3, r: 0 },
    { q: 4, r: 0 },
    { q: 5, r: 0 }
  ];
  for (const hex of initialStones) {
    context.placeStone(cappedState, hex, 1, "stone");
  }
  const originalKeys = new Set(Object.keys(cappedState.cells));
  cappedState.pendingEchoes.push({
    targetTurn: cappedState.turnCount,
    kind: "stone",
    owner: 1,
    source: { q: 0, r: -2 }
  });

  context.resolveEchoes(cappedState);

  assert.equal(getOwnerStoneCount(cappedState, 1), 7, "echo should be allowed to put Egyptian over the cap");
  for (const key of originalKeys) {
    assert.ok(cappedState.cells[key], "echo should not auto-remove an existing stone");
  }
  assert.equal(context.hasEgyptianRemovalPhase(cappedState), false, "echo should not open an Egyptian removal prompt");

  const overflowState = makeState(["egyptian"], timerConfig, 6);
  for (let i = 0; i < 10; i += 1) {
    context.placeStone(overflowState, { q: i, r: 1 }, 1, "stone");
  }

  let resolution = context.enforceStoneCapAfterPlacement(overflowState, 1, { interactiveEgyptian: true });
  assert.equal(resolution.needsChoice, true, "large overflow should still offer a manual Egyptian removal");
  assert.equal(overflowState.egyptianRemoval.remaining, 2, "Egyptian should ask for at most two removals in a turn");

  overflowState.egyptianRemoval = null;
  overflowState.egyptianRemovalsThisTurn = { 1: 2, 2: 0 };
  resolution = context.enforceStoneCapAfterPlacement(overflowState, 1, { interactiveEgyptian: true });
  assert.equal(resolution.needsChoice, false, "Egyptian should not ask for more removals after two this turn");
  assert.equal(context.hasEgyptianRemovalPhase(overflowState), false, "Egyptian removal phase should stay closed after the turn cap");
  assert.equal(getOwnerStoneCount(overflowState, 1), 10, "turn removal cap may leave a player above n stones");
}

function runKingDuckPanicChecks(context, radialOnly = false) {
  assert.equal(typeof context.window.newGame, "function", "expected newGame helper");
  assert.equal(typeof context.clickPlacement, "function", "expected clickPlacement helper");

  function runCase(modeKeys, expectedPanicKeys, messagePrefix) {
    context.window.newGame(modeKeys, { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, "p1First");
    context.clickPlacement({ q: 0, r: 0 }); // opening stone, then bird phase starts
    context.clickPlacement({ q: 2, r: 0 }); // move king duck

    const state = context.HexTicTacToeInternals.game.state;
    assert.ok(state.birds.kingDuck, `${messagePrefix}: king duck should be placed`);
    assert.equal(state.birds.kingDuck.q, 2, `${messagePrefix}: king duck should land at target q`);
    assert.equal(state.birds.kingDuck.r, 0, `${messagePrefix}: king duck should land at target r`);

    const actualKeys = Object.keys(state.panicZones).sort();
    const expectedKeys = expectedPanicKeys.slice().sort();
    assert.deepEqual(actualKeys, expectedKeys, `${messagePrefix}: panic zones should match expected adjacency`);
  }

  if (!radialOnly) {
    runCase(
      ["kingDuck"],
      ["3,0", "3,-1", "2,-1", "1,0", "1,1", "2,1"],
      "hex king duck"
    );

    runCase(
      ["triangleGrid", "kingDuck"],
      ["3,0", "3,-1", "1,0"],
      "triangle king duck"
    );

    runCase(
      ["squareGrid", "kingDuck"],
      ["3,0", "1,0", "2,1", "2,-1"],
      "square king duck"
    );

    runCase(
      ["octagonGrid", "kingDuck"],
      ["4,0", "2,2", "2,-2", "3,1", "3,-1", "1,1", "1,-1"],
      "octagon king duck"
    );
  }

  runCase(
    ["radialGrid", "kingDuck"],
    ["3,0", "2,1", "2,11", "1,0"],
    "radial king duck"
  );
}

function main() {
  const sandbox = makeSandbox();
  const context = vm.createContext(sandbox);

  loadScript(context, "perf-helpers.js");
  loadScript(context, "timer-helpers.js");
  loadScript(context, "game.js");
  loadScript(context, "turn-order-patch.js");

  const modeButtons = context.document.getElementById("modePicker").children;
  const modeKeys = modeButtons.map((button) => button.dataset.mode);
  assert.ok(modeKeys.includes("egyptian"), "egyptian mode should exist");
  assert.equal(modeKeys.includes("greek"), false, "greek mode should not exist");

  // Legacy compatibility: old "greek" selection maps to "egyptian".
  context.window.newGame(["greek"], { enabled: false, initialMinutes: 5, incrementSeconds: 0 }, "p1First");
  assert.equal(
    JSON.stringify(Array.from(context.HexTicTacToeInternals.game.state.modeKeys)),
    JSON.stringify(["egyptian"]),
    "legacy greek key should canonicalise to egyptian"
  );
  assert.equal(context.document.getElementById("egyptianCapControls").hidden, false, "legacy greek key should still reveal n controls");

  const radialOnly = process.argv.includes("--radial-only");
  const combos = radialOnly
    ? allModeCombos(modeKeys.filter((key) => (
      key !== "radialGrid"
      && key !== "triangleGrid"
      && key !== "squareGrid"
      && key !== "octagonGrid"
    ))).map((combo) => ["radialGrid", ...combo])
    : allModeCombos(modeKeys);
  for (const combo of combos) {
    runScenario(context, combo, false);
    runScenario(context, combo, true);
  }
  if (!radialOnly) {
    runTriangleWinDirectionChecks(context);
    runSquareWinDirectionChecks(context);
    runOctagonWinDirectionChecks(context);
    runEgyptianEchoRemovalChecks(context);
  }
  runRadialWinDirectionChecks(context);
  runKingDuckPanicChecks(context, radialOnly);

  console.log(`${radialOnly ? "Radial mode" : "Mode combo"} smoke tests passed (${combos.length} combos x 2 scenarios).`);
}

main();
