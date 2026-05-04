const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const perfHelpers = window.HexTicTacToePerf || {};
const timerHelpers = window.HexTicTacToeTimer || {};

const ui = {
  appRoot: document.getElementById("appRoot"),
  modePicker: document.getElementById("modePicker"),
  newGameBtn: document.getElementById("newGameBtn"),
  historyBackBtn: document.getElementById("historyBackBtn"),
  historyForwardBtn: document.getElementById("historyForwardBtn"),
  centreBtn: document.getElementById("centreBtn"),
  turnBig: document.getElementById("turnBig"),
  subturnText: document.getElementById("subturnText"),
  roundText: document.getElementById("roundText"),
  movesLeftText: document.getElementById("movesLeftText"),
  duckPhaseText: document.getElementById("duckPhaseText"),
  winnerText: document.getElementById("winnerText"),
  modeName: document.getElementById("modeName"),
  modeSummary: document.getElementById("modeSummary"),
  egyptianCapControls: document.getElementById("egyptianCapControls"),
  egyptianCapInput: document.getElementById("egyptianCapInput"),
  egyptianCapSummaryText: document.getElementById("egyptianCapSummaryText"),
  log: document.getElementById("log"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayHint: document.getElementById("overlayHint"),
  coordText: document.getElementById("coordText"),
  zoomText: document.getElementById("zoomText"),
  meteorTimerBadge: document.getElementById("meteorTimerBadge"),
  timerMinutesInput: document.getElementById("timerMinutesInput"),
  timerSecondsInput: document.getElementById("timerSecondsInput"),
  timerIncrementInput: document.getElementById("timerIncrementInput"),
  timerEnabledInput: document.getElementById("timerEnabledInput"),
  applyTimerBtn: document.getElementById("applyTimerBtn"),
  timerSummaryText: document.getElementById("timerSummaryText"),
  turnOrderInput: document.getElementById("turnOrderInput"),
  turnOrderSummaryText: document.getElementById("turnOrderSummaryText"),
  p1ClockText: document.getElementById("p1ClockText"),
  p2ClockText: document.getElementById("p2ClockText"),
  p3ClockText: document.getElementById("p3ClockText"),
  p4ClockText: document.getElementById("p4ClockText"),
  p3ClockLabel: document.getElementById("p3ClockLabel"),
  p4ClockLabel: document.getElementById("p4ClockLabel"),
  boardClockP1: document.getElementById("boardClockP1"),
  boardClockP2: document.getElementById("boardClockP2"),
  boardClockP3: document.getElementById("boardClockP3"),
  boardClockP4: document.getElementById("boardClockP4"),
  boardClockP1Time: document.getElementById("boardClockP1Time"),
  boardClockP2Time: document.getElementById("boardClockP2Time"),
  boardClockP3Time: document.getElementById("boardClockP3Time"),
  boardClockP4Time: document.getElementById("boardClockP4Time"),
  legendP3: document.getElementById("legendP3"),
  legendP4: document.getElementById("legendP4"),
  onlineCreateBtn: document.getElementById("onlineCreateBtn"),
  onlineJoinBtn: document.getElementById("onlineJoinBtn"),
  onlineLeaveBtn: document.getElementById("onlineLeaveBtn"),
  onlineRoomInput: document.getElementById("onlineRoomInput"),
  onlineStatusText: document.getElementById("onlineStatusText"),
  onlineRoomText: document.getElementById("onlineRoomText"),
  onlineRoleText: document.getElementById("onlineRoleText"),
  toggleMenuBtn: document.getElementById("toggleMenuBtn")
};

const SQRT3 = Math.sqrt(3);
const COS_22_5 = Math.cos(Math.PI / 8);
const SIN_22_5 = Math.sin(Math.PI / 8);
const WIN_LENGTH = 6;
const MAX_PLACEMENT_DISTANCE = 8;
const CLOCK_TICK_MS = 100;
const GRID_TARGET_HEXES_PER_FRAME = 3600;
const GRID_HINT_MIN_HEX_SIZE = 9;
const GRID_LOW_DETAIL_HEX_SIZE = 9;
const GRID_VERY_LOW_DETAIL_HEX_SIZE = 6;
const OCTAGON_PITCH_FACTOR = 2 * COS_22_5;
const OCTAGON_DIAMOND_RADIUS_FACTOR = COS_22_5 - SIN_22_5;
const MIN_TIMER_INITIAL_SECONDS = 1;
const MAX_TIMER_INITIAL_SECONDS = 180 * 60;
const MIN_PLAYER_COUNT = 2;
const MAX_PLAYER_COUNT = 4;
const RADIAL_SECTOR_COUNT = 12;
const RADIAL_SECTOR_ANGLE = (Math.PI * 2) / RADIAL_SECTOR_COUNT;
const DEFAULT_TIMER_CONFIG = {
  enabled: true,
  initialSeconds: 5 * 60,
  incrementSeconds: 2
};
const DEFAULT_EGYPTIAN_STONE_CAP = 12;
const MIN_EGYPTIAN_STONE_CAP = 6;
const MAX_EGYPTIAN_STONE_CAP = 999;
const MAX_EGYPTIAN_REMOVALS_PER_TURN = 1;
const HEX_VERTEX_UNIT = Array.from({ length: 6 }, (_, i) => {
  const angle = Math.PI / 180 * (60 * i - 30);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
});
const OCTAGON_VERTEX_UNIT = Array.from({ length: 8 }, (_, i) => {
  const angle = Math.PI / 180 * (45 * i + 22.5);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
});
const TRIANGLE_UNIT_VERTICES_UP = [
  { x: -0.5, y: -SQRT3 / 6 },
  { x: 0.5, y: -SQRT3 / 6 },
  { x: 0, y: SQRT3 / 3 }
];
const TRIANGLE_UNIT_VERTICES_DOWN = [
  { x: -0.5, y: SQRT3 / 6 },
  { x: 0.5, y: SQRT3 / 6 },
  { x: 0, y: -SQRT3 / 3 }
];
const TRIANGLE_PICK_RADIUS = 2;

const getVisibleBounds = perfHelpers.getVisibleAxialBounds || function legacyVisibleBounds(params) {
  const radius = Math.ceil(Math.max(params.width, params.height) / params.hexSize) + 6;
  const centerWorld = {
    x: (params.width / 2) - params.offsetX,
    y: (params.height / 2) - params.offsetY
  };
  const centerHex = pixelToAxial(centerWorld.x, centerWorld.y, params.hexSize);
  return {
    minQ: centerHex.q - radius,
    maxQ: centerHex.q + radius,
    minR: centerHex.r - radius,
    maxR: centerHex.r + radius
  };
};

const getRecentSerials = perfHelpers.getNewestTwoSerials || function legacyRecentSerials(cells) {
  return Object.values(cells)
    .map((cell) => cell.serial)
    .sort((a, b) => b - a)
    .slice(0, 2);
};


const normaliseTimerConfig = timerHelpers.normaliseTimerConfig || function localNormaliseTimerConfig(config) {
  const safe = config || {};
  const parsedInitialSeconds = Number(safe.initialSeconds);
  const hasInitialSeconds = Number.isFinite(parsedInitialSeconds);
  const legacyMinutes = Number(safe.initialMinutes);
  const baseInitialSeconds = hasInitialSeconds
    ? parsedInitialSeconds
    : (Number.isFinite(legacyMinutes) ? legacyMinutes * 60 : 5 * 60);
  const parsedIncrementSeconds = Number(safe.incrementSeconds);
  const baseIncrementSeconds = Number.isFinite(parsedIncrementSeconds) ? parsedIncrementSeconds : 2;
  const initialSeconds = Math.max(
    MIN_TIMER_INITIAL_SECONDS,
    Math.min(MAX_TIMER_INITIAL_SECONDS, Math.round(baseInitialSeconds))
  );
  return {
    enabled: Boolean(safe.enabled),
    initialSeconds,
    initialMinutes: Math.floor(initialSeconds / 60),
    initialSecondsPart: initialSeconds % 60,
    incrementSeconds: Math.max(0, Math.min(120, Math.round(baseIncrementSeconds)))
  };
};

function normalisePlayerCount(playerCount) {
  const parsed = Math.trunc(Number(playerCount) || MIN_PLAYER_COUNT);
  return Math.max(MIN_PLAYER_COUNT, Math.min(MAX_PLAYER_COUNT, parsed));
}

function createPlayerMap(playerCount, createValue) {
  const safePlayerCount = normalisePlayerCount(playerCount);
  const map = {};
  for (let player = 1; player <= safePlayerCount; player += 1) {
    map[player] = createValue(player);
  }
  return map;
}

const createClockState = timerHelpers.createClockState || function localCreateClockState(config, playerCount = MIN_PLAYER_COUNT) {
  const timer = normaliseTimerConfig(config);
  const initialSeconds = timer.initialSeconds;
  const safePlayerCount = normalisePlayerCount(playerCount);
  return {
    enabled: timer.enabled,
    initialSeconds,
    incrementSeconds: timer.incrementSeconds,
    playerCount: safePlayerCount,
    remaining: createPlayerMap(safePlayerCount, () => initialSeconds),
    activePlayer: 1,
    flaggedPlayer: 0
  };
};

const formatClock = timerHelpers.formatClock || function localFormatClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

function formatTimerSummary(timerConfig) {
  const timer = normaliseTimerConfig(timerConfig);
  if (!timer.enabled) {
    return "Disabled";
  }
  return `${formatClock(timer.initialSeconds)} +${timer.incrementSeconds}s`;
}

const applyElapsedToClock = timerHelpers.applyElapsed || function localApplyElapsedToClock(clock, elapsedSeconds) {
  if (!clock || !clock.enabled || clock.flaggedPlayer) {
    return { expiredPlayer: 0 };
  }
  const elapsed = Math.max(0, Number(elapsedSeconds) || 0);
  if (elapsed <= 0) {
    return { expiredPlayer: 0 };
  }
  const activePlayer = Math.max(1, Math.min(normalisePlayerCount(clock.playerCount), Math.trunc(Number(clock.activePlayer) || 1)));
  if (!Number.isFinite(Number(clock.remaining?.[activePlayer]))) {
    clock.remaining[activePlayer] = clock.initialSeconds || 0;
  }
  const nextRemaining = Math.max(0, clock.remaining[activePlayer] - elapsed);
  clock.remaining[activePlayer] = nextRemaining;
  if (nextRemaining === 0) {
    clock.flaggedPlayer = activePlayer;
    return { expiredPlayer: activePlayer };
  }
  return { expiredPlayer: 0 };
};

const switchClockTurn = timerHelpers.switchTurnWithIncrement || function localSwitchClockTurn(clock, nextPlayer) {
  if (!clock) {
    return;
  }
  const current = Math.max(1, Math.min(normalisePlayerCount(clock.playerCount), Math.trunc(Number(clock.activePlayer) || 1)));
  if (clock.enabled && !clock.flaggedPlayer) {
    if (!Number.isFinite(Number(clock.remaining?.[current]))) {
      clock.remaining[current] = clock.initialSeconds || 0;
    }
    clock.remaining[current] += Math.max(0, Number(clock.incrementSeconds) || 0);
  }
  clock.activePlayer = Math.max(1, Math.min(normalisePlayerCount(clock.playerCount), Math.trunc(Number(nextPlayer) || 1)));
};

const BASE_MODE = {
  name: "Classic",
  summary: "Standard rules with the origin start and the 11-space placement limit.",
  hint: "Classic mode: make a line of 6. No extra effects are active."
};

const PLAYER_STYLES = {
  1: {
    hex: "#6dc6ff",
    fill: "rgba(109, 198, 255, 0.10)",
    softFill: "rgba(109, 198, 255, 0.08)",
    stroke: "rgba(109, 198, 255, 0.88)",
    strongStroke: "rgba(109, 198, 255, 0.92)",
    echoStroke: "rgba(109, 198, 255, 0.28)",
    echoText: "rgba(109, 198, 255, 0.7)"
  },
  2: {
    hex: "#ff8c8c",
    fill: "rgba(255, 140, 140, 0.10)",
    softFill: "rgba(255, 140, 140, 0.08)",
    stroke: "rgba(255, 140, 140, 0.88)",
    strongStroke: "rgba(255, 140, 140, 0.92)",
    echoStroke: "rgba(255, 140, 140, 0.28)",
    echoText: "rgba(255, 140, 140, 0.7)"
  },
  3: {
    hex: "#76e3a8",
    fill: "rgba(118, 227, 168, 0.10)",
    softFill: "rgba(118, 227, 168, 0.08)",
    stroke: "rgba(118, 227, 168, 0.88)",
    strongStroke: "rgba(118, 227, 168, 0.92)",
    echoStroke: "rgba(118, 227, 168, 0.28)",
    echoText: "rgba(118, 227, 168, 0.7)"
  },
  4: {
    hex: "#c8a5ff",
    fill: "rgba(200, 165, 255, 0.10)",
    softFill: "rgba(200, 165, 255, 0.08)",
    stroke: "rgba(200, 165, 255, 0.88)",
    strongStroke: "rgba(200, 165, 255, 0.92)",
    echoStroke: "rgba(200, 165, 255, 0.28)",
    echoText: "rgba(200, 165, 255, 0.7)"
  }
};

const MODES = {
  threePlayer: {
    name: "3 Players",
    summary: "Adds Player 3 to the turn order. The opening turn is still 1 placement, then every turn uses 2 placements.",
    hint: "Three-player game: turns rotate P1, P2, P3. Connect 6 to win."
  },
  fourPlayer: {
    name: "4 Players",
    summary: "Adds Players 3 and 4 to the turn order. The opening turn is still 1 placement, then every turn uses 2 placements.",
    hint: "Four-player game: turns rotate P1, P2, P3, P4. Connect 6 to win."
  },
  triangleGrid: {
    name: "Triangle Grid",
    summary: "Replaces hex tiles with triangle tiles while keeping the same placement range and connect-6 win condition.",
    hint: "Board switches to triangle cells. Place inside triangles and connect 6 in a straight line."
  },
  squareGrid: {
    name: "Square Grid",
    summary: "Replaces hex tiles with square tiles while keeping connect-6 wins and all other mode rules intact.",
    hint: "Board switches to square cells. Place inside squares and connect 6 in a straight line."
  },
  octagonGrid: {
    name: "Octagon Grid",
    summary: "Replaces hex tiles with an octagon tiling that includes the small diamond tiles while keeping connect-6 wins and all other mode rules intact.",
    hint: "Board switches to octagons and diamonds. Place in either tile type and connect 6 in a straight line."
  },
  radialGrid: {
    name: "Radial Grid",
    summary: "Replaces hex tiles with a polar board. Connect 6 along a ring or straight outward along a spoke.",
    hint: "Board switches to rings and spokes. Connect 6 around a ring or outward from the centre."
  },
  duck: {
    name: "Duck",
    summary: "After your placements, move the duck to any empty space. Nobody can place on the duck.",
    hint: "After placing, move the duck to an empty space to block it."
  },
  egyptian: {
    name: "Egyptian",
    summary: "Each player has a soft n-stone cap. When your own placements exceed n, choose up to 2 of your own stones per turn to remove.",
    hint: "Set n in the sidebar. When your placement exceeds n, click your own stones to remove, max 2 per turn. Echoes never remove stones automatically, and you cannot remove the stone you just placed."
  },
  orbit: {
    name: "Orbit",
    summary: "At the end of every full turn, each stone moves along its orbit ring. On the radial board, outer rings drift farther and neighbouring rings counter-rotate.",
    hint: "After each full turn, stones shift around their ring. On Radial Grid, each ring has its own counter-rotating drift, so spokes twist apart."
  },
  echo: {
    name: "Echo",
    summary: "Each stone placement schedules an echo two full turns later at the mirrored coordinate across the origin, if that space is open. Ducks also project a mirrored copy immediately.",
    hint: "Stone echoes appear two full turns later at the mirrored space if it is open. Bird mirror copies appear immediately and clear on that bird's next move."
  },
  kingDuck: {
    name: "King Duck",
    summary: "Duck rules apply, but after the duck moves, adjacent empty spaces become panic zones until the next bird move.",
    hint: "After the king duck moves, adjacent empty spaces become panic zones until the next bird move."
  },
  meteorAccounting: {
    name: "Meteor",
    summary: "Every 3 full turns, all occupied spaces tied for farthest distance from the origin are deleted.",
    hint: "Every 3 full turns, all occupied spaces farthest from the center are deleted."
  }
};

const dirs = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 }
];

const lineAxes = [
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: 1, r: -1 }
];

const squareLineAxes = [
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: 1, r: 1 },
  { q: 1, r: -1 }
];

const octagonLineAxes = [
  { q: 2, r: 0 },
  { q: 0, r: 2 },
  { q: 1, r: 1 },
  { q: 1, r: -1 }
];

const triangleLineKinds = [
  "tipA",
  "tipB",
  "tipC",
  "sideA",
  "sideB",
  "sideC"
];

const BIRD_KINDS = ["duck", "kingDuck"];
const BIRD_ACTION_MOVE = "moveBird";
const GRID_MODE_KEYS = ["triangleGrid", "squareGrid", "octagonGrid", "radialGrid"];

function keyOf(q, r) {
  return `${q},${r}`;
}

function parseKey(key) {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
}

function hexDistance(a, b = { q: 0, r: 0 }) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  const ds = -a.q - a.r - (-b.q - b.r);
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
}

function squareDistance(a, b = { q: 0, r: 0 }) {
  return Math.max(
    Math.abs((a?.q ?? 0) - (b?.q ?? 0)),
    Math.abs((a?.r ?? 0) - (b?.r ?? 0))
  );
}

function axialCoordinateDistance(a, b) {
  const dq = (a?.q ?? 0) - (b?.q ?? 0);
  const dr = (a?.r ?? 0) - (b?.r ?? 0);
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

function getSquareCellPitch(size) {
  return Math.max(8, Number(size) || 0) * 2;
}

function getOctagonCellPitch(size) {
  return Math.max(8, Number(size) || 0) * OCTAGON_PITCH_FACTOR;
}

function getOctagonCellHalfPitch(size) {
  return getOctagonCellPitch(size) / 2;
}

function getRadialRingPitch(size) {
  return Math.max(8, Number(size) || 0) * 1.62;
}

function normaliseRadialSector(sector) {
  const raw = Math.trunc(Number(sector) || 0);
  return ((raw % RADIAL_SECTOR_COUNT) + RADIAL_SECTOR_COUNT) % RADIAL_SECTOR_COUNT;
}

function normaliseRadialCell(hex) {
  const ring = Math.trunc(Number(hex?.q) || 0);
  if (ring <= 0) {
    return { q: 0, r: 0 };
  }
  return {
    q: ring,
    r: normaliseRadialSector(hex?.r)
  };
}

function isRadialCellCoordinate(hex) {
  const ring = Number(hex?.q);
  const sector = Number(hex?.r);
  if (!Number.isInteger(ring) || !Number.isInteger(sector) || ring < 0) {
    return false;
  }
  if (ring === 0) {
    return sector === 0;
  }
  return sector >= 0 && sector < RADIAL_SECTOR_COUNT;
}

function radialSectorDistance(a, b) {
  const da = normaliseRadialSector(a);
  const db = normaliseRadialSector(b);
  const diff = Math.abs(da - db);
  return Math.min(diff, RADIAL_SECTOR_COUNT - diff);
}

function getRadialOppositeSector(sector) {
  return normaliseRadialSector(sector + (RADIAL_SECTOR_COUNT / 2));
}

function isOctagonTileCoordinate(hex) {
  const q = Math.trunc(Number(hex?.q) || 0);
  const r = Math.trunc(Number(hex?.r) || 0);
  return (Math.abs(q) % 2) === (Math.abs(r) % 2);
}

function isOctagonDiamondCoordinate(hex) {
  if (!isOctagonTileCoordinate(hex)) {
    return false;
  }
  const q = Math.trunc(Number(hex?.q) || 0);
  return Math.abs(q) % 2 === 1;
}

function getTriangleEdgeLength(size) {
  return Math.max(6, Number(size) || 0);
}

function isOddInt(value) {
  return Math.abs(Math.trunc(Number(value) || 0)) % 2 === 1;
}

function triangleCellToRhombusCoord(hex) {
  const q = Math.trunc(Number(hex?.q) || 0);
  return {
    q: Math.floor(q / 2),
    r: Math.trunc(Number(hex?.r) || 0),
    down: isOddInt(q)
  };
}

function getTriangleAdjacentUpRhombusesFromDown(rhombus) {
  return [
    { q: rhombus.q, r: rhombus.r },
    { q: rhombus.q, r: rhombus.r + 1 },
    { q: rhombus.q + 1, r: rhombus.r }
  ];
}

function triangleDistance(a, b) {
  const from = triangleCellToRhombusCoord(a);
  const to = triangleCellToRhombusCoord(b);

  if (from.down === to.down) {
    return axialCoordinateDistance(from, to) * 2;
  }

  const upRhombus = from.down ? to : from;
  const downRhombus = from.down ? from : to;
  const closestUpDistance = getTriangleAdjacentUpRhombusesFromDown(downRhombus)
    .reduce((best, candidate) => Math.min(best, axialCoordinateDistance(upRhombus, candidate)), Infinity);
  return (closestUpDistance * 2) + 1;
}

function triangleVertexToPixel(vertexI, vertexJ, edgeLength) {
  return {
    x: edgeLength * (vertexI + vertexJ / 2),
    y: edgeLength * (SQRT3 / 2) * vertexJ
  };
}

function axialToPixel(hex, size) {
  return {
    x: size * SQRT3 * (hex.q + hex.r / 2),
    y: size * 1.5 * hex.r
  };
}

function squareToPixel(hex, size) {
  const pitch = getSquareCellPitch(size);
  return {
    x: pitch * (Number(hex?.q) || 0),
    y: pitch * (Number(hex?.r) || 0)
  };
}

function octagonToPixel(hex, size) {
  const halfPitch = getOctagonCellHalfPitch(size);
  return {
    x: halfPitch * (Number(hex?.q) || 0),
    y: halfPitch * (Number(hex?.r) || 0)
  };
}

function radialToPixel(hex, size) {
  const cell = normaliseRadialCell(hex);
  if (cell.q === 0) {
    return { x: 0, y: 0 };
  }
  const radius = cell.q * getRadialRingPitch(size);
  const angle = cell.r * RADIAL_SECTOR_ANGLE;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

function pixelToAxial(x, y, size) {
  const q = ((SQRT3 / 3) * x - (1 / 3) * y) / size;
  const r = ((2 / 3) * y) / size;
  return axialRound({ q, r });
}

function pixelToSquare(x, y, size) {
  const pitch = getSquareCellPitch(size);
  return {
    q: Math.round(x / pitch),
    r: Math.round(y / pitch)
  };
}

function pixelToOctagon(x, y, size) {
  const halfPitch = getOctagonCellHalfPitch(size);
  const qFloat = x / halfPitch;
  const rFloat = y / halfPitch;
  const rounded = {
    q: Math.round(qFloat),
    r: Math.round(rFloat)
  };

  if (isOctagonTileCoordinate(rounded)) {
    return rounded;
  }

  const candidates = [
    { q: rounded.q + 1, r: rounded.r },
    { q: rounded.q - 1, r: rounded.r },
    { q: rounded.q, r: rounded.r + 1 },
    { q: rounded.q, r: rounded.r - 1 }
  ];

  let best = candidates[0];
  let bestDistSq = Infinity;
  for (const candidate of candidates) {
    const dq = qFloat - candidate.q;
    const dr = rFloat - candidate.r;
    const distSq = (dq * dq) + (dr * dr);
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = candidate;
    }
  }
  return best;
}

function pixelToRadialCell(x, y, size) {
  const pitch = getRadialRingPitch(size);
  const distance = Math.hypot(x, y);
  if (distance < pitch * 0.5) {
    return { q: 0, r: 0 };
  }

  const ring = Math.max(1, Math.round(distance / pitch));
  const angle = Math.atan2(y, x);
  const sector = normaliseRadialSector(Math.round(angle / RADIAL_SECTOR_ANGLE));
  return { q: ring, r: sector };
}

function axialRound(frac) {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(-frac.q - frac.r);

  const qDiff = Math.abs(q - frac.q);
  const rDiff = Math.abs(r - frac.r);
  const sDiff = Math.abs(s + frac.q + frac.r);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  }

  return { q, r };
}

