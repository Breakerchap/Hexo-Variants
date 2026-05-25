const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const perfHelpers = window.HexTicTacToePerf || {};
const timerHelpers = window.HexTicTacToeTimer || {};
const chaosRuleSource = Array.isArray(window.HexTicTacToeChaosRules) ? window.HexTicTacToeChaosRules : [];
const chaosRulesById = new Map(
  chaosRuleSource
    .filter((rule) => rule && typeof rule.id === "string")
    .map((rule) => [rule.id, rule])
);

const ui = {
  appRoot: document.getElementById("appRoot"),
  boardWrap: document.querySelector(".boardWrap"),
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
  secretRuleControls: document.getElementById("secretRuleControls"),
  devRuleControls: document.getElementById("devRuleControls"),
  placementsPerTurnInput: document.getElementById("placementsPerTurnInput"),
  openingPlacementsInput: document.getElementById("openingPlacementsInput"),
  winLengthInput: document.getElementById("winLengthInput"),
  secretRuleSummaryText: document.getElementById("secretRuleSummaryText"),
  riftBloomControls: document.getElementById("riftBloomControls"),
  riftBloomCoverageInput: document.getElementById("riftBloomCoverageInput"),
  riftBloomCoverageSummaryText: document.getElementById("riftBloomCoverageSummaryText"),
  riftBloomDurationInput: document.getElementById("riftBloomDurationInput"),
  riftBloomDurationSummaryText: document.getElementById("riftBloomDurationSummaryText"),
  riftBloomContestInput: document.getElementById("riftBloomContestInput"),
  riftBloomContestSummaryText: document.getElementById("riftBloomContestSummaryText"),
  riftBloomTieControls: document.getElementById("riftBloomTieControls"),
  riftBloomTieCreatorInput: document.getElementById("riftBloomTieCreatorInput"),
  riftBloomTieSummaryText: document.getElementById("riftBloomTieSummaryText"),
  armoryControls: document.getElementById("armoryControls"),
  armoryClassP1Select: document.getElementById("armoryClassP1Select"),
  armoryClassP2Select: document.getElementById("armoryClassP2Select"),
  armoryClassP3Select: document.getElementById("armoryClassP3Select"),
  armoryClassP4Select: document.getElementById("armoryClassP4Select"),
  armoryClassP3Wrap: document.getElementById("armoryClassP3Wrap"),
  armoryClassP4Wrap: document.getElementById("armoryClassP4Wrap"),
  armorySummaryText: document.getElementById("armorySummaryText"),
  armoryCurrencyText: document.getElementById("armoryCurrencyText"),
  armoryActiveClassText: document.getElementById("armoryActiveClassText"),
  armoryPieceSelect: document.getElementById("armoryPieceSelect"),
  armoryShopOffers: document.getElementById("armoryShopOffers"),
  armoryRerollBtn: document.getElementById("armoryRerollBtn"),
  bedSiegeControls: document.getElementById("bedSiegeControls"),
  bedSiegeSummaryText: document.getElementById("bedSiegeSummaryText"),
  bedSiegeResourceText: document.getElementById("bedSiegeResourceText"),
  bedSiegeActiveItemText: document.getElementById("bedSiegeActiveItemText"),
  bedSiegeInventory: document.getElementById("bedSiegeInventory"),
  bedSiegeShop: document.getElementById("bedSiegeShop"),
  factoryControls: document.getElementById("factoryControls"),
  factorySummaryText: document.getElementById("factorySummaryText"),
  factoryActiveActionText: document.getElementById("factoryActiveActionText"),
  factoryBuildSelect: document.getElementById("factoryBuildSelect"),
  factoryActionSelect: document.getElementById("factoryActionSelect"),
  factoryRuleText: document.getElementById("factoryRuleText"),
  bagelControls: document.getElementById("bagelControls"),
  bagelPhaseText: document.getElementById("bagelPhaseText"),
  bagelZoneText: document.getElementById("bagelZoneText"),
  bagelReceiptText: document.getElementById("bagelReceiptText"),
  bagelNextText: document.getElementById("bagelNextText"),
  chaosControls: document.getElementById("chaosControls"),
  chaosVoteText: document.getElementById("chaosVoteText"),
  chaosVoteOptions: document.getElementById("chaosVoteOptions"),
  chaosActiveRules: document.getElementById("chaosActiveRules"),
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
  legendDuck: document.getElementById("legendDuck"),
  legendPig: document.getElementById("legendPig"),
  onlineCreateBtn: document.getElementById("onlineCreateBtn"),
  onlineJoinBtn: document.getElementById("onlineJoinBtn"),
  onlineLeaveBtn: document.getElementById("onlineLeaveBtn"),
  onlineRoomInput: document.getElementById("onlineRoomInput"),
  onlineStatusText: document.getElementById("onlineStatusText"),
  onlineRoomText: document.getElementById("onlineRoomText"),
  onlineRoleText: document.getElementById("onlineRoleText"),
  toggleMenuBtn: document.getElementById("toggleMenuBtn"),
  ldmBtn: document.getElementById("ldmBtn"),
  extremeLdmBtn: document.getElementById("extremeLdmBtn"),
  secretModesBtn: document.getElementById("secretModesBtn")
};

const SQRT3 = Math.sqrt(3);
const COS_22_5 = Math.cos(Math.PI / 8);
const SIN_22_5 = Math.sin(Math.PI / 8);
const DEFAULT_WIN_LENGTH = 6;
const MIN_WIN_LENGTH = 3;
const MAX_WIN_LENGTH = 12;
const DEFAULT_PLACEMENTS_PER_TURN = 2;
const MIN_PLACEMENTS_PER_TURN = 1;
const MAX_PLACEMENTS_PER_TURN = 8;
const DEFAULT_OPENING_PLACEMENTS_PER_TURN = 1;
const MIN_OPENING_PLACEMENTS_PER_TURN = 1;
const MAX_OPENING_PLACEMENTS_PER_TURN = 8;
const MAX_PLACEMENT_DISTANCE = 8;
const CLOCK_TICK_MS = 100;
const GRID_HINT_MIN_HEX_SIZE = 9;
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
const RIFT_BLOOM_GHOST_TURNS = 3;
const RIFT_BLOOM_CONTEST_TURNS = 5;
const MIN_RIFT_BLOOM_GHOST_TURNS = 1;
const MAX_RIFT_BLOOM_GHOST_TURNS = 12;
const RIFT_BLOOM_ANCHOR_FRIENDS = 2;
const RIFT_BLOOM_CELL_MODULUS = 5;
const MIN_RIFT_BLOOM_CELL_MODULUS = 1;
const MAX_RIFT_BLOOM_CELL_MODULUS = 10;
const BAGEL_RECEIPT_STONE_LIMIT = 120;
const BAGEL_SESAME_SPREAD_LIMIT = 2;
const BAGEL_RECEIPT_AUDIT_INTERVAL = 5;
const BAGEL_EFFECT_TILE_PHASE = 0;
const CHAOS_VOTE_INTERVAL = 3;
const CHAOS_RULE_CHOICE_COUNT = 3;
const CHAOS_RECENT_RULE_MEMORY = 12;
const PIG_ESCAPE_BOUNDS_PADDING = 2;
const PIG_ESCAPE_SEARCH_LIMIT = 12000;
const PIG_STARTLE_DISTANCE = 1;
const PIG_STARTLE_MIN_ESCAPE_OPTIONS = 3;
const PIG_MAX_REACTIONS_PER_TURN = 2;
const POWDER_GRAINS_PER_CELL = 20;
const POWDER_PHYSICS_STEPS_AFTER_PLACE = 18;
const POWDER_PHYSICS_STEPS_PER_TURN = 30;
const POWDER_MAX_GRAINS = 2600;
const POWDER_GRAVITY = 0.42;
const POWDER_MAX_FALL_SPEED = 5.2;
const POWDER_GRAIN_RADIUS = 2.6;
const POWDER_COLLISION_DISTANCE = POWDER_GRAIN_RADIUS * 1.95;
const POWDER_FLOOR_CELL_Y = 7;
const POWDER_WIN_CELL_GRAINS = 7;
const POWDER_CONTROL_MIN_LEAD = 2;
const POWDER_PRESSURE_GRAINS_PER_SOURCE = 3;
const POWDER_MAX_PRESSURE_SOURCES = 4;
const POWDER_NEAR_CLAIM_GRAINS = 4;
const BED_SIEGE_BRIDGE_RANGE = 3;
const BED_SIEGE_PEARL_RANGE = 6;
const BED_SIEGE_FIREBALL_RANGE = 5;
const BED_SIEGE_GENERATOR_YIELD_MULTIPLIER = 0.5;
const ARMORY_DEFAULT_CLASS = "vanguard";
const ARMORY_REROLL_GOLD_COST = 2;
const ARMORY_SHOP_SLOTS = 4;
const ARMORY_MAX_END_TURN_SPAWNS = 4;
const ARMORY_CLASS_DEFS = {
  vanguard: {
    name: "Vanguard",
    startGold: 8,
    startArcana: 1,
    incomeGold: 3,
    incomeArcana: 1,
    preferredPiece: "bastion",
    summary: "Defensive economy: better bastions and sturdier frontline growth."
  },
  arcanist: {
    name: "Arcanist",
    startGold: 6,
    startArcana: 3,
    incomeGold: 2,
    incomeArcana: 2,
    preferredPiece: "sage",
    summary: "Spell economy: stronger arcana flow and upgraded summons."
  },
  saboteur: {
    name: "Saboteur",
    startGold: 7,
    startArcana: 2,
    incomeGold: 2,
    incomeArcana: 1,
    preferredPiece: "assassin",
    summary: "Aggressive economy: earns extra gold from enemy losses."
  }
};
const ARMORY_PIECE_ORDER = [
  "militia",
  "lancer",
  "sage",
  "bastion",
  "assassin",
  "oracle",
  "alchemist"
];
const ARMORY_SHOP_POOL = ARMORY_PIECE_ORDER.filter((pieceType) => pieceType !== "militia");
const ARMORY_PIECE_DEFS = {
  militia: {
    name: "Militia",
    symbol: "\u25CB",
    goldCost: 0,
    arcanaCost: 0,
    description: "Baseline unit with infinite stock."
  },
  lancer: {
    name: "Lancer",
    symbol: "\u2694",
    goldCost: 3,
    arcanaCost: 0,
    description: "On placement, pierces and removes one adjacent enemy stone."
  },
  sage: {
    name: "Sage",
    symbol: "S",
    goldCost: 2,
    arcanaCost: 2,
    description: "At turn end, helps spawn nearby reinforcements."
  },
  bastion: {
    name: "Bastion",
    symbol: "B",
    goldCost: 5,
    arcanaCost: 1,
    description: "Projects shields and grants defensive economy bonuses."
  },
  assassin: {
    name: "Assassin",
    symbol: "A",
    goldCost: 4,
    arcanaCost: 2,
    description: "On placement, steals control of one adjacent enemy stone."
  },
  oracle: {
    name: "Oracle",
    symbol: "O",
    goldCost: 3,
    arcanaCost: 3,
    description: "Generates arcana each cycle and sharpens your shop flow."
  },
  alchemist: {
    name: "Alchemist",
    symbol: "X",
    goldCost: 4,
    arcanaCost: 3,
    description: "Upgrades nearby militia into advanced pieces."
  }
};
const BED_SIEGE_RESOURCE_TYPES = ["iron", "gold", "diamond", "emerald"];
const BED_SIEGE_STARTING_RESOURCES = {
  iron: 0,
  gold: 0,
  diamond: 0,
  emerald: 0
};
const BED_SIEGE_ITEM_ORDER = [
  "wool",
  "wood",
  "endStone",
  "obsidian",
  "bridgeEgg",
  "pearl",
  "fireball",
  "shears",
  "axe",
  "pickaxe"
];
const BED_SIEGE_SHOP_ORDER = BED_SIEGE_ITEM_ORDER;
const BED_SIEGE_BLOCK_TYPES = ["wool", "wood", "endStone", "obsidian"];
const BED_SIEGE_ITEM_DEFS = {
  wool: {
    name: "Wool",
    symbol: "W",
    category: "block",
    bundle: 4,
    startingCount: 8,
    cost: { iron: 4 },
    blockType: "wool",
    description: "Cheap bridging and bed defense. Breakable by hand."
  },
  wood: {
    name: "Wood",
    symbol: "D",
    category: "block",
    bundle: 8,
    startingCount: 0,
    cost: { gold: 4 },
    blockType: "wood",
    description: "Axe-resistant bed defense unless the attacker owns an axe."
  },
  endStone: {
    name: "End Stone",
    symbol: "E",
    category: "block",
    bundle: 8,
    startingCount: 0,
    cost: { iron: 12 },
    blockType: "endStone",
    description: "Heavy defense that requires a pickaxe to remove."
  },
  obsidian: {
    name: "Obsidian",
    symbol: "O",
    category: "block",
    bundle: 4,
    startingCount: 0,
    cost: { emerald: 4 },
    blockType: "obsidian",
    description: "Late-game bed shell. Breaking it requires a pickaxe and spends 1 diamond."
  },
  bridgeEgg: {
    name: "Bridge Egg",
    symbol: ">",
    category: "mobility",
    bundle: 1,
    startingCount: 0,
    cost: { diamond: 2, emerald: 1 },
    description: "Builds a short wool bridge up to 3 spaces from your network."
  },
  pearl: {
    name: "Pearl",
    symbol: "*",
    category: "mobility",
    bundle: 1,
    startingCount: 0,
    cost: { emerald: 4 },
    description: "Places a landing wool up to 6 spaces from your network."
  },
  fireball: {
    name: "Fireball",
    symbol: "F",
    category: "attack",
    bundle: 1,
    startingCount: 0,
    cost: { gold: 3, diamond: 1 },
    description: "Blasts defense blocks in a radius-1 area from up to 5 spaces away."
  },
  shears: {
    name: "Shears",
    symbol: "S",
    category: "tool",
    bundle: 1,
    maxCount: 1,
    startingCount: 0,
    cost: { iron: 20 },
    description: "Permanent tool: breaking wool also clears adjacent enemy wool."
  },
  axe: {
    name: "Axe",
    symbol: "A",
    category: "tool",
    bundle: 1,
    maxCount: 1,
    startingCount: 0,
    cost: { iron: 12, gold: 2 },
    description: "Required to remove wood defenses."
  },
  pickaxe: {
    name: "Pickaxe",
    symbol: "P",
    category: "tool",
    bundle: 1,
    maxCount: 1,
    startingCount: 0,
    cost: { iron: 10, gold: 3 },
    description: "Required to remove end stone and obsidian defenses."
  }
};
const BED_SIEGE_BLOCK_STYLES = {
  wool: {
    fill: "rgba(239, 245, 255, 0.86)",
    stroke: "rgba(255, 255, 255, 0.58)",
    text: "#18223a"
  },
  wood: {
    fill: "rgba(177, 116, 67, 0.92)",
    stroke: "rgba(255, 217, 171, 0.58)",
    text: "#fff4dc"
  },
  endStone: {
    fill: "rgba(232, 210, 139, 0.92)",
    stroke: "rgba(255, 243, 187, 0.68)",
    text: "#283047"
  },
  obsidian: {
    fill: "rgba(72, 57, 113, 0.94)",
    stroke: "rgba(188, 172, 255, 0.74)",
    text: "#f1ecff"
  }
};
const FACTORY_CORE_BASE_INTEGRITY = 24;
const FACTORY_REMOTE_STRIKE_RANGE = 4;
const FACTORY_RESOURCE_TYPES = ["ore", "flux", "points"];
const FACTORY_STARTING_RESOURCES = {
  ore: 0,
  flux: 0,
  points: 14
};
const FACTORY_RESOURCE_LABELS = {
  ore: { name: "Ore", short: "o" },
  flux: { name: "Flux", short: "f" },
  points: { name: "Points", short: "pt" }
};
const FACTORY_MODULE_ORDER = ["belt", "miner", "wall", "mine", "forge", "launcher"];
const FACTORY_MODULE_UPGRADES = {
  belt: "forge"
};
const FACTORY_MODULE_DEFS = {
  core: {
    name: "Core",
    symbol: "H",
    fill: "rgba(236, 242, 255, 0.20)",
    cost: {},
    hp: FACTORY_CORE_BASE_INTEGRITY,
    description: "Your home base. Deliver resources here for points, repair it when damaged, and keep it alive."
  },
  belt: {
    name: "Conveyor",
    symbol: ">",
    fill: "rgba(169, 186, 214, 0.30)",
    cost: { points: 4 },
    hp: 1,
    description: "Extends your connected factory line back to your core."
  },
  miner: {
    name: "Miner",
    symbol: "M",
    fill: "rgba(255, 215, 94, 0.24)",
    cost: { points: 6 },
    hp: 1,
    description: "Place beside a resource node. The player with the most adjacent Miner strength controls that node."
  },
  wall: {
    name: "Block",
    symbol: "#",
    fill: "rgba(236, 242, 255, 0.16)",
    cost: { points: 6 },
    hp: 3,
    description: "A tough factory block that absorbs attacks and helps shield your route."
  },
  mine: {
    name: "Blast Charge",
    symbol: "B",
    fill: "rgba(255, 74, 93, 0.22)",
    cost: { points: 10 },
    hp: 1,
    description: "A placeable charge. Click your own connected charge to detonate it against adjacent enemy factory tiles."
  },
  forge: {
    name: "Upgraded Conveyor",
    symbol: "+",
    fill: "rgba(118, 227, 168, 0.22)",
    cost: { points: 8 },
    hp: 2,
    description: "A tougher conveyor that keeps important routes online longer."
  },
  launcher: {
    name: "Cannon",
    symbol: "X",
    fill: "rgba(255, 179, 92, 0.24)",
    cost: { points: 14 },
    hp: 2,
    description: "A connected cannon lets you spend points on remote shots within range."
  }
};
const FACTORY_COMMAND_GROUPS = {
  build: ["belt", "miner", "wall", "mine", "launcher"],
  attack: ["strike", "shot"]
};
const FACTORY_COMMAND_DEFS = {
  belt: {
    name: "Conveyor",
    symbol: ">",
    moduleType: "belt",
    group: "build",
    cost: FACTORY_MODULE_DEFS.belt.cost,
    description: FACTORY_MODULE_DEFS.belt.description
  },
  miner: {
    name: "Miner",
    symbol: "M",
    moduleType: "miner",
    group: "build",
    cost: FACTORY_MODULE_DEFS.miner.cost,
    description: FACTORY_MODULE_DEFS.miner.description
  },
  wall: {
    name: "Block",
    symbol: "#",
    moduleType: "wall",
    group: "build",
    cost: FACTORY_MODULE_DEFS.wall.cost,
    description: FACTORY_MODULE_DEFS.wall.description
  },
  mine: {
    name: "Blast Charge",
    symbol: "B",
    moduleType: "mine",
    group: "build",
    cost: FACTORY_MODULE_DEFS.mine.cost,
    description: FACTORY_MODULE_DEFS.mine.description
  },
  launcher: {
    name: "Cannon",
    symbol: "X",
    moduleType: "launcher",
    group: "build",
    cost: FACTORY_MODULE_DEFS.launcher.cost,
    description: FACTORY_MODULE_DEFS.launcher.description
  },
  strike: {
    name: "Strike Crew",
    symbol: "!",
    group: "attack",
    cost: { points: 3 },
    coreDamage: 4,
    moduleDamage: 2,
    description: "Spend points to hit an adjacent enemy factory tile from your connected network."
  },
  shot: {
    name: "Cannon Shot",
    symbol: "*",
    group: "attack",
    cost: { points: 16 },
    coreDamage: 3,
    moduleDamage: 2,
    description: "Spend points from a connected Cannon to hit an enemy tile up to 4 spaces away."
  }
};
const FACTORY_DEPOSIT_DEFS = {
  ore: {
    name: "Ore",
    symbol: "1",
    fill: "rgba(161, 183, 210, 0.13)",
    stroke: "rgba(202, 218, 238, 0.55)",
    baseValue: 1
  },
  flux: {
    name: "Flux",
    symbol: "3",
    fill: "rgba(255, 215, 94, 0.15)",
    stroke: "rgba(255, 215, 94, 0.70)",
    baseValue: 3
  }
};
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
    summary: "Adds Player 3 to the turn order. The opening turn uses the first-turn setting, then every turn uses the placements-per-turn setting.",
    hint: "Three-player game: turns rotate P1, P2, P3. Connect the target line length to win."
  },
  fourPlayer: {
    name: "4 Players",
    summary: "Adds Players 3 and 4 to the turn order. The opening turn uses the first-turn setting, then every turn uses the placements-per-turn setting.",
    hint: "Four-player game: turns rotate P1, P2, P3, P4. Connect the target line length to win."
  },
  triangleGrid: {
    name: "Triangle Grid",
    summary: "Replaces hex tiles with triangle tiles while keeping the same placement range and line win condition.",
    hint: "Board switches to triangle cells. Place inside triangles and connect the target line length."
  },
  squareGrid: {
    name: "Square Grid",
    summary: "Replaces hex tiles with square tiles while keeping line wins and all other mode rules intact.",
    hint: "Board switches to square cells. Place inside squares and connect the target line length."
  },
  octagonGrid: {
    name: "Octagon Grid",
    summary: "Replaces hex tiles with an octagon tiling that includes the small diamond tiles while keeping line wins and all other mode rules intact.",
    hint: "Board switches to octagons and diamonds. Place in either tile type and connect the target line length."
  },
  radialGrid: {
    name: "Radial Grid",
    summary: "Replaces hex tiles with a polar board. Connect the target line length along a ring or straight outward along a spoke.",
    hint: "Board switches to rings and spokes. Connect the target line length around a ring or outward from the centre."
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
  },
  chaosVote: {
    name: "Rule Vote",
    summary: "Secret rule-draft mode: after every 3 completed turns, the player who just moved chooses one of 3 offered rules from a 50+ rule catalogue.",
    hint: "Every third completed turn pauses for the player who just moved to pick the next rule. Timed rules tick down at turn end; instant rules fire right away.",
    secret: true
  },
  armory: {
    name: "Armoury",
    summary: "Adds classes, currencies, rotating shops, inventory-based piece selection, and piece-specific tactical abilities.",
    hint: "Buy units with gold/arcana, switch active pieces, and combine class passives with board tactics.",
    secret: true
  },
  bedSiege: {
    name: "Bed Siege",
    summary: "Minecraft-style bed rush: islands start with beds and generators, resources buy blocks, tools, and mobility, and breaking every rival bed wins.",
    hint: "Bridge from your island, collect generator resources, shop for defenses and tools, then break exposed enemy beds. Lines do not win in Bed Siege.",
    secret: true
  },
  factoryFoundry: {
    name: "Foundry War",
    summary: "Secret factory duel: each base has two farther Ore nodes, one center Flux node is contested, conveyors deliver capped income home for points, and points buy blocks, cannons, blast charges, repairs, and attacks. Last base standing wins.",
    hint: "Build from your core. Most adjacent Miner strength controls a node. Each Ore pays at most 1 point per turn and the center Flux pays at most 3. Cannons shoot 4 spaces, and Blast Charges damage adjacent factories.",
    secret: true
  },
  everythingBagel: {
    name: "Everything Bagel",
    summary: "Secret rules casserole: red tape blocks spaces, portals teleport stones, schmear slides them, sesame spreads receipts, poppy stamps flip rivals, deli queues advance, and paperwork mutates the board.",
    hint: "Still line wins, technically. Watch the docket: red tape blocks, portals link, schmear slides, sesame sprouts receipt stones, poppy stamps flip adjacent rivals, and end-turn filings move the queue.",
    secret: true
  },
  riftBloom: {
    name: "Rift Bloom",
    summary: "Mirror-threat mode: shimmering rift cells move each turn. Place on one to sprout a mirrored ghost that blocks space, then anchor it beside 2 friendly stones before it fades into nothing.",
    hint: "Shimmering rift cells are live this turn. A move on one creates a mirrored ghost; ghosts do not count for line wins until 2 adjacent friendly stones anchor them at turn end."
  },
  pig: {
    name: "Pig",
    summary: "Escape puzzle: a pig starts at the origin, blocks placement, pathfinds one tile toward open space after the first stone placement each turn, and can startle once more only if an adjacent later stone lands while it still has room. Click an occupied tile to destroy it instead of placing.",
    hint: "Trap the pig to win. You may place a stone or destroy any stone as your move; the pig reacts after the first placement each turn, with one extra adjacent-stone startle only while it still has several escapes.",
    secret: true
  },
  powderCascade: {
    name: "Powder Cascade",
    summary: "Secret powder-sim territory mode: each placement becomes a source pad that pours 20 grains, then your newest source pads drip pressure at turn end. A cell is claimed when one player settles 7 grains there with a clear lead; connect the target number of claimed cells to win.",
    hint: "Place source pads above the lanes you want to flood. Settled grains claim cells by density, ties stay contested, and source pads keep dripping pressure on later turns.",
    secret: true
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
const HIDDEN_MODE_KEYS = new Set(["powderCascade"]);
const LDM_DEVICE_PIXEL_RATIO_CAP = 1.5;
const EXTREME_LDM_DEVICE_PIXEL_RATIO_CAP = 1;
const SECRET_MODE_KEYS = Object.keys(MODES).filter((key) => MODES[key].secret);

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

function positiveMod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function rotateAxial(hex, steps) {
  const normalisedSteps = positiveMod(Math.trunc(Number(steps) || 0), 6);
  let q = Math.trunc(Number(hex?.q) || 0);
  let r = Math.trunc(Number(hex?.r) || 0);
  for (let i = 0; i < normalisedSteps; i += 1) {
    const s = -q - r;
    q = -r;
    r = -s;
  }
  return { q, r };
}

function hasEverythingBagelMode(state) {
  return Boolean(state && hasMode(state, "everythingBagel"));
}

function uniqueSupportedHexes(state, hexes) {
  const byKey = new Map();
  for (const hex of hexes) {
    if (!hex || !Number.isFinite(hex.q) || !Number.isFinite(hex.r)) {
      continue;
    }
    const normalised = { q: Math.trunc(hex.q), r: Math.trunc(hex.r) };
    if (!isCellSupportedForMode(state, normalised)) {
      continue;
    }
    byKey.set(keyOf(normalised.q, normalised.r), normalised);
  }
  return Array.from(byKey.values());
}

function getEverythingBagelZones(state) {
  const phase = BAGEL_EFFECT_TILE_PHASE;
  const redCenter = rotateAxial({ q: 2 + (phase % 4), r: -4 }, phase + 1);
  const redTape = uniqueSupportedHexes(state, [
    redCenter,
    ...getAdjacentsForMode(state, redCenter).slice(0, 4)
  ]);
  const redTapeKeys = new Set(redTape.map((hex) => keyOf(hex.q, hex.r)));
  const withoutRedTape = (hexes) => uniqueSupportedHexes(state, hexes)
    .filter((hex) => !redTapeKeys.has(keyOf(hex.q, hex.r)));
  const portalSeeds = [
    [rotateAxial({ q: 4, r: -1 }, phase), rotateAxial({ q: -2, r: 5 }, phase + 2)],
    [rotateAxial({ q: -5, r: 2 }, phase + 1), rotateAxial({ q: 3, r: -6 }, phase + 4)]
  ];
  const portalPairs = portalSeeds
    .map(([a, b], index) => ({ index, a, b }))
    .filter((pair) => (
      isCellSupportedForMode(state, pair.a)
        && isCellSupportedForMode(state, pair.b)
        && !redTapeKeys.has(keyOf(pair.a.q, pair.a.r))
        && !redTapeKeys.has(keyOf(pair.b.q, pair.b.r))
    ));
  const tollBooths = uniqueSupportedHexes(state, [
    rotateAxial({ q: 1, r: -3 }, phase + 2),
    rotateAxial({ q: -4, r: 3 }, phase + 5),
    rotateAxial({ q: 5, r: -5 }, phase + 3)
  ]).filter((hex) => !redTapeKeys.has(keyOf(hex.q, hex.r)));
  const coupons = withoutRedTape([
    rotateAxial({ q: 0, r: 4 }, phase),
    rotateAxial({ q: -3, r: -1 }, phase + 3)
  ]);
  const schmear = withoutRedTape([
    rotateAxial({ q: -1, r: 3 + (phase % 2) }, phase + 1),
    rotateAxial({ q: 0, r: 3 }, phase + 2),
    rotateAxial({ q: 1, r: 2 + (phase % 3) }, phase + 3)
  ]);
  const sesame = withoutRedTape([
    rotateAxial({ q: -4, r: 0 }, phase + 1),
    rotateAxial({ q: 2, r: 3 }, phase + 2),
    rotateAxial({ q: 4, r: -3 }, phase + 5)
  ]);
  const poppyStamps = withoutRedTape([
    rotateAxial({ q: -1, r: -4 }, phase + 4),
    rotateAxial({ q: 4, r: 1 }, phase + 2)
  ]);
  const queueDirection = dirs[positiveMod(phase + 2, dirs.length)];
  const queueStart = rotateAxial({ q: -3 + (phase % 2), r: 2 }, phase + 1);
  const deliQueue = withoutRedTape(Array.from({ length: 4 }, (_, index) => ({
    q: queueStart.q + queueDirection.q * index,
    r: queueStart.r + queueDirection.r * index
  })));

  return {
    phase,
    portalPairs,
    redTape,
    redTapeKeys,
    tollBooths,
    tollBoothKeys: new Set(tollBooths.map((hex) => keyOf(hex.q, hex.r))),
    coupons,
    couponKeys: new Set(coupons.map((hex) => keyOf(hex.q, hex.r))),
    schmear,
    schmearKeys: new Set(schmear.map((hex) => keyOf(hex.q, hex.r))),
    sesame,
    sesameKeys: new Set(sesame.map((hex) => keyOf(hex.q, hex.r))),
    poppyStamps,
    poppyStampKeys: new Set(poppyStamps.map((hex) => keyOf(hex.q, hex.r))),
    deliQueue,
    deliQueueKeys: new Set(deliQueue.map((hex) => keyOf(hex.q, hex.r)))
  };
}

function isEverythingBagelRedTapeHex(state, hex) {
  if (!hasEverythingBagelMode(state)) {
    return false;
  }
  return getEverythingBagelZones(state).redTapeKeys.has(keyOf(hex.q, hex.r));
}

function getBedSiegeResourceWallet(source = {}) {
  const wallet = {};
  for (const resource of BED_SIEGE_RESOURCE_TYPES) {
    wallet[resource] = Math.max(0, Math.round(Number(source?.[resource]) || 0));
  }
  return wallet;
}

function createBedSiegeInventory(source = {}) {
  const inventory = {};
  for (const itemKey of BED_SIEGE_ITEM_ORDER) {
    const def = BED_SIEGE_ITEM_DEFS[itemKey];
    const fallback = Number.isFinite(Number(def.startingCount)) ? def.startingCount : 0;
    const maxCount = Number.isFinite(Number(def.maxCount)) ? def.maxCount : Infinity;
    inventory[itemKey] = Math.max(0, Math.min(maxCount, Math.round(Number(source?.[itemKey] ?? fallback) || 0)));
  }
  return inventory;
}

function createBedSiegeResources() {
  return getBedSiegeResourceWallet(BED_SIEGE_STARTING_RESOURCES);
}

function getBedSiegeDefaultSelectedItem(inventory = null) {
  if (!inventory || Number(inventory.wool) > 0) {
    return "wool";
  }
  return BED_SIEGE_ITEM_ORDER.find((itemKey) => (inventory[itemKey] || 0) > 0) || "wool";
}

function normaliseBedSiegeSelectedItem(value, inventory = null) {
  const key = String(value || "");
  if (BED_SIEGE_ITEM_DEFS[key] && (!inventory || (inventory[key] || 0) > 0)) {
    return key;
  }
  return getBedSiegeDefaultSelectedItem(inventory);
}

function getBedSiegeBaseSeedForOwner(state, owner) {
  const playerCount = getPlayerCount(state);
  const safeOwner = normalisePlayerNumber(owner, state);

  if (usesRadialGridMode(state)) {
    return {
      q: 8,
      r: normaliseRadialSector(Math.round(((safeOwner - 1) * RADIAL_SECTOR_COUNT) / playerCount))
    };
  }

  const squareLikeSeeds = {
    2: [
      { q: -8, r: 0 },
      { q: 8, r: 0 }
    ],
    3: [
      { q: -8, r: 0 },
      { q: 7, r: -7 },
      { q: 1, r: 8 }
    ],
    4: [
      { q: -8, r: 0 },
      { q: 8, r: 0 },
      { q: 0, r: -8 },
      { q: 0, r: 8 }
    ]
  };
  const axialSeeds = {
    2: [
      { q: -8, r: 3 },
      { q: 8, r: -3 }
    ],
    3: [
      { q: -8, r: 3 },
      { q: 5, r: -8 },
      { q: 3, r: 5 }
    ],
    4: [
      { q: -8, r: 3 },
      { q: 8, r: -3 },
      { q: -3, r: -5 },
      { q: 3, r: 5 }
    ]
  };
  const seeds = (usesSquareGridMode(state) || usesOctagonGridMode(state))
    ? squareLikeSeeds[playerCount]
    : axialSeeds[playerCount];
  return { ...seeds[safeOwner - 1] };
}

function getBedSiegeHomeHexForOwner(state, owner) {
  const seed = getBedSiegeBaseSeedForOwner(state, owner);
  if (usesRadialGridMode(state)) {
    return normaliseRadialCell(seed);
  }
  if (usesOctagonGridMode(state) && !isOctagonTileCoordinate(seed)) {
    return { q: seed.q + 1, r: seed.r + 1 };
  }
  return seed;
}

function getBedSiegeBaseGeneratorHexForOwner(state, owner) {
  const home = getBedSiegeHomeHexForOwner(state, owner);
  const candidates = getAdjacentsForMode(state, home)
    .filter((hex) => isCellSupportedForMode(state, hex))
    .sort((a, b) => (
      getDistanceForMode(state, b) - getDistanceForMode(state, a)
      || a.q - b.q
      || a.r - b.r
    ));
  return candidates[0] || home;
}

function getBedSiegeBaseIslandCellsForOwner(state, owner) {
  const home = getBedSiegeHomeHexForOwner(state, owner);
  return uniqueSupportedHexes(state, [
    home,
    ...getAdjacentsForMode(state, home),
    ...getAdjacentsForMode(state, home).flatMap((hex) => getAdjacentsForMode(state, hex))
  ]).filter((hex) => getDistanceForMode(state, hex, home) <= 2);
}

function getBedSiegeNeutralGenerators(state) {
  if (usesRadialGridMode(state)) {
    const playerCount = getPlayerCount(state);
    const diamondSectors = Array.from({ length: Math.max(2, playerCount) }, (_, index) => (
      normaliseRadialSector(Math.round(((index + 0.5) * RADIAL_SECTOR_COUNT) / Math.max(2, playerCount)))
    ));
    return [
      ...diamondSectors.map((sector, index) => ({
        id: `diamond-${index + 1}`,
        type: "diamond",
        hex: { q: 3, r: sector },
        income: { diamond: 1 }
      })),
      {
        id: "emerald-mid",
        type: "emerald",
        hex: { q: 0, r: 0 },
        income: { emerald: 1 },
        every: 2
      }
    ];
  }

  const diamondSeeds = usesOctagonGridMode(state)
    ? [{ q: 0, r: -4 }, { q: 0, r: 4 }, { q: -4, r: 0 }, { q: 4, r: 0 }]
    : usesSquareGridMode(state)
      ? [{ q: 0, r: -3 }, { q: 0, r: 3 }, { q: -3, r: 0 }, { q: 3, r: 0 }]
      : [{ q: 0, r: -4 }, { q: 0, r: 4 }, { q: -4, r: 2 }, { q: 4, r: -2 }];
  const generators = diamondSeeds
    .filter((hex, index) => getPlayerCount(state) > 2 || index < 2)
    .map((hex, index) => ({
      id: `diamond-${index + 1}`,
      type: "diamond",
      hex,
      income: { diamond: 1 }
    }))
    .filter((generator) => isCellSupportedForMode(state, generator.hex));

  const emeraldHex = { q: 0, r: 0 };
  if (isCellSupportedForMode(state, emeraldHex)) {
    generators.push({
      id: "emerald-mid",
      type: "emerald",
      hex: emeraldHex,
      income: { emerald: 1 },
      every: 2
    });
  }
  return generators;
}

function isBedSiegeGeneratorHex(state, hex) {
  if (!usesBedSiegeMode(state)) {
    return false;
  }
  for (const owner of getPlayerNumbers(state)) {
    if (equalHex(getBedSiegeBaseGeneratorHexForOwner(state, owner), hex)) {
      return true;
    }
  }
  return getBedSiegeNeutralGenerators(state).some((generator) => equalHex(generator.hex, hex));
}

function createBedSiegeStateForGame(state) {
  return {
    beds: createPlayerMap(getPlayerCount(state), (owner) => ({
      hex: getBedSiegeHomeHexForOwner(state, owner),
      alive: true,
      brokenBy: null,
      brokenTurn: null
    })),
    resources: createPlayerMap(getPlayerCount(state), () => createBedSiegeResources()),
    inventory: createPlayerMap(getPlayerCount(state), () => createBedSiegeInventory()),
    selectedItem: createPlayerMap(getPlayerCount(state), () => "wool"),
    generatorTicks: {},
    generatorRemainders: {}
  };
}

function placeBedSiegeBedCells(state) {
  if (!usesBedSiegeMode(state)) {
    return;
  }
  const bedSiege = state.bedSiege;
  for (const owner of getPlayerNumbers(state)) {
    const bed = bedSiege?.beds?.[owner];
    if (!bed?.hex) {
      continue;
    }
    const key = keyOf(bed.hex.q, bed.hex.r);
    const existing = state.cells[key];
    if (bed.alive === false) {
      if (existing?.bedSiegeBed) {
        existing.bedSiegeBed = false;
        existing.bedSiegeBrokenBed = true;
      }
      continue;
    }
    if (existing && existing.kind === "stone" && existing.owner === owner) {
      existing.bedSiegeBed = true;
      existing.bedSiegeBlockType = null;
      continue;
    }
    state.moveSerial += 1;
    state.cells[key] = {
      owner,
      kind: "stone",
      serial: state.moveSerial,
      bedSiegeBed: true
    };
  }
}

function ensureBedSiegeState(state) {
  if (!usesBedSiegeMode(state)) {
    if (state) {
      state.bedSiege = null;
    }
    return null;
  }

  if (!state.bedSiege || typeof state.bedSiege !== "object") {
    state.bedSiege = createBedSiegeStateForGame(state);
    placeBedSiegeBedCells(state);
    return state.bedSiege;
  }

  const currentBeds = state.bedSiege.beds && typeof state.bedSiege.beds === "object"
    ? state.bedSiege.beds
    : {};
  const currentResources = state.bedSiege.resources && typeof state.bedSiege.resources === "object"
    ? state.bedSiege.resources
    : {};
  const currentInventory = state.bedSiege.inventory && typeof state.bedSiege.inventory === "object"
    ? state.bedSiege.inventory
    : {};
  const currentSelected = state.bedSiege.selectedItem && typeof state.bedSiege.selectedItem === "object"
    ? state.bedSiege.selectedItem
    : {};

  state.bedSiege.beds = createPlayerMap(getPlayerCount(state), (owner) => {
    const bed = currentBeds[owner];
    const fallbackHex = getBedSiegeHomeHexForOwner(state, owner);
    const rawHex = bed?.hex || fallbackHex;
    const hex = usesRadialGridMode(state) ? normaliseRadialCell(rawHex) : {
      q: Math.trunc(Number(rawHex.q) || 0),
      r: Math.trunc(Number(rawHex.r) || 0)
    };
    return {
      hex,
      alive: bed?.alive !== false,
      brokenBy: bed?.brokenBy ? normalisePlayerNumber(bed.brokenBy, state) : null,
      brokenTurn: Number.isInteger(bed?.brokenTurn) ? bed.brokenTurn : null
    };
  });
  state.bedSiege.resources = createPlayerMap(getPlayerCount(state), (owner) => (
    getBedSiegeResourceWallet(currentResources[owner] || BED_SIEGE_STARTING_RESOURCES)
  ));
  state.bedSiege.inventory = createPlayerMap(getPlayerCount(state), (owner) => (
    createBedSiegeInventory(currentInventory[owner])
  ));
  state.bedSiege.selectedItem = createPlayerMap(getPlayerCount(state), (owner) => (
    normaliseBedSiegeSelectedItem(currentSelected[owner], state.bedSiege.inventory[owner])
  ));
  if (!state.bedSiege.generatorTicks || typeof state.bedSiege.generatorTicks !== "object") {
    state.bedSiege.generatorTicks = {};
  }
  if (!state.bedSiege.generatorRemainders || typeof state.bedSiege.generatorRemainders !== "object") {
    state.bedSiege.generatorRemainders = {};
  }
  placeBedSiegeBedCells(state);
  return state.bedSiege;
}

function appendStateLog(state, text) {
  if (!state || !text) {
    return;
  }
  if (state === game.state) {
    pushLog(text);
    return;
  }
  state.log = Array.isArray(state.log) ? state.log : [];
  state.log.unshift(text);
  state.log = state.log.slice(0, 26);
}

function getBedSiegeBed(state, owner) {
  const bedSiege = ensureBedSiegeState(state);
  if (!bedSiege) {
    return null;
  }
  return bedSiege.beds[normalisePlayerNumber(owner, state)] || null;
}

function getBedSiegeBedOwnerAt(state, hex, aliveOnly = true) {
  if (!usesBedSiegeMode(state)) {
    return 0;
  }
  const bedSiege = ensureBedSiegeState(state);
  for (const owner of getPlayerNumbers(state)) {
    const bed = bedSiege.beds[owner];
    if (!bed || !bed.hex || (aliveOnly && !bed.alive)) {
      continue;
    }
    if (equalHex(bed.hex, hex)) {
      return owner;
    }
  }
  return 0;
}

function getBedSiegeSummary(state) {
  if (!usesBedSiegeMode(state)) {
    return "";
  }
  const bedSiege = ensureBedSiegeState(state);
  return getPlayerNumbers(state).map((owner) => {
    const bed = bedSiege.beds[owner];
    if (!bed) {
      return `P${owner}: no bed`;
    }
    return `P${owner}: ${bed.alive ? "bed" : "out"}`;
  }).join(" | ");
}

function getBedSiegeResourceSummary(state) {
  if (!usesBedSiegeMode(state)) {
    return "";
  }
  const bedSiege = ensureBedSiegeState(state);
  return getPlayerNumbers(state).map((owner) => {
    const wallet = bedSiege.resources[owner];
    return `P${owner} ${wallet.iron}i/${wallet.gold}g/${wallet.diamond}d/${wallet.emerald}e`;
  }).join(" | ");
}

function getBedSiegeItemDef(itemKey) {
  return BED_SIEGE_ITEM_DEFS[itemKey] || BED_SIEGE_ITEM_DEFS.wool;
}

function getBedSiegeInventoryCount(state, owner, itemKey) {
  const bedSiege = ensureBedSiegeState(state);
  const safeItem = BED_SIEGE_ITEM_DEFS[itemKey] ? itemKey : "wool";
  return Math.max(0, Math.round(Number(bedSiege.inventory?.[owner]?.[safeItem]) || 0));
}

function getBedSiegeSelectedItem(state, owner) {
  const bedSiege = ensureBedSiegeState(state);
  const inventory = bedSiege.inventory[owner];
  return normaliseBedSiegeSelectedItem(bedSiege.selectedItem[owner], inventory);
}

function isBedSiegeBedCell(cell) {
  return Boolean(cell && cell.kind === "stone" && cell.bedSiegeBed);
}

function isBedSiegeBlockCell(cell) {
  return Boolean(cell && cell.kind === "stone" && BED_SIEGE_BLOCK_TYPES.includes(cell.bedSiegeBlockType));
}

function getBedSiegeBlockType(cell) {
  return BED_SIEGE_BLOCK_TYPES.includes(cell?.bedSiegeBlockType) ? cell.bedSiegeBlockType : "wool";
}

function canBedSiegePlayerAct(state, owner) {
  const bed = getBedSiegeBed(state, owner);
  return Boolean(bed?.alive);
}

function getBedSiegeAliveOwners(state) {
  const bedSiege = ensureBedSiegeState(state);
  return getPlayerNumbers(state).filter((owner) => bedSiege.beds[owner]?.alive);
}

function getBedSiegeWinner(state) {
  if (!usesBedSiegeMode(state)) {
    return 0;
  }
  const aliveOwners = getBedSiegeAliveOwners(state);
  if (aliveOwners.length === 1) {
    return aliveOwners[0];
  }
  return 0;
}

function breakBedSiegeBed(state, owner, breaker = null, sourceHex = null, options = {}) {
  if (!usesBedSiegeMode(state)) {
    return null;
  }
  const bedSiege = ensureBedSiegeState(state);
  const safeOwner = normalisePlayerNumber(owner, state);
  const bed = bedSiege.beds[safeOwner];
  if (!bed || !bed.alive) {
    return null;
  }

  const safeBreaker = breaker && isValidPlayerNumber(breaker, state) ? normalisePlayerNumber(breaker, state) : null;
  bed.alive = false;
  bed.brokenBy = safeBreaker;
  bed.brokenTurn = state.turnCount;
  const bedCell = getCellAt(state, bed.hex);
  if (bedCell && bedCell.owner === safeOwner) {
    bedCell.bedSiegeBed = false;
    bedCell.bedSiegeBrokenBed = true;
  }

  const sourceText = sourceHex ? ` at (${sourceHex.q}, ${sourceHex.r})` : "";
  const breakerText = safeBreaker ? ` by Player ${safeBreaker}` : "";
  const message = `Bed Siege: Player ${safeOwner}'s bed broke${breakerText}${sourceText}.`;
  if (options.log !== false) {
    appendStateLog(state, message);
  }
  return message;
}

function handleBedSiegeStoneRemoved(state, hex, removedCell) {
  if (!usesBedSiegeMode(state) || !removedCell || removedCell.kind !== "stone") {
    return null;
  }
  if (!removedCell.bedSiegeBed) {
    return null;
  }
  const bedOwner = getBedSiegeBedOwnerAt(state, hex, true);
  if (bedOwner) {
    return breakBedSiegeBed(state, bedOwner, null, hex);
  }
  return null;
}

function applyBedSiegePlacementEffects(state, placedHex, owner) {
  return usesBedSiegeMode(state) && placedHex && owner ? [] : [];
}

function getBedSiegeNetworkAnchors(state, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  const anchors = [];
  const bed = getBedSiegeBed(state, safeOwner);
  if (bed?.alive) {
    anchors.push({ ...bed.hex });
  }
  for (const [key, cell] of Object.entries(state.cells)) {
    if (!cell || cell.kind !== "stone" || cell.owner !== safeOwner || cell.bedSiegeBrokenBed) {
      continue;
    }
    anchors.push(parseKey(key));
  }
  return uniqueSupportedHexes(state, anchors);
}

function getBedSiegeNearestNetworkAnchor(state, owner, hex, maxRange = 1) {
  return getBedSiegeNetworkAnchors(state, owner)
    .filter((anchor) => getDistanceForMode(state, anchor, hex) <= maxRange)
    .sort((a, b) => (
      getDistanceForMode(state, a, hex) - getDistanceForMode(state, b, hex)
      || getDistanceForMode(state, a) - getDistanceForMode(state, b)
      || a.q - b.q
      || a.r - b.r
    ))[0] || null;
}

function canBedSiegeReachHex(state, owner, hex, maxRange = 1) {
  return Boolean(getBedSiegeNearestNetworkAnchor(state, owner, hex, maxRange));
}

function isBedSiegeBuildableHex(state, hex, owner, maxRange = 1) {
  if (!usesBedSiegeMode(state) || !canBedSiegePlayerAct(state, owner)) {
    return false;
  }
  if (!isCellSupportedForMode(state, hex) || isOccupied(state, hex)) {
    return false;
  }
  if (isHexBlockedBySpecials(state, hex) || isEverythingBagelRedTapeHex(state, hex)) {
    return false;
  }
  if (isBedSiegeGeneratorHex(state, hex)) {
    return false;
  }
  return canBedSiegeReachHex(state, owner, hex, maxRange);
}

function isLegalBedSiegePlacement(state, hex, owner = state.turnPlayer) {
  const itemKey = getBedSiegeSelectedItem(state, owner);
  const itemDef = getBedSiegeItemDef(itemKey);
  if (itemDef.category === "block") {
    return getBedSiegeInventoryCount(state, owner, itemKey) > 0
      && isBedSiegeBuildableHex(state, hex, owner, 1);
  }
  if (itemKey === "bridgeEgg") {
    return getBedSiegeInventoryCount(state, owner, itemKey) > 0
      && Boolean(getBedSiegeBridgePath(state, owner, hex));
  }
  if (itemKey === "pearl") {
    return getBedSiegeInventoryCount(state, owner, itemKey) > 0
      && isBedSiegeBuildableHex(state, hex, owner, BED_SIEGE_PEARL_RANGE);
  }
  return false;
}

function getBedSiegeStepToward(state, fromHex, targetHex) {
  const currentDistance = getDistanceForMode(state, fromHex, targetHex);
  return getAdjacentsForMode(state, fromHex)
    .filter((candidate) => isCellSupportedForMode(state, candidate))
    .filter((candidate) => getDistanceForMode(state, candidate, targetHex) < currentDistance)
    .sort((a, b) => (
      getDistanceForMode(state, a, targetHex) - getDistanceForMode(state, b, targetHex)
      || a.q - b.q
      || a.r - b.r
    ))[0] || null;
}

function getBedSiegeBridgePathFromAnchor(state, owner, anchor, targetHex) {
  const distance = getDistanceForMode(state, anchor, targetHex);
  if (distance <= 0 || distance > BED_SIEGE_BRIDGE_RANGE) {
    return null;
  }
  const path = [];
  let cursor = { ...anchor };
  for (let step = 0; step < distance; step += 1) {
    const next = getBedSiegeStepToward(state, cursor, targetHex);
    if (!next || !isBedSiegeBuildableHex(state, next, owner, BED_SIEGE_BRIDGE_RANGE)) {
      return null;
    }
    if (path.some((hex) => equalHex(hex, next))) {
      return null;
    }
    path.push(next);
    cursor = next;
  }
  return equalHex(cursor, targetHex) ? path : null;
}

function getBedSiegeBridgePath(state, owner, targetHex) {
  if (!isCellSupportedForMode(state, targetHex) || isOccupied(state, targetHex) || isBedSiegeGeneratorHex(state, targetHex)) {
    return null;
  }
  const anchors = getBedSiegeNetworkAnchors(state, owner)
    .filter((anchor) => getDistanceForMode(state, anchor, targetHex) <= BED_SIEGE_BRIDGE_RANGE)
    .sort((a, b) => (
      getDistanceForMode(state, a, targetHex) - getDistanceForMode(state, b, targetHex)
      || a.q - b.q
      || a.r - b.r
    ));
  for (const anchor of anchors) {
    const path = getBedSiegeBridgePathFromAnchor(state, owner, anchor, targetHex);
    if (path?.length) {
      return path;
    }
  }
  return null;
}

function formatBedSiegeCost(cost = {}) {
  const parts = BED_SIEGE_RESOURCE_TYPES
    .filter((resource) => Number(cost[resource]) > 0)
    .map((resource) => `${Math.round(cost[resource])}${resource[0]}`);
  return parts.length > 0 ? parts.join("/") : "free";
}

function canAffordBedSiegeItem(state, owner, itemKey) {
  const itemDef = getBedSiegeItemDef(itemKey);
  const bedSiege = ensureBedSiegeState(state);
  const wallet = bedSiege.resources[owner];
  const maxCount = Number.isFinite(Number(itemDef.maxCount)) ? itemDef.maxCount : Infinity;
  if (bedSiege.inventory[owner][itemKey] >= maxCount) {
    return false;
  }
  return BED_SIEGE_RESOURCE_TYPES.every((resource) => wallet[resource] >= (itemDef.cost?.[resource] || 0));
}

function spendBedSiegeResources(state, owner, cost = {}) {
  const bedSiege = ensureBedSiegeState(state);
  const wallet = bedSiege.resources[owner];
  for (const resource of BED_SIEGE_RESOURCE_TYPES) {
    wallet[resource] = Math.max(0, wallet[resource] - Math.max(0, Math.round(Number(cost[resource]) || 0)));
  }
}

function gainBedSiegeResources(state, owner, gain = {}) {
  if (!isValidPlayerNumber(owner, state)) {
    return;
  }
  const bedSiege = ensureBedSiegeState(state);
  const wallet = bedSiege.resources[owner];
  for (const resource of BED_SIEGE_RESOURCE_TYPES) {
    wallet[resource] += Math.max(0, Math.round(Number(gain[resource]) || 0));
  }
}

function consumeBedSiegeInventoryItem(state, owner, itemKey, amount = 1) {
  const bedSiege = ensureBedSiegeState(state);
  const safeItem = BED_SIEGE_ITEM_DEFS[itemKey] ? itemKey : "wool";
  const count = Math.max(0, Math.round(Number(amount) || 0));
  bedSiege.inventory[owner][safeItem] = Math.max(0, bedSiege.inventory[owner][safeItem] - count);
  if (bedSiege.inventory[owner][safeItem] <= 0 && bedSiege.selectedItem[owner] === safeItem) {
    bedSiege.selectedItem[owner] = getBedSiegeDefaultSelectedItem(bedSiege.inventory[owner]);
  }
}

function addBedSiegeInventoryItem(state, owner, itemKey, amount = 1) {
  const itemDef = getBedSiegeItemDef(itemKey);
  const bedSiege = ensureBedSiegeState(state);
  const maxCount = Number.isFinite(Number(itemDef.maxCount)) ? itemDef.maxCount : Infinity;
  bedSiege.inventory[owner][itemKey] = Math.min(
    maxCount,
    bedSiege.inventory[owner][itemKey] + Math.max(0, Math.round(Number(amount) || 0))
  );
}

function placeBedSiegeBlock(state, hex, owner, blockType) {
  const safeBlock = BED_SIEGE_BLOCK_TYPES.includes(blockType) ? blockType : "wool";
  placeStone(state, hex, owner, "stone", {
    bedSiegeBlockType: safeBlock,
    bedSiegeWool: safeBlock === "wool",
    pieceType: usesArmoryMode(state) ? "militia" : undefined
  });
}

function isBedSiegeBedExposed(state, owner) {
  const bed = getBedSiegeBed(state, owner);
  if (!bed?.alive) {
    return false;
  }
  return !getAdjacentsForMode(state, bed.hex).some((hex) => {
    const cell = getCellAt(state, hex);
    return cell && cell.owner === owner && isBedSiegeBlockCell(cell);
  });
}

function hasBedSiegeAdjacentAttackBlock(state, owner, bedOwner) {
  const bed = getBedSiegeBed(state, bedOwner);
  if (!bed?.alive) {
    return false;
  }
  const safeOwner = normalisePlayerNumber(owner, state);
  return getAdjacentsForMode(state, bed.hex).some((hex) => {
    const cell = getCellAt(state, hex);
    return cell
      && cell.kind === "stone"
      && cell.owner === safeOwner
      && isBedSiegeBlockCell(cell);
  });
}

function canBedSiegeBreakBed(state, owner, bedOwner) {
  if (!usesBedSiegeMode(state) || !canBedSiegePlayerAct(state, owner)) {
    return false;
  }
  const safeOwner = normalisePlayerNumber(owner, state);
  const safeBedOwner = normalisePlayerNumber(bedOwner, state);
  if (safeOwner === safeBedOwner) {
    return false;
  }
  return hasBedSiegeAdjacentAttackBlock(state, safeOwner, safeBedOwner)
    && isBedSiegeBedExposed(state, safeBedOwner);
}

function getBedSiegeBlockBreakFailure(state, owner, targetCell) {
  const blockType = getBedSiegeBlockType(targetCell);
  const bedSiege = ensureBedSiegeState(state);
  const inventory = bedSiege.inventory[owner];
  if (blockType === "wood" && inventory.axe <= 0) {
    return "Need an axe to break wood.";
  }
  if (blockType === "endStone" && inventory.pickaxe <= 0) {
    return "Need a pickaxe to break end stone.";
  }
  if (blockType === "obsidian") {
    if (inventory.pickaxe <= 0) {
      return "Need a pickaxe to break obsidian.";
    }
    if (bedSiege.resources[owner].diamond < 1) {
      return "Need 1 diamond to crack obsidian.";
    }
  }
  return "";
}

function payBedSiegeBreakCost(state, owner, targetCell) {
  if (getBedSiegeBlockType(targetCell) === "obsidian") {
    spendBedSiegeResources(state, owner, { diamond: 1 });
  }
}

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || ""));
  if (!match) {
    return { r: 239, g: 245, b: 255 };
  }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  };
}

function rgbaFromRgb(rgb, alpha = 1) {
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${Math.max(0, Math.min(1, alpha))})`;
}

function mixRgb(a, b, amount) {
  const t = Math.max(0, Math.min(1, Number(amount) || 0));
  return {
    r: a.r + ((b.r - a.r) * t),
    g: a.g + ((b.g - a.g) * t),
    b: a.b + ((b.b - a.b) * t)
  };
}

function getBedSiegePastelTeamFill(ownerStyle) {
  return rgbaFromRgb(mixRgb(hexToRgb(ownerStyle?.hex), { r: 255, g: 255, b: 255 }, 0.5), 0.94);
}

function getBedSiegeFireballTargets(state, centerHex) {
  return uniqueSupportedHexes(state, [
    centerHex,
    ...getAdjacentsForMode(state, centerHex)
  ]).filter((hex) => {
    const cell = getCellAt(state, hex);
    return cell && isBedSiegeBlockCell(cell) && !isBedSiegeBedCell(cell);
  });
}

function getBedSiegeShearTargets(state, owner, centerHex) {
  const centerCell = getCellAt(state, centerHex);
  if (!centerCell || getBedSiegeBlockType(centerCell) !== "wool") {
    return [centerHex];
  }
  if (getBedSiegeInventoryCount(state, owner, "shears") <= 0) {
    return [centerHex];
  }
  return uniqueSupportedHexes(state, [
    centerHex,
    ...getAdjacentsForMode(state, centerHex)
  ]).filter((hex) => {
    const cell = getCellAt(state, hex);
    return cell
      && cell.kind === "stone"
      && cell.owner !== owner
      && isBedSiegeBlockCell(cell)
      && getBedSiegeBlockType(cell) === "wool";
  });
}

function getBedSiegeAdjacentGeneratorBlockCount(state, generatorHex, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  let count = 0;
  for (const candidate of getAdjacentsForMode(state, generatorHex)) {
    const cell = getCellAt(state, candidate);
    if (cell && cell.kind === "stone" && cell.owner === safeOwner) {
      count += 1;
    }
  }
  return count;
}

function getBedSiegeGeneratorControl(state, generatorHex) {
  const blockCountsByOwner = new Map();
  for (const candidate of getAdjacentsForMode(state, generatorHex)) {
    const cell = getCellAt(state, candidate);
    if (!cell || cell.kind !== "stone" || !isValidPlayerNumber(cell.owner, state)) {
      continue;
    }
    const owner = normalisePlayerNumber(cell.owner, state);
    const bed = getBedSiegeBed(state, owner);
    if (!bed?.alive) {
      continue;
    }
    blockCountsByOwner.set(owner, (blockCountsByOwner.get(owner) || 0) + 1);
  }
  const controlledEntries = Array.from(blockCountsByOwner.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  if (controlledEntries.length <= 0) {
    return { controller: 0, blockCount: 0 };
  }
  const [controller, blockCount] = controlledEntries[0];
  if (controlledEntries[1]?.[1] === blockCount) {
    return { controller: 0, blockCount: 0 };
  }
  return { controller, blockCount };
}

function getBedSiegeGeneratorController(state, generatorHex) {
  return getBedSiegeGeneratorControl(state, generatorHex).controller;
}

function getBedSiegeGeneratorRemainderBucket(bedSiege, generatorId, owner) {
  const key = `${generatorId}:P${owner}`;
  const source = bedSiege.generatorRemainders?.[key] && typeof bedSiege.generatorRemainders[key] === "object"
    ? bedSiege.generatorRemainders[key]
    : {};
  const bucket = {};
  for (const resource of BED_SIEGE_RESOURCE_TYPES) {
    const amount = Number(source[resource]);
    bucket[resource] = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  }
  bedSiege.generatorRemainders[key] = bucket;
  return bucket;
}

function getScaledBedSiegeGeneratorIncome(state, generator, owner, blockCount) {
  const bedSiege = ensureBedSiegeState(state);
  const adjacentBlocks = Math.max(0, Math.round(Number(blockCount) || 0));
  const remainderBucket = getBedSiegeGeneratorRemainderBucket(bedSiege, generator.id, owner);
  const income = {};

  for (const [resource, amount] of Object.entries(generator.income || {})) {
    if (!BED_SIEGE_RESOURCE_TYPES.includes(resource)) {
      continue;
    }
    const scaledAmount = Math.max(0, Number(amount) || 0)
      * adjacentBlocks
      * BED_SIEGE_GENERATOR_YIELD_MULTIPLIER;
    if (scaledAmount <= 0) {
      continue;
    }
    const total = remainderBucket[resource] + scaledAmount;
    const wholeAmount = Math.floor(total);
    remainderBucket[resource] = total - wholeAmount;
    if (wholeAmount > 0) {
      income[resource] = wholeAmount;
    }
  }

  return income;
}

function getBedSiegeBaseGeneratorEffectiveBlockCount(blockCount) {
  const adjacentBlocks = Math.max(0, Math.round(Number(blockCount) || 0));
  if (adjacentBlocks <= 0) {
    return 0;
  }
  return 1 + Math.floor(Math.max(0, adjacentBlocks - 1) / 2);
}

function getFlatBedSiegeGeneratorIncome(generator) {
  const income = {};
  for (const [resource, amount] of Object.entries(generator.income || {})) {
    if (!BED_SIEGE_RESOURCE_TYPES.includes(resource)) {
      continue;
    }
    const wholeAmount = Math.floor(Math.max(0, Number(amount) || 0));
    if (wholeAmount > 0) {
      income[resource] = wholeAmount;
    }
  }
  return income;
}

function formatBedSiegeResourceGain(gain = {}) {
  return Object.entries(gain)
    .filter(([, amount]) => amount > 0)
    .map(([resource, amount]) => `+${amount}${resource[0]}`)
    .join("/");
}

function resolveBedSiegeTurnEnd(state, owner) {
  if (!usesBedSiegeMode(state)) {
    return null;
  }
  const bedSiege = ensureBedSiegeState(state);
  const safeOwner = normalisePlayerNumber(owner, state);
  const incomeLines = [];

  if (bedSiege.beds[safeOwner]?.alive) {
    const baseGeneratorHex = getBedSiegeBaseGeneratorHexForOwner(state, safeOwner);
    const baseBlockCount = getBedSiegeAdjacentGeneratorBlockCount(state, baseGeneratorHex, safeOwner);
    const effectiveBaseBlockCount = getBedSiegeBaseGeneratorEffectiveBlockCount(baseBlockCount);
    const baseIncome = getScaledBedSiegeGeneratorIncome(
      state,
      {
        id: `base-${safeOwner}`,
        income: { iron: 4, gold: state.turnCount % 2 === 0 ? 2 : 1 }
      },
      safeOwner,
      effectiveBaseBlockCount
    );
    const baseGainText = formatBedSiegeResourceGain(baseIncome);
    if (baseGainText) {
      gainBedSiegeResources(state, safeOwner, baseIncome);
      incomeLines.push(`P${safeOwner} base ${baseGainText} (${baseBlockCount} block${baseBlockCount === 1 ? "" : "s"})`);
    }
  }

  for (const generator of getBedSiegeNeutralGenerators(state)) {
    const every = Math.max(1, Math.round(Number(generator.every) || 1));
    if (state.turnCount % every !== 0) {
      continue;
    }
    const { controller, blockCount } = getBedSiegeGeneratorControl(state, generator.hex);
    if (!controller) {
      continue;
    }
    const generatorIncome = getFlatBedSiegeGeneratorIncome(generator);
    const gainText = formatBedSiegeResourceGain(generatorIncome);
    if (gainText) {
      gainBedSiegeResources(state, controller, generatorIncome);
      incomeLines.push(`P${controller} ${generator.type} ${gainText} (${blockCount} block${blockCount === 1 ? "" : "s"})`);
    }
    bedSiege.generatorTicks[generator.id] = state.turnCount;
  }

  if (incomeLines.length > 0) {
    const message = `Bed Siege generators: ${incomeLines.join(", ")}.`;
    appendStateLog(state, message);
    return message;
  }
  return null;
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
  lastFactoryAnimationAt: 0,
  factoryAnimationFramePending: false,
  factoryAnimationDisabled: false,
  performanceModeLevel: 0,
  secretModesUnlocked: false,
  egyptianStoneCap: DEFAULT_EGYPTIAN_STONE_CAP,
  placementsPerTurn: DEFAULT_PLACEMENTS_PER_TURN,
  openingPlacementsPerTurn: DEFAULT_OPENING_PLACEMENTS_PER_TURN,
  winLength: DEFAULT_WIN_LENGTH,
  riftBloomCellModulus: RIFT_BLOOM_CELL_MODULUS,
  riftBloomGhostTurns: RIFT_BLOOM_GHOST_TURNS,
  riftBloomGhostTurnsTouched: false,
  riftBloomContestClaim: false,
  riftBloomTieGoesToCreator: false,
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

const ONLINE_SESSION_STORAGE_KEY = "hexTttOnlineSessionId";

function createOnlineSessionId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  const randomPart = Math.random().toString(36).slice(2);
  const timePart = Date.now().toString(36);
  return `hex-${timePart}-${randomPart}`;
}

function getStoredOnlineSessionId() {
  try {
    const stored = window.sessionStorage?.getItem(ONLINE_SESSION_STORAGE_KEY);
    if (/^[A-Za-z0-9_-]{12,128}$/.test(stored || "")) {
      return stored;
    }
  } catch (error) {
    // Private browsing or embedded contexts can block session storage.
  }
  return "";
}

function getOrCreateOnlineSessionId() {
  const existing = getStoredOnlineSessionId();
  if (existing) {
    return existing;
  }

  const next = createOnlineSessionId();
  try {
    window.sessionStorage?.setItem(ONLINE_SESSION_STORAGE_KEY, next);
  } catch (error) {
    // A per-page session still works if storage is unavailable.
  }
  return next;
}

const online = {
  socket: null,
  pendingAction: null,
  isConnected: false,
  roomCode: "",
  desiredRoomCode: "",
  sessionId: getOrCreateOnlineSessionId(),
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

function isBrowsingHistory() {
  return game.futureHistory.length > 0;
}

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
  if (requested.has("powderCascade")) {
    for (const key of Array.from(requested)) {
      if (key !== "powderCascade" && key !== "threePlayer" && key !== "fourPlayer" && !GRID_MODE_KEYS.includes(key)) {
        requested.delete(key);
      }
    }
  }
  if (requested.has("pig")) {
    for (const key of Array.from(requested)) {
      const mode = MODES[key];
      const allowed = key === "pig" || key === "riftBloom" || !mode?.secret;
      if (!allowed) {
        requested.delete(key);
      }
    }
  }
  if (requested.has("factoryFoundry")) {
    for (const key of Array.from(requested)) {
      if (key !== "factoryFoundry" && key !== "threePlayer" && key !== "fourPlayer") {
        requested.delete(key);
      }
    }
  }
  if (requested.has("bedSiege")) {
    requested.delete("riftBloom");
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

function refreshSecretRuleControls(modeKeys) {
  if (!ui.secretRuleControls) {
    return;
  }
  ui.secretRuleControls.hidden = false;
  if (ui.devRuleControls) {
    ui.devRuleControls.hidden = !game.secretModesUnlocked;
  }
  refreshSecretRuleSummaryFromInputs(modeKeys);
}

function refreshRiftBloomControls(modeKeys) {
  if (!ui.riftBloomControls) {
    return;
  }
  ui.riftBloomControls.hidden = !normaliseModeKeys(modeKeys).includes("riftBloom");
  refreshRiftBloomCoverageSummaryFromInputs();
  refreshRiftBloomDurationSummaryFromInputs();
  refreshRiftBloomContestSummaryFromInputs();
  refreshRiftBloomTieSummaryFromInputs();
}

function refreshArmoryControls(modeKeys) {
  if (!ui.armoryControls) {
    return;
  }
  ui.armoryControls.hidden = !normaliseModeKeys(modeKeys).includes("armory");
}

function refreshBedSiegeControls(modeKeys) {
  if (!ui.bedSiegeControls) {
    return;
  }
  ui.bedSiegeControls.hidden = !normaliseModeKeys(modeKeys).includes("bedSiege");
}

function refreshFactoryControls(modeKeys) {
  if (!ui.factoryControls) {
    return;
  }
  ui.factoryControls.hidden = !normaliseModeKeys(modeKeys).includes("factoryFoundry");
}

function refreshBagelControls(modeKeys) {
  if (!ui.bagelControls) {
    return;
  }
  const active = normaliseModeKeys(modeKeys).includes("everythingBagel");
  ui.bagelControls.hidden = !active;
  if (active && (!game.state || !hasEverythingBagelMode(game.state))) {
    if (ui.bagelPhaseText) {
      ui.bagelPhaseText.textContent = "New docket";
    }
    if (ui.bagelZoneText) {
      ui.bagelZoneText.textContent = "Start a new game to seat the rotating zones.";
    }
    if (ui.bagelReceiptText) {
      ui.bagelReceiptText.textContent = "Receipt stones are temporary until anchored.";
    }
    if (ui.bagelNextText) {
      ui.bagelNextText.textContent = "Next filing: auditor | queue | red tape";
    }
  }
}

function refreshChaosControls(modeKeys) {
  if (!ui.chaosControls) {
    return;
  }
  ui.chaosControls.hidden = !normaliseModeKeys(modeKeys).includes("chaosVote");
}

function refreshSecretModeVisibility() {
  const selected = new Set(getSelectedModeKeys());
  for (const button of ui.modePicker.querySelectorAll(".modeToggle")) {
    const isSecret = SECRET_MODE_KEYS.includes(button.dataset.mode);
    if (!isSecret) {
      continue;
    }
    button.hidden = !game.secretModesUnlocked && !selected.has(button.dataset.mode);
  }
  if (ui.secretModesBtn) {
    ui.secretModesBtn.setAttribute("aria-pressed", game.secretModesUnlocked ? "true" : "false");
  }
  refreshSecretRuleControls(getSelectedModeKeys());
  refreshRiftBloomControls(getSelectedModeKeys());
}

function setSecretModesUnlocked(unlocked) {
  game.secretModesUnlocked = Boolean(unlocked);
  refreshSecretModeVisibility();
  if (game.secretModesUnlocked) {
    pushLog("Secret modes unlocked.");
  }
}

function modeKeySignature(modeKeys) {
  return normaliseModeKeys(modeKeys).join("|");
}

function getModeConfig(modeKeys) {
  const keys = normaliseModeKeys(modeKeys);
  const activeModes = keys.map((key) => MODES[key]);
  const config = keys.length === 0
    ? { ...BASE_MODE }
    : {
      name: activeModes.map((mode) => mode.name).join(" + "),
      summary: activeModes.length === 1
        ? activeModes[0].summary
        : activeModes.map((mode) => `${mode.name}: ${mode.summary}`).join(" "),
      hint: activeModes.length === 1
        ? activeModes[0].hint
        : activeModes.map((mode) => `${mode.name}: ${mode.hint}`).join(" | ")
    };
  const settings = getGameRuleSettings({
    placementsPerTurn: getPlacementsPerTurnFromInputs(),
    openingPlacementsPerTurn: getOpeningPlacementsPerTurnFromInputs(),
    winLength: getWinLengthFromInputs()
  });
  const openingMovesWord = settings.openingPlacementsPerTurn === 1 ? "move" : "moves";
  const movesWord = settings.placementsPerTurn === 1 ? "move" : "moves";
  if (keys.includes("factoryFoundry")) {
    config.summary += ` Rules: ${settings.placementsPerTurn} ${movesWord} per turn; last base standing wins.`;
    config.hint += ` | Rules: ${settings.placementsPerTurn} factory action${settings.placementsPerTurn === 1 ? "" : "s"} per turn.`;
  } else if (keys.includes("bedSiege")) {
    config.summary += ` Rules: ${settings.placementsPerTurn} ${movesWord} per turn; break every rival bed to win.`;
    config.hint += ` | Rules: ${settings.placementsPerTurn} action${settings.placementsPerTurn === 1 ? "" : "s"} per turn.`;
  } else if (keys.includes("pig")) {
    config.summary += ` Rules: opening turn ${settings.openingPlacementsPerTurn} ${openingMovesWord}; then ${settings.placementsPerTurn} ${movesWord} per turn; line wins are disabled in Pig.`;
    config.hint += ` | Rules: opening ${settings.openingPlacementsPerTurn}, then ${settings.placementsPerTurn} per turn; trap the pig instead of connecting ${settings.winLength}.`;
  } else {
    config.summary += ` Rules: opening turn ${settings.openingPlacementsPerTurn} ${openingMovesWord}; then ${settings.placementsPerTurn} ${movesWord} per turn; connect ${settings.winLength} where line wins apply.`;
    config.hint += ` | Rules: opening ${settings.openingPlacementsPerTurn}, then ${settings.placementsPerTurn} per turn, connect ${settings.winLength}.`;
  }
  if (keys.includes("riftBloom")) {
    const riftStep = getRiftBloomCellModulusFromInputs();
    const riftTurns = getRiftBloomGhostTurnsFromInputs();
    config.summary += ` Rift coverage: 1 in ${riftStep} cells (${formatRiftBloomCoveragePercent(riftStep)}).`;
    config.hint += ` | Rift coverage: 1 in ${riftStep} cells; ghost timer ${riftTurns} turns.`;
    if (getRiftBloomContestClaimFromInputs()) {
      const tieText = getRiftBloomTieGoesToCreatorFromInputs()
        ? "ties go to the creator"
        : "ties remove the ghost";
      config.summary += ` Majority claim: ghosts resolve after ${riftTurns} turns to the adjacent player with the most real stones; ${tieText}.`;
      config.hint += ` | Majority claim after ${riftTurns} turns; ${tieText}.`;
    }
  }
  return config;
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

function getNextTurnPlayerNumber(state, player = state?.turnPlayer) {
  if (usesFactoryMode(state)) {
    const aliveOwners = getFactoryAliveOwners(state);
    if (aliveOwners.length <= 1) {
      return aliveOwners[0] || getNextPlayerNumber(state, player);
    }
    let candidate = getNextPlayerNumber(state, player);
    for (let attempts = 0; attempts < getPlayerCount(state); attempts += 1) {
      if (aliveOwners.includes(candidate)) {
        return candidate;
      }
      candidate = getNextPlayerNumber(state, candidate);
    }
    return aliveOwners[0];
  }
  if (!usesBedSiegeMode(state)) {
    return getNextPlayerNumber(state, player);
  }
  const aliveOwners = getBedSiegeAliveOwners(state);
  if (aliveOwners.length <= 1) {
    return aliveOwners[0] || getNextPlayerNumber(state, player);
  }
  let candidate = getNextPlayerNumber(state, player);
  for (let attempts = 0; attempts < getPlayerCount(state); attempts += 1) {
    if (aliveOwners.includes(candidate)) {
      return candidate;
    }
    candidate = getNextPlayerNumber(state, candidate);
  }
  return aliveOwners[0];
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

function usesBedSiegeMode(state) {
  return Boolean(state && hasMode(state, "bedSiege"));
}

function usesFactoryMode(state) {
  return Boolean(state && hasMode(state, "factoryFoundry"));
}

function usesPowderMode(state) {
  return Boolean(state && hasMode(state, "powderCascade"));
}

function usesChaosVoteMode(state) {
  return Boolean(state && hasMode(state, "chaosVote"));
}

function usesRiftBloomMode(state) {
  return Boolean(state && hasMode(state, "riftBloom"));
}

function usesPigMode(state) {
  return Boolean(state && hasMode(state, "pig"));
}

function normalisePerformanceModeLevel(level) {
  return Math.max(0, Math.min(2, Math.trunc(Number(level) || 0)));
}

function getPerformanceModeLevel() {
  return normalisePerformanceModeLevel(game.performanceModeLevel);
}

function usesLdmMode() {
  return getPerformanceModeLevel() >= 1;
}

function usesExtremeLdmMode() {
  return getPerformanceModeLevel() >= 2;
}

function getEffectiveCanvasDevicePixelRatio() {
  const rawDpr = Math.max(1, Number(window.devicePixelRatio) || 1);
  const level = getPerformanceModeLevel();
  if (level >= 2) {
    return Math.min(rawDpr, EXTREME_LDM_DEVICE_PIXEL_RATIO_CAP);
  }
  if (level >= 1) {
    return Math.min(rawDpr, LDM_DEVICE_PIXEL_RATIO_CAP);
  }
  return rawDpr;
}

function createPowderStateForGame() {
  return {
    grains: [],
    sources: {},
    nextId: 1,
    cellStats: {},
    controlledCells: {},
    lastReport: null
  };
}

function applyPowderFieldsToStoneExtras(state, kind, extras) {
  return extras || {};
}

function ensurePowderState(state) {
  if (!state || !usesPowderMode(state)) {
    return null;
  }
  if (!state.powder || typeof state.powder !== "object") {
    state.powder = createPowderStateForGame();
  }
  const powder = state.powder;
  if (!Array.isArray(powder.grains)) {
    powder.grains = Object.entries(powder.grains || {}).map(([key, grain]) => {
      const hex = parseKey(key);
      const world = boardCellToPowderWorld(hex, state);
      return {
        ...(grain || {}),
        x: world.x,
        y: world.y,
        source: hex
      };
    });
  }
  if (!powder.sources || typeof powder.sources !== "object" || Array.isArray(powder.sources)) {
    powder.sources = {};
  }
  powder.sources = Object.fromEntries(Object.entries(powder.sources).map(([key, source]) => ([
    key,
    {
      owner: normalisePlayerNumber(source?.owner, state),
      serial: Math.max(0, Math.trunc(Number(source?.serial) || 0)),
      pressure: Math.max(0, Math.trunc(Number(source?.pressure) || 0))
    }
  ])));
  if (!powder.controlledCells || typeof powder.controlledCells !== "object" || Array.isArray(powder.controlledCells)) {
    powder.controlledCells = {};
  }
  if (!powder.cellStats || typeof powder.cellStats !== "object" || Array.isArray(powder.cellStats)) {
    powder.cellStats = {};
  }
  powder.nextId = Math.max(1, Math.trunc(Number(powder.nextId) || 1));
  powder.grains = powder.grains
    .map((grain) => {
      if (!grain || typeof grain !== "object") {
        return null;
      }
      const x = Number(grain.x);
      const y = Number(grain.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
      }
      const id = Math.max(1, Math.trunc(Number(grain.id) || powder.nextId));
      powder.nextId = Math.max(powder.nextId, id + 1);
      return {
        id,
        owner: normalisePlayerNumber(grain.owner, state),
        x,
        y,
        vx: Number.isFinite(Number(grain.vx)) ? Number(grain.vx) : 0,
        vy: Number.isFinite(Number(grain.vy)) ? Number(grain.vy) : 0,
        settled: Boolean(grain.settled),
        source: grain.source && Number.isFinite(grain.source.q) && Number.isFinite(grain.source.r)
          ? { q: Math.trunc(grain.source.q), r: Math.trunc(grain.source.r) }
          : { q: 0, r: 0 }
      };
    })
    .filter(Boolean);
  if (powder.grains.length > POWDER_MAX_GRAINS) {
    powder.grains = powder.grains.slice(powder.grains.length - POWDER_MAX_GRAINS);
  }
  if (typeof powder.lastReport !== "object") {
    powder.lastReport = null;
  }
  return powder;
}

function clearPowderAt(state, hex) {
  const powder = ensurePowderState(state);
  if (!powder || !hex || !Number.isFinite(hex.q) || !Number.isFinite(hex.r)) {
    return false;
  }
  const before = powder.grains.length;
  powder.grains = powder.grains.filter((grain) => {
    const grainHex = powderWorldToBoardCell(state, grain.x, grain.y);
    return !equalHex(grainHex, hex);
  });
  return powder.grains.length !== before;
}

function getPowderBaseSize() {
  return Math.max(12, Number(game?.viewport?.baseHexSize) || 28);
}

function getPowderRenderScale() {
  return Math.max(0.1, Number(game?.viewport?.zoom) || 1);
}

function boardCellToPowderWorld(hex, state) {
  return boardCellToPixel(hex, getPowderBaseSize(), state);
}

function powderWorldToScreen(x, y) {
  const scale = getPowderRenderScale();
  return worldToScreen(x * scale, y * scale);
}

function powderWorldToBoardCell(state, x, y) {
  const scale = getPowderRenderScale();
  return pixelToBoardCell(x * scale, y * scale, currentHexSize(), state);
}

function getPowderFloorWorldY() {
  return POWDER_FLOOR_CELL_Y * getPowderBaseSize();
}

function getPowderSourceHexes(state) {
  const powder = ensurePowderState(state);
  return powder ? Object.keys(powder.sources).map((key) => parseKey(key)) : [];
}

function isPowderSourceHex(state, hex) {
  const powder = ensurePowderState(state);
  return Boolean(powder?.sources?.[keyOf(hex.q, hex.r)]);
}

function isBelowPowderFloor(state, hex) {
  return boardCellToPowderWorld(hex, state).y > getPowderFloorWorldY() + POWDER_GRAIN_RADIUS;
}

function getPowderGridOffsets(state, hex) {
  const size = getPowderBaseSize();
  const unit = size * 0.18;
  if (usesSquareGridMode(state)) {
    return [-1.5, -0.5, 0.5, 1.5].flatMap((row) => (
      [-2, -1, 0, 1, 2].map((col) => ({ x: col * unit * 1.12, y: row * unit * 1.28 }))
    ));
  }

  if (usesTriangleGridMode(state)) {
    const vertices = getTriangleVerticesForCell(hex, size);
    const center = boardCellToPowderWorld(hex, state);
    const offsets = [];
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col <= row; col += 1) {
        const a = (5 - row) / 6;
        const b = (col + 0.5) / 6;
        const c = 1 - a - b;
        if (c <= 0) {
          continue;
        }
        offsets.push({
          x: (vertices[0].x * a) + (vertices[1].x * b) + (vertices[2].x * c) - center.x,
          y: (vertices[0].y * a) + (vertices[1].y * b) + (vertices[2].y * c) - center.y
        });
      }
    }
    offsets.push({ x: 0, y: 0 });
    offsets.push({ x: -unit * 0.8, y: unit * 0.6 });
    offsets.push({ x: unit * 0.8, y: unit * 0.6 });
    offsets.push({ x: -unit * 0.8, y: -unit * 0.6 });
    offsets.push({ x: unit * 0.8, y: -unit * 0.6 });
    return offsets.slice(0, POWDER_GRAINS_PER_CELL);
  }

  if (usesOctagonGridMode(state) && isOctagonDiamondCoordinate(hex)) {
    return [
      { x: 0, y: -unit * 2.1 },
      { x: -unit * 0.9, y: -unit * 1.1 },
      { x: unit * 0.9, y: -unit * 1.1 },
      { x: -unit * 1.8, y: 0 },
      { x: -unit * 0.6, y: 0 },
      { x: unit * 0.6, y: 0 },
      { x: unit * 1.8, y: 0 },
      { x: -unit * 0.9, y: unit * 1.1 },
      { x: unit * 0.9, y: unit * 1.1 },
      { x: 0, y: unit * 2.1 },
      { x: 0, y: -unit * 0.7 },
      { x: -unit * 0.7, y: unit * 0.7 },
      { x: unit * 0.7, y: unit * 0.7 },
      { x: -unit * 0.7, y: -unit * 0.7 },
      { x: unit * 0.7, y: -unit * 0.7 },
      { x: 0, y: unit * 0.7 }
    ];
  }

  return [
    { x: -unit * 1.2, y: -unit * 2.0 },
    { x: 0, y: -unit * 2.0 },
    { x: unit * 1.2, y: -unit * 2.0 },
    { x: -unit * 1.8, y: -unit * 0.7 },
    { x: -unit * 0.6, y: -unit * 0.7 },
    { x: unit * 0.6, y: -unit * 0.7 },
    { x: unit * 1.8, y: -unit * 0.7 },
    { x: -unit * 1.8, y: unit * 0.7 },
    { x: -unit * 0.6, y: unit * 0.7 },
    { x: unit * 0.6, y: unit * 0.7 },
    { x: unit * 1.8, y: unit * 0.7 },
    { x: -unit * 1.2, y: unit * 2.0 },
    { x: 0, y: unit * 2.0 },
    { x: unit * 1.2, y: unit * 2.0 },
    { x: -unit * 0.4, y: 0 },
    { x: unit * 0.4, y: 0 },
    { x: -unit * 1.2, y: 0 },
    { x: unit * 1.2, y: 0 },
    { x: -unit * 0.7, y: unit * 1.35 },
    { x: unit * 0.7, y: unit * 1.35 }
  ];
}

function trimPowderGrainsToLimit(powder) {
  if (!powder || powder.grains.length <= POWDER_MAX_GRAINS) {
    return 0;
  }
  const overflow = powder.grains.length - POWDER_MAX_GRAINS;
  powder.grains.sort((a, b) => (a.settled === b.settled ? a.id - b.id : (a.settled ? -1 : 1)));
  powder.grains = powder.grains.slice(overflow);
  return overflow;
}

function addPowderGrainsFromHex(state, hex, owner, count, options = {}) {
  const powder = ensurePowderState(state);
  if (!powder || !hex) {
    return 0;
  }
  const safeOwner = normalisePlayerNumber(owner, state);
  const safeCount = Math.max(0, Math.trunc(Number(count) || 0));
  if (safeCount <= 0) {
    return 0;
  }
  const center = boardCellToPowderWorld(hex, state);
  const offsets = getPowderGridOffsets(state, hex);
  const spread = Math.max(0.35, Number(options.spread) || 1);
  const lift = Math.max(0, Number(options.lift) || 0);
  const initialVy = Number.isFinite(Number(options.initialVy)) ? Number(options.initialVy) : 0;
  const velocityScale = Math.max(0.5, Number(options.velocityScale) || 1);
  let emitted = 0;

  for (let index = 0; index < safeCount; index += 1) {
    const offset = offsets[index % offsets.length] || { x: 0, y: 0 };
    const wiggle = positiveMod(powder.nextId + safeOwner + index, 13) - 6;
    const drift = wiggle * (options.pressure ? 0.035 : 0.022) * velocityScale;
    powder.grains.push({
      id: powder.nextId,
      owner: safeOwner,
      x: center.x + (offset.x * spread),
      y: center.y + (offset.y * spread) - lift,
      vx: drift,
      vy: initialVy,
      settled: false,
      source: { ...hex }
    });
    powder.nextId += 1;
    emitted += 1;
  }

  return emitted;
}

function getPowderSourceEntriesForOwner(state, owner) {
  const powder = ensurePowderState(state);
  if (!powder) {
    return [];
  }
  const safeOwner = normalisePlayerNumber(owner, state);
  return Object.entries(powder.sources)
    .map(([key, source]) => ({ hex: parseKey(key), source }))
    .filter((entry) => entry.source.owner === safeOwner)
    .sort((a, b) => (
      (b.source.serial || 0) - (a.source.serial || 0)
      || getDistanceForMode(state, b.hex) - getDistanceForMode(state, a.hex)
      || a.hex.q - b.hex.q
      || a.hex.r - b.hex.r
    ));
}

function emitPowderPressure(state, owner) {
  const powder = ensurePowderState(state);
  if (!powder) {
    return { emitted: 0, sources: 0 };
  }
  const selected = getPowderSourceEntriesForOwner(state, owner).slice(0, POWDER_MAX_PRESSURE_SOURCES);
  let emitted = 0;
  const lift = getPowderBaseSize() * 0.34;
  for (const entry of selected) {
    emitted += addPowderGrainsFromHex(state, entry.hex, entry.source.owner, POWDER_PRESSURE_GRAINS_PER_SOURCE, {
      pressure: true,
      spread: 0.72,
      lift,
      initialVy: 0.22,
      velocityScale: 1.25
    });
    entry.source.pressure = (entry.source.pressure || 0) + 1;
  }
  return { emitted, sources: selected.length };
}

function spawnPowderCell(state, hex, owner) {
  const powder = ensurePowderState(state);
  if (!powder || isPowderSourceHex(state, hex)) {
    return null;
  }
  const safeOwner = normalisePlayerNumber(owner, state);
  state.moveSerial += 1;
  powder.sources[keyOf(hex.q, hex.r)] = {
    owner: safeOwner,
    serial: state.moveSerial,
    pressure: 0
  };
  const emitted = addPowderGrainsFromHex(state, hex, safeOwner, POWDER_GRAINS_PER_CELL, {
    lift: getPowderBaseSize() * 0.16,
    initialVy: 0.12
  });
  state.lastPlacement = { ...hex };
  if (!state.lastPlacedByPlayer || typeof state.lastPlacedByPlayer !== "object") {
    state.lastPlacedByPlayer = createPlayerMap(getPlayerCount(state), () => null);
  }
  state.lastPlacedByPlayer[safeOwner] = { ...hex };
  state.lastPlacedThisTurn.push({ ...hex });
  const settleReport = simulatePowderCascade(state, POWDER_PHYSICS_STEPS_AFTER_PLACE);
  return {
    spawned: emitted,
    trimmed: settleReport.trimmed,
    settled: settleReport.newSettled || 0,
    claimed: settleReport.newClaims || 0
  };
}

function emitPowderFromPlacement() {
  return null;
}

function getPowderSpatialKey(x, y, bucketSize = POWDER_COLLISION_DISTANCE) {
  return `${Math.floor(x / bucketSize)},${Math.floor(y / bucketSize)}`;
}

function buildPowderSpatialIndex(grains) {
  const index = new Map();
  for (const grain of grains) {
    addPowderToSpatialIndex(index, grain);
  }
  return index;
}

function addPowderToSpatialIndex(index, grain) {
  const key = getPowderSpatialKey(grain.x, grain.y);
  const list = index.get(key);
  if (list) {
    list.push(grain);
  } else {
    index.set(key, [grain]);
  }
}

function removePowderFromSpatialIndex(index, grain) {
  const key = getPowderSpatialKey(grain.x, grain.y);
  const list = index.get(key);
  if (!list) {
    return;
  }
  const next = list.filter((entry) => entry.id !== grain.id);
  if (next.length > 0) {
    index.set(key, next);
  } else {
    index.delete(key);
  }
}

function movePowderGrain(index, grain, x, y, options = {}) {
  removePowderFromSpatialIndex(index, grain);
  grain.x = x;
  grain.y = y;
  if (options.vx != null) {
    grain.vx = options.vx;
  }
  if (options.vy != null) {
    grain.vy = options.vy;
  }
  if (options.settled != null) {
    grain.settled = Boolean(options.settled);
  }
  addPowderToSpatialIndex(index, grain);
}

function hasPowderCollision(index, grain, x, y) {
  const bucketSize = POWDER_COLLISION_DISTANCE;
  const baseX = Math.floor(x / bucketSize);
  const baseY = Math.floor(y / bucketSize);
  const minDistanceSq = POWDER_COLLISION_DISTANCE * POWDER_COLLISION_DISTANCE;
  for (let by = baseY - 1; by <= baseY + 1; by += 1) {
    for (let bx = baseX - 1; bx <= baseX + 1; bx += 1) {
      const list = index.get(`${bx},${by}`);
      if (!list) {
        continue;
      }
      for (const other of list) {
        if (other.id === grain.id) {
          continue;
        }
        const dx = other.x - x;
        const dy = other.y - y;
        if ((dx * dx) + (dy * dy) < minDistanceSq) {
          return true;
        }
      }
    }
  }
  return false;
}

function canPowderOccupy(index, grain, x, y) {
  if (y + POWDER_GRAIN_RADIUS > getPowderFloorWorldY()) {
    return false;
  }
  return !hasPowderCollision(index, grain, x, y);
}

function stepPowderGrain(grain, index) {
  if (grain.settled) {
    return false;
  }
  const oldX = grain.x;
  const oldY = grain.y;
  const floorY = getPowderFloorWorldY() - POWDER_GRAIN_RADIUS;
  grain.vy = Math.min(POWDER_MAX_FALL_SPEED, grain.vy + POWDER_GRAVITY);
  grain.vx *= 0.94;
  let nextX = grain.x + grain.vx;
  let nextY = grain.y + grain.vy;

  if (nextY >= floorY) {
    nextY = floorY;
    if (!canPowderOccupy(index, grain, nextX, nextY)) {
      nextY = grain.y + Math.max(0.25, grain.vy * 0.35);
    } else {
      movePowderGrain(index, grain, nextX, floorY, { vx: 0, vy: 0, settled: true });
      return Math.abs(oldY - grain.y) > 0.1;
    }
  }

  if (nextY >= floorY && canPowderOccupy(index, grain, nextX, floorY)) {
    movePowderGrain(index, grain, nextX, floorY, { vx: 0, vy: 0, settled: true });
    return Math.abs(oldY - grain.y) > 0.1;
  }

  if (canPowderOccupy(index, grain, nextX, nextY)) {
    movePowderGrain(index, grain, nextX, nextY);
    return Math.abs(oldX - grain.x) > 0.1 || Math.abs(oldY - grain.y) > 0.1;
  }

  const slideDirection = positiveMod(grain.id + Math.trunc(grain.y), 2) === 0 ? -1 : 1;
  const fall = Math.max(0.55, grain.vy * 0.48);
  const candidates = [slideDirection, -slideDirection].flatMap((direction) => ([
    {
      x: grain.x + direction * POWDER_GRAIN_RADIUS * 0.95,
      y: grain.y + fall,
      vx: direction * 0.22,
      vy: grain.vy * 0.42
    },
    {
      x: grain.x + direction * POWDER_GRAIN_RADIUS * 1.55,
      y: grain.y + Math.max(0.25, fall * 0.55),
      vx: direction * 0.30,
      vy: grain.vy * 0.28
    }
  ]));

  for (const candidate of candidates) {
    const targetY = Math.min(candidate.y, floorY);
    if (canPowderOccupy(index, grain, candidate.x, targetY)) {
      const atFloor = targetY >= floorY;
      movePowderGrain(index, grain, candidate.x, targetY, {
        vx: atFloor ? 0 : candidate.vx,
        vy: atFloor ? 0 : candidate.vy,
        settled: atFloor
      });
      return true;
    }
  }

  grain.vx = 0;
  grain.vy = 0;
  grain.settled = true;
  return false;
}

function simulatePowderCascade(state, stepCount = POWDER_PHYSICS_STEPS_PER_TURN) {
  const powder = ensurePowderState(state);
  const previousControlled = powder ? { ...(powder.controlledCells || {}) } : {};
  const report = {
    moved: 0,
    settled: 0,
    active: 0,
    total: 0,
    trimmed: 0,
    newClaims: 0,
    controlled: 0,
    contested: 0
  };
  if (!powder) {
    return report;
  }
  const previousSettled = powder.grains.filter((grain) => grain.settled).length;
  for (let step = 0; step < stepCount; step += 1) {
    const index = buildPowderSpatialIndex(powder.grains);
    const grains = [...powder.grains].sort((a, b) => (b.y - a.y) || (a.id - b.id));
    for (const grain of grains) {
      if (stepPowderGrain(grain, index)) {
        report.moved += 1;
      }
    }
  }
  report.trimmed = trimPowderGrainsToLimit(powder);
  const controlled = refreshPowderControl(state);
  report.total = powder.grains.length;
  report.settled = powder.grains.filter((grain) => grain.settled).length;
  report.active = Math.max(0, report.total - report.settled);
  report.newSettled = Math.max(0, report.settled - previousSettled);
  report.controlled = Object.keys(controlled).length;
  report.contested = Object.values(powder.cellStats || {}).filter((stat) => (
    !stat.controlled && stat.leader && stat.bestCount >= POWDER_NEAR_CLAIM_GRAINS
  )).length;
  report.newClaims = Object.entries(controlled).filter(([key, control]) => (
    previousControlled[key]?.owner !== control.owner
  )).length;
  powder.lastReport = report;
  return report;
}

function getPowderCellStats(state) {
  const powder = ensurePowderState(state);
  const stats = {};
  if (!powder) {
    return stats;
  }
  const countsByCell = {};
  for (const grain of powder.grains) {
    if (!grain.settled) {
      continue;
    }
    const cell = powderWorldToBoardCell(state, grain.x, grain.y);
    if (!isCellSupportedForMode(state, cell)) {
      continue;
    }
    const key = keyOf(cell.q, cell.r);
    if (!countsByCell[key]) {
      countsByCell[key] = createPlayerMap(getPlayerCount(state), () => 0);
    }
    countsByCell[key][grain.owner] += 1;
  }

  for (const [key, counts] of Object.entries(countsByCell)) {
    let bestOwner = 0;
    let bestCount = 0;
    let secondCount = 0;
    let total = 0;
    for (const owner of getPlayerNumbers(state)) {
      const count = Math.max(0, counts[owner] || 0);
      total += count;
      if (count > bestCount) {
        secondCount = bestCount;
        bestOwner = owner;
        bestCount = count;
      } else if (count > secondCount) {
        secondCount = count;
      }
    }
    const lead = bestCount - secondCount;
    const controlled = Boolean(bestOwner && bestCount >= POWDER_WIN_CELL_GRAINS && lead >= POWDER_CONTROL_MIN_LEAD);
    stats[key] = {
      leader: bestOwner,
      owner: controlled ? bestOwner : 0,
      bestCount,
      secondCount,
      lead,
      total,
      controlled,
      counts
    };
  }
  return stats;
}

function getPowderCellControlMap(state) {
  const stats = getPowderCellStats(state);
  const controlled = {};
  for (const [key, stat] of Object.entries(stats)) {
    if (stat.controlled) {
      controlled[key] = {
        owner: stat.owner,
        grains: stat.bestCount,
        lead: stat.lead,
        total: stat.total
      };
    }
  }
  return controlled;
}

function refreshPowderControl(state) {
  const powder = ensurePowderState(state);
  if (!powder) {
    return {};
  }
  powder.cellStats = getPowderCellStats(state);
  powder.controlledCells = {};
  for (const [key, stat] of Object.entries(powder.cellStats)) {
    if (stat.controlled) {
      powder.controlledCells[key] = {
        owner: stat.owner,
        grains: stat.bestCount,
        lead: stat.lead,
        total: stat.total
      };
    }
  }
  return powder.controlledCells;
}

function getPowderVirtualCells(state) {
  const controlled = refreshPowderControl(state);
  const virtualCells = {};
  let serial = 0;
  for (const [key, control] of Object.entries(controlled)) {
    virtualCells[key] = {
      owner: control.owner,
      kind: "stone",
      serial: serial += 1
    };
  }
  return virtualCells;
}

function getPowderVirtualBoardState(state) {
  return {
    ...state,
    cells: getPowderVirtualCells(state)
  };
}

function getPowderWinner(state) {
  const virtualCells = getPowderVirtualCells(state);
  if (Object.keys(virtualCells).length === 0) {
    return 0;
  }
  return auditWholeBoardForWinner({ ...state, cells: virtualCells });
}

function getPowderClaimSummary(state) {
  const controlled = refreshPowderControl(state);
  const claimCounts = createPlayerMap(getPlayerCount(state), () => 0);
  for (const control of Object.values(controlled)) {
    if (isValidPlayerNumber(control.owner, state)) {
      claimCounts[control.owner] += 1;
    }
  }
  return getPlayerNumbers(state)
    .map((owner) => `P${owner} ${claimCounts[owner]}`)
    .join("/");
}

function resolvePowderCascade(state, previousPlayer = state?.turnPlayer) {
  if (!usesPowderMode(state)) {
    return;
  }
  const pressure = emitPowderPressure(state, previousPlayer);
  const report = simulatePowderCascade(state);
  report.emitted = pressure.emitted;
  report.pressureSources = pressure.sources;
  const powder = ensurePowderState(state);
  if (powder) {
    powder.lastReport = report;
  }
  if (report.moved <= 0 && report.newSettled <= 0 && report.trimmed <= 0 && pressure.emitted <= 0 && report.newClaims <= 0) {
    return;
  }
  const parts = [];
  if (pressure.emitted > 0) {
    parts.push(`${pressure.emitted} pressure grains`);
  }
  if (report.moved > 0) {
    parts.push(`${report.moved} grain-steps`);
  }
  if (report.newSettled > 0) {
    parts.push(`${report.newSettled} settled`);
  }
  if (report.newClaims > 0) {
    parts.push(`${report.newClaims} claimed`);
  }
  if (report.trimmed > 0) {
    parts.push(`${report.trimmed} recycled`);
  }
  pushLog(`Powder cascade: ${parts.join(", ")} | ${report.active} falling / ${report.settled} settled / ${report.controlled} claimed.`);
}

function getGridDrawStep(size) {
  const level = getPerformanceModeLevel();
  if (level >= 2) {
    return size < 30 ? 3 : 2;
  }
  if (level >= 1 && size < 17) {
    return 2;
  }
  return 1;
}

function canDrawPlacementHints(state = game.state, size = currentHexSize()) {
  return (
    getPerformanceModeLevel() === 0
    && size >= GRID_HINT_MIN_HEX_SIZE
    && !isBrowsingHistory()
    && !state.winner
    && !state.duckPhase
    && !hasEgyptianRemovalPhase(state)
  );
}

function applyRiftBloomGridStyle(state, hex, fill, stroke, muted = false) {
  if (!isRiftBloomActiveCell(state, hex)) {
    return { fill, stroke };
  }
  return {
    fill: muted ? "rgba(82, 238, 218, 0.035)" : "rgba(82, 238, 218, 0.095)",
    stroke: muted ? "rgba(82, 238, 218, 0.18)" : "rgba(255, 215, 94, 0.42)"
  };
}

function canDrawDetailText(size) {
  return getPerformanceModeLevel() < 2 || size >= 22;
}

function updatePerformanceModeUI() {
  const level = getPerformanceModeLevel();
  ui.appRoot?.classList.toggle("ldmMode", level >= 1);
  ui.appRoot?.classList.toggle("extremeLdmMode", level >= 2);
  document.body?.classList.toggle("ldmMode", level >= 1);
  document.body?.classList.toggle("extremeLdmMode", level >= 2);
  ui.ldmBtn?.classList.toggle("active", level === 1);
  ui.extremeLdmBtn?.classList.toggle("active", level === 2);
  ui.ldmBtn?.setAttribute("aria-pressed", level === 1 ? "true" : "false");
  ui.extremeLdmBtn?.setAttribute("aria-pressed", level === 2 ? "true" : "false");
}

function setPerformanceModeLevel(level) {
  game.performanceModeLevel = normalisePerformanceModeLevel(level);
  updatePerformanceModeUI();
  resizeCanvas();
  render();
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
  if (safeAction.birdKind === "kingDuck" && Object.keys(game.state?.panicZones || {}).length > 0) {
    return `Move the ${getBirdMoveLabel(safeAction.birdKind)} to any empty ${getBoardSpaceLabel(game.state)} outside the current panic zone`;
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
  refreshSecretModeVisibility();
}

function makeInitialState(
  modeKeys,
  timerConfig = game.timerConfig,
  egyptianStoneCap = game.egyptianStoneCap,
  secretRuleSettings = {},
  riftBloomCellModulus = game.riftBloomCellModulus,
  riftBloomContestClaim = game.riftBloomContestClaim,
  riftBloomGhostTurns = game.riftBloomGhostTurns,
  riftBloomTieGoesToCreatorValue = game.riftBloomTieGoesToCreator
) {
  const activeModeKeys = normaliseModeKeys(modeKeys);
  const playerCount = getPlayerCountFromModeKeys(activeModeKeys);
  const appliedGameRules = getGameRuleSettings(secretRuleSettings);
  const state = {
    modeKeys: activeModeKeys,
    playerCount,
    egyptianStoneCap: normaliseEgyptianStoneCap(egyptianStoneCap),
    placementsPerTurn: appliedGameRules.placementsPerTurn,
    openingPlacementsPerTurn: appliedGameRules.openingPlacementsPerTurn,
    winLength: appliedGameRules.winLength,
    riftBloomCellModulus: normaliseRiftBloomCellModulus(riftBloomCellModulus),
    riftBloomContestClaim: Boolean(riftBloomContestClaim),
    riftBloomGhostTurns: normaliseRiftBloomGhostTurns(riftBloomGhostTurns),
    riftBloomTieGoesToCreator: Boolean(riftBloomTieGoesToCreatorValue),
    cells: {},
    turnPlayer: 1,
    movesLeftInTurn: appliedGameRules.openingPlacementsPerTurn,
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
    clock: createClockState(timerConfig, playerCount),
    armory: null,
    bedSiege: null,
    factory: null,
    chaos: null,
    powder: null,
    pig: null
  };
  if (usesArmoryMode(state)) {
    state.armory = createArmoryStateForGame(state);
  }
  if (usesBedSiegeMode(state)) {
    state.bedSiege = createBedSiegeStateForGame(state);
    placeBedSiegeBedCells(state);
    state.movesLeftInTurn = getPlacementsPerTurn(state);
    state.openingMoveDone = true;
    state.log[0] = "Bed Siege started: bridge, shop, defend your bed, and break enemy beds.";
  }
  if (usesFactoryMode(state)) {
    state.factory = createFactoryStateForGame(state);
    placeFactoryCoreCells(state);
    state.movesLeftInTurn = getPlacementsPerTurn(state);
    state.openingMoveDone = true;
    state.log[0] = "Foundry War started: control the farther Ore nodes and the center Flux node, route them home for capped points, and keep your core alive.";
  }
  if (usesChaosVoteMode(state)) {
    state.chaos = createChaosState();
    if (!usesBedSiegeMode(state) && !usesFactoryMode(state)) {
      state.log[0] = `Rule Vote started: every ${CHAOS_VOTE_INTERVAL} completed turns, the player who just moved chooses a new rule.`;
    }
  }
  if (hasEverythingBagelMode(state) && !usesBedSiegeMode(state) && !usesFactoryMode(state)) {
    state.log[0] = `Everything Bagel started: read the docket, dodge the paperwork, and connect ${getWinLength(state)} if the filings allow it.`;
  }
  if (usesRiftBloomMode(state) && !usesBedSiegeMode(state) && !usesFactoryMode(state) && !usesPowderMode(state)) {
    const turns = getRiftBloomGhostTurns(state);
    const riftRule = usesRiftBloomContestClaim(state)
      ? `ghosts resolve after ${turns} turn${turns === 1 ? "" : "s"} to the adjacent majority`
      : `anchor them beside ${RIFT_BLOOM_ANCHOR_FRIENDS} friendly stones within ${turns} turn${turns === 1 ? "" : "s"}`;
    state.log[0] = `Rift Bloom started: 1 in ${getRiftBloomCellModulus(state)} cells shimmer. Place on them to grow mirrored ghosts; ${riftRule}.`;
  }
  if (usesPigMode(state) && !usesBedSiegeMode(state) && !usesFactoryMode(state) && !usesPowderMode(state)) {
    state.pig = createPigStateForGame(state);
    state.log[0] = usesRiftBloomMode(state)
      ? "Pig + Rift Bloom started: the pig blocks the origin, rift cells still sprout mirrored ghosts, and only the player who places the trapping stone wins. The pig can startle once from an adjacent later stone while it still has room."
      : "Pig started: the pig blocks the origin, pathfinds after your first stone placement each turn, can startle once from an adjacent later stone while it still has room, and only the player who places the trapping stone wins.";
  }
  if (usesPowderMode(state)) {
    state.powder = createPowderStateForGame();
    if (!usesBedSiegeMode(state) && !usesFactoryMode(state)) {
      state.log[0] = `Powder Cascade started: source pads pour ${POWDER_GRAINS_PER_CELL} grains, newest pads drip pressure at turn end, and clear grain leads claim a connect-${getWinLength(state)} line.`;
    }
  }
  return state;
}

function setModeUI(modeKeys) {
  const mode = getModeConfig(modeKeys);
  game.modeUiSignature = modeKeySignature(modeKeys);
  ui.modeName.textContent = mode.name;
  ui.modeSummary.textContent = mode.summary;
  ui.overlayTitle.textContent = mode.name;
  ui.overlayHint.textContent = mode.hint;
  updateLegendUI(modeKeys);
  refreshEgyptianCapControls(modeKeys);
  refreshSecretRuleControls(modeKeys);
  refreshArmoryControls(modeKeys);
  refreshBedSiegeControls(modeKeys);
  refreshFactoryControls(modeKeys);
  refreshBagelControls(modeKeys);
  refreshChaosControls(modeKeys);
  refreshRiftBloomControls(modeKeys);
  updateTurnOrderSummary(getPlayerCountFromModeKeys(modeKeys));
}

function hasPendingModeSelection(state = game.state) {
  return Boolean(state) && modeKeySignature(getSelectedModeKeys()) !== modeKeySignature(state.modeKeys);
}

function updateLegendUI(modeKeys = game.state?.modeKeys || game.previewModeKeys || []) {
  const keys = normaliseModeKeys(modeKeys);
  const selectedModes = new Set(keys);
  const playerCount = getPlayerCountFromModeKeys(keys);
  if (ui.legendP3) ui.legendP3.hidden = playerCount < 3;
  if (ui.legendP4) ui.legendP4.hidden = playerCount < 4;
  if (ui.legendDuck) ui.legendDuck.hidden = !BIRD_KINDS.some((modeKey) => selectedModes.has(modeKey));
  if (ui.legendPig) ui.legendPig.hidden = !selectedModes.has("pig");
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

function normalisePlacementsPerTurn(value) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_PLACEMENTS_PER_TURN;
  }
  return Math.max(MIN_PLACEMENTS_PER_TURN, Math.min(MAX_PLACEMENTS_PER_TURN, parsed));
}

function normaliseOpeningPlacementsPerTurn(value) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_OPENING_PLACEMENTS_PER_TURN;
  }
  return Math.max(MIN_OPENING_PLACEMENTS_PER_TURN, Math.min(MAX_OPENING_PLACEMENTS_PER_TURN, parsed));
}

function normaliseWinLength(value) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_WIN_LENGTH;
  }
  return Math.max(MIN_WIN_LENGTH, Math.min(MAX_WIN_LENGTH, parsed));
}

function normaliseRiftBloomCellModulus(value) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return RIFT_BLOOM_CELL_MODULUS;
  }
  return Math.max(MIN_RIFT_BLOOM_CELL_MODULUS, Math.min(MAX_RIFT_BLOOM_CELL_MODULUS, parsed));
}

function normaliseRiftBloomGhostTurns(value) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return RIFT_BLOOM_GHOST_TURNS;
  }
  return Math.max(MIN_RIFT_BLOOM_GHOST_TURNS, Math.min(MAX_RIFT_BLOOM_GHOST_TURNS, parsed));
}

function formatRiftBloomCoveragePercent(cellModulus) {
  const safeModulus = normaliseRiftBloomCellModulus(cellModulus);
  return `${Math.round((1 / safeModulus) * 100)}%`;
}

function riftBloomSliderValueToCellModulus(value) {
  const parsed = Math.trunc(Number(value));
  const sliderValue = Number.isFinite(parsed)
    ? Math.max(MIN_RIFT_BLOOM_CELL_MODULUS, Math.min(MAX_RIFT_BLOOM_CELL_MODULUS, parsed))
    : (MIN_RIFT_BLOOM_CELL_MODULUS + MAX_RIFT_BLOOM_CELL_MODULUS - RIFT_BLOOM_CELL_MODULUS);
  return normaliseRiftBloomCellModulus(MIN_RIFT_BLOOM_CELL_MODULUS + MAX_RIFT_BLOOM_CELL_MODULUS - sliderValue);
}

function riftBloomCellModulusToSliderValue(value) {
  const cellModulus = normaliseRiftBloomCellModulus(value);
  return MIN_RIFT_BLOOM_CELL_MODULUS + MAX_RIFT_BLOOM_CELL_MODULUS - cellModulus;
}

function getPlacementsPerTurnFromInputs() {
  return normalisePlacementsPerTurn(ui.placementsPerTurnInput?.value);
}

function getOpeningPlacementsPerTurnFromInputs() {
  return normaliseOpeningPlacementsPerTurn(ui.openingPlacementsInput?.value ?? game.openingPlacementsPerTurn);
}

function getWinLengthFromInputs() {
  return normaliseWinLength(ui.winLengthInput?.value);
}

function getRiftBloomCellModulusFromInputs() {
  return ui.riftBloomCoverageInput
    ? riftBloomSliderValueToCellModulus(ui.riftBloomCoverageInput.value)
    : normaliseRiftBloomCellModulus(game.riftBloomCellModulus);
}

function getRiftBloomContestClaimFromInputs() {
  return ui.riftBloomContestInput ? Boolean(ui.riftBloomContestInput.checked) : Boolean(game.riftBloomContestClaim);
}

function getRiftBloomGhostTurnsFromInputs() {
  return normaliseRiftBloomGhostTurns(ui.riftBloomDurationInput?.value ?? game.riftBloomGhostTurns);
}

function getDefaultRiftBloomGhostTurnsForMode(contestClaim = getRiftBloomContestClaimFromInputs()) {
  return contestClaim ? RIFT_BLOOM_CONTEST_TURNS : RIFT_BLOOM_GHOST_TURNS;
}

function getRiftBloomTieGoesToCreatorFromInputs() {
  return ui.riftBloomTieCreatorInput ? Boolean(ui.riftBloomTieCreatorInput.checked) : Boolean(game.riftBloomTieGoesToCreator);
}

function setRiftBloomCoverageInput(value) {
  const cellModulus = normaliseRiftBloomCellModulus(value);
  if (ui.riftBloomCoverageInput) {
    ui.riftBloomCoverageInput.value = String(riftBloomCellModulusToSliderValue(cellModulus));
  }
  if (ui.riftBloomCoverageSummaryText) {
    ui.riftBloomCoverageSummaryText.textContent = `Coverage: 1 in ${cellModulus} cells (${formatRiftBloomCoveragePercent(cellModulus)})`;
  }
}

function refreshRiftBloomCoverageSummaryFromInputs() {
  if (!ui.riftBloomCoverageSummaryText) {
    return;
  }
  setRiftBloomCoverageInput(getRiftBloomCellModulusFromInputs());
}

function setRiftBloomDurationInput(value) {
  const turns = normaliseRiftBloomGhostTurns(value);
  if (ui.riftBloomDurationInput) {
    ui.riftBloomDurationInput.value = String(turns);
  }
  if (ui.riftBloomDurationSummaryText) {
    ui.riftBloomDurationSummaryText.textContent = `Ghost timer: ${turns} turn${turns === 1 ? "" : "s"}`;
  }
}

function refreshRiftBloomDurationSummaryFromInputs() {
  if (!ui.riftBloomDurationSummaryText) {
    return;
  }
  setRiftBloomDurationInput(getRiftBloomGhostTurnsFromInputs());
}

function setRiftBloomContestInput(value) {
  const enabled = Boolean(value);
  if (ui.riftBloomContestInput) {
    ui.riftBloomContestInput.checked = enabled;
  }
  if (ui.riftBloomContestSummaryText) {
    const turns = getRiftBloomGhostTurnsFromInputs();
    ui.riftBloomContestSummaryText.textContent = enabled
      ? `After ${turns} turn${turns === 1 ? "" : "s"}, adjacent majority claims each ghost.`
      : `Ghosts have ${turns} turn${turns === 1 ? "" : "s"} to anchor beside ${RIFT_BLOOM_ANCHOR_FRIENDS} friendly stones.`;
  }
  if (ui.riftBloomTieControls) {
    ui.riftBloomTieControls.hidden = !enabled;
  }
}

function refreshRiftBloomContestSummaryFromInputs() {
  if (!ui.riftBloomContestSummaryText) {
    return;
  }
  setRiftBloomContestInput(getRiftBloomContestClaimFromInputs());
}

function setRiftBloomTieCreatorInput(value) {
  const enabled = Boolean(value);
  if (ui.riftBloomTieCreatorInput) {
    ui.riftBloomTieCreatorInput.checked = enabled;
  }
  if (ui.riftBloomTieSummaryText) {
    ui.riftBloomTieSummaryText.textContent = enabled
      ? "Tied majority claims go to the ghost creator."
      : "Tied majority claims remove the ghost.";
  }
}

function refreshRiftBloomTieSummaryFromInputs() {
  if (!ui.riftBloomTieSummaryText) {
    return;
  }
  setRiftBloomTieCreatorInput(getRiftBloomTieGoesToCreatorFromInputs());
}

function setSecretRuleInputs(settings = {}) {
  const placementsPerTurn = normalisePlacementsPerTurn(settings.placementsPerTurn ?? game.placementsPerTurn);
  const openingPlacementsPerTurn = normaliseOpeningPlacementsPerTurn(settings.openingPlacementsPerTurn ?? game.openingPlacementsPerTurn);
  const winLength = normaliseWinLength(settings.winLength ?? game.winLength);
  if (ui.placementsPerTurnInput) {
    ui.placementsPerTurnInput.value = String(placementsPerTurn);
  }
  if (ui.openingPlacementsInput) {
    ui.openingPlacementsInput.value = String(openingPlacementsPerTurn);
  }
  if (ui.winLengthInput) {
    ui.winLengthInput.value = String(winLength);
  }
  refreshSecretRuleSummaryFromInputs();
}

function refreshSecretRuleSummaryFromInputs() {
  if (!ui.secretRuleSummaryText) {
    return;
  }
  const placementsPerTurn = getPlacementsPerTurnFromInputs();
  const openingPlacementsPerTurn = getOpeningPlacementsPerTurnFromInputs();
  const winLength = getWinLengthFromInputs();
  ui.secretRuleSummaryText.textContent = `Opening ${openingPlacementsPerTurn} | then ${placementsPerTurn} per turn | connect ${winLength}`;
}

function getGameRuleSettings(settings = {}) {
  return {
    placementsPerTurn: normalisePlacementsPerTurn(settings.placementsPerTurn ?? game.placementsPerTurn),
    openingPlacementsPerTurn: normaliseOpeningPlacementsPerTurn(settings.openingPlacementsPerTurn ?? game.openingPlacementsPerTurn),
    winLength: normaliseWinLength(settings.winLength ?? game.winLength)
  };
}

function getRiftBloomCellModulus(state) {
  return normaliseRiftBloomCellModulus(state?.riftBloomCellModulus ?? game.riftBloomCellModulus);
}

function getRiftBloomGhostTurns(state) {
  return normaliseRiftBloomGhostTurns(state?.riftBloomGhostTurns ?? game.riftBloomGhostTurns);
}

function usesRiftBloomContestClaim(state) {
  return Boolean(state?.riftBloomContestClaim ?? game.riftBloomContestClaim);
}

function riftBloomTieGoesToCreator(state) {
  return Boolean(state?.riftBloomTieGoesToCreator ?? game.riftBloomTieGoesToCreator);
}

function getPlacementsPerTurn(state) {
  if (!state) {
    return DEFAULT_PLACEMENTS_PER_TURN;
  }
  return normalisePlacementsPerTurn(state.placementsPerTurn);
}

function getOpeningPlacementsPerTurn(state) {
  if (!state) {
    return DEFAULT_OPENING_PLACEMENTS_PER_TURN;
  }
  return normaliseOpeningPlacementsPerTurn(state.openingPlacementsPerTurn);
}

function getWinLength(state) {
  if (!state) {
    return DEFAULT_WIN_LENGTH;
  }
  return normaliseWinLength(state.winLength);
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
  const clockIsRunning = !isBrowsingHistory() && shouldRunClockTicker(game.state);
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
  updateLegendUI(game.state.modeKeys);
}

function stopClockTicker() {
  if (game.clockRuntime.intervalId) {
    window.clearInterval(game.clockRuntime.intervalId);
    game.clockRuntime.intervalId = null;
  }
  game.clockRuntime.lastTickAt = 0;
}

function handleClockExpiry(expiredPlayer) {
  if (!game.state || game.state.winner || isBrowsingHistory()) {
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
  if (isBrowsingHistory()) {
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
  const shouldRun = !isBrowsingHistory() && shouldRunClockTicker(game.state);
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
  if (isBrowsingHistory()) {
    return false;
  }
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
  if (ui.placementsPerTurnInput) {
    ui.placementsPerTurnInput.disabled = inRoom && !admin;
  }
  if (ui.openingPlacementsInput) {
    ui.openingPlacementsInput.disabled = inRoom && !admin;
  }
  if (ui.winLengthInput) {
    ui.winLengthInput.disabled = inRoom && !admin;
  }
  if (ui.riftBloomCoverageInput) {
    ui.riftBloomCoverageInput.disabled = inRoom && !admin;
  }
  if (ui.riftBloomDurationInput) {
    ui.riftBloomDurationInput.disabled = inRoom && !admin;
  }
  if (ui.riftBloomContestInput) {
    ui.riftBloomContestInput.disabled = inRoom && !admin;
  }
  if (ui.riftBloomTieCreatorInput) {
    ui.riftBloomTieCreatorInput.disabled = inRoom && !admin;
  }
  for (let player = 1; player <= MAX_PLAYER_COUNT; player += 1) {
    const select = getArmoryClassSelectForPlayer(player);
    if (select) {
      select.disabled = (inRoom && !admin) || Boolean(game.state?.openingMoveDone);
    }
  }
  if (ui.armoryRerollBtn) {
    ui.armoryRerollBtn.disabled = inRoom && !canActForCurrentTurn();
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
      sendOnlineMessage({ type: "joinRoom", roomCode, sessionId: online.sessionId });
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
  if (message && Number.isInteger(message.yourPlayerSlot)) {
    online.assignedPlayer = message.yourPlayerSlot || null;
    return;
  }
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
  game.placementsPerTurn = getPlacementsPerTurn(game.state);
  game.openingPlacementsPerTurn = getOpeningPlacementsPerTurn(game.state);
  game.winLength = getWinLength(game.state);
  setTimerInputs(game.timerConfig);
  setEgyptianCapInput(game.egyptianStoneCap);
  setSecretRuleInputs({
    placementsPerTurn: game.placementsPerTurn,
    openingPlacementsPerTurn: game.openingPlacementsPerTurn,
    winLength: game.winLength
  });
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
    sendOnlineMessage({ type: "createRoom", sessionId: online.sessionId });
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
    sendOnlineMessage({ type: "joinRoom", roomCode, sessionId: online.sessionId });
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

  if (usesBedSiegeMode(state)) {
    const bedSiege = ensureBedSiegeState(state);
    for (const owner of getPlayerNumbers(state)) {
      const bed = bedSiege.beds[owner];
      if (bed?.alive && equalHex(bed.hex, fromHex)) {
        bed.hex = { ...toHex };
      }
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

  if (usesBedSiegeMode(state)) {
    const bedSiege = ensureBedSiegeState(state);
    for (const owner of getPlayerNumbers(state)) {
      const bed = bedSiege.beds[owner];
      if (bed?.hex) {
        bed.hex = transform(bed.hex);
      }
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
  const safeBirdKind = birdKind === "kingDuck" ? "kingDuck" : "duck";
  if (!isCellSupportedForMode(state, hex)) {
    return false;
  }
  if (isStoneOccupied(state, hex)) {
    return false;
  }
  if (getPigAt(state, hex)) {
    return false;
  }
  if (safeBirdKind === "kingDuck" && state.panicZones?.[keyOf(hex.q, hex.r)]) {
    return false;
  }

  const birdAt = getBirdAt(state, hex);
  if (birdAt && birdAt !== safeBirdKind) {
    return false;
  }

  const copyAt = getBirdEchoCopyAt(state, hex);
  if (copyAt && copyAt !== safeBirdKind) {
    return false;
  }
  return true;
}

function normalisePigHexForMode(state, hex) {
  if (usesRadialGridMode(state)) {
    return normaliseRadialCell(hex);
  }
  return {
    q: Math.trunc(Number(hex?.q) || 0),
    r: Math.trunc(Number(hex?.r) || 0)
  };
}

function getPigStartHex(state) {
  return normalisePigHexForMode(state, { q: 0, r: 0 });
}

function createPigStateForGame(state) {
  return {
    hex: getPigStartHex(state),
    trappedBy: 0,
    lastMove: null,
    lastTrappingHex: null,
    lastStuckTurn: null,
    reactionsThisTurn: 0,
    movedThisTurn: false
  };
}

function ensurePigState(state) {
  if (!usesPigMode(state)) {
    return null;
  }
  if (!state.pig || typeof state.pig !== "object") {
    state.pig = createPigStateForGame(state);
  }
  state.pig.hex = normalisePigHexForMode(state, state.pig.hex || getPigStartHex(state));
  state.pig.trappedBy = isValidPlayerNumber(state.pig.trappedBy, state) ? Math.trunc(Number(state.pig.trappedBy)) : 0;
  const reactionCount = Math.trunc(Number(state.pig.reactionsThisTurn));
  state.pig.reactionsThisTurn = Number.isFinite(reactionCount) && reactionCount > 0
    ? Math.min(PIG_MAX_REACTIONS_PER_TURN, reactionCount)
    : (state.pig.movedThisTurn ? 1 : 0);
  state.pig.movedThisTurn = state.pig.reactionsThisTurn > 0;
  if (state.pig.lastTrappingHex) {
    state.pig.lastTrappingHex = normalisePigHexForMode(state, state.pig.lastTrappingHex);
  }
  return state.pig;
}

function getPigHex(state) {
  return ensurePigState(state)?.hex || null;
}

function getPigAt(state, hex) {
  const pigHex = getPigHex(state);
  if (!pigHex || !hex) {
    return false;
  }
  return equalHex(normalisePigHexForMode(state, pigHex), normalisePigHexForMode(state, hex));
}

function isPigMoveTargetOpen(state, hex) {
  return Boolean(
    hex
      && isCellSupportedForMode(state, hex)
      && !isStoneOccupied(state, hex)
      && !getBirdAt(state, hex)
      && !getBirdEchoCopyAt(state, hex)
  );
}

function comparePigMoveTargets(state, a, b) {
  const distanceDiff = getDistanceForMode(state, b) - getDistanceForMode(state, a);
  if (distanceDiff !== 0) {
    return distanceDiff;
  }
  const aq = Math.trunc(Number(a.q) || 0);
  const bq = Math.trunc(Number(b.q) || 0);
  if (aq !== bq) {
    return aq - bq;
  }
  return Math.trunc(Number(a.r) || 0) - Math.trunc(Number(b.r) || 0);
}

function getUniquePigAdjacents(state, hex) {
  return getAdjacentsForMode(state, hex)
    .map((candidate) => normalisePigHexForMode(state, candidate))
    .filter((candidate, index, all) => all.findIndex((other) => equalHex(other, candidate)) === index);
}

function getPigLegalMoves(state) {
  const pigHex = getPigHex(state);
  if (!pigHex) {
    return [];
  }
  return getUniquePigAdjacents(state, pigHex)
    .filter((hex) => isPigMoveTargetOpen(state, hex))
    .sort((a, b) => comparePigMoveTargets(state, a, b));
}

function isPigEscapeBlocked(state, hex) {
  const cell = getCellAt(state, hex);
  return Boolean(cell && (cell.kind === "stone" || isRiftBloomGhostCell(cell)));
}

function isPigEscapePassable(state, hex) {
  return Boolean(hex && isCellSupportedForMode(state, hex) && !isPigEscapeBlocked(state, hex));
}

function getPigEscapeBounds(state, pigHex) {
  const blockerHexes = Object.keys(state.cells || {})
    .map((key) => parseKey(key))
    .filter((hex) => isPigEscapeBlocked(state, hex));
  if (blockerHexes.length === 0) {
    return null;
  }

  if (usesRadialGridMode(state)) {
    const maxRing = Math.max(
      normaliseRadialCell(pigHex).q,
      ...blockerHexes.map((hex) => normaliseRadialCell(hex).q)
    );
    return {
      radial: true,
      origin: normalisePigHexForMode(state, pigHex),
      maxPigDistance: blockerHexes.length + PIG_ESCAPE_BOUNDS_PADDING,
      maxRing: maxRing + PIG_ESCAPE_BOUNDS_PADDING
    };
  }

  const allHexes = [pigHex, ...blockerHexes].map((hex) => normalisePigHexForMode(state, hex));
  return {
    radial: false,
    origin: normalisePigHexForMode(state, pigHex),
    maxPigDistance: blockerHexes.length + PIG_ESCAPE_BOUNDS_PADDING,
    minQ: Math.min(...allHexes.map((hex) => hex.q)) - PIG_ESCAPE_BOUNDS_PADDING,
    maxQ: Math.max(...allHexes.map((hex) => hex.q)) + PIG_ESCAPE_BOUNDS_PADDING,
    minR: Math.min(...allHexes.map((hex) => hex.r)) - PIG_ESCAPE_BOUNDS_PADDING,
    maxR: Math.max(...allHexes.map((hex) => hex.r)) + PIG_ESCAPE_BOUNDS_PADDING
  };
}

function isOutsidePigEscapeBounds(state, hex, bounds) {
  if (!bounds) {
    return true;
  }
  const cell = normalisePigHexForMode(state, hex);
  if (getDistanceForMode(state, bounds.origin, cell) > bounds.maxPigDistance) {
    return true;
  }
  if (bounds.radial) {
    return cell.q > bounds.maxRing;
  }
  return cell.q < bounds.minQ
    || cell.q > bounds.maxQ
    || cell.r < bounds.minR
    || cell.r > bounds.maxR;
}

function canPigReachUnboundedSpace(state) {
  const pigHex = getPigHex(state);
  if (!pigHex || !isPigEscapePassable(state, pigHex)) {
    return false;
  }
  const bounds = getPigEscapeBounds(state, pigHex);
  if (!bounds) {
    return true;
  }

  const queue = [normalisePigHexForMode(state, pigHex)];
  const seen = new Set([keyOf(queue[0].q, queue[0].r)]);
  let index = 0;

  while (index < queue.length) {
    const current = queue[index];
    index += 1;

    if (isOutsidePigEscapeBounds(state, current, bounds)) {
      return true;
    }
    if (seen.size > PIG_ESCAPE_SEARCH_LIMIT) {
      return true;
    }

    for (const adjacent of getAdjacentsForMode(state, current)) {
      const next = normalisePigHexForMode(state, adjacent);
      const nextKey = keyOf(next.q, next.r);
      if (seen.has(nextKey)) {
        continue;
      }
      if (!isPigEscapePassable(state, next)) {
        continue;
      }
      seen.add(nextKey);
      queue.push(next);
    }
  }

  return false;
}

function getPigEscapeRoute(state) {
  const pigHex = getPigHex(state);
  if (!pigHex || !isPigEscapePassable(state, pigHex)) {
    return null;
  }
  const legalMoves = getPigLegalMoves(state);
  if (legalMoves.length === 0) {
    return null;
  }
  const bounds = getPigEscapeBounds(state, pigHex);
  if (!bounds) {
    return {
      firstStep: { ...legalMoves[0] },
      distance: 1
    };
  }

  const legalMoveKeys = new Set(legalMoves.map((hex) => keyOf(hex.q, hex.r)));
  const start = normalisePigHexForMode(state, pigHex);
  const queue = [{
    hex: start,
    firstStep: null,
    distance: 0
  }];
  const seen = new Set([keyOf(start.q, start.r)]);
  let index = 0;

  while (index < queue.length) {
    const current = queue[index];
    index += 1;

    if (seen.size > PIG_ESCAPE_SEARCH_LIMIT) {
      return {
        firstStep: { ...legalMoves[0] },
        distance: Infinity
      };
    }

    const nextHexes = getUniquePigAdjacents(state, current.hex)
      .sort((a, b) => comparePigMoveTargets(state, a, b));
    for (const next of nextHexes) {
      const nextKey = keyOf(next.q, next.r);
      if (seen.has(nextKey)) {
        continue;
      }
      const firstStep = current.firstStep || next;
      if (!current.firstStep && !legalMoveKeys.has(nextKey)) {
        continue;
      }
      if (!isPigEscapePassable(state, next)) {
        continue;
      }
      if (isOutsidePigEscapeBounds(state, next, bounds)) {
        return {
          firstStep: { ...firstStep },
          distance: current.distance + 1
        };
      }
      seen.add(nextKey);
      queue.push({
        hex: next,
        firstStep,
        distance: current.distance + 1
      });
    }
  }

  return null;
}

function isPigTrapped(state) {
  return usesPigMode(state) && !canPigReachUnboundedSpace(state);
}

function applyPigTrapAfterPlacement(state, owner, wasPigTrappedBefore) {
  if (!usesPigMode(state) || wasPigTrappedBefore || state.winner) {
    return null;
  }
  const pig = ensurePigState(state);
  if (!pig || !isPigTrapped(state)) {
    return null;
  }
  const safeOwner = normalisePlayerNumber(owner, state);
  pig.trappedBy = safeOwner;
  pig.lastTrappingHex = state.lastPlacement ? { ...state.lastPlacement } : null;
  return `Pig trapped by Player ${safeOwner}.`;
}

function isPigStartledByLastPlacement(state, pig) {
  if (!state.lastPlacement || !pig?.hex) {
    return false;
  }
  return getDistanceForMode(
    state,
    normalisePigHexForMode(state, pig.hex),
    normalisePigHexForMode(state, state.lastPlacement)
  ) <= PIG_STARTLE_DISTANCE;
}

function canPigReactAfterPlacement(state, pig) {
  if (!pig || pig.trappedBy) {
    return false;
  }
  if (pig.reactionsThisTurn <= 0) {
    return true;
  }
  if (pig.reactionsThisTurn >= PIG_MAX_REACTIONS_PER_TURN) {
    return false;
  }
  return isPigStartledByLastPlacement(state, pig)
    && getPigLegalMoves(state).length >= PIG_STARTLE_MIN_ESCAPE_OPTIONS;
}

function movePigAfterPlacement(state) {
  if (!usesPigMode(state) || state.winner) {
    return null;
  }
  const pig = ensurePigState(state);
  if (!pig) {
    return null;
  }
  if (pig.trappedBy) {
    return null;
  }
  if (!canPigReactAfterPlacement(state, pig)) {
    return null;
  }
  pig.reactionsThisTurn += 1;
  pig.movedThisTurn = true;
  const from = { ...pig.hex };
  const route = getPigEscapeRoute(state);
  if (!route?.firstStep) {
    pig.lastMove = null;
    pig.lastStuckTurn = state.turnCount;
    const line = "The pig cannot find a path out.";
    state.accountingEvents.push(line);
    return line;
  }
  const to = { ...route.firstStep };
  pig.hex = to;
  pig.lastMove = {
    from,
    to,
    turn: state.turnCount,
    escapeDistance: route.distance
  };
  pig.lastStuckTurn = null;
  const moveVerb = pig.reactionsThisTurn > 1 ? "startled and moved" : "moved";
  const line = `The pig ${moveVerb} from (${from.q}, ${from.r}) to (${to.q}, ${to.r}).`;
  state.accountingEvents.push(line);
  return line;
}

function getPigTrapWinner(state) {
  const pig = ensurePigState(state);
  return pig && isValidPlayerNumber(pig.trappedBy, state) ? pig.trappedBy : 0;
}

function canPigDestroyCell(state, hex, cell = getCellAt(state, hex)) {
  return Boolean(usesPigMode(state) && cell && (cell.kind === "stone" || isRiftBloomGhostCell(cell)));
}

function getPlacementAnchorHexes(state) {
  const pigHex = getPigHex(state);
  return [
    ...Object.keys(state.cells).map((key) => parseKey(key)),
    ...getPowderSourceHexes(state),
    ...(pigHex ? [{ ...pigHex }] : []),
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
  if (getPigAt(state, hex)) {
    return true;
  }
  if (state.panicZones[keyOf(hex.q, hex.r)]) {
    return true;
  }
  if (isEverythingBagelRedTapeHex(state, hex)) {
    return true;
  }
  if (isChaosBlockedHex(state, hex)) {
    return true;
  }
  if (getBirdEchoCopyAt(state, hex)) {
    return true;
  }
  return false;
}

function isOccupied(state, hex) {
  return isStoneOccupied(state, hex) || Boolean(getBirdAt(state, hex)) || Boolean(getBirdEchoCopyAt(state, hex)) || Boolean(getPigAt(state, hex));
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
  if (usesBedSiegeMode(state)) {
    return isLegalBedSiegePlacement(state, hex, state.turnPlayer);
  }
  if (usesFactoryMode(state)) {
    return isLegalFactoryPlacement(state, hex, state.turnPlayer);
  }
  if (!isLegalByBaseRules(state, hex, { allowOccupied: false })) {
    return false;
  }
  if (usesPowderMode(state) && (isBelowPowderFloor(state, hex) || isPowderSourceHex(state, hex))) {
    return false;
  }

  const occupiedByStone = isStoneOccupied(state, hex);
  if (occupiedByStone) {
    return false;
  }
  return true;
}

function isRiftBloomGhostCell(cell) {
  return Boolean(cell && (cell.kind === "riftGhost" || cell.riftBloomGhost));
}

function getRiftBloomPhase(state) {
  const gridBias = usesTriangleGridMode(state)
    ? 1
    : (usesSquareGridMode(state)
      ? 2
      : (usesOctagonGridMode(state) ? 3 : (usesRadialGridMode(state) ? 4 : 0)));
  return Math.trunc(Number(state?.turnCount) || 0) + gridBias;
}

function isRiftBloomActiveCell(state, hex) {
  if (!usesRiftBloomMode(state) || !hex || !isCellSupportedForMode(state, hex)) {
    return false;
  }
  const q = Math.trunc(Number(hex.q) || 0);
  const r = Math.trunc(Number(hex.r) || 0);
  if (q === 0 && r === 0) {
    return false;
  }
  return positiveMod(q + (2 * r) + getRiftBloomPhase(state), getRiftBloomCellModulus(state)) === 0;
}

function getRiftBloomMirrorTarget(state, hex) {
  if (!hex) {
    return null;
  }
  const target = getMirrorCellForMode(state, hex);
  if (!target || equalHex(target, hex) || !isCellSupportedForMode(state, target)) {
    return null;
  }
  return target;
}

function isRiftBloomGhostTargetOpen(state, hex) {
  return Boolean(
    hex
      && isCellSupportedForMode(state, hex)
      && !isOccupied(state, hex)
      && !isHexBlockedBySpecials(state, hex)
      && !isEverythingBagelRedTapeHex(state, hex)
  );
}

function getRiftBloomGhostEntries(state) {
  if (!state?.cells) {
    return [];
  }
  return Object.entries(state.cells)
    .filter(([, cell]) => isRiftBloomGhostCell(cell))
    .map(([key, cell]) => ({
      key,
      hex: parseKey(key),
      cell
    }));
}

function countRiftBloomAnchorFriends(state, hex, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  return getAdjacentsForMode(state, hex).filter((candidate) => {
    const cell = getCellAt(state, candidate);
    return Boolean(cell && cell.kind === "stone" && !isRiftBloomGhostCell(cell) && cell.owner === safeOwner);
  }).length;
}

function getRiftBloomAdjacentOwnerCounts(state, hex) {
  const counts = createPlayerMap(getPlayerCount(state), () => 0);
  for (const candidate of getAdjacentsForMode(state, hex)) {
    const cell = getCellAt(state, candidate);
    if (!cell || cell.kind !== "stone" || isRiftBloomGhostCell(cell)) {
      continue;
    }
    const owner = normalisePlayerNumber(cell.owner, state);
    counts[owner] += 1;
  }
  return counts;
}

function getRiftBloomMajorityOwner(state, hex, creatorOwner = 0) {
  const counts = getRiftBloomAdjacentOwnerCounts(state, hex);
  let bestOwner = 0;
  let bestCount = 0;
  let tied = false;
  for (const owner of getPlayerNumbers(state)) {
    const count = counts[owner] || 0;
    if (count > bestCount) {
      bestOwner = owner;
      bestCount = count;
      tied = false;
    } else if (count === bestCount && count > 0) {
      tied = true;
    }
  }
  if (bestCount <= 0) {
    return 0;
  }
  if (tied) {
    return riftBloomTieGoesToCreator(state) ? normalisePlayerNumber(creatorOwner, state) : 0;
  }
  return bestOwner;
}

function addRiftBloomGhost(state, hex, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  clearPowderAt(state, hex);
  state.moveSerial += 1;
  state.cells[keyOf(hex.q, hex.r)] = {
    owner: safeOwner,
    kind: "riftGhost",
    serial: state.moveSerial,
    riftBloomGhost: true,
    riftTTL: getRiftBloomGhostTurns(state)
  };
}

function applyRiftBloomPlacementEffects(state, placedHex, owner) {
  if (!usesRiftBloomMode(state) || !placedHex || !isRiftBloomActiveCell(state, placedHex)) {
    return [];
  }

  const target = getRiftBloomMirrorTarget(state, placedHex);
  if (!target) {
    return ["Rift Bloom folded back into itself."];
  }

  const targetCell = getCellAt(state, target);
  if (isRiftBloomGhostCell(targetCell) && targetCell.owner === normalisePlayerNumber(owner, state)) {
    targetCell.riftTTL = getRiftBloomGhostTurns(state);
    targetCell.serial = ++state.moveSerial;
    return [`Rift Bloom refreshed the mirrored ghost at (${target.q}, ${target.r}).`];
  }

  if (!isRiftBloomGhostTargetOpen(state, target)) {
    return [`Rift Bloom sparked, but the mirror at (${target.q}, ${target.r}) was blocked.`];
  }

  addRiftBloomGhost(state, target, owner);
  const turns = getRiftBloomGhostTurns(state);
  const ruleText = usesRiftBloomContestClaim(state)
    ? `It resolves after ${turns} turn${turns === 1 ? "" : "s"} to the adjacent majority.`
    : `Anchor it beside ${RIFT_BLOOM_ANCHOR_FRIENDS} friendly stones within ${turns} turn${turns === 1 ? "" : "s"}.`;
  return [`Rift Bloom sprouted a mirrored ghost at (${target.q}, ${target.r}). ${ruleText}`];
}

function resolveRiftBloom(state) {
  if (!usesRiftBloomMode(state)) {
    return { anchored: 0, claimed: 0, faded: 0, unstable: 0 };
  }

  const entries = getRiftBloomGhostEntries(state);
  if (entries.length === 0) {
    return { anchored: 0, claimed: 0, faded: 0, unstable: 0 };
  }

  let anchored = 0;
  let claimed = 0;
  let faded = 0;
  let unstable = 0;
  const anchoredOwners = new Set();
  const contestClaim = usesRiftBloomContestClaim(state);

  for (const entry of entries) {
    const cell = state.cells[entry.key];
    if (!isRiftBloomGhostCell(cell)) {
      continue;
    }

    if (!contestClaim && countRiftBloomAnchorFriends(state, entry.hex, cell.owner) >= RIFT_BLOOM_ANCHOR_FRIENDS) {
      cell.kind = "stone";
      delete cell.riftBloomGhost;
      delete cell.riftTTL;
      cell.serial = ++state.moveSerial;
      anchored += 1;
      anchoredOwners.add(normalisePlayerNumber(cell.owner, state));
      continue;
    }

    const nextTtl = Math.max(0, Math.trunc(Number(cell.riftTTL) || getRiftBloomGhostTurns(state)) - 1);
    if (nextTtl <= 0) {
      const claimOwner = contestClaim ? getRiftBloomMajorityOwner(state, entry.hex, cell.owner) : 0;
      if (claimOwner) {
        cell.owner = claimOwner;
        cell.kind = "stone";
        delete cell.riftBloomGhost;
        delete cell.riftTTL;
        cell.serial = ++state.moveSerial;
        claimed += 1;
        anchoredOwners.add(claimOwner);
      } else {
        delete state.cells[entry.key];
        faded += 1;
      }
    } else {
      cell.riftTTL = nextTtl;
      unstable += 1;
    }
  }

  for (const owner of anchoredOwners) {
    enforceStoneCapAfterPlacement(state, owner, { interactiveEgyptian: false });
  }

  if (anchored || claimed || faded) {
    const parts = [];
    if (anchored) {
      parts.push(`${anchored} anchored`);
    }
    if (claimed) {
      parts.push(`${claimed} claimed`);
    }
    if (faded) {
      parts.push(`${faded} faded`);
    }
    if (unstable) {
      parts.push(`${unstable} unstable`);
    }
    const line = `Rift Bloom resolved: ${parts.join(", ")}.`;
    state.accountingEvents.push(line);
    pushLog(line);
  }

  return { anchored, claimed, faded, unstable };
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

function placeStone(state, hex, owner, kind = "stone", extras = {}) {
  const safeOwner = normalisePlayerNumber(owner, state);
  const extraFields = typeof extras === "string" ? { pieceType: extras } : { ...(extras || {}) };
  const appliedExtras = applyPowderFieldsToStoneExtras(state, kind, extraFields);
  clearPowderAt(state, hex);
  state.moveSerial += 1;
  state.cells[keyOf(hex.q, hex.r)] = {
    owner: safeOwner,
    kind,
    serial: state.moveSerial,
    ...appliedExtras
  };
  state.lastPlacement = { ...hex };
  if (!state.lastPlacedByPlayer || typeof state.lastPlacedByPlayer !== "object") {
    state.lastPlacedByPlayer = createPlayerMap(getPlayerCount(state), () => null);
  }
  state.lastPlacedByPlayer[safeOwner] = { ...hex };
  state.lastPlacedThisTurn.push({ ...hex });
}

function removeStone(state, hex, options = {}) {
  const removedCell = getCellAt(state, hex);
  if (!removedCell) {
    return null;
  }
  if (removedCell.chaosShield && !options.ignoreChaosShield) {
    delete removedCell.chaosShield;
    removedCell.serial = ++state.moveSerial;
    return null;
  }
  delete state.cells[keyOf(hex.q, hex.r)];
  handleBedSiegeStoneRemoved(state, hex, removedCell);
  return removedCell;
}

function addEffectStone(state, hex, owner, kind = "stone", extras = {}) {
  if (!isHexOpen(state, hex) || isEverythingBagelRedTapeHex(state, hex)) {
    return false;
  }
  const safeOwner = normalisePlayerNumber(owner, state);
  const appliedExtras = applyPowderFieldsToStoneExtras(state, kind, extras || {});
  clearPowderAt(state, hex);
  state.moveSerial += 1;
  state.cells[keyOf(hex.q, hex.r)] = {
    owner: safeOwner,
    kind,
    serial: state.moveSerial,
    ...appliedExtras
  };
  return true;
}

function moveStonePreservingSerial(state, fromHex, toHex) {
  if (!isCellSupportedForMode(state, toHex) || isOccupied(state, toHex) || isEverythingBagelRedTapeHex(state, toHex)) {
    return false;
  }
  const cell = getCellAt(state, fromHex);
  if (!cell || cell.kind !== "stone") {
    return false;
  }
  removeStone(state, fromHex, { ignoreChaosShield: true });
  clearPowderAt(state, toHex);
  state.cells[keyOf(toHex.q, toHex.r)] = { ...cell };
  replaceTrackedHex(state, fromHex, toHex);
  return true;
}

function getChaosRuleDefinitions() {
  return Array.from(chaosRulesById.values());
}

function getChaosRuleDef(ruleId) {
  return chaosRulesById.get(ruleId) || null;
}

function createChaosState() {
  return {
    activeRules: [],
    pendingVote: null,
    recentRuleIds: [],
    serial: 0
  };
}

function getChaosRuleDuration(ruleDef) {
  const minTurns = Math.max(1, Math.trunc(Number(ruleDef?.minTurns) || 3));
  const maxTurns = Math.max(minTurns, Math.trunc(Number(ruleDef?.maxTurns) || minTurns));
  return minTurns + Math.floor(Math.random() * (maxTurns - minTurns + 1));
}

function formatChaosRuleDuration(ruleDef) {
  if (ruleDef?.trigger === "instant") {
    return "Instant";
  }
  const minTurns = Math.max(1, Math.trunc(Number(ruleDef?.minTurns) || 3));
  const maxTurns = Math.max(minTurns, Math.trunc(Number(ruleDef?.maxTurns) || minTurns));
  return minTurns === maxTurns ? `${minTurns} turns` : `${minTurns}-${maxTurns} turns`;
}

function makeChaosChoiceSnapshot(ruleDef) {
  return {
    id: ruleDef.id,
    title: ruleDef.title,
    description: ruleDef.description,
    trigger: ruleDef.trigger || "static",
    durationText: formatChaosRuleDuration(ruleDef)
  };
}

function ensureChaosState(state) {
  if (!state || !usesChaosVoteMode(state)) {
    return null;
  }
  if (!state.chaos || typeof state.chaos !== "object") {
    state.chaos = createChaosState();
  }
  if (!Array.isArray(state.chaos.activeRules)) {
    state.chaos.activeRules = [];
  }
  state.chaos.activeRules = state.chaos.activeRules
    .map((rule) => {
      const ruleDef = getChaosRuleDef(rule?.id);
      if (!ruleDef) {
        return null;
      }
      const turnsLeft = Math.max(0, Math.trunc(Number(rule.turnsLeft) || 0));
      if (turnsLeft <= 0) {
        return null;
      }
      return {
        id: ruleDef.id,
        title: rule.title || ruleDef.title,
        description: rule.description || ruleDef.description,
        owner: normalisePlayerNumber(rule.owner, state),
        turnsLeft,
        totalTurns: Math.max(turnsLeft, Math.trunc(Number(rule.totalTurns) || turnsLeft)),
        serial: Math.max(1, Math.trunc(Number(rule.serial) || 1))
      };
    })
    .filter(Boolean);

  if (!Array.isArray(state.chaos.recentRuleIds)) {
    state.chaos.recentRuleIds = [];
  }
  state.chaos.recentRuleIds = state.chaos.recentRuleIds
    .map((ruleId) => String(ruleId))
    .filter((ruleId) => chaosRulesById.has(ruleId))
    .slice(-CHAOS_RECENT_RULE_MEMORY);
  state.chaos.serial = Math.max(0, Math.trunc(Number(state.chaos.serial) || 0));

  const pending = state.chaos.pendingVote;
  if (!pending || typeof pending !== "object" || !Array.isArray(pending.choices) || pending.choices.length === 0) {
    state.chaos.pendingVote = null;
  } else {
    const choices = pending.choices
      .map((choice) => getChaosRuleDef(choice?.id))
      .filter(Boolean)
      .map((ruleDef) => makeChaosChoiceSnapshot(ruleDef));
    state.chaos.pendingVote = choices.length > 0
      ? {
        chooser: normalisePlayerNumber(pending.chooser, state),
        completedTurn: Math.max(0, Math.trunc(Number(pending.completedTurn) || state.turnCount || 0)),
        choices
      }
      : null;
  }

  return state.chaos;
}

function hasChaosPendingVote(state) {
  const chaos = ensureChaosState(state);
  return Boolean(chaos?.pendingVote);
}

function getChaosActiveRules(state) {
  const chaos = ensureChaosState(state);
  return chaos ? chaos.activeRules : [];
}

function shuffleChaosList(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateChaosRuleChoices(state) {
  const chaos = ensureChaosState(state);
  if (!chaos) {
    return [];
  }
  const excluded = new Set([
    ...chaos.activeRules.map((rule) => rule.id),
    ...chaos.recentRuleIds
  ]);
  const available = getChaosRuleDefinitions().filter((ruleDef) => !excluded.has(ruleDef.id));
  const fallback = available.length >= CHAOS_RULE_CHOICE_COUNT
    ? available
    : getChaosRuleDefinitions().filter((ruleDef) => !chaos.activeRules.some((rule) => rule.id === ruleDef.id));
  return shuffleChaosList(fallback)
    .slice(0, CHAOS_RULE_CHOICE_COUNT)
    .map((ruleDef) => makeChaosChoiceSnapshot(ruleDef));
}

function openChaosRuleVoteIfNeeded(state, previousPlayer) {
  if (!usesChaosVoteMode(state) || checkForWinner(state)) {
    return false;
  }
  const chaos = ensureChaosState(state);
  if (!chaos || chaos.pendingVote || state.turnCount <= 0 || state.turnCount % CHAOS_VOTE_INTERVAL !== 0) {
    return false;
  }
  const choices = generateChaosRuleChoices(state);
  if (choices.length === 0) {
    return false;
  }
  const chooser = normalisePlayerNumber(previousPlayer, state);
  chaos.pendingVote = {
    chooser,
    completedTurn: state.turnCount,
    choices
  };
  state.turnPlayer = chooser;
  state.movesLeftInTurn = 0;
  state.duckPhase = false;
  state.birdMovesPending = [];
  state.currentBirdMoveKind = null;
  state.egyptianRemoval = null;
  pushLog(`Rule Vote: Player ${chooser} chooses the next rule.`);
  syncClockTickerFromState();
  return true;
}

function canChooseChaosRule(state = game.state) {
  if (!state || state.winner || isBrowsingHistory() || !hasChaosPendingVote(state)) {
    return false;
  }
  return canActForCurrentTurn();
}

function getChaosRuleOwner(rule, state) {
  return normalisePlayerNumber(rule?.owner, state);
}

function getChaosTriggerOwner(event, state) {
  return normalisePlayerNumber(event?.triggerOwner || state.turnPlayer, state);
}

function chaosScopeMatches(scope, ruleOwner, triggerOwner, owner) {
  if (!owner) {
    return false;
  }
  if (scope === "ruleOwner") {
    return owner === ruleOwner;
  }
  if (scope === "ruleOpponents") {
    return owner !== ruleOwner;
  }
  if (scope === "triggerOwner") {
    return owner === triggerOwner;
  }
  if (scope === "triggerOpponents") {
    return owner !== triggerOwner;
  }
  return true;
}

function shouldChaosRuleTriggerForOwner(rule, ruleDef, triggerOwner, state) {
  const ruleOwner = getChaosRuleOwner(rule, state);
  const scope = ruleDef.triggerScope || "all";
  if (scope === "all") {
    return true;
  }
  if (scope === "ruleOwner") {
    return triggerOwner === ruleOwner;
  }
  if (scope === "opponentsOfRuleOwner") {
    return triggerOwner !== ruleOwner;
  }
  return true;
}

function getChaosStoneEntries(state, rule, ruleDef, event, targetOverride = null) {
  const ruleOwner = getChaosRuleOwner(rule, state);
  const triggerOwner = getChaosTriggerOwner(event, state);
  const target = targetOverride || ruleDef.target || "all";
  return Object.entries(state.cells)
    .map(([key, cell]) => ({ key, hex: parseKey(key), cell }))
    .filter((entry) => (
      entry.cell
      && entry.cell.kind === "stone"
      && isValidPlayerNumber(entry.cell.owner, state)
      && chaosScopeMatches(target, ruleOwner, triggerOwner, normalisePlayerNumber(entry.cell.owner, state))
    ));
}

function getChaosAnchorHex(state, rule, ruleDef, event, anchorName = ruleDef.anchor || "origin") {
  const ruleOwner = getChaosRuleOwner(rule, state);
  const triggerOwner = getChaosTriggerOwner(event, state);
  const eventHex = event?.placementHex || null;
  if (anchorName === "lastPlacement" && eventHex) {
    return { ...eventHex };
  }
  if (anchorName === "lastRuleOwner") {
    return state.lastPlacedByPlayer?.[ruleOwner] ? { ...state.lastPlacedByPlayer[ruleOwner] } : { q: 0, r: 0 };
  }
  if (anchorName === "lastTriggerOwner") {
    return state.lastPlacedByPlayer?.[triggerOwner] ? { ...state.lastPlacedByPlayer[triggerOwner] } : { q: 0, r: 0 };
  }
  if (anchorName === "newestRuleOwner") {
    const entry = selectChaosEntries(state, rule, { target: "ruleOwner", selector: "newest" }, event, 1)[0];
    return entry ? { ...entry.hex } : { q: 0, r: 0 };
  }
  if (anchorName === "oldestRuleOwner") {
    const entry = selectChaosEntries(state, rule, { target: "ruleOwner", selector: "oldest" }, event, 1)[0];
    return entry ? { ...entry.hex } : { q: 0, r: 0 };
  }
  return { q: 0, r: 0 };
}

function sortChaosEntries(state, entries, selector, anchorHex) {
  const sorted = [...entries];
  if (selector === "oldest") {
    sorted.sort((a, b) => a.cell.serial - b.cell.serial);
  } else if (selector === "newest") {
    sorted.sort((a, b) => b.cell.serial - a.cell.serial);
  } else if (selector === "farthestOrigin") {
    sorted.sort((a, b) => getDistanceForMode(state, b.hex) - getDistanceForMode(state, a.hex));
  } else if (selector === "nearestOrigin") {
    sorted.sort((a, b) => getDistanceForMode(state, a.hex) - getDistanceForMode(state, b.hex));
  } else if (selector === "nearAnchor" || selector === "adjacentAnchor") {
    sorted.sort((a, b) => getDistanceForMode(state, a.hex, anchorHex) - getDistanceForMode(state, b.hex, anchorHex));
  } else if (selector === "farAnchor" || selector === "farthestAnchor") {
    sorted.sort((a, b) => getDistanceForMode(state, b.hex, anchorHex) - getDistanceForMode(state, a.hex, anchorHex));
  } else {
    return shuffleChaosList(sorted);
  }
  return sorted;
}

function selectChaosEntries(state, rule, ruleDef, event, countOverride = null, targetOverride = null, selectorOverride = null) {
  const count = Math.max(1, Math.trunc(Number(countOverride ?? ruleDef.count) || 1));
  const selector = selectorOverride || ruleDef.selector || "random";
  const anchorHex = getChaosAnchorHex(state, rule, ruleDef, event);
  let entries = getChaosStoneEntries(state, rule, ruleDef, event, targetOverride);
  if (selector === "adjacentAnchor") {
    entries = entries.filter((entry) => getDistanceForMode(state, entry.hex, anchorHex) === 1);
  }
  return sortChaosEntries(state, entries, selector, anchorHex).slice(0, count);
}

function getChaosOwnerFromRuleValue(state, rule, event, value, fallbackOwner = 1) {
  const ruleOwner = getChaosRuleOwner(rule, state);
  const triggerOwner = getChaosTriggerOwner(event, state);
  if (value === "ruleOwner") {
    return ruleOwner;
  }
  if (value === "triggerOwner") {
    return triggerOwner;
  }
  if (value === "nextAfterRuleOwner") {
    return getNextPlayerNumber(state, ruleOwner);
  }
  if (value === "nextAfterTriggerOwner") {
    return getNextPlayerNumber(state, triggerOwner);
  }
  return normalisePlayerNumber(fallbackOwner, state);
}

function getChaosExactSpawnHex(state, rule, ruleDef, event, spawnNear) {
  const eventHex = event?.placementHex || null;
  if (spawnNear === "mirrorLastPlacement" && eventHex) {
    return getMirrorCellForMode(state, eventHex);
  }
  if (spawnNear === "mirrorLastRuleOwner") {
    const base = state.lastPlacedByPlayer?.[getChaosRuleOwner(rule, state)] || { q: 0, r: 0 };
    return getMirrorCellForMode(state, base);
  }
  if (spawnNear === "mirrorLastTriggerOwner") {
    const base = state.lastPlacedByPlayer?.[getChaosTriggerOwner(event, state)] || { q: 0, r: 0 };
    return getMirrorCellForMode(state, base);
  }
  return null;
}

function getChaosSpawnCenter(state, rule, ruleDef, event, spawnNear) {
  const eventHex = event?.placementHex || null;
  if (spawnNear === "lastPlacement" && eventHex) {
    return { ...eventHex };
  }
  if (spawnNear === "lastRuleOwner") {
    return state.lastPlacedByPlayer?.[getChaosRuleOwner(rule, state)] || { q: 0, r: 0 };
  }
  if (spawnNear === "lastTriggerOwner") {
    return state.lastPlacedByPlayer?.[getChaosTriggerOwner(event, state)] || { q: 0, r: 0 };
  }
  if (spawnNear === "newestRuleOwner") {
    const entry = selectChaosEntries(state, rule, { target: "ruleOwner", selector: "newest" }, event, 1)[0];
    return entry ? entry.hex : { q: 0, r: 0 };
  }
  if (spawnNear === "oldestRuleOwner") {
    const entry = selectChaosEntries(state, rule, { target: "ruleOwner", selector: "oldest" }, event, 1)[0];
    return entry ? entry.hex : { q: 0, r: 0 };
  }
  if (spawnNear === "farthestTriggerOwner") {
    const entry = selectChaosEntries(state, rule, { target: "triggerOwner", selector: "farthestOrigin" }, event, 1)[0];
    return entry ? entry.hex : { q: 0, r: 0 };
  }
  return { q: 0, r: 0 };
}

function getChaosSpawnCandidates(state, centerHex, includeCenter = false) {
  const candidates = [];
  if (includeCenter) {
    candidates.push(centerHex);
  }
  candidates.push(...getAdjacentsForMode(state, centerHex));
  for (const secondRing of getAdjacentsForMode(state, centerHex)) {
    candidates.push(...getAdjacentsForMode(state, secondRing));
  }
  return shuffleChaosList(uniqueSupportedHexes(state, candidates))
    .filter((hex) => isHexOpen(state, hex) && !isEverythingBagelRedTapeHex(state, hex) && !isChaosBlockedHex(state, hex));
}

function applyChaosSpawnEffect(state, rule, ruleDef, event, selectedEntry = null) {
  const count = Math.max(1, Math.trunc(Number(ruleDef.count) || 1));
  const owner = selectedEntry
    ? normalisePlayerNumber(selectedEntry.cell.owner, state)
    : getChaosOwnerFromRuleValue(state, rule, event, ruleDef.spawnOwner || "ruleOwner", getChaosRuleOwner(rule, state));
  const spawnNear = ruleDef.spawnNear || "lastRuleOwner";
  const exact = selectedEntry ? null : getChaosExactSpawnHex(state, rule, ruleDef, event, spawnNear);
  let candidates = [];
  if (exact) {
    candidates = isHexOpen(state, exact) && !isEverythingBagelRedTapeHex(state, exact) && !isChaosBlockedHex(state, exact)
      ? [exact]
      : [];
  } else {
    const center = selectedEntry ? selectedEntry.hex : getChaosSpawnCenter(state, rule, ruleDef, event, spawnNear);
    candidates = getChaosSpawnCandidates(state, center, spawnNear === "origin");
  }

  let spawned = 0;
  for (const hex of candidates) {
    if (spawned >= count) {
      break;
    }
    if (addEffectStone(state, hex, owner, "stone", usesArmoryMode(state) ? { pieceType: "militia" } : {})) {
      spawned += 1;
    }
  }
  return spawned > 0 ? `added ${spawned} Player ${owner} stone${spawned === 1 ? "" : "s"}` : "";
}

function applyChaosRemoveEffect(state, rule, ruleDef, event, targetOverride = null, selectorOverride = null) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, null, targetOverride, selectorOverride);
  let removed = 0;
  let cracked = 0;
  for (const entry of entries) {
    const hadShield = Boolean(entry.cell.chaosShield);
    const removedCell = removeStone(state, entry.hex);
    if (removedCell) {
      removed += 1;
    } else if (hadShield) {
      cracked += 1;
    }
  }
  const parts = [];
  if (removed > 0) parts.push(`removed ${removed} stone${removed === 1 ? "" : "s"}`);
  if (cracked > 0) parts.push(`cracked ${cracked} shield${cracked === 1 ? "" : "s"}`);
  return parts.join(" and ");
}

function applyChaosConvertEffect(state, rule, ruleDef, event, targetOverride = null, selectorOverride = null) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, null, targetOverride, selectorOverride);
  const toOwner = getChaosOwnerFromRuleValue(state, rule, event, ruleDef.convertTo || "ruleOwner", getChaosRuleOwner(rule, state));
  let converted = 0;
  for (const entry of entries) {
    const cell = getCellAt(state, entry.hex);
    if (!cell || cell.kind !== "stone" || cell.owner === toOwner) {
      continue;
    }
    cell.owner = toOwner;
    cell.serial = ++state.moveSerial;
    converted += 1;
  }
  return converted > 0 ? `converted ${converted} stone${converted === 1 ? "" : "s"} to Player ${toOwner}` : "";
}

function applyChaosShieldEffect(state, rule, ruleDef, event, targetOverride = null, selectorOverride = null) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, null, targetOverride, selectorOverride);
  let shielded = 0;
  for (const entry of entries) {
    const cell = getCellAt(state, entry.hex);
    if (!cell || cell.kind !== "stone" || cell.chaosShield) {
      continue;
    }
    cell.chaosShield = true;
    cell.serial = ++state.moveSerial;
    shielded += 1;
  }
  return shielded > 0 ? `shielded ${shielded} stone${shielded === 1 ? "" : "s"}` : "";
}

function getChaosMoveDestination(state, fromHex, movement, anchorHex) {
  if (movement === "clockwise" || movement === "counterClockwise") {
    const target = movement === "clockwise"
      ? orbitStepForMode(state, fromHex)
      : rotateAxial(fromHex, -1);
    return isHexOpen(state, target) && !isEverythingBagelRedTapeHex(state, target) && !isChaosBlockedHex(state, target) ? target : null;
  }

  const currentOriginDistance = getDistanceForMode(state, fromHex);
  const currentAnchorDistance = getDistanceForMode(state, fromHex, anchorHex);
  const candidates = getAdjacentsForMode(state, fromHex)
    .filter((hex) => isHexOpen(state, hex) && !isEverythingBagelRedTapeHex(state, hex) && !isChaosBlockedHex(state, hex));
  if (candidates.length === 0) {
    return null;
  }
  if (movement === "inward") {
    return candidates
      .filter((hex) => getDistanceForMode(state, hex) < currentOriginDistance)
      .sort((a, b) => getDistanceForMode(state, a) - getDistanceForMode(state, b))[0] || null;
  }
  if (movement === "towardsAnchor") {
    return candidates
      .filter((hex) => getDistanceForMode(state, hex, anchorHex) < currentAnchorDistance)
      .sort((a, b) => getDistanceForMode(state, a, anchorHex) - getDistanceForMode(state, b, anchorHex))[0] || null;
  }
  if (movement === "awayAnchor") {
    return candidates
      .filter((hex) => getDistanceForMode(state, hex, anchorHex) > currentAnchorDistance)
      .sort((a, b) => getDistanceForMode(state, b, anchorHex) - getDistanceForMode(state, a, anchorHex))[0] || null;
  }
  return candidates
    .filter((hex) => getDistanceForMode(state, hex) > currentOriginDistance)
    .sort((a, b) => getDistanceForMode(state, b) - getDistanceForMode(state, a))[0] || null;
}

function applyChaosMoveEffect(state, rule, ruleDef, event, targetOverride = null, selectorOverride = null) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, null, targetOverride, selectorOverride);
  const anchorHex = getChaosAnchorHex(state, rule, ruleDef, event);
  let moved = 0;
  for (const entry of entries) {
    const target = getChaosMoveDestination(state, entry.hex, ruleDef.movement || "outward", anchorHex);
    if (target && moveStonePreservingSerial(state, entry.hex, target)) {
      moved += 1;
    }
  }
  return moved > 0 ? `moved ${moved} stone${moved === 1 ? "" : "s"}` : "";
}

function applyChaosSwapPositionsEffect(state, rule, ruleDef, event) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, 2);
  if (entries.length < 2) {
    return "";
  }
  const first = entries[0];
  const second = entries[1];
  const firstCell = getCellAt(state, first.hex);
  const secondCell = getCellAt(state, second.hex);
  if (!firstCell || !secondCell) {
    return "";
  }
  state.cells[keyOf(first.hex.q, first.hex.r)] = { ...secondCell };
  state.cells[keyOf(second.hex.q, second.hex.r)] = { ...firstCell };
  transformTrackedHexes(state, (hex) => {
    if (equalHex(hex, first.hex)) return { ...second.hex };
    if (equalHex(hex, second.hex)) return { ...first.hex };
    return { ...hex };
  });
  return "swapped 2 stone positions";
}

function applyChaosSwapOwnersEffect(state, rule, ruleDef, event) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, 2);
  if (entries.length < 2) {
    return "";
  }
  const firstCell = getCellAt(state, entries[0].hex);
  const secondCell = getCellAt(state, entries[1].hex);
  if (!firstCell || !secondCell || firstCell.owner === secondCell.owner) {
    return "";
  }
  [firstCell.owner, secondCell.owner] = [secondCell.owner, firstCell.owner];
  firstCell.serial = ++state.moveSerial;
  secondCell.serial = ++state.moveSerial;
  return "swapped 2 stone owners";
}

function applyChaosRotateOwnersEffect(state, rule, ruleDef, event) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, Math.max(3, Math.trunc(Number(ruleDef.count) || 3)));
  if (entries.length < 3) {
    return "";
  }
  const cells = entries
    .map((entry) => getCellAt(state, entry.hex))
    .filter((cell) => cell && cell.kind === "stone");
  if (cells.length < 3) {
    return "";
  }
  const owners = cells.map((cell) => cell.owner);
  for (let i = 0; i < cells.length; i += 1) {
    cells[i].owner = owners[(i + owners.length - 1) % owners.length];
    cells[i].serial = ++state.moveSerial;
  }
  return `rotated owners across ${cells.length} stones`;
}

function applyChaosCyclePositionsEffect(state, rule, ruleDef, event) {
  const entries = selectChaosEntries(state, rule, ruleDef, event, Math.max(3, Math.trunc(Number(ruleDef.count) || 3)));
  if (entries.length < 3) {
    return "";
  }
  const cells = entries.map((entry) => getCellAt(state, entry.hex));
  if (cells.some((cell) => !cell || cell.kind !== "stone")) {
    return "";
  }

  const destinations = new Map();
  for (let i = 0; i < entries.length; i += 1) {
    const from = entries[i].hex;
    const to = entries[(i + 1) % entries.length].hex;
    destinations.set(keyOf(from.q, from.r), { ...to });
  }

  for (let i = 0; i < entries.length; i += 1) {
    const destination = entries[(i + 1) % entries.length].hex;
    state.cells[keyOf(destination.q, destination.r)] = { ...cells[i] };
  }
  transformTrackedHexes(state, (hex) => destinations.get(keyOf(hex.q, hex.r)) || { ...hex });
  return `cycled ${entries.length} stone positions`;
}

function getChaosAreaHexes(state, centerHex, radius = 1) {
  const safeRadius = Math.max(1, Math.min(3, Math.trunc(Number(radius) || 1)));
  const seen = new Map();
  let frontier = uniqueSupportedHexes(state, [centerHex]);
  for (const hex of frontier) {
    seen.set(keyOf(hex.q, hex.r), hex);
  }

  for (let depth = 0; depth < safeRadius; depth += 1) {
    const next = [];
    for (const hex of frontier) {
      for (const adjacent of getAdjacentsForMode(state, hex)) {
        if (!isCellSupportedForMode(state, adjacent)) {
          continue;
        }
        const key = keyOf(adjacent.q, adjacent.r);
        if (seen.has(key)) {
          continue;
        }
        seen.set(key, adjacent);
        next.push(adjacent);
      }
    }
    frontier = next;
  }

  seen.delete(keyOf(centerHex.q, centerHex.r));
  return Array.from(seen.values());
}

function getChaosAreaStoneEntries(state, centerHex, rule, event, target = "all", radius = 1) {
  const ruleOwner = getChaosRuleOwner(rule, state);
  const triggerOwner = getChaosTriggerOwner(event, state);
  return getChaosAreaHexes(state, centerHex, radius)
    .map((hex) => ({ hex, cell: getCellAt(state, hex) }))
    .filter((entry) => (
      entry.cell
      && entry.cell.kind === "stone"
      && isValidPlayerNumber(entry.cell.owner, state)
      && chaosScopeMatches(target, ruleOwner, triggerOwner, normalisePlayerNumber(entry.cell.owner, state))
    ));
}

function getChaosAreaOpenHexes(state, centerHex, radius = 1) {
  return shuffleChaosList(getChaosAreaHexes(state, centerHex, radius))
    .filter((hex) => isHexOpen(state, hex) && !isEverythingBagelRedTapeHex(state, hex) && !isChaosBlockedHex(state, hex));
}

function applyChaosPulseEffect(state, rule, ruleDef, event) {
  const anchors = selectChaosEntries(state, rule, ruleDef, event, Math.max(1, Math.trunc(Number(ruleDef.count) || 1)));
  if (anchors.length === 0) {
    return "";
  }
  const pulseAction = ruleDef.pulseAction || "remove";
  const radius = Math.max(1, Math.min(3, Math.trunc(Number(ruleDef.radius) || 1)));
  const pulseLimit = Math.max(1, Math.trunc(Number(ruleDef.pulseCount) || 99));
  const parts = {
    removed: 0,
    cracked: 0,
    converted: 0,
    shielded: 0,
    spawned: 0,
    moved: 0
  };

  for (const anchor of anchors) {
    if (pulseAction === "spawn") {
      const owner = getChaosOwnerFromRuleValue(
        state,
        rule,
        event,
        ruleDef.pulseSpawnOwner || ruleDef.spawnOwner || "ruleOwner",
        getChaosRuleOwner(rule, state)
      );
      for (const hex of getChaosAreaOpenHexes(state, anchor.hex, radius)) {
        if (parts.spawned >= pulseLimit) {
          break;
        }
        if (addEffectStone(state, hex, owner, "stone", usesArmoryMode(state) ? { pieceType: "militia" } : {})) {
          parts.spawned += 1;
        }
      }
      continue;
    }

    const areaEntries = shuffleChaosList(getChaosAreaStoneEntries(
      state,
      anchor.hex,
      rule,
      event,
      ruleDef.pulseTarget || ruleDef.target || "all",
      radius
    )).slice(0, pulseLimit);

    if (pulseAction === "remove") {
      for (const entry of areaEntries) {
        const hadShield = Boolean(entry.cell.chaosShield);
        const removedCell = removeStone(state, entry.hex);
        if (removedCell) {
          parts.removed += 1;
        } else if (hadShield) {
          parts.cracked += 1;
        }
      }
    } else if (pulseAction === "convert") {
      const toOwner = getChaosOwnerFromRuleValue(
        state,
        rule,
        event,
        ruleDef.convertTo || "ruleOwner",
        getChaosRuleOwner(rule, state)
      );
      for (const entry of areaEntries) {
        const cell = getCellAt(state, entry.hex);
        if (cell && cell.kind === "stone" && cell.owner !== toOwner) {
          cell.owner = toOwner;
          cell.serial = ++state.moveSerial;
          parts.converted += 1;
        }
      }
    } else if (pulseAction === "shield") {
      for (const entry of areaEntries) {
        const cell = getCellAt(state, entry.hex);
        if (cell && cell.kind === "stone" && !cell.chaosShield) {
          cell.chaosShield = true;
          cell.serial = ++state.moveSerial;
          parts.shielded += 1;
        }
      }
    } else if (pulseAction === "push") {
      for (const entry of areaEntries) {
        const target = getChaosMoveDestination(state, entry.hex, ruleDef.movement || "awayAnchor", anchor.hex);
        if (target && moveStonePreservingSerial(state, entry.hex, target)) {
          parts.moved += 1;
        }
      }
    }
  }

  const messages = [];
  if (parts.removed > 0) messages.push(`removed ${parts.removed}`);
  if (parts.cracked > 0) messages.push(`cracked ${parts.cracked} shield${parts.cracked === 1 ? "" : "s"}`);
  if (parts.converted > 0) messages.push(`converted ${parts.converted}`);
  if (parts.shielded > 0) messages.push(`shielded ${parts.shielded}`);
  if (parts.spawned > 0) messages.push(`spawned ${parts.spawned}`);
  if (parts.moved > 0) messages.push(`pushed ${parts.moved}`);
  return messages.length > 0 ? messages.join(", ") : "";
}

function applyChaosSacrificeSpawnEffect(state, rule, ruleDef, event) {
  const entry = selectChaosEntries(state, rule, ruleDef, event, 1)[0];
  if (!entry) {
    return "";
  }
  const removedOwner = normalisePlayerNumber(entry.cell.owner, state);
  const removedCell = removeStone(state, entry.hex, { ignoreChaosShield: Boolean(ruleDef.ignoreShield) });
  if (!removedCell) {
    return "";
  }

  const spawnOwner = ruleDef.spawnOwner === "selectedOwner"
    ? removedOwner
    : getChaosOwnerFromRuleValue(state, rule, event, ruleDef.spawnOwner || "ruleOwner", getChaosRuleOwner(rule, state));
  const spawnCount = Math.max(1, Math.trunc(Number(ruleDef.spawnCount ?? ruleDef.count) || 1));
  let spawned = 0;
  for (const hex of getChaosSpawnCandidates(state, entry.hex)) {
    if (spawned >= spawnCount) {
      break;
    }
    if (addEffectStone(state, hex, spawnOwner, "stone", usesArmoryMode(state) ? { pieceType: "militia" } : {})) {
      spawned += 1;
    }
  }
  return `sacrificed 1 stone and added ${spawned} Player ${spawnOwner} stone${spawned === 1 ? "" : "s"}`;
}

function applyChaosRuleEffect(state, rule, ruleDef, event = {}) {
  if (!ruleDef || Math.random() > Math.max(0, Math.min(1, Number(ruleDef.chance) || 1))) {
    return "";
  }
  if (ruleDef.effect === "remove") {
    return applyChaosRemoveEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "convert") {
    return applyChaosConvertEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "spawn") {
    return applyChaosSpawnEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "shield") {
    return applyChaosShieldEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "shieldPlaced") {
    const hex = event.placementHex;
    const cell = hex ? getCellAt(state, hex) : null;
    if (cell && cell.kind === "stone" && !cell.chaosShield) {
      cell.chaosShield = true;
      cell.serial = ++state.moveSerial;
      return "shielded the placed stone";
    }
    return "";
  }
  if (ruleDef.effect === "move") {
    return applyChaosMoveEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "swapPositions") {
    return applyChaosSwapPositionsEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "swapOwners") {
    return applyChaosSwapOwnersEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "rotateOwners") {
    return applyChaosRotateOwnersEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "cyclePositions") {
    return applyChaosCyclePositionsEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "pulse") {
    return applyChaosPulseEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "sacrificeSpawn") {
    return applyChaosSacrificeSpawnEffect(state, rule, ruleDef, event);
  }
  if (ruleDef.effect === "shieldAndSpawn") {
    const entries = selectChaosEntries(state, rule, ruleDef, event, 1);
    if (entries.length === 0) {
      return "";
    }
    const shieldText = applyChaosShieldEffect(state, rule, ruleDef, event, ruleDef.target, ruleDef.selector);
    const spawnText = applyChaosSpawnEffect(state, rule, { ...ruleDef, count: 1, spawnNear: "selectedTarget" }, event, entries[0]);
    return [shieldText, spawnText].filter(Boolean).join(" and ");
  }
  if (ruleDef.effect === "shieldAndRemove") {
    const shieldText = applyChaosShieldEffect(state, rule, ruleDef, event, ruleDef.target, ruleDef.selector);
    const removeText = applyChaosRemoveEffect(state, rule, { ...ruleDef, target: ruleDef.removeTarget, selector: ruleDef.removeSelector || "oldest", count: 1 }, event);
    return [shieldText, removeText].filter(Boolean).join(" and ");
  }
  if (ruleDef.effect === "shieldAndMove") {
    const shieldText = applyChaosShieldEffect(state, rule, ruleDef, event);
    const moveText = applyChaosMoveEffect(state, rule, ruleDef, event);
    return [shieldText, moveText].filter(Boolean).join(" and ");
  }
  if (ruleDef.effect === "spawnFromSelectedOwner") {
    const entry = selectChaosEntries(state, rule, ruleDef, event, 1)[0];
    return entry ? applyChaosSpawnEffect(state, rule, ruleDef, event, entry) : "";
  }
  return "";
}

function applyChaosAfterPlacementEffects(state, placedHex, owner) {
  if (!usesChaosVoteMode(state)) {
    return [];
  }
  const chaos = ensureChaosState(state);
  if (!chaos) {
    return [];
  }
  const messages = [];
  const triggerOwner = normalisePlayerNumber(owner, state);
  for (const rule of chaos.activeRules) {
    const ruleDef = getChaosRuleDef(rule.id);
    if (!ruleDef || ruleDef.trigger !== "afterPlacement" || !shouldChaosRuleTriggerForOwner(rule, ruleDef, triggerOwner, state)) {
      continue;
    }
    const message = applyChaosRuleEffect(state, rule, ruleDef, {
      trigger: "afterPlacement",
      triggerOwner,
      placementHex: { ...placedHex }
    });
    if (message) {
      messages.push(`${ruleDef.title}: ${message}.`);
    }
  }
  return messages;
}

function resolveChaosTurnEnd(state, previousPlayer) {
  if (!usesChaosVoteMode(state)) {
    return;
  }
  const chaos = ensureChaosState(state);
  if (!chaos) {
    return;
  }
  const triggerOwner = normalisePlayerNumber(previousPlayer, state);
  for (const rule of chaos.activeRules) {
    const ruleDef = getChaosRuleDef(rule.id);
    if (!ruleDef || ruleDef.trigger !== "endTurn") {
      continue;
    }
    const message = applyChaosRuleEffect(state, rule, ruleDef, {
      trigger: "endTurn",
      triggerOwner
    });
    if (message) {
      pushLog(`${ruleDef.title}: ${message}.`);
    }
  }

  const stillActive = [];
  for (const rule of chaos.activeRules) {
    const nextTurnsLeft = Math.max(0, Math.trunc(Number(rule.turnsLeft) || 0) - 1);
    if (nextTurnsLeft > 0) {
      stillActive.push({ ...rule, turnsLeft: nextTurnsLeft });
    } else {
      const ruleDef = getChaosRuleDef(rule.id);
      if (ruleDef) {
        pushLog(`${ruleDef.title} expired.`);
      }
    }
  }
  chaos.activeRules = stillActive;
}

function applyChaosChosenRule(state, choice) {
  const chaos = ensureChaosState(state);
  const ruleDef = getChaosRuleDef(choice?.id);
  if (!chaos || !ruleDef) {
    return false;
  }
  const chooser = normalisePlayerNumber(chaos.pendingVote?.chooser || state.turnPlayer, state);
  chaos.recentRuleIds.push(ruleDef.id);
  chaos.recentRuleIds = chaos.recentRuleIds.slice(-CHAOS_RECENT_RULE_MEMORY);

  if (ruleDef.trigger === "instant") {
    const instantRule = {
      id: ruleDef.id,
      title: ruleDef.title,
      description: ruleDef.description,
      owner: chooser,
      turnsLeft: 0,
      totalTurns: 0,
      serial: chaos.serial + 1
    };
    chaos.serial += 1;
    const message = applyChaosRuleEffect(state, instantRule, ruleDef, {
      trigger: "instant",
      triggerOwner: chooser
    });
    pushLog(`${ruleDef.title} chosen by Player ${chooser}.${message ? ` It ${message}.` : ""}`);
    return true;
  }

  const duration = getChaosRuleDuration(ruleDef);
  chaos.serial += 1;
  chaos.activeRules.push({
    id: ruleDef.id,
    title: ruleDef.title,
    description: ruleDef.description,
    owner: chooser,
    turnsLeft: duration,
    totalTurns: duration,
    serial: chaos.serial
  });
  pushLog(`${ruleDef.title} chosen by Player ${chooser} for ${duration} turn${duration === 1 ? "" : "s"}.`);
  return true;
}

function chooseChaosRule(choiceIndex) {
  const state = game.state;
  if (!canChooseChaosRule(state)) {
    return;
  }
  const chaos = ensureChaosState(state);
  const pending = chaos?.pendingVote;
  const index = Math.max(0, Math.min((pending?.choices?.length || 1) - 1, Math.trunc(Number(choiceIndex) || 0)));
  const choice = pending?.choices?.[index];
  if (!choice) {
    return;
  }

  applyClockElapsedIfNeeded();
  saveHistory();
  const chooser = normalisePlayerNumber(pending.chooser, state);
  applyChaosChosenRule(state, choice);
  chaos.pendingVote = null;

  if (checkForWinner(state)) {
    updateStatus();
    syncClockTickerFromState();
    render();
    broadcastOnlineState();
    return;
  }

  finishTurnRotation(state, chooser);
  updateStatus();
  syncClockTickerFromState();
  render();
  broadcastOnlineState();
}

function matchesChaosBlockPattern(state, hex, pattern = {}) {
  const distance = getDistanceForMode(state, hex);
  if (pattern.ignoreOrigin && distance === 0) {
    return false;
  }
  if (pattern.type === "centerRadius") {
    return distance <= Math.max(0, Number(pattern.radius) || 0);
  }
  if (pattern.type === "outerRadius") {
    return distance >= Math.max(0, Number(pattern.radius) || 0);
  }
  if (pattern.type === "distanceEquals") {
    return distance === Math.max(0, Number(pattern.distance) || 0);
  }
  if (pattern.type === "distanceMod") {
    const modulus = Math.max(1, Math.trunc(Number(pattern.modulus) || 1));
    return positiveMod(distance, modulus) === positiveMod(Math.trunc(Number(pattern.remainder) || 0), modulus);
  }
  if (pattern.type === "axisMod") {
    const modulus = Math.max(1, Math.trunc(Number(pattern.modulus) || 1));
    const q = Math.trunc(Number(hex.q) || 0);
    const r = Math.trunc(Number(hex.r) || 0);
    const axisValue = pattern.axis === "r" ? r : (pattern.axis === "s" ? -q - r : q);
    return positiveMod(axisValue, modulus) === positiveMod(Math.trunc(Number(pattern.remainder) || 0), modulus);
  }
  if (pattern.type === "sumMod") {
    const modulus = Math.max(1, Math.trunc(Number(pattern.modulus) || 1));
    return positiveMod(Math.trunc(Number(hex.q) || 0) + Math.trunc(Number(hex.r) || 0), modulus) === positiveMod(Math.trunc(Number(pattern.remainder) || 0), modulus);
  }
  if (pattern.type === "diffMod") {
    const modulus = Math.max(1, Math.trunc(Number(pattern.modulus) || 1));
    return positiveMod(Math.trunc(Number(hex.q) || 0) - Math.trunc(Number(hex.r) || 0), modulus) === positiveMod(Math.trunc(Number(pattern.remainder) || 0), modulus);
  }
  if (pattern.type === "quadrant") {
    const q = Math.trunc(Number(hex.q) || 0);
    const r = Math.trunc(Number(hex.r) || 0);
    const qOk = Number(pattern.qSign) < 0 ? q < 0 : q > 0;
    const rOk = Number(pattern.rSign) < 0 ? r < 0 : r > 0;
    return qOk && rOk;
  }
  if (pattern.type === "diagonalEquals") {
    return Math.trunc(Number(hex.q) || 0) === Math.trunc(Number(hex.r) || 0);
  }
  return false;
}

function isChaosBlockedHex(state, hex) {
  if (!usesChaosVoteMode(state)) {
    return false;
  }
  return getChaosActiveRules(state).some((rule) => {
    const ruleDef = getChaosRuleDef(rule.id);
    return ruleDef?.effect === "block" && matchesChaosBlockPattern(state, hex, ruleDef.pattern);
  });
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
  const winLength = getWinLength(state);
  const startCell = normaliseRadialCell(start);
  if (!countsForOwnerAt(state, startCell, owner)) {
    return null;
  }

  if (startCell.q === 0) {
    for (let sector = 0; sector < RADIAL_SECTOR_COUNT; sector += 1) {
      const spokeCells = getRadialSpokeRunCells(state, startCell, owner, sector);
      if (spokeCells.length >= winLength) {
        return { kind: "spoke", cells: spokeCells };
      }
    }
    return null;
  }

  const ringCells = getRadialRingRunCells(state, startCell, owner);
  if (ringCells.length >= winLength) {
    return { kind: "ring", cells: ringCells };
  }

  const spokeCells = getRadialSpokeRunCells(state, startCell, owner);
  if (spokeCells.length >= winLength) {
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
  const winLength = getWinLength(state);
  for (const [key, cell] of Object.entries(state.cells)) {
    const pos = parseKey(key);
    const owners = getOwnersForCell(state, cell);

    for (const owner of owners) {
      for (const lineKind of triangleLineKinds) {
        if (getTriangleLineCount(state, pos, owner, lineKind) >= winLength) {
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
  const winLength = getWinLength(state);
  if (usesTriangleGridMode(state)) {
    const cell = getCellAt(state, hex);
    if (!cell) {
      return 0;
    }
    const owners = getOwnersForCell(state, cell);

    for (const owner of owners) {
      for (const lineKind of triangleLineKinds) {
        if (getTriangleLineCount(state, hex, owner, lineKind) >= winLength) {
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
      if (getLineCount(state, hex, owner, dir) >= winLength) {
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
    const echoPieceType = echo.pieceType || "militia";
    placeStone(state, target, echo.owner, "stone", usesArmoryMode(state) ? { pieceType: echoPieceType } : {});
    const capResolution = enforceStoneCapAfterPlacement(state, echo.owner, { interactiveEgyptian: false });
    pushLog(usesArmoryMode(state)
      ? `Echo deployed ${getArmoryPieceDef(echoPieceType).name} for Player ${echo.owner} at (${state.lastPlacement.q}, ${state.lastPlacement.r}).`
      : `Echo placed Player ${echo.owner} at (${state.lastPlacement.q}, ${state.lastPlacement.r}).`);
    if (capResolution.overflow > 0) {
      pushLog(`Egyptian cap exceeded for Player ${echo.owner}; no stone was removed automatically.`);
    }
  }
  state.pendingEchoes = remain;
}

function getOrbitDestination(state, fromHex) {
  const rotated = orbitStepForMode(state, fromHex);
  return (getBirdAt(state, rotated) || getBirdEchoCopyAt(state, rotated) || getPigAt(state, rotated)) ? { ...fromHex } : rotated;
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

function isOpenForEverythingBagelEffect(state, hex) {
  return isHexOpen(state, hex) && !isEverythingBagelRedTapeHex(state, hex);
}

function getPortalExitForHex(zones, hex) {
  const key = keyOf(hex.q, hex.r);
  for (const pair of zones.portalPairs) {
    if (keyOf(pair.a.q, pair.a.r) === key) {
      return pair.b;
    }
    if (keyOf(pair.b.q, pair.b.r) === key) {
      return pair.a;
    }
  }
  return null;
}

function applyEverythingBagelPlacementEffects(state, placedHex, owner) {
  if (!hasEverythingBagelMode(state)) {
    return [];
  }
  const messages = [];
  const zones = getEverythingBagelZones(state);
  let currentHex = { ...placedHex };
  const portalExit = getPortalExitForHex(zones, currentHex);

  if (portalExit && moveStonePreservingSerial(state, currentHex, portalExit)) {
    messages.push(`Everything Bagel portal fired: (${currentHex.q}, ${currentHex.r}) became (${portalExit.q}, ${portalExit.r}).`);
    currentHex = { ...portalExit };
  }

  if (zones.schmearKeys.has(keyOf(currentHex.q, currentHex.r))) {
    const slideTarget = getOpenStepAwayFromOriginForMode(state, currentHex);
    if (slideTarget && moveStonePreservingSerial(state, currentHex, slideTarget)) {
      messages.push(`Schmear slide moved Player ${owner}'s stone from (${currentHex.q}, ${currentHex.r}) to (${slideTarget.q}, ${slideTarget.r}).`);
      currentHex = { ...slideTarget };
    } else {
      messages.push("Schmear slide found no clean lane and stayed sticky.");
    }
  }

  if (zones.tollBoothKeys.has(keyOf(currentHex.q, currentHex.r))) {
    ensureClockState(state);
    if (state.clock.enabled) {
      state.clock.remaining[owner] += 7;
      messages.push(`Toll booth validated Player ${owner}'s parking: +7 seconds.`);
    } else {
      messages.push("Toll booth inspected the stone and found the timer was off duty.");
    }
  }

  if (zones.couponKeys.has(keyOf(currentHex.q, currentHex.r)) && Object.keys(state.cells).length < BAGEL_RECEIPT_STONE_LIMIT) {
    const receiptTarget = rotateAxial({ q: currentHex.q + owner, r: currentHex.r - 1 }, zones.phase + owner + 1);
    if (isOpenForEverythingBagelEffect(state, receiptTarget) && addBagelReceiptStone(state, receiptTarget, owner, { bagelCoupon: true })) {
      messages.push(`Coupon printer made a Player ${owner} receipt stone at (${receiptTarget.q}, ${receiptTarget.r}).`);
    } else {
      messages.push("Coupon printer jammed. This is legally considered gameplay.");
    }
  }

  if (zones.sesameKeys.has(keyOf(currentHex.q, currentHex.r))) {
    const sprinkled = applyBagelSesameSpread(state, currentHex, owner, zones);
    if (sprinkled.length > 0) {
      const targets = sprinkled.map((hex) => `(${hex.q}, ${hex.r})`).join(", ");
      messages.push(`Sesame spread printed ${sprinkled.length} receipt stone${sprinkled.length === 1 ? "" : "s"} at ${targets}.`);
    } else {
      messages.push("Sesame spread had nowhere tasteful to land.");
    }
  }

  if (zones.poppyStampKeys.has(keyOf(currentHex.q, currentHex.r))) {
    const stamp = applyBagelPoppyStamp(state, currentHex, owner);
    if (stamp) {
      messages.push(`Poppy stamp reassigned (${stamp.hex.q}, ${stamp.hex.r}) from Player ${stamp.oldOwner} to Player ${stamp.newOwner}.`);
    } else {
      messages.push("Poppy stamp found no adjacent rival paperwork.");
    }
  }

  return messages;
}

function getOpenStepTowardOriginForMode(state, hex) {
  const currentDistance = getDistanceForMode(state, hex);
  return getAdjacentsForMode(state, hex)
    .filter((candidate) => isOpenForEverythingBagelEffect(state, candidate))
    .sort((a, b) => getDistanceForMode(state, a) - getDistanceForMode(state, b))
    .find((candidate) => getDistanceForMode(state, candidate) < currentDistance) || null;
}

function getOpenStepAwayFromOriginForMode(state, hex) {
  const currentDistance = getDistanceForMode(state, hex);
  return getAdjacentsForMode(state, hex)
    .filter((candidate) => isOpenForEverythingBagelEffect(state, candidate))
    .sort((a, b) => getDistanceForMode(state, b) - getDistanceForMode(state, a))
    .find((candidate) => getDistanceForMode(state, candidate) > currentDistance) || null;
}

function getBagelReceiptEntriesSortedByAge(state) {
  return Object.entries(state.cells)
    .map(([key, cell]) => ({ hex: parseKey(key), cell }))
    .filter((entry) => entry.cell.kind === "stone" && entry.cell.bagelReceipt)
    .sort((a, b) => a.cell.serial - b.cell.serial);
}

function getEverythingBagelReceiptStats(state) {
  let pending = 0;
  let certified = 0;
  let stamped = 0;
  for (const cell of Object.values(state?.cells || {})) {
    if (!cell || cell.kind !== "stone") {
      continue;
    }
    if (cell.bagelReceipt) {
      pending += 1;
    }
    if (cell.bagelCertified) {
      certified += 1;
    }
    if (cell.bagelStamped) {
      stamped += 1;
    }
  }
  return { pending, certified, stamped };
}

function addBagelReceiptStone(state, hex, owner, extras = {}) {
  return addEffectStone(state, hex, owner, "stone", {
    bagelReceipt: true,
    ...extras
  });
}

function getBagelSesameCandidates(state, origin, phase) {
  return getAdjacentsForMode(state, origin)
    .filter((candidate) => isOpenForEverythingBagelEffect(state, candidate))
    .sort((a, b) => (
      positiveMod(a.q * 17 + a.r * 29 + phase * 7, 97)
        - positiveMod(b.q * 17 + b.r * 29 + phase * 7, 97)
      || getDistanceForMode(state, b) - getDistanceForMode(state, a)
    ));
}

function applyBagelSesameSpread(state, origin, owner, zones) {
  if (Object.keys(state.cells).length >= BAGEL_RECEIPT_STONE_LIMIT) {
    return [];
  }
  const created = [];
  for (const target of getBagelSesameCandidates(state, origin, zones.phase)) {
    if (created.length >= BAGEL_SESAME_SPREAD_LIMIT || Object.keys(state.cells).length >= BAGEL_RECEIPT_STONE_LIMIT) {
      break;
    }
    if (addBagelReceiptStone(state, target, owner, { bagelSeed: true })) {
      created.push(target);
    }
  }
  return created;
}

function applyBagelPoppyStamp(state, origin, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  const target = getAdjacentsForMode(state, origin)
    .map((hex) => ({ hex, cell: getCellAt(state, hex) }))
    .filter((entry) => (
      entry.cell
        && entry.cell.kind === "stone"
        && entry.cell.owner !== safeOwner
        && !entry.cell.bedSiegeBed
        && !entry.cell.factoryType
    ))
    .sort((a, b) => (
      a.cell.serial - b.cell.serial
      || getDistanceForMode(state, a.hex) - getDistanceForMode(state, b.hex)
    ))[0];
  if (!target) {
    return null;
  }
  const oldOwner = target.cell.owner;
  target.cell.owner = safeOwner;
  target.cell.bagelStamped = true;
  return {
    hex: target.hex,
    oldOwner,
    newOwner: safeOwner
  };
}

function resolveBagelAuditorCopy(state, owner, messages) {
  if (Object.keys(state.cells).length >= BAGEL_RECEIPT_STONE_LIMIT) {
    return;
  }
  const entries = getOwnerStoneEntriesSortedByAge(state, owner);
  const newest = entries[entries.length - 1];
  if (!newest) {
    return;
  }
  const target = getMirrorCellForMode(state, rotateAxial(newest.hex, state.turnCount + owner));
  if (isOpenForEverythingBagelEffect(state, target) && addBagelReceiptStone(state, target, owner, { bagelAuditorCopy: true })) {
    messages.push(`Auditor copied Player ${owner}'s newest stone to (${target.q}, ${target.r}).`);
  }
}

function resolveBagelGravityComplaint(state, messages) {
  if (state.turnCount % 3 !== 0) {
    return;
  }
  for (const owner of getPlayerNumbers(state)) {
    const oldest = getOwnerStoneEntriesSortedByAge(state, owner)[0];
    if (!oldest) {
      continue;
    }
    const target = getOpenStepTowardOriginForMode(state, oldest.hex);
    if (target && moveStonePreservingSerial(state, oldest.hex, target)) {
      messages.push(`Gravity shuffled Player ${owner}'s oldest stone to (${target.q}, ${target.r}).`);
    }
  }
}

function resolveBagelOwnerSwap(state, messages) {
  if (state.turnCount % 4 !== 0) {
    return;
  }
  const entries = Object.entries(state.cells)
    .map(([key, cell]) => ({ hex: parseKey(key), cell }))
    .filter((entry) => entry.cell.kind === "stone")
    .sort((a, b) => (
      getDistanceForMode(state, a.hex) - getDistanceForMode(state, b.hex)
      || a.cell.serial - b.cell.serial
    ));

  for (const entry of entries) {
    const mirror = getMirrorCellForMode(state, entry.hex);
    const mirrorCell = getCellAt(state, mirror);
    if (!mirrorCell || mirrorCell.kind !== "stone" || entry.cell.owner === mirrorCell.owner) {
      continue;
    }
    const originalOwner = entry.cell.owner;
    entry.cell.owner = mirrorCell.owner;
    mirrorCell.owner = originalOwner;
    messages.push(`Tax paperwork swapped ownership between (${entry.hex.q}, ${entry.hex.r}) and (${mirror.q}, ${mirror.r}).`);
    return;
  }
}

function resolveBagelRedTapeEvictions(state, messages) {
  const zones = getEverythingBagelZones(state);
  for (const hex of zones.redTape) {
    const cell = getCellAt(state, hex);
    if (!cell || cell.kind !== "stone") {
      continue;
    }
    const escape = getAdjacentsForMode(state, hex)
      .filter((candidate) => isOpenForEverythingBagelEffect(state, candidate))
      .sort((a, b) => getDistanceForMode(state, a) - getDistanceForMode(state, b))[0];
    if (escape && moveStonePreservingSerial(state, hex, escape)) {
      messages.push(`Red tape evicted a stone from (${hex.q}, ${hex.r}) to (${escape.q}, ${escape.r}).`);
    }
  }
}

function resolveBagelDeliQueue(state, messages) {
  const zones = getEverythingBagelZones(state);
  if (zones.deliQueue.length < 2) {
    return;
  }
  const moved = [];
  for (let index = zones.deliQueue.length - 2; index >= 0; index -= 1) {
    const fromHex = zones.deliQueue[index];
    const toHex = zones.deliQueue[index + 1];
    const cell = getCellAt(state, fromHex);
    if (!cell || cell.kind !== "stone") {
      continue;
    }
    if (moveStonePreservingSerial(state, fromHex, toHex)) {
      moved.push({ fromHex, toHex, owner: cell.owner });
    }
  }
  if (moved.length > 0) {
    messages.push(`Deli queue advanced ${moved.length} stone${moved.length === 1 ? "" : "s"}.`);
  }
}

function isBagelReceiptAnchored(state, entry) {
  return getAdjacentsForMode(state, entry.hex).some((candidate) => {
    const cell = getCellAt(state, candidate);
    return Boolean(
      cell
        && cell.kind === "stone"
        && cell.owner === entry.cell.owner
        && !cell.bagelReceipt
    );
  });
}

function resolveBagelReceiptAudit(state, messages) {
  if (state.turnCount % BAGEL_RECEIPT_AUDIT_INTERVAL !== 0) {
    return;
  }
  const oldestReceipt = getBagelReceiptEntriesSortedByAge(state)[0];
  if (!oldestReceipt) {
    return;
  }
  if (isBagelReceiptAnchored(state, oldestReceipt)) {
    delete oldestReceipt.cell.bagelReceipt;
    delete oldestReceipt.cell.bagelSeed;
    delete oldestReceipt.cell.bagelAuditorCopy;
    oldestReceipt.cell.bagelCertified = true;
    messages.push(`Receipt audit certified Player ${oldestReceipt.cell.owner}'s stone at (${oldestReceipt.hex.q}, ${oldestReceipt.hex.r}).`);
    return;
  }
  const owner = oldestReceipt.cell.owner;
  removeStone(state, oldestReceipt.hex);
  messages.push(`Receipt audit voided Player ${owner}'s loose receipt at (${oldestReceipt.hex.q}, ${oldestReceipt.hex.r}).`);
}

function getEverythingBagelNextDocketText(state) {
  const nextTurnCount = Math.max(1, Math.trunc(Number(state?.turnCount) || 0) + 1);
  const filings = ["auditor", "queue", "red tape"];
  if (nextTurnCount % 3 === 0) {
    filings.push("gravity");
  }
  if (nextTurnCount % 4 === 0) {
    filings.push("tax swap");
  }
  if (nextTurnCount % BAGEL_RECEIPT_AUDIT_INTERVAL === 0) {
    filings.push("receipt audit");
  }
  return filings.join(" | ");
}

function resolveEverythingBagel(state, previousPlayer) {
  if (!hasEverythingBagelMode(state)) {
    return;
  }
  const messages = [];
  resolveBagelAuditorCopy(state, previousPlayer, messages);
  resolveBagelGravityComplaint(state, messages);
  resolveBagelOwnerSwap(state, messages);
  resolveBagelDeliQueue(state, messages);
  resolveBagelReceiptAudit(state, messages);
  resolveBagelRedTapeEvictions(state, messages);
  rebuildPanicZones(state);
  pushLog(messages.length > 0
    ? `Everything Bagel: ${messages.join(" ")}`
    : "Everything Bagel committee met, argued about fonts, and changed nothing.");
}

function usesArmoryMode(state) {
  return Boolean(state && hasMode(state, "armory"));
}

function getArmoryClassSelectForPlayer(player) {
  return ui[`armoryClassP${player}Select`] || null;
}

function getArmoryClassWrapForPlayer(player) {
  return ui[`armoryClassP${player}Wrap`] || null;
}

function normaliseArmoryClassKey(value) {
  const key = String(value || "").trim();
  return ARMORY_CLASS_DEFS[key] ? key : ARMORY_DEFAULT_CLASS;
}

function getArmoryClassSelectionsFromInputs(playerCount = getPlayerCountFromModeKeys(getSelectedModeKeys())) {
  const selections = {};
  for (const player of getPlayerNumbers(playerCount)) {
    const select = getArmoryClassSelectForPlayer(player);
    const selected = normaliseArmoryClassKey(select?.value);
    selections[player] = selected;
    if (select) {
      select.value = selected;
    }
  }
  return selections;
}

function createArmoryRng(seed) {
  let t = (Math.trunc(Number(seed) || 0) >>> 0);
  return () => {
    t += 0x6D2B79F5;
    let v = Math.imul(t ^ (t >>> 15), 1 | t);
    v ^= v + Math.imul(v ^ (v >>> 7), 61 | v);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

function getArmoryPieceType(cell) {
  const pieceType = String(cell?.pieceType || "militia");
  return ARMORY_PIECE_DEFS[pieceType] ? pieceType : "militia";
}

function getArmoryPieceDef(pieceType) {
  const safeType = ARMORY_PIECE_DEFS[pieceType] ? pieceType : "militia";
  return ARMORY_PIECE_DEFS[safeType];
}

function createArmoryInventory() {
  const inventory = {};
  for (const pieceType of ARMORY_PIECE_ORDER) {
    inventory[pieceType] = pieceType === "militia" ? 9999 : 0;
  }
  return inventory;
}

function getArmoryShopSeed(state, armory, owner) {
  const wallet = armory?.currencies?.[owner] || { gold: 0, arcana: 0 };
  return (
    ((state.turnCount + 1) * 131)
    + ((state.round + 1) * 47)
    + ((state.moveSerial + 11) * 13)
    + ((armory?.rerolls?.[owner] || 0) * 97)
    + ((wallet.gold || 0) * 7)
    + ((wallet.arcana || 0) * 11)
    + (owner * 53)
  );
}

function getArmoryOfferWeights(state, armory, owner) {
  const classKey = normaliseArmoryClassKey(armory?.classes?.[owner]);
  const weights = Object.fromEntries(ARMORY_SHOP_POOL.map((pieceType) => [pieceType, 1]));
  const classDef = ARMORY_CLASS_DEFS[classKey];
  weights[classDef.preferredPiece] = (weights[classDef.preferredPiece] || 1) + 2.5;

  if (classKey === "arcanist") {
    weights.oracle += 1;
    weights.sage += 0.8;
  } else if (classKey === "vanguard") {
    weights.bastion += 1.2;
    weights.lancer += 0.6;
  } else if (classKey === "saboteur") {
    weights.assassin += 1.6;
    weights.lancer += 0.8;
  }

  for (const cell of Object.values(state.cells)) {
    if (!cell || cell.kind !== "stone" || cell.owner !== owner) {
      continue;
    }
    const pieceType = getArmoryPieceType(cell);
    if (weights[pieceType] != null) {
      weights[pieceType] += 0.14;
    }
  }

  const wallet = armory?.currencies?.[owner] || { gold: 0, arcana: 0 };
  if ((wallet.arcana || 0) >= 4) {
    weights.oracle += 0.8;
    weights.alchemist += 0.6;
  }
  if ((wallet.gold || 0) >= 8) {
    weights.bastion += 0.5;
    weights.assassin += 0.35;
  }
  return weights;
}

function drawArmoryWeightedOffer(weights, available, rng) {
  if (!available.length) {
    return null;
  }
  let total = 0;
  for (const pieceType of available) {
    total += Math.max(0.05, Number(weights[pieceType]) || 0);
  }
  let pick = rng() * total;
  for (const pieceType of available) {
    pick -= Math.max(0.05, Number(weights[pieceType]) || 0);
    if (pick <= 0) {
      return pieceType;
    }
  }
  return available[available.length - 1];
}

function generateArmoryShopOffers(state, armory, owner) {
  const available = ARMORY_SHOP_POOL.slice();
  const weights = getArmoryOfferWeights(state, armory, owner);
  const rng = createArmoryRng(getArmoryShopSeed(state, armory, owner));
  const offers = [];
  const slots = Math.max(1, ARMORY_SHOP_SLOTS);
  while (offers.length < slots && available.length > 0) {
    const next = drawArmoryWeightedOffer(weights, available, rng);
    if (!next) {
      break;
    }
    offers.push(next);
    const index = available.indexOf(next);
    if (index >= 0) {
      available.splice(index, 1);
    }
  }

  while (offers.length < slots && ARMORY_SHOP_POOL.length > 0) {
    const fallback = ARMORY_SHOP_POOL[Math.floor(rng() * ARMORY_SHOP_POOL.length)];
    if (!offers.includes(fallback)) {
      offers.push(fallback);
    } else {
      const missing = ARMORY_SHOP_POOL.find((pieceType) => !offers.includes(pieceType));
      if (missing) {
        offers.push(missing);
      } else {
        break;
      }
    }
  }
  return offers;
}

function createArmoryStateForGame(state, classes = null) {
  const players = getPlayerNumbers(state);
  const selectedClasses = classes || getArmoryClassSelectionsFromInputs(getPlayerCount(state));
  const armory = {
    classes: {},
    currencies: {},
    inventory: {},
    selectedPiece: {},
    rerolls: {},
    shopOffers: {},
    removedEnemyByOwner: {},
    lastReport: null
  };

  const starterPiece = {
    vanguard: "bastion",
    arcanist: "sage",
    saboteur: "assassin"
  };

  for (const owner of players) {
    const classKey = normaliseArmoryClassKey(selectedClasses[owner]);
    const classDef = ARMORY_CLASS_DEFS[classKey];
    armory.classes[owner] = classKey;
    armory.currencies[owner] = {
      gold: classDef.startGold,
      arcana: classDef.startArcana
    };
    armory.inventory[owner] = createArmoryInventory();
    armory.selectedPiece[owner] = "militia";
    armory.rerolls[owner] = 0;
    armory.shopOffers[owner] = [];
    armory.removedEnemyByOwner[owner] = 0;
    const starter = starterPiece[classKey];
    if (starter && armory.inventory[owner][starter] != null) {
      armory.inventory[owner][starter] += 1;
    }
  }

  for (const owner of players) {
    armory.shopOffers[owner] = generateArmoryShopOffers(state, armory, owner);
  }
  return armory;
}

function ensureArmoryState(state) {
  if (!usesArmoryMode(state)) {
    if (state) {
      state.armory = null;
    }
    return null;
  }

  if (!state.armory || typeof state.armory !== "object") {
    state.armory = createArmoryStateForGame(state);
  }

  const armory = state.armory;
  const players = getPlayerNumbers(state);
  if (!armory.classes || typeof armory.classes !== "object") armory.classes = {};
  if (!armory.currencies || typeof armory.currencies !== "object") armory.currencies = {};
  if (!armory.inventory || typeof armory.inventory !== "object") armory.inventory = {};
  if (!armory.selectedPiece || typeof armory.selectedPiece !== "object") armory.selectedPiece = {};
  if (!armory.rerolls || typeof armory.rerolls !== "object") armory.rerolls = {};
  if (!armory.shopOffers || typeof armory.shopOffers !== "object") armory.shopOffers = {};
  if (!armory.removedEnemyByOwner || typeof armory.removedEnemyByOwner !== "object") armory.removedEnemyByOwner = {};

  for (const owner of players) {
    armory.classes[owner] = normaliseArmoryClassKey(armory.classes[owner]);
    const classDef = ARMORY_CLASS_DEFS[armory.classes[owner]];

    if (!armory.currencies[owner]) {
      armory.currencies[owner] = { gold: classDef.startGold, arcana: classDef.startArcana };
    }
    armory.currencies[owner].gold = Math.max(0, Math.round(Number(armory.currencies[owner].gold) || 0));
    armory.currencies[owner].arcana = Math.max(0, Math.round(Number(armory.currencies[owner].arcana) || 0));

    if (!armory.inventory[owner] || typeof armory.inventory[owner] !== "object") {
      armory.inventory[owner] = createArmoryInventory();
    }
    for (const pieceType of ARMORY_PIECE_ORDER) {
      if (!Number.isFinite(Number(armory.inventory[owner][pieceType]))) {
        armory.inventory[owner][pieceType] = pieceType === "militia" ? 9999 : 0;
      }
      armory.inventory[owner][pieceType] = pieceType === "militia"
        ? 9999
        : Math.max(0, Math.round(Number(armory.inventory[owner][pieceType]) || 0));
    }

    const selected = String(armory.selectedPiece[owner] || "militia");
    const safeSelected = ARMORY_PIECE_DEFS[selected] ? selected : "militia";
    armory.selectedPiece[owner] = (
      safeSelected !== "militia"
      && armory.inventory[owner][safeSelected] <= 0
    ) ? "militia" : safeSelected;

    armory.rerolls[owner] = Math.max(0, Math.round(Number(armory.rerolls[owner]) || 0));
    armory.removedEnemyByOwner[owner] = Math.max(0, Math.round(Number(armory.removedEnemyByOwner[owner]) || 0));

    if (!Array.isArray(armory.shopOffers[owner]) || armory.shopOffers[owner].length === 0) {
      armory.shopOffers[owner] = generateArmoryShopOffers(state, armory, owner);
    } else {
      armory.shopOffers[owner] = armory.shopOffers[owner]
        .map((pieceType) => String(pieceType))
        .filter((pieceType) => ARMORY_SHOP_POOL.includes(pieceType))
        .slice(0, ARMORY_SHOP_SLOTS);
      while (armory.shopOffers[owner].length < ARMORY_SHOP_SLOTS) {
        const missing = ARMORY_SHOP_POOL.find((pieceType) => !armory.shopOffers[owner].includes(pieceType));
        if (!missing) {
          break;
        }
        armory.shopOffers[owner].push(missing);
      }
    }
  }

  if (!Object.prototype.hasOwnProperty.call(armory, "lastReport")) {
    armory.lastReport = null;
  }
  return armory;
}

function getArmoryPieceCost(state, owner, pieceType) {
  const safePiece = ARMORY_PIECE_DEFS[pieceType] ? pieceType : "militia";
  const pieceDef = ARMORY_PIECE_DEFS[safePiece];
  let gold = pieceDef.goldCost;
  let arcana = pieceDef.arcanaCost;

  if (!usesArmoryMode(state)) {
    return { gold, arcana };
  }

  const armory = ensureArmoryState(state);
  const classKey = normaliseArmoryClassKey(armory?.classes?.[owner]);
  if (classKey === "vanguard" && safePiece === "bastion") {
    gold -= 1;
  } else if (classKey === "arcanist" && (safePiece === "sage" || safePiece === "oracle")) {
    arcana -= 1;
  } else if (classKey === "saboteur" && safePiece === "assassin") {
    gold -= 1;
  }

  if ((armory?.rerolls?.[owner] || 0) >= 4 && (safePiece === "oracle" || safePiece === "alchemist")) {
    gold += 1;
  }

  return {
    gold: Math.max(0, gold),
    arcana: Math.max(0, arcana)
  };
}

function canAffordArmoryPiece(state, owner, pieceType) {
  if (!usesArmoryMode(state)) {
    return false;
  }
  const armory = ensureArmoryState(state);
  const wallet = armory.currencies[owner] || { gold: 0, arcana: 0 };
  const cost = getArmoryPieceCost(state, owner, pieceType);
  return wallet.gold >= cost.gold && wallet.arcana >= cost.arcana;
}

function spendArmoryCurrency(state, owner, cost) {
  const armory = ensureArmoryState(state);
  const wallet = armory.currencies[owner];
  wallet.gold = Math.max(0, wallet.gold - Math.max(0, Math.round(Number(cost?.gold) || 0)));
  wallet.arcana = Math.max(0, wallet.arcana - Math.max(0, Math.round(Number(cost?.arcana) || 0)));
}

function gainArmoryCurrency(state, owner, gain) {
  const armory = ensureArmoryState(state);
  const wallet = armory.currencies[owner];
  wallet.gold += Math.max(0, Math.round(Number(gain?.gold) || 0));
  wallet.arcana += Math.max(0, Math.round(Number(gain?.arcana) || 0));
}

function refreshArmoryShopForOwner(state, owner) {
  if (!usesArmoryMode(state)) {
    return;
  }
  const armory = ensureArmoryState(state);
  armory.shopOffers[owner] = generateArmoryShopOffers(state, armory, owner);
}

function getAdjacentEnemyStoneEntries(state, hex, owner) {
  return getAdjacentsForMode(state, hex)
    .map((target) => ({ target, cell: getCellAt(state, target) }))
    .filter((entry) => entry.cell && entry.cell.kind === "stone" && entry.cell.owner !== owner)
    .sort((a, b) => (
      (a.cell.serial - b.cell.serial)
      || (a.target.q - b.target.q)
      || (a.target.r - b.target.r)
    ));
}

function recordArmoryEnemyLoss(state, owner, count = 1) {
  if (!usesArmoryMode(state)) {
    return;
  }
  const armory = ensureArmoryState(state);
  armory.removedEnemyByOwner[owner] = (armory.removedEnemyByOwner[owner] || 0)
    + Math.max(0, Math.round(Number(count) || 0));
}

function resolveArmorySelectedPieceForPlacement(state, owner) {
  if (!usesArmoryMode(state)) {
    return "militia";
  }
  const armory = ensureArmoryState(state);
  const selected = ARMORY_PIECE_DEFS[armory.selectedPiece[owner]] ? armory.selectedPiece[owner] : "militia";
  if (selected === "militia") {
    return "militia";
  }
  if ((armory.inventory[owner][selected] || 0) <= 0) {
    armory.selectedPiece[owner] = "militia";
    return "militia";
  }
  armory.inventory[owner][selected] -= 1;
  if (armory.inventory[owner][selected] <= 0) {
    armory.selectedPiece[owner] = "militia";
  }
  return selected;
}

function getArmoryUpgradePieceType(state, owner, sourceHex, turnTag = 0) {
  const options = ARMORY_SHOP_POOL.slice();
  const armory = ensureArmoryState(state);
  const classKey = normaliseArmoryClassKey(armory.classes[owner]);
  if (classKey === "vanguard") {
    options.push("bastion");
  } else if (classKey === "arcanist") {
    options.push("sage", "oracle");
  } else if (classKey === "saboteur") {
    options.push("assassin");
  }
  const seed = (
    ((sourceHex.q + 37) * 97)
    + ((sourceHex.r + 29) * 53)
    + ((state.turnCount + 1) * 41)
    + ((state.moveSerial + 1) * 17)
    + (owner * 101)
    + turnTag
  );
  const rng = createArmoryRng(seed);
  return options[Math.floor(rng() * options.length)];
}

function applyArmoryPlacementAbility(state, hex, owner, pieceType) {
  if (!usesArmoryMode(state)) {
    return null;
  }

  const armory = ensureArmoryState(state);
  const results = [];
  if (pieceType === "militia" || !ARMORY_PIECE_DEFS[pieceType]) {
    return null;
  }

  if (pieceType === "lancer") {
    const targets = getAdjacentEnemyStoneEntries(state, hex, owner);
    if (targets.length > 0) {
      const target = targets[0].target;
      removeStone(state, target);
      recordArmoryEnemyLoss(state, owner, 1);
      results.push(`Lancer pierced (${target.q}, ${target.r}).`);
    }
  } else if (pieceType === "assassin") {
    const targets = getAdjacentEnemyStoneEntries(state, hex, owner);
    if (targets.length > 0) {
      const target = targets[targets.length - 1].target;
      const targetCell = getCellAt(state, target);
      if (targetCell && targetCell.kind === "stone") {
        targetCell.owner = owner;
        recordArmoryEnemyLoss(state, owner, 1);
        results.push(`Assassin captured (${target.q}, ${target.r}).`);
      }
    }
  } else if (pieceType === "oracle") {
    const bonusArcana = normaliseArmoryClassKey(armory.classes[owner]) === "arcanist" ? 2 : 1;
    gainArmoryCurrency(state, owner, { arcana: bonusArcana });
    results.push(`Oracle generated +${bonusArcana} arcana.`);
  } else if (pieceType === "alchemist") {
    const friends = getAdjacentsForMode(state, hex)
      .map((target) => ({ target, cell: getCellAt(state, target) }))
      .filter((entry) => entry.cell && entry.cell.kind === "stone" && entry.cell.owner === owner && getArmoryPieceType(entry.cell) === "militia")
      .sort((a, b) => (
        (a.cell.serial - b.cell.serial)
        || (a.target.q - b.target.q)
        || (a.target.r - b.target.r)
      ));
    if (friends.length > 0) {
      const target = friends[0];
      target.cell.pieceType = getArmoryUpgradePieceType(state, owner, target.target, 7);
      results.push(`Alchemist upgraded (${target.target.q}, ${target.target.r}) to ${getArmoryPieceDef(target.cell.pieceType).name}.`);
    } else {
      gainArmoryCurrency(state, owner, { arcana: 1 });
      results.push("Alchemist distilled +1 arcana.");
    }
  } else if (pieceType === "bastion") {
    gainArmoryCurrency(state, owner, { gold: 1 });
    results.push("Bastion secured +1 gold.");
  } else if (pieceType === "sage") {
    gainArmoryCurrency(state, owner, { arcana: 1 });
    results.push("Sage focused +1 arcana.");
  }

  return results.length > 0 ? results.join(" ") : null;
}

function spawnArmoryStoneWithoutTracking(state, hex, owner, pieceType = "militia") {
  const safePieceType = ARMORY_PIECE_DEFS[pieceType] ? pieceType : "militia";
  addEffectStone(state, hex, owner, "stone", { pieceType: safePieceType });
}

function buildArmoryShieldCharges(state) {
  const charges = new Map();
  if (!usesArmoryMode(state)) {
    return charges;
  }
  const armory = ensureArmoryState(state);
  for (const [key, cell] of Object.entries(state.cells)) {
    if (!cell || cell.kind !== "stone" || getArmoryPieceType(cell) !== "bastion") {
      continue;
    }
    const fromHex = parseKey(key);
    const owner = normalisePlayerNumber(cell.owner, state);
    const classKey = normaliseArmoryClassKey(armory.classes[owner]);
    const shieldStrength = classKey === "vanguard" ? 2 : 1;
    const targets = [fromHex, ...getAdjacentsForMode(state, fromHex)];
    for (const target of targets) {
      const targetCell = getCellAt(state, target);
      if (!targetCell || targetCell.kind !== "stone" || targetCell.owner !== owner) {
        continue;
      }
      const targetKey = keyOf(target.q, target.r);
      charges.set(targetKey, (charges.get(targetKey) || 0) + shieldStrength);
    }
  }
  return charges;
}

function tryConsumeArmoryShield(charges, hex) {
  const key = keyOf(hex.q, hex.r);
  const amount = charges.get(key) || 0;
  if (amount <= 0) {
    return false;
  }
  charges.set(key, amount - 1);
  return true;
}

function countArmoryPiecesForOwner(state, owner, pieceType) {
  let count = 0;
  for (const cell of Object.values(state.cells)) {
    if (!cell || cell.kind !== "stone" || cell.owner !== owner) {
      continue;
    }
    if (getArmoryPieceType(cell) === pieceType) {
      count += 1;
    }
  }
  return count;
}

function getArmorySpawnTypeFromSage(state, owner, sourceHex, turnTag = 0) {
  const armory = ensureArmoryState(state);
  const classKey = normaliseArmoryClassKey(armory.classes[owner]);
  if (classKey !== "arcanist") {
    return "militia";
  }
  const seed = Math.abs(
    (sourceHex.q * 43)
    + (sourceHex.r * 71)
    + ((state.turnCount + 1) * 29)
    + ((state.moveSerial + 1) * 17)
    + (owner * 101)
    + turnTag
  );
  return (seed % 4 === 0) ? "lancer" : "militia";
}

function resolveArmoryTurnEnd(state) {
  if (!usesArmoryMode(state)) {
    return null;
  }

  const armory = ensureArmoryState(state);
  const players = getPlayerNumbers(state);
  for (const owner of players) {
    armory.removedEnemyByOwner[owner] = 0;
  }
  const shieldCharges = buildArmoryShieldCharges(state);
  const summary = {
    removed: 0,
    blockedByShield: 0,
    flips: 0,
    spawns: 0,
    upgrades: 0,
    income: createPlayerMap(getPlayerCount(state), () => ({ gold: 0, arcana: 0 })),
    capOverflow: 0
  };

  const entries = Object.entries(state.cells)
    .map(([key, cell]) => ({ key, cell, hex: parseKey(key) }))
    .filter((entry) => entry.cell && entry.cell.kind === "stone")
    .sort((a, b) => (
      (a.cell.serial - b.cell.serial)
      || (a.hex.q - b.hex.q)
      || (a.hex.r - b.hex.r)
    ));

  for (const entry of entries) {
    const cell = getCellAt(state, entry.hex);
    if (!cell || cell.kind !== "stone") {
      continue;
    }
    const owner = normalisePlayerNumber(cell.owner, state);
    const classKey = normaliseArmoryClassKey(armory.classes[owner]);
    const pieceType = getArmoryPieceType(cell);

    if (pieceType === "sage") {
      if (summary.spawns >= ARMORY_MAX_END_TURN_SPAWNS) {
        continue;
      }
      const targets = getAdjacentsForMode(state, entry.hex)
        .filter((target) => isHexOpen(state, target))
        .sort((a, b) => (
          getDistanceForMode(state, a) - getDistanceForMode(state, b)
          || a.q - b.q
          || a.r - b.r
        ));
      if (targets.length > 0) {
        const spawnHex = targets[0];
        const spawnType = getArmorySpawnTypeFromSage(state, owner, entry.hex, summary.spawns);
        spawnArmoryStoneWithoutTracking(state, spawnHex, owner, spawnType);
        summary.spawns += 1;
      }
      continue;
    }

    if (pieceType === "bastion") {
      const friendlyAdjacent = getAdjacentsForMode(state, entry.hex)
        .map((target) => getCellAt(state, target))
        .filter((targetCell) => targetCell && targetCell.kind === "stone" && targetCell.owner === owner)
        .length;
      if (friendlyAdjacent >= 2) {
        const bonusGold = classKey === "vanguard" ? 2 : 1;
        gainArmoryCurrency(state, owner, { gold: bonusGold });
        summary.income[owner].gold += bonusGold;
      }
      continue;
    }

    if (pieceType === "oracle") {
      const bonusArcana = classKey === "arcanist" ? 2 : 1;
      gainArmoryCurrency(state, owner, { arcana: bonusArcana });
      summary.income[owner].arcana += bonusArcana;
      continue;
    }

    if (pieceType === "lancer") {
      if (armory.currencies[owner].arcana <= 0) {
        continue;
      }
      const targets = getAdjacentEnemyStoneEntries(state, entry.hex, owner);
      if (targets.length === 0) {
        continue;
      }
      const target = targets[0].target;
      if (tryConsumeArmoryShield(shieldCharges, target)) {
        summary.blockedByShield += 1;
        continue;
      }
      spendArmoryCurrency(state, owner, { arcana: 1 });
      removeStone(state, target);
      summary.removed += 1;
      recordArmoryEnemyLoss(state, owner, 1);
      continue;
    }

    if (pieceType === "assassin") {
      const targets = getAdjacentEnemyStoneEntries(state, entry.hex, owner);
      if (targets.length === 0) {
        continue;
      }
      const target = targets[targets.length - 1].target;
      if (tryConsumeArmoryShield(shieldCharges, target)) {
        summary.blockedByShield += 1;
        continue;
      }
      const targetCell = getCellAt(state, target);
      const enemyOwner = targetCell ? normalisePlayerNumber(targetCell.owner, state) : 0;
      if (targetCell && targetCell.kind === "stone" && enemyOwner !== owner) {
        targetCell.owner = owner;
        summary.flips += 1;
        recordArmoryEnemyLoss(state, owner, 1);
        if (enemyOwner && armory.currencies[enemyOwner]?.gold > 0) {
          armory.currencies[enemyOwner].gold -= 1;
          armory.currencies[owner].gold += 1;
          summary.income[owner].gold += 1;
        }
      }
      continue;
    }

    if (pieceType === "alchemist") {
      if (armory.currencies[owner].arcana < 2) {
        continue;
      }
      const friendMilitia = getAdjacentsForMode(state, entry.hex)
        .map((target) => ({ target, cell: getCellAt(state, target) }))
        .filter((entryCell) => entryCell.cell && entryCell.cell.kind === "stone" && entryCell.cell.owner === owner && getArmoryPieceType(entryCell.cell) === "militia")
        .sort((a, b) => (
          (a.cell.serial - b.cell.serial)
          || (a.target.q - b.target.q)
          || (a.target.r - b.target.r)
        ));
      if (friendMilitia.length > 0) {
        const target = friendMilitia[0];
        spendArmoryCurrency(state, owner, { arcana: 2 });
        target.cell.pieceType = getArmoryUpgradePieceType(state, owner, target.target, summary.upgrades + 5);
        summary.upgrades += 1;
      }
    }
  }

  for (const owner of players) {
    const classKey = normaliseArmoryClassKey(armory.classes[owner]);
    const classDef = ARMORY_CLASS_DEFS[classKey];
    const baseIncome = {
      gold: classDef.incomeGold,
      arcana: classDef.incomeArcana
    };
    if (classKey === "saboteur") {
      baseIncome.gold += armory.removedEnemyByOwner[owner];
    } else if (classKey === "vanguard") {
      baseIncome.gold += Math.floor(countArmoryPiecesForOwner(state, owner, "bastion") / 2);
    } else if (classKey === "arcanist") {
      baseIncome.arcana += Math.floor(countArmoryPiecesForOwner(state, owner, "oracle") / 2);
    }
    gainArmoryCurrency(state, owner, baseIncome);
    summary.income[owner].gold += baseIncome.gold;
    summary.income[owner].arcana += baseIncome.arcana;

    refreshArmoryShopForOwner(state, owner);
    if (armory.selectedPiece[owner] !== "militia" && armory.inventory[owner][armory.selectedPiece[owner]] <= 0) {
      armory.selectedPiece[owner] = "militia";
    }
  }

  for (const owner of players) {
    const capResolution = enforceStoneCapAfterPlacement(state, owner, { interactiveEgyptian: false });
    summary.capOverflow += capResolution.overflow || 0;
  }

  armory.lastReport = summary;
  const line = `Armoury cycle: removed ${summary.removed}, blocked ${summary.blockedByShield}, flipped ${summary.flips}, spawned ${summary.spawns}, upgraded ${summary.upgrades}, overflow ${summary.capOverflow}.`;
  state.accountingEvents.push(line);
  pushLog(line);
  return summary;
}

function checkForWinner(state) {
  const winner = usesFactoryMode(state)
    ? getFactoryWinner(state)
    : (usesBedSiegeMode(state)
      ? getBedSiegeWinner(state)
      : (usesPowderMode(state)
        ? getPowderWinner(state)
        : (usesPigMode(state) ? getPigTrapWinner(state) : auditWholeBoardForWinner(state))));
  if (winner && !state.winner) {
    state.winner = winner;
    pushLog(usesFactoryMode(state)
      ? `Player ${winner} wins Foundry War.`
      : (usesBedSiegeMode(state)
        ? `Player ${winner} wins Bed Siege.`
        : (usesPowderMode(state)
          ? `Player ${winner} wins Powder Cascade.`
          : (usesPigMode(state)
            ? `Player ${winner} trapped the pig and wins.`
            : `Player ${winner} wins.`))));
  }
  return winner;
}

function finishTurnRotation(state, previousPlayer) {
  const nextPlayer = getNextTurnPlayerNumber(state, previousPlayer);
  switchClockTurn(state.clock, nextPlayer);
  state.turnPlayer = nextPlayer;
  state.movesLeftInTurn = getPlacementsPerTurn(state);
  state.duckPhase = false;
  state.birdMovesPending = [];
  state.currentBirdMoveKind = null;
  state.egyptianRemoval = null;
  state.egyptianRemovalsThisTurn = createPlayerMap(getPlayerCount(state), () => 0);
  state.lastPlacedThisTurn = [];
  const pig = ensurePigState(state);
  if (pig) {
    pig.reactionsThisTurn = 0;
    pig.movedThisTurn = false;
  }
  syncClockTickerFromState();
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
  resolveEverythingBagel(state, previousPlayer);
  resolvePowderCascade(state, previousPlayer);
  resolveArmoryTurnEnd(state);
  resolveBedSiegeTurnEnd(state, previousPlayer);
  resolveFactoryTurnEnd(state, previousPlayer);
  resolveChaosTurnEnd(state, previousPlayer);
  resolveRiftBloom(state);

  if (checkForWinner(state)) {
    syncClockTickerFromState();
    return;
  }

  if (openChaosRuleVoteIfNeeded(state, previousPlayer)) {
    return;
  }

  finishTurnRotation(state, previousPlayer);
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
  const wasPigTrappedBefore = isPigTrapped(state);

  if (usesPowderMode(state)) {
    const result = spawnPowderCell(state, hex, owner);
    if (!result) {
      return null;
    }
    const trimText = result.trimmed > 0 ? ` Recycled ${result.trimmed} old grain${result.trimmed === 1 ? "" : "s"} to keep the sim light.` : "";
    const settleText = result.settled > 0 ? ` ${result.settled} settled.` : "";
    const claimText = result.claimed > 0 ? ` ${result.claimed} cell${result.claimed === 1 ? "" : "s"} claimed.` : "";
    return {
      log: `Player ${owner} placed a powder source at (${hex.q}, ${hex.r}) and poured ${result.spawned} grains.${settleText}${claimText}${trimText}`,
      needsEgyptianChoice: false
    };
  }

  const armoryPieceType = resolveArmorySelectedPieceForPlacement(state, owner);
  placeStone(state, hex, owner, "stone", usesArmoryMode(state) ? { pieceType: armoryPieceType } : {});
  const armoryAbilityMessage = applyArmoryPlacementAbility(state, state.lastPlacement, owner, armoryPieceType);
  const capResolution = enforceStoneCapAfterPlacement(state, owner, {
    interactiveEgyptian: hasMode(state, "egyptian") && owner === state.turnPlayer
  });

  const bagelMessages = applyEverythingBagelPlacementEffects(state, state.lastPlacement, owner);
  const bedSiegeMessages = applyBedSiegePlacementEffects(state, state.lastPlacement, owner);
  const powderMessage = emitPowderFromPlacement(state, state.lastPlacement, owner);
  const chaosMessages = applyChaosAfterPlacementEffects(state, state.lastPlacement, owner);
  const riftMessages = applyRiftBloomPlacementEffects(state, state.lastPlacement, owner);
  const pigMoveMessage = movePigAfterPlacement(state);
  const pigMessage = applyPigTrapAfterPlacement(state, owner, wasPigTrappedBefore);

  queueEcho(state, {
    kind: "stone",
    owner,
    source: state.lastPlacement,
    pieceType: armoryPieceType
  });

  const extraMessages = [
    usesArmoryMode(state) ? `Deployed ${getArmoryPieceDef(armoryPieceType).name}.` : null,
    armoryAbilityMessage,
    ...bedSiegeMessages,
    ...bagelMessages,
    ...chaosMessages,
    ...riftMessages,
    pigMoveMessage,
    pigMessage,
    powderMessage
  ].filter(Boolean);
  const logSuffix = extraMessages.length > 0 ? ` ${extraMessages.join(" ")}` : "";

  if (capResolution.needsChoice) {
    return {
      log: `Player ${owner} placed at (${state.lastPlacement.q}, ${state.lastPlacement.r}).${logSuffix} Egyptian: choose ${state.egyptianRemoval?.remaining || 1} stone${(state.egyptianRemoval?.remaining || 1) === 1 ? "" : "s"} to remove (not the stone you just placed).`,
      needsEgyptianChoice: true
    };
  }

  return {
    log: `Player ${owner} placed at (${state.lastPlacement.q}, ${state.lastPlacement.r}).${logSuffix}`,
    needsEgyptianChoice: false
  };
}

function finishBedSiegeBoardAction(state, logText) {
  pushLog(logText);
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

function showBedSiegeNotice(text) {
  if (!text) {
    return;
  }
  pushLog(`Bed Siege: ${text}`);
  updateStatus();
  render();
  broadcastOnlineState();
}

function handleBedSiegeBuildAction(state, hex, owner) {
  const itemKey = getBedSiegeSelectedItem(state, owner);
  const itemDef = getBedSiegeItemDef(itemKey);
  const itemCount = getBedSiegeInventoryCount(state, owner, itemKey);

  if (itemDef.category === "block") {
    if (itemCount <= 0) {
      showBedSiegeNotice(`Buy ${itemDef.name} before placing it.`);
      return;
    }
    if (!isBedSiegeBuildableHex(state, hex, owner, 1)) {
      return;
    }
    saveHistory();
    consumeBedSiegeInventoryItem(state, owner, itemKey, 1);
    placeBedSiegeBlock(state, hex, owner, itemDef.blockType);
    finishBedSiegeBoardAction(state, `Player ${owner} placed ${itemDef.name} at (${hex.q}, ${hex.r}).`);
    return;
  }

  if (itemKey === "bridgeEgg") {
    if (itemCount <= 0) {
      showBedSiegeNotice("Buy a Bridge Egg before launching one.");
      return;
    }
    const path = getBedSiegeBridgePath(state, owner, hex);
    if (!path?.length) {
      return;
    }
    saveHistory();
    consumeBedSiegeInventoryItem(state, owner, itemKey, 1);
    for (const pathHex of path) {
      placeBedSiegeBlock(state, pathHex, owner, "wool");
    }
    finishBedSiegeBoardAction(state, `Player ${owner} launched a Bridge Egg to (${hex.q}, ${hex.r}).`);
    return;
  }

  if (itemKey === "pearl") {
    if (itemCount <= 0) {
      showBedSiegeNotice("Buy a Pearl before using one.");
      return;
    }
    if (!isBedSiegeBuildableHex(state, hex, owner, BED_SIEGE_PEARL_RANGE)) {
      return;
    }
    saveHistory();
    consumeBedSiegeInventoryItem(state, owner, itemKey, 1);
    placeStone(state, hex, owner, "stone", {
      bedSiegeBlockType: "wool",
      bedSiegeWool: true,
      bedSiegePearlLanding: true,
      pieceType: usesArmoryMode(state) ? "militia" : undefined
    });
    finishBedSiegeBoardAction(state, `Player ${owner} pearled to (${hex.q}, ${hex.r}) and set a landing block.`);
  }
}

function handleBedSiegeAttackAction(state, hex, owner, targetCell) {
  if (!targetCell || targetCell.kind !== "stone" || targetCell.owner === owner) {
    return;
  }

  const targetOwner = normalisePlayerNumber(targetCell.owner, state);
  const targetBedOwner = getBedSiegeBedOwnerAt(state, hex, true);
  if (targetBedOwner && targetBedOwner !== owner) {
    if (!hasBedSiegeAdjacentAttackBlock(state, owner, targetBedOwner)) {
      showBedSiegeNotice(`Place one of your blocks next to Player ${targetBedOwner}'s bed before breaking it.`);
      return;
    }
    if (!isBedSiegeBedExposed(state, targetBedOwner)) {
      showBedSiegeNotice(`Player ${targetBedOwner}'s bed is still defended.`);
      return;
    }
    if (!canBedSiegeBreakBed(state, owner, targetBedOwner)) {
      return;
    }
    saveHistory();
    breakBedSiegeBed(state, targetBedOwner, owner, hex, { log: false });
    finishBedSiegeBoardAction(state, `Player ${owner} broke Player ${targetBedOwner}'s bed.`);
    return;
  }

  const selectedItem = getBedSiegeSelectedItem(state, owner);
  if (selectedItem === "fireball") {
    if (getBedSiegeInventoryCount(state, owner, "fireball") <= 0) {
      showBedSiegeNotice("Buy a Fireball before throwing one.");
      return;
    }
    if (!canBedSiegeReachHex(state, owner, hex, BED_SIEGE_FIREBALL_RANGE)) {
      return;
    }
    if (isBedSiegeBedCell(targetCell)) {
      showBedSiegeNotice("Fireballs cannot break beds.");
      return;
    }
    if (!isBedSiegeBlockCell(targetCell)) {
      showBedSiegeNotice("Fireballs only damage defense blocks.");
      return;
    }
    const blastTargets = getBedSiegeFireballTargets(state, hex);
    if (blastTargets.length <= 0) {
      return;
    }
    saveHistory();
    consumeBedSiegeInventoryItem(state, owner, "fireball", 1);
    for (const target of blastTargets) {
      removeStone(state, target);
    }
    finishBedSiegeBoardAction(state, `Player ${owner} fireballed (${hex.q}, ${hex.r}) and blasted ${blastTargets.length} block${blastTargets.length === 1 ? "" : "s"}.`);
    return;
  }

  if (!canBedSiegeReachHex(state, owner, hex, 1)) {
    return;
  }
  const failure = isBedSiegeBlockCell(targetCell) ? getBedSiegeBlockBreakFailure(state, owner, targetCell) : "";
  if (failure) {
    showBedSiegeNotice(failure);
    return;
  }

  saveHistory();
  payBedSiegeBreakCost(state, owner, targetCell);
  const shearTargets = isBedSiegeBlockCell(targetCell)
    ? getBedSiegeShearTargets(state, owner, hex)
    : [hex];
  for (const target of shearTargets) {
    removeStone(state, target);
  }
  const blockName = isBedSiegeBlockCell(targetCell)
    ? getBedSiegeItemDef(getBedSiegeBlockType(targetCell)).name
    : "stone";
  const shearText = shearTargets.length > 1 ? ` Shears cleared ${shearTargets.length - 1} extra wool.` : "";
  finishBedSiegeBoardAction(state, `Player ${owner} broke Player ${targetOwner}'s ${blockName} at (${hex.q}, ${hex.r}).${shearText}`);
}

function handleBedSiegeBoardClick(hex) {
  const state = game.state;
  const owner = state.turnPlayer;
  if (!canBedSiegePlayerAct(state, owner)) {
    showBedSiegeNotice(`Player ${owner}'s bed is broken.`);
    return;
  }
  if (!isCellSupportedForMode(state, hex) || isHexBlockedBySpecials(state, hex)) {
    return;
  }

  const targetCell = getCellAt(state, hex);
  if (targetCell) {
    handleBedSiegeAttackAction(state, hex, owner, targetCell);
    return;
  }
  handleBedSiegeBuildAction(state, hex, owner);
}

function createFactoryResourceWallet(seed = {}) {
  const wallet = {};
  for (const resource of FACTORY_RESOURCE_TYPES) {
    wallet[resource] = Math.max(0, Math.round(Number(seed?.[resource]) || 0));
  }
  return wallet;
}

function getFactoryModuleDef(moduleType) {
  return FACTORY_MODULE_DEFS[moduleType] || FACTORY_MODULE_DEFS.belt;
}

function getFactoryDepositDef(depositType) {
  return FACTORY_DEPOSIT_DEFS[depositType] || FACTORY_DEPOSIT_DEFS.ore;
}

function getFactoryCommandDef(actionKey) {
  return FACTORY_COMMAND_DEFS[actionKey] || FACTORY_COMMAND_DEFS.belt;
}

function normaliseFactoryAction(actionKey) {
  return FACTORY_COMMAND_DEFS[actionKey] ? actionKey : "belt";
}

function getFactoryHomeHexForOwner(state, owner) {
  const playerCount = getPlayerCount(state);
  const layouts = {
    2: {
      1: { q: -7, r: 0 },
      2: { q: 7, r: 0 }
    },
    3: {
      1: { q: -7, r: 0 },
      2: { q: 7, r: -7 },
      3: { q: 0, r: 7 }
    },
    4: {
      1: { q: -8, r: 0 },
      2: { q: 8, r: 0 },
      3: { q: 4, r: -8 },
      4: { q: -4, r: 8 }
    }
  };
  return { ...(layouts[playerCount]?.[normalisePlayerNumber(owner, playerCount)] || layouts[2][1]) };
}

function getFactoryDepositDefinitions(state) {
  const deposits = [
    { hex: { q: -3, r: -2 }, type: "ore" },
    { hex: { q: -5, r: 2 }, type: "ore" },
    { hex: { q: 5, r: -2 }, type: "ore" },
    { hex: { q: 3, r: 2 }, type: "ore" },
    { hex: { q: 0, r: 0 }, type: "flux" }
  ];

  const seen = new Set();
  return deposits.map((deposit) => ({
    id: `neutral-${deposit.type}-${deposit.hex.q}-${deposit.hex.r}`,
    owner: 0,
    type: deposit.type,
    hex: { ...deposit.hex }
  })).filter((deposit) => {
    const key = keyOf(deposit.hex.q, deposit.hex.r);
    if (seen.has(key) || !isCellSupportedForMode(state, deposit.hex)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getFactoryDepositAt(state, hex) {
  if (!usesFactoryMode(state)) {
    return null;
  }
  return getFactoryDepositDefinitions(state).find((deposit) => equalHex(deposit.hex, hex)) || null;
}

function createFactoryStateForGame(state) {
  return {
    cores: createPlayerMap(getPlayerCount(state), (owner) => ({
      hex: getFactoryHomeHexForOwner(state, owner),
      alive: true,
      level: 1,
      integrity: FACTORY_CORE_BASE_INTEGRITY,
      maxIntegrity: FACTORY_CORE_BASE_INTEGRITY,
      eliminatedBy: null
    })),
    resources: createPlayerMap(getPlayerCount(state), () => createFactoryResourceWallet(FACTORY_STARTING_RESOURCES)),
    selectedAction: createPlayerMap(getPlayerCount(state), () => "belt"),
    lastReport: createPlayerMap(getPlayerCount(state), () => null)
  };
}

function isFactoryCell(cell) {
  return Boolean(cell && cell.kind === "stone" && FACTORY_MODULE_DEFS[cell.factoryType]);
}

function getFactoryCellType(cell) {
  return isFactoryCell(cell) ? cell.factoryType : "";
}

function placeFactoryCoreCells(state) {
  if (!usesFactoryMode(state)) {
    return;
  }
  const factory = state.factory;
  for (const owner of getPlayerNumbers(state)) {
    const core = factory?.cores?.[owner];
    if (!core?.hex) {
      continue;
    }
    const key = keyOf(core.hex.q, core.hex.r);
    const existing = state.cells[key];
    if (existing && existing.kind === "stone" && existing.owner === owner) {
      existing.factoryType = "core";
      existing.factoryCore = true;
      existing.factoryHp = core.integrity;
      existing.factoryMaxHp = core.maxIntegrity;
      existing.factoryBrokenCore = core.alive === false;
      continue;
    }
    state.moveSerial += 1;
    state.cells[key] = {
      owner,
      kind: "stone",
      serial: state.moveSerial,
      factoryType: "core",
      factoryCore: true,
      factoryHp: core.integrity,
      factoryMaxHp: core.maxIntegrity,
      factoryBrokenCore: core.alive === false
    };
  }
}

function ensureFactoryState(state) {
  if (!usesFactoryMode(state)) {
    if (state) {
      state.factory = null;
    }
    return null;
  }

  if (!state.factory || typeof state.factory !== "object") {
    state.factory = createFactoryStateForGame(state);
    placeFactoryCoreCells(state);
    return state.factory;
  }

  const currentCores = state.factory.cores && typeof state.factory.cores === "object" ? state.factory.cores : {};
  const currentResources = state.factory.resources && typeof state.factory.resources === "object" ? state.factory.resources : {};
  const currentSelectedActions = state.factory.selectedAction && typeof state.factory.selectedAction === "object" ? state.factory.selectedAction : {};
  const currentReports = state.factory.lastReport && typeof state.factory.lastReport === "object" ? state.factory.lastReport : {};
  state.factory.cores = createPlayerMap(getPlayerCount(state), (owner) => {
    const fallback = getFactoryHomeHexForOwner(state, owner);
    const core = currentCores[owner] || {};
    const rawHex = core.hex || fallback;
    const maxIntegrity = Math.max(FACTORY_CORE_BASE_INTEGRITY, Math.round(Number(core.maxIntegrity) || FACTORY_CORE_BASE_INTEGRITY));
    const parsedIntegrity = Number(core.integrity);
    const integrity = Math.max(
      0,
      Math.min(maxIntegrity, Math.round(Number.isFinite(parsedIntegrity) ? parsedIntegrity : maxIntegrity))
    );
    const parsedQ = Number(rawHex.q);
    const parsedR = Number(rawHex.r);
    return {
      hex: {
        q: Math.trunc(Number.isFinite(parsedQ) ? parsedQ : fallback.q),
        r: Math.trunc(Number.isFinite(parsedR) ? parsedR : fallback.r)
      },
      alive: core.alive !== false && integrity > 0,
      level: Math.max(1, Math.min(4, Math.round(Number(core.level) || 1))),
      integrity,
      maxIntegrity,
      eliminatedBy: core.eliminatedBy && isValidPlayerNumber(core.eliminatedBy, state)
        ? normalisePlayerNumber(core.eliminatedBy, state)
        : null
    };
  });
  state.factory.resources = createPlayerMap(getPlayerCount(state), (owner) => (
    createFactoryResourceWallet({ ...FACTORY_STARTING_RESOURCES, ...(currentResources[owner] || {}) })
  ));
  state.factory.selectedAction = createPlayerMap(getPlayerCount(state), (owner) => (
    normaliseFactoryAction(currentSelectedActions[owner])
  ));
  state.factory.lastReport = createPlayerMap(getPlayerCount(state), (owner) => currentReports[owner] || null);
  placeFactoryCoreCells(state);
  return state.factory;
}

function getFactoryCore(state, owner) {
  const factory = ensureFactoryState(state);
  return factory?.cores?.[normalisePlayerNumber(owner, state)] || null;
}

function getFactoryAliveOwners(state) {
  const factory = ensureFactoryState(state);
  if (!factory) {
    return [];
  }
  return getPlayerNumbers(state).filter((owner) => factory.cores[owner]?.alive);
}

function canFactoryPlayerAct(state, owner) {
  return Boolean(getFactoryCore(state, owner)?.alive);
}

function getFactoryCoreOwnerAt(state, hex) {
  if (!usesFactoryMode(state)) {
    return 0;
  }
  const factory = ensureFactoryState(state);
  for (const owner of getPlayerNumbers(state)) {
    const core = factory.cores[owner];
    if (core?.hex && equalHex(core.hex, hex)) {
      return owner;
    }
  }
  return 0;
}

function getFactoryWinner(state) {
  if (!usesFactoryMode(state)) {
    return 0;
  }
  const aliveOwners = getFactoryAliveOwners(state);
  if (aliveOwners.length === 1) {
    return aliveOwners[0];
  }
  return 0;
}

function getFactoryConnectedKeySet(state, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  const core = getFactoryCore(state, safeOwner);
  const connected = new Set();
  if (!core?.alive) {
    return connected;
  }

  const startKey = keyOf(core.hex.q, core.hex.r);
  const startCell = state.cells[startKey];
  if (!isFactoryCell(startCell) || startCell.owner !== safeOwner) {
    return connected;
  }

  const queue = [core.hex];
  connected.add(startKey);
  while (queue.length > 0) {
    const current = queue.shift();
    for (const next of getAdjacentsForMode(state, current)) {
      const nextKey = keyOf(next.q, next.r);
      if (connected.has(nextKey)) {
        continue;
      }
      const cell = state.cells[nextKey];
      if (!isFactoryCell(cell) || cell.owner !== safeOwner) {
        continue;
      }
      connected.add(nextKey);
      queue.push(next);
    }
  }
  return connected;
}

function getFactoryConnectedEntries(state, owner) {
  const connected = getFactoryConnectedKeySet(state, owner);
  return Array.from(connected).map((key) => ({
    key,
    hex: parseKey(key),
    cell: state.cells[key]
  }));
}

function getFactoryNearestConnectedAnchor(state, owner, hex, maxRange = 1) {
  return getFactoryConnectedEntries(state, owner)
    .filter((entry) => getDistanceForMode(state, entry.hex, hex) <= maxRange)
    .sort((a, b) => (
      getDistanceForMode(state, a.hex, hex) - getDistanceForMode(state, b.hex, hex)
      || getDistanceForMode(state, a.hex) - getDistanceForMode(state, b.hex)
      || a.hex.q - b.hex.q
      || a.hex.r - b.hex.r
    ))[0] || null;
}

function getFactoryActiveModuleEntries(state, owner, moduleType = "") {
  return getFactoryConnectedEntries(state, owner)
    .filter((entry) => isFactoryCell(entry.cell) && (!moduleType || entry.cell.factoryType === moduleType));
}

function getFactoryReachableLauncher(state, owner, hex) {
  return getFactoryActiveModuleEntries(state, owner, "launcher")
    .filter((entry) => getDistanceForMode(state, entry.hex, hex) <= FACTORY_REMOTE_STRIKE_RANGE)
    .sort((a, b) => (
      getDistanceForMode(state, a.hex, hex) - getDistanceForMode(state, b.hex, hex)
      || a.hex.q - b.hex.q
      || a.hex.r - b.hex.r
    ))[0] || null;
}

function getFactorySelectedAction(state, owner) {
  const factory = ensureFactoryState(state);
  const safeOwner = normalisePlayerNumber(owner, state);
  const action = normaliseFactoryAction(factory?.selectedAction?.[safeOwner]);
  if (factory?.selectedAction) {
    factory.selectedAction[safeOwner] = action;
  }
  return action;
}

function getFactoryWallet(state, owner) {
  const factory = ensureFactoryState(state);
  return factory.resources[normalisePlayerNumber(owner, state)];
}

function canAffordFactoryCost(state, owner, cost = {}) {
  const wallet = getFactoryWallet(state, owner);
  return Object.entries(cost).every(([resource, amount]) => (
    !FACTORY_RESOURCE_TYPES.includes(resource)
    || wallet[resource] >= Math.max(0, Math.round(Number(amount) || 0))
  ));
}

function spendFactoryResources(state, owner, cost = {}) {
  if (!canAffordFactoryCost(state, owner, cost)) {
    return false;
  }
  const wallet = getFactoryWallet(state, owner);
  for (const [resource, amount] of Object.entries(cost)) {
    if (!FACTORY_RESOURCE_TYPES.includes(resource)) {
      continue;
    }
    wallet[resource] = Math.max(0, wallet[resource] - Math.max(0, Math.round(Number(amount) || 0)));
  }
  return true;
}

function gainFactoryResources(state, owner, gain = {}) {
  const wallet = getFactoryWallet(state, owner);
  for (const [resource, amount] of Object.entries(gain)) {
    if (!FACTORY_RESOURCE_TYPES.includes(resource)) {
      continue;
    }
    wallet[resource] += Math.max(0, Math.round(Number(amount) || 0));
  }
}

function formatFactoryCost(cost = {}) {
  const entries = Object.entries(cost).filter(([, amount]) => Number(amount) > 0);
  if (entries.length === 0) {
    return "free";
  }
  return entries.map(([resource, amount]) => `${amount}${FACTORY_RESOURCE_LABELS[resource]?.short || resource[0]}`).join("/");
}

function formatFactoryWallet(state, owner) {
  const wallet = getFactoryWallet(state, owner);
  return `${wallet.points}pt | ${wallet.ore} Ore/${wallet.flux} Flux delivered`;
}

function getFactoryScoreSummary(state) {
  const factory = ensureFactoryState(state);
  return getPlayerNumbers(state).map((owner) => {
    const core = factory.cores[owner];
    const wallet = factory.resources[owner];
    return `P${owner} ${wallet.points}pt ${core.alive ? `${core.integrity}hp` : "out"}`;
  }).join(" | ");
}

function getFactoryPlayerSummary(state, owner) {
  const core = getFactoryCore(state, owner);
  const wallet = getFactoryWallet(state, owner);
  const coreText = core?.alive ? `Core ${core.integrity}/${core.maxIntegrity}` : "Core offline";
  return `${coreText} | ${wallet.points}pt | delivered ${wallet.ore} Ore/${wallet.flux} Flux`;
}

function getFactoryBuildModuleForHex(state, hex, owner = state.turnPlayer) {
  const action = getFactorySelectedAction(state, owner);
  const command = getFactoryCommandDef(action);
  return command.group === "build" ? command.moduleType : "";
}

function isFactoryBuildableHex(state, hex, owner = state.turnPlayer) {
  if (!usesFactoryMode(state) || !canFactoryPlayerAct(state, owner)) {
    return false;
  }
  if (!isCellSupportedForMode(state, hex) || isOccupied(state, hex) || isHexBlockedBySpecials(state, hex)) {
    return false;
  }
  if (getFactoryDepositAt(state, hex)) {
    return false;
  }
  if (!getFactoryNearestConnectedAnchor(state, owner, hex, 1)) {
    return false;
  }
  const moduleType = getFactoryBuildModuleForHex(state, hex, owner);
  if (!moduleType) {
    return false;
  }
  if (moduleType === "miner" && getFactoryAdjacentDeposits(state, hex).length === 0) {
    return false;
  }
  return canAffordFactoryCost(state, owner, getFactoryModuleDef(moduleType).cost);
}

function isLegalFactoryPlacement(state, hex, owner = state.turnPlayer) {
  return isFactoryBuildableHex(state, hex, owner);
}

function placeFactoryModule(state, hex, owner, moduleType, extras = {}) {
  const moduleDef = getFactoryModuleDef(moduleType);
  const maxHp = Math.max(1, Math.round(Number(moduleDef.hp) || 1));
  placeStone(state, hex, owner, "stone", {
    factoryType: moduleType,
    factoryLevel: Math.max(1, Math.round(Number(extras.level) || 1)),
    factoryDepositType: extras.depositType || null,
    factoryHp: maxHp,
    factoryMaxHp: maxHp,
    factorySymbol: moduleDef.symbol
  });
}

function getFactoryMinerUpgradeCost(level) {
  return { points: Math.max(1, Math.round(Number(level) || 1)) * 10 };
}

function damageFactoryCore(state, targetOwner, amount, attacker = null, sourceText = "") {
  const factory = ensureFactoryState(state);
  const safeTarget = normalisePlayerNumber(targetOwner, state);
  const core = factory.cores[safeTarget];
  if (!core || !core.alive) {
    return `Player ${safeTarget}'s core is already offline.`;
  }
  const damage = Math.max(1, Math.round(Number(amount) || 1));
  core.integrity = Math.max(0, core.integrity - damage);
  const coreCell = getCellAt(state, core.hex);
  if (coreCell && coreCell.owner === safeTarget) {
    coreCell.factoryHp = core.integrity;
    coreCell.factoryMaxHp = core.maxIntegrity;
    coreCell.serial = ++state.moveSerial;
  }
  const source = sourceText ? ` ${sourceText}` : "";
  if (core.integrity > 0) {
    return `Player ${safeTarget}'s core took ${damage} damage${source} (${core.integrity}/${core.maxIntegrity}).`;
  }

  core.alive = false;
  core.eliminatedBy = attacker && isValidPlayerNumber(attacker, state) ? normalisePlayerNumber(attacker, state) : null;
  if (coreCell && coreCell.owner === safeTarget) {
    coreCell.factoryBrokenCore = true;
  }
  return `Player ${safeTarget}'s core went offline${attacker ? ` after Player ${attacker}'s attack` : ""}.`;
}

function getFactoryModuleMaxHp(cell) {
  const moduleType = getFactoryCellType(cell);
  const moduleDef = getFactoryModuleDef(moduleType);
  return Math.max(1, Math.round(Number(cell?.factoryMaxHp) || Number(moduleDef.hp) || 1));
}

function damageFactoryModule(state, hex, amount) {
  const cell = getCellAt(state, hex);
  if (!cell || !isFactoryCell(cell) || getFactoryCellType(cell) === "core") {
    return { removed: false, hp: 0, maxHp: 0, moduleName: "module" };
  }
  const damage = Math.max(1, Math.round(Number(amount) || 1));
  const maxHp = getFactoryModuleMaxHp(cell);
  const currentHp = Math.max(1, Math.round(Number(cell.factoryHp) || maxHp));
  const nextHp = Math.max(0, currentHp - damage);
  const moduleName = getFactoryModuleDef(getFactoryCellType(cell)).name;
  if (nextHp <= 0) {
    removeStone(state, hex);
    return { removed: true, hp: 0, maxHp, moduleName };
  }
  cell.factoryHp = nextHp;
  cell.factoryMaxHp = maxHp;
  cell.serial = ++state.moveSerial;
  return { removed: false, hp: nextHp, maxHp, moduleName };
}

function getFactoryBlastChargeTargets(state, hex, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  return getAdjacentsForMode(state, hex)
    .map((targetHex) => ({ hex: targetHex, cell: getCellAt(state, targetHex) }))
    .filter((entry) => (
      entry.cell
      && isFactoryCell(entry.cell)
      && isValidPlayerNumber(entry.cell.owner, state)
      && normalisePlayerNumber(entry.cell.owner, state) !== safeOwner
    ));
}

function handleFactoryBlastChargeAction(state, hex, owner) {
  const connected = getFactoryConnectedKeySet(state, owner);
  if (!connected.has(keyOf(hex.q, hex.r))) {
    showFactoryNotice("Blast Charges must stay connected to detonate.");
    return;
  }

  const targets = getFactoryBlastChargeTargets(state, hex, owner);
  if (targets.length <= 0) {
    showFactoryNotice("Blast Charge needs an adjacent enemy factory tile.");
    return;
  }

  saveHistory();
  let coreHits = 0;
  let moduleHits = 0;
  let brokenModules = 0;
  for (const target of targets) {
    const targetOwner = normalisePlayerNumber(target.cell.owner, state);
    if (getFactoryCellType(target.cell) === "core") {
      coreHits += 1;
      damageFactoryCore(state, targetOwner, 3, owner, "from a blast charge");
      continue;
    }
    moduleHits += 1;
    const result = damageFactoryModule(state, target.hex, 2);
    if (result.removed) {
      brokenModules += 1;
    }
  }
  removeStone(state, hex);
  const coreText = coreHits > 0 ? `${coreHits} core hit${coreHits === 1 ? "" : "s"}` : "no core hits";
  const moduleText = moduleHits > 0 ? `${moduleHits} module hit${moduleHits === 1 ? "" : "s"} (${brokenModules} broken)` : "no module hits";
  finishFactoryAction(state, `Player ${owner} detonated a Blast Charge: ${coreText}, ${moduleText}.`);
}

function finishFactoryAction(state, logText) {
  pushLog(logText);
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

function showFactoryNotice(text) {
  if (!text) {
    return;
  }
  pushLog(`Foundry War: ${text}`);
  updateStatus();
  render();
  broadcastOnlineState();
}

function handleFactoryBuildAction(state, hex, owner) {
  if (!isCellSupportedForMode(state, hex) || isOccupied(state, hex) || isHexBlockedBySpecials(state, hex)) {
    return;
  }
  if (getFactoryDepositAt(state, hex)) {
    showFactoryNotice("Resource nodes stay open. Build Miners on surrounding spaces to control them.");
    return;
  }
  if (!getFactoryNearestConnectedAnchor(state, owner, hex, 1)) {
    showFactoryNotice("Build next to your connected factory line.");
    return;
  }
  const action = getFactorySelectedAction(state, owner);
  const command = getFactoryCommandDef(action);
  if (command.group !== "build") {
    showFactoryNotice("Choose a build item before placing on an empty space.");
    return;
  }
  const moduleType = command.moduleType;
  const adjacentDeposits = getFactoryAdjacentDeposits(state, hex);
  if (moduleType === "miner" && adjacentDeposits.length === 0) {
    showFactoryNotice("Miners must touch an Ore or Flux node.");
    return;
  }
  const moduleDef = getFactoryModuleDef(moduleType);
  if (!canAffordFactoryCost(state, owner, moduleDef.cost)) {
    showFactoryNotice(`${moduleDef.name} needs ${formatFactoryCost(moduleDef.cost)}.`);
    return;
  }

  saveHistory();
  spendFactoryResources(state, owner, moduleDef.cost);
  placeFactoryModule(state, hex, owner, moduleType, {
    depositType: adjacentDeposits[0]?.type || null
  });
  const depositText = adjacentDeposits.length > 0
    ? ` beside ${adjacentDeposits.map((deposit) => getFactoryDepositDef(deposit.type).name).join("/")}`
    : "";
  finishFactoryAction(state, `Player ${owner} built ${moduleDef.name}${depositText} at (${hex.q}, ${hex.r}).`);
}

function handleFactoryOwnCellAction(state, hex, owner, cell) {
  const moduleType = getFactoryCellType(cell);
  if (moduleType === "mine") {
    handleFactoryBlastChargeAction(state, hex, owner);
    return;
  }

  const selectedAction = getFactorySelectedAction(state, owner);
  if (getFactoryCommandDef(selectedAction).group === "attack") {
    showFactoryNotice("Attack actions need an enemy target.");
    return;
  }
  if (moduleType === "core") {
    const core = getFactoryCore(state, owner);
    if (!core?.alive) {
      return;
    }
    if (core.integrity < core.maxIntegrity) {
      const repairCost = { points: 10 };
      if (!canAffordFactoryCost(state, owner, repairCost)) {
        showFactoryNotice(`Core repair needs ${formatFactoryCost(repairCost)}.`);
        return;
      }
      saveHistory();
      spendFactoryResources(state, owner, repairCost);
      core.integrity = Math.min(core.maxIntegrity, core.integrity + 6);
      cell.factoryHp = core.integrity;
      cell.factoryMaxHp = core.maxIntegrity;
      cell.serial = ++state.moveSerial;
      finishFactoryAction(state, `Player ${owner} repaired their core to ${core.integrity}/${core.maxIntegrity}.`);
      return;
    }

    showFactoryNotice("Core is healthy. Feed resources home for points, then spend them on attacks or defenses.");
    return;
  }

  if (moduleType === "miner") {
    const currentLevel = Math.max(1, Math.round(Number(cell.factoryLevel) || 1));
    if (currentLevel >= 2) {
      showFactoryNotice("Miner is already reinforced.");
      return;
    }
    const upgradeCost = getFactoryMinerUpgradeCost(currentLevel);
    if (!canAffordFactoryCost(state, owner, upgradeCost)) {
      showFactoryNotice(`Miner reinforcement needs ${formatFactoryCost(upgradeCost)}.`);
      return;
    }
    saveHistory();
    spendFactoryResources(state, owner, upgradeCost);
    cell.factoryLevel = currentLevel + 1;
    cell.factoryHp = Math.max(getFactoryModuleMaxHp(cell), 2);
    cell.factoryMaxHp = Math.max(getFactoryModuleMaxHp(cell), 2);
    cell.serial = ++state.moveSerial;
    finishFactoryAction(state, `Player ${owner} reinforced a Miner to strength ${cell.factoryLevel}.`);
    return;
  }

  const nextModuleType = FACTORY_MODULE_UPGRADES[moduleType];
  if (!nextModuleType) {
    const maxHp = getFactoryModuleMaxHp(cell);
    const currentHp = Math.max(1, Math.round(Number(cell.factoryHp) || maxHp));
    if (currentHp < maxHp) {
      const repairCost = { points: 6 };
      if (!canAffordFactoryCost(state, owner, repairCost)) {
        showFactoryNotice(`${getFactoryModuleDef(moduleType).name} repair needs ${formatFactoryCost(repairCost)}.`);
        return;
      }
      saveHistory();
      spendFactoryResources(state, owner, repairCost);
      cell.factoryHp = Math.min(maxHp, currentHp + 1);
      cell.factoryMaxHp = maxHp;
      cell.serial = ++state.moveSerial;
      finishFactoryAction(state, `Player ${owner} repaired ${getFactoryModuleDef(moduleType).name} to ${cell.factoryHp}/${maxHp}.`);
      return;
    }
    showFactoryNotice(`${getFactoryModuleDef(moduleType).name} is ready.`);
    return;
  }
  const nextDef = getFactoryModuleDef(nextModuleType);
  if (!canAffordFactoryCost(state, owner, nextDef.cost)) {
    showFactoryNotice(`${nextDef.name} upgrade needs ${formatFactoryCost(nextDef.cost)}.`);
    return;
  }
  saveHistory();
  spendFactoryResources(state, owner, nextDef.cost);
  cell.factoryType = nextModuleType;
  cell.factoryLevel = 1;
  cell.factoryHp = Math.max(1, Math.round(Number(nextDef.hp) || 1));
  cell.factoryMaxHp = cell.factoryHp;
  cell.factorySymbol = nextDef.symbol;
  cell.serial = ++state.moveSerial;
  finishFactoryAction(state, `Player ${owner} upgraded ${getFactoryModuleDef(moduleType).name} into ${nextDef.name}.`);
}

function handleFactoryEnemyAction(state, hex, owner, targetCell) {
  if (!targetCell || !isFactoryCell(targetCell) || targetCell.owner === owner) {
    return;
  }
  const targetOwner = normalisePlayerNumber(targetCell.owner, state);
  const action = getFactorySelectedAction(state, owner);
  const command = getFactoryCommandDef(action);
  if (command.group !== "attack") {
    showFactoryNotice("Choose Strike Crew or Cannon Shot before targeting enemy factory tiles.");
    return;
  }

  const adjacentAnchor = getFactoryNearestConnectedAnchor(state, owner, hex, 1);
  const launcher = command === FACTORY_COMMAND_DEFS.shot ? getFactoryReachableLauncher(state, owner, hex) : null;
  if (command === FACTORY_COMMAND_DEFS.strike && !adjacentAnchor) {
    showFactoryNotice("Strike Crew must attack from beside your connected line.");
    return;
  }
  if (command === FACTORY_COMMAND_DEFS.shot && !launcher) {
    showFactoryNotice(`Cannon Shot needs a connected Cannon within ${FACTORY_REMOTE_STRIKE_RANGE} spaces.`);
    return;
  }
  const targetIsCore = getFactoryCellType(targetCell) === "core";
  const attackCost = command.cost;
  if (!canAffordFactoryCost(state, owner, attackCost)) {
    showFactoryNotice(`${command.name} needs ${formatFactoryCost(attackCost)}.`);
    return;
  }

  saveHistory();
  spendFactoryResources(state, owner, attackCost);
  if (targetIsCore) {
    const message = damageFactoryCore(
      state,
      targetOwner,
      command.coreDamage,
      owner,
      command === FACTORY_COMMAND_DEFS.shot ? "from a cannon shot" : "from a strike crew"
    );
    finishFactoryAction(state, `Player ${owner} used ${command.name} on Player ${targetOwner}'s core. ${message}`);
    return;
  }

  const damageResult = damageFactoryModule(state, hex, command.moduleDamage);
  const resultText = damageResult.removed
    ? `broke Player ${targetOwner}'s ${damageResult.moduleName}`
    : `damaged Player ${targetOwner}'s ${damageResult.moduleName} to ${damageResult.hp}/${damageResult.maxHp}`;
  finishFactoryAction(state, `Player ${owner} used ${command.name} and ${resultText} at (${hex.q}, ${hex.r}).`);
}

function handleFactoryBoardClick(hex) {
  const state = game.state;
  const owner = state.turnPlayer;
  ensureFactoryState(state);
  if (!canFactoryPlayerAct(state, owner)) {
    return;
  }
  if (!isCellSupportedForMode(state, hex)) {
    return;
  }

  const targetCell = getCellAt(state, hex);
  if (targetCell) {
    if (targetCell.owner === owner) {
      handleFactoryOwnCellAction(state, hex, owner, targetCell);
      return;
    }
    handleFactoryEnemyAction(state, hex, owner, targetCell);
    return;
  }
  handleFactoryBuildAction(state, hex, owner);
}

function getFactoryModuleCounts(entries) {
  const counts = {};
  for (const moduleType of Object.keys(FACTORY_MODULE_DEFS)) {
    counts[moduleType] = 0;
  }
  for (const entry of entries) {
    const moduleType = getFactoryCellType(entry.cell);
    if (moduleType) {
      counts[moduleType] = (counts[moduleType] || 0) + 1;
    }
  }
  return counts;
}

function getFactoryAdjacentDeposits(state, hex) {
  if (!usesFactoryMode(state)) {
    return [];
  }
  return getFactoryDepositDefinitions(state).filter((deposit) => (
    getAdjacentsForMode(state, deposit.hex).some((adjacent) => equalHex(adjacent, hex))
  ));
}

function getFactoryMinerStrength(cell) {
  if (!isFactoryCell(cell) || getFactoryCellType(cell) !== "miner") {
    return 0;
  }
  return Math.max(1, Math.min(2, Math.round(Number(cell.factoryLevel) || 1)));
}

function getFactoryDepositControl(state, deposit) {
  const strengthByOwner = createPlayerMap(getPlayerCount(state), () => 0);
  const miners = [];
  for (const adjacent of getAdjacentsForMode(state, deposit.hex)) {
    const cell = getCellAt(state, adjacent);
    if (!cell || !isFactoryCell(cell) || getFactoryCellType(cell) !== "miner" || !isValidPlayerNumber(cell.owner, state)) {
      continue;
    }
    const owner = normalisePlayerNumber(cell.owner, state);
    const strength = getFactoryMinerStrength(cell);
    strengthByOwner[owner] += strength;
    miners.push({ owner, strength, hex: adjacent, cell });
  }

  const bestStrength = Math.max(0, ...Object.values(strengthByOwner));
  const leaders = getPlayerNumbers(state).filter((owner) => strengthByOwner[owner] === bestStrength && bestStrength > 0);
  return {
    controller: leaders.length === 1 ? leaders[0] : 0,
    tied: leaders.length > 1,
    bestStrength,
    strengthByOwner,
    miners
  };
}

function getFactoryConnectedMinerForDeposit(state, owner, deposit, connectedSet = null) {
  const safeOwner = normalisePlayerNumber(owner, state);
  const connected = connectedSet || getFactoryConnectedKeySet(state, safeOwner);
  return getAdjacentsForMode(state, deposit.hex)
    .map((hex) => {
      const key = keyOf(hex.q, hex.r);
      const cell = state.cells[key];
      return { key, hex, cell };
    })
    .filter((entry) => (
      connected.has(entry.key)
      && entry.cell
      && entry.cell.owner === safeOwner
      && getFactoryCellType(entry.cell) === "miner"
    ))
    .sort((a, b) => (
      getFactoryMinerStrength(b.cell) - getFactoryMinerStrength(a.cell)
      || a.hex.q - b.hex.q
      || a.hex.r - b.hex.r
    ))[0] || null;
}

function findFactoryPathToCore(state, owner, startHex, connectedSet = null) {
  const safeOwner = normalisePlayerNumber(owner, state);
  const core = getFactoryCore(state, safeOwner);
  if (!core?.alive || !startHex) {
    return [];
  }
  const connected = connectedSet || getFactoryConnectedKeySet(state, safeOwner);
  const startKey = keyOf(startHex.q, startHex.r);
  const coreKey = keyOf(core.hex.q, core.hex.r);
  if (!connected.has(startKey) || !connected.has(coreKey)) {
    return [];
  }

  const parents = { [startKey]: null };
  const queue = [startHex];
  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = keyOf(current.q, current.r);
    if (currentKey === coreKey) {
      const path = [];
      let cursor = coreKey;
      while (cursor) {
        path.push(parseKey(cursor));
        cursor = parents[cursor];
      }
      return path.reverse();
    }
    for (const next of getAdjacentsForMode(state, current)) {
      const nextKey = keyOf(next.q, next.r);
      if (!connected.has(nextKey) || Object.prototype.hasOwnProperty.call(parents, nextKey)) {
        continue;
      }
      parents[nextKey] = currentKey;
      queue.push(next);
    }
  }
  return [];
}

function getFactoryDeliveryInfosForOwner(state, owner) {
  const safeOwner = normalisePlayerNumber(owner, state);
  const connected = getFactoryConnectedKeySet(state, safeOwner);
  const infos = [];
  for (const deposit of getFactoryDepositDefinitions(state)) {
    const control = getFactoryDepositControl(state, deposit);
    if (control.controller !== safeOwner) {
      continue;
    }
    const miner = getFactoryConnectedMinerForDeposit(state, safeOwner, deposit, connected);
    if (!miner) {
      continue;
    }
    const depositDef = getFactoryDepositDef(deposit.type);
    infos.push({
      deposit,
      control,
      miner,
      path: [deposit.hex, ...findFactoryPathToCore(state, safeOwner, miner.hex, connected)],
      value: Math.max(1, Math.round(Number(depositDef.baseValue) || 1))
    });
  }
  return infos;
}

function resolveFactoryTurnEnd(state, owner) {
  if (!usesFactoryMode(state)) {
    return null;
  }
  const factory = ensureFactoryState(state);
  const safeOwner = normalisePlayerNumber(owner, state);
  const core = factory.cores[safeOwner];
  if (!core?.alive) {
    return null;
  }

  const connectedEntries = getFactoryConnectedEntries(state, safeOwner);
  const wallet = factory.resources[safeOwner];
  const ownedFactoryCells = Object.values(state.cells).filter((cell) => isFactoryCell(cell) && cell.owner === safeOwner);
  const inactiveCount = Math.max(0, ownedFactoryCells.length - connectedEntries.length);
  const connectedSet = new Set(connectedEntries.map((entry) => entry.key));
  const report = {
    delivered: { ore: 0, flux: 0 },
    points: 0,
    controlled: 0,
    contested: 0,
    unrouted: 0,
    inactive: inactiveCount
  };

  for (const deposit of getFactoryDepositDefinitions(state)) {
    const control = getFactoryDepositControl(state, deposit);
    if (control.tied) {
      report.contested += 1;
    }
    if (control.controller !== safeOwner) {
      continue;
    }
    report.controlled += 1;
    const miner = getFactoryConnectedMinerForDeposit(state, safeOwner, deposit, connectedSet);
    if (!miner) {
      report.unrouted += 1;
      continue;
    }
    const depositDef = getFactoryDepositDef(deposit.type);
    const baseValue = Math.max(1, Math.round(Number(depositDef.baseValue) || 1));
    const gainedPoints = baseValue;
    wallet[deposit.type] += 1;
    wallet.points += gainedPoints;
    report.delivered[deposit.type] += 1;
    report.points += gainedPoints;
  }

  factory.lastReport[safeOwner] = report;
  const deliveredText = Object.entries(report.delivered)
    .filter(([, amount]) => amount > 0)
    .map(([resource, amount]) => `${amount} ${FACTORY_RESOURCE_LABELS[resource]?.name || resource}${amount === 1 ? "" : "s"}`)
    .join(" ");
  const pointsText = report.points > 0 ? `${deliveredText} for +${report.points}pt` : "no deliveries";
  const unroutedText = report.unrouted > 0 ? `, ${report.unrouted} controlled but not routed` : "";
  const contestedText = report.contested > 0 ? `, ${report.contested} contested` : "";
  const inactiveText = report.inactive > 0 ? `, ${report.inactive} disconnected` : "";
  pushLog(`Player ${safeOwner} foundry tick: ${pointsText}${unroutedText}${contestedText}${inactiveText}.`);
  return report;
}

function clickPlacement(hex) {
  const state = game.state;
  if (isBrowsingHistory()) {
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

  if (hasChaosPendingVote(state)) {
    updateStatus();
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

  if (usesFactoryMode(state)) {
    handleFactoryBoardClick(hex);
    return;
  }

  if (usesBedSiegeMode(state)) {
    handleBedSiegeBoardClick(hex);
    return;
  }

  const targetCell = getCellAt(state, hex);
  if (canPigDestroyCell(state, hex, targetCell)) {
    saveHistory();
    const removed = removeStone(state, hex, { ignoreChaosShield: true });
    rebuildPanicZones(state);
    const destroyedLabel = isRiftBloomGhostCell(removed) ? "rift ghost" : "stone";
    pushLog(`Player ${state.turnPlayer} destroyed a ${destroyedLabel} at (${hex.q}, ${hex.r}).`);
    finishSubmove(state);
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

  if (usesPigMode(state) && getPigTrapWinner(state) && checkForWinner(state)) {
    updateStatus();
    syncClockTickerFromState();
    render();
    broadcastOnlineState();
    return;
  }

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

function canUseArmoryControls(state = game.state) {
  if (!state || !usesArmoryMode(state) || state.winner) {
    return false;
  }
  if (isBrowsingHistory()) {
    return false;
  }
  if (!canActForCurrentTurn()) {
    return false;
  }
  if (hasEgyptianRemovalPhase(state) || state.duckPhase || hasChaosPendingVote(state)) {
    return false;
  }
  return true;
}

function getArmoryInventoryCount(state, owner, pieceType) {
  if (!usesArmoryMode(state)) {
    return pieceType === "militia" ? 9999 : 0;
  }
  const armory = ensureArmoryState(state);
  return pieceType === "militia"
    ? 9999
    : Math.max(0, Math.round(Number(armory.inventory?.[owner]?.[pieceType]) || 0));
}

function getArmorySelectedPiece(state, owner) {
  if (!usesArmoryMode(state)) {
    return "militia";
  }
  const armory = ensureArmoryState(state);
  const selected = String(armory.selectedPiece?.[owner] || "militia");
  return ARMORY_PIECE_DEFS[selected] ? selected : "militia";
}

function refreshArmoryClassInputsFromState() {
  const state = game.state;
  const playerCount = state ? getPlayerCount(state) : getPlayerCountFromModeKeys(getSelectedModeKeys());
  const inputSelections = getArmoryClassSelectionsFromInputs(playerCount);
  for (let player = 1; player <= MAX_PLAYER_COUNT; player += 1) {
    const select = getArmoryClassSelectForPlayer(player);
    const wrap = getArmoryClassWrapForPlayer(player);
    if (wrap) {
      wrap.hidden = player > playerCount;
    }
    if (!select) {
      continue;
    }
    if (!state || !usesArmoryMode(state)) {
      select.value = inputSelections[player] || ARMORY_DEFAULT_CLASS;
      continue;
    }
    const armory = ensureArmoryState(state);
    select.value = normaliseArmoryClassKey(armory.classes[player]);
  }
}

function selectArmoryPieceForCurrentPlayer(pieceType) {
  const state = game.state;
  if (!canUseArmoryControls(state)) {
    return;
  }
  const owner = state.turnPlayer;
  const safePiece = ARMORY_PIECE_DEFS[pieceType] ? pieceType : "militia";
  if (safePiece !== "militia" && getArmoryInventoryCount(state, owner, safePiece) <= 0) {
    return;
  }
  saveHistory();
  const armory = ensureArmoryState(state);
  armory.selectedPiece[owner] = safePiece;
  pushLog(`Player ${owner} selected ${getArmoryPieceDef(safePiece).name}.`);
  updateStatus();
  render();
  broadcastOnlineState();
}

function buyArmoryOfferForCurrentPlayer(slotIndex) {
  const state = game.state;
  if (!canUseArmoryControls(state)) {
    return;
  }
  const owner = state.turnPlayer;
  const armory = ensureArmoryState(state);
  const offers = armory.shopOffers[owner] || [];
  const index = Math.max(0, Math.min(offers.length - 1, Math.trunc(Number(slotIndex) || 0)));
  const pieceType = offers[index];
  if (!ARMORY_SHOP_POOL.includes(pieceType)) {
    return;
  }
  if (!canAffordArmoryPiece(state, owner, pieceType)) {
    return;
  }

  saveHistory();
  const cost = getArmoryPieceCost(state, owner, pieceType);
  spendArmoryCurrency(state, owner, cost);
  armory.inventory[owner][pieceType] += 1;
  armory.selectedPiece[owner] = pieceType;
  armory.shopOffers[owner] = generateArmoryShopOffers(state, armory, owner);
  pushLog(`Player ${owner} bought ${getArmoryPieceDef(pieceType).name} for ${cost.gold}g/${cost.arcana}a.`);
  updateStatus();
  render();
  broadcastOnlineState();
}

function rerollArmoryShopForCurrentPlayer() {
  const state = game.state;
  if (!canUseArmoryControls(state)) {
    return;
  }
  const owner = state.turnPlayer;
  const armory = ensureArmoryState(state);
  const wallet = armory.currencies[owner];
  if (wallet.gold < ARMORY_REROLL_GOLD_COST) {
    return;
  }

  saveHistory();
  wallet.gold -= ARMORY_REROLL_GOLD_COST;
  armory.rerolls[owner] += 1;
  refreshArmoryShopForOwner(state, owner);
  pushLog(`Player ${owner} rerolled the shop (-${ARMORY_REROLL_GOLD_COST}g).`);
  updateStatus();
  render();
  broadcastOnlineState();
}

function formatArmoryPlayerSummary(armory, player) {
  return `P${player} ${ARMORY_CLASS_DEFS[armory.classes[player]].name}`;
}

function formatArmoryWalletSummary(armory, player) {
  const wallet = armory.currencies[player];
  return `P${player} ${wallet.gold}g/${wallet.arcana}a`;
}

function renderArmoryPanel() {
  if (!ui.armoryControls) {
    return;
  }
  const state = game.state;
  if (!state || !usesArmoryMode(state)) {
    ui.armoryControls.hidden = true;
    refreshArmoryClassInputsFromState();
    return;
  }
  ui.armoryControls.hidden = false;
  const armory = ensureArmoryState(state);
  const activeOwner = state.turnPlayer;
  const canControl = canUseArmoryControls(state);
  const players = getPlayerNumbers(state);

  refreshArmoryClassInputsFromState();
  for (const player of players) {
    const select = getArmoryClassSelectForPlayer(player);
    if (select) {
      select.disabled = !canUseAdminControls() || state.openingMoveDone;
    }
  }

  if (ui.armorySummaryText) {
    ui.armorySummaryText.textContent = players.map((player) => formatArmoryPlayerSummary(armory, player)).join(" | ");
  }
  if (ui.armoryCurrencyText) {
    ui.armoryCurrencyText.textContent = players.map((player) => formatArmoryWalletSummary(armory, player)).join(" | ");
  }
  if (ui.armoryActiveClassText) {
    const selectedPiece = getArmorySelectedPiece(state, activeOwner);
    ui.armoryActiveClassText.textContent = `Active: Player ${activeOwner} ${ARMORY_CLASS_DEFS[armory.classes[activeOwner]].name} | Piece: ${getArmoryPieceDef(selectedPiece).name}`;
  }

  if (ui.armoryPieceSelect) {
    ui.armoryPieceSelect.innerHTML = "";
    for (const pieceType of ARMORY_PIECE_ORDER) {
      const count = getArmoryInventoryCount(state, activeOwner, pieceType);
      if (pieceType !== "militia" && count <= 0) {
        continue;
      }
      const pieceDef = getArmoryPieceDef(pieceType);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "modeToggle";
      if (getArmorySelectedPiece(state, activeOwner) === pieceType) {
        button.classList.add("active");
      }
      const countText = pieceType === "militia" ? "inf" : String(count);
      button.textContent = `${pieceDef.symbol} ${pieceDef.name} (${countText})`;
      button.disabled = !canControl;
      button.title = pieceDef.description;
      button.addEventListener("click", () => {
        selectArmoryPieceForCurrentPlayer(pieceType);
      });
      ui.armoryPieceSelect.appendChild(button);
    }
  }

  if (ui.armoryShopOffers) {
    ui.armoryShopOffers.innerHTML = "";
    const offers = armory.shopOffers[activeOwner] || [];
    for (let i = 0; i < offers.length; i += 1) {
      const pieceType = offers[i];
      const pieceDef = getArmoryPieceDef(pieceType);
      const cost = getArmoryPieceCost(state, activeOwner, pieceType);
      const owned = getArmoryInventoryCount(state, activeOwner, pieceType);
      const canBuy = canControl && canAffordArmoryPiece(state, activeOwner, pieceType);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `modeToggle${canBuy ? " active" : ""}`;
      button.textContent = `${pieceDef.symbol} ${pieceDef.name} ${cost.gold}g/${cost.arcana}a | ${owned}`;
      button.disabled = !canBuy;
      button.title = pieceDef.description;
      button.addEventListener("click", () => {
        buyArmoryOfferForCurrentPlayer(i);
      });
      ui.armoryShopOffers.appendChild(button);
    }
  }

  if (ui.armoryRerollBtn) {
    const rerollEnabled = canControl && armory.currencies[activeOwner].gold >= ARMORY_REROLL_GOLD_COST;
    ui.armoryRerollBtn.disabled = !rerollEnabled;
    ui.armoryRerollBtn.textContent = `Reroll Shop (-${ARMORY_REROLL_GOLD_COST}g)`;
  }
}

function canUseBedSiegeControls(state = game.state) {
  if (!state || !usesBedSiegeMode(state) || state.winner) {
    return false;
  }
  if (isBrowsingHistory() || !canActForCurrentTurn()) {
    return false;
  }
  if (hasEgyptianRemovalPhase(state) || state.duckPhase || hasChaosPendingVote(state)) {
    return false;
  }
  return canBedSiegePlayerAct(state, state.turnPlayer);
}

function selectBedSiegeItemForCurrentPlayer(itemKey) {
  const state = game.state;
  if (!canUseBedSiegeControls(state) || !BED_SIEGE_ITEM_DEFS[itemKey]) {
    return;
  }
  const owner = state.turnPlayer;
  if (getBedSiegeInventoryCount(state, owner, itemKey) <= 0) {
    return;
  }
  saveHistory();
  const bedSiege = ensureBedSiegeState(state);
  bedSiege.selectedItem[owner] = itemKey;
  pushLog(`Player ${owner} readied ${getBedSiegeItemDef(itemKey).name}.`);
  updateStatus();
  render();
  broadcastOnlineState();
}

function buyBedSiegeShopItemForCurrentPlayer(itemKey) {
  const state = game.state;
  if (!canUseBedSiegeControls(state) || !BED_SIEGE_ITEM_DEFS[itemKey]) {
    return;
  }
  const owner = state.turnPlayer;
  if (!canAffordBedSiegeItem(state, owner, itemKey)) {
    return;
  }
  const itemDef = getBedSiegeItemDef(itemKey);
  saveHistory();
  spendBedSiegeResources(state, owner, itemDef.cost);
  addBedSiegeInventoryItem(state, owner, itemKey, itemDef.bundle || 1);
  const bedSiege = ensureBedSiegeState(state);
  if (itemDef.category !== "tool") {
    bedSiege.selectedItem[owner] = itemKey;
  }
  pushLog(`Player ${owner} bought ${itemDef.name} x${itemDef.bundle || 1} for ${formatBedSiegeCost(itemDef.cost)}.`);
  updateStatus();
  render();
  broadcastOnlineState();
}

function renderBedSiegePanel() {
  if (!ui.bedSiegeControls) {
    return;
  }
  const state = game.state;
  if (!state || !usesBedSiegeMode(state)) {
    ui.bedSiegeControls.hidden = true;
    return;
  }

  ui.bedSiegeControls.hidden = false;
  const bedSiege = ensureBedSiegeState(state);
  const activeOwner = state.turnPlayer;
  const canControl = canUseBedSiegeControls(state);
  const selectedItem = getBedSiegeSelectedItem(state, activeOwner);

  if (ui.bedSiegeSummaryText) {
    ui.bedSiegeSummaryText.textContent = getBedSiegeSummary(state);
  }
  if (ui.bedSiegeResourceText) {
    ui.bedSiegeResourceText.textContent = getBedSiegeResourceSummary(state);
  }
  if (ui.bedSiegeActiveItemText) {
    const itemDef = getBedSiegeItemDef(selectedItem);
    ui.bedSiegeActiveItemText.textContent = `Active: Player ${activeOwner} | ${itemDef.name}`;
  }

  if (ui.bedSiegeInventory) {
    ui.bedSiegeInventory.innerHTML = "";
    for (const itemKey of BED_SIEGE_ITEM_ORDER) {
      const itemDef = getBedSiegeItemDef(itemKey);
      const count = getBedSiegeInventoryCount(state, activeOwner, itemKey);
      if (count <= 0) {
        continue;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "modeToggle";
      if (selectedItem === itemKey) {
        button.classList.add("active");
      }
      button.textContent = `${itemDef.symbol} ${itemDef.name} (${count})`;
      button.disabled = !canControl;
      button.title = itemDef.description;
      button.addEventListener("click", () => {
        selectBedSiegeItemForCurrentPlayer(itemKey);
      });
      ui.bedSiegeInventory.appendChild(button);
    }
  }

  if (ui.bedSiegeShop) {
    ui.bedSiegeShop.innerHTML = "";
    for (const itemKey of BED_SIEGE_SHOP_ORDER) {
      const itemDef = getBedSiegeItemDef(itemKey);
      const canBuy = canControl && canAffordBedSiegeItem(state, activeOwner, itemKey);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `modeToggle${canBuy ? " active" : ""}`;
      button.textContent = `${itemDef.symbol} ${itemDef.name} x${itemDef.bundle || 1} | ${formatBedSiegeCost(itemDef.cost)}`;
      button.disabled = !canBuy;
      button.title = itemDef.description;
      button.addEventListener("click", () => {
        buyBedSiegeShopItemForCurrentPlayer(itemKey);
      });
      ui.bedSiegeShop.appendChild(button);
    }
  }
}

function canUseFactoryControls(state = game.state) {
  if (!state || !usesFactoryMode(state) || state.winner) {
    return false;
  }
  if (isBrowsingHistory() || !canActForCurrentTurn()) {
    return false;
  }
  if (hasEgyptianRemovalPhase(state) || state.duckPhase || hasChaosPendingVote(state)) {
    return false;
  }
  return canFactoryPlayerAct(state, state.turnPlayer);
}

function selectFactoryActionForCurrentPlayer(actionKey) {
  const state = game.state;
  if (!canUseFactoryControls(state) || !FACTORY_COMMAND_DEFS[actionKey]) {
    return;
  }
  const owner = state.turnPlayer;
  const factory = ensureFactoryState(state);
  const nextAction = normaliseFactoryAction(actionKey);
  if (factory.selectedAction[owner] === nextAction) {
    return;
  }
  saveHistory();
  factory.selectedAction[owner] = nextAction;
  updateStatus();
  render();
  broadcastOnlineState();
}

function renderFactoryCommandButtons(container, actionKeys, selectedAction, canControl, state, owner) {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  for (const actionKey of actionKeys) {
    const actionDef = getFactoryCommandDef(actionKey);
    const canAfford = canAffordFactoryCost(state, owner, actionDef.cost || {});
    const button = document.createElement("button");
    button.type = "button";
    button.className = `modeToggle${selectedAction === actionKey ? " active" : ""}`;
    button.textContent = `${actionDef.symbol} ${actionDef.name} | ${formatFactoryCost(actionDef.cost)}`;
    button.disabled = !canControl || !canAfford;
    button.title = actionDef.description;
    button.addEventListener("click", () => {
      selectFactoryActionForCurrentPlayer(actionKey);
    });
    container.appendChild(button);
  }
}

function renderFactoryPanel() {
  if (!ui.factoryControls) {
    return;
  }
  const state = game.state;
  if (!state || !usesFactoryMode(state)) {
    ui.factoryControls.hidden = true;
    return;
  }

  ui.factoryControls.hidden = false;
  const factory = ensureFactoryState(state);
  const owner = state.turnPlayer;
  const selectedAction = getFactorySelectedAction(state, owner);
  const actionDef = getFactoryCommandDef(selectedAction);
  const canControl = canUseFactoryControls(state);

  if (ui.factorySummaryText) {
    ui.factorySummaryText.textContent = getFactoryScoreSummary(state);
  }
  if (ui.factoryActiveActionText) {
    const wallet = factory.resources[owner];
    const report = factory.lastReport?.[owner];
    const reportText = report
      ? ` | last +${report.points}pt, ${report.controlled} controlled`
      : "";
    ui.factoryActiveActionText.textContent = `Active: Player ${owner} | ${actionDef.name} | ${wallet.points}pt${reportText}`;
  }
  if (ui.factoryRuleText) {
    ui.factoryRuleText.textContent = "Each base has two farther Ore nodes worth 1 each. One Flux node sits in the center and is worth 3. Most adjacent Miner strength controls a node; connected conveyors carry it home, but node income never exceeds 1 for Ore or 3 for Flux. Cannons shoot 4 spaces. Blast Charges detonate into adjacent enemy factories. Last core alive wins.";
  }

  renderFactoryCommandButtons(
    ui.factoryBuildSelect,
    FACTORY_COMMAND_GROUPS.build,
    selectedAction,
    canControl,
    state,
    owner
  );
  renderFactoryCommandButtons(
    ui.factoryActionSelect,
    FACTORY_COMMAND_GROUPS.attack,
    selectedAction,
    canControl,
    state,
    owner
  );
}

function renderEverythingBagelPanel() {
  if (!ui.bagelControls) {
    return;
  }
  const state = game.state;
  if (!state || !hasEverythingBagelMode(state)) {
    ui.bagelControls.hidden = true;
    return;
  }

  ui.bagelControls.hidden = false;
  const zones = getEverythingBagelZones(state);
  const receiptStats = getEverythingBagelReceiptStats(state);
  const portalCount = zones.portalPairs.length * 2;
  const zoneParts = [
    `${zones.redTape.length} red tape`,
    `${portalCount} portals`,
    `${zones.schmear.length} schmear`,
    `${zones.sesame.length} sesame`,
    `${zones.poppyStamps.length} poppy`,
    `${zones.deliQueue.length} queue`
  ];

  if (ui.bagelPhaseText) {
    ui.bagelPhaseText.textContent = `Static zones | Turn ${state.turnCount}`;
  }
  if (ui.bagelZoneText) {
    ui.bagelZoneText.textContent = zoneParts.join(" | ");
  }
  if (ui.bagelReceiptText) {
    ui.bagelReceiptText.textContent = `${receiptStats.pending} pending receipts | ${receiptStats.certified} certified | ${receiptStats.stamped} stamped`;
  }
  if (ui.bagelNextText) {
    ui.bagelNextText.textContent = `Next filing: ${getEverythingBagelNextDocketText(state)}`;
  }
}

function renderChaosPanel() {
  if (!ui.chaosControls) {
    return;
  }
  const state = game.state;
  if (!state || !usesChaosVoteMode(state)) {
    ui.chaosControls.hidden = true;
    return;
  }

  ui.chaosControls.hidden = false;
  const chaos = ensureChaosState(state);
  const pending = chaos?.pendingVote;
  const canChoose = canChooseChaosRule(state);

  if (ui.chaosVoteText) {
    if (pending) {
      ui.chaosVoteText.textContent = `Player ${pending.chooser} chooses the next rule.`;
    } else {
      const untilVote = CHAOS_VOTE_INTERVAL - positiveMod(state.turnCount, CHAOS_VOTE_INTERVAL);
      ui.chaosVoteText.textContent = `Next vote in ${untilVote} completed turn${untilVote === 1 ? "" : "s"}.`;
    }
  }

  if (ui.chaosVoteOptions) {
    ui.chaosVoteOptions.innerHTML = "";
    if (pending) {
      pending.choices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `modeToggle chaosVoteOption${canChoose ? " active" : ""}`;
        button.disabled = !canChoose;
        button.title = choice.description;

        const title = document.createElement("span");
        title.className = "chaosRuleTitle";
        title.textContent = choice.title;
        const meta = document.createElement("span");
        meta.className = "chaosRuleMeta";
        meta.textContent = choice.durationText;
        const description = document.createElement("span");
        description.className = "chaosRuleDescription";
        description.textContent = choice.description;

        button.appendChild(title);
        button.appendChild(meta);
        button.appendChild(description);
        button.addEventListener("click", () => chooseChaosRule(index));
        ui.chaosVoteOptions.appendChild(button);
      });
    }
  }

  if (ui.chaosActiveRules) {
    ui.chaosActiveRules.innerHTML = "";
    const activeRules = getChaosActiveRules(state);
    if (activeRules.length === 0) {
      const empty = document.createElement("div");
      empty.className = "small chaosEmpty";
      empty.textContent = "No active voted rules yet.";
      ui.chaosActiveRules.appendChild(empty);
    } else {
      for (const rule of activeRules) {
        const ruleDef = getChaosRuleDef(rule.id);
        const item = document.createElement("div");
        item.className = "chaosActiveRule";

        const title = document.createElement("div");
        title.className = "chaosActiveRuleTitle";
        title.textContent = `${ruleDef?.title || rule.title} | P${rule.owner} | ${rule.turnsLeft} left`;
        const description = document.createElement("div");
        description.className = "small chaosActiveRuleDescription";
        description.textContent = ruleDef?.description || rule.description || "";

        item.appendChild(title);
        item.appendChild(description);
        ui.chaosActiveRules.appendChild(item);
      }
    }
  }
}

function updateStatus() {
  const state = game.state;
  ensureClockState(state);
  if (!hasPendingModeSelection(state) && game.modeUiSignature !== modeKeySignature(state.modeKeys)) {
    setModeUI(state.modeKeys);
  }

  const displayPlayer = state.winner || state.turnPlayer;
  ui.turnBig.textContent = state.winner ? `Player ${state.winner} wins` : `Player ${state.turnPlayer}`;
  ui.turnBig.className = `turnBig playerP${normalisePlayerNumber(displayPlayer, getPlayerCount(state))}`;
  if (ui.boardWrap) {
    const turnPlayer = normalisePlayerNumber(displayPlayer, getPlayerCount(state));
    ui.boardWrap.classList.remove("turnP1", "turnP2", "turnP3", "turnP4");
    ui.boardWrap.classList.add(`turnP${turnPlayer}`);
  }
  ui.roundText.textContent = String(state.round);
  ui.movesLeftText.textContent = String(state.movesLeftInTurn);
  ui.duckPhaseText.textContent = state.duckPhase ? "Yes" : "No";
  ui.winnerText.textContent = state.winner ? `Player ${state.winner}` : "None";

  if (isBrowsingHistory()) {
    ui.subturnText.textContent = "Timeline view: browsing previous board states (Back/Forward).";
  } else if (!state.openingMoveDone) {
    const openingPlacements = Math.max(1, Number(state.movesLeftInTurn) || getOpeningPlacementsPerTurn(state));
    const placementText = `${openingPlacements} placement${openingPlacements === 1 ? "" : "s"}`;
    ui.subturnText.textContent = usesPigMode(state)
      ? `Opening move: the pig blocks the origin | ${placementText}`
      : `Opening move: ${placementText}`;
  } else if (hasEgyptianRemovalPhase(state)) {
    const owner = state.egyptianRemoval.owner;
    const remaining = state.egyptianRemoval.remaining;
    ui.subturnText.textContent = `Egyptian: Player ${owner} choose ${remaining} stone${remaining === 1 ? "" : "s"} to remove (not the one just placed)`;
  } else if (state.duckPhase) {
    ui.subturnText.textContent = getBirdActionPrompt(state.currentBirdMoveKind);
  } else if (hasChaosPendingVote(state)) {
    const pending = ensureChaosState(state)?.pendingVote;
    ui.subturnText.textContent = `Rule Vote: Player ${pending?.chooser || state.turnPlayer} choose one of ${pending?.choices?.length || 3} rules`;
  } else {
    ui.subturnText.textContent = `${state.movesLeftInTurn} placement${state.movesLeftInTurn === 1 ? "" : "s"} left this turn`;
  }

  if (usesArmoryMode(state)) {
    const armory = ensureArmoryState(state);
    const owner = state.turnPlayer;
    const selectedPiece = getArmorySelectedPiece(state, owner);
    const pieceDef = getArmoryPieceDef(selectedPiece);
    ui.subturnText.textContent += ` | ${armory.currencies[owner].gold}g/${armory.currencies[owner].arcana}a | ${pieceDef.name}`;
  }
  if (usesBedSiegeMode(state)) {
    const bedSiege = ensureBedSiegeState(state);
    const owner = state.turnPlayer;
    const itemDef = getBedSiegeItemDef(getBedSiegeSelectedItem(state, owner));
    const wallet = bedSiege.resources[owner];
    ui.subturnText.textContent += ` | ${wallet.iron}i/${wallet.gold}g/${wallet.diamond}d/${wallet.emerald}e | ${itemDef.name} | ${getBedSiegeSummary(state)}`;
  }
  if (usesFactoryMode(state)) {
    ensureFactoryState(state);
    if (state.winner) {
      ui.subturnText.textContent = `Foundry War complete | ${getFactoryScoreSummary(state)}`;
    } else if (!isBrowsingHistory()) {
      ui.subturnText.textContent = `${state.movesLeftInTurn} factory action${state.movesLeftInTurn === 1 ? "" : "s"} left | ${getFactoryPlayerSummary(state, state.turnPlayer)} | ${getFactoryScoreSummary(state)}`;
    }
  }
  if (hasEverythingBagelMode(state) && !state.winner) {
    const receiptStats = getEverythingBagelReceiptStats(state);
    ui.subturnText.textContent += ` | Bagel phase ${positiveMod(state.turnCount, 12)} | ${receiptStats.pending} receipts`;
  }
  if (usesPowderMode(state) && !state.winner) {
    const powder = ensurePowderState(state);
    const settled = powder.grains.filter((grain) => grain.settled).length;
    refreshPowderControl(state);
    const contested = Object.values(powder.cellStats || {}).filter((stat) => (
      !stat.controlled && stat.leader && stat.bestCount >= POWDER_NEAR_CLAIM_GRAINS
    )).length;
    const movedText = powder.lastReport?.moved ? `, ${powder.lastReport.moved} steps` : "";
    ui.subturnText.textContent += ` | Powder ${settled}/${powder.grains.length} settled | ${getPowderClaimSummary(state)} claimed, ${contested} contested${movedText}`;
  }
  if (usesRiftBloomMode(state) && !state.winner) {
    const ghostCount = getRiftBloomGhostEntries(state).length;
    const activeLabel = isRiftBloomActiveCell(state, game.hoverHex) ? "live hover" : "rift cells live";
    const coverageStep = getRiftBloomCellModulus(state);
    const claimLabel = usesRiftBloomContestClaim(state) ? "majority claim" : "anchor";
    ui.subturnText.textContent += ` | Rift ${ghostCount} ghost${ghostCount === 1 ? "" : "s"} | ${getRiftBloomGhostTurns(state)}t | 1/${coverageStep} ${activeLabel} | ${claimLabel}`;
  }
  if (usesPigMode(state) && !state.winner) {
    const pigHex = getPigHex(state);
    const pigMoves = getPigLegalMoves(state).length;
    const pig = ensurePigState(state);
    const pigReaction = !pig || pig.reactionsThisTurn <= 0
      ? "ready"
      : (pig.reactionsThisTurn >= PIG_MAX_REACTIONS_PER_TURN
        ? "settled"
        : (pigMoves >= PIG_STARTLE_MIN_ESCAPE_OPTIONS ? "wary" : "cornered"));
    ui.subturnText.textContent += pigHex
      ? ` | Pig (${pigHex.q}, ${pigHex.r}) | ${pigReaction} | ${pigMoves} escape${pigMoves === 1 ? "" : "s"}`
      : " | Pig loose";
  }
  if (usesChaosVoteMode(state) && !state.winner && !hasChaosPendingVote(state)) {
    const untilVote = CHAOS_VOTE_INTERVAL - positiveMod(state.turnCount, CHAOS_VOTE_INTERVAL);
    ui.subturnText.textContent += ` | Rule vote in ${untilVote}`;
  }
  if (usesPigMode(state) && !usesBedSiegeMode(state) && !usesFactoryMode(state)) {
    ui.subturnText.textContent += " | Trap the pig";
  } else if (!usesBedSiegeMode(state) && !usesFactoryMode(state)) {
    ui.subturnText.textContent += ` | Connect ${getWinLength(state)}`;
  }

  updateClockUI();
  updateTurnOrderSummary(getPlayerCount(state));
  renderLog();
  updateOnlineStatusUI();
  renderArmoryPanel();
  renderBedSiegePanel();
  renderFactoryPanel();
  renderEverythingBagelPanel();
  renderChaosPanel();
}

function resizeCanvas() {
  const dpr = getEffectiveCanvasDevicePixelRatio();
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

function drawTriangleLatticeGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = params.drawStep;
  const showPlacementHints = params.showPlacementHints;
  const gridStroke = "rgba(255, 255, 255, 0.11)";
  const gridFill = "rgba(255, 255, 255, 0.03)";
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

      ({ fill, stroke } = applyRiftBloomGridStyle(game.state, hex, fill, stroke, false));

      if (showPlacementHints && !isLegalPlacement(game.state, hex)) {
        ({ fill, stroke } = applyRiftBloomGridStyle(game.state, hex, "rgba(255, 255, 255, 0.012)", null, true));
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

function drawRadialLatticeGrid(params) {
  const size = params.size;
  const w = params.w;
  const h = params.h;
  const bounds = params.bounds;
  const drawStep = params.drawStep;
  const showPlacementHints = params.showPlacementHints;

  const margin = getRadialRingPitch(size) * 1.2;
  const gridStroke = "rgba(255, 255, 255, 0.09)";
  const gridFill = "rgba(255, 255, 255, 0.026)";
  let hoverDrawn = false;

  for (let ring = bounds.minQ; ring <= bounds.maxQ; ring += drawStep) {
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

      ({ fill, stroke } = applyRiftBloomGridStyle(game.state, hex, fill, stroke, false));

      if (showPlacementHints && !isLegalPlacement(game.state, hex)) {
        ({ fill, stroke } = applyRiftBloomGridStyle(game.state, hex, "rgba(255, 255, 255, 0.012)", null, true));
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

function drawPowderFloorGuide(size, w, h) {
  const floorWorldY = getPowderFloorWorldY() * getPowderRenderScale();
  const floorScreen = worldToScreen(0, floorWorldY);
  if (floorScreen.y < -size * 2 || floorScreen.y > h + size * 2) {
    return;
  }

  ctx.save();
  const y = floorScreen.y;
  const bandHeight = Math.max(8, size * 0.38);
  const gradient = ctx.createLinearGradient(0, y - bandHeight, 0, y + bandHeight * 2.2);
  gradient.addColorStop(0, "rgba(255, 215, 94, 0)");
  gradient.addColorStop(0.34, "rgba(255, 215, 94, 0.18)");
  gradient.addColorStop(1, "rgba(8, 12, 26, 0.46)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, y - bandHeight, w, bandHeight * 3.2);

  ctx.strokeStyle = "rgba(255, 246, 214, 0.78)";
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 215, 94, 0.30)";
  ctx.lineWidth = Math.max(1, size * 0.035);
  ctx.setLineDash([Math.max(8, size * 0.5), Math.max(7, size * 0.42)]);
  ctx.beginPath();
  ctx.moveTo(0, y + bandHeight * 0.85);
  ctx.lineTo(w, y + bandHeight * 0.85);
  ctx.stroke();
  ctx.restore();
}

function drawPowderHoverGuide(size, w, h) {
  const hoverWorld = boardCellToPixel(game.hoverHex, size, game.state);
  const hoverScreen = worldToScreen(hoverWorld.x, hoverWorld.y);
  if (hoverScreen.x < -size * 2 || hoverScreen.y < -size * 2 || hoverScreen.x > w + size * 2 || hoverScreen.y > h + size * 2) {
    return;
  }

  const legal = isLegalPlacement(game.state, game.hoverHex);
  drawBoardShape(
    hoverScreen.x,
    hoverScreen.y,
    size * 0.72,
    legal ? "rgba(255, 215, 94, 0.13)" : "rgba(255, 74, 93, 0.08)",
    legal ? "rgba(255, 246, 214, 0.42)" : "rgba(255, 111, 97, 0.32)",
    legal ? 1.6 : 1.2,
    game.hoverHex
  );
}

function drawGrid() {
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (usesPowderMode(game.state)) {
    drawPowderFloorGuide(size, w, h);
    drawPowderHoverGuide(size, w, h);
    return;
  }
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
        marginCells: 2
      })
    : octagonMode
      ? getOctagonVisibleCellBounds({
        width: w,
        height: h,
        offsetX: game.viewport.offsetX,
        offsetY: game.viewport.offsetY,
        hexSize: size,
        marginCells: 2
      })
    : squareMode
      ? getSquareVisibleCellBounds({
        width: w,
        height: h,
        offsetX: game.viewport.offsetX,
        offsetY: game.viewport.offsetY,
        hexSize: size,
        marginCells: 2
      })
    : getVisibleBounds({
      width: w,
      height: h,
      offsetX: game.viewport.offsetX,
      offsetY: game.viewport.offsetY,
      hexSize: size,
      marginHexes: 2
    });
  const drawStep = getGridDrawStep(size);
  const showPlacementHints = canDrawPlacementHints(game.state, size);

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

  const gridStroke = "rgba(255, 255, 255, 0.08)";
  const gridFill = "rgba(255, 255, 255, 0.025)";
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

      ({ fill, stroke } = applyRiftBloomGridStyle(game.state, hex, fill, stroke, false));

      if (showPlacementHints && !isLegalPlacement(game.state, hex)) {
        ({ fill, stroke } = applyRiftBloomGridStyle(game.state, hex, fill, null, true));
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
  if (usesFactoryMode(game.state)) {
    return;
  }
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

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function drawFactoryFlowPath(path, owner, size, now, animate = true) {
  if (!Array.isArray(path) || path.length < 2) {
    return;
  }
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const points = path.map((hex) => {
    const world = boardCellToPixel(hex, size, game.state);
    return { ...worldToScreen(world.x, world.y), hex };
  });
  if (!points.some((point) => isOnScreenWithMargin(point, size * 2, w, h))) {
    return;
  }

  const style = getPlayerStyle(owner);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([Math.max(4, size * 0.20), Math.max(4, size * 0.20)]);
  ctx.lineDashOffset = animate ? -now / 70 : 0;
  ctx.strokeStyle = style.strongStroke;
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);

  const segments = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    if (length <= 0) {
      continue;
    }
    segments.push({ from, to, length });
    totalLength += length;
  }
  if (animate && totalLength > 0) {
    const travel = ((now / 900) % 1) * totalLength;
    let cursor = 0;
    for (const segment of segments) {
      if (cursor + segment.length >= travel) {
        const t = (travel - cursor) / segment.length;
        const x = segment.from.x + (segment.to.x - segment.from.x) * t;
        const y = segment.from.y + (segment.to.y - segment.from.y) * t;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.shadowColor = style.strongStroke;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2.2, size * 0.12), 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      cursor += segment.length;
    }
  }
  ctx.restore();
}

function drawFactoryOverlay() {
  if (!usesFactoryMode(game.state)) {
    return;
  }
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const deposits = getFactoryDepositDefinitions(game.state);
  const now = window.performance?.now ? window.performance.now() : Date.now();
  const deliveryByDeposit = new Map();
  const detailLevel = getPerformanceModeLevel();
  const animateFactory = detailLevel === 0;
  const showFactoryRoutes = detailLevel < 2;

  ctx.save();
  for (const owner of getPlayerNumbers(game.state)) {
    const connected = getFactoryConnectedKeySet(game.state, owner);
    const style = getPlayerStyle(owner);
    for (const delivery of getFactoryDeliveryInfosForOwner(game.state, owner)) {
      deliveryByDeposit.set(delivery.deposit.id, delivery);
    }
    if (!showFactoryRoutes) {
      continue;
    }
    ctx.strokeStyle = style.echoStroke;
    ctx.lineWidth = Math.max(1.2, size * 0.08);
    ctx.lineCap = "round";
    ctx.setLineDash([Math.max(4, size * 0.24), Math.max(4, size * 0.22)]);
    ctx.lineDashOffset = animateFactory ? -now / 85 : 0;
    for (const key of connected) {
      const from = parseKey(key);
      const fromWorld = boardCellToPixel(from, size, game.state);
      const fromScreen = worldToScreen(fromWorld.x, fromWorld.y);
      if (!isOnScreenWithMargin(fromScreen, size * 2, w, h)) {
        continue;
      }
      for (const next of getAdjacentsForMode(game.state, from)) {
        const nextKey = keyOf(next.q, next.r);
        if (!connected.has(nextKey) || nextKey <= key) {
          continue;
        }
        const nextWorld = boardCellToPixel(next, size, game.state);
        const nextScreen = worldToScreen(nextWorld.x, nextWorld.y);
        ctx.beginPath();
        ctx.moveTo(fromScreen.x, fromScreen.y);
        ctx.lineTo(nextScreen.x, nextScreen.y);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  if (showFactoryRoutes) {
    for (const owner of getPlayerNumbers(game.state)) {
      for (const delivery of getFactoryDeliveryInfosForOwner(game.state, owner)) {
        drawFactoryFlowPath(delivery.path, owner, size, now, animateFactory);
      }
    }
  }

  for (const deposit of deposits) {
    const depositDef = getFactoryDepositDef(deposit.type);
    const control = getFactoryDepositControl(game.state, deposit);
    const delivery = deliveryByDeposit.get(deposit.id);
    const world = boardCellToPixel(deposit.hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }
    const pulse = animateFactory ? 0.5 + 0.5 * Math.sin(now / 520 + deposit.hex.q * 0.7 + deposit.hex.r * 0.45) : 0.35;
    const controllerStyle = control.controller ? getPlayerStyle(control.controller) : null;
    const stroke = controllerStyle ? controllerStyle.strongStroke : (control.tied ? "rgba(255, 215, 94, 0.82)" : depositDef.stroke);
    drawBoardShape(
      screen.x,
      screen.y,
      size * (deposit.type === "flux" ? 1.02 + pulse * 0.08 : 0.92 + pulse * 0.05),
      depositDef.fill,
      stroke,
      control.controller || control.tied ? 2.6 : 1.7,
      deposit.hex
    );
    drawBoardShape(
      screen.x,
      screen.y,
      size * 0.50,
      delivery ? "rgba(255, 255, 255, 0.14)" : "rgba(8, 12, 26, 0.42)",
      "rgba(255, 255, 255, 0.26)",
      1,
      deposit.hex
    );

    let pipIndex = 0;
    for (const owner of getPlayerNumbers(game.state)) {
      const strength = Math.min(6, control.strengthByOwner[owner] || 0);
      const ownerStyle = getPlayerStyle(owner);
      for (let i = 0; i < strength; i += 1) {
        const angle = -Math.PI / 2 + (pipIndex / 6) * Math.PI * 2;
        const x = screen.x + Math.cos(angle) * size * 0.72;
        const y = screen.y + Math.sin(angle) * size * 0.72;
        ctx.fillStyle = ownerStyle.hex;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, size * 0.07), 0, Math.PI * 2);
        ctx.fill();
        pipIndex += 1;
      }
    }

    ctx.fillStyle = "rgba(236, 242, 255, 0.92)";
    ctx.font = `${Math.max(9, Math.min(15, size * 0.42))}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(depositDef.symbol, screen.x, screen.y - size * 0.05);
    ctx.font = `${Math.max(7, Math.min(10, size * 0.26))}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = controllerStyle ? controllerStyle.echoText : "rgba(236, 242, 255, 0.72)";
    const label = delivery
      ? `+${delivery.value}pt`
      : (control.tied ? "tie" : (control.controller ? `P${control.controller}` : depositDef.name));
    ctx.fillText(label, screen.x, screen.y + size * 0.31);
  }
  ctx.restore();
}

function drawBedSiegeOverlay() {
  if (!usesBedSiegeMode(game.state)) {
    return;
  }
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.save();
  for (const owner of getPlayerNumbers(game.state)) {
    const style = getPlayerStyle(owner);
    for (const hex of getBedSiegeBaseIslandCellsForOwner(game.state, owner)) {
      const world = boardCellToPixel(hex, size, game.state);
      const screen = worldToScreen(world.x, world.y);
      if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
        continue;
      }
      drawBoardShape(
        screen.x,
        screen.y,
        size * 0.96,
        "rgba(255, 255, 255, 0.026)",
        style.strongStroke,
        0.9,
        hex
      );
    }

    const generatorHex = getBedSiegeBaseGeneratorHexForOwner(game.state, owner);
    const world = boardCellToPixel(generatorHex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x >= -size * 2 && screen.y >= -size * 2 && screen.x <= w + size * 2 && screen.y <= h + size * 2) {
      drawBoardShape(screen.x, screen.y, size * 0.78, "rgba(255, 215, 94, 0.14)", "rgba(255, 215, 94, 0.58)", 1.8, generatorHex);
      ctx.fillStyle = "rgba(255, 239, 191, 0.94)";
      ctx.font = `${Math.max(8, Math.min(13, size * 0.38))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GEN", screen.x, screen.y);
    }
  }

  for (const generator of getBedSiegeNeutralGenerators(game.state)) {
    const world = boardCellToPixel(generator.hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }
    const emerald = generator.type === "emerald";
    drawBoardShape(
      screen.x,
      screen.y,
      size * 0.9,
      emerald ? "rgba(118, 227, 168, 0.16)" : "rgba(109, 198, 255, 0.14)",
      emerald ? "rgba(118, 227, 168, 0.72)" : "rgba(109, 198, 255, 0.68)",
      2,
      generator.hex
    );
    ctx.fillStyle = "rgba(236, 242, 255, 0.92)";
    ctx.font = `${Math.max(9, Math.min(14, size * 0.42))}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emerald ? "EM" : "DI", screen.x, screen.y);
  }
  ctx.restore();
}

function getVisibleBoundsForCurrentGrid(size, w, h, marginCells = 2) {
  if (usesTriangleGridMode(game.state)) {
    return getTriangleVisibleCellBounds({
      width: w,
      height: h,
      offsetX: game.viewport.offsetX,
      offsetY: game.viewport.offsetY,
      hexSize: size,
      marginCells
    });
  }
  if (usesRadialGridMode(game.state)) {
    return getRadialVisibleCellBounds({
      width: w,
      height: h,
      offsetX: game.viewport.offsetX,
      offsetY: game.viewport.offsetY,
      hexSize: size,
      marginCells
    });
  }
  if (usesOctagonGridMode(game.state)) {
    return getOctagonVisibleCellBounds({
      width: w,
      height: h,
      offsetX: game.viewport.offsetX,
      offsetY: game.viewport.offsetY,
      hexSize: size,
      marginCells
    });
  }
  if (usesSquareGridMode(game.state)) {
    return getSquareVisibleCellBounds({
      width: w,
      height: h,
      offsetX: game.viewport.offsetX,
      offsetY: game.viewport.offsetY,
      hexSize: size,
      marginCells
    });
  }
  return getVisibleBounds({
    width: w,
    height: h,
    offsetX: game.viewport.offsetX,
    offsetY: game.viewport.offsetY,
    hexSize: size,
    marginHexes: marginCells
  });
}

function drawEverythingBagelOverlay() {
  if (!hasEverythingBagelMode(game.state)) {
    return;
  }
  const size = currentHexSize();
  const zones = getEverythingBagelZones(game.state);
  const showDetailText = canDrawDetailText(size);
  const overlayEntries = [
    ...zones.redTape.map((hex) => ({ hex, fill: "rgba(255, 74, 93, 0.18)", stroke: "rgba(255, 74, 93, 0.72)", text: "rgba(255, 231, 238, 0.92)", label: "RT", lineWidth: 2.1 })),
    ...zones.tollBooths.map((hex) => ({ hex, fill: "rgba(118, 227, 168, 0.13)", stroke: "rgba(118, 227, 168, 0.58)", text: "rgba(222, 255, 235, 0.92)", label: "+7", lineWidth: 1.7 })),
    ...zones.coupons.map((hex) => ({ hex, fill: "rgba(255, 215, 94, 0.14)", stroke: "rgba(255, 215, 94, 0.66)", text: "rgba(255, 247, 207, 0.95)", label: "CP", lineWidth: 1.7 })),
    ...zones.schmear.map((hex) => ({ hex, fill: "rgba(255, 232, 184, 0.12)", stroke: "rgba(255, 232, 184, 0.64)", text: "rgba(255, 245, 222, 0.94)", label: "SL", lineWidth: 1.8 })),
    ...zones.sesame.map((hex) => ({ hex, fill: "rgba(102, 212, 190, 0.12)", stroke: "rgba(102, 212, 190, 0.68)", text: "rgba(220, 255, 248, 0.94)", label: "SE", lineWidth: 1.8 })),
    ...zones.poppyStamps.map((hex) => ({ hex, fill: "rgba(255, 111, 177, 0.13)", stroke: "rgba(255, 111, 177, 0.70)", text: "rgba(255, 232, 244, 0.95)", label: "PS", lineWidth: 1.8 })),
    ...zones.deliQueue.map((hex, index) => ({ hex, fill: "rgba(109, 198, 255, 0.10)", stroke: "rgba(109, 198, 255, 0.58)", text: "rgba(225, 246, 255, 0.94)", label: `Q${index + 1}`, lineWidth: 1.6 }))
  ];

  function screenPointForBagelHex(hex) {
    const world = boardCellToPixel(hex, size, game.state);
    return worldToScreen(world.x, world.y);
  }

  for (const pair of zones.portalPairs) {
    const a = screenPointForBagelHex(pair.a);
    const b = screenPointForBagelHex(pair.b);
    ctx.save();
    ctx.setLineDash([size * 0.28, size * 0.18]);
    ctx.strokeStyle = "rgba(181, 137, 255, 0.42)";
    ctx.lineWidth = Math.max(1.2, size * 0.055);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();

    overlayEntries.push({ hex: pair.a, fill: "rgba(165, 107, 255, 0.14)", stroke: "rgba(181, 137, 255, 0.70)", text: "rgba(244, 237, 255, 0.95)", label: `P${pair.index + 1}`, lineWidth: 1.9 });
    overlayEntries.push({ hex: pair.b, fill: "rgba(165, 107, 255, 0.14)", stroke: "rgba(181, 137, 255, 0.70)", text: "rgba(244, 237, 255, 0.95)", label: `P${pair.index + 1}`, lineWidth: 1.9 });
  }

  if (zones.deliQueue.length > 1) {
    ctx.save();
    ctx.strokeStyle = "rgba(109, 198, 255, 0.34)";
    ctx.lineWidth = Math.max(1, size * 0.045);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    zones.deliQueue.forEach((hex, index) => {
      const screen = screenPointForBagelHex(hex);
      if (index === 0) {
        ctx.moveTo(screen.x, screen.y);
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
    });
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.font = `${Math.max(8, Math.min(13, size * 0.40))}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const entry of overlayEntries) {
    const screen = screenPointForBagelHex(entry.hex);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > canvas.clientWidth + size * 2 || screen.y > canvas.clientHeight + size * 2) {
      continue;
    }
    drawBoardShape(screen.x, screen.y, size * 0.96, entry.fill, entry.stroke, entry.lineWidth, entry.hex);
    if (showDetailText) {
      ctx.fillStyle = entry.text || "rgba(236, 242, 255, 0.86)";
      ctx.fillText(entry.label, screen.x, screen.y);
    }
  }
  ctx.restore();
}

function drawFactoryPiece(hex, cell, screen, size, connected) {
  const moduleType = getFactoryCellType(cell);
  const moduleDef = getFactoryModuleDef(moduleType);
  const ownerStyle = getPlayerStyle(cell.owner);
  const coreOwner = moduleType === "core" ? getFactoryCoreOwnerAt(game.state, hex) : 0;
  const core = coreOwner ? getFactoryCore(game.state, coreOwner) : null;
  const brokenCore = moduleType === "core" && core && !core.alive;
  const showDetailText = canDrawDetailText(size);

  ctx.save();
  ctx.globalAlpha = connected || moduleType === "core" ? 1 : 0.48;
  const outerFill = brokenCore ? "rgba(255, 74, 93, 0.18)" : ownerStyle.fill;
  const innerFill = brokenCore ? "rgba(80, 26, 38, 0.72)" : (moduleType === "core" ? ownerStyle.hex : moduleDef.fill);
  drawBoardShape(
    screen.x,
    screen.y,
    size * 0.86,
    outerFill,
    ownerStyle.strongStroke,
    moduleType === "core" ? 2.4 : 1.7,
    hex
  );
  drawBoardShape(
    screen.x,
    screen.y,
    size * (moduleType === "core" ? 0.56 : 0.50),
    innerFill,
    "rgba(255, 255, 255, 0.52)",
    1.2,
    hex
  );

  ctx.fillStyle = brokenCore ? "rgba(255, 231, 189, 0.95)" : "rgba(236, 242, 255, 0.95)";
  ctx.font = `${Math.max(9, Math.min(15, size * 0.44))}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(brokenCore ? "!" : moduleDef.symbol, screen.x, screen.y - (moduleType === "core" ? size * 0.07 : 0));

  if (showDetailText && moduleType === "miner") {
    const level = Math.max(1, Math.round(Number(cell.factoryLevel) || 1));
    const depositType = cell.factoryDepositType || getFactoryDepositAt(game.state, hex)?.type || "ore";
    const depositDef = getFactoryDepositDef(depositType);
    ctx.fillStyle = "rgba(6, 12, 23, 0.78)";
    ctx.font = `${Math.max(7, Math.min(10, size * 0.28))}px Inter, system-ui, sans-serif`;
    ctx.fillText(`${depositDef.symbol}x${level}`, screen.x, screen.y + size * 0.32);
  } else if (showDetailText && moduleType === "core" && core) {
    ctx.fillStyle = "rgba(6, 12, 23, 0.76)";
    ctx.font = `${Math.max(7, Math.min(10, size * 0.27))}px Inter, system-ui, sans-serif`;
    ctx.fillText(`${core.integrity}/${core.maxIntegrity}`, screen.x, screen.y + size * 0.30);
  } else if (showDetailText && Number(cell.factoryHp) > 0 && Number(cell.factoryHp) < getFactoryModuleMaxHp(cell)) {
    ctx.fillStyle = "rgba(255, 231, 189, 0.90)";
    ctx.font = `${Math.max(7, Math.min(10, size * 0.28))}px Inter, system-ui, sans-serif`;
    ctx.fillText(`${cell.factoryHp}/${getFactoryModuleMaxHp(cell)}`, screen.x, screen.y + size * 0.31);
  } else if (showDetailText && !connected) {
    ctx.fillStyle = "rgba(236, 242, 255, 0.76)";
    ctx.font = `${Math.max(7, Math.min(10, size * 0.28))}px Inter, system-ui, sans-serif`;
    ctx.fillText("OFF", screen.x, screen.y + size * 0.31);
  }
  ctx.restore();
}

function drawEchoTargets() {
  if (!hasMode(game.state, "echo") || usesExtremeLdmMode(game.state)) {
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
  if (usesExtremeLdmMode(state) || !canShowHoverEchoPreview(state)) {
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

function drawRiftBloomPreview() {
  const state = game.state;
  if (
    usesExtremeLdmMode(state)
    || !usesRiftBloomMode(state)
    || !canActForCurrentTurn()
    || isBrowsingHistory()
    || state.winner
    || state.duckPhase
    || hasEgyptianRemovalPhase(state)
    || hasChaosPendingVote(state)
    || !isLegalPlacement(state, game.hoverHex)
    || !isRiftBloomActiveCell(state, game.hoverHex)
  ) {
    return;
  }

  const target = getRiftBloomMirrorTarget(state, game.hoverHex);
  if (!target) {
    return;
  }

  const size = currentHexSize();
  if (size < 8) {
    return;
  }

  const fromWorld = boardCellToPixel(game.hoverHex, size, state);
  const toWorld = boardCellToPixel(target, size, state);
  const from = worldToScreen(fromWorld.x, fromWorld.y);
  const to = worldToScreen(toWorld.x, toWorld.y);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const fromVisible = isOnScreenWithMargin(from, size * 2, w, h);
  const toVisible = isOnScreenWithMargin(to, size * 2, w, h);
  if (!fromVisible && !toVisible) {
    return;
  }

  const targetCell = getCellAt(state, target);
  const canRefresh = isRiftBloomGhostCell(targetCell) && targetCell.owner === state.turnPlayer;
  const targetOpen = canRefresh || isRiftBloomGhostTargetOpen(state, target);
  const ownerStyle = getPlayerStyle(state.turnPlayer);

  ctx.save();
  ctx.setLineDash([Math.max(5, size * 0.24), Math.max(4, size * 0.18)]);
  ctx.strokeStyle = targetOpen ? "rgba(82, 238, 218, 0.58)" : "rgba(255, 111, 97, 0.46)";
  ctx.lineWidth = Math.max(1.2, size * 0.045);
  ctx.lineCap = "round";
  if (fromVisible || toVisible) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  ctx.restore();

  if (toVisible) {
    ctx.save();
    ctx.setLineDash([6, 4]);
    drawBoardShape(
      to.x,
      to.y,
      size * 0.72,
      targetOpen ? ownerStyle.fill : "rgba(255, 74, 93, 0.08)",
      targetOpen ? "rgba(82, 238, 218, 0.9)" : "rgba(255, 111, 97, 0.72)",
      2,
      target
    );
    ctx.restore();

    if (canDrawDetailText(size)) {
      ctx.fillStyle = targetOpen ? "rgba(218, 255, 249, 0.94)" : "rgba(255, 231, 238, 0.94)";
      ctx.font = `${Math.max(9, Math.min(13, size * 0.38))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(canRefresh ? "R" : (targetOpen ? "G" : "X"), to.x, to.y + 0.5);
    }
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
  if (usesExtremeLdmMode(game.state)) {
    return;
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
  if (!hasMode(game.state, "orbit") || usesLdmMode(game.state)) {
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
  if (!usesPanicBirdMode(game.state) || usesExtremeLdmMode(game.state)) {
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

function drawPigPiece(pigHex, size) {
  const world = boardCellToPixel(pigHex, size, game.state);
  const screen = worldToScreen(world.x, world.y);
  const trapped = Boolean(getPigTrapWinner(game.state));
  drawBoardShape(
    screen.x,
    screen.y,
    size * (trapped ? 0.9 : 0.8),
    trapped ? "rgba(255, 111, 177, 0.22)" : "rgba(255, 169, 194, 0.86)",
    trapped ? "rgba(255, 246, 214, 0.9)" : "rgba(255,255,255,0.62)",
    trapped ? 2.8 : 1.7,
    pigHex
  );
  ctx.fillStyle = "rgba(44, 20, 30, 0.88)";
  ctx.font = `${Math.max(12, size * 0.72)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u{1F416}", screen.x, screen.y + 1);
}

function drawPowderClaimedCells() {
  const powder = ensurePowderState(game.state);
  if (!powder) {
    return;
  }
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  refreshPowderControl(game.state);
  for (const [key, stat] of Object.entries(powder.cellStats || {})) {
    const owner = stat.controlled ? stat.owner : stat.leader;
    if (!owner || (!stat.controlled && stat.bestCount < POWDER_NEAR_CLAIM_GRAINS)) {
      continue;
    }
    const hex = parseKey(key);
    const world = boardCellToPixel(hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }
    const ownerStyle = getPlayerStyle(owner);
    const rgb = hexToRgb(ownerStyle.hex);
    const progress = Math.max(0, Math.min(1, stat.bestCount / POWDER_WIN_CELL_GRAINS));
    const fillAlpha = stat.controlled ? 0.20 : 0.045 + (progress * 0.075);
    const strokeAlpha = stat.controlled ? 0.68 : 0.16 + (progress * 0.22);
    drawBoardShape(
      screen.x,
      screen.y,
      size * (stat.controlled ? 0.86 : 0.74),
      rgbaFromRgb(rgb, fillAlpha),
      rgbaFromRgb(rgb, strokeAlpha),
      stat.controlled ? 1.8 : 1.15,
      hex
    );
  }
}

function drawPowderSources() {
  const powder = ensurePowderState(game.state);
  if (!powder) {
    return;
  }
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  for (const [key, source] of Object.entries(powder.sources || {})) {
    const hex = parseKey(key);
    const world = boardCellToPixel(hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }
    const ownerStyle = getPlayerStyle(source.owner);
    const rgb = hexToRgb(ownerStyle.hex);
    drawBoardShape(
      screen.x,
      screen.y,
      size * 0.58,
      rgbaFromRgb(rgb, 0.13),
      rgbaFromRgb(rgb, 0.62),
      1.5,
      hex
    );

    ctx.save();
    ctx.strokeStyle = rgbaFromRgb(rgb, 0.76);
    ctx.fillStyle = rgbaFromRgb(rgb, 0.88);
    ctx.lineWidth = Math.max(1.2, size * 0.035);
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y - size * 0.26);
    ctx.lineTo(screen.x, screen.y + size * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(screen.x, screen.y - size * 0.28, Math.max(2.2, size * 0.075), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPowderGrainShape(grain, screen, radius) {
  const ownerStyle = getPlayerStyle(grain.owner);
  const fill = grain.settled ? ownerStyle.hex : ownerStyle.fill;
  const stroke = grain.settled ? "rgba(255, 255, 255, 0.42)" : ownerStyle.stroke;
  const source = grain.source || { q: 0, r: 0 };

  if (usesTriangleGridMode(game.state)) {
    drawTriangle(screen.x, screen.y, radius * 1.55, fill, stroke, 1, source);
    return;
  }
  if (usesSquareGridMode(game.state)) {
    drawSquare(screen.x, screen.y, radius, fill, stroke, 1);
    return;
  }
  if (usesOctagonGridMode(game.state)) {
    if (isOctagonDiamondCoordinate(source)) {
      drawOctagonDiamond(screen.x, screen.y, radius * 1.45, fill, stroke, 1);
      return;
    }
    drawOctagon(screen.x, screen.y, radius * 1.35, fill, stroke, 1);
    return;
  }
  if (usesRadialGridMode(game.state)) {
    drawCircle(screen.x, screen.y, radius, fill, stroke, 1);
    return;
  }
  drawHex(screen.x, screen.y, radius * 1.35, fill, stroke, 1);
}

function drawPowderGrains() {
  if (!usesPowderMode(game.state)) {
    return;
  }
  const powder = ensurePowderState(game.state);
  if (!powder) {
    return;
  }
  drawPowderClaimedCells();
  drawPowderSources();

  if (powder.grains.length === 0) {
    return;
  }

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const scale = getPowderRenderScale();
  const radius = Math.max(1.6, POWDER_GRAIN_RADIUS * scale);
  const margin = radius * 3;
  const drawLimit = usesExtremeLdmMode() ? 900 : powder.grains.length;
  const stride = powder.grains.length > drawLimit ? Math.ceil(powder.grains.length / drawLimit) : 1;

  for (let index = 0; index < powder.grains.length; index += stride) {
    const grain = powder.grains[index];
    const screen = powderWorldToScreen(grain.x, grain.y);
    if (screen.x < -margin || screen.y < -margin || screen.x > w + margin || screen.y > h + margin) {
      continue;
    }
    drawPowderGrainShape(grain, screen, radius);
  }
}

function drawPieces() {
  const size = currentHexSize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const detailLevel = getPerformanceModeLevel();
  const showRecentHighlights = detailLevel < 2;
  const showEventHighlights = detailLevel < 2;
  const showInnerDots = detailLevel < 2;
  const showDetailText = canDrawDetailText(size);
  const recentSerials = showRecentHighlights ? getRecentSerials(game.state.cells) : [];
  const recentSerialSet = new Set(recentSerials);
  const newestSerial = recentSerials[0];
  const factoryConnectedByOwner = usesFactoryMode(game.state)
    ? createPlayerMap(getPlayerCount(game.state), (owner) => getFactoryConnectedKeySet(game.state, owner))
    : null;

  for (const [key, cell] of Object.entries(game.state.cells)) {
    const hex = parseKey(key);
    const world = boardCellToPixel(hex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2) {
      continue;
    }

    if (usesFactoryMode(game.state) && isFactoryCell(cell)) {
      const connected = Boolean(factoryConnectedByOwner?.[cell.owner]?.has(key));
      if (showRecentHighlights && recentSerialSet.has(cell.serial)) {
        const ownerStyle = getPlayerStyle(cell.owner);
        drawBoardShape(
          screen.x,
          screen.y,
          size * (cell.serial === newestSerial ? 0.99 : 0.92),
          "rgba(255, 255, 255, 0.04)",
          ownerStyle.strongStroke,
          cell.serial === newestSerial ? 3 : 2,
          hex
        );
      }
      drawFactoryPiece(hex, cell, screen, size, connected);
      continue;
    }

    const ownerStyle = getPlayerStyle(cell.owner);
    if (isRiftBloomGhostCell(cell)) {
      drawBoardShape(
        screen.x,
        screen.y,
        size * 0.76,
        ownerStyle.fill,
        "rgba(82, 238, 218, 0.86)",
        Math.max(1.5, size * 0.055),
        hex
      );
      drawBoardShape(
        screen.x,
        screen.y,
        size * 0.48,
        "rgba(255, 215, 94, 0.08)",
        ownerStyle.strongStroke,
        Math.max(1.1, size * 0.04),
        hex
      );
      if (showDetailText) {
        const ttl = Math.max(1, Math.trunc(Number(cell.riftTTL) || getRiftBloomGhostTurns(game.state)));
        ctx.fillStyle = "rgba(236, 242, 255, 0.94)";
        ctx.font = `${Math.max(8, Math.min(13, size * 0.4))}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(ttl), screen.x, screen.y + 0.5);
      }
      continue;
    }
    const bedSiegeBlockType = usesBedSiegeMode(game.state) && isBedSiegeBlockCell(cell)
      ? getBedSiegeBlockType(cell)
      : null;
    const bedSiegeBlockStyle = bedSiegeBlockType ? BED_SIEGE_BLOCK_STYLES[bedSiegeBlockType] : null;
    const isTeamWool = bedSiegeBlockType === "wool";
    const colour = isTeamWool ? getBedSiegePastelTeamFill(ownerStyle) : (bedSiegeBlockStyle?.fill || ownerStyle.hex);
    const blockStroke = bedSiegeBlockType ? ownerStyle.strongStroke : "rgba(255,255,255,0.45)";
    const blockText = isTeamWool ? "rgba(6, 12, 23, 0.72)" : bedSiegeBlockStyle?.text;
    if (showRecentHighlights && recentSerialSet.has(cell.serial)) {
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
      blockStroke,
      1.5,
      hex
    );
    if (cell.chaosShield && showInnerDots) {
      drawBoardShape(
        screen.x,
        screen.y,
        size * 0.9,
        "rgba(255, 215, 94, 0.05)",
        "rgba(255, 215, 94, 0.86)",
        Math.max(1.4, size * 0.055),
        hex
      );
    }
    if (showInnerDots && !bedSiegeBlockType) {
      ctx.fillStyle = "rgba(6, 12, 23, 0.52)";
      ctx.beginPath();
      const innerDotRadius = size * (usesTriangleGridMode(game.state) ? 0.18 : 0.28);
      ctx.arc(screen.x, screen.y, innerDotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (hasEverythingBagelMode(game.state) && !bedSiegeBlockType && (cell.bagelReceipt || cell.bagelCertified || cell.bagelStamped)) {
      const stampRadius = Math.max(3.2, size * 0.15);
      const stampX = screen.x + size * 0.36;
      const stampY = screen.y - size * 0.36;
      const stampFill = cell.bagelCertified
        ? "rgba(118, 227, 168, 0.92)"
        : (cell.bagelStamped ? "rgba(255, 111, 177, 0.92)" : "rgba(255, 215, 94, 0.92)");
      ctx.fillStyle = stampFill;
      ctx.strokeStyle = "rgba(8, 12, 26, 0.72)";
      ctx.lineWidth = Math.max(1, size * 0.035);
      ctx.beginPath();
      ctx.arc(stampX, stampY, stampRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (showDetailText) {
        ctx.fillStyle = "rgba(8, 12, 26, 0.88)";
        ctx.font = `${Math.max(7, Math.min(10, size * 0.28))}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cell.bagelCertified ? "C" : (cell.bagelStamped ? "P" : "R"), stampX, stampY + 0.5);
      }
    }

    const bedOwner = getBedSiegeBedOwnerAt(game.state, hex, true);
    if (bedOwner && showDetailText) {
      drawBoardShape(
        screen.x,
        screen.y,
        size * 0.48,
        "rgba(255, 255, 255, 0.18)",
        "rgba(255, 255, 255, 0.78)",
        1.7,
        hex
      );
      ctx.fillStyle = "rgba(236, 242, 255, 0.96)";
      ctx.font = `${Math.max(9, Math.min(15, size * 0.46))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("B", screen.x, screen.y + 0.5);
    } else if (showDetailText && usesBedSiegeMode(game.state) && cell.bedSiegeBrokenBed) {
      drawBoardShape(
        screen.x,
        screen.y,
        size * 0.48,
        "rgba(255, 74, 93, 0.14)",
        "rgba(255, 179, 92, 0.72)",
        1.7,
        hex
      );
      ctx.fillStyle = "rgba(255, 231, 189, 0.95)";
      ctx.font = `${Math.max(9, Math.min(15, size * 0.46))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("X", screen.x, screen.y + 0.5);
    } else if (showDetailText && bedSiegeBlockType) {
      const blockDef = getBedSiegeItemDef(bedSiegeBlockType);
      ctx.fillStyle = blockText;
      ctx.font = `${Math.max(8, Math.min(13, size * 0.4))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(blockDef.symbol, screen.x, screen.y + 0.5);
    } else if (showDetailText && usesBedSiegeMode(game.state) && cell.bedSiegeWool) {
      ctx.fillStyle = "rgba(236, 242, 255, 0.84)";
      ctx.font = `${Math.max(8, Math.min(13, size * 0.38))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("W", screen.x, screen.y + 0.5);
    } else if (showDetailText && usesArmoryMode(game.state)) {
      const pieceType = getArmoryPieceType(cell);
      const pieceDef = getArmoryPieceDef(pieceType);
      ctx.fillStyle = "rgba(236, 242, 255, 0.92)";
      ctx.font = `${Math.max(8, Math.min(13, size * 0.42))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pieceDef.symbol, screen.x, screen.y);
    }
  }

  if (showEventHighlights && hasEgyptianRemovalPhase(game.state) && !game.state.winner) {
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

  const recentCapRemovalEvents = showEventHighlights ? getLastTurnCapRemovalEvents(game.state) : [];
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

  const recentMeteorRemovalEvents = showEventHighlights ? getLastTurnMeteorRemovalEvents(game.state) : [];
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

  const recentBirdEvents = showEventHighlights ? getLastTurnBirdEvents(game.state) : [];
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

  const pigHex = getPigHex(game.state);
  if (pigHex) {
    const world = boardCellToPixel(pigHex, size, game.state);
    const screen = worldToScreen(world.x, world.y);
    if (!(screen.x < -size * 2 || screen.y < -size * 2 || screen.x > w + size * 2 || screen.y > h + size * 2)) {
      drawPigPiece(pigHex, size);
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

function getTriangleWinningLineCells(state, start, owner, lineKind) {
  if (!countsForOwnerAt(state, start, owner)) {
    return [];
  }

  const backward = [];
  let pos = stepTriangleLine(start, lineKind, false);
  while (countsForOwnerAt(state, pos, owner)) {
    backward.push(pos);
    pos = stepTriangleLine(pos, lineKind, false);
  }

  const forward = [];
  pos = stepTriangleLine(start, lineKind, true);
  while (countsForOwnerAt(state, pos, owner)) {
    forward.push(pos);
    pos = stepTriangleLine(pos, lineKind, true);
  }

  return [...backward.reverse(), start, ...forward];
}

function findTriangleWinningLine(state, owner, preferredHex = null) {
  const winLength = getWinLength(state);
  const candidates = [];
  if (preferredHex && countsForOwnerAt(state, preferredHex, owner)) {
    candidates.push(preferredHex);
  }
  for (const [key, cell] of Object.entries(state.cells)) {
    if (cellCountsForOwner(cell, owner)) {
      const hex = parseKey(key);
      if (!preferredHex || !equalHex(hex, preferredHex)) {
        candidates.push(hex);
      }
    }
  }

  for (const candidate of candidates) {
    for (const lineKind of triangleLineKinds) {
      const cells = getTriangleWinningLineCells(state, candidate, owner, lineKind);
      if (cells.length >= winLength) {
        return cells;
      }
    }
  }

  return [];
}

function drawStraightWinnerLineCells(cells, size) {
  if (!Array.isArray(cells) || cells.length < 2) {
    return;
  }

  const first = cells[0];
  const last = cells[cells.length - 1];
  const a = boardCellToPixel(first, size, game.state);
  const b = boardCellToPixel(last, size, game.state);
  const sa = worldToScreen(a.x, a.y);
  const sb = worldToScreen(b.x, b.y);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sa.x, sa.y);
  ctx.lineTo(sb.x, sb.y);
  ctx.stroke();
}

function drawPowderWinnerLine(size) {
  if (!usesPowderMode(game.state) || !game.state.winner) {
    return false;
  }
  const powderState = getPowderVirtualBoardState(game.state);
  const owner = game.state.winner;
  const ownedKeys = Object.entries(powderState.cells)
    .filter(([, cell]) => cell.owner === owner)
    .map(([key]) => key);
  if (ownedKeys.length === 0) {
    return false;
  }

  if (usesTriangleGridMode(powderState)) {
    const cells = findTriangleWinningLine(powderState, owner);
    if (cells.length >= getWinLength(powderState)) {
      drawStraightWinnerLineCells(cells, size);
      return true;
    }
    return false;
  }

  if (usesRadialGridMode(powderState)) {
    for (const key of ownedKeys) {
      const line = getRadialWinningLine(powderState, parseKey(key), owner);
      if (line) {
        drawRadialWinnerLine(line, size);
        return true;
      }
    }
    return false;
  }

  const winLength = getWinLength(powderState);
  for (const key of ownedKeys) {
    const start = parseKey(key);
    for (const dir of getLineAxesForMode(powderState)) {
      if (getLineCount(powderState, start, owner, dir) < winLength) {
        continue;
      }

      let minStep = 0;
      let maxStep = 0;
      while (countsForOwnerAt(powderState, { q: start.q + dir.q * (minStep - 1), r: start.r + dir.r * (minStep - 1) }, owner)) {
        minStep -= 1;
      }
      while (countsForOwnerAt(powderState, { q: start.q + dir.q * (maxStep + 1), r: start.r + dir.r * (maxStep + 1) }, owner)) {
        maxStep += 1;
      }

      drawStraightWinnerLineCells([
        { q: start.q + dir.q * minStep, r: start.r + dir.r * minStep },
        { q: start.q + dir.q * maxStep, r: start.r + dir.r * maxStep }
      ], size);
      return true;
    }
  }
  return false;
}

function drawWinnerLineHint() {
  if (usesBedSiegeMode(game.state) || usesFactoryMode(game.state) || usesPigMode(game.state)) {
    return;
  }
  const size = currentHexSize();
  if (drawPowderWinnerLine(size)) {
    return;
  }
  if (!game.state.lastPlacement) {
    if (!usesTriangleGridMode(game.state) || !game.state.winner) {
      return;
    }
  }
  const winLength = getWinLength(game.state);
  const last = game.state.lastPlacement;
  const lastCell = last ? getCellAt(game.state, last) : null;

  if (usesTriangleGridMode(game.state)) {
    const owners = lastCell ? getOwnersForCell(game.state, lastCell) : [];
    if (game.state.winner && !owners.includes(game.state.winner)) {
      owners.unshift(game.state.winner);
    } else if (game.state.winner && owners.includes(game.state.winner)) {
      owners.splice(owners.indexOf(game.state.winner), 1);
      owners.unshift(game.state.winner);
    }

    for (const owner of owners) {
      const cells = findTriangleWinningLine(game.state, owner, last);
      if (cells.length >= winLength) {
        drawStraightWinnerLineCells(cells, size);
        return;
      }
    }
    return;
  }

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
      if (getLineCount(game.state, last, owner, dir) < winLength) {
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

      drawStraightWinnerLineCells([
        { q: last.q + dir.q * minStep, r: last.r + dir.r * minStep },
        { q: last.q + dir.q * maxStep, r: last.r + dir.r * maxStep }
      ], size);
      return;
    }
  }
}

function scheduleFactoryAmbientAnimation() {
  if (game.factoryAnimationDisabled || game.factoryAnimationFramePending || usesLdmMode()) {
    return;
  }
  game.factoryAnimationFramePending = true;
  let callbackWasSynchronous = true;
  window.requestAnimationFrame(() => {
    if (callbackWasSynchronous) {
      game.factoryAnimationDisabled = true;
      game.factoryAnimationFramePending = false;
      return;
    }
    game.factoryAnimationFramePending = false;
    if (game.state && usesFactoryMode(game.state) && !usesLdmMode()) {
      render();
    }
  });
  callbackWasSynchronous = false;
}

function renderNow() {
  if (!game.state) {
    return;
  }

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  drawGrid();
  drawFactoryOverlay();
  drawBedSiegeOverlay();
  drawEverythingBagelOverlay();
  drawOriginIndicator();
  drawPowderGrains();
  drawEchoTargets();
  drawHoverEchoPreview();
  drawRiftBloomPreview();
  drawMeteorPreview();
  drawOrbitPreview();
  drawKingDuckRadius();
  drawPieces();
  drawWinnerLineHint();

  ui.zoomText.textContent = `Zoom ${game.viewport.zoom.toFixed(2)}x`;
  ui.coordText.textContent = `${getBoardCoordinateLabel(game.state)}: (${game.hoverHex.q}, ${game.hoverHex.r})`;
  if (usesFactoryMode(game.state) && !usesLdmMode()) {
    game.lastFactoryAnimationAt = window.performance?.now ? window.performance.now() : Date.now();
    scheduleFactoryAmbientAnimation();
  } else {
    game.lastFactoryAnimationAt = 0;
    game.factoryAnimationFramePending = false;
  }
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
  game.placementsPerTurn = getPlacementsPerTurnFromInputs();
  game.openingPlacementsPerTurn = getOpeningPlacementsPerTurnFromInputs();
  game.winLength = getWinLengthFromInputs();
  game.riftBloomCellModulus = getRiftBloomCellModulusFromInputs();
  game.riftBloomContestClaim = getRiftBloomContestClaimFromInputs();
  game.riftBloomGhostTurns = getRiftBloomGhostTurnsFromInputs();
  game.riftBloomTieGoesToCreator = getRiftBloomTieGoesToCreatorFromInputs();
  setTimerInputs(game.timerConfig);
  setTurnOrderInput(game.turnOrder, playerCount);
  setEgyptianCapInput(game.egyptianStoneCap);
  setRiftBloomCoverageInput(game.riftBloomCellModulus);
  setRiftBloomDurationInput(game.riftBloomGhostTurns);
  setRiftBloomContestInput(game.riftBloomContestClaim);
  setRiftBloomTieCreatorInput(game.riftBloomTieGoesToCreator);
  setSecretRuleInputs({
    placementsPerTurn: game.placementsPerTurn,
    openingPlacementsPerTurn: game.openingPlacementsPerTurn,
    winLength: game.winLength
  });
  game.state = makeInitialState(activeModeKeys, game.timerConfig, game.egyptianStoneCap, {
    placementsPerTurn: game.placementsPerTurn,
    openingPlacementsPerTurn: game.openingPlacementsPerTurn,
    winLength: game.winLength
  }, game.riftBloomCellModulus, game.riftBloomContestClaim, game.riftBloomGhostTurns, game.riftBloomTieGoesToCreator);
  game.factoryAnimationDisabled = false;
  game.factoryAnimationFramePending = false;
  game.lastFactoryAnimationAt = 0;
  const startingPlayer = resolveStartingPlayer(game.turnOrder, playerCount);
  game.state.startingPlayer = startingPlayer;
  game.state.turnPlayer = startingPlayer;
  game.state.clock.activePlayer = startingPlayer;
  ensureClockState(game.state);
  game.history = [];
  game.futureHistory = [];
  resizeCanvas();
  centreBoard();
  updateStatus();
  syncClockTickerFromState();
  render();
  broadcastOnlineState({ intent: "newGame" });
}

function fillModePicker() {
  for (const [key, mode] of Object.entries(MODES)) {
    if (HIDDEN_MODE_KEYS.has(key)) {
      continue;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modeToggle";
    button.dataset.mode = key;
    button.textContent = mode.name;
    button.setAttribute("aria-pressed", "false");
    if (mode.secret) {
      button.classList.add("secretModeToggle");
      button.hidden = true;
    }
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
  refreshSecretModeVisibility();
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
ui.placementsPerTurnInput?.addEventListener("input", () => {
  game.placementsPerTurn = getPlacementsPerTurnFromInputs();
  refreshSecretRuleSummaryFromInputs();
  setModeUI(getSelectedModeKeys());
});
ui.openingPlacementsInput?.addEventListener("input", () => {
  game.openingPlacementsPerTurn = getOpeningPlacementsPerTurnFromInputs();
  refreshSecretRuleSummaryFromInputs();
  setModeUI(getSelectedModeKeys());
});
ui.winLengthInput?.addEventListener("input", () => {
  game.winLength = getWinLengthFromInputs();
  refreshSecretRuleSummaryFromInputs();
  setModeUI(getSelectedModeKeys());
});
ui.riftBloomCoverageInput?.addEventListener("input", () => {
  game.riftBloomCellModulus = getRiftBloomCellModulusFromInputs();
  refreshRiftBloomCoverageSummaryFromInputs();
  setModeUI(getSelectedModeKeys());
  render();
});
ui.riftBloomDurationInput?.addEventListener("input", () => {
  game.riftBloomGhostTurns = getRiftBloomGhostTurnsFromInputs();
  game.riftBloomGhostTurnsTouched = true;
  refreshRiftBloomDurationSummaryFromInputs();
  refreshRiftBloomContestSummaryFromInputs();
  setModeUI(getSelectedModeKeys());
});
ui.riftBloomContestInput?.addEventListener("change", () => {
  game.riftBloomContestClaim = getRiftBloomContestClaimFromInputs();
  if (!game.riftBloomGhostTurnsTouched) {
    game.riftBloomGhostTurns = getDefaultRiftBloomGhostTurnsForMode(game.riftBloomContestClaim);
    setRiftBloomDurationInput(game.riftBloomGhostTurns);
  }
  refreshRiftBloomContestSummaryFromInputs();
  refreshRiftBloomTieSummaryFromInputs();
  setModeUI(getSelectedModeKeys());
});
ui.riftBloomTieCreatorInput?.addEventListener("change", () => {
  game.riftBloomTieGoesToCreator = getRiftBloomTieGoesToCreatorFromInputs();
  refreshRiftBloomTieSummaryFromInputs();
  setModeUI(getSelectedModeKeys());
});
ui.turnOrderInput?.addEventListener("change", () => {
  game.turnOrder = getTurnOrderFromInput();
  updateTurnOrderSummary();
});
for (let player = 1; player <= MAX_PLAYER_COUNT; player += 1) {
  getArmoryClassSelectForPlayer(player)?.addEventListener("change", () => {
    const state = game.state;
    if (state && usesArmoryMode(state) && !state.openingMoveDone && canUseAdminControls()) {
      const armory = ensureArmoryState(state);
      armory.classes[player] = normaliseArmoryClassKey(getArmoryClassSelectForPlayer(player)?.value);
      armory.shopOffers[player] = generateArmoryShopOffers(state, armory, player);
    }
    renderArmoryPanel();
  });
}
ui.armoryRerollBtn?.addEventListener("click", () => {
  rerollArmoryShopForCurrentPlayer();
});
ui.ldmBtn?.addEventListener("click", () => {
  setPerformanceModeLevel(getPerformanceModeLevel() === 1 ? 0 : 1);
});
ui.extremeLdmBtn?.addEventListener("click", () => {
  setPerformanceModeLevel(getPerformanceModeLevel() === 2 ? 0 : 2);
});
ui.secretModesBtn?.addEventListener("click", () => {
  setSecretModesUnlocked(!game.secretModesUnlocked);
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
setRiftBloomCoverageInput(game.riftBloomCellModulus);
setRiftBloomDurationInput(game.riftBloomGhostTurns);
setRiftBloomContestInput(game.riftBloomContestClaim);
setRiftBloomTieCreatorInput(game.riftBloomTieGoesToCreator);
setSecretRuleInputs({
  placementsPerTurn: game.placementsPerTurn,
  openingPlacementsPerTurn: game.openingPlacementsPerTurn,
  winLength: game.winLength
});
getArmoryClassSelectionsFromInputs();
updateOnlineStatusUI();
updatePerformanceModeUI();
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
  chooseChaosRule,
  getChaosRuleDefinitions,
  formatClock,
  updateClockUI,
  updateStatus
};
