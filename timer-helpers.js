(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.HexTicTacToeTimer = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const MIN_INITIAL_SECONDS = 1;
  const MAX_INITIAL_SECONDS = 180 * 60;

  function toFiniteNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function clampInteger(value, min, max) {
    return Math.max(min, Math.min(max, Math.round(toFiniteNumber(value, min))));
  }

  function resolveInitialSeconds(config) {
    const safe = config || {};
    if (Number.isFinite(Number(safe.initialSeconds))) {
      return clampInteger(safe.initialSeconds, MIN_INITIAL_SECONDS, MAX_INITIAL_SECONDS);
    }

    const legacyMinutes = toFiniteNumber(safe.initialMinutes, 5);
    return clampInteger(legacyMinutes * 60, MIN_INITIAL_SECONDS, MAX_INITIAL_SECONDS);
  }

  function normaliseTimerConfig(config) {
    const safe = config || {};
    const enabled = Boolean(safe.enabled);
    const initialSeconds = resolveInitialSeconds(safe);
    const incrementSeconds = Math.max(0, Math.min(120, Math.round(toFiniteNumber(safe.incrementSeconds, 2))));
    return {
      enabled,
      initialSeconds,
      initialMinutes: Math.floor(initialSeconds / 60),
      initialSecondsPart: initialSeconds % 60,
      incrementSeconds
    };
  }

  function normalisePlayerCount(playerCount) {
    const parsed = Math.trunc(Number(playerCount) || 2);
    return Math.max(2, Math.min(4, parsed));
  }

  function createRemainingMap(initialSeconds, playerCount) {
    const remaining = {};
    for (let player = 1; player <= normalisePlayerCount(playerCount); player += 1) {
      remaining[player] = initialSeconds;
    }
    return remaining;
  }

  function createClockState(config, playerCount = 2) {
    const timer = normaliseTimerConfig(config);
    const initialSeconds = timer.initialSeconds;
    const safePlayerCount = normalisePlayerCount(playerCount);
    return {
      enabled: timer.enabled,
      initialSeconds,
      incrementSeconds: timer.incrementSeconds,
      playerCount: safePlayerCount,
      remaining: createRemainingMap(initialSeconds, safePlayerCount),
      activePlayer: 1,
      flaggedPlayer: 0
    };
  }

  function formatClock(seconds) {
    const clamped = Math.max(0, toFiniteNumber(seconds, 0));
    const total = Math.floor(clamped);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function applyElapsed(clock, elapsedSeconds) {
    if (!clock || !clock.enabled || clock.flaggedPlayer) {
      return { expiredPlayer: 0 };
    }

    const elapsed = Math.max(0, toFiniteNumber(elapsedSeconds, 0));
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
  }

  function switchTurnWithIncrement(clock, nextPlayer) {
    if (!clock) {
      return;
    }

    const current = Math.max(1, Math.min(normalisePlayerCount(clock.playerCount), Math.trunc(Number(clock.activePlayer) || 1)));
    if (clock.enabled && !clock.flaggedPlayer) {
      if (!Number.isFinite(Number(clock.remaining?.[current]))) {
        clock.remaining[current] = clock.initialSeconds || 0;
      }
      clock.remaining[current] += Math.max(0, toFiniteNumber(clock.incrementSeconds, 0));
    }
    clock.activePlayer = Math.max(1, Math.min(normalisePlayerCount(clock.playerCount), Math.trunc(Number(nextPlayer) || 1)));
  }

  function setTimerEnabled(clock, enabled) {
    if (!clock) {
      return;
    }
    clock.enabled = Boolean(enabled);
  }

  return {
    normaliseTimerConfig,
    createClockState,
    formatClock,
    applyElapsed,
    switchTurnWithIncrement,
    setTimerEnabled
  };
}));
