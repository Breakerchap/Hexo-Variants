(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.HexTicTacToePatternHelpers = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const SQRT3 = Math.sqrt(3);
  const TRIANGLE_PICK_RADIUS = 2;
  const UNIT_SIZE = 24;

  function keyOf(q, r) {
    return `${q},${r}`;
  }

  function positiveMod(value, modulus) {
    return ((value % modulus) + modulus) % modulus;
  }

  function roundPoint(point) {
    return {
      x: Number(point.x.toFixed(6)),
      y: Number(point.y.toFixed(6))
    };
  }

  function normaliseGrid(grid) {
    const safeGrid = String(grid || "").toLowerCase();
    return ["hex", "triangle", "square", "octagon"].includes(safeGrid) ? safeGrid : "";
  }

  function supportsGrid(grid) {
    return Boolean(normaliseGrid(grid));
  }

  function normaliseOutcome(outcome) {
    return String(outcome || "").toLowerCase() === "loss" ? "loss" : "win";
  }

  function normaliseOwner(owner) {
    const value = Math.trunc(Number(owner) || 0);
    if (value < 0) {
      return 0;
    }
    return value;
  }

  function normaliseCell(cell) {
    if (!cell || !Number.isFinite(Number(cell.q)) || !Number.isFinite(Number(cell.r))) {
      return null;
    }
    return {
      q: Math.trunc(Number(cell.q)),
      r: Math.trunc(Number(cell.r))
    };
  }

  function dedupeCells(cells) {
    const byKey = new Map();
    for (const rawCell of Array.isArray(cells) ? cells : []) {
      const cell = normaliseCell(rawCell);
      if (!cell) {
        continue;
      }
      byKey.set(keyOf(cell.q, cell.r), cell);
    }
    return Array.from(byKey.values());
  }

  function sortCells(cells) {
    return [...cells].sort((a, b) => {
      if (a.q !== b.q) {
        return a.q - b.q;
      }
      return a.r - b.r;
    });
  }

  function rotatePoint(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return roundPoint({
      x: (point.x * cos) - (point.y * sin),
      y: (point.x * sin) + (point.y * cos)
    });
  }

  function getRotationCount(grid) {
    return grid === "hex" || grid === "triangle" ? 6 : 4;
  }

  function getRotationAngle(grid) {
    return grid === "hex" || grid === "triangle" ? (Math.PI / 3) : (Math.PI / 2);
  }

  function getTriangleEdgeLength(size) {
    return Math.max(6, Number(size) || 0);
  }

  function triangleVertexToPixel(vertexI, vertexJ, edgeLength) {
    return {
      x: edgeLength * (vertexI + (vertexJ / 2)),
      y: edgeLength * (SQRT3 / 2) * vertexJ
    };
  }

  function isOddInt(value) {
    return Math.abs(Math.trunc(Number(value) || 0)) % 2 === 1;
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

  function axialRound(frac) {
    let q = Math.round(frac.q);
    let r = Math.round(frac.r);
    const s = Math.round(-frac.q - frac.r);

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

  function isOctagonTileCoordinate(hex) {
    const q = Math.trunc(Number(hex?.q) || 0);
    const r = Math.trunc(Number(hex?.r) || 0);
    return (Math.abs(q) % 2) === (Math.abs(r) % 2);
  }

  function cellToPoint(grid, cell, size = UNIT_SIZE) {
    if (grid === "triangle") {
      return getTriangleCellCenter(cell, size);
    }
    if (grid === "square") {
      return {
        x: Math.max(8, Number(size) || 0) * 2 * (Number(cell?.q) || 0),
        y: Math.max(8, Number(size) || 0) * 2 * (Number(cell?.r) || 0)
      };
    }
    if (grid === "octagon") {
      const halfPitch = (Math.max(8, Number(size) || 0) * Math.cos(Math.PI / 8) * 2) / 2;
      return {
        x: halfPitch * (Number(cell?.q) || 0),
        y: halfPitch * (Number(cell?.r) || 0)
      };
    }
    return {
      x: size * SQRT3 * ((Number(cell?.q) || 0) + ((Number(cell?.r) || 0) / 2)),
      y: size * 1.5 * (Number(cell?.r) || 0)
    };
  }

  function pointToCell(grid, point, size = UNIT_SIZE) {
    if (grid === "triangle") {
      return pixelToTriangleCell(point.x, point.y, size);
    }
    if (grid === "square") {
      const pitch = Math.max(8, Number(size) || 0) * 2;
      return {
        q: Math.round(point.x / pitch),
        r: Math.round(point.y / pitch)
      };
    }
    if (grid === "octagon") {
      const halfPitch = (Math.max(8, Number(size) || 0) * Math.cos(Math.PI / 8) * 2) / 2;
      const qFloat = point.x / halfPitch;
      const rFloat = point.y / halfPitch;
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

    const q = ((SQRT3 / 3) * point.x - (1 / 3) * point.y) / size;
    const r = ((2 / 3) * point.y) / size;
    return axialRound({ q, r });
  }

  function buildPatternVariants(grid, vectors) {
    const rotationCount = getRotationCount(grid);
    const rotationAngle = getRotationAngle(grid);
    const anchorCell = { q: 0, r: 0 };
    const anchorPoint = cellToPoint(grid, anchorCell);
    const variants = [];
    const seenSignatures = new Set();

    for (let step = 0; step < rotationCount; step += 1) {
      const angle = rotationAngle * step;
      const rotatedVectors = vectors.map((vector) => rotatePoint(vector, angle));
      const cells = sortCells(dedupeCells(
        rotatedVectors.map((vector) => pointToCell(grid, {
          x: anchorPoint.x + vector.x,
          y: anchorPoint.y + vector.y
        }))
      ));
      if (cells.length !== vectors.length) {
        continue;
      }
      const signature = cells.map((cell) => keyOf(cell.q, cell.r)).join("|");
      if (seenSignatures.has(signature)) {
        continue;
      }
      seenSignatures.add(signature);
      variants.push({
        step,
        vectors: rotatedVectors,
        cells,
        signature
      });
    }

    return variants;
  }

  function buildPatternRule(config = {}) {
    const grid = normaliseGrid(config.grid);
    if (!grid) {
      return null;
    }
    const sourceCells = sortCells(dedupeCells(config.cells));
    if (sourceCells.length === 0) {
      return null;
    }

    const anchorCell = sourceCells[0];
    const anchorPoint = cellToPoint(grid, anchorCell);
    const vectors = sourceCells.map((cell) => {
      const point = cellToPoint(grid, cell);
      return roundPoint({
        x: point.x - anchorPoint.x,
        y: point.y - anchorPoint.y
      });
    });
    const variants = buildPatternVariants(grid, vectors);
    if (variants.length === 0) {
      return null;
    }

    return {
      id: String(config.id || ""),
      grid,
      owner: normaliseOwner(config.owner),
      outcome: normaliseOutcome(config.outcome),
      cellCount: sourceCells.length,
      templateCells: variants[0].cells,
      variants
    };
  }

  function getOccupiedKeySet(occupiedCells) {
    const occupied = dedupeCells(occupiedCells);
    return {
      cells: occupied,
      keySet: new Set(occupied.map((cell) => keyOf(cell.q, cell.r)))
    };
  }

  function findPatternMatch(rule, occupiedCells, occupiedKeySet = null) {
    if (!rule || !supportsGrid(rule.grid)) {
      return null;
    }
    const occupied = Array.isArray(occupiedCells) ? occupiedCells.map(normaliseCell).filter(Boolean) : [];
    if (occupied.length < Math.max(1, Math.trunc(Number(rule.cellCount) || 0))) {
      return null;
    }
    const keySet = occupiedKeySet instanceof Set ? occupiedKeySet : new Set(occupied.map((cell) => keyOf(cell.q, cell.r)));

    for (let variantIndex = 0; variantIndex < rule.variants.length; variantIndex += 1) {
      const variant = rule.variants[variantIndex];
      for (const anchorCell of occupied) {
        const anchorPoint = cellToPoint(rule.grid, anchorCell);
        const matchedCells = [];
        let matched = true;

        for (const vector of variant.vectors) {
          const targetCell = pointToCell(rule.grid, {
            x: anchorPoint.x + vector.x,
            y: anchorPoint.y + vector.y
          });
          const key = keyOf(targetCell.q, targetCell.r);
          if (!keySet.has(key)) {
            matched = false;
            break;
          }
          matchedCells.push(targetCell);
        }

        if (matched) {
          return {
            anchorCell,
            variantIndex,
            rotationStep: variant.step,
            cells: sortCells(dedupeCells(matchedCells))
          };
        }
      }
    }

    return null;
  }

  return {
    keyOf,
    positiveMod,
    normaliseGrid,
    supportsGrid,
    buildPatternRule,
    buildPatternVariants,
    getOccupiedKeySet,
    findPatternMatch
  };
}));
