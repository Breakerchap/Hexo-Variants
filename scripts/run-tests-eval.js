const fs = require("fs");
const vm = require("vm");
const assert = require("assert/strict");
const path = require("path");

function assertHexEqual(actual, expected, message) {
  assert.equal(actual.q, expected.q, `${message} (q)`);
  assert.equal(actual.r, expected.r, `${message} (r)`);
}

function loadUmdModule(filePath, globalName) {
  const code = fs.readFileSync(filePath, "utf8");
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
    Boolean
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;

  vm.runInNewContext(code, sandbox, { filename: filePath });

  const mod = sandbox[globalName];
  if (!mod) {
    throw new Error(`Could not load ${globalName} from ${filePath}`);
  }
  return mod;
}

function loadCommonJsModule(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require: (id) => {
      if (id === "path") {
        return path;
      }
      throw new Error(`Unsupported module request in test sandbox: ${id}`);
    },
    __dirname: process.cwd(),
    __filename: filePath
  };
  vm.runInNewContext(code, sandbox, { filename: filePath });
  return module.exports;
}

function runPerfTests(perf) {
  const dirs = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
  ];

  function keyOf(q, r) {
    return `${q},${r}`;
  }

  function addHex(a, b) {
    return { q: a.q + b.q, r: a.r + b.r };
  }

  function scaleHex(a, n) {
    return { q: a.q * n, r: a.r * n };
  }

  function equalHex(a, b) {
    return a.q === b.q && a.r === b.r;
  }

  function hexDistance(a, b = { q: 0, r: 0 }) {
    const dq = a.q - b.q;
    const dr = a.r - b.r;
    const ds = -a.q - a.r - (-b.q - b.r);
    return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
  }

  const orbitRingCache = new Map();

  function getOrbitRingLegacy(radius) {
    if (orbitRingCache.has(radius)) {
      return orbitRingCache.get(radius);
    }

    const ring = [];
    if (radius <= 0) {
      orbitRingCache.set(radius, ring);
      return ring;
    }

    let hex = scaleHex(dirs[4], radius);
    for (let side = 0; side < 6; side += 1) {
      for (let step = 0; step < radius; step += 1) {
        ring.push({ ...hex });
        hex = addHex(hex, dirs[side]);
      }
    }

    orbitRingCache.set(radius, ring);
    return ring;
  }

  function orbitStepLegacy(hex) {
    const radius = hexDistance(hex);
    if (radius === 0) {
      return { ...hex };
    }

    const ring = getOrbitRingLegacy(radius);
    const index = ring.findIndex((candidate) => equalHex(candidate, hex));
    if (index === -1) {
      return { ...hex };
    }

    return { ...ring[(index + 1) % ring.length] };
  }

  for (let radius = 0; radius <= 10; radius += 1) {
    const ring = radius === 0 ? [{ q: 0, r: 0 }] : getOrbitRingLegacy(radius);

    for (const hex of ring) {
      const fast = perf.orbitStepFast(hex);
      const legacy = orbitStepLegacy(hex);
      assertHexEqual(fast, legacy, `orbitStepFast mismatch for ${keyOf(hex.q, hex.r)}`);
      assert.equal(hexDistance(fast), hexDistance(hex));
    }
  }

  for (let radius = 1; radius <= 8; radius += 1) {
    const ring = getOrbitRingLegacy(radius);
    let current = { ...ring[0] };

    for (let i = 0; i < ring.length; i += 1) {
      current = perf.orbitStepFast(current);
    }

    assertHexEqual(current, ring[0], `orbit cycle should return to start for radius ${radius}`);
  }

  const width = 1440;
  const height = 900;
  const hexSize = 9.24;
  const bounds = perf.getVisibleAxialBounds({
    width,
    height,
    hexSize,
    offsetX: width / 2,
    offsetY: height / 2,
    marginHexes: 2
  });
  assert.ok(bounds.minQ <= bounds.maxQ);
  assert.ok(bounds.minR <= bounds.maxR);

  const newCandidates = (bounds.maxQ - bounds.minQ + 1) * (bounds.maxR - bounds.minR + 1);
  const legacyRadius = Math.ceil(Math.max(width, height) / hexSize) + 6;
  const legacyCandidates = (legacyRadius * 2 + 1) ** 2;
  assert.ok(newCandidates < legacyCandidates);

  assert.equal(JSON.stringify(perf.getNewestTwoSerials({})), JSON.stringify([]));
  assert.equal(JSON.stringify(perf.getNewestTwoSerials({ a: { serial: 9 } })), JSON.stringify([9]));
  assert.equal(
    JSON.stringify(perf.getNewestTwoSerials({ a: { serial: 17 }, b: { serial: 4 }, c: { serial: 52 }, d: { serial: 30 } })),
    JSON.stringify([52, 30])
  );
}

