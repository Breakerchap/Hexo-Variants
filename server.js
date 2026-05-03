const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");
const { safeJoinWithinRoot } = require("./server-path-utils");

const ROOT_DIR = __dirname;
const DEFAULT_PORT = 8080;
const DEFAULT_WS_PATH = "/ws";
const DEFAULT_WS_HEARTBEAT_MS = 25000;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon"
};

function parsePort() {
  if (process.env.PORT) {
    const envPort = Number(process.env.PORT);
    if (Number.isInteger(envPort) && envPort > 0) {
      return envPort;
    }
  }

  const arg = process.argv.find((entry) => entry.startsWith("--port="));
  if (arg) {
    const value = Number(arg.split("=")[1]);
    if (Number.isInteger(value) && value > 0) {
      return value;
    }
  }

  return DEFAULT_PORT;
}

const PORT = parsePort();

function normaliseWsPath(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    return DEFAULT_WS_PATH;
  }

  let value = raw;
  if (!value.startsWith("/")) {
    value = `/${value}`;
  }
  value = value.replace(/\/+$/, "");
  return value || "/";
}

function parseWsPath() {
  if (process.env.WS_PATH) {
    return normaliseWsPath(process.env.WS_PATH);
  }

  const arg = process.argv.find((entry) => entry.startsWith("--ws-path="));
  if (arg) {
    return normaliseWsPath(arg.split("=")[1]);
  }

  return DEFAULT_WS_PATH;
}

function parseWsHeartbeatMs() {
  if (process.env.WS_HEARTBEAT_MS) {
    const envValue = Number(process.env.WS_HEARTBEAT_MS);
    if (Number.isInteger(envValue) && envValue >= 5000) {
      return envValue;
    }
  }

  const arg = process.argv.find((entry) => entry.startsWith("--ws-heartbeat-ms="));
  if (arg) {
    const value = Number(arg.split("=")[1]);
    if (Number.isInteger(value) && value >= 5000) {
      return value;
    }
  }

  return DEFAULT_WS_HEARTBEAT_MS;
}

const WS_PATH = parseWsPath();
const WS_HEARTBEAT_MS = parseWsHeartbeatMs();

function safeJoin(requestPath) {
  return safeJoinWithinRoot(ROOT_DIR, requestPath);
}

function sendFile(res, filePath) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  if (req.url === "/") {
    sendFile(res, path.join(ROOT_DIR, "index.html"));
    return;
  }

  if (req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const filePath = safeJoin(req.url);
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  sendFile(res, filePath);
});

const wss = new WebSocketServer({ noServer: true });

