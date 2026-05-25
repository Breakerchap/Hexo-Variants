const assert = require("assert/strict");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const PROJECT_ROOT = fs.existsSync(path.resolve(process.cwd(), "server.js"))
  ? process.cwd()
  : path.resolve(__dirname, "..");

function loadWebSocketModule() {
  const localWsPath = path.resolve(PROJECT_ROOT, "node_modules", "ws");
  try {
    return require(localWsPath);
  } catch (error) {
    return require("ws");
  }
}

const WebSocket = loadWebSocketModule();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makePort() {
  return 18080 + Math.floor(Math.random() * 2000);
}

function makeSessionId(label) {
  const random = Math.random().toString(36).slice(2, 12);
  const stamp = Date.now().toString(36);
  return `test-${label}-${stamp}-${random}`;
}

function spawnServer(port) {
  const child = spawn(
    process.execPath,
    ["-e", "require('./server.js')"],
    {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        PORT: String(port),
        WS_PATH: "/ws",
        WS_HEARTBEAT_MS: "5000",
        ROOM_RECONNECT_GRACE_MS: "1000"
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  let readyResolve;
  let readyReject;
  const ready = new Promise((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });

  const timeout = setTimeout(() => {
    readyReject(new Error("Server did not start in time"));
  }, 8000);

  child.stdout.on("data", (buffer) => {
    const text = buffer.toString("utf8");
    if (text.includes("server listening")) {
      clearTimeout(timeout);
      readyResolve();
    }
  });

  child.stderr.on("data", (buffer) => {
    const text = buffer.toString("utf8");
    if (text.trim()) {
      clearTimeout(timeout);
      readyReject(new Error(`Server stderr: ${text}`));
    }
  });

  child.on("exit", (code) => {
    clearTimeout(timeout);
    if (code !== 0) {
      readyReject(new Error(`Server exited early with code ${code}`));
    }
  });

  return { child, ready };
}

class WsClient {
  constructor(url, sessionId = null) {
    this.sessionId = sessionId || makeSessionId("client");
    this.ws = new WebSocket(url);
    this.messages = [];
    this.waiters = [];
    this.openPromise = new Promise((resolve, reject) => {
      this.ws.on("open", resolve);
      this.ws.on("error", reject);
    });

    this.ws.on("message", (raw) => {
      const parsed = JSON.parse(String(raw));
      this.messages.push(parsed);
      this.flushWaiters();
    });
  }

  flushWaiters() {
    for (let i = 0; i < this.waiters.length; i += 1) {
      const waiter = this.waiters[i];
      const index = this.messages.findIndex(waiter.predicate);
      if (index !== -1) {
        const [message] = this.messages.splice(index, 1);
        clearTimeout(waiter.timeoutId);
        waiter.resolve(message);
        this.waiters.splice(i, 1);
        i -= 1;
      }
    }
  }

  waitFor(predicate, timeoutMs = 5000) {
    const index = this.messages.findIndex(predicate);
    if (index !== -1) {
      const [message] = this.messages.splice(index, 1);
      return Promise.resolve(message);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const idx = this.waiters.findIndex((entry) => entry.resolve === resolve);
        if (idx !== -1) {
          this.waiters.splice(idx, 1);
        }
        reject(new Error("Timed out waiting for expected websocket message"));
      }, timeoutMs);

      this.waiters.push({ predicate, resolve, reject, timeoutId });
    });
  }

  send(payload) {
    this.ws.send(JSON.stringify(payload));
  }

  async close() {
    if (this.ws.readyState === WebSocket.CLOSED) {
      return;
    }
    await new Promise((resolve) => {
      this.ws.once("close", resolve);
      this.ws.close();
    });
  }
}

function makeState(turnPlayer, marker) {
  return {
    modeKeys: [],
    playerCount: 2,
    turnPlayer,
    marker
  };
}

function makeMultiplayerState(turnPlayer, marker, playerCount) {
  return {
    modeKeys: playerCount >= 4 ? ["fourPlayer"] : ["threePlayer"],
    playerCount,
    turnPlayer,
    marker
  };
}

