# Infinite Hex Tic-Tac-Toe

A browser-based infinite strategy game where players race to connect **6 in a row**.  
It includes stackable rule modes like `Triangle Grid`, `Square Grid`, `Octagon Grid`, `Duck`, `King Duck`, `Egyptian`, `Echo`, `Orbit`, and `Meteor`.

## Quick Start

1. Clone this repository.
2. For local play only, open [index.html](./index.html) in a modern browser.
3. For online rooms, run:

```bash
npm install
npm test
npm start
```

4. Open `http://localhost:8080` in both browsers/tabs.

No build step is required.

## Online Rooms

Hosted version: https://hex-tic-tac-toe.onrender.com

- Online rooms require the Node server (`server.js`) so WebSockets are available.
- Turn control is server-authoritative: spectators cannot submit moves, and players can only update state on their own turn.
- State updates are revision-checked to prevent stale overwrites when two clients act at once.

### Cloud hosting

The server is cloud-friendly by default:

- Binds to `PORT` (for platforms like Render/Railway/Fly/Heroku).
- Uses WebSocket heartbeat pings (default `25000ms`) to keep proxy connections alive.
- Exposes `GET /healthz` for health checks.

Optional server env vars:

- `WS_PATH` (default `/ws`)
- `WS_HEARTBEAT_MS` (minimum `5000`, default `25000`)

If your frontend and backend are on different hosts, set the client WebSocket endpoint using one of:

- Query string: `?ws=wss://your-server.example/ws`
- `<meta name="hex-ws-url" content="wss://your-server.example/ws" />`
- `window.HEX_TTT_WS_URL = "wss://your-server.example/ws"`

## Rules

- Player 1 opens with **1 placement**.
- Every turn after that uses **2 placements**.
- The first move must be at **(0, 0)**.
- Later placements must be within **11 spaces** of an existing occupied space.
- A line of **6 stones** wins.

## Controls

- Left click: place/move
- Right click or middle mouse drag: pan
- Mouse wheel: zoom
- `New Game`: restart with selected modes
- `Back` / `Forward`: browse earlier/later board states
- `Centre Board`: reset camera
- `LDM` / `XLDM`: toggle low-detail rendering from the footer

## Modes

- **Triangle Grid**: swaps the board from hex tiles to triangle cells (place inside triangles; all other rules still apply).
- **Square Grid**: swaps the board from hex tiles to square cells (place inside squares; all other rules still apply).
- **Octagon Grid**: swaps the board from hex tiles to an octagon-and-diamond tiling (place inside octagons and the small diamonds; all other rules still apply).
- **Duck**: move duck after your placements; no one can place on it.
- **King Duck**: adds a panic ring around the king duck.
- **Egyptian**: each player has a soft `n` stone cap (set `n` in the UI); when your own placements go over `n`, choose up to 2 of your stones per turn to remove (not the one just placed). Echoes never remove stones automatically, so a player may stay above `n`.
- **Echo**: mirrors placements/bird moves after two full turns.
- **Orbit**: stones move one orbit step per full turn (birds stay put).
- **Meteor**: every 3 full turns, farthest occupied spaces are removed.

## Project Structure

```text
index.html                        # Markup shell
styles.css                        # Styling and animated background
game.js                           # Game logic and rendering
server.js                         # Static host + WebSocket room server
server-path-utils.js              # Path-safety helper used by the server
tests/                            # Node test suite
```

## Publish Checklist

1. Run `npm test` and confirm all tests pass.
2. Start the app with `npm start` and verify local play + online room creation.
3. Ensure the deployed environment provides `PORT` (and optionally `WS_PATH`, `WS_HEARTBEAT_MS`).
4. If frontend/backend are split across hosts, configure the websocket endpoint (`?ws=`, meta tag, or `window.HEX_TTT_WS_URL`).

## License

This project is licensed under the [MIT License](./LICENSE).