const rooms = new Map();
const clients = new Map();
const ROOM_CODE_WORDS = [
  "APPLE", "ARBOR", "ARROW", "ATLAS", "BACON", "BADGE", "BAGEL", "BASIC", "BEACH", "BEANS",
  "BERRY", "BLACK", "BLAST", "BLOOM", "BOARD", "BOOTH", "BRAVE", "BRICK", "BRUSH", "BUNNY",
  "CABLE", "CANDY", "CANOE", "CEDAR", "CHAIR", "CHARM", "CHESS", "CHILI", "CHIME", "CHUNK",
  "CIVIC", "CLOUD", "COBRA", "COMET", "CORAL", "CRANE", "CROWN", "CYCLE", "DAISY", "DELTA",
  "DREAM", "DRIFT", "EARTH", "ELBOW", "EMBER", "ENTRY", "EPOCH", "EQUAL", "FAITH", "FANCY",
  "FIELD", "FIERY", "FLAME", "FLASH", "FLINT", "FLORA", "FOCUS", "FORGE", "FRESH", "FROST",
  "FRUIT", "GHOST", "GIANT", "GLASS", "GLOBE", "GLORY", "GOOSE", "GRACE", "GRAIN", "GRASS",
  "GREEN", "GUIDE", "HABIT", "HAZEL", "HEART", "HONEY", "HORSE", "HOUSE", "HUMOR", "IDEAL",
  "IMAGE", "IVORY", "JELLY", "JOLLY", "JUDGE", "JUICE", "KOALA", "LABEL", "LASER", "LATCH",
  "LEMON", "LIGHT", "LILAC", "LODGE", "LUNAR", "MAGIC", "MAJOR", "MANGO", "MAPLE", "MARCH",
  "MATCH", "METAL", "MICRO", "MIGHT", "MINTY", "MODEL", "MONEY", "MOOSE", "MOTOR", "MOUNT",
  "MOUSE", "MUSIC", "NAVAL", "NOBLE", "NORTH", "NOVEL", "NYLON", "OASIS", "OCEAN", "OLIVE",
  "ONION", "OPERA", "ORBIT", "ORGAN", "OTTER", "PAINT", "PANEL", "PAPER", "PARTY", "PEACH",
  "PEARL", "PHASE", "PHONE", "PIANO", "PIPER", "PIZZA", "PLANT", "PLATE", "POINT", "POLAR",
  "POWER", "PRIDE", "PRIME", "PRISM", "PRIZE", "PROUD", "QUEST", "QUICK", "QUILL", "RADIO",
  "RANCH", "RAPID", "RAVEN", "REACH", "REBEL", "RIDGE", "RIVER", "ROBIN", "ROCKY", "ROUND",
  "ROYAL", "RUGBY", "RULER", "RUSTY", "SALAD", "SCALE", "SCARF", "SCENE", "SCOUT", "SHAPE",
  "SHELL", "SHIFT", "SHINE", "SHORE", "SKATE", "SKILL", "SLATE", "SLEEP", "SMILE", "SMOKE",
  "SOLAR", "SOLID", "SOUND", "SOUTH", "SPACE", "SPARK", "SPELL", "SPICE", "SPIRE", "SPORT",
  "SQUAD", "STACK", "STAGE", "STAMP", "STAND", "STARE", "STEEL", "STONE", "STORM", "STORY",
  "SUGAR", "SUNNY", "SWIFT", "TABLE", "TALON", "TASTE", "TEACH", "TEMPO", "THORN", "TIGER",
  "TIMER", "TOAST", "TOKEN", "TOWER", "TRACE", "TRACK", "TRAIL", "TRAIN", "TREND", "TRIAL",
  "TRIBE", "TRICK", "TRUNK", "TRUST", "TULIP", "ULTRA", "UNION", "UNITY", "URBAN", "VALUE",
  "VAPOR", "VENOM", "VERSE", "VIDEO", "VIGOR", "VINYL", "VIRAL", "VISTA", "VIVID", "VOICE",
  "VOTER", "WAGON", "WATER", "WHALE", "WHEAT", "WHITE", "WHOLE", "WINDY", "WITCH", "WORLD",
  "WORTH", "YEAST", "YOUNG", "ZEBRA", "ZESTY"
];

function newClientId() {
  return crypto.randomBytes(4).toString("hex");
}

function newRoomCode() {
  const idx = crypto.randomInt(0, ROOM_CODE_WORDS.length);
  return ROOM_CODE_WORDS[idx];
}

function send(ws, payload) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(payload));
  }
}

function getPlayerAssignments(room) {
  const assignments = {};
  for (const slot of [1, 2]) {
    const ws = room.playerSlots[slot];
    const meta = ws ? clients.get(ws) : null;
    if (meta) {
      assignments[meta.clientId] = slot;
    }
  }
  return assignments;
}

function getExpectedTurnPlayer(room) {
  if (!room || !room.state || typeof room.state !== "object") {
    return 1;
  }
  return room.state.turnPlayer === 2 ? 2 : 1;
}

function getUpdateIntent(message) {
  return typeof message?.intent === "string" ? message.intent : "";
}