async function connectClientPair(url) {
  const clientA = new WsClient(url);
  const clientB = new WsClient(url);
  await Promise.all([clientA.openPromise, clientB.openPromise]);

  const welcomeA = await clientA.waitFor((m) => m.type === "welcome");
  const welcomeB = await clientB.waitFor((m) => m.type === "welcome");
  assert.ok(welcomeA.clientId);
  assert.ok(welcomeB.clientId);

  return { clientA, clientB };
}

async function createJoinedRoom(url) {
  const pair = await connectClientPair(url);
  pair.clientA.send({ type: "createRoom", sessionId: pair.clientA.sessionId });
  const roomJoinA = await pair.clientA.waitFor((m) => m.type === "roomJoined" && m.roomCode);
  const roomCode = roomJoinA.roomCode;
  assert.ok(roomCode, "Room code should be present after createRoom");
  assert.equal(roomJoinA.yourPlayerSlot, 1);

  pair.clientB.send({ type: "joinRoom", roomCode, sessionId: pair.clientB.sessionId });
  const roomJoinB = await pair.clientB.waitFor((m) => m.type === "roomJoined" && m.roomCode === roomCode);
  assert.equal(roomJoinB.roomCode, roomCode);
  assert.equal(roomJoinB.yourPlayerSlot, 2);

  return { ...pair, roomCode };
}

async function closeClients(clients) {
  await Promise.all(clients.map((client) => client.close().catch(() => {})));
}

async function runConcurrentRoomSmoke(url, roomCount) {
  const rooms = await Promise.all(
    Array.from({ length: roomCount }, async (_, index) => {
      const room = await createJoinedRoom(url);
      const marker = `room-${index}-seed`;

      room.clientA.send({
        type: "stateUpdate",
        baseRevision: 0,
        state: makeState(1, marker)
      });

      const seedA = await room.clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 1);
      const seedB = await room.clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 1);
      assert.equal(seedA.roomCode, room.roomCode);
      assert.equal(seedB.roomCode, room.roomCode);
      assert.equal(seedA.state.marker, marker);
      assert.equal(seedB.state.marker, marker);

      return { ...room, index };
    })
  );

  assert.equal(new Set(rooms.map((room) => room.roomCode)).size, roomCount);

  await Promise.all(
    rooms.map(async (room) => {
      const marker = `room-${room.index}-move`;
      room.clientA.send({
        type: "stateUpdate",
        baseRevision: 1,
        state: makeState(2, marker)
      });

      const moveA = await room.clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 2);
      const moveB = await room.clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 2);
      assert.equal(moveA.roomCode, room.roomCode);
      assert.equal(moveB.roomCode, room.roomCode);
      assert.equal(moveA.state.marker, marker);
      assert.equal(moveB.state.marker, marker);
    })
  );

  await closeClients(rooms.flatMap((room) => [room.clientA, room.clientB]));
}

async function runReconnectSmoke(url) {
  const room = await createJoinedRoom(url);
  const { roomCode } = room;
  const sessionA = room.clientA.sessionId;
  const sessionB = room.clientB.sessionId;

  room.clientA.send({
    type: "stateUpdate",
    baseRevision: 0,
    state: makeState(1, "reconnect-seed-r1")
  });

  const r1A = await room.clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 1);
  const r1B = await room.clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 1);
  assert.equal(r1A.state.marker, "reconnect-seed-r1");
  assert.equal(r1B.state.marker, "reconnect-seed-r1");

  await closeClients([room.clientA, room.clientB]);
  await sleep(100);

  const clientA2 = new WsClient(url, sessionA);
  const clientB2 = new WsClient(url, sessionB);

  try {
    await clientA2.openPromise;
    await clientA2.waitFor((m) => m.type === "welcome");
    clientA2.send({ type: "joinRoom", roomCode, sessionId: clientA2.sessionId });
    const rejoinA = await clientA2.waitFor((m) => m.type === "roomJoined" && m.roomCode === roomCode);
    assert.equal(rejoinA.yourPlayerSlot, 1);
    assert.equal(rejoinA.revision, 1);
    assert.equal(rejoinA.state.marker, "reconnect-seed-r1");

    clientA2.send({
      type: "stateUpdate",
      baseRevision: 1,
      state: makeState(2, "after-player-one-reconnect-r2")
    });

    const r2A = await clientA2.waitFor((m) => m.type === "stateUpdate" && m.revision === 2);
    assert.equal(r2A.state.marker, "after-player-one-reconnect-r2");

    await clientB2.openPromise;
    await clientB2.waitFor((m) => m.type === "welcome");
    clientB2.send({ type: "joinRoom", roomCode, sessionId: clientB2.sessionId });
    const rejoinB = await clientB2.waitFor((m) => m.type === "roomJoined" && m.roomCode === roomCode);
    assert.equal(rejoinB.yourPlayerSlot, 2);
    assert.equal(rejoinB.revision, 2);
    assert.equal(rejoinB.state.marker, "after-player-one-reconnect-r2");

    clientB2.send({
      type: "stateUpdate",
      baseRevision: 2,
      state: makeState(1, "after-player-two-reconnect-r3")
    });

    const r3A = await clientA2.waitFor((m) => m.type === "stateUpdate" && m.revision === 3);
    const r3B = await clientB2.waitFor((m) => m.type === "stateUpdate" && m.revision === 3);
    assert.equal(r3A.state.marker, "after-player-two-reconnect-r3");
    assert.equal(r3B.state.marker, "after-player-two-reconnect-r3");
  } finally {
    await closeClients([clientA2, clientB2]);
  }
}