function getTriangleVerticesForCell(hex, size) {
  const edgeLength = getTriangleEdgeLength(size);
  const rhombusI = Math.floor((Number(hex?.q) || 0) / 2);
  const rhombusJ = Math.trunc(Number(hex?.r) || 0);
  const oddTriangle = isOddInt(hex?.q);

  if (oddTriangle) {
    return [
      triangleVertexToPixel(rhombusI + 1, rhombusJ + 1, edgeLength),
      triangleVertexToPixel(rhombusI + 1, rhombusJ, edgeLength),
      triangleVertexToPixel(rhombusI, rhombusJ + 1, edgeLength)
    ];
  }

  return [
    triangleVertexToPixel(rhombusI, rhombusJ, edgeLength),
    triangleVertexToPixel(rhombusI + 1, rhombusJ, edgeLength),
    triangleVertexToPixel(rhombusI, rhombusJ + 1, edgeLength)
  ];
}

function getTriangleCellCenter(hex, size) {
  const vertices = getTriangleVerticesForCell(hex, size);
  return {
    x: (vertices[0].x + vertices[1].x + vertices[2].x) / 3,
    y: (vertices[0].y + vertices[1].y + vertices[2].y) / 3
  };
}

function cross2d(pointA, pointB, pointC) {
  return (pointA.x - pointC.x) * (pointB.y - pointC.y) - (pointB.x - pointC.x) * (pointA.y - pointC.y);
}

function isPointInsideTriangle(point, triangleVertices) {
  if (!Array.isArray(triangleVertices) || triangleVertices.length !== 3) {
    return false;
  }
  const [a, b, c] = triangleVertices;
  const epsilon = 0.0001;
  const d1 = cross2d(point, a, b);
  const d2 = cross2d(point, b, c);
  const d3 = cross2d(point, c, a);
  const hasNegative = d1 < -epsilon || d2 < -epsilon || d3 < -epsilon;
  const hasPositive = d1 > epsilon || d2 > epsilon || d3 > epsilon;
  return !(hasNegative && hasPositive);
}

function pixelToTriangleCell(x, y, size) {
  const edgeLength = getTriangleEdgeLength(size);
  const rowHeight = edgeLength * (SQRT3 / 2);
  const jFloat = y / rowHeight;
  const baseJ = Math.floor(jFloat);
  const iFloat = (x / edgeLength) - (jFloat / 2);
  const baseI = Math.floor(iFloat);
  const point = { x, y };
  let fallback = { q: baseI * 2, r: baseJ };
  let fallbackDistSq = Infinity;

  for (let jOffset = -TRIANGLE_PICK_RADIUS; jOffset <= TRIANGLE_PICK_RADIUS; jOffset += 1) {
    for (let iOffset = -TRIANGLE_PICK_RADIUS; iOffset <= TRIANGLE_PICK_RADIUS; iOffset += 1) {
      const rhombusI = baseI + iOffset;
      const rhombusJ = baseJ + jOffset;
      for (const qParity of [0, 1]) {
        const candidate = {
          q: (rhombusI * 2) + qParity,
          r: rhombusJ
        };
        const vertices = getTriangleVerticesForCell(candidate, size);
        if (isPointInsideTriangle(point, vertices)) {
          return candidate;
        }

        const center = getTriangleCellCenter(candidate, size);
        const distSq = ((point.x - center.x) ** 2) + ((point.y - center.y) ** 2);
        if (distSq < fallbackDistSq) {
          fallbackDistSq = distSq;
          fallback = candidate;
        }
      }
    }
  }

  return fallback;
}

function pixelToBoardCell(x, y, size, state = null) {
  if (usesTriangleGridMode(state)) {
    return pixelToTriangleCell(x, y, size);
  }
  if (usesRadialGridMode(state)) {
    return pixelToRadialCell(x, y, size);
  }
  if (usesOctagonGridMode(state)) {
    return pixelToOctagon(x, y, size);
  }
  if (usesSquareGridMode(state)) {
    return pixelToSquare(x, y, size);
  }
  return pixelToAxial(x, y, size);
}

function boardCellToPixel(hex, size, state = null) {
  if (usesTriangleGridMode(state)) {
    return getTriangleCellCenter(hex, size);
  }
  if (usesRadialGridMode(state)) {
    return radialToPixel(hex, size);
  }
  if (usesOctagonGridMode(state)) {
    return octagonToPixel(hex, size);
  }
  if (usesSquareGridMode(state)) {
    return squareToPixel(hex, size);
  }
  return axialToPixel(hex, size);
}

function neighbours(hex) {
  return dirs.map((d) => ({ q: hex.q + d.q, r: hex.r + d.r }));
}

function squareNeighbours(hex) {
  return [
    { q: hex.q + 1, r: hex.r },
    { q: hex.q - 1, r: hex.r },
    { q: hex.q, r: hex.r + 1 },
    { q: hex.q, r: hex.r - 1 }
  ];
}

function radialNeighbours(hex) {
  const cell = normaliseRadialCell(hex);
  if (cell.q === 0) {
    return Array.from({ length: RADIAL_SECTOR_COUNT }, (_, sector) => ({ q: 1, r: sector }));
  }

  const neighboursForCell = [
    { q: cell.q + 1, r: cell.r },
    { q: cell.q, r: normaliseRadialSector(cell.r + 1) },
    { q: cell.q, r: normaliseRadialSector(cell.r - 1) }
  ];
  if (cell.q === 1) {
    neighboursForCell.push({ q: 0, r: 0 });
  } else {
    neighboursForCell.push({ q: cell.q - 1, r: cell.r });
  }
  return neighboursForCell;
}

function octagonTileNeighbours(hex) {
  const q = Math.trunc(Number(hex?.q) || 0);
  const r = Math.trunc(Number(hex?.r) || 0);
  if (isOctagonDiamondCoordinate({ q, r })) {
    return [
      { q: q + 1, r: r + 1 },
      { q: q + 1, r: r - 1 },
      { q: q - 1, r: r + 1 },
      { q: q - 1, r: r - 1 }
    ];
  }

  return [
    { q: q + 2, r },
    { q: q - 2, r },
    { q, r: r + 2 },
    { q, r: r - 2 },
    { q: q + 1, r: r + 1 },
    { q: q + 1, r: r - 1 },
    { q: q - 1, r: r + 1 },
    { q: q - 1, r: r - 1 }
  ];
}

function triangleSideNeighbours(hex) {
  const q = Math.trunc(Number(hex?.q) || 0);
  const r = Math.trunc(Number(hex?.r) || 0);
  if (isOddInt(q)) {
    return [
      { q: q + 1, r },
      { q: q - 1, r },
      { q: q - 1, r: r + 1 }
    ];
  }
  return [
    { q: q + 1, r },
    { q: q + 1, r: r - 1 },
    { q: q - 1, r }
  ];
}

function getAdjacentsForMode(state, hex) {
  if (usesTriangleGridMode(state)) {
    return triangleSideNeighbours(hex);
  }
  if (usesRadialGridMode(state)) {
    return radialNeighbours(hex);
  }
  if (usesOctagonGridMode(state)) {
    return octagonTileNeighbours(hex);
  }
  if (usesSquareGridMode(state)) {
    return squareNeighbours(hex);
  }
  return neighbours(hex);
}

function getLineAxesForMode(state) {
  if (usesOctagonGridMode(state)) {
    return octagonLineAxes;
  }
  return usesSquareGridMode(state) ? squareLineAxes : lineAxes;
}

function octagonDistance(a, b = { q: 0, r: 0 }) {
  const dq = Math.abs((a?.q ?? 0) - (b?.q ?? 0));
  const dr = Math.abs((a?.r ?? 0) - (b?.r ?? 0));

  const aIsDiamond = isOctagonDiamondCoordinate(a);
  const bIsDiamond = isOctagonDiamondCoordinate(b);
  if (!aIsDiamond && !bIsDiamond) {
    return Math.trunc((dq + dr) / 2);
  }
  return Math.max(dq, dr);
}

function radialDistance(a, b = { q: 0, r: 0 }) {
  const from = normaliseRadialCell(a);
  const to = normaliseRadialCell(b);
  if (from.q === 0) {
    return to.q;
  }
  if (to.q === 0) {
    return from.q;
  }

  const sameRingRoute = Math.abs(from.q - to.q) + radialSectorDistance(from.r, to.r);
  const throughCentreRoute = from.q + to.q;
  return Math.min(sameRingRoute, throughCentreRoute);
}

function getDistanceForMode(state, a, b = { q: 0, r: 0 }) {
  if (usesRadialGridMode(state)) {
    return radialDistance(a, b);
  }
  if (usesOctagonGridMode(state)) {
    return octagonDistance(a, b);
  }
  if (usesSquareGridMode(state)) {
    return squareDistance(a, b);
  }
  if (usesTriangleGridMode(state)) {
    return triangleDistance(a, b);
  }
  return hexDistance(a, b);
}