function buildStatePayload(room, byClientId = null) {
  return {
    type: "stateUpdate",
    roomCode: room.code,
    revision: room.revision,
    state: room.state,
    playerAssignments: getPlayerAssignments(room),
    byClientId
  };
}

function sendRoomState(ws, room, byClientId = null) {
  send(ws, buildStatePayload(room, byClientId));
}

function broadcastRoomState(room, byClientId = null) {
  const payload = buildStatePayload(room, byClientId);
  for (const member of room.members) {
    send(member, payload);
  }
}

function rejectStateUpdate(ws, room, code, message) {
  send(ws, { type: "error", code, message });
  if (room && room.state) {
    sendRoomState(ws, room, null);
  }
}

function broadcastRoomPresence(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) {
    return;
  }

  const playerAssignments = getPlayerAssignments(room);
  const payload = {
    type: "presence",
    roomCode,
    revision: room.revision,
    playerAssignments,
    members: room.members.size
  };

  for (const member of room.members) {
    send(member, payload);
  }
}

function leaveRoom(ws) {
  const meta = clients.get(ws);
  if (!meta || !meta.roomCode) {
    return;
  }

  const roomCode = meta.roomCode;
  const room = rooms.get(roomCode);
  meta.roomCode = null;
  if (meta.playerSlot) {
    if (room && room.playerSlots[meta.playerSlot] === ws) {
      room.playerSlots[meta.playerSlot] = null;
    }
    meta.playerSlot = null;
  }

  if (!room) {
    return;
  }

  room.members.delete(ws);
  if (room.members.size === 0) {
    rooms.delete(roomCode);
    return;
  }

  broadcastRoomPresence(roomCode);
}

function joinRoom(ws, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) {
    send(ws, { type: "error", message: "Room not found." });
    return;
  }

  leaveRoom(ws);

  const meta = clients.get(ws);
  meta.roomCode = roomCode;
  room.members.add(ws);
  if (!meta.playerSlot) {
    if (!room.playerSlots[1]) {
      room.playerSlots[1] = ws;
      meta.playerSlot = 1;
    } else if (!room.playerSlots[2]) {
      room.playerSlots[2] = ws;
      meta.playerSlot = 2;
    }
  }

  const playerAssignments = getPlayerAssignments(room);
  send(ws, {
    type: "roomJoined",
    roomCode,
    revision: room.revision,
    state: room.state,
    playerAssignments,
    members: room.members.size
  });

  broadcastRoomPresence(roomCode);
}

function createRoom(ws) {
  leaveRoom(ws);

  if (rooms.size >= ROOM_CODE_WORDS.length) {
    send(ws, {
      type: "error",
      message: "No room codes available right now. Please try again in a moment."
    });
    return;
  }

  let roomCode = newRoomCode();
  let attempts = 0;
  while (rooms.has(roomCode)) {
    roomCode = newRoomCode();
    attempts += 1;
    if (attempts > ROOM_CODE_WORDS.length * 2) {
      send(ws, {
        type: "error",
        message: "Could not allocate a room code. Please try again."
      });
      return;
    }
  }

  rooms.set(roomCode, {
    code: roomCode,
    members: new Set(),
    revision: 0,
    state: null,
    playerSlots: {
      1: null,
      2: null
    }
  });

  joinRoom(ws, roomCode);
}