async function runSlotReleaseSmoke(url) {
  const room = await createJoinedRoom(url);
  const replacement = new WsClient(url);

  try {
    await room.clientB.close();
    await sleep(1200);

    await replacement.openPromise;
    await replacement.waitFor((m) => m.type === "welcome");
    replacement.send({
      type: "joinRoom",
      roomCode: room.roomCode,
      sessionId: replacement.sessionId
    });

    const joinedReplacement = await replacement.waitFor(
      (m) => m.type === "roomJoined" && m.roomCode === room.roomCode
    );
    assert.equal(joinedReplacement.yourPlayerSlot, 2);
  } finally {
    await closeClients([room.clientA, room.clientB, replacement]);
  }
}

async function runFourPlayerRoomSmoke(url) {
  const clients = Array.from({ length: 5 }, () => new WsClient(url));
  try {
    await Promise.all(clients.map((client) => client.openPromise));
    await Promise.all(clients.map((client) => client.waitFor((m) => m.type === "welcome")));

    clients[0].send({ type: "createRoom", sessionId: clients[0].sessionId });
    const joinA = await clients[0].waitFor((m) => m.type === "roomJoined" && m.roomCode);
    const roomCode = joinA.roomCode;
    assert.equal(joinA.yourPlayerSlot, 1);

    for (let index = 1; index < clients.length; index += 1) {
      clients[index].send({ type: "joinRoom", roomCode, sessionId: clients[index].sessionId });
      const joined = await clients[index].waitFor((m) => m.type === "roomJoined" && m.roomCode === roomCode);
      assert.equal(joined.yourPlayerSlot || null, index <= 3 ? index + 1 : null);
    }

    clients[0].send({
      type: "stateUpdate",
      baseRevision: 0,
      state: makeMultiplayerState(3, "four-player-seed-r1", 4)
    });
    await Promise.all(clients.slice(0, 4).map(async (client) => {
      const update = await client.waitFor((m) => m.type === "stateUpdate" && m.revision === 1);
      assert.equal(update.state.turnPlayer, 3);
      assert.equal(update.state.playerCount, 4);
    }));

    clients[1].send({
      type: "stateUpdate",
      baseRevision: 1,
      state: makeMultiplayerState(4, "bad-p2-move", 4)
    });
    const outOfTurn = await clients[1].waitFor((m) => m.type === "error");
    assert.equal(outOfTurn.code, "NOT_YOUR_TURN");

    clients[2].send({
      type: "stateUpdate",
      baseRevision: 1,
      state: makeMultiplayerState(4, "p3-move-r2", 4)
    });
    const p3Move = await clients[2].waitFor((m) => m.type === "stateUpdate" && m.revision === 2);
    assert.equal(p3Move.state.marker, "p3-move-r2");
    assert.equal(p3Move.state.turnPlayer, 4);

    clients[3].send({
      type: "stateUpdate",
      baseRevision: 2,
      state: makeMultiplayerState(1, "p4-move-r3", 4)
    });
    const p4Move = await clients[3].waitFor((m) => m.type === "stateUpdate" && m.revision === 3);
    assert.equal(p4Move.state.marker, "p4-move-r3");
    assert.equal(p4Move.state.turnPlayer, 1);
  } finally {
    await closeClients(clients);
  }
}