function runTimerTests(timer) {
  const config = timer.normaliseTimerConfig({
    enabled: 1,
    initialSeconds: 999999,
    incrementSeconds: -4
  });
  assert.equal(
    JSON.stringify(config),
    JSON.stringify({
      enabled: true,
      initialSeconds: 10800,
      initialMinutes: 180,
      initialSecondsPart: 0,
      incrementSeconds: 0
    })
  );

  const legacyConfig = timer.normaliseTimerConfig({
    enabled: true,
    initialMinutes: 2.5,
    incrementSeconds: 3
  });
  assert.equal(
    JSON.stringify(legacyConfig),
    JSON.stringify({
      enabled: true,
      initialSeconds: 150,
      initialMinutes: 2,
      initialSecondsPart: 30,
      incrementSeconds: 3
    })
  );

  const state = timer.createClockState({
    enabled: true,
    initialSeconds: 190,
    incrementSeconds: 2
  });
  assert.equal(state.enabled, true);
  assert.equal(state.initialSeconds, 190);
  assert.equal(state.remaining[1], 190);
  assert.equal(state.remaining[2], 190);
  assert.equal(state.activePlayer, 1);
  assert.equal(state.incrementSeconds, 2);

  const clock = timer.createClockState({
    enabled: true,
    initialMinutes: 1,
    incrementSeconds: 2
  });
  const first = timer.applyElapsed(clock, 9.25);
  assert.equal(first.expiredPlayer, 0);
  assert.equal(Math.floor(clock.remaining[1]), 50);

  timer.switchTurnWithIncrement(clock, 2);
  assert.equal(clock.activePlayer, 2);
  assert.equal(Math.floor(clock.remaining[1]), 52);

  const second = timer.applyElapsed(clock, 60);
  assert.equal(second.expiredPlayer, 2);
  assert.equal(clock.flaggedPlayer, 2);
  assert.equal(clock.remaining[2], 0);

  const fourPlayerClock = timer.createClockState({
    enabled: true,
    initialSeconds: 30,
    incrementSeconds: 1
  }, 4);
  assert.equal(fourPlayerClock.remaining[3], 30);
  assert.equal(fourPlayerClock.remaining[4], 30);
  timer.switchTurnWithIncrement(fourPlayerClock, 4);
  assert.equal(fourPlayerClock.activePlayer, 4);
  timer.applyElapsed(fourPlayerClock, 5);
  assert.equal(fourPlayerClock.remaining[4], 25);

  assert.equal(timer.formatClock(0), "00:00");
  assert.equal(timer.formatClock(65.9), "01:05");
  assert.equal(timer.formatClock(599), "09:59");
}

function runServerPathTests(serverPathUtils) {
  const rootA = path.resolve(process.cwd(), "public");
  const rootB = path.resolve(process.cwd(), "www");

  assert.equal(
    serverPathUtils.safeJoinWithinRoot(rootA, "/assets/app.js?cache=1"),
    path.join(rootA, "assets", "app.js")
  );
  assert.equal(serverPathUtils.safeJoinWithinRoot(rootA, "/../secrets.txt"), null);
  assert.equal(serverPathUtils.safeJoinWithinRoot(rootA, "/..\\secrets.txt"), null);
  assert.equal(serverPathUtils.safeJoinWithinRoot(rootA, "/%2e%2e/%2e%2e/windows/system.ini"), null);
  assert.equal(serverPathUtils.safeJoinWithinRoot(rootA, "/assets/%E0%A4%A.txt"), null);
  assert.equal(serverPathUtils.safeJoinWithinRoot(rootB, "/../www-archive/index.html"), null);
}

const perf = loadUmdModule("perf-helpers.js", "HexTicTacToePerf");
const timer = loadUmdModule("timer-helpers.js", "HexTicTacToeTimer");
const serverPathUtils = loadCommonJsModule("server-path-utils.js");

runPerfTests(perf);
runTimerTests(timer);
runServerPathTests(serverPathUtils);

console.log("All helper and server path tests passed.");