function stepTriangleLine(hex, lineKind, forward = true) {
  const q = Math.trunc(Number(hex?.q) || 0);
  const r = Math.trunc(Number(hex?.r) || 0);
  const odd = isOddInt(q);
  const sign = forward ? 1 : -1;

  if (lineKind === "tipA") {
    return { q: q + (2 * sign), r };
  }
  if (lineKind === "tipB") {
    return { q, r: r + sign };
  }
  if (lineKind === "tipC") {
    return { q: q + (2 * sign), r: r - sign };
  }
  if (lineKind === "sideA") {
    return { q: q + sign, r };
  }
  if (lineKind === "sideB") {
    if (forward) {
      return odd ? { q: q - 1, r: r + 1 } : { q: q + 1, r };
    }
    return odd ? { q: q - 1, r } : { q: q + 1, r: r - 1 };
  }
  if (lineKind === "sideC") {
    if (forward) {
      return odd ? { q: q + 1, r } : { q: q + 1, r: r - 1 };
    }
    return odd ? { q: q - 1, r: r + 1 } : { q: q - 1, r };
  }
  return { q, r };
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

function towardsOrigin(hex) {
  if (hex.q === 0 && hex.r === 0) {
    return null;
  }

  const options = neighbours(hex);
  options.sort((a, b) => hexDistance(a) - hexDistance(b));
  return options[0];
}

const orbitRingCache = new Map();
const octagonOrbitRingCache = new Map();

function getOrbitRing(radius) {
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

function orbitStep(hex) {
  if (perfHelpers.orbitStepFast) {
    return perfHelpers.orbitStepFast(hex);
  }

  const radius = hexDistance(hex);
  if (radius === 0) {
    return { ...hex };
  }

  const ring = getOrbitRing(radius);
  const index = ring.findIndex((candidate) => equalHex(candidate, hex));
  if (index === -1) {
    return { ...hex };
  }

  return { ...ring[(index + 1) % ring.length] };
}

function getOctagonOrbitLayer(hex) {
  const q = Math.trunc(Number(hex?.q) || 0);
  const r = Math.trunc(Number(hex?.r) || 0);
  return Math.trunc((Math.abs(q) + Math.abs(r)) / 2);
}

function getOctagonOrbitRing(layer) {
  if (octagonOrbitRingCache.has(layer)) {
    return octagonOrbitRingCache.get(layer);
  }

  const ring = [];
  if (layer <= 0) {
    octagonOrbitRingCache.set(layer, ring);
    return ring;
  }

  const extent = layer * 2;
  for (let q = -extent; q <= extent; q += 1) {
    for (let r = -extent; r <= extent; r += 1) {
      const hex = { q, r };
      if (!isOctagonTileCoordinate(hex)) {
        continue;
      }
      if ((Math.abs(q) + Math.abs(r)) !== extent) {
        continue;
      }
      ring.push(hex);
    }
  }

  ring.sort((a, b) => {
    const angleA = Math.atan2(a.r, a.q);
    const angleB = Math.atan2(b.r, b.q);
    if (angleA !== angleB) {
      return angleA - angleB;
    }
    return (a.q - b.q) || (a.r - b.r);
  });

  octagonOrbitRingCache.set(layer, ring);
  return ring;
}

function octagonOrbitStep(hex) {
  if (!isOctagonTileCoordinate(hex)) {
    return { ...hex };
  }

  const layer = getOctagonOrbitLayer(hex);
  if (layer === 0) {
    return { ...hex };
  }

  const ring = getOctagonOrbitRing(layer);
  const index = ring.findIndex((candidate) => equalHex(candidate, hex));
  if (index === -1) {
    return { ...hex };
  }

  return { ...ring[(index + 1) % ring.length] };
}

function getRadialOrbitSectorShift(ring) {
  const safeRing = Math.max(1, Math.trunc(Number(ring) || 1));
  const magnitude = ((safeRing - 1) % (RADIAL_SECTOR_COUNT - 1)) + 1;
  return safeRing % 2 === 0 ? -magnitude : magnitude;
}

function radialOrbitStep(hex) {
  const cell = normaliseRadialCell(hex);
  if (cell.q === 0) {
    return { q: 0, r: 0 };
  }
  return {
    q: cell.q,
    r: normaliseRadialSector(cell.r + getRadialOrbitSectorShift(cell.q))
  };
}

function orbitStepForMode(state, hex) {
  if (usesRadialGridMode(state)) {
    return radialOrbitStep(hex);
  }
  if (usesOctagonGridMode(state)) {
    return octagonOrbitStep(hex);
  }
  return orbitStep(hex);
}

function cloneState(state) {
  return structuredClone(state);
}

const game = {
  viewport: {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    baseHexSize: 28
  },
  hoverHex: { q: 0, r: 0 },
  isPanning: false,
  panLast: { x: 0, y: 0 },
  touchPanMoved: false,
  touchPinchState: null,
  ignoreClickUntil: 0,
  previewModeKeys: [],
  modeUiSignature: "",
  renderScheduled: false,
  egyptianStoneCap: DEFAULT_EGYPTIAN_STONE_CAP,
  timerConfig: normaliseTimerConfig(DEFAULT_TIMER_CONFIG),
  turnOrder: "random",
  clockRuntime: {
    intervalId: null,
    lastTickAt: 0
  },
  state: null,
  history: [],
  futureHistory: []
};

const online = {
  socket: null,
  pendingAction: null,
  isConnected: false,
  roomCode: "",
  desiredRoomCode: "",
  clientId: null,
  assignedPlayer: null,
  lastRevision: 0,
  updateInFlight: false,
  queuedUpdate: null,
  applyingRemoteState: false,
  latestPlayerAssignments: null,
  reconnectTimerId: null,
  reconnectDelayMs: 1000,
  isIntentionalDisconnect: false
};

const ONLINE_RECONNECT_BASE_MS = 1000;
const ONLINE_RECONNECT_MAX_MS = 10000;

function toCanonicalModeKey(modeKey) {
  return modeKey === "greek" ? "egyptian" : modeKey;
}

function normaliseModeKeys(modeKeys) {
  const requested = new Set(
    (Array.isArray(modeKeys) ? modeKeys : [])
      .map((modeKey) => toCanonicalModeKey(modeKey))
  );
  if (requested.has("fourPlayer")) {
    requested.delete("threePlayer");
  }
  const selectedGridModes = GRID_MODE_KEYS.filter((key) => requested.has(key));
  if (selectedGridModes.length > 1) {
    for (const key of selectedGridModes.slice(0, -1)) {
      requested.delete(key);
    }
  }
  const ordered = [];
  for (const key of Object.keys(MODES)) {
    if (requested.has(key)) {
      ordered.push(key);
    }
  }
  return ordered;
}

function modeUsesEgyptianCap(modeKeys) {
  return normaliseModeKeys(modeKeys).includes("egyptian");
}

function refreshEgyptianCapControls(modeKeys) {
  if (!ui.egyptianCapControls) {
    return;
  }
  ui.egyptianCapControls.hidden = !modeUsesEgyptianCap(modeKeys);
}

function modeKeySignature(modeKeys) {
  return normaliseModeKeys(modeKeys).join("|");
}

function getModeConfig(modeKeys) {
  const keys = normaliseModeKeys(modeKeys);
  if (keys.length === 0) {
    return BASE_MODE;
  }

  const activeModes = keys.map((key) => MODES[key]);
  return {
    name: activeModes.map((mode) => mode.name).join(" + "),
    summary: activeModes.length === 1
      ? activeModes[0].summary
      : activeModes.map((mode) => `${mode.name}: ${mode.summary}`).join(" "),
    hint: activeModes.length === 1
      ? activeModes[0].hint
      : activeModes.map((mode) => `${mode.name}: ${mode.hint}`).join(" | ")
  };
}

function hasMode(state, modeKey) {
  return state.modeKeys.includes(modeKey);
}

function getPlayerCountFromModeKeys(modeKeys) {
  const keys = normaliseModeKeys(modeKeys);
  if (keys.includes("fourPlayer")) {
    return 4;
  }
  if (keys.includes("threePlayer")) {
    return 3;
  }
  return 2;
}

function getPlayerCount(state) {
  if (!state) {
    return getPlayerCountFromModeKeys(getSelectedModeKeys());
  }
  return normalisePlayerCount(state.playerCount || getPlayerCountFromModeKeys(state.modeKeys));
}

function getPlayerNumbers(stateOrCount) {
  const count = typeof stateOrCount === "number" ? normalisePlayerCount(stateOrCount) : getPlayerCount(stateOrCount);
  return Array.from({ length: count }, (_, index) => index + 1);
}

function isValidPlayerNumber(player, stateOrCount = game.state) {
  const safePlayer = Math.trunc(Number(player));
  return Number.isInteger(safePlayer) && safePlayer >= 1 && safePlayer <= (
    typeof stateOrCount === "number" ? normalisePlayerCount(stateOrCount) : getPlayerCount(stateOrCount)
  );
}

function normalisePlayerNumber(player, stateOrCount = game.state) {
  const safePlayer = Math.trunc(Number(player));
  return isValidPlayerNumber(safePlayer, stateOrCount) ? safePlayer : 1;
}

function getNextPlayerNumber(state, player = state?.turnPlayer) {
  const playerCount = getPlayerCount(state);
  const safePlayer = normalisePlayerNumber(player, playerCount);
  return safePlayer >= playerCount ? 1 : safePlayer + 1;
}

function getPlayerStyle(player) {
  return PLAYER_STYLES[normalisePlayerNumber(player, MAX_PLAYER_COUNT)] || PLAYER_STYLES[1];
}

function getOwnersForCell(state, cell) {
  if (!cell || cell.kind !== "stone") {
    return [];
  }
  const owner = Math.trunc(Number(cell.owner));
  return isValidPlayerNumber(owner, state) ? [owner] : [];
}

function getGridMode(state) {
  if (!state || !Array.isArray(state.modeKeys)) {
    return "hex";
  }
  if (state.modeKeys.includes("radialGrid")) {
    return "radial";
  }
  if (state.modeKeys.includes("octagonGrid")) {
    return "octagon";
  }
  if (state.modeKeys.includes("squareGrid")) {
    return "square";
  }
  if (state.modeKeys.includes("triangleGrid")) {
    return "triangle";
  }
  return "hex";
}

function usesTriangleGridMode(state) {
  return getGridMode(state) === "triangle";
}

function usesOctagonGridMode(state) {
  return getGridMode(state) === "octagon";
}

function usesSquareGridMode(state) {
  return getGridMode(state) === "square";
}

function usesRadialGridMode(state) {
  return getGridMode(state) === "radial";
}

function getBoardSpaceLabel(state) {
  if (usesTriangleGridMode(state)) {
    return "triangle";
  }
  if (usesRadialGridMode(state)) {
    return "radial cell";
  }
  if (usesOctagonGridMode(state)) {
    return "tile";
  }
  if (usesSquareGridMode(state)) {
    return "square";
  }
  return "hex";
}

function getBoardCoordinateLabel(state) {
  if (usesTriangleGridMode(state)) {
    return "Triangle";
  }
  if (usesRadialGridMode(state)) {
    return "Radial";
  }
  if (usesOctagonGridMode(state)) {
    return "Octagon";
  }
  if (usesSquareGridMode(state)) {
    return "Square";
  }
  return "Hex";
}

function isCellSupportedForMode(state, hex) {
  if (usesRadialGridMode(state)) {
    return isRadialCellCoordinate(hex);
  }
  if (usesOctagonGridMode(state)) {
    return isOctagonTileCoordinate(hex);
  }
  return true;
}

function getMirrorCellForMode(state, hex) {
  if (usesRadialGridMode(state)) {
    const cell = normaliseRadialCell(hex);
    if (cell.q === 0) {
      return { q: 0, r: 0 };
    }
    return {
      q: cell.q,
      r: normaliseRadialSector(cell.r + (RADIAL_SECTOR_COUNT / 2))
    };
  }
  return { q: -hex.q, r: -hex.r };
}

function usesBirdMode(state) {
  return hasMode(state, "duck")
    || hasMode(state, "kingDuck");
}

function usesPanicBirdMode(state) {
  return hasMode(state, "kingDuck");
}

function getBirdMoveKinds(state) {
  return BIRD_KINDS.filter((birdKind) => hasMode(state, birdKind));
}

function normaliseBirdAction(action) {
  if (!action) {
    return null;
  }
  if (typeof action === "string") {
    return {
      type: BIRD_ACTION_MOVE,
      birdKind: action === "kingDuck" ? "kingDuck" : "duck"
    };
  }

  const birdKind = action.birdKind === "kingDuck" ? "kingDuck" : "duck";
  return { type: BIRD_ACTION_MOVE, birdKind };
}

function getBirdPhaseActions(state) {
  return getBirdMoveKinds(state).map((birdKind) => ({ type: BIRD_ACTION_MOVE, birdKind }));
}

function getBirdMoveLabel(birdMoveKind = "duck") {
  return birdMoveKind === "kingDuck" ? "king duck" : "duck";
}

function getBirdMoveTitle(birdMoveKind = "duck") {
  return birdMoveKind === "kingDuck" ? "King duck" : "Duck";
}

function getBirdActionPrompt(action) {
  const safeAction = normaliseBirdAction(action);
  if (!safeAction) {
    return "";
  }
  return `Move the ${getBirdMoveLabel(safeAction.birdKind)} to any empty ${getBoardSpaceLabel(game.state)}`;
}

function getSelectedModeKeys() {
  return Array.from(ui.modePicker.querySelectorAll(".modeToggle.active")).map((button) => button.dataset.mode);
}

function setSelectedModeKeys(modeKeys) {
  const active = new Set(normaliseModeKeys(modeKeys));
  for (const button of ui.modePicker.querySelectorAll(".modeToggle")) {
    const isActive = active.has(button.dataset.mode);
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
  game.previewModeKeys = [...active];
  setModeUI(game.previewModeKeys);
}

function makeInitialState(modeKeys, timerConfig = game.timerConfig, egyptianStoneCap = game.egyptianStoneCap) {
  const activeModeKeys = normaliseModeKeys(modeKeys);
  const playerCount = getPlayerCountFromModeKeys(activeModeKeys);
  return {
    modeKeys: activeModeKeys,
    playerCount,
    egyptianStoneCap: normaliseEgyptianStoneCap(egyptianStoneCap),
    cells: {},
    turnPlayer: 1,
    movesLeftInTurn: 1,
    openingMoveDone: false,
    winner: 0,
    round: 1,
    turnCount: 0,
    birds: {
      duck: null,
      kingDuck: null
    },
    birdEchoCopies: {
      duck: null,
      kingDuck: null
    },
    duckPhase: false,
    birdMovesPending: [],
    currentBirdMoveKind: null,
    panicZones: {},
    pendingEchoes: [],
    egyptianRemoval: null,
    egyptianRemovalsThisTurn: createPlayerMap(playerCount, () => 0),
    lastPlacedThisTurn: [],
    lastPlacement: null,
    recentBirdEvents: [],
    recentCapRemovalEvents: [],
    recentMeteorRemovalEvents: [],
    lastPlacedByPlayer: createPlayerMap(playerCount, () => null),
    moveSerial: 0,
    log: ["Game started."],
    accountingEvents: [],
    clock: createClockState(timerConfig, playerCount)
  };
}

function setModeUI(modeKeys) {
  const mode = getModeConfig(modeKeys);
  game.modeUiSignature = modeKeySignature(modeKeys);
  ui.modeName.textContent = mode.name;
  ui.modeSummary.textContent = mode.summary;
  ui.overlayTitle.textContent = mode.name;
  ui.overlayHint.textContent = mode.hint;
  refreshEgyptianCapControls(modeKeys);
  updateTurnOrderSummary(getPlayerCountFromModeKeys(modeKeys));
}

function setOptionsMenuCollapsed(collapsed) {
  ui.appRoot.classList.toggle("menuCollapsed", collapsed);
  ui.toggleMenuBtn.textContent = collapsed ? "Show menu" : "Hide menu";
  ui.toggleMenuBtn.setAttribute("aria-label", collapsed ? "Show options menu" : "Hide options menu");
  ui.toggleMenuBtn.setAttribute("aria-pressed", collapsed ? "true" : "false");
  // Grid transitions animate for ~200ms; resize now and again after layout settles.
  resizeCanvas();
  window.requestAnimationFrame(() => resizeCanvas());
  window.setTimeout(() => resizeCanvas(), 240);
}

function pushLog(text) {
  game.state.log.unshift(text);
  game.state.log = game.state.log.slice(0, 26);
}

function renderLog() {
  ui.log.innerHTML = "";
  for (const entry of game.state.log) {
    const div = document.createElement("div");
    div.className = "logEntry";
    div.textContent = entry;
    ui.log.appendChild(div);
  }
}

function getTimerConfigFromInputs() {
  const minutes = Number(ui.timerMinutesInput.value);
  const seconds = Number(ui.timerSecondsInput?.value);
  const hasMinutes = Number.isFinite(minutes);
  const hasSeconds = Number.isFinite(seconds);
  const initialSeconds = (hasMinutes || hasSeconds)
    ? ((hasMinutes ? minutes : 0) * 60) + (hasSeconds ? seconds : 0)
    : undefined;
  return normaliseTimerConfig({
    enabled: ui.timerEnabledInput.checked,
    initialSeconds,
    initialMinutes: ui.timerMinutesInput.value,
    incrementSeconds: ui.timerIncrementInput.value
  });
}

function setTimerInputs(timerConfig) {
  const timer = normaliseTimerConfig(timerConfig);
  ui.timerEnabledInput.checked = Boolean(timer.enabled);
  ui.timerMinutesInput.value = String(timer.initialMinutes);
  if (ui.timerSecondsInput) {
    ui.timerSecondsInput.value = String(timer.initialSecondsPart);
  }
  ui.timerIncrementInput.value = String(timer.incrementSeconds);
  ui.timerSummaryText.textContent = formatTimerSummary(timer);
}

function normaliseTurnOrder(value, playerCount = getPlayerCountFromModeKeys(getSelectedModeKeys())) {
  const safePlayerCount = normalisePlayerCount(playerCount);
  if (value === "random") {
    return value;
  }
  const match = /^p([1-4])First$/.exec(String(value || ""));
  if (match && Number(match[1]) <= safePlayerCount) {
    return value;
  }
  return "random";
}

function resolveStartingPlayer(turnOrder, playerCount = getPlayerCountFromModeKeys(getSelectedModeKeys())) {
  const safePlayerCount = normalisePlayerCount(playerCount);
  const safeTurnOrder = normaliseTurnOrder(turnOrder, safePlayerCount);
  if (safeTurnOrder === "random") {
    return 1 + Math.floor(Math.random() * safePlayerCount);
  }
  const match = /^p([1-4])First$/.exec(safeTurnOrder);
  return match ? Number(match[1]) : 1;
}

function getTurnOrderFromInput() {
  return normaliseTurnOrder(ui.turnOrderInput?.value || game.turnOrder, getPlayerCountFromModeKeys(getSelectedModeKeys()));
}

function setTurnOrderInput(turnOrder, playerCount = getPlayerCountFromModeKeys(getSelectedModeKeys())) {
  const safeTurnOrder = normaliseTurnOrder(turnOrder, playerCount);
  game.turnOrder = safeTurnOrder;
  if (ui.turnOrderInput) {
    ui.turnOrderInput.value = safeTurnOrder;
  }
  updateTurnOrderSummary(playerCount);
}

function updateTurnOrderOptions(playerCount = getPlayerCountFromModeKeys(getSelectedModeKeys())) {
  if (!ui.turnOrderInput) {
    return;
  }
  const safePlayerCount = normalisePlayerCount(playerCount);
  for (const option of Array.from(ui.turnOrderInput.options || [])) {
    const match = /^p([1-4])First$/.exec(option.value);
    option.hidden = Boolean(match && Number(match[1]) > safePlayerCount);
    option.disabled = option.hidden;
  }
  if (normaliseTurnOrder(ui.turnOrderInput.value, safePlayerCount) !== ui.turnOrderInput.value) {
    ui.turnOrderInput.value = "random";
  }
}

function updateTurnOrderSummary(playerCount = getPlayerCountFromModeKeys(getSelectedModeKeys())) {
  if (!ui.turnOrderSummaryText) {
    return;
  }
  updateTurnOrderOptions(playerCount);
  const turnOrder = normaliseTurnOrder(ui.turnOrderInput?.value || game.turnOrder, playerCount);
  if (turnOrder === "random") {
    ui.turnOrderSummaryText.textContent = "First player: Random";
  } else {
    const match = /^p([1-4])First$/.exec(turnOrder);
    ui.turnOrderSummaryText.textContent = `First player: P${match ? match[1] : "1"}`;
  }
}

function normaliseEgyptianStoneCap(value) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_EGYPTIAN_STONE_CAP;
  }
  return Math.max(MIN_EGYPTIAN_STONE_CAP, Math.min(MAX_EGYPTIAN_STONE_CAP, parsed));
}

function getEgyptianStoneCapFromInputs() {
  return normaliseEgyptianStoneCap(ui.egyptianCapInput?.value);
}

function setEgyptianCapInput(value) {
  const cap = normaliseEgyptianStoneCap(value);
  if (ui.egyptianCapInput) {
    ui.egyptianCapInput.value = String(cap);
  }
  if (ui.egyptianCapSummaryText) {
    ui.egyptianCapSummaryText.textContent = `Cap: ${cap} stones/player`;
  }
}

function ensureClockState(state) {
  const playerCount = getPlayerCount(state);
  if (!state.clock) {
    state.clock = createClockState(game.timerConfig, playerCount);
    return;
  }
  state.playerCount = playerCount;
  state.clock.playerCount = playerCount;
  if (!state.clock.remaining) {
    state.clock.remaining = {};
  }
  for (const player of getPlayerNumbers(playerCount)) {
    if (!Number.isFinite(Number(state.clock.remaining[player]))) {
      state.clock.remaining[player] = state.clock.initialSeconds || 300;
    }
  }
  if (!isValidPlayerNumber(state.clock.activePlayer, playerCount)) {
    state.clock.activePlayer = 1;
  }
  if (!state.clock.incrementSeconds && state.clock.incrementSeconds !== 0) {
    state.clock.incrementSeconds = game.timerConfig.incrementSeconds;
  }
  if (!state.clock.initialSeconds) {
    state.clock.initialSeconds = Math.max(
      ...getPlayerNumbers(playerCount).map((player) => Number(state.clock.remaining[player]) || 300)
    );
  }
  if (!state.clock.flaggedPlayer) {
    state.clock.flaggedPlayer = 0;
  } else if (!isValidPlayerNumber(state.clock.flaggedPlayer, playerCount)) {
    state.clock.flaggedPlayer = 0;
  }
}

function hasClockStarted(state) {
  return Boolean(state && state.openingMoveDone);
}

function shouldRunClockTicker(state) {
  if (!state) {
    return false;
  }
  ensureClockState(state);
  return Boolean(
    state.clock.enabled
    && hasClockStarted(state)
    && !state.winner
    && !state.clock.flaggedPlayer
  );
}

function updateClockUI() {
  const clockRows = [
    { player: 1, text: ui.p1ClockText, board: ui.boardClockP1, boardTime: ui.boardClockP1Time },
    { player: 2, text: ui.p2ClockText, board: ui.boardClockP2, boardTime: ui.boardClockP2Time },
    { player: 3, label: ui.p3ClockLabel, text: ui.p3ClockText, board: ui.boardClockP3, boardTime: ui.boardClockP3Time },
    { player: 4, label: ui.p4ClockLabel, text: ui.p4ClockText, board: ui.boardClockP4, boardTime: ui.boardClockP4Time }
  ];
  if (!game.state) {
    for (const row of clockRows) {
      if (row.text) row.text.textContent = "--:--";
      if (row.boardTime) row.boardTime.textContent = "--:--";
      if (row.board) row.board.classList.remove("active", "flagged");
    }
    return;
  }
  ensureClockState(game.state);
  const clock = game.state.clock;
  const playerCount = getPlayerCount(game.state);
  const activePlayer = normalisePlayerNumber(clock.activePlayer, playerCount);
  const flaggedPlayer = clock.flaggedPlayer || 0;
  const clockIsRunning = shouldRunClockTicker(game.state);
  for (const row of clockRows) {
    const visible = row.player <= playerCount;
    const display = formatClock(clock.remaining[row.player]);
    if (row.text) {
      row.text.textContent = display;
      row.text.hidden = !visible;
    }
    if (row.label) row.label.hidden = !visible;
    if (row.boardTime) row.boardTime.textContent = display;
    if (row.board) {
      row.board.hidden = !visible;
      row.board.classList.toggle("active", clockIsRunning && activePlayer === row.player);
      row.board.classList.toggle("flagged", flaggedPlayer === row.player);
    }
  }
  if (ui.legendP3) ui.legendP3.hidden = playerCount < 3;
  if (ui.legendP4) ui.legendP4.hidden = playerCount < 4;
}

function stopClockTicker() {
  if (game.clockRuntime.intervalId) {
    window.clearInterval(game.clockRuntime.intervalId);
    game.clockRuntime.intervalId = null;
  }
  game.clockRuntime.lastTickAt = 0;
}

function handleClockExpiry(expiredPlayer) {
  if (!game.state || game.state.winner) {
    return;
  }
  const winningPlayer = getNextPlayerNumber(game.state, expiredPlayer);
  game.state.winner = winningPlayer;
  pushLog(`Player ${expiredPlayer} ran out of time. Player ${winningPlayer} wins on time.`);
  stopClockTicker();
  updateStatus();
  render();
  broadcastOnlineState();
}

function applyClockElapsedIfNeeded() {
  if (!game.state || !game.state.clock) {
    return;
  }
  const clock = game.state.clock;
  if (!shouldRunClockTicker(game.state)) {
    return;
  }
  const now = Date.now();
  if (!game.clockRuntime.lastTickAt) {
    game.clockRuntime.lastTickAt = now;
    return;
  }
  const elapsedSeconds = (now - game.clockRuntime.lastTickAt) / 1000;
  game.clockRuntime.lastTickAt = now;
  const result = applyElapsedToClock(clock, elapsedSeconds);
  updateClockUI();
  if (result.expiredPlayer) {
    handleClockExpiry(result.expiredPlayer);
  }
}

function syncClockTickerFromState() {
  if (!game.state) {
    stopClockTicker();
    return;
  }

  ensureClockState(game.state);
  const shouldRun = shouldRunClockTicker(game.state);
  if (!shouldRun) {
    stopClockTicker();
    updateClockUI();
    return;
  }

  game.clockRuntime.lastTickAt = Date.now();
  if (!game.clockRuntime.intervalId) {
    game.clockRuntime.intervalId = window.setInterval(() => {
      applyClockElapsedIfNeeded();
    }, CLOCK_TICK_MS);
  }
  updateClockUI();
}

function canUseAdminControls() {
  return (!online.roomCode && !online.desiredRoomCode) || online.assignedPlayer === 1;
}

function canActForCurrentTurn() {
  if (!online.roomCode && !online.desiredRoomCode) {
    return true;
  }
  if (!online.roomCode) {
    return false;
  }
  if (online.assignedPlayer == null) {
    return false;
  }
  return game.state && game.state.turnPlayer === online.assignedPlayer;
}

function updateOnlineControls() {
  const inRoom = Boolean(online.roomCode || online.desiredRoomCode);
  const admin = canUseAdminControls();
  const canUseTimelineControls = !(inRoom && !admin);
  ui.onlineCreateBtn.disabled = inRoom;
  ui.onlineJoinBtn.disabled = inRoom;
  ui.onlineRoomInput.disabled = inRoom;
  ui.onlineLeaveBtn.disabled = !inRoom;
  ui.newGameBtn.disabled = inRoom && !admin;
  if (ui.historyBackBtn) {
    ui.historyBackBtn.disabled = !canUseTimelineControls || game.history.length === 0;
  }
  if (ui.historyForwardBtn) {
    ui.historyForwardBtn.disabled = !canUseTimelineControls || game.futureHistory.length === 0;
  }
  ui.applyTimerBtn.disabled = inRoom && !admin;
  ui.timerMinutesInput.disabled = inRoom && !admin;
  if (ui.timerSecondsInput) {
    ui.timerSecondsInput.disabled = inRoom && !admin;
  }
  ui.timerIncrementInput.disabled = inRoom && !admin;
  ui.timerEnabledInput.disabled = inRoom && !admin;
  if (ui.turnOrderInput) {
    ui.turnOrderInput.disabled = inRoom && !admin;
  }
  if (ui.egyptianCapInput) {
    ui.egyptianCapInput.disabled = inRoom && !admin;
  }
  for (const button of ui.modePicker.querySelectorAll(".modeToggle")) {
    button.disabled = inRoom && !admin;
  }
}

function updateOnlineStatusUI() {
  const reconnecting = !online.isConnected && Boolean(online.desiredRoomCode);
  ui.onlineStatusText.textContent = reconnecting
    ? "Online: reconnecting..."
    : `Online: ${online.isConnected ? "connected" : "offline"}`;
  ui.onlineRoomText.textContent = online.roomCode
    ? `Room: ${online.roomCode}`
    : (online.desiredRoomCode ? `Room: ${online.desiredRoomCode}` : "Room: -");
  const role = online.assignedPlayer == null ? "spectator" : `player ${online.assignedPlayer}`;
  ui.onlineRoleText.textContent = (online.roomCode || online.desiredRoomCode)
    ? `Role: ${role}`
    : "Role: local";
  updateOnlineControls();
}

function clearOnlineReconnectTimer() {
  if (online.reconnectTimerId) {
    window.clearTimeout(online.reconnectTimerId);
    online.reconnectTimerId = null;
  }
}

function scheduleOnlineReconnect(roomCode) {
  if (!roomCode || online.isIntentionalDisconnect || online.reconnectTimerId) {
    return;
  }

  const delayMs = online.reconnectDelayMs;
  online.reconnectTimerId = window.setTimeout(() => {
    online.reconnectTimerId = null;
    connectOnline(() => {
      sendOnlineMessage({ type: "joinRoom", roomCode });
    });
  }, delayMs);

  online.reconnectDelayMs = Math.min(
    ONLINE_RECONNECT_MAX_MS,
    Math.round(delayMs * 1.8)
  );

  pushLog(`Connection lost. Reconnecting in ${Math.max(1, Math.round(delayMs / 1000))}s...`);
  updateStatus();
}

function normaliseSocketUrl(rawUrl) {
  const text = String(rawUrl || "").trim();
  if (!text) {
    return null;
  }

  try {
    const parsed = new URL(text, window.location.href);
    if (parsed.protocol === "https:") {
      parsed.protocol = "wss:";
    } else if (parsed.protocol === "http:") {
      parsed.protocol = "ws:";
    }

    if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
      return null;
    }

    if (!parsed.pathname || parsed.pathname === "/") {
      parsed.pathname = "/ws";
    }

    return parsed.toString();
  } catch (error) {
    return null;
  }
}

