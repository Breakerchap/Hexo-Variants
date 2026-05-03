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
        WS_HEARTBEAT_MS: "5000"
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
  constructor(url) {
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
  pair.clientA.send({ type: "createRoom" });
  const roomJoinA = await pair.clientA.waitFor((m) => m.type === "roomJoined" && m.roomCode);
  const roomCode = roomJoinA.roomCode;
  assert.ok(roomCode, "Room code should be present after createRoom");

  pair.clientB.send({ type: "joinRoom", roomCode });
  const roomJoinB = await pair.clientB.waitFor((m) => m.type === "roomJoined" && m.roomCode === roomCode);
  assert.equal(roomJoinB.roomCode, roomCode);

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

async function main() {
  const port = makePort();
  const { child, ready } = spawnServer(port);
  const url = `ws://127.0.0.1:${port}/ws`;

  let clientA = null;
  let clientB = null;
  try {
    await ready;
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

    console.log("Online reset and concurrency smoke test passed.");
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