async function main() {
  const port = makePort();
  const { child, ready } = spawnServer(port);
  const url = `ws://127.0.0.1:${port}/ws`;

  let clientA = null;
  let clientB = null;
  try {
    await ready;
    await runReconnectSmoke(url);
    await runSlotReleaseSmoke(url);
    await runFourPlayerRoomSmoke(url);

    const joinedRoom = await createJoinedRoom(url);
    clientA = joinedRoom.clientA;
    clientB = joinedRoom.clientB;
    const roomCode = joinedRoom.roomCode;

    // Seed revision 1.
    clientA.send({
      type: "stateUpdate",
      baseRevision: 0,
      state: makeState(1, "seed-r1")
    });
    const r1A = await clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 1);
    const r1B = await clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 1);
    assert.equal(r1A.state.marker, "seed-r1");
    assert.equal(r1B.state.marker, "seed-r1");

    // Advance to revision 2 with turnPlayer=2 (so player 1 is out-of-turn).
    clientA.send({
      type: "stateUpdate",
      baseRevision: 1,
      state: makeState(2, "seed-r2")
    });
    const r2A = await clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 2);
    const r2B = await clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 2);
    assert.equal(r2A.state.turnPlayer, 2);
    assert.equal(r2B.state.turnPlayer, 2);

    // Player 1 reset should be accepted even though old state turn is player 2.
    clientA.send({
      type: "stateUpdate",
      baseRevision: 2,
      intent: "newGame",
      state: makeState(1, "reset-r3")
    });
    const r3A = await clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 3);
    const r3B = await clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 3);
    assert.equal(r3A.state.marker, "reset-r3");
    assert.equal(r3B.state.marker, "reset-r3");
    assert.equal(r3A.state.turnPlayer, 1);
    assert.equal(r3B.state.turnPlayer, 1);

    // Player 2 reset should be rejected.
    clientB.send({
      type: "stateUpdate",
      baseRevision: 3,
      intent: "newGame",
      state: makeState(1, "bad-reset")
    });
    const resetError = await clientB.waitFor((m) => m.type === "error");
    assert.equal(resetError.code, "ADMIN_ONLY_RESET");
    const resync = await clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 3);
    assert.equal(resync.state.marker, "reset-r3");

    // Player 1 reset should also be accepted from a stale base revision so a
    // high-latency reset can recover the room instead of trapping clients.
    clientA.send({
      type: "stateUpdate",
      baseRevision: 1,
      intent: "newGame",
      state: makeState(2, "stale-reset-r4")
    });
    const r4A = await clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 4);
    const r4B = await clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 4);
    assert.equal(r4A.state.marker, "stale-reset-r4");
    assert.equal(r4B.state.marker, "stale-reset-r4");
    assert.equal(r4A.state.turnPlayer, 2);
    assert.equal(r4B.state.turnPlayer, 2);

    // The room should keep accepting normal moves after the stale reset.
    clientB.send({
      type: "stateUpdate",
      baseRevision: 4,
      state: makeState(1, "after-stale-reset-r5")
    });
    const r5A = await clientA.waitFor((m) => m.type === "stateUpdate" && m.revision === 5);
    const r5B = await clientB.waitFor((m) => m.type === "stateUpdate" && m.revision === 5);
    assert.equal(r5A.state.marker, "after-stale-reset-r5");
    assert.equal(r5B.state.marker, "after-stale-reset-r5");

    await runConcurrentRoomSmoke(url, 10);

    console.log("Online reconnect, reset, and concurrency smoke test passed.");
  } finally {
    if (clientA) {
      await clientA.close().catch(() => {});
    }
    if (clientB) {
      await clientB.close().catch(() => {});
    }
    if (child && !child.killed) {
      child.kill();
      await sleep(100);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