function getSocketUrl() {
  const queryUrl = normaliseSocketUrl(new URLSearchParams(window.location.search).get("ws"));
  if (queryUrl) {
    return queryUrl;
  }

  const metaUrl = normaliseSocketUrl(document.querySelector('meta[name="hex-ws-url"]')?.content);
  if (metaUrl) {
    return metaUrl;
  }

  const globalUrl = normaliseSocketUrl(window.HEX_TTT_WS_URL);
  if (globalUrl) {
    return globalUrl;
  }

  if (!window.location.host) {
    return null;
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
}

function closeOnlineSocket(intentional = false) {
  online.isIntentionalDisconnect = intentional;
  clearOnlineReconnectTimer();
  if (online.socket) {
    online.socket.close();
    online.socket = null;
  }
}

function sendOnlineMessage(message) {
  if (!online.socket || online.socket.readyState !== WebSocket.OPEN) {
    return;
  }
  online.socket.send(JSON.stringify(message));
}

function resetOnlineSendState() {
  online.updateInFlight = false;
  online.queuedUpdate = null;
}

function connectOnline(afterConnect) {
  if (online.socket && online.socket.readyState === WebSocket.OPEN) {
    if (afterConnect) {
      afterConnect();
    }
    return;
  }
  if (online.socket && online.socket.readyState === WebSocket.CONNECTING) {
    online.pendingAction = afterConnect || null;
    return;
  }

  const wsUrl = getSocketUrl();
  if (!wsUrl) {
    pushLog("Online mode needs the game served over HTTP(S), not file://.");
    updateStatus();
    return;
  }

  online.isIntentionalDisconnect = false;
  clearOnlineReconnectTimer();
  online.pendingAction = afterConnect || null;
  online.socket = new WebSocket(wsUrl);

  online.socket.addEventListener("open", () => {
    online.isConnected = true;
    online.reconnectDelayMs = ONLINE_RECONNECT_BASE_MS;
    updateOnlineStatusUI();
    if (online.pendingAction) {
      const action = online.pendingAction;
      online.pendingAction = null;
      action();
    }
  });

  online.socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      handleOnlineMessage(message);
    } catch (error) {
      console.error("Failed to parse online message:", error);
    }
  });

  online.socket.addEventListener("error", () => {
    console.warn("Online socket error");
  });

  online.socket.addEventListener("close", () => {
    const roomToRecover = online.desiredRoomCode || online.roomCode;
    const shouldReconnect = Boolean(roomToRecover) && !online.isIntentionalDisconnect;
    online.isConnected = false;
    online.roomCode = "";
    online.assignedPlayer = null;
    online.clientId = null;
    online.lastRevision = 0;
    resetOnlineSendState();
    online.latestPlayerAssignments = null;
    online.pendingAction = null;
    online.socket = null;
    updateOnlineStatusUI();
    if (shouldReconnect) {
      scheduleOnlineReconnect(roomToRecover);
    }
  });
}

function updateAssignmentFromMessage(message) {
  if (message && message.playerAssignments && typeof message.playerAssignments === "object") {
    online.latestPlayerAssignments = message.playerAssignments;
  }
  if (!online.latestPlayerAssignments || !online.clientId) {
    return;
  }
  online.assignedPlayer = online.latestPlayerAssignments[online.clientId] || null;
}

function applyRemoteState(state, revision) {
  if (!state) {
    return;
  }
  online.applyingRemoteState = true;
  game.state = cloneState(state);
  game.history = [];
  game.futureHistory = [];
  ensureClockState(game.state);
  game.timerConfig = normaliseTimerConfig({
    enabled: game.state.clock.enabled,
    initialSeconds: game.state.clock.initialSeconds,
    incrementSeconds: game.state.clock.incrementSeconds
  });
  game.egyptianStoneCap = normaliseEgyptianStoneCap(game.state.egyptianStoneCap);
  setTimerInputs(game.timerConfig);
  setEgyptianCapInput(game.egyptianStoneCap);
  setSelectedModeKeys(game.state.modeKeys);
  updateStatus();
  syncClockTickerFromState();
  render();
  online.applyingRemoteState = false;
  if (typeof revision === "number") {
    online.lastRevision = revision;
  }
}

function sendOnlineStateUpdate(update) {
  const intent = typeof update?.intent === "string" ? update.intent : "";
  online.updateInFlight = true;
  sendOnlineMessage({
    type: "stateUpdate",
    baseRevision: online.lastRevision,
    state: update.state,
    ...(intent ? { intent } : {})
  });
}

function flushQueuedOnlineState() {
  if (
    online.applyingRemoteState
    || online.updateInFlight
    || !online.queuedUpdate
    || !online.roomCode
    || !online.socket
    || online.socket.readyState !== WebSocket.OPEN
  ) {
    return;
  }

  const update = online.queuedUpdate;
  online.queuedUpdate = null;
  sendOnlineStateUpdate(update);
}

function handleOnlineMessage(message) {
  if (message.type === "welcome") {
    online.clientId = message.clientId;
    updateAssignmentFromMessage(null);
    updateOnlineStatusUI();
    return;
  }

  if (message.type === "roomJoined") {
    online.roomCode = message.roomCode || "";
    online.desiredRoomCode = online.roomCode;
    clearOnlineReconnectTimer();
    online.reconnectDelayMs = ONLINE_RECONNECT_BASE_MS;
    resetOnlineSendState();
    updateAssignmentFromMessage(message);
    if (typeof message.revision === "number") {
      online.lastRevision = message.revision;
    }
    if (message.state) {
      applyRemoteState(message.state, message.revision);
    } else if (online.roomCode && game.state) {
      broadcastOnlineState();
    }
    updateOnlineStatusUI();
    return;
  }

  if (message.type === "presence") {
    updateAssignmentFromMessage(message);
    updateOnlineStatusUI();
    return;
  }

  if (message.type === "stateUpdate") {
    updateAssignmentFromMessage(message);
    if (typeof message.revision === "number" && message.revision < online.lastRevision) {
      return;
    }
    online.updateInFlight = false;
    if (message.byClientId === online.clientId && online.queuedUpdate) {
      if (typeof message.revision === "number") {
        online.lastRevision = message.revision;
      }
      flushQueuedOnlineState();
      return;
    }
    applyRemoteState(message.state, message.revision);
    flushQueuedOnlineState();
    return;
  }

  if (message.type === "error" && message.message) {
    online.updateInFlight = false;
    if (message.code === "NOT_YOUR_TURN") {
      pushLog("Online: you can only move on your own turn.");
    } else if (message.code === "ADMIN_ONLY_RESET") {
      pushLog("Online: only Player 1 can start a new online game.");
    } else if (message.code === "STALE_STATE") {
      pushLog("Online: game state was stale, synced to latest room state.");
    } else {
      pushLog(`Online error: ${message.message}`);
    }
    updateStatus();
  }
}

function createOnlineRoom() {
  online.desiredRoomCode = "";
  online.reconnectDelayMs = ONLINE_RECONNECT_BASE_MS;
  connectOnline(() => {
    sendOnlineMessage({ type: "createRoom" });
  });
}

function joinOnlineRoom() {
  const roomCode = ui.onlineRoomInput.value.trim().toUpperCase();
  if (!roomCode) {
    pushLog("Enter a room code before joining.");
    updateStatus();
    return;
  }
  online.desiredRoomCode = roomCode;
  online.reconnectDelayMs = ONLINE_RECONNECT_BASE_MS;
  connectOnline(() => {
    sendOnlineMessage({ type: "joinRoom", roomCode });
  });
}

function leaveOnlineRoom() {
  if (online.socket && online.socket.readyState === WebSocket.OPEN && online.roomCode) {
    sendOnlineMessage({ type: "leaveRoom" });
  }
  online.roomCode = "";
  online.desiredRoomCode = "";
  online.assignedPlayer = null;
  online.lastRevision = 0;
  resetOnlineSendState();
  online.latestPlayerAssignments = null;
  closeOnlineSocket(true);
  updateOnlineStatusUI();
}