function handleStateUpdate(ws, message) {
  const meta = clients.get(ws);
  if (!meta || !meta.roomCode) {
    send(ws, { type: "error", message: "Join a room first." });
    return;
  }

  const room = rooms.get(meta.roomCode);
  if (!room) {
    send(ws, { type: "error", message: "Room no longer exists." });
    return;
  }

  if (!message.state || typeof message.state !== "object") {
    send(ws, { type: "error", message: "Missing game state payload." });
    return;
  }

  const intent = getUpdateIntent(message);
  if (intent === "newGame" && meta.playerSlot !== 1) {
    rejectStateUpdate(
      ws,
      room,
      "ADMIN_ONLY_RESET",
      "Only player 1 can start a new online game."
    );
    return;
  }

  if (!Number.isInteger(message.baseRevision)) {
    rejectStateUpdate(
      ws,
      room,
      "MISSING_BASE_REVISION",
      "Missing or invalid base revision for state update."
    );
    return;
  }

  const isAdminReset = intent === "newGame" && meta.playerSlot === 1;
  if (!isAdminReset && message.baseRevision !== room.revision) {
    rejectStateUpdate(
      ws,
      room,
      "STALE_STATE",
      `Outdated revision. Server is at revision ${room.revision}.`
    );
    return;
  }

  if (meta.playerSlot !== 1 && meta.playerSlot !== 2) {
    rejectStateUpdate(
      ws,
      room,
      "SPECTATOR_CANNOT_MOVE",
      "Spectators cannot submit game moves."
    );
    return;
  }

  const expectedTurnPlayer = getExpectedTurnPlayer(room);
  const bypassTurnCheck = isAdminReset;
  if (!bypassTurnCheck && meta.playerSlot !== expectedTurnPlayer) {
    rejectStateUpdate(
      ws,
      room,
      "NOT_YOUR_TURN",
      `It is player ${expectedTurnPlayer}'s turn.`
    );
    return;
  }

  room.revision += 1;
  room.state = message.state;
  broadcastRoomState(room, meta.clientId);
}

function handleMessage(ws, message) {
  if (!message || typeof message.type !== "string") {
    send(ws, { type: "error", message: "Invalid message." });
    return;
  }

  if (message.type === "createRoom") {
    createRoom(ws);
    return;
  }

  if (message.type === "joinRoom") {
    const roomCode = String(message.roomCode || "").trim().toUpperCase();
    if (!roomCode) {
      send(ws, { type: "error", message: "Room code is required." });
      return;
    }
    joinRoom(ws, roomCode);
    return;
  }

  if (message.type === "leaveRoom") {
    leaveRoom(ws);
    send(ws, { type: "roomJoined", roomCode: "", revision: 0, state: null, playerAssignments: {}, members: 0 });
    return;
  }

  if (message.type === "stateUpdate") {
    handleStateUpdate(ws, message);
    return;
  }

  send(ws, { type: "error", message: `Unknown message type: ${message.type}` });
}

server.on("upgrade", (req, socket, head) => {
  if (!req.url) {
    socket.destroy();
    return;
  }

  const pathname = req.url.split("?")[0].replace(/\/+$/, "") || "/";
  if (pathname !== WS_PATH) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {
  const clientId = newClientId();
  clients.set(ws, {
    clientId,
    roomCode: null,
    playerSlot: null,
    isAlive: true
  });

  send(ws, { type: "welcome", clientId });

  ws.on("pong", () => {
    const meta = clients.get(ws);
    if (meta) {
      meta.isAlive = true;
    }
  });

  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(String(raw));
      handleMessage(ws, message);
    } catch (error) {
      send(ws, { type: "error", message: "Could not parse message JSON." });
    }
  });

  ws.on("close", () => {
    leaveRoom(ws);
    clients.delete(ws);
  });
});

const wsHeartbeatInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.readyState !== 1) {
      continue;
    }

    const meta = clients.get(ws);
    if (!meta) {
      continue;
    }

    if (!meta.isAlive) {
      ws.terminate();
      continue;
    }

    meta.isAlive = false;
    try {
      ws.ping();
    } catch (error) {
      ws.terminate();
    }
  }
}, WS_HEARTBEAT_MS);

wss.on("close", () => {
  clearInterval(wsHeartbeatInterval);
});

server.listen(PORT, () => {
  console.log(`Hex Tic-Tac-Toe server listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}${WS_PATH}`);
  console.log(`WebSocket heartbeat: ${WS_HEARTBEAT_MS}ms`);
});
