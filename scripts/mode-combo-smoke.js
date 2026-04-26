const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert/strict");
const PROJECT_ROOT = fs.existsSync(path.resolve(process.cwd(), "game.js"))
  ? process.cwd()
  : path.resolve(__dirname, "..");
const GRID_MODE_KEYS = ["triangleGrid", "squareGrid", "octagonGrid"];
const NEW_MODE_KEYS = ["entropyCascade", "armory"];

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
      timers.delete(id);
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

function buildAnchorCandidateHexes(state, reverse = false) {
  const recentStoneAnchors = Object.entries(state.cells)
    .map(([key, cell]) => ({ hex: parseKey(key), serial: Number(cell?.serial) || 0 }))
    .sort((a, b) => b.serial - a.serial)
    .slice(0, 12)
    .map((entry) => entry.hex);
  const birdAnchors = ["duck", "kingDuck"]
    .map((birdKind) => state.birds?.[birdKind] || null)
    .filter(Boolean);
  const echoAnchors = ["duck", "kingDuck"]
    .map((birdKind) => state.birdEchoCopies?.[birdKind] || null)
    .filter(Boolean);
  const anchors = [...recentStoneAnchors, ...birdAnchors, ...echoAnchors];
  if (anchors.length === 0) {
    return [{ q: 0, r: 0 }];
  }

  const radius = 12;
  const byKey = new Map();
  for (const anchor of anchors) {
    for (let dq = -radius; dq <= radius; dq += 1) {
      for (let dr = -radius; dr <= radius; dr += 1) {
        const hex = { q: anchor.q + dq, r: anchor.r + dr };
        byKey.set(keyOf(hex), hex);
      }
    }
  }

  const candidates = Array.from(byKey.values());
  candidates.sort((a, b) => (
    hexDistance(a) - hexDistance(b)
      || a.q - b.q
      || a.r - b.r
  ));
  if (reverse) {
    candidates.reverse();
  }
  return candidates;
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

  if (hasEgyptian) {
    if (hasEgyptianRemoval) {
      const removal = state.egyptianRemoval;
      assert.ok(removal && (removal.owner === 1 || removal.owner === 2), "egyptian removal state owner should be valid");
      assert.ok(removal.remaining > 0, "egyptian removal remaining should be positive");
      const currentOwnerCount = removal.owner === 1 ? owner1 : owner2;
      assert.equal(currentOwnerCount - cap, removal.remaining, "overflow count should match pending egyptian removals");
      if (state.lastPlacement) {
        assert.equal(
          sandbox.canSelectEgyptianRemovalHex(state, state.lastPlacement),
          false,
          "just-placed stone must not be selectable during egyptian removal"
        );
      }
    } else {
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

  if (state.modeKeys.includes("armory")) {
    assert.ok(state.armory && typeof state.armory === "object", "armory mode should create armory state");
    for (const owner of [1, 2]) {
      const wallet = state.armory.currencies?.[owner];
      assert.ok(wallet && wallet.gold >= 0 && wallet.arcana >= 0, `armory wallet for player ${owner} should be valid`);
      const selected = String(state.armory.selectedPiece?.[owner] || "militia");
      assert.ok(["militia", "lancer", "sage", "bastion", "assassin", "oracle", "alchemist"].includes(selected), `armory selected piece for player ${owner} should be known`);
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

  const candidateRadius = modeKeys.includes("entropyCascade") ? 34 : 14;
  const candidateHexes = buildCandidateHexes(candidateRadius, reverse);
  const maxActions = modeKeys.includes("armory")
    ? (modeKeys.includes("entropyCascade") ? 22 : 30)
    : (modeKeys.includes("entropyCascade") ? 72 : 100);

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

    let legalHex = pickLegalPlacement(sandbox, state, candidateHexes);
    if (!legalHex) {
      const anchorCandidates = buildAnchorCandidateHexes(state, reverse);
      legalHex = pickLegalPlacement(sandbox, state, anchorCandidates);
    }
    assert.ok(legalHex, `expected at least one legal placement (modes: ${modeKeys.join(",") || "classic"}, step: ${step})`);
    sandbox.clickPlacement(legalHex);
  }
  assertStateInvariants(sandbox, sandbox.HexTicTacToeInternals.game.state);
}

function allModeCombos(modeKeys, options = {}) {
  const newOnly = options.newOnly !== false;
  const gridModes = new Set(GRID_MODE_KEYS);
  const requestedNewModes = new Set(NEW_MODE_KEYS);
  const gridKeys = modeKeys.filter((modeKey) => gridModes.has(modeKey));
  const otherKeys = modeKeys.filter((modeKey) => !gridModes.has(modeKey));
  const availableNewModes = modeKeys.filter((modeKey) => requestedNewModes.has(modeKey));

  if (newOnly) {
    const combos = [];
    const seen = new Set();
    const addCombo = (combo) => {
      const dedupeKey = combo.slice().sort().join("|");
      if (seen.has(dedupeKey)) {
        return;
      }
      seen.add(dedupeKey);
      combos.push(combo);
    };

    for (const newMode of availableNewModes) {
      const newModeIsGrid = gridModes.has(newMode);
      const nonGridOthers = otherKeys.filter((modeKey) => modeKey !== newMode);
      const gridOthers = gridKeys.filter((modeKey) => modeKey !== newMode);
      const allNonGrid = [newMode, ...nonGridOthers].filter((modeKey, idx, arr) => arr.indexOf(modeKey) === idx);

      addCombo([newMode]);
      for (const other of [...nonGridOthers, ...gridOthers]) {
        addCombo(gridModes.has(other) ? [other, newMode] : [newMode, other]);
      }

      if (newModeIsGrid) {
        for (const other of nonGridOthers) {
          addCombo([newMode, other]);
        }
        if (nonGridOthers.length > 0) {
          addCombo([newMode, ...nonGridOthers]);
        }
      } else {
        for (const gridMode of gridKeys) {
          addCombo([gridMode, newMode]);
          for (const other of nonGridOthers) {
            addCombo([gridMode, newMode, other]);
          }
          if (nonGridOthers.length > 0) {
            addCombo([gridMode, newMode, ...nonGridOthers]);
          }
        }
        if (nonGridOthers.length > 0) {
          addCombo(allNonGrid);
        }
      }
    }

    return combos;
  }

  const combos = [];
  const totalOther = 1 << otherKeys.length;
  for (let mask = 0; mask < totalOther; mask += 1) {
    const base = [];
    for (let i = 0; i < otherKeys.length; i += 1) {
      if (mask & (1 << i)) {
        base.push(otherKeys[i]);
      }
    }

    const gridVariants = [null, ...gridKeys];
    for (const gridKey of gridVariants) {
      const combo = gridKey ? [gridKey, ...base] : base.slice();
      if (newOnly) {
        const includesNewMode = combo.some((modeKey) => requestedNewModes.has(modeKey));
        if (!includesNewMode) {
          continue;
        }
      }
      combos.push(combo);
    }
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

function runDiamondWinDirectionChecks(context) {
  const makeState = context.HexTicTacToeInternals.makeInitialState;
  assert.equal(typeof makeState, "function", "expected makeInitialState helper");
  assert.equal(typeof context.auditWholeBoardForWinner, "function", "expected auditWholeBoardForWinner helper");

  function buildDiamondStateFromLine(lineHexes) {
    const state = makeState(["diamondGrid"], { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, 12);
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
    { name: "horizontal hex rows", axis: { q: 2, r: 0 } },
    { name: "vertical hex rows", axis: { q: 0, r: 2 } },
    { name: "diagonal alternating", axis: { q: 1, r: 1 } },
    { name: "anti-diagonal alternating", axis: { q: 1, r: -1 } }
  ];

  for (const dir of directions) {
    const line = buildLineHexes(dir.axis, 6);
    assert.equal(new Set(line.map((hex) => keyOf(hex))).size, line.length, `line should not self-overlap for diamond ${dir.name}`);
    const state = buildDiamondStateFromLine(line);
    const winner = context.auditWholeBoardForWinner(state);
    assert.equal(winner, 1, `diamond winner should resolve for ${dir.name}`);

    const almost = line.slice(0, 5);
    const almostState = buildDiamondStateFromLine(almost);
    const almostWinner = context.auditWholeBoardForWinner(almostState);
    assert.equal(almostWinner, 0, `diamond winner should not trigger early for ${dir.name}`);
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

function runEntropyCascadeChecks(context) {
  const makeState = context.HexTicTacToeInternals.makeInitialState;
  assert.equal(typeof makeState, "function", "expected makeInitialState helper");
  assert.equal(typeof context.resolveEntropyCascade, "function", "expected resolveEntropyCascade helper");
  assert.equal(typeof context.hasEgyptianRemovalPhase, "function", "expected hasEgyptianRemovalPhase helper");

  function seedState(modeKeys, cap = 12) {
    const state = makeState(modeKeys, { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, cap);
    const seeds = [
      { q: 0, r: 0, owner: 1 },
      { q: 1, r: 0, owner: 1 },
      { q: 0, r: 1, owner: 1 },
      { q: -1, r: 1, owner: 1 },
      { q: 1, r: -1, owner: 1 },
      { q: 2, r: -1, owner: 1 },
      { q: -2, r: 1, owner: 1 },
      { q: -1, r: 0, owner: 2 },
      { q: 0, r: -1, owner: 2 },
      { q: -2, r: 0, owner: 2 },
      { q: 2, r: 0, owner: 2 },
      { q: -1, r: 2, owner: 2 },
      { q: 1, r: -2, owner: 2 },
      { q: 2, r: -2, owner: 2 }
    ];
    let serial = 0;
    for (const seed of seeds) {
      serial += 1;
      state.cells[keyOf(seed)] = {
        owner: seed.owner,
        kind: "stone",
        serial
      };
    }
    state.moveSerial = serial;
    state.turnCount = 9;
    state.round = 10;
    state.lastPlacement = { q: 2, r: -2 };
    state.lastPlacedByPlayer = {
      1: { q: 2, r: -1 },
      2: { q: -1, r: 2 }
    };
    return state;
  }

  const baseState = seedState(["entropyCascade"]);
  const copyA = JSON.parse(JSON.stringify(baseState));
  const copyB = JSON.parse(JSON.stringify(baseState));
  context.resolveEntropyCascade(copyA);
  context.resolveEntropyCascade(copyB);

  assert.equal(
    stateFingerprint(copyA),
    stateFingerprint(copyB),
    "entropy cascade should resolve deterministically from the same state"
  );
  assert.notEqual(
    stateFingerprint(copyA),
    stateFingerprint(baseState),
    "entropy cascade should mutate a mixed board state"
  );
  assertStateInvariants(context, copyA);
  assert.ok(
    Array.isArray(copyA.accountingEvents) && copyA.accountingEvents.some((line) => String(line).includes("Entropy Cascade")),
    "entropy cascade should emit an accounting event line"
  );

  const egyptianState = seedState(["entropyCascade", "egyptian"], 6);
  context.resolveEntropyCascade(egyptianState);
  assert.ok(getOwnerStoneCount(egyptianState, 1) <= 6, "entropy + egyptian should respect cap for player 1");
  assert.ok(getOwnerStoneCount(egyptianState, 2) <= 6, "entropy + egyptian should respect cap for player 2");
  assert.equal(
    context.hasEgyptianRemovalPhase(egyptianState),
    false,
    "entropy + egyptian should auto-trim overflow without entering interactive removal"
  );
  assertStateInvariants(context, egyptianState);
}

function runArmoryEconomyChecks(context) {
  assert.equal(typeof context.window.newGame, "function", "expected newGame helper");
  assert.equal(typeof context.buyArmoryOfferForCurrentPlayer, "function", "expected buyArmoryOfferForCurrentPlayer helper");
  assert.equal(typeof context.selectArmoryPieceForCurrentPlayer, "function", "expected selectArmoryPieceForCurrentPlayer helper");
  assert.equal(typeof context.rerollArmoryShopForCurrentPlayer, "function", "expected rerollArmoryShopForCurrentPlayer helper");

  context.window.newGame(["armory"], { enabled: false, initialSeconds: 300, incrementSeconds: 0 }, "p1First");
  let state = context.HexTicTacToeInternals.game.state;
  assert.ok(state.armory, "armory state should exist when armory mode is active");
  assert.ok(Array.isArray(state.armory.shopOffers[1]) && state.armory.shopOffers[1].length > 0, "armory should generate shop offers");

  let purchaseSlot = -1;
  let offeredPiece = null;
  let cost = null;
  for (let i = 0; i < state.armory.shopOffers[1].length; i += 1) {
    const candidate = state.armory.shopOffers[1][i];
    const candidateCost = context.getArmoryPieceCost(state, 1, candidate);
    if (
      state.armory.currencies[1].gold >= candidateCost.gold
      && state.armory.currencies[1].arcana >= candidateCost.arcana
    ) {
      purchaseSlot = i;
      offeredPiece = candidate;
      cost = candidateCost;
      break;
    }
  }
  assert.ok(purchaseSlot >= 0, "player 1 should afford at least one opening armory offer");

  const inventoryBeforeBuy = state.armory.inventory[1][offeredPiece] || 0;
  context.buyArmoryOfferForCurrentPlayer(purchaseSlot);
  state = context.HexTicTacToeInternals.game.state;
  const inventoryAfterBuy = state.armory.inventory[1][offeredPiece] || 0;
  assert.equal(inventoryAfterBuy, inventoryBeforeBuy + 1, "buying from armory should increase piece inventory");
  assert.equal(state.armory.selectedPiece[1], offeredPiece, "buying from armory should auto-select purchased piece");

  const selectedBeforePlacement = state.armory.selectedPiece[1];
  const selectedCountBeforePlacement = state.armory.inventory[1][selectedBeforePlacement] || 0;
  context.clickPlacement({ q: 0, r: 0 }); // opening placement
  state = context.HexTicTacToeInternals.game.state;
  const openingCell = state.cells["0,0"];
  assert.ok(openingCell, "opening armory placement should occupy origin");
  assert.equal(openingCell.pieceType, selectedBeforePlacement, "opening placement should deploy selected armory piece");
  const selectedCountAfterPlacement = state.armory.inventory[1][selectedBeforePlacement] || 0;
  assert.equal(selectedCountAfterPlacement, Math.max(0, selectedCountBeforePlacement - 1), "deploying a premium piece should consume inventory");

  // Turn should now belong to player 2; reroll should spend gold and refresh offers.
  const p2GoldBeforeReroll = state.armory.currencies[2].gold;
  const p2RerollsBefore = state.armory.rerolls[2] || 0;
  context.rerollArmoryShopForCurrentPlayer();
  state = context.HexTicTacToeInternals.game.state;
  assert.ok(state.armory.currencies[2].gold <= p2GoldBeforeReroll, "reroll should not increase gold");
  if (p2GoldBeforeReroll >= 2) {
    assert.equal(state.armory.currencies[2].gold, p2GoldBeforeReroll - 2, "reroll should cost 2 gold when affordable");
    assert.equal(state.armory.rerolls[2], p2RerollsBefore + 1, "reroll should increment reroll counter");
  }
}

function runKingDuckPanicChecks(context, modeFilter = null, availableModes = null) {
  assert.equal(typeof context.window.newGame, "function", "expected newGame helper");
  assert.equal(typeof context.clickPlacement, "function", "expected clickPlacement helper");

  const hasModeAvailable = (modeKey) => modeKey === "hex" || !availableModes || availableModes.has(modeKey);
  const include = (modeKey) => (modeFilter == null || modeFilter.has(modeKey)) && hasModeAvailable(modeKey);

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

  if (include("hex")) {
    runCase(
      ["kingDuck"],
      ["3,0", "3,-1", "2,-1", "1,0", "1,1", "2,1"],
      "hex king duck"
    );
  }

  if (include("triangleGrid")) {
    runCase(
      ["triangleGrid", "kingDuck"],
      ["3,0", "3,-1", "1,0"],
      "triangle king duck"
    );
  }

  if (include("squareGrid")) {
    runCase(
      ["squareGrid", "kingDuck"],
      ["3,0", "1,0", "2,1", "2,-1"],
      "square king duck"
    );
  }

  if (include("diamondGrid")) {
    runCase(
      ["diamondGrid", "kingDuck"],
      ["4,0", "3,1", "3,-1", "1,1", "1,-1"],
      "diamond king duck"
    );
  }

  if (include("octagonGrid")) {
    runCase(
      ["octagonGrid", "kingDuck"],
      ["4,0", "2,2", "2,-2", "3,1", "3,-1", "1,1", "1,-1"],
      "octagon king duck"
    );
  }

  if (include("entropyCascade")) {
    runCase(
      ["entropyCascade", "kingDuck"],
      ["3,0", "3,-1", "2,-1", "1,0", "1,1", "2,1"],
      "entropy cascade king duck"
    );
  }
}

function main() {
  const args = new Set(process.argv.slice(2));
  const runAll = args.has("--all");
  const runNewOnly = !runAll;
  const newModeKeySet = new Set(NEW_MODE_KEYS);

  const sandbox = makeSandbox();
  const context = vm.createContext(sandbox);

  loadScript(context, "perf-helpers.js");
  loadScript(context, "timer-helpers.js");
  loadScript(context, "game.js");
  loadScript(context, "turn-order-patch.js");

  const modeButtons = context.document.getElementById("modePicker").children;
  const modeKeys = modeButtons.map((button) => button.dataset.mode);
  const availableModeKeys = new Set(modeKeys);
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

  const combos = allModeCombos(modeKeys, { newOnly: runNewOnly });
  assert.ok(combos.length > 0, "expected at least one mode combo to run");
  for (const combo of combos) {
    runScenario(context, combo, false);
    runScenario(context, combo, true);
  }

  if (runAll) {
    if (availableModeKeys.has("triangleGrid")) {
      runTriangleWinDirectionChecks(context);
    }
    if (availableModeKeys.has("squareGrid")) {
      runSquareWinDirectionChecks(context);
    }
    if (availableModeKeys.has("diamondGrid")) {
      runDiamondWinDirectionChecks(context);
    }
    if (availableModeKeys.has("octagonGrid")) {
      runOctagonWinDirectionChecks(context);
    }
    if (availableModeKeys.has("entropyCascade")) {
      runEntropyCascadeChecks(context);
    }
    if (availableModeKeys.has("armory")) {
      runArmoryEconomyChecks(context);
    }
    runKingDuckPanicChecks(context, null, availableModeKeys);
  } else {
    if (newModeKeySet.has("triangleGrid")) {
      runTriangleWinDirectionChecks(context);
    }
    if (newModeKeySet.has("squareGrid")) {
      runSquareWinDirectionChecks(context);
    }
    if (newModeKeySet.has("diamondGrid")) {
      runDiamondWinDirectionChecks(context);
    }
    if (newModeKeySet.has("octagonGrid")) {
      runOctagonWinDirectionChecks(context);
    }
    if (newModeKeySet.has("entropyCascade")) {
      runEntropyCascadeChecks(context);
    }
    if (newModeKeySet.has("armory")) {
      runArmoryEconomyChecks(context);
    }
    runKingDuckPanicChecks(context, newModeKeySet, availableModeKeys);
  }

  const scopeLabel = runAll ? "all combos" : `new combos only (${NEW_MODE_KEYS.join(", ")})`;
  console.log(`Mode combo smoke tests passed (${combos.length} combos x 2 scenarios, ${scopeLabel}).`);
}

main();