function broadcastOnlineState(options = {}) {
  if (online.applyingRemoteState) {
    return;
  }
  if (!online.roomCode || !online.socket || online.socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const intent = typeof options.intent === "string" ? options.intent : "";
  const update = {
    intent,
    state: cloneState(game.state)
  };

  if (online.updateInFlight) {
    online.queuedUpdate = {
      intent: intent || online.queuedUpdate?.intent || "",
      state: update.state
    };
    return;
  }

  sendOnlineStateUpdate(update);
}

function saveHistory() {
  game.history.push(cloneState(game.state));
  if (game.history.length > 80) {
    game.history.shift();
  }
  game.futureHistory = [];
}

function restoreHistorySnapshot(snapshot) {
  if (!snapshot) {
    return;
  }
  game.state = cloneState(snapshot);
  ensureClockState(game.state);
  updateStatus();
  syncClockTickerFromState();
  render();
}

function navigateHistoryBack() {
  if (game.history.length === 0) {
    return;
  }
  game.futureHistory.push(cloneState(game.state));
  if (game.futureHistory.length > 80) {
    game.futureHistory.shift();
  }
  const previous = game.history.pop();
  restoreHistorySnapshot(previous);
}

function navigateHistoryForward() {
  if (game.futureHistory.length === 0) {
    return;
  }
  game.history.push(cloneState(game.state));
  if (game.history.length > 80) {
    game.history.shift();
  }
  const next = game.futureHistory.pop();
  restoreHistorySnapshot(next);
}

function replaceTrackedHex(state, fromHex, toHex) {
  if (state.lastPlacement && equalHex(state.lastPlacement, fromHex)) {
    state.lastPlacement = { ...toHex };
  }

  state.lastPlacedThisTurn = state.lastPlacedThisTurn.map((placedHex) => (
    equalHex(placedHex, fromHex) ? { ...toHex } : placedHex
  ));

  for (const owner of getPlayerNumbers(state)) {
    const placed = state.lastPlacedByPlayer[owner];
    if (placed && equalHex(placed, fromHex)) {
      state.lastPlacedByPlayer[owner] = { ...toHex };
    }
  }
}

function transformTrackedHexes(state, transform) {
  if (state.lastPlacement) {
    state.lastPlacement = transform(state.lastPlacement);
  }
  state.lastPlacedThisTurn = state.lastPlacedThisTurn.map((hex) => transform(hex));
  for (const owner of getPlayerNumbers(state)) {
    if (state.lastPlacedByPlayer[owner]) {
      state.lastPlacedByPlayer[owner] = transform(state.lastPlacedByPlayer[owner]);
    }
  }
}

function getBirdHex(state, birdKind) {
  return state.birds[birdKind] ? { ...state.birds[birdKind] } : null;
}

function getBirdEntries(state) {
  return BIRD_KINDS
    .filter((birdKind) => state.birds[birdKind])
    .map((birdKind) => ({ birdKind, hex: state.birds[birdKind] }));
}

function ensureBirdEchoCopyState(state) {
  if (!state.birdEchoCopies) {
    state.birdEchoCopies = {
      duck: null,
      kingDuck: null
    };
  }
}

function getBirdAt(state, hex) {
  for (const birdKind of BIRD_KINDS) {
    const birdHex = state.birds[birdKind];
    if (birdHex && equalHex(birdHex, hex)) {
      return birdKind;
    }
  }
  return null;
}

function getBirdEchoCopyAt(state, hex) {
  if (!hasMode(state, "echo")) return null;
  ensureBirdEchoCopyState(state);
  for (const birdKind of BIRD_KINDS) {
    const copyHex = state.birdEchoCopies[birdKind];
    if (copyHex && equalHex(copyHex, hex)) {
      return birdKind;
    }
  }
  return null;
}

function getBirdEchoCopyEntries(state) {
  if (!hasMode(state, "echo")) return [];
  ensureBirdEchoCopyState(state);
  return BIRD_KINDS
    .filter((birdKind) => state.birdEchoCopies[birdKind])
    .map((birdKind) => ({ birdKind, hex: state.birdEchoCopies[birdKind] }));
}

function ensureRecentBirdEventsState(state) {
  if (!Array.isArray(state.recentBirdEvents)) {
    state.recentBirdEvents = [];
  }
}

function recordRecentBirdEvent(state, event) {
  ensureRecentBirdEventsState(state);
  state.recentBirdEvents.push({
    completedTurn: state.turnCount + 1,
    birdKind: event.birdKind === "kingDuck" ? "kingDuck" : "duck",
    action: event.action === "remove" ? "remove" : "place",
    hex: { q: event.hex.q, r: event.hex.r }
  });
  if (state.recentBirdEvents.length > 20) {
    state.recentBirdEvents = state.recentBirdEvents.slice(-20);
  }
}

function pruneRecentBirdEvents(state) {
  ensureRecentBirdEventsState(state);
  state.recentBirdEvents = state.recentBirdEvents.filter((event) => (
    Number.isInteger(event.completedTurn) && event.completedTurn >= state.turnCount
  ));
}

function getLastTurnBirdEvents(state) {
  ensureRecentBirdEventsState(state);
  if (!state.turnCount) {
    return [];
  }
  return state.recentBirdEvents.filter((event) => (
    event.completedTurn === state.turnCount
      && event.hex
      && Number.isFinite(event.hex.q)
      && Number.isFinite(event.hex.r)
  ));
}

function ensureRecentCapRemovalEventsState(state) {
  if (!Array.isArray(state.recentCapRemovalEvents)) {
    state.recentCapRemovalEvents = [];
  }
}

function recordRecentCapRemovalEvent(state, event) {
  if (!event || !event.hex || !Number.isFinite(event.hex.q) || !Number.isFinite(event.hex.r)) {
    return;
  }
  ensureRecentCapRemovalEventsState(state);
  const mode = "egyptian";
  const owner = normalisePlayerNumber(event.owner, state);
  state.recentCapRemovalEvents.push({
    completedTurn: state.turnCount + 1,
    mode,
    owner,
    hex: { q: event.hex.q, r: event.hex.r }
  });
  if (state.recentCapRemovalEvents.length > 24) {
    state.recentCapRemovalEvents = state.recentCapRemovalEvents.slice(-24);
  }
}

function pruneRecentCapRemovalEvents(state) {
  ensureRecentCapRemovalEventsState(state);
  state.recentCapRemovalEvents = state.recentCapRemovalEvents.filter((event) => (
    Number.isInteger(event.completedTurn) && event.completedTurn >= state.turnCount
  ));
}

function getLastTurnCapRemovalEvents(state) {
  ensureRecentCapRemovalEventsState(state);
  if (!state.turnCount) {
    return [];
  }
  return state.recentCapRemovalEvents
    .filter((event) => (
      event.completedTurn === state.turnCount
        && (event.mode === "egyptian" || event.mode === "greek")
        && isValidPlayerNumber(event.owner, state)
        && event.hex
        && Number.isFinite(event.hex.q)
        && Number.isFinite(event.hex.r)
    ))
    .map((event) => ({
      completedTurn: event.completedTurn,
      mode: "egyptian",
      owner: event.owner,
      hex: { q: event.hex.q, r: event.hex.r }
    }));
}

function ensureRecentMeteorRemovalEventsState(state) {
  if (!Array.isArray(state.recentMeteorRemovalEvents)) {
    state.recentMeteorRemovalEvents = [];
  }
}

function recordRecentMeteorRemovalEvent(state, event) {
  if (!event || !event.hex || !Number.isFinite(event.hex.q) || !Number.isFinite(event.hex.r)) {
    return;
  }
  ensureRecentMeteorRemovalEventsState(state);
  const type = event.type === "bird" ? "bird" : "stone";
  state.recentMeteorRemovalEvents.push({
    completedTurn: state.turnCount,
    type,
    owner: type === "stone" ? normalisePlayerNumber(event.owner, state) : null,
    birdKind: type === "bird"
      ? (event.birdKind === "kingDuck" ? "kingDuck" : "duck")
      : null,
    hex: { q: event.hex.q, r: event.hex.r }
  });
  if (state.recentMeteorRemovalEvents.length > 24) {
    state.recentMeteorRemovalEvents = state.recentMeteorRemovalEvents.slice(-24);
  }
}

function pruneRecentMeteorRemovalEvents(state) {
  ensureRecentMeteorRemovalEventsState(state);
  state.recentMeteorRemovalEvents = state.recentMeteorRemovalEvents.filter((event) => (
    Number.isInteger(event.completedTurn) && event.completedTurn >= state.turnCount
  ));
}

function getLastTurnMeteorRemovalEvents(state) {
  ensureRecentMeteorRemovalEventsState(state);
  if (!state.turnCount) {
    return [];
  }
  return state.recentMeteorRemovalEvents.filter((event) => (
    event.completedTurn === state.turnCount
      && (event.type === "stone" || event.type === "bird")
      && event.hex
      && Number.isFinite(event.hex.q)
      && Number.isFinite(event.hex.r)
  ));
}

function getCellAt(state, hex) {
  if (usesRadialGridMode(state) && Number(hex?.q) === 0) {
    return state.cells[keyOf(0, 0)] || null;
  }
  return state.cells[keyOf(hex.q, hex.r)] || null;
}

function cellCountsForOwner(cell, owner) {
  return Boolean(cell && cell.kind === "stone" && cell.owner === owner);
}

function isStoneOccupied(state, hex) {
  return Boolean(getCellAt(state, hex));
}

function isHexOpen(state, hex) {
  if (!isCellSupportedForMode(state, hex)) {
    return false;
  }
  return !isStoneOccupied(state, hex) && !getBirdAt(state, hex) && !getBirdEchoCopyAt(state, hex);
}

function isHexOpenForBird(state, hex, birdKind) {
  if (!isCellSupportedForMode(state, hex)) {
    return false;
  }
  if (isStoneOccupied(state, hex)) {
    return false;
  }

  const birdAt = getBirdAt(state, hex);
  if (birdAt && birdAt !== birdKind) {
    return false;
  }

  const copyAt = getBirdEchoCopyAt(state, hex);
  if (copyAt && copyAt !== birdKind) {
    return false;
  }
  return true;
}

function getPlacementAnchorHexes(state) {
  return [
    ...Object.keys(state.cells).map((key) => parseKey(key)),
    ...getBirdEntries(state).map((entry) => ({ ...entry.hex })),
    ...getBirdEchoCopyEntries(state).map((entry) => ({ ...entry.hex }))
  ];
}

function rebuildPanicZones(state) {
  ensureBirdEchoCopyState(state);
  state.panicZones = {};
  const panicSourcesByKey = {};

  for (const entry of getBirdEntries(state)) {
    if (entry.birdKind !== "kingDuck") {
      continue;
    }
    panicSourcesByKey[keyOf(entry.hex.q, entry.hex.r)] = entry.hex;
  }

  const kingDuckEchoCopy = state.birdEchoCopies?.kingDuck;
  if (hasMode(state, "echo") && kingDuckEchoCopy) {
    panicSourcesByKey[keyOf(kingDuckEchoCopy.q, kingDuckEchoCopy.r)] = kingDuckEchoCopy;
  }

  for (const source of Object.values(panicSourcesByKey)) {
    for (const n of getAdjacentsForMode(state, source)) {
      if (!isOccupied(state, n)) {
        state.panicZones[keyOf(n.q, n.r)] = true;
      }
    }
  }
}

function isHexBlockedBySpecials(state, hex) {
  if (getBirdAt(state, hex)) {
    return true;
  }
  if (state.panicZones[keyOf(hex.q, hex.r)]) {
    return true;
  }
  if (getBirdEchoCopyAt(state, hex)) {
    return true;
  }
  return false;
}

function isOccupied(state, hex) {
  return isStoneOccupied(state, hex) || Boolean(getBirdAt(state, hex)) || Boolean(getBirdEchoCopyAt(state, hex));
}

function isWithinPlacementRange(state, hex) {
  const anchorHexes = getPlacementAnchorHexes(state);
  if (anchorHexes.length === 0) {
    return equalHex(hex, { q: 0, r: 0 });
  }

  return anchorHexes.some((anchorHex) => getDistanceForMode(state, anchorHex, hex) <= MAX_PLACEMENT_DISTANCE);
}

function isLegalByBaseRules(state, hex, options = {}) {
  const allowOccupied = Boolean(options.allowOccupied);
  if (state.winner) {
    return false;
  }
  if (!isCellSupportedForMode(state, hex)) {
    return false;
  }
  if (!allowOccupied && isOccupied(state, hex)) {
    return false;
  }
  if (isHexBlockedBySpecials(state, hex)) {
    return false;
  }
  if (!isWithinPlacementRange(state, hex)) {
    return false;
  }
  return true;
}

function isLegalPlacement(state, hex) {
  if (hasEgyptianRemovalPhase(state)) {
    return false;
  }
  if (!isLegalByBaseRules(state, hex, { allowOccupied: false })) {
    return false;
  }

  const occupiedByStone = isStoneOccupied(state, hex);
  if (occupiedByStone) {
    return false;
  }
  return true;
}

function getEgyptianStoneCap(state) {
  return normaliseEgyptianStoneCap(state?.egyptianStoneCap);
}

function ensureEgyptianTurnRemovalState(state) {
  if (!state) {
    return;
  }
  const current = state.egyptianRemovalsThisTurn && typeof state.egyptianRemovalsThisTurn === "object"
    ? state.egyptianRemovalsThisTurn
    : {};
  state.egyptianRemovalsThisTurn = createPlayerMap(getPlayerCount(state), (player) => (
    Math.max(0, Math.min(MAX_EGYPTIAN_REMOVALS_PER_TURN, Math.trunc(Number(current[player]) || 0)))
  ));
}

function getEgyptianRemovalsThisTurn(state, owner) {
  ensureEgyptianTurnRemovalState(state);
  const safeOwner = normalisePlayerNumber(owner, state);
  return state.egyptianRemovalsThisTurn[safeOwner];
}

function getEgyptianRemovalSlotsRemaining(state, owner) {
  return Math.max(0, MAX_EGYPTIAN_REMOVALS_PER_TURN - getEgyptianRemovalsThisTurn(state, owner));
}

function recordEgyptianChosenRemoval(state, owner) {
  ensureEgyptianTurnRemovalState(state);
  const safeOwner = normalisePlayerNumber(owner, state);
  state.egyptianRemovalsThisTurn[safeOwner] = Math.min(
    MAX_EGYPTIAN_REMOVALS_PER_TURN,
    getEgyptianRemovalsThisTurn(state, safeOwner) + 1
  );
}

function ensureEgyptianRemovalState(state) {
  ensureEgyptianTurnRemovalState(state);
  const pending = state?.egyptianRemoval ?? state?.greekRemoval;
  if (!pending || typeof pending !== "object") {
    state.egyptianRemoval = null;
    return;
  }
  const owner = normalisePlayerNumber(pending.owner, state);
  const remaining = Math.max(0, Math.round(Number(pending.remaining) || 0));
  const cappedRemaining = Math.min(remaining, getEgyptianRemovalSlotsRemaining(state, owner));
  state.egyptianRemoval = cappedRemaining > 0 ? { owner, remaining: cappedRemaining } : null;
  if (Object.prototype.hasOwnProperty.call(state, "greekRemoval")) {
    delete state.greekRemoval;
  }
}

function hasEgyptianRemovalPhase(state) {
  ensureEgyptianRemovalState(state);
  return Boolean(state.egyptianRemoval && state.egyptianRemoval.remaining > 0);
}

function getStoneOverflowCount(state, owner) {
  const cap = getEgyptianStoneCap(state);
  const owned = getOwnerStoneEntriesSortedByAge(state, owner).length;
  return Math.max(0, owned - cap);
}

function getOwnerStoneEntriesSortedByAge(state, owner) {
  return Object.entries(state.cells)
    .map(([key, cell]) => ({ key, cell }))
    .filter((entry) => entry.cell.kind === "stone" && entry.cell.owner === owner)
    .sort((a, b) => a.cell.serial - b.cell.serial)
    .map((entry) => ({ hex: parseKey(entry.key), cell: entry.cell }));
}

function enforceStoneCapAfterPlacement(state, owner, options = {}) {
  const interactiveEgyptian = Boolean(options.interactiveEgyptian);
  if (!hasMode(state, "egyptian")) {
    return { removed: [], needsChoice: false, overflow: 0 };
  }

  const overflow = getStoneOverflowCount(state, owner);
  if (overflow <= 0) {
    return { removed: [], needsChoice: false, overflow: 0 };
  }

  if (interactiveEgyptian) {
    const remaining = Math.min(overflow, getEgyptianRemovalSlotsRemaining(state, owner));
    if (remaining <= 0) {
      return { removed: [], needsChoice: false, overflow };
    }
    state.egyptianRemoval = { owner, remaining };
    return { removed: [], needsChoice: true, overflow };
  }

  return { removed: [], needsChoice: false, overflow };
}

function isLastPlacedStoneForOwner(state, owner, hex) {
  if (!state.lastPlacement || !equalHex(state.lastPlacement, hex)) {
    return false;
  }
  const cell = getCellAt(state, hex);
  return Boolean(cell && cell.kind === "stone" && cell.owner === owner);
}

function canSelectEgyptianRemovalHex(state, hex) {
  if (!hasEgyptianRemovalPhase(state)) {
    return false;
  }
  const owner = state.egyptianRemoval.owner;
  const cell = getCellAt(state, hex);
  if (!cell || cell.kind !== "stone" || cell.owner !== owner) {
    return false;
  }
  if (isLastPlacedStoneForOwner(state, owner, hex)) {
    return false;
  }
  return true;
}

function placeStone(state, hex, owner, kind = "stone") {
  const safeOwner = normalisePlayerNumber(owner, state);
  state.moveSerial += 1;
  state.cells[keyOf(hex.q, hex.r)] = {
    owner: safeOwner,
    kind,
    serial: state.moveSerial
  };
  state.lastPlacement = { ...hex };
  if (!state.lastPlacedByPlayer || typeof state.lastPlacedByPlayer !== "object") {
    state.lastPlacedByPlayer = createPlayerMap(getPlayerCount(state), () => null);
  }
  state.lastPlacedByPlayer[safeOwner] = { ...hex };
  state.lastPlacedThisTurn.push({ ...hex });
}

function removeStone(state, hex) {
  delete state.cells[keyOf(hex.q, hex.r)];
}

function moveBird(state, hex, birdMoveKind = "duck") {
  state.birds[birdMoveKind] = { ...hex };
  rebuildPanicZones(state);
}

function syncBirdEchoCopy(state, birdKind) {
  ensureBirdEchoCopyState(state);
  state.birdEchoCopies[birdKind] = null;
  if (!hasMode(state, "echo")) {
    rebuildPanicZones(state);
    return;
  }

  const birdHex = getBirdHex(state, birdKind);
  if (!birdHex) {
    rebuildPanicZones(state);
    return;
  }

  const target = getMirrorCellForMode(state, birdHex);
  if (isStoneOccupied(state, target)) {
    rebuildPanicZones(state);
    return;
  }
  if (getBirdAt(state, target)) {
    rebuildPanicZones(state);
    return;
  }
  if (getBirdEchoCopyAt(state, target)) {
    rebuildPanicZones(state);
    return;
  }

  state.birdEchoCopies[birdKind] = target;
  rebuildPanicZones(state);
}

function countsForOwnerAt(state, pos, owner) {
  const cell = getCellAt(state, pos);
  return cellCountsForOwner(cell, owner);
}

function triangleUvKey(u, v) {
  return `${u},${v}`;
}

function triangleCellToUv(hex) {
  const q = Math.trunc(Number(hex?.q) || 0);
  const r = Math.trunc(Number(hex?.r) || 0);
  const parity = isOddInt(q) ? 1 : 0;
  return {
    u: q + r + 1,
    v: (3 * r) + parity + 1
  };
}

function getTriangleLineCount(state, start, owner, lineKind) {
  let count = 1;
  for (const forward of [true, false]) {
    let pos = stepTriangleLine(start, lineKind, forward);
    while (countsForOwnerAt(state, pos, owner)) {
      count += 1;
      pos = stepTriangleLine(pos, lineKind, forward);
    }
  }
  return count;
}

function getRadialSpokeRunCells(state, start, owner, sectorOverride = null) {
  const startCell = normaliseRadialCell(start);
  const sector = normaliseRadialSector(sectorOverride == null ? startCell.r : sectorOverride);
  const oppositeSector = getRadialOppositeSector(sector);

  function collectOutward(runSector, firstRing = 1) {
    const cells = [];
    let ring = firstRing;
    while (countsForOwnerAt(state, { q: ring, r: runSector }, owner)) {
      cells.push({ q: ring, r: runSector });
      ring += 1;
    }
    return cells;
  }

  if (startCell.q === 0) {
    if (!countsForOwnerAt(state, { q: 0, r: 0 }, owner)) {
      return [];
    }
    return [
      ...collectOutward(oppositeSector).reverse(),
      { q: 0, r: 0 },
      ...collectOutward(sector)
    ];
  }

  if (!countsForOwnerAt(state, startCell, owner)) {
    return [];
  }

  const inward = [];
  let reachedCentre = startCell.q === 1;
  for (let ring = startCell.q - 1; ring >= 1; ring -= 1) {
    const pos = { q: ring, r: sector };
    if (!countsForOwnerAt(state, pos, owner)) {
      break;
    }
    inward.push(pos);
    if (ring === 1) {
      reachedCentre = true;
    }
  }

  const outward = collectOutward(sector, startCell.q + 1);
  if (reachedCentre && countsForOwnerAt(state, { q: 0, r: 0 }, owner)) {
    return [
      ...collectOutward(oppositeSector).reverse(),
      { q: 0, r: 0 },
      ...inward.reverse(),
      { q: startCell.q, r: sector },
      ...outward
    ];
  }

  return [...inward.reverse(), { q: startCell.q, r: sector }, ...outward];
}

function getRadialRingRunCells(state, start, owner) {
  const startCell = normaliseRadialCell(start);
  if (startCell.q === 0 || !countsForOwnerAt(state, startCell, owner)) {
    return [];
  }

  const visited = new Set([keyOf(startCell.q, startCell.r)]);
  const before = [];
  for (let step = 1; step < RADIAL_SECTOR_COUNT; step += 1) {
    const pos = { q: startCell.q, r: normaliseRadialSector(startCell.r - step) };
    const key = keyOf(pos.q, pos.r);
    if (visited.has(key) || !countsForOwnerAt(state, pos, owner)) {
      break;
    }
    visited.add(key);
    before.push(pos);
  }

  const after = [];
  for (let step = 1; step < RADIAL_SECTOR_COUNT; step += 1) {
    const pos = { q: startCell.q, r: normaliseRadialSector(startCell.r + step) };
    const key = keyOf(pos.q, pos.r);
    if (visited.has(key) || !countsForOwnerAt(state, pos, owner)) {
      break;
    }
    visited.add(key);
    after.push(pos);
  }

  before.reverse();
  return [...before, startCell, ...after];
}

function getRadialWinningLine(state, start, owner) {
  const startCell = normaliseRadialCell(start);
  if (!countsForOwnerAt(state, startCell, owner)) {
    return null;
  }

  if (startCell.q === 0) {
    for (let sector = 0; sector < RADIAL_SECTOR_COUNT; sector += 1) {
      const spokeCells = getRadialSpokeRunCells(state, startCell, owner, sector);
      if (spokeCells.length >= WIN_LENGTH) {
        return { kind: "spoke", cells: spokeCells };
      }
    }
    return null;
  }

  const ringCells = getRadialRingRunCells(state, startCell, owner);
  if (ringCells.length >= WIN_LENGTH) {
    return { kind: "ring", cells: ringCells };
  }

  const spokeCells = getRadialSpokeRunCells(state, startCell, owner);
  if (spokeCells.length >= WIN_LENGTH) {
    return { kind: "spoke", cells: spokeCells };
  }

  return null;
}

function auditRadialBoardForWinner(state) {
  for (const [key, cell] of Object.entries(state.cells)) {
    const pos = parseKey(key);
    const owners = getOwnersForCell(state, cell);

    for (const owner of owners) {
      if (getRadialWinningLine(state, pos, owner)) {
        return owner;
      }
    }
  }

  return 0;
}

function auditTriangleBoardForWinner(state) {
  for (const [key, cell] of Object.entries(state.cells)) {
    const pos = parseKey(key);
    const owners = getOwnersForCell(state, cell);

    for (const owner of owners) {
      for (const lineKind of triangleLineKinds) {
        if (getTriangleLineCount(state, pos, owner, lineKind) >= WIN_LENGTH) {
          return owner;
        }
      }
    }
  }

  return 0;
}

function getLineCount(state, start, owner, dir) {
  let count = 1;
  for (const sign of [1, -1]) {
    let step = 1;
    while (true) {
      const pos = {
        q: start.q + dir.q * step * sign,
        r: start.r + dir.r * step * sign
      };
      if (!countsForOwnerAt(state, pos, owner)) {
        break;
      }
      count += 1;
      step += 1;
    }
  }
  return count;
}

function checkWinnerFrom(state, hex) {
  if (usesTriangleGridMode(state)) {
    const cell = getCellAt(state, hex);
    if (!cell) {
      return 0;
    }
    const owners = getOwnersForCell(state, cell);

    for (const owner of owners) {
      for (const lineKind of triangleLineKinds) {
        if (getTriangleLineCount(state, hex, owner, lineKind) >= WIN_LENGTH) {
          return owner;
        }
      }
    }
    return 0;
  }

  if (usesRadialGridMode(state)) {
    const cell = getCellAt(state, hex);
    if (!cell) {
      return 0;
    }
    const owners = getOwnersForCell(state, cell);

    for (const owner of owners) {
      if (getRadialWinningLine(state, hex, owner)) {
        return owner;
      }
    }
    return 0;
  }

  const cell = getCellAt(state, hex);
  if (!cell) {
    return 0;
  }

  const owners = getOwnersForCell(state, cell);

  for (const owner of owners) {
    for (const dir of getLineAxesForMode(state)) {
      if (getLineCount(state, hex, owner, dir) >= WIN_LENGTH) {
        return owner;
      }
    }
  }
  return 0;
}

function auditWholeBoardForWinner(state) {
  if (usesTriangleGridMode(state)) {
    return auditTriangleBoardForWinner(state);
  }
  if (usesRadialGridMode(state)) {
    return auditRadialBoardForWinner(state);
  }

  for (const key of Object.keys(state.cells)) {
    const pos = parseKey(key);
    const winner = checkWinnerFrom(state, pos);
    if (winner) {
      return winner;
    }
  }
  return 0;
}

function queueEcho(state, echo) {
  if (!hasMode(state, "echo")) {
    return;
  }
  if (echo.kind === "bird") {
    return;
  }
  state.pendingEchoes.push({
    targetTurn: state.turnCount + 2,
    ...echo,
    source: { ...echo.source }
  });
}

function resolveEchoes(state) {
  if (!hasMode(state, "echo")) {
    return;
  }
  const remain = [];
  for (const echo of state.pendingEchoes) {
    if (echo.targetTurn > state.turnCount) {
      remain.push(echo);
      continue;
    }
    const target = getMirrorCellForMode(state, echo.source);
    if (echo.kind === "bird") {
      // Legacy save compatibility: bird echoes are now immediate mirrored copies, not delayed moves.
      syncBirdEchoCopy(state, echo.birdKind);
      continue;
    }
    if (!isHexOpen(state, target)) {
      pushLog(`Echo at (${target.q}, ${target.r}) could not appear.`);
      continue;
    }
    placeStone(state, target, echo.owner, "stone");
    const capResolution = enforceStoneCapAfterPlacement(state, echo.owner, { interactiveEgyptian: false });
    pushLog(`Echo placed Player ${echo.owner} at (${state.lastPlacement.q}, ${state.lastPlacement.r}).`);
    if (capResolution.overflow > 0) {
      pushLog(`Egyptian cap exceeded for Player ${echo.owner}; no stone was removed automatically.`);
    }
  }
  state.pendingEchoes = remain;
}

function getOrbitDestination(state, fromHex) {
  const rotated = orbitStepForMode(state, fromHex);
  return (getBirdAt(state, rotated) || getBirdEchoCopyAt(state, rotated)) ? { ...fromHex } : rotated;
}

function resolveOrbit(state) {
  if (!hasMode(state, "orbit")) {
    return;
  }
  const nextCells = {};
  const originalCells = Object.entries(state.cells).map(([key, cell]) => ({ key, cell }));
  for (const entry of originalCells) {
    const pos = parseKey(entry.key);
    const rotated = getOrbitDestination(state, pos);
    nextCells[keyOf(rotated.q, rotated.r)] = { ...entry.cell };
  }
  state.cells = nextCells;
  rebuildPanicZones(state);
  transformTrackedHexes(state, (hex) => getOrbitDestination(state, hex));
  pushLog(usesRadialGridMode(state)
    ? "Orbit twisted each radial ring by its own drift."
    : "Orbit moved every stone 1 step along its ring.");
}

function getMeteorTargets(state) {
  let farthestDistance = -1;
  const farthest = [];

  for (const [key, cell] of Object.entries(state.cells)) {
    const pos = parseKey(key);
    const dist = getDistanceForMode(state, pos);
    if (dist > farthestDistance) {
      farthestDistance = dist;
      farthest.length = 0;
      farthest.push({ type: "stone", pos, cell });
    } else if (dist === farthestDistance) {
      farthest.push({ type: "stone", pos, cell });
    }
  }

  for (const { birdKind, hex } of getBirdEntries(state)) {
    const dist = getDistanceForMode(state, hex);
    if (dist > farthestDistance) {
      farthestDistance = dist;
      farthest.length = 0;
      farthest.push({ type: "bird", birdKind, pos: { ...hex } });
    } else if (dist === farthestDistance) {
      farthest.push({ type: "bird", birdKind, pos: { ...hex } });
    }
  }

  return {
    farthestDistance,
    farthest
  };
}

function resolveMeteorAccounting(state) {
  ensureBirdEchoCopyState(state);
  if (!hasMode(state, "meteorAccounting")) {
    return;
  }
  if (state.turnCount % 3 !== 0) {
    return;
  }

  const { farthestDistance, farthest } = getMeteorTargets(state);

  if (farthest.length === 0) {
    pushLog("Meteor found nothing to remove.");
    return;
  }

  for (const entry of farthest) {
    if (entry.type === "bird") {
      recordRecentMeteorRemovalEvent(state, {
        type: "bird",
        birdKind: entry.birdKind,
        hex: entry.pos
      });
      state.birds[entry.birdKind] = null;
      state.birdEchoCopies[entry.birdKind] = null;
    } else {
      recordRecentMeteorRemovalEvent(state, {
        type: "stone",
        owner: entry.cell?.owner,
        hex: entry.pos
      });
      removeStone(state, entry.pos);
    }
  }
  rebuildPanicZones(state);
  const coords = farthest.map((entry) => (
    entry.type === "bird"
      ? `${getBirdMoveTitle(entry.birdKind)} at (${entry.pos.q}, ${entry.pos.r})`
      : `stone at (${entry.pos.q}, ${entry.pos.r})`
  )).join(", ");
  const line = `Meteor removed ${farthest.length} tile${farthest.length === 1 ? "" : "s"} at distance ${farthestDistance}: ${coords}.`;
  state.accountingEvents.push(line);
  pushLog(line);
}

function checkForWinner(state) {
  const winner = auditWholeBoardForWinner(state);
  if (winner && !state.winner) {
    state.winner = winner;
    pushLog(`Player ${winner} wins.`);
  }
  return winner;
}

function endTurn(state) {
  ensureClockState(state);
  applyClockElapsedIfNeeded();
  const previousPlayer = state.turnPlayer;
  state.turnCount += 1;
  state.round += 1;
  pruneRecentBirdEvents(state);
  pruneRecentCapRemovalEvents(state);
  pruneRecentMeteorRemovalEvents(state);

  resolveEchoes(state);
  resolveOrbit(state);
  resolveMeteorAccounting(state);

  if (checkForWinner(state)) {
    syncClockTickerFromState();
    return;
  }

  const nextPlayer = getNextPlayerNumber(state, previousPlayer);
  switchClockTurn(state.clock, nextPlayer);
  state.turnPlayer = nextPlayer;
  state.movesLeftInTurn = 2;
  state.duckPhase = false;
  state.birdMovesPending = [];
  state.currentBirdMoveKind = null;
  state.egyptianRemoval = null;
  state.egyptianRemovalsThisTurn = createPlayerMap(getPlayerCount(state), () => 0);
  state.lastPlacedThisTurn = [];
  syncClockTickerFromState();
}

function finishSubmove(state) {
  state.movesLeftInTurn -= 1;
  if (!state.openingMoveDone) {
    state.openingMoveDone = true;
  }

  if (usesBirdMode(state) && state.movesLeftInTurn <= 0 && state.lastPlacedThisTurn.length >= 1) {
    const birdMoves = getBirdPhaseActions(state);
    if (birdMoves.length > 0) {
      state.duckPhase = true;
      state.currentBirdMoveKind = birdMoves[0];
      state.birdMovesPending = birdMoves.slice(1);
      state.movesLeftInTurn = 1 + state.birdMovesPending.length;
      return;
    }
  }

  if (state.movesLeftInTurn <= 0) {
    endTurn(state);
  }
}

function placeTurnTile(state, hex, owner) {
  const existingCell = getCellAt(state, hex);
  if (existingCell) {
    return null;
  }

  placeStone(state, hex, owner, "stone");
  const capResolution = enforceStoneCapAfterPlacement(state, owner, {
    interactiveEgyptian: hasMode(state, "egyptian") && owner === state.turnPlayer
  });

  queueEcho(state, {
    kind: "stone",
    owner,
    source: state.lastPlacement
  });

  if (capResolution.needsChoice) {
    return {
      log: `Player ${owner} placed at (${state.lastPlacement.q}, ${state.lastPlacement.r}). Egyptian: choose ${state.egyptianRemoval?.remaining || 1} stone${(state.egyptianRemoval?.remaining || 1) === 1 ? "" : "s"} to remove (not the stone you just placed).`,
      needsEgyptianChoice: true
    };
  }

  return {
    log: `Player ${owner} placed at (${state.lastPlacement.q}, ${state.lastPlacement.r}).`,
    needsEgyptianChoice: false
  };
}

function clickPlacement(hex) {
  const state = game.state;
  if (game.futureHistory.length > 0) {
    updateStatus();
    return;
  }
  if (!canActForCurrentTurn()) {
    return;
  }
  applyClockElapsedIfNeeded();

  if (state.winner) {
    return;
  }

  if (hasEgyptianRemovalPhase(state)) {
    if (!canSelectEgyptianRemovalHex(state, hex)) {
      return;
    }

    saveHistory();
    const owner = state.egyptianRemoval.owner;
    recordRecentCapRemovalEvent(state, {
      mode: "egyptian",
      owner,
      hex
    });
    removeStone(state, hex);
    recordEgyptianChosenRemoval(state, owner);
    state.egyptianRemoval.remaining -= 1;
    if (state.egyptianRemoval.remaining <= 0 || getEgyptianRemovalSlotsRemaining(state, owner) <= 0) {
      state.egyptianRemoval = null;
      pushLog(`Egyptian removal complete for Player ${owner}.`);

      if (checkForWinner(state)) {
        updateStatus();
        syncClockTickerFromState();
        render();
        broadcastOnlineState();
        return;
      }

      finishSubmove(state);
    } else {
      pushLog(`Egyptian: remove ${state.egyptianRemoval.remaining} more stone${state.egyptianRemoval.remaining === 1 ? "" : "s"} (not the stone just placed).`);
    }

    updateStatus();
    syncClockTickerFromState();
    render();
    broadcastOnlineState();
    return;
  }

  if (state.duckPhase) {
    const birdAction = normaliseBirdAction(state.currentBirdMoveKind) || { type: BIRD_ACTION_MOVE, birdKind: "duck" };
    const currentBirdHex = getBirdHex(state, birdAction.birdKind);
    if ((currentBirdHex && equalHex(currentBirdHex, hex)) || !isHexOpenForBird(state, hex, birdAction.birdKind)) {
      return;
    }
    saveHistory();
    moveBird(state, hex, birdAction.birdKind);
    syncBirdEchoCopy(state, birdAction.birdKind);
    recordRecentBirdEvent(state, {
      birdKind: birdAction.birdKind,
      action: "place",
      hex
    });
    pushLog(`${getBirdMoveTitle(birdAction.birdKind)} moved to (${hex.q}, ${hex.r}).`);

    if (state.birdMovesPending.length > 0) {
      state.currentBirdMoveKind = state.birdMovesPending.shift();
      state.movesLeftInTurn = 1 + state.birdMovesPending.length;
    } else {
      state.duckPhase = false;
      state.currentBirdMoveKind = null;
      state.movesLeftInTurn = 0;
      endTurn(state);
    }
    updateStatus();
    syncClockTickerFromState();
    render();
    broadcastOnlineState();
    return;
  }

  if (!isLegalPlacement(state, hex)) {
    return;
  }

  saveHistory();
  const placementResult = placeTurnTile(state, hex, state.turnPlayer);
  if (!placementResult) {
    return;
  }
  pushLog(placementResult.log);

  if (placementResult.needsEgyptianChoice) {
    updateStatus();
    syncClockTickerFromState();
    render();
    broadcastOnlineState();
    return;
  }

  if (checkForWinner(state)) {
    updateStatus();
    syncClockTickerFromState();
    render();
    broadcastOnlineState();
    return;
  }

  finishSubmove(state);
  updateStatus();
  syncClockTickerFromState();
  render();
  broadcastOnlineState();
}

function updateStatus() {
  const state = game.state;
  ensureClockState(state);
  if (game.modeUiSignature !== modeKeySignature(state.modeKeys)) {
    setModeUI(state.modeKeys);
  }

  const displayPlayer = state.winner || state.turnPlayer;
  ui.turnBig.textContent = state.winner ? `Player ${state.winner} wins` : `Player ${state.turnPlayer}`;
  ui.turnBig.className = `turnBig playerP${normalisePlayerNumber(displayPlayer, getPlayerCount(state))}`;
  ui.roundText.textContent = String(state.round);
  ui.movesLeftText.textContent = String(state.movesLeftInTurn);
  ui.duckPhaseText.textContent = state.duckPhase ? "Yes" : "No";
  ui.winnerText.textContent = state.winner ? `Player ${state.winner}` : "None";

  if (game.futureHistory.length > 0) {
    ui.subturnText.textContent = "Timeline view: browsing previous board states (Back/Forward).";
  } else if (!state.openingMoveDone) {
    ui.subturnText.textContent = "Opening move: 1 placement";
  } else if (hasEgyptianRemovalPhase(state)) {
    const owner = state.egyptianRemoval.owner;
    const remaining = state.egyptianRemoval.remaining;
    ui.subturnText.textContent = `Egyptian: Player ${owner} choose ${remaining} stone${remaining === 1 ? "" : "s"} to remove (not the one just placed)`;
  } else if (state.duckPhase) {
    ui.subturnText.textContent = getBirdActionPrompt(state.currentBirdMoveKind);
  } else {
    ui.subturnText.textContent = `${state.movesLeftInTurn} placement${state.movesLeftInTurn === 1 ? "" : "s"} left this turn`;
  }

  updateClockUI();
  updateTurnOrderSummary(getPlayerCount(state));
  renderLog();
  updateOnlineStatusUI();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render();
}

function screenToWorld(x, y) {
  return {
    x: (x - game.viewport.offsetX),
    y: (y - game.viewport.offsetY)
  };
}

function worldToScreen(x, y) {
  return {
    x: x + game.viewport.offsetX,
    y: y + game.viewport.offsetY
  };
}

function currentHexSize() {
  return game.viewport.baseHexSize * game.viewport.zoom;
}

function clampViewportZoom(value) {
  return Math.min(3.8, Math.max(0.33, Number(value) || 1));
}

function drawHex(x, y, size, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  for (let i = 0; i < HEX_VERTEX_UNIT.length; i += 1) {
    const px = x + size * HEX_VERTEX_UNIT[i].x;
    const py = y + size * HEX_VERTEX_UNIT[i].y;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawOctagon(x, y, size, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  for (let i = 0; i < OCTAGON_VERTEX_UNIT.length; i += 1) {
    const px = x + size * OCTAGON_VERTEX_UNIT[i].x;
    const py = y + size * OCTAGON_VERTEX_UNIT[i].y;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawOctagonDiamond(x, y, size, fill, stroke, lineWidth = 1) {
  const radius = Math.max(0.75, Number(size) || 0) * OCTAGON_DIAMOND_RADIUS_FACTOR;
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawSquare(x, y, size, fill, stroke, lineWidth = 1) {
  const half = Math.max(0.75, Number(size) || 0);
  ctx.beginPath();
  ctx.moveTo(x - half, y - half);
  ctx.lineTo(x + half, y - half);
  ctx.lineTo(x + half, y + half);
  ctx.lineTo(x - half, y + half);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawCircle(x, y, radius, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawRadialCell(x, y, size, fill, stroke, lineWidth = 1, hex = null) {
  const cell = normaliseRadialCell(hex);
  const baseSize = currentHexSize();
  const scale = Math.max(0.1, Math.min(1.25, (Number(size) || baseSize) / baseSize));
  const pitch = getRadialRingPitch(baseSize);
  if (cell.q === 0) {
    drawCircle(x, y, pitch * 0.43 * scale, fill, stroke, lineWidth);
    return;
  }

  const origin = worldToScreen(0, 0);
  const radialGap = Math.max(0.6, size * 0.035);
  const radialInset = Math.max(0, (1 - Math.min(scale, 1)) * pitch * 0.32);
  const innerRadius = Math.max(0, (cell.q - 0.5) * pitch + radialGap + radialInset);
  const outerRadius = Math.max(innerRadius + 1, (cell.q + 0.5) * pitch - radialGap - radialInset);
  const middleRadius = Math.max(1, (innerRadius + outerRadius) / 2);
  const tangentialGap = radialGap + Math.max(0, (1 - Math.min(scale, 1)) * pitch * 0.13);
  const angleGap = Math.min(RADIAL_SECTOR_ANGLE * 0.28, tangentialGap / middleRadius);
  const startAngle = (cell.r - 0.5) * RADIAL_SECTOR_ANGLE + angleGap;
  const endAngle = (cell.r + 0.5) * RADIAL_SECTOR_ANGLE - angleGap;

  ctx.beginPath();
  ctx.arc(origin.x, origin.y, outerRadius, startAngle, endAngle);
  ctx.lineTo(
    origin.x + Math.cos(endAngle) * innerRadius,
    origin.y + Math.sin(endAngle) * innerRadius
  );
  ctx.arc(origin.x, origin.y, innerRadius, endAngle, startAngle, true);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawTriangle(x, y, size, fill, stroke, lineWidth = 1, hex = null) {
  const edgeLength = getTriangleEdgeLength(size);
  const unitVertices = (hex && isOddInt(hex.q))
    ? TRIANGLE_UNIT_VERTICES_DOWN
    : TRIANGLE_UNIT_VERTICES_UP;
  ctx.beginPath();
  for (let i = 0; i < unitVertices.length; i += 1) {
    const unit = unitVertices[i];
    const px = x + edgeLength * unit.x;
    const py = y + edgeLength * unit.y;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawBoardShape(x, y, size, fill, stroke, lineWidth = 1, hex = null) {
  if (usesTriangleGridMode(game.state)) {
    drawTriangle(x, y, size, fill, stroke, lineWidth, hex);
    return;
  }
  if (usesRadialGridMode(game.state)) {
    drawRadialCell(x, y, size, fill, stroke, lineWidth, hex);
    return;
  }
  if (usesOctagonGridMode(game.state)) {
    if (isOctagonDiamondCoordinate(hex)) {
      drawOctagonDiamond(x, y, size, fill, stroke, lineWidth);
      return;
    }
    drawOctagon(x, y, size, fill, stroke, lineWidth);
    return;
  }
  if (usesSquareGridMode(game.state)) {
    drawSquare(x, y, size, fill, stroke, lineWidth);
    return;
  }
  drawHex(x, y, size, fill, stroke, lineWidth);
}

function isOnScreenWithMargin(screen, margin, width, height) {
  return !(
    screen.x < -margin
    || screen.y < -margin
    || screen.x > width + margin
    || screen.y > height + margin
  );
}

function getGridDrawStep(bounds, size) {
  const spanQ = Math.max(1, bounds.maxQ - bounds.minQ + 1);
  const spanR = Math.max(1, bounds.maxR - bounds.minR + 1);
  const estimatedHexes = spanQ * spanR;

  let step = 1;
  if (size < GRID_LOW_DETAIL_HEX_SIZE) {
    step = 2;
  }
  if (size < GRID_VERY_LOW_DETAIL_HEX_SIZE) {
    step = 3;
  }

  if (estimatedHexes > GRID_TARGET_HEXES_PER_FRAME) {
    step = Math.max(step, Math.ceil(Math.sqrt(estimatedHexes / GRID_TARGET_HEXES_PER_FRAME)));
  }

  return step;
}

function firstGridLineAtOrAfter(value, step) {
  const safeStep = Math.max(1, Math.trunc(Number(step) || 1));
  return Math.ceil(value / safeStep) * safeStep;
}

function firstGridLineWithParityAtOrAfter(value, step, parity) {
  const safeStep = Math.max(1, Math.trunc(Number(step) || 1));
  const safeParity = Math.abs(Math.trunc(Number(parity) || 0)) % 2;
  let current = firstGridLineAtOrAfter(value, safeStep);
  while (((current % 2) + 2) % 2 !== safeParity) {
    current += 1;
  }
  return current;
}

function drawWorldLine(fromWorld, toWorld) {
  const from = worldToScreen(fromWorld.x, fromWorld.y);
  const to = worldToScreen(toWorld.x, toWorld.y);
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
}

function drawLowDetailHoverCell(size, w, h, margin) {
  const hoverWorld = boardCellToPixel(game.hoverHex, size, game.state);
  const hoverScreen = worldToScreen(hoverWorld.x, hoverWorld.y);
  if (!isOnScreenWithMargin(hoverScreen, margin, w, h)) {
    return;
  }
  drawBoardShape(
    hoverScreen.x,
    hoverScreen.y,
    size - 1,
    "rgba(255, 255, 255, 0.15)",
    "rgba(255, 255, 255, 0.34)",
    1.15,
    game.hoverHex
  );
}

function getSquareVisibleCellBounds(params) {
  const width = params.width;
  const height = params.height;
  const offsetX = params.offsetX;
  const offsetY = params.offsetY;
  const pitch = getSquareCellPitch(params.hexSize);
  const marginCells = params.marginCells == null ? 2 : params.marginCells;
  const margin = Math.max(pitch * marginCells, pitch * 0.9);

  const corners = [
    { x: -margin, y: -margin },
    { x: width + margin, y: -margin },
    { x: -margin, y: height + margin },
    { x: width + margin, y: height + margin }
  ];

  let minQ = Infinity;
  let maxQ = -Infinity;
  let minR = Infinity;
  let maxR = -Infinity;

  for (const corner of corners) {
    const worldX = corner.x - offsetX;
    const worldY = corner.y - offsetY;
    minQ = Math.min(minQ, worldX / pitch);
    maxQ = Math.max(maxQ, worldX / pitch);
    minR = Math.min(minR, worldY / pitch);
    maxR = Math.max(maxR, worldY / pitch);
  }

  return {
    minQ: Math.floor(minQ) - 1,
    maxQ: Math.ceil(maxQ) + 1,
    minR: Math.floor(minR) - 1,
    maxR: Math.ceil(maxR) + 1
  };
}

function getOctagonVisibleCellBounds(params) {
  const width = params.width;
  const height = params.height;
  const offsetX = params.offsetX;
  const offsetY = params.offsetY;
  const halfPitch = getOctagonCellHalfPitch(params.hexSize);
  const marginCells = params.marginCells == null ? 2 : params.marginCells;
  const margin = Math.max(halfPitch * marginCells, halfPitch * 1.6);

  const corners = [
    { x: -margin, y: -margin },
    { x: width + margin, y: -margin },
    { x: -margin, y: height + margin },
    { x: width + margin, y: height + margin }
  ];

  let minQ = Infinity;
  let maxQ = -Infinity;
  let minR = Infinity;
  let maxR = -Infinity;

  for (const corner of corners) {
    const worldX = corner.x - offsetX;
    const worldY = corner.y - offsetY;
    minQ = Math.min(minQ, worldX / halfPitch);
    maxQ = Math.max(maxQ, worldX / halfPitch);
    minR = Math.min(minR, worldY / halfPitch);
    maxR = Math.max(maxR, worldY / halfPitch);
  }

  return {
    minQ: Math.floor(minQ) - 1,
    maxQ: Math.ceil(maxQ) + 1,
    minR: Math.floor(minR) - 1,
    maxR: Math.ceil(maxR) + 1
  };
}

function getTriangleVisibleCellBounds(params) {
  const width = params.width;
  const height = params.height;
  const offsetX = params.offsetX;
  const offsetY = params.offsetY;
  const edgeLength = getTriangleEdgeLength(params.hexSize);
  const rowHeight = edgeLength * (SQRT3 / 2);
  const margin = Math.max(edgeLength * 3.5, 22);

  const corners = [
    { x: -margin, y: -margin },
    { x: width + margin, y: -margin },
    { x: -margin, y: height + margin },
    { x: width + margin, y: height + margin }
  ];

  let minI = Infinity;
  let maxI = -Infinity;
  let minJ = Infinity;
  let maxJ = -Infinity;

  for (const corner of corners) {
    const worldX = corner.x - offsetX;
    const worldY = corner.y - offsetY;
    const jFloat = worldY / rowHeight;
    const iFloat = (worldX / edgeLength) - (jFloat / 2);
    minI = Math.min(minI, iFloat);
    maxI = Math.max(maxI, iFloat);
    minJ = Math.min(minJ, jFloat);
    maxJ = Math.max(maxJ, jFloat);
  }

  const minRhombusI = Math.floor(minI) - 2;
  const maxRhombusI = Math.ceil(maxI) + 2;
  const minR = Math.floor(minJ) - 2;
  const maxR = Math.ceil(maxJ) + 2;

  return {
    minQ: (minRhombusI * 2) - 1,
    maxQ: (maxRhombusI * 2) + 1,
    minR,
    maxR
  };
}

function getRadialVisibleCellBounds(params) {
  const width = params.width;
  const height = params.height;
  const offsetX = params.offsetX;
  const offsetY = params.offsetY;
  const pitch = getRadialRingPitch(params.hexSize);
  const marginCells = params.marginCells == null ? 2 : params.marginCells;
  const margin = Math.max(pitch * marginCells, pitch * 1.4);
  const originScreen = { x: offsetX, y: offsetY };
  const corners = [
    { x: -margin, y: -margin },
    { x: width + margin, y: -margin },
    { x: -margin, y: height + margin },
    { x: width + margin, y: height + margin }
  ];

  let maxDistance = 0;
  for (const corner of corners) {
    maxDistance = Math.max(maxDistance, Math.hypot(corner.x - originScreen.x, corner.y - originScreen.y));
  }

  const dx = originScreen.x < -margin
    ? -margin - originScreen.x
    : originScreen.x > width + margin
      ? originScreen.x - (width + margin)
      : 0;
  const dy = originScreen.y < -margin
    ? -margin - originScreen.y
    : originScreen.y > height + margin
      ? originScreen.y - (height + margin)
      : 0;
  const minDistance = Math.hypot(dx, dy);

  return {
    minQ: Math.max(0, Math.floor((minDistance - pitch) / pitch)),
    maxQ: Math.max(0, Math.ceil((maxDistance + pitch) / pitch)),
    minR: 0,
    maxR: RADIAL_SECTOR_COUNT - 1
  };
}

function drawTriangleLowDetailGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = Math.max(1, params.drawStep || 1);
  const edgeLength = getTriangleEdgeLength(size);
  const minI = Math.floor(bounds.minQ / 2) - 1;
  const maxI = Math.ceil(bounds.maxQ / 2) + 1;
  const minJ = bounds.minR - 1;
  const maxJ = bounds.maxR + 1;
  const lineStep = size < GRID_VERY_LOW_DETAIL_HEX_SIZE ? Math.max(2, drawStep) : drawStep;
  const stroke = size < GRID_VERY_LOW_DETAIL_HEX_SIZE
    ? "rgba(255, 255, 255, 0.075)"
    : "rgba(255, 255, 255, 0.105)";

  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = size < GRID_VERY_LOW_DETAIL_HEX_SIZE ? 0.8 : 1;
  ctx.beginPath();

  for (let j = firstGridLineAtOrAfter(minJ, lineStep); j <= maxJ + 1; j += lineStep) {
    drawWorldLine(
      triangleVertexToPixel(minI, j, edgeLength),
      triangleVertexToPixel(maxI + 1, j, edgeLength)
    );
  }

  for (let i = firstGridLineAtOrAfter(minI, lineStep); i <= maxI + 1; i += lineStep) {
    drawWorldLine(
      triangleVertexToPixel(i, minJ, edgeLength),
      triangleVertexToPixel(i, maxJ + 1, edgeLength)
    );
  }

  const minDiagonal = minI + minJ;
  const maxDiagonal = maxI + maxJ + 2;
  for (let diagonal = firstGridLineAtOrAfter(minDiagonal, lineStep); diagonal <= maxDiagonal; diagonal += lineStep) {
    const jStart = Math.max(minJ, diagonal - (maxI + 1));
    const jEnd = Math.min(maxJ + 1, diagonal - minI);
    if (jStart > jEnd) {
      continue;
    }
    drawWorldLine(
      triangleVertexToPixel(diagonal - jStart, jStart, edgeLength),
      triangleVertexToPixel(diagonal - jEnd, jEnd, edgeLength)
    );
  }

  ctx.stroke();
  ctx.restore();

  drawLowDetailHoverCell(size, w, h, size * 3.2);
}

function drawTriangleLatticeGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = params.drawStep;
  const showPlacementHints = params.showPlacementHints;
  if (drawStep > 1 || size < GRID_LOW_DETAIL_HEX_SIZE) {
    drawTriangleLowDetailGrid(params);
    return;
  }
  const gridStroke = drawStep > 1 ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.11)";
  const gridFill = drawStep > 1 ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.03)";
  const margin = size * 3.2;

  let hoverDrawn = false;
  for (let r = bounds.minR; r <= bounds.maxR; r += drawStep) {
    for (let q = bounds.minQ; q <= bounds.maxQ; q += drawStep) {
      const hex = { q, r };
      const world = boardCellToPixel(hex, size, game.state);
      const screen = worldToScreen(world.x, world.y);
      if (!isOnScreenWithMargin(screen, margin, w, h)) {
        continue;
      }

      let fill = gridFill;
      let stroke = gridStroke;

      if (usesPanicBirdMode(game.state) && game.state.panicZones[keyOf(hex.q, hex.r)]) {
        fill = "rgba(255, 179, 92, 0.16)";
        stroke = "rgba(255, 179, 92, 0.56)";
      }

      if (showPlacementHints && !isLegalPlacement(game.state, hex)) {
        fill = "rgba(255, 255, 255, 0.012)";
        stroke = null;
      }

      if (equalHex(hex, game.hoverHex)) {
        hoverDrawn = true;
        fill = "rgba(255, 255, 255, 0.095)";
        stroke = "rgba(255, 255, 255, 0.44)";
      }

      drawBoardShape(screen.x, screen.y, size - 1, fill, stroke, 1.2, hex);
    }
  }

  if (!hoverDrawn) {
    const hoverWorld = boardCellToPixel(game.hoverHex, size, game.state);
    const hoverScreen = worldToScreen(hoverWorld.x, hoverWorld.y);
    if (isOnScreenWithMargin(hoverScreen, margin, w, h)) {
      drawBoardShape(
        hoverScreen.x,
        hoverScreen.y,
        size - 1,
        "rgba(255, 255, 255, 0.18)",
        "rgba(255, 255, 255, 0.38)",
        1.3,
        game.hoverHex
      );
    }
  }
}

function drawRadialLowDetailGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = Math.max(1, params.drawStep || 1);
  const pitch = getRadialRingPitch(size);
  const lineStep = size < GRID_VERY_LOW_DETAIL_HEX_SIZE ? Math.max(2, drawStep) : drawStep;
  const origin = worldToScreen(0, 0);
  const minRadius = Math.max(0, (bounds.minQ - 0.5) * pitch);
  const maxRadius = Math.max(pitch, (bounds.maxQ + 0.5) * pitch);

  ctx.save();
  ctx.strokeStyle = size < GRID_VERY_LOW_DETAIL_HEX_SIZE
    ? "rgba(255, 255, 255, 0.065)"
    : "rgba(255, 255, 255, 0.092)";
  ctx.lineWidth = size < GRID_VERY_LOW_DETAIL_HEX_SIZE ? 0.8 : 1;
  ctx.beginPath();

  for (let ring = firstGridLineAtOrAfter(Math.max(0, bounds.minQ), lineStep); ring <= bounds.maxQ; ring += lineStep) {
    ctx.moveTo(origin.x + (ring + 0.5) * pitch, origin.y);
    ctx.arc(origin.x, origin.y, (ring + 0.5) * pitch, 0, Math.PI * 2);
  }

  for (let sector = 0; sector < RADIAL_SECTOR_COUNT; sector += 1) {
    const angle = (sector + 0.5) * RADIAL_SECTOR_ANGLE;
    ctx.moveTo(origin.x + Math.cos(angle) * minRadius, origin.y + Math.sin(angle) * minRadius);
    ctx.lineTo(origin.x + Math.cos(angle) * maxRadius, origin.y + Math.sin(angle) * maxRadius);
  }

  ctx.stroke();
  ctx.restore();

  drawLowDetailHoverCell(size, w, h, size * 3.5);
}

function drawRadialLatticeGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = params.drawStep;
  const showPlacementHints = params.showPlacementHints;
  if (drawStep > 1 || size < GRID_LOW_DETAIL_HEX_SIZE) {
    drawRadialLowDetailGrid(params);
    return;
  }

  const margin = getRadialRingPitch(size) * 1.2;
  const gridStroke = "rgba(255, 255, 255, 0.09)";
  const gridFill = "rgba(255, 255, 255, 0.026)";
  let hoverDrawn = false;

  for (let ring = bounds.minQ; ring <= bounds.maxQ; ring += 1) {
    const sectors = ring === 0 ? [0] : Array.from({ length: RADIAL_SECTOR_COUNT }, (_, sector) => sector);
    for (const sector of sectors) {
      const hex = { q: ring, r: sector };
      const world = boardCellToPixel(hex, size, game.state);
      const screen = worldToScreen(world.x, world.y);
      if (!isOnScreenWithMargin(screen, margin, w, h)) {
        continue;
      }

      let fill = gridFill;
      let stroke = gridStroke;

      if (usesPanicBirdMode(game.state) && game.state.panicZones[keyOf(hex.q, hex.r)]) {
        fill = "rgba(255, 179, 92, 0.16)";
        stroke = "rgba(255, 179, 92, 0.52)";
      }

      if (showPlacementHints && !isLegalPlacement(game.state, hex)) {
        fill = "rgba(255, 255, 255, 0.012)";
        stroke = null;
      }

      if (equalHex(hex, game.hoverHex)) {
        hoverDrawn = true;
        fill = "rgba(255, 255, 255, 0.095)";
        stroke = "rgba(255, 255, 255, 0.42)";
      }

      drawBoardShape(screen.x, screen.y, size - 1, fill, stroke, 1.05, hex);
    }
  }

  if (!hoverDrawn) {
    const hoverWorld = boardCellToPixel(game.hoverHex, size, game.state);
    const hoverScreen = worldToScreen(hoverWorld.x, hoverWorld.y);
    if (isOnScreenWithMargin(hoverScreen, margin, w, h)) {
      drawBoardShape(
        hoverScreen.x,
        hoverScreen.y,
        size - 1,
        "rgba(255, 255, 255, 0.18)",
        "rgba(255, 255, 255, 0.38)",
        1.3,
        game.hoverHex
      );
    }
  }
}

function drawSquareLowDetailGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = Math.max(1, params.drawStep || 1);
  const pitch = getSquareCellPitch(size);
  const lineStep = size < GRID_VERY_LOW_DETAIL_HEX_SIZE ? Math.max(2, drawStep) : drawStep;
  const minQ = bounds.minQ - 1;
  const maxQ = bounds.maxQ + 1;
  const minR = bounds.minR - 1;
  const maxR = bounds.maxR + 1;

  ctx.save();
  ctx.strokeStyle = size < GRID_VERY_LOW_DETAIL_HEX_SIZE
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(255, 255, 255, 0.085)";
  ctx.lineWidth = size < GRID_VERY_LOW_DETAIL_HEX_SIZE ? 0.8 : 1;
  ctx.beginPath();

  for (let q = firstGridLineAtOrAfter(minQ, lineStep); q <= maxQ; q += lineStep) {
    const x = (q - 0.5) * pitch;
    drawWorldLine(
      { x, y: (minR - 0.5) * pitch },
      { x, y: (maxR + 0.5) * pitch }
    );
  }

  for (let r = firstGridLineAtOrAfter(minR, lineStep); r <= maxR; r += lineStep) {
    const y = (r - 0.5) * pitch;
    drawWorldLine(
      { x: (minQ - 0.5) * pitch, y },
      { x: (maxQ + 0.5) * pitch, y }
    );
  }

  ctx.stroke();
  ctx.restore();

  drawLowDetailHoverCell(size, w, h, size * 2.5);
}

function drawOctagonLowDetailGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = Math.max(2, params.drawStep || 2);
  const parityStep = drawStep % 2 === 0 ? drawStep : drawStep + 1;
  const margin = size * 3;
  const octagonStroke = size < GRID_VERY_LOW_DETAIL_HEX_SIZE
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(255, 255, 255, 0.082)";
  const diamondStroke = size < GRID_VERY_LOW_DETAIL_HEX_SIZE
    ? "rgba(255, 255, 255, 0.075)"
    : "rgba(255, 255, 255, 0.11)";
  const octagonFill = size < GRID_VERY_LOW_DETAIL_HEX_SIZE
    ? "rgba(255, 255, 255, 0.010)"
    : "rgba(255, 255, 255, 0.016)";
  const diamondFill = size < GRID_VERY_LOW_DETAIL_HEX_SIZE
    ? "rgba(255, 255, 255, 0.012)"
    : "rgba(255, 255, 255, 0.021)";

  for (const layer of [
    { parity: 0, fill: octagonFill, stroke: octagonStroke, sizeScale: 0.98 },
    { parity: 1, fill: diamondFill, stroke: diamondStroke, sizeScale: 1.2 }
  ]) {
    const startR = firstGridLineWithParityAtOrAfter(bounds.minR, parityStep, layer.parity);
    const startQ = firstGridLineWithParityAtOrAfter(bounds.minQ, parityStep, layer.parity);
    for (let r = startR; r <= bounds.maxR; r += parityStep) {
      for (let q = startQ; q <= bounds.maxQ; q += parityStep) {
        const hex = { q, r };
        const world = boardCellToPixel(hex, size, game.state);
        const screen = worldToScreen(world.x, world.y);
        if (!isOnScreenWithMargin(screen, margin, w, h)) {
          continue;
        }
        drawBoardShape(screen.x, screen.y, (size - 1) * layer.sizeScale, layer.fill, layer.stroke, 0.9, hex);
      }
    }
  }

  drawLowDetailHoverCell(size, w, h, margin);
}

function drawGrid() {
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const triangleMode = usesTriangleGridMode(game.state);
  const radialMode = usesRadialGridMode(game.state);
  const octagonMode = usesOctagonGridMode(game.state);
  const squareMode = usesSquareGridMode(game.state);
  const bounds = triangleMode
    ? getTriangleVisibleCellBounds({
      width: w,
      height: h,
      offsetX: game.viewport.offsetX,
      offsetY: game.viewport.offsetY,
      hexSize: size
    })
    : radialMode
      ? getRadialVisibleCellBounds({
        width: w,
        height: h,
        offsetX: game.viewport.offsetX,
        offsetY: game.viewport.offsetY,
        hexSize: size,
        marginCells: size < GRID_LOW_DETAIL_HEX_SIZE ? 1 : 2
      })
    : octagonMode
      ? getOctagonVisibleCellBounds({
        width: w,
        height: h,
        offsetX: game.viewport.offsetX,
        offsetY: game.viewport.offsetY,
        hexSize: size,
        marginCells: size < GRID_LOW_DETAIL_HEX_SIZE ? 1 : 2
      })
    : squareMode
      ? getSquareVisibleCellBounds({
        width: w,
        height: h,
        offsetX: game.viewport.offsetX,
        offsetY: game.viewport.offsetY,
        hexSize: size,
        marginCells: size < GRID_LOW_DETAIL_HEX_SIZE ? 1 : 2
      })
    : getVisibleBounds({
      width: w,
      height: h,
      offsetX: game.viewport.offsetX,
      offsetY: game.viewport.offsetY,
      hexSize: size,
      marginHexes: size < GRID_LOW_DETAIL_HEX_SIZE ? 1 : 2
    });
  const drawStep = getGridDrawStep(bounds, size);
  const showPlacementHints = (
    size >= GRID_HINT_MIN_HEX_SIZE
    && !game.state.winner
    && !game.state.duckPhase
    && !hasEgyptianRemovalPhase(game.state)
  );

  if (triangleMode) {
    drawTriangleLatticeGrid({
      size,
      w,
      h,
      bounds,
      drawStep,
      showPlacementHints
    });
    return;
  }

  if (radialMode) {
    drawRadialLatticeGrid({
      size,
      w,
      h,
      bounds,
      drawStep,
      showPlacementHints
    });
    return;
  }

  if (squareMode && drawStep > 1) {
    drawSquareLowDetailGrid({
      size,
      w,
      h,
      bounds,
      drawStep
    });
    return;
  }

  if (octagonMode && drawStep > 1) {
    drawOctagonLowDetailGrid({
      size,
      w,
      h,
      bounds,
      drawStep
    });
    return;
  }

  const gridStroke = drawStep > 1 ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.08)";
  const gridFill = drawStep > 1 ? "rgba(255, 255, 255, 0.018)" : "rgba(255, 255, 255, 0.025)";
  let hoverDrawn = false;

  for (let r = bounds.minR; r <= bounds.maxR; r += drawStep) {
    for (let q = bounds.minQ; q <= bounds.maxQ; q += drawStep) {
      const hex = { q, r };
      if (octagonMode && !isOctagonTileCoordinate(hex)) {
        continue;
      }
      const world = boardCellToPixel(hex, size, game.state);
      const screen = worldToScreen(world.x, world.y);
      if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
        continue;
      }

      let fill = gridFill;
      let stroke = gridStroke;

      if (usesPanicBirdMode(game.state) && game.state.panicZones[keyOf(hex.q, hex.r)]) {
        fill = "rgba(255, 179, 92, 0.16)";
        stroke = "rgba(255, 179, 92, 0.46)";
      }

      if (showPlacementHints && !isLegalPlacement(game.state, hex)) {
        stroke = null;
      }

      if (equalHex(hex, game.hoverHex)) {
        hoverDrawn = true;
        fill = "rgba(255, 255, 255, 0.08)";
        stroke = "rgba(255, 255, 255, 0.25)";
      }

      drawBoardShape(screen.x, screen.y, size - 1, fill, stroke, 1, hex);
    }
  }

  if (!hoverDrawn) {
    const world = boardCellToPixel(game.hoverHex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x >= -size * 2 && screen.y >= -size * 2 && screen.x <= w + size * 2 && screen.y <= h + size * 2) {
      drawBoardShape(screen.x, screen.y, size - 1, "rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.25)", 1, game.hoverHex);
    }
  }
}

function drawOriginIndicator() {
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const originWorld = boardCellToPixel({ q: 0, r: 0 }, size, game.state);
  const originScreen = worldToScreen(originWorld.x, originWorld.y);
  const padding = 34;
  const markerX = Math.max(padding, Math.min(w - padding, originScreen.x));
  const markerY = Math.max(padding, Math.min(h - padding, originScreen.y));
  const offscreen = Math.abs(markerX - originScreen.x) > 0.5 || Math.abs(markerY - originScreen.y) > 0.5;

  ctx.save();
  if (originScreen.x >= -size * 2 && originScreen.y >= -size * 2 && originScreen.x <= w + size * 2 && originScreen.y <= h + size * 2) {
    drawBoardShape(originScreen.x, originScreen.y, size - 1, "rgba(118, 227, 168, 0.08)", "rgba(118, 227, 168, 0.28)", 1.2, { q: 0, r: 0 });
  }
  ctx.strokeStyle = "rgba(118, 227, 168, 0.45)";
  ctx.lineWidth = 1.6;
  drawBoardShape(markerX, markerY, 13, null, "rgba(118, 227, 168, 0.45)", 1.6, { q: 0, r: 0 });

  if (offscreen) {
    const dx = originScreen.x - markerX;
    const dy = originScreen.y - markerY;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    ctx.beginPath();
    ctx.moveTo(markerX + ux * 8, markerY + uy * 8);
    ctx.lineTo(markerX + ux * 18, markerY + uy * 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEchoTargets() {
  if (!hasMode(game.state, "echo")) {
    return;
  }

  const size = currentHexSize();
  if (size < 8) {
    return;
  }
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  for (const echo of game.state.pendingEchoes) {
    const hex = getMirrorCellForMode(game.state, echo.source);
    const world = boardCellToPixel(hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }

    const countdown = Math.max(0, echo.targetTurn - game.state.turnCount);
    const isBirdEcho = echo.kind === "bird";
    const ownerStyle = getPlayerStyle(echo.owner);
    const fill = isBirdEcho
      ? (echo.birdKind === "kingDuck" ? "rgba(255, 179, 92, 0.10)" : "rgba(255, 215, 94, 0.10)")
      : ownerStyle.softFill;
    const stroke = isBirdEcho
      ? (echo.birdKind === "kingDuck" ? "rgba(255, 179, 92, 0.34)" : "rgba(255, 215, 94, 0.32)")
      : ownerStyle.echoStroke;
    ctx.save();
    ctx.setLineDash([6, 5]);
    drawBoardShape(screen.x, screen.y, size * 0.68, fill, stroke, 1.5, hex);
    ctx.restore();

    ctx.fillStyle = isBirdEcho
      ? (echo.birdKind === "kingDuck" ? "rgba(255, 179, 92, 0.84)" : "rgba(255, 215, 94, 0.84)")
      : ownerStyle.echoText;
    ctx.font = `${Math.max(10, size * 0.33)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isBirdEcho ? `\u{1F986} ${countdown}` : String(countdown), screen.x, screen.y);
  }
}

function canShowHoverEchoPreview(state) {
  return (
    hasMode(state, "echo")
    && canActForCurrentTurn()
    && !state.winner
    && !hasEgyptianRemovalPhase(state)
  );
}

function canBirdEchoCopyAppearAfterMove(state, birdKind, destinationHex) {
  if (!hasMode(state, "echo")) {
    return false;
  }

  const target = getMirrorCellForMode(state, destinationHex);
  if (isStoneOccupied(state, target)) {
    return false;
  }

  const currentBirdHex = getBirdHex(state, birdKind);
  const birdAtTarget = getBirdAt(state, target);
  if (birdAtTarget) {
    if (birdAtTarget !== birdKind) {
      return false;
    }

    // Moving this bird away from its current hex frees that hex before copy placement.
    const vacatingTarget = Boolean(
      currentBirdHex
      && equalHex(currentBirdHex, target)
      && !equalHex(destinationHex, target)
    );
    if (!vacatingTarget) {
      return false;
    }
  }

  const copyAtTarget = getBirdEchoCopyAt(state, target);
  if (copyAtTarget && copyAtTarget !== birdKind) {
    return false;
  }

  // If destination mirrors to itself (origin), the moved bird occupies the copy target.
  if (equalHex(destinationHex, target)) {
    return false;
  }

  return true;
}

function drawHoverEchoPreview() {
  const state = game.state;
  if (!canShowHoverEchoPreview(state)) {
    return;
  }

  const size = currentHexSize();
  if (size < 8) {
    return;
  }

  let target = null;
  let fill = "rgba(109, 198, 255, 0.10)";
  let stroke = "rgba(109, 198, 255, 0.88)";
  let previewText = "";

  if (state.duckPhase) {
    const birdAction = normaliseBirdAction(state.currentBirdMoveKind) || { type: BIRD_ACTION_MOVE, birdKind: "duck" };
    const birdKind = birdAction.birdKind;
    const currentBirdHex = getBirdHex(state, birdKind);
    const canMoveToHover = (
      (!currentBirdHex || !equalHex(currentBirdHex, game.hoverHex))
      && isHexOpenForBird(state, game.hoverHex, birdKind)
    );
    if (!canMoveToHover) {
      return;
    }

    if (!canBirdEchoCopyAppearAfterMove(state, birdKind, game.hoverHex)) {
      return;
    }

    target = getMirrorCellForMode(state, game.hoverHex);
    if (birdKind === "kingDuck") {
      fill = "rgba(255, 179, 92, 0.12)";
      stroke = "rgba(255, 179, 92, 0.9)";
      previewText = "\u{1F986}\u{1F451}";
    } else {
      fill = "rgba(255, 215, 94, 0.12)";
      stroke = "rgba(255, 215, 94, 0.9)";
      previewText = "\u{1F986}";
    }
  } else {
    if (!isLegalPlacement(state, game.hoverHex)) {
      return;
    }
    target = getMirrorCellForMode(state, game.hoverHex);
    const ownerStyle = getPlayerStyle(state.turnPlayer);
    fill = ownerStyle.fill;
    stroke = ownerStyle.stroke;
  }

  const world = boardCellToPixel(target, size, state);
  const screen = worldToScreen(world.x, world.y);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
    return;
  }

  ctx.save();
  ctx.setLineDash([6, 4]);
  drawBoardShape(screen.x, screen.y, size * 0.68, fill, stroke, 2, target);
  ctx.restore();

  if (previewText) {
    ctx.fillStyle = "rgba(45, 30, 0, 0.88)";
    ctx.font = `${Math.max(10, size * 0.38)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(previewText, screen.x, screen.y + 1);
  }
}

function drawMeteorPreview() {
  if (!hasMode(game.state, "meteorAccounting")) {
    if (ui.meteorTimerBadge) {
      ui.meteorTimerBadge.hidden = true;
      ui.meteorTimerBadge.textContent = "";
    }
    return;
  }

  const { farthestDistance, farthest } = getMeteorTargets(game.state);
  const remainder = game.state.turnCount % 3;
  const turnsUntilMeteor = remainder === 0 ? 3 : 3 - remainder;
  const meterText = farthestDistance >= 0
    ? `Meteor in ${turnsUntilMeteor} turn${turnsUntilMeteor === 1 ? "" : "s"} | target distance ${farthestDistance}`
    : `Meteor in ${turnsUntilMeteor} turn${turnsUntilMeteor === 1 ? "" : "s"}`;
  if (ui.meteorTimerBadge) {
    ui.meteorTimerBadge.hidden = false;
    ui.meteorTimerBadge.textContent = meterText;
  }

  const size = currentHexSize();
  if (size < 8) {
    return;
  }
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  if (farthest.length > 0) {
    for (const entry of farthest) {
      const world = boardCellToPixel(entry.pos, size, game.state);
      const screen = worldToScreen(world.x, world.y);
      if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
        continue;
      }

      ctx.save();
      ctx.setLineDash([8, 5]);
      drawBoardShape(
        screen.x,
        screen.y,
        size * (entry.type === "bird" ? 1.03 : 0.95),
        "rgba(255, 179, 92, 0.07)",
        "rgba(255, 179, 92, 0.88)",
        2,
        entry.pos
      );
      ctx.restore();
    }
  }
}

function drawOrbitPreview() {
  if (!hasMode(game.state, "orbit")) {
    return;
  }

  const size = currentHexSize();
  if (size < 9) {
    return;
  }
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  for (const key of Object.keys(game.state.cells)) {
    const fromHex = parseKey(key);
    const toHex = getOrbitDestination(game.state, fromHex);
    if (equalHex(fromHex, toHex)) {
      continue;
    }

    const fromWorld = boardCellToPixel(fromHex, size, game.state);
    const toWorld = boardCellToPixel(toHex, size, game.state);
    const from = worldToScreen(fromWorld.x, fromWorld.y);
    const to = worldToScreen(toWorld.x, toWorld.y);
    if (from.x < -size * 2 || from.y < -size * 2 || from.x > w + size * 2 || from.y > h + size * 2) {
      continue;
    }

    ctx.strokeStyle = "rgba(210, 230, 255, 0.18)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([4, 4]);
    drawBoardShape(to.x, to.y, size * 0.42, "rgba(210, 230, 255, 0.02)", "rgba(210, 230, 255, 0.22)", 1, toHex);
    ctx.restore();
  }
}

function drawKingDuckRadius() {
  if (!usesPanicBirdMode(game.state)) {
    return;
  }

  const size = currentHexSize();
  if (size < 7) {
    return;
  }

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const sources = [
    ...getBirdEntries(game.state),
    ...getBirdEchoCopyEntries(game.state)
  ].filter((entry) => entry.birdKind === "kingDuck");

  for (const source of sources) {
    for (const hex of getAdjacentsForMode(game.state, source.hex)) {
      if (!isCellSupportedForMode(game.state, hex)) {
        continue;
      }
      const world = boardCellToPixel(hex, size, game.state);
      const screen = worldToScreen(world.x, world.y);
      if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
        continue;
      }

      const blocked = isOccupied(game.state, hex);
      ctx.save();
      ctx.setLineDash(blocked ? [4, 4] : []);
      drawBoardShape(
        screen.x,
        screen.y,
        size * 0.94,
        blocked ? "rgba(255, 179, 92, 0.06)" : "rgba(255, 179, 92, 0.14)",
        blocked ? "rgba(255, 179, 92, 0.28)" : "rgba(255, 179, 92, 0.62)",
        blocked ? 1.5 : 2,
        hex
      );
      ctx.restore();
    }
  }
}

function drawBirdEchoCopy(birdKind, copyHex, size) {
  const world = boardCellToPixel(copyHex, size, game.state);
  const screen = worldToScreen(world.x, world.y);
  const isKingDuck = birdKind === "kingDuck";
  const fill = isKingDuck ? "#ffcf63" : "#ffd75e";
  const stroke = isKingDuck ? "rgba(255, 179, 92, 0.95)" : "rgba(255,255,255,0.55)";
  ctx.save();
  ctx.globalAlpha = 0.36;
  drawBoardShape(screen.x, screen.y, size * 0.78, fill, stroke, isKingDuck ? 2 : 1.6, copyHex);
  ctx.fillStyle = "rgba(40, 25, 0, 0.85)";
  ctx.font = `${Math.max(12, size * 0.78)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u{1F986}", screen.x, screen.y + 1);
  if (isKingDuck) {
    ctx.font = `${Math.max(11, size * 0.5)}px system-ui`;
    ctx.fillText("\u{1F451}", screen.x, screen.y - size * 0.48);
  }
  ctx.restore();
}

function drawBirdPiece(birdKind, birdHex, size) {
  const world = boardCellToPixel(birdHex, size, game.state);
  const screen = worldToScreen(world.x, world.y);
  const isKingDuck = birdKind === "kingDuck";
  const fill = isKingDuck ? "#ffcf63" : "#ffd75e";
  const stroke = isKingDuck ? "rgba(255, 179, 92, 0.95)" : "rgba(255,255,255,0.55)";

  if (isKingDuck) {
    drawBoardShape(screen.x, screen.y, size * 0.93, "rgba(255, 179, 92, 0.12)", "rgba(255, 179, 92, 0.7)", 2.2, birdHex);
  }

  drawBoardShape(screen.x, screen.y, size * 0.78, fill, stroke, isKingDuck ? 2 : 1.6, birdHex);
  ctx.fillStyle = "rgba(40, 25, 0, 0.85)";
  ctx.font = `${Math.max(12, size * 0.78)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u{1F986}", screen.x, screen.y + 1);

  if (isKingDuck) {
    ctx.font = `${Math.max(11, size * 0.5)}px system-ui`;
    ctx.fillText("\u{1F451}", screen.x, screen.y - size * 0.48);
  }
}

function drawPieces() {
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const lowDetail = size < GRID_LOW_DETAIL_HEX_SIZE;
  const veryLowDetail = size < GRID_VERY_LOW_DETAIL_HEX_SIZE;
  const recentSerials = getRecentSerials(game.state.cells);
  const recentSerialSet = new Set(recentSerials);
  const newestSerial = recentSerials[0];

  for (const [key, cell] of Object.entries(game.state.cells)) {
    const hex = parseKey(key);
    const world = boardCellToPixel(hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }

    const ownerStyle = getPlayerStyle(cell.owner);
    const colour = ownerStyle.hex;
    if (!lowDetail && recentSerialSet.has(cell.serial)) {
      const isNewest = cell.serial === newestSerial;
      const recentStroke = ownerStyle.strongStroke;
      drawBoardShape(
        screen.x,
        screen.y,
        size * (isNewest ? 0.97 : 0.91),
        "rgba(255, 255, 255, 0.05)",
        recentStroke,
        isNewest ? 3 : 2,
        hex
      );
    }

    drawBoardShape(
      screen.x,
      screen.y,
      size * 0.78,
      colour,
      lowDetail ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.45)",
      lowDetail ? 1 : 1.5,
      hex
    );
    if (!veryLowDetail) {
      ctx.fillStyle = "rgba(6, 12, 23, 0.52)";
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, size * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (hasEgyptianRemovalPhase(game.state) && !game.state.winner) {
    const owner = game.state.egyptianRemoval.owner;
    const ownerEntries = getOwnerStoneEntriesSortedByAge(game.state, owner);
    const stroke = getPlayerStyle(owner).strongStroke;

    for (const entry of ownerEntries) {
      if (!canSelectEgyptianRemovalHex(game.state, entry.hex)) {
        continue;
      }
      const world = boardCellToPixel(entry.hex, size, game.state);
      const screen = worldToScreen(world.x, world.y);
      if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
        continue;
      }

      ctx.save();
      ctx.setLineDash([5, 4]);
      drawBoardShape(screen.x, screen.y, size * 1.02, "rgba(255,255,255,0.02)", stroke, 2.3, entry.hex);
      ctx.restore();
    }
  }

  const recentCapRemovalEvents = getLastTurnCapRemovalEvents(game.state);
  for (const event of recentCapRemovalEvents) {
    const world = boardCellToPixel(event.hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }

    const stroke = getPlayerStyle(event.owner).strongStroke;
    const accent = "rgba(230, 245, 255, 0.95)";
    ctx.save();
    drawBoardShape(
      screen.x,
      screen.y,
      size * 0.98,
      "rgba(255, 255, 255, 0.025)",
      stroke,
      2.5,
      event.hex
    );
    ctx.restore();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screen.x - size * 0.17, screen.y - size * 0.17);
    ctx.lineTo(screen.x + size * 0.17, screen.y + size * 0.17);
    ctx.moveTo(screen.x + size * 0.17, screen.y - size * 0.17);
    ctx.lineTo(screen.x - size * 0.17, screen.y + size * 0.17);
    ctx.stroke();
  }

  const recentMeteorRemovalEvents = getLastTurnMeteorRemovalEvents(game.state);
  for (const event of recentMeteorRemovalEvents) {
    const world = boardCellToPixel(event.hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }

    const stroke = "rgba(255, 179, 92, 0.94)";
    const accent = "rgba(255, 231, 189, 0.98)";
    ctx.save();
    ctx.setLineDash([5, 4]);
    drawBoardShape(
      screen.x,
      screen.y,
      size * (event.type === "bird" ? 1.03 : 0.98),
      "rgba(255, 179, 92, 0.06)",
      stroke,
      2.5,
      event.hex
    );
    ctx.restore();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screen.x - size * 0.19, screen.y - size * 0.19);
    ctx.lineTo(screen.x + size * 0.19, screen.y + size * 0.19);
    ctx.moveTo(screen.x + size * 0.19, screen.y - size * 0.19);
    ctx.lineTo(screen.x - size * 0.19, screen.y + size * 0.19);
    ctx.stroke();
  }

  const recentBirdEvents = getLastTurnBirdEvents(game.state);
  for (const event of recentBirdEvents) {
    const world = boardCellToPixel(event.hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }

    const isKingDuck = event.birdKind === "kingDuck";
    const isRemoval = event.action === "remove";
    const stroke = isKingDuck ? "rgba(255, 179, 92, 0.9)" : "rgba(255, 215, 94, 0.9)";
    ctx.save();
    if (isRemoval) {
      ctx.setLineDash([6, 4]);
    }
    drawBoardShape(
      screen.x,
      screen.y,
      size * (isRemoval ? 0.96 : 1.02),
      "rgba(255, 255, 255, 0.03)",
      stroke,
      isRemoval ? 2.2 : 2.8,
      event.hex
    );
    ctx.restore();

    if (isRemoval) {
      ctx.strokeStyle = "rgba(255, 179, 92, 0.88)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(screen.x - size * 0.18, screen.y - size * 0.18);
      ctx.lineTo(screen.x + size * 0.18, screen.y + size * 0.18);
      ctx.moveTo(screen.x + size * 0.18, screen.y - size * 0.18);
      ctx.lineTo(screen.x - size * 0.18, screen.y + size * 0.18);
      ctx.stroke();
    }
  }

  for (const { birdKind, hex } of getBirdEntries(game.state)) {
    const world = boardCellToPixel(hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }
    drawBirdPiece(birdKind, hex, size);
  }

  for (const { birdKind, hex } of getBirdEchoCopyEntries(game.state)) {
    const world = boardCellToPixel(hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }
    drawBirdEchoCopy(birdKind, hex, size);
  }
}

function drawRadialWinnerLine(line, size) {
  if (!line || !Array.isArray(line.cells) || line.cells.length === 0) {
    return;
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  if (line.kind === "ring") {
    const ring = normaliseRadialCell(line.cells[0]).q;
    const origin = worldToScreen(0, 0);
    const radius = ring * getRadialRingPitch(size);
    let startAngle = normaliseRadialCell(line.cells[0]).r * RADIAL_SECTOR_ANGLE;
    let endAngle = normaliseRadialCell(line.cells[line.cells.length - 1]).r * RADIAL_SECTOR_ANGLE;
    while (endAngle < startAngle) {
      endAngle += Math.PI * 2;
    }
    ctx.arc(origin.x, origin.y, radius, startAngle, endAngle);
  } else {
    const first = line.cells[0];
    const last = line.cells[line.cells.length - 1];
    const a = boardCellToPixel(first, size, game.state);
    const b = boardCellToPixel(last, size, game.state);
    const sa = worldToScreen(a.x, a.y);
    const sb = worldToScreen(b.x, b.y);
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(sb.x, sb.y);
  }

  ctx.stroke();
}

function drawWinnerLineHint() {
  if (usesTriangleGridMode(game.state)) {
    return;
  }

  if (!game.state.lastPlacement) {
    return;
  }
  const size = currentHexSize();
  const last = game.state.lastPlacement;
  const lastCell = getCellAt(game.state, last);
  if (!lastCell) {
    return;
  }

  if (usesRadialGridMode(game.state)) {
    const owners = getOwnersForCell(game.state, lastCell);
    if (game.state.winner && owners.includes(game.state.winner)) {
      owners.splice(owners.indexOf(game.state.winner), 1);
      owners.unshift(game.state.winner);
    }

    for (const owner of owners) {
      const line = getRadialWinningLine(game.state, last, owner);
      if (!line) {
        continue;
      }

      drawRadialWinnerLine(line, size);
      return;
    }
    return;
  }

  const owners = getOwnersForCell(game.state, lastCell);
  if (game.state.winner && owners.includes(game.state.winner)) {
    owners.splice(owners.indexOf(game.state.winner), 1);
    owners.unshift(game.state.winner);
  }

  for (const owner of owners) {
    for (const dir of getLineAxesForMode(game.state)) {
      if (getLineCount(game.state, last, owner, dir) < WIN_LENGTH) {
        continue;
      }

      let minStep = 0;
      let maxStep = 0;
      while (true) {
        const pos = { q: last.q + dir.q * (minStep - 1), r: last.r + dir.r * (minStep - 1) };
        if (!countsForOwnerAt(game.state, pos, owner)) {
          break;
        }
        minStep -= 1;
      }
      while (true) {
        const pos = { q: last.q + dir.q * (maxStep + 1), r: last.r + dir.r * (maxStep + 1) };
        if (!countsForOwnerAt(game.state, pos, owner)) {
          break;
        }
        maxStep += 1;
      }

      const a = boardCellToPixel({ q: last.q + dir.q * minStep, r: last.r + dir.r * minStep }, size, game.state);
      const b = boardCellToPixel({ q: last.q + dir.q * maxStep, r: last.r + dir.r * maxStep }, size, game.state);
      const sa = worldToScreen(a.x, a.y);
      const sb = worldToScreen(b.x, b.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
      return;
    }
  }
}

function renderNow() {
  if (!game.state) {
    return;
  }

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  drawGrid();
  drawOriginIndicator();
  drawEchoTargets();
  drawHoverEchoPreview();
  drawMeteorPreview();
  drawOrbitPreview();
  drawKingDuckRadius();
  drawWinnerLineHint();
  drawPieces();

  ui.zoomText.textContent = `Zoom ${game.viewport.zoom.toFixed(2)}x`;
  ui.coordText.textContent = `${getBoardCoordinateLabel(game.state)}: (${game.hoverHex.q}, ${game.hoverHex.r})`;
}

function render() {
  if (game.renderScheduled) {
    return;
  }
  game.renderScheduled = true;
  window.requestAnimationFrame(() => {
    game.renderScheduled = false;
    renderNow();
  });
}

function centreBoard() {
  game.viewport.offsetX = canvas.clientWidth / 2;
  game.viewport.offsetY = canvas.clientHeight / 2;
  game.viewport.zoom = 1;
  render();
}

function newGame(modeKeys = getSelectedModeKeys(), timerConfig = game.timerConfig, turnOrder = getTurnOrderFromInput()) {
  const activeModeKeys = normaliseModeKeys(modeKeys);
  const playerCount = getPlayerCountFromModeKeys(activeModeKeys);
  game.timerConfig = normaliseTimerConfig(timerConfig);
  game.turnOrder = normaliseTurnOrder(turnOrder, playerCount);
  game.egyptianStoneCap = getEgyptianStoneCapFromInputs();
  setTimerInputs(game.timerConfig);
  setTurnOrderInput(game.turnOrder, playerCount);
  setEgyptianCapInput(game.egyptianStoneCap);
  game.state = makeInitialState(activeModeKeys, game.timerConfig, game.egyptianStoneCap);
  const startingPlayer = resolveStartingPlayer(game.turnOrder, playerCount);
  game.state.startingPlayer = startingPlayer;
  game.state.turnPlayer = startingPlayer;
  game.state.clock.activePlayer = startingPlayer;
  ensureClockState(game.state);
  game.history = [];
  game.futureHistory = [];
  centreBoard();
  updateStatus();
  syncClockTickerFromState();
  render();
  broadcastOnlineState({ intent: "newGame" });
}

function fillModePicker() {
  for (const [key, mode] of Object.entries(MODES)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modeToggle";
    button.dataset.mode = key;
    button.textContent = mode.name;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (!canUseAdminControls()) {
        return;
      }
      const nextModeKeys = new Set(getSelectedModeKeys());
      if (nextModeKeys.has(key)) {
        nextModeKeys.delete(key);
      } else {
        if (key === "threePlayer" || key === "fourPlayer") {
          nextModeKeys.delete("threePlayer");
          nextModeKeys.delete("fourPlayer");
        }
        if (GRID_MODE_KEYS.includes(key)) {
          for (const gridModeKey of GRID_MODE_KEYS) {
            nextModeKeys.delete(gridModeKey);
          }
        }
        nextModeKeys.add(key);
      }
      setSelectedModeKeys([...nextModeKeys]);
    });
    ui.modePicker.appendChild(button);
  }
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (game.isPanning) {
    const dx = event.clientX - game.panLast.x;
    const dy = event.clientY - game.panLast.y;
    if (dx === 0 && dy === 0) {
      return;
    }
    game.viewport.offsetX += dx;
    game.viewport.offsetY += dy;
    game.panLast = { x: event.clientX, y: event.clientY };
    render();
    return;
  }

  const world = screenToWorld(x, y);
  const nextHoverHex = pixelToBoardCell(world.x, world.y, currentHexSize(), game.state);
  if (equalHex(nextHoverHex, game.hoverHex)) {
    return;
  }
  game.hoverHex = nextHoverHex;
  render();
});

canvas.addEventListener("mousedown", (event) => {
  if (event.button === 1 || event.button === 2) {
    game.isPanning = true;
    game.panLast = { x: event.clientX, y: event.clientY };
  }
});

window.addEventListener("mouseup", () => {
  game.isPanning = false;
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const factor = event.deltaY < 0 ? 1.12 : 0.89;
  zoomBoardAtScreenPoint(mouseX, mouseY, factor);
}, { passive: false });

canvas.addEventListener("click", (event) => {
  if (event.button !== 0) {
    return;
  }
  if (Date.now() < game.ignoreClickUntil) {
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const world = screenToWorld(x, y);
  const hex = pixelToBoardCell(world.x, world.y, currentHexSize(), game.state);
  clickPlacement(hex);
});

canvas.addEventListener("touchstart", (event) => {
  if (event.touches.length === 1) {
    const t = event.touches[0];
    game.isPanning = true;
    game.touchPanMoved = false;
    game.panLast = { x: t.clientX, y: t.clientY };
    game.touchPinchState = null;
    return;
  }

  if (event.touches.length === 2) {
    const t0 = event.touches[0];
    const t1 = event.touches[1];
    const rect = canvas.getBoundingClientRect();
    const centerX = ((t0.clientX + t1.clientX) / 2) - rect.left;
    const centerY = ((t0.clientY + t1.clientY) / 2) - rect.top;
    game.touchPinchState = {
      distance: Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
    };
    game.touchPanMoved = true;
    game.isPanning = false;
  }
}, { passive: true });

canvas.addEventListener("touchmove", (event) => {
  if (event.touches.length === 1 && game.isPanning) {
    const t = event.touches[0];
    const dx = t.clientX - game.panLast.x;
    const dy = t.clientY - game.panLast.y;
    if (dx !== 0 || dy !== 0) {
      game.viewport.offsetX += dx;
      game.viewport.offsetY += dy;
      game.panLast = { x: t.clientX, y: t.clientY };
      if (!game.touchPanMoved && Math.hypot(dx, dy) > 3) {
        game.touchPanMoved = true;
      }
      render();
    }
    return;
  }

  if (event.touches.length === 2 && game.touchPinchState) {
    event.preventDefault();
    const t0 = event.touches[0];
    const t1 = event.touches[1];
    const rect = canvas.getBoundingClientRect();
    const centerX = ((t0.clientX + t1.clientX) / 2) - rect.left;
    const centerY = ((t0.clientY + t1.clientY) / 2) - rect.top;
    const distance = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const ratio = game.touchPinchState.distance > 0 ? distance / game.touchPinchState.distance : 1;
    zoomBoardAtScreenPoint(centerX, centerY, ratio);
    game.touchPinchState.distance = distance;
  }
}, { passive: false });

canvas.addEventListener("touchend", (event) => {
  if (event.touches.length === 0) {
    if (!game.touchPanMoved) {
      const t = event.changedTouches[0];
      if (t) {
        const rect = canvas.getBoundingClientRect();
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        const world = screenToWorld(x, y);
        const hex = pixelToBoardCell(world.x, world.y, currentHexSize(), game.state);
        clickPlacement(hex);
        game.ignoreClickUntil = Date.now() + 500;
      }
    }
    game.isPanning = false;
    game.touchPanMoved = false;
    game.touchPinchState = null;
    return;
  }

  if (event.touches.length === 1) {
    const t = event.touches[0];
    game.isPanning = true;
    game.panLast = { x: t.clientX, y: t.clientY };
    game.touchPanMoved = false;
    game.touchPinchState = null;
  }
}, { passive: true });

ui.newGameBtn.addEventListener("click", () => {
  if (!canUseAdminControls()) {
    return;
  }
  newGame(getSelectedModeKeys(), getTimerConfigFromInputs());
});

ui.historyBackBtn?.addEventListener("click", () => {
  if (!canUseAdminControls()) {
    return;
  }
  navigateHistoryBack();
});

ui.historyForwardBtn?.addEventListener("click", () => {
  if (!canUseAdminControls()) {
    return;
  }
  navigateHistoryForward();
});

ui.centreBtn.addEventListener("click", () => {
  centreBoard();
});

ui.applyTimerBtn.addEventListener("click", () => {
  if (!canUseAdminControls()) {
    return;
  }
  const timerConfig = getTimerConfigFromInputs();
  newGame(getSelectedModeKeys(), timerConfig);
});

ui.toggleMenuBtn.addEventListener("click", () => {
  const isCollapsed = ui.appRoot.classList.contains("menuCollapsed");
  setOptionsMenuCollapsed(!isCollapsed);
});

function refreshTimerSummaryFromInputs() {
  const timerConfig = getTimerConfigFromInputs();
  ui.timerSummaryText.textContent = formatTimerSummary(timerConfig);
}

function refreshEgyptianCapSummaryFromInputs() {
  if (!ui.egyptianCapSummaryText) {
    return;
  }
  const cap = getEgyptianStoneCapFromInputs();
  ui.egyptianCapSummaryText.textContent = `Cap: ${cap} stones/player`;
}

function isTypingTarget(target) {
  if (!target) {
    return false;
  }
  const tagName = target.tagName;
  return target.isContentEditable
    || tagName === "INPUT"
    || tagName === "SELECT"
    || tagName === "TEXTAREA";
}

function zoomBoardAtScreenPoint(screenX, screenY, factor) {
  const oldSize = currentHexSize();
  const anchorWorld = screenToWorld(screenX, screenY);
  const nextZoom = clampViewportZoom(game.viewport.zoom * factor);
  if (nextZoom === game.viewport.zoom) {
    return;
  }

  game.viewport.zoom = nextZoom;
  const newSize = currentHexSize();
  const scale = oldSize > 0 ? newSize / oldSize : 1;
  game.viewport.offsetX += anchorWorld.x - (anchorWorld.x * scale);
  game.viewport.offsetY += anchorWorld.y - (anchorWorld.y * scale);
  render();
}

function handleKeyboardShortcut(event) {
  if (isTypingTarget(event.target)) {
    return;
  }

  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey) {
    if (canUseAdminControls()) {
      event.preventDefault();
      navigateHistoryBack();
    }
    return;
  }

  if ((event.ctrlKey || event.metaKey) && (key === "y" || (key === "z" && event.shiftKey))) {
    if (canUseAdminControls()) {
      event.preventDefault();
      navigateHistoryForward();
    }
    return;
  }

  if (event.altKey && event.key === "ArrowLeft") {
    if (canUseAdminControls()) {
      event.preventDefault();
      navigateHistoryBack();
    }
    return;
  }

  if (event.altKey && event.key === "ArrowRight") {
    if (canUseAdminControls()) {
      event.preventDefault();
      navigateHistoryForward();
    }
    return;
  }

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (key === "c") {
    event.preventDefault();
    centreBoard();
  } else if (key === "m") {
    event.preventDefault();
    setOptionsMenuCollapsed(!ui.appRoot.classList.contains("menuCollapsed"));
  } else if (key === "n") {
    if (canUseAdminControls()) {
      event.preventDefault();
      newGame(getSelectedModeKeys(), getTimerConfigFromInputs());
    }
  } else if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    zoomBoardAtScreenPoint(canvas.clientWidth / 2, canvas.clientHeight / 2, 1.12);
  } else if (event.key === "-" || event.key === "_") {
    event.preventDefault();
    zoomBoardAtScreenPoint(canvas.clientWidth / 2, canvas.clientHeight / 2, 0.89);
  } else if (event.key === "0") {
    event.preventDefault();
    game.viewport.zoom = 1;
    render();
  }
}

ui.timerMinutesInput.addEventListener("input", refreshTimerSummaryFromInputs);
ui.timerSecondsInput?.addEventListener("input", refreshTimerSummaryFromInputs);
ui.timerIncrementInput.addEventListener("input", refreshTimerSummaryFromInputs);
ui.timerEnabledInput.addEventListener("change", refreshTimerSummaryFromInputs);
ui.egyptianCapInput?.addEventListener("input", refreshEgyptianCapSummaryFromInputs);
ui.turnOrderInput?.addEventListener("change", () => {
  game.turnOrder = getTurnOrderFromInput();
  updateTurnOrderSummary();
});

ui.onlineCreateBtn.addEventListener("click", () => {
  createOnlineRoom();
});

ui.onlineJoinBtn.addEventListener("click", () => {
  joinOnlineRoom();
});

ui.onlineLeaveBtn.addEventListener("click", () => {
  leaveOnlineRoom();
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", handleKeyboardShortcut);
ui.appRoot.addEventListener("transitionend", (event) => {
  if (event.target === ui.appRoot || event.target === canvas || event.target.classList?.contains("sidebar")) {
    resizeCanvas();
  }
});

fillModePicker();
setTimerInputs(game.timerConfig);
setEgyptianCapInput(game.egyptianStoneCap);
updateOnlineStatusUI();
setOptionsMenuCollapsed(false);
setSelectedModeKeys([]);
newGame([], game.timerConfig);
resizeCanvas();

window.HexTicTacToeInternals = {
  supportsMultiPlayerTurnOrder: true,
  ui,
  game,
  normaliseTimerConfig,
  ensureClockState,
  setTimerInputs,
  syncClockTickerFromState,
  render,
  centreBoard,
  broadcastOnlineState,
  makeInitialState,
  getSelectedModeKeys,
  formatClock,
  updateClockUI,
  updateStatus
};
