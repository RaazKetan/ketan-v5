import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useGitHubRepos } from "../../Hooks/useGitHubRepos";
import type { GitHubProject } from "../../Hooks/useGitHubRepos";
import { ProjectDialog } from "./ProjectDialog";

// ─── Constants ──────────────────────────────────────────────────────────────
const CANVAS_W = 900;
const CANVAS_H = 520;
const PLAYER_SPEED = 2.4;
const PLAYER_SIZE = 20;
const NPC_SIZE = 18;
const INTERACT_RADIUS = 62;
const WALL = 20; // border thickness

// Zone x-boundaries (each zone fills 1/3 of canvas width)
const ZONE_W = (CANVAS_W - WALL * 2) / 3;
const ZONES: Record<string, { x: number; label: string; color: string; emoji: string }> = {
  frontend:     { x: WALL,               label: "FRONTEND",     color: "#3178c6", emoji: "🎨" },
  backend:      { x: WALL + ZONE_W,      label: "BACKEND",      color: "#10b981", emoji: "⚙️" },
  experimental: { x: WALL + ZONE_W * 2,  label: "EXPERIMENTAL", color: "#f59e0b", emoji: "🔬" },
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: "left" | "right";
  walkFrame: number;
  frameTimer: number;
}

interface NPC {
  id: number;
  x: number;
  y: number;
  project: GitHubProject;
  bobPhase: number; // randomized start for the idle bob
  wanderTimer: number;
  wanderVx: number;
  wanderVy: number;
  facing: "left" | "right";
  walkFrame: number;
  frameTimer: number;
}

// ─── Helper: scatter NPC starting positions inside their zone ────────────────
function buildNpcs(projects: GitHubProject[]): NPC[] {
  const zoneCounts: Record<string, number> = {
    frontend: 0,
    backend: 0,
    experimental: 0,
  };

  return projects.map((p) => {
    const zone = ZONES[p.category];
    const idx = zoneCounts[p.category]++;
    const cols = 3;
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x = zone.x + 60 + col * 90 + Math.random() * 20 - 10;
    const y = 100 + row * 100 + Math.random() * 20 - 10;

    return {
      id: p.id,
      x: Math.min(x, CANVAS_W - WALL - NPC_SIZE),
      y: Math.min(y, CANVAS_H - WALL - NPC_SIZE - 40),
      project: p,
      bobPhase: Math.random() * Math.PI * 2,
      wanderTimer: Math.random() * 180 + 60,
      wanderVx: 0,
      wanderVy: 0,
      facing: "right",
      walkFrame: 0,
      frameTimer: 0,
    };
  });
}

// ─── Canvas Drawing Helpers ───────────────────────────────────────────────────

function drawFloor(ctx: CanvasRenderingContext2D) {
  // Base floor
  ctx.fillStyle = "#1a1f2e";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Fine grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= CANVAS_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }
}

function drawZones(ctx: CanvasRenderingContext2D) {
  Object.values(ZONES).forEach(({ x, label, color, emoji }) => {
    // Zone floor tint
    ctx.fillStyle = `${color}10`;
    ctx.fillRect(x, WALL, ZONE_W, CANVAS_H - WALL * 2);

    // Zone divider line
    ctx.strokeStyle = `${color}33`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, WALL);
    ctx.lineTo(x, CANVAS_H - WALL);
    ctx.stroke();

    // Zone label at top
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.fillStyle = `${color}99`;
    ctx.textAlign = "left";
    // letterSpacing is a newer Canvas2D API (not in TS DOM lib yet)
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "2px";
    const labelText = `${emoji} ${label}`;
    ctx.fillText(labelText, x + 8, WALL + 20);
  });
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, WALL);
  grad.addColorStop(0, "#374151");
  grad.addColorStop(1, "#1f2937");

  // Top wall
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, WALL);
  // Left
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, 0, WALL, CANVAS_H);
  // Right
  ctx.fillRect(CANVAS_W - WALL, 0, WALL, CANVAS_H);
  // Bottom
  ctx.fillRect(0, CANVAS_H - WALL, CANVAS_W, WALL);

  // Wall border highlight
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 1;
  ctx.strokeRect(WALL, WALL, CANVAS_W - WALL * 2, CANVAS_H - WALL * 2);
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Desk surface
  const g = ctx.createLinearGradient(x, y, x, y + 32);
  g.addColorStop(0, "#92400e");
  g.addColorStop(1, "#78350f");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, 70, 32);
  // Monitor
  ctx.fillStyle = "#111827";
  ctx.fillRect(x + 20, y - 22, 30, 20);
  ctx.fillStyle = "#1d4ed8";
  ctx.fillRect(x + 22, y - 20, 26, 14);
  // Screen glow
  ctx.fillStyle = "rgba(59,130,246,0.3)";
  ctx.fillRect(x + 22, y - 20, 26, 14);
  // Stand
  ctx.fillStyle = "#374151";
  ctx.fillRect(x + 32, y - 2, 6, 4);
  // Keyboard
  ctx.fillStyle = "#374151";
  ctx.fillRect(x + 10, y + 36, 50, 8);
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Pot
  ctx.fillStyle = "#b45309";
  ctx.fillRect(x, y + 24, 18, 14);
  // Stem
  ctx.fillStyle = "#166534";
  ctx.fillRect(x + 7, y + 4, 4, 22);
  // Leaves
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.ellipse(x + 9, y + 10, 12, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 9, y + 6, 8, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#78350f";
  ctx.fillRect(x, y, 60, 80);
  const bookColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  for (let shelf = 0; shelf < 3; shelf++) {
    for (let book = 0; book < 4; book++) {
      ctx.fillStyle = bookColors[(shelf * 4 + book) % bookColors.length];
      ctx.fillRect(x + 4 + book * 13, y + 8 + shelf * 24, 10, 18);
    }
    // Shelf board
    ctx.fillStyle = "#92400e";
    ctx.fillRect(x, y + shelf * 24 + 26, 60, 3);
  }
}

// ─── Ghost/Blob Character Drawing (matches Character.tsx style) ───────────────

function drawBlobCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number,    // center-x
  cy: number,    // center-y (blob center)
  color: string,
  size: number,  // radius
  isPlayer = false,
  bobOffset = 0,
  state: "idle" | "walking" | "typing" | "reading" | "waiting" = "idle"
) {
  ctx.save();
  ctx.translate(cx, cy + bobOffset);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, size + 4, size * 0.8, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body: rounded-top blob (like the ghost/pac-man style in Character.tsx)
  const w = size * 1.5;
  const h = size * 1.8;
  const r = w / 2;

  ctx.beginPath();
  // Top semicircle
  ctx.arc(0, -h / 2 + r, r, Math.PI, 0, false);
  // Right side down to wavy bottom
  ctx.lineTo(r, h / 2);
  // Bottom wavy "ghost skirt"
  const waves = 3;
  for (let i = 0; i < waves; i++) {
    const waveW = (w / waves);
    const xStart = r - i * waveW;
    const xEnd = xStart - waveW;
    const ctrl = xStart - waveW / 2;
    ctx.quadraticCurveTo(ctrl, h / 2 + (i % 2 === 0 ? 5 : -5), xEnd, h / 2);
  }
  ctx.lineTo(-r, -h / 2 + r);
  ctx.closePath();

  // Fill with gradient
  const grad = ctx.createLinearGradient(-r, -h / 2, r, h / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(1, `${color}99`);
  ctx.fillStyle = grad;
  ctx.fill();

  // Outline
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  const eyeY = -h / 2 + r * 0.8;
  const eyeX = r * 0.28;
  const eyeSize = r * 0.22;
  const eyeColor = state === "waiting" ? "#fbbf24" : "#1a1a2e";

  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(-eyeX, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  // White eye glint
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(-eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Mouth line for reading state
  if (state === "reading") {
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-eyeX, eyeY + eyeSize * 2);
    ctx.lineTo(eyeX, eyeY + eyeSize * 2);
    ctx.stroke();
  }

  // Crown for player
  if (isPlayer) {
    const crownY = -h / 2 + r - 2;
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, crownY);
    ctx.lineTo(-r * 0.6, crownY - 8);
    ctx.lineTo(-r * 0.2, crownY - 4);
    ctx.lineTo(0, crownY - 10);
    ctx.lineTo(r * 0.2, crownY - 4);
    ctx.lineTo(r * 0.6, crownY - 8);
    ctx.lineTo(r * 0.6, crownY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

function drawNPC(
  ctx: CanvasRenderingContext2D,
  npc: NPC,
  time: number,
  isNear: boolean
) {
  const bob = Math.sin(time * 0.003 + npc.bobPhase) * 2;
  const moving = Math.abs(npc.wanderVx) > 0.1 || Math.abs(npc.wanderVy) > 0.1;
  const state = moving ? "walking" : (time % 400 < 100 ? "typing" : "idle");

  drawBlobCharacter(
    ctx,
    npc.x,
    npc.y,
    npc.project.color,
    18,
    false,
    bob,
    state
  );

  // Name label
  ctx.save();
  const name = npc.project.name.length > 14
    ? npc.project.name.slice(0, 13) + "…"
    : npc.project.name;
  const labelW = Math.max(name.length * 6.5 + 10, 60);
  const labelX = npc.x - labelW / 2;
  const labelY = npc.y - 52;

  ctx.fillStyle = "rgba(17,24,39,0.9)";
  ctx.beginPath();
  roundRect(ctx, labelX, labelY, labelW, 16, 4);
  ctx.fill();

  ctx.strokeStyle = npc.project.color + "88";
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, labelX, labelY, labelW, 16, 4);
  ctx.stroke();

  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.fillStyle = "#e5e7eb";
  ctx.textAlign = "center";
  ctx.fillText(name, npc.x, labelY + 11);

  // "Press E" prompt
  if (isNear) {
    const eW = 64;
    const eX = npc.x - eW / 2;
    const eY = labelY - 22;

    ctx.fillStyle = "rgba(251,191,36,0.92)";
    ctx.beginPath();
    roundRect(ctx, eX, eY, eW, 16, 4);
    ctx.fill();

    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.fillText("[ E ] Chat", npc.x, eY + 11);
  }

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  const moving = player.vx !== 0 || player.vy !== 0;
  const state = moving ? "walking" : "idle";
  drawBlobCharacter(
    ctx,
    player.x,
    player.y,
    "#fbbf24",
    20,
    true,
    0,
    state
  );

  // "YOU" label
  ctx.save();
  const labelW = 36;
  const labelX = player.x - labelW / 2;
  const labelY = player.y - 56;

  ctx.fillStyle = "rgba(251,191,36,0.95)";
  ctx.beginPath();
  roundRect(ctx, labelX, labelY, labelW, 16, 4);
  ctx.fill();

  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.fillText("YOU", player.x, labelY + 11);
  ctx.restore();
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  totalNpcs: number,
  nearNpc: NPC | null
) {
  // Bottom-left stats
  ctx.save();
  ctx.fillStyle = "rgba(17,24,39,0.88)";
  ctx.beginPath();
  roundRect(ctx, WALL + 6, CANVAS_H - WALL - 54, 160, 48, 6);
  ctx.fill();

  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "left";
  ctx.fillText("OFFICE STATS", WALL + 14, CANVAS_H - WALL - 38);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "9px 'Courier New', monospace";
  ctx.fillText(`Projects: ${totalNpcs}`, WALL + 14, CANVAS_H - WALL - 25);
  ctx.fillText(
    nearNpc ? `Near: ${nearNpc.project.name.slice(0, 16)}` : "Explore the office!",
    WALL + 14,
    CANVAS_H - WALL - 12
  );
  ctx.restore();

  // Top-right controls hint
  ctx.save();
  ctx.fillStyle = "rgba(17,24,39,0.78)";
  ctx.beginPath();
  roundRect(ctx, CANVAS_W - WALL - 138, WALL + 6, 132, 48, 6);
  ctx.fill();

  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "left";
  ctx.fillText("CONTROLS", CANVAS_W - WALL - 130, WALL + 20);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "9px 'Courier New', monospace";
  ctx.fillText("WASD / Arrows: Move", CANVAS_W - WALL - 130, WALL + 33);
  ctx.fillText("E: Interact with NPC", CANVAS_W - WALL - 130, WALL + 46);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Furniture layout (static) ───────────────────────────────────────────────
const FURNITURE = (() => {
  const desks: { x: number; y: number }[] = [];
  const plants: { x: number; y: number }[] = [];
  const shelves: { x: number; y: number }[] = [];

  // Desks - one per zone, two rows
  Object.values(ZONES).forEach(({ x }, zi) => {
    desks.push({ x: x + 20, y: 300 });
    desks.push({ x: x + 120, y: 370 });
    if (zi === 0) plants.push({ x: x + 230, y: 80 });
  });

  // Bookshelves on right wall
  shelves.push({ x: CANVAS_W - WALL - 70, y: 80 });
  shelves.push({ x: CANVAS_W - WALL - 70, y: 200 });

  // Plants corners
  plants.push({ x: WALL + 10, y: CANVAS_H - WALL - 52 });
  plants.push({ x: CANVAS_W - WALL - 30, y: CANVAS_H - WALL - 52 });
  plants.push({ x: WALL + 10, y: 80 });

  return { desks, plants, shelves };
})();

// ─── Main Component ───────────────────────────────────────────────────────────
export const ProjectsGame: React.FC = () => {
  const { repos, loading, error } = useGitHubRepos("RaazKetan");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    player: Player;
    npcs: NPC[];
    keys: Set<string>;
    activeNpc: NPC | null;
    time: number;
    animId: number;
  }>({
    player: {
      x: CANVAS_W / 2,
      y: CANVAS_H - 70,
      vx: 0,
      vy: 0,
      facing: "right",
      walkFrame: 0,
      frameTimer: 0,
    },
    npcs: [],
    keys: new Set(),
    activeNpc: null,
    time: 0,
    animId: 0,
  });

  const [selectedProject, setSelectedProject] = useState<GitHubProject | null>(null);
  const [activeNpcState, setActiveNpcState] = useState<NPC | null>(null);

  // Build NPCs when repos load
  useEffect(() => {
    if (repos.length > 0) {
      stateRef.current.npcs = buildNpcs(repos);
    }
  }, [repos]);

  const handleInteract = useCallback(() => {
    const { activeNpc } = stateRef.current;
    if (activeNpc) {
      setSelectedProject(activeNpc.project);
    }
  }, []);

  // Key handlers
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      stateRef.current.keys.add(e.key);
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleInteract();
      }
      // Prevent page scroll from arrow keys
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.key);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [handleInteract]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    function clamp(val: number, min: number, max: number) {
      return Math.max(min, Math.min(max, val));
    }

    function dist(ax: number, ay: number, bx: number, by: number) {
      return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
    }

    function tick() {
      const s = stateRef.current;
      s.time++;

      // ── Player movement ──
      const { keys, player } = s;
      player.vx = 0;
      player.vy = 0;

      if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) player.vx = -PLAYER_SPEED;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) player.vx = PLAYER_SPEED;
      if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) player.vy = -PLAYER_SPEED;
      if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) player.vy = PLAYER_SPEED;

      // Normalize diagonal
      if (player.vx !== 0 && player.vy !== 0) {
        player.vx *= 0.707;
        player.vy *= 0.707;
      }

      player.x = clamp(player.x + player.vx, WALL + PLAYER_SIZE / 2, CANVAS_W - WALL - PLAYER_SIZE / 2);
      player.y = clamp(player.y + player.vy, WALL + 30, CANVAS_H - WALL - 4);

      if (player.vx > 0) player.facing = "right";
      if (player.vx < 0) player.facing = "left";

      // Walk animation
      const isMoving = player.vx !== 0 || player.vy !== 0;
      if (isMoving) {
        player.frameTimer++;
        if (player.frameTimer >= 10) {
          player.walkFrame = (player.walkFrame + 1) % 3;
          player.frameTimer = 0;
        }
      } else {
        player.walkFrame = 0;
        player.frameTimer = 0;
      }

      // ── NPC wander ──
      for (const npc of s.npcs) {
        if (npc.wanderTimer <= 0) {
          // Pick a new wandering direction (or stand still)
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() < 0.4 ? 0 : 0.5 + Math.random() * 0.7;
          npc.wanderVx = Math.cos(angle) * speed;
          npc.wanderVy = Math.sin(angle) * speed;
          npc.wanderTimer = 80 + Math.floor(Math.random() * 180);
        }
        npc.wanderTimer--;

        // Move npc, keep inside zone + border
        const zone = ZONES[npc.project.category];
        const zoneRight = zone.x + ZONE_W;
        npc.x = clamp(npc.x + npc.wanderVx, zone.x + 8, zoneRight - 8);
        npc.y = clamp(npc.y + npc.wanderVy, WALL + 40, CANVAS_H - WALL - 50);

        const moving = Math.abs(npc.wanderVx) > 0.05 || Math.abs(npc.wanderVy) > 0.05;
        if (npc.wanderVx > 0.05) npc.facing = "right";
        if (npc.wanderVx < -0.05) npc.facing = "left";

        if (moving) {
          npc.frameTimer++;
          if (npc.frameTimer >= 14) {
            npc.walkFrame = (npc.walkFrame + 1) % 3;
            npc.frameTimer = 0;
          }
        } else {
          npc.walkFrame = 0;
          npc.frameTimer = 0;
        }
      }

      // ── Proximity check ──
      let closest: NPC | null = null;
      let closestDist = INTERACT_RADIUS;
      for (const npc of s.npcs) {
        const d = dist(player.x, player.y, npc.x, npc.y);
        if (d < closestDist) {
          closestDist = d;
          closest = npc;
        }
      }
      if (closest !== s.activeNpc) {
        s.activeNpc = closest;
        setActiveNpcState(closest);
      }

      // ── Render ──
      drawFloor(ctx);
      drawZones(ctx);

      // Furniture
      for (const { x, y } of FURNITURE.desks) drawDesk(ctx, x, y);
      for (const { x, y } of FURNITURE.plants) drawPlant(ctx, x, y);
      for (const { x, y } of FURNITURE.shelves) drawBookshelf(ctx, x, y);

      drawWalls(ctx);

      // NPCs
      for (const npc of s.npcs) {
        drawNPC(ctx, npc, s.time, npc === s.activeNpc);
      }

      // Player
      drawPlayer(ctx, player);

      // HUD
      drawHUD(ctx, s.npcs.length, s.activeNpc);

      s.animId = requestAnimationFrame(tick);
    }

    const s = stateRef.current;
    s.animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s.animId);
  }, []); // only run on mount; state is managed via ref

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {/* Loading / Error overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(17,24,39,0.92)",
            zIndex: 10,
            flexDirection: "column",
            gap: "0.5rem",
            fontFamily: "'Courier New', monospace",
            color: "#fbbf24",
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: "12px",
          }}
        >
          <span>👾</span>
          <span>Loading repos from GitHub…</span>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "0.72rem",
            color: "#fca5a5",
            fontFamily: "'Courier New', monospace",
            zIndex: 5,
            whiteSpace: "nowrap",
          }}
        >
          API rate-limited - showing fallback data
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          width: "100%",
          maxWidth: CANVAS_W,
          borderRadius: "14px",
          border: "3px solid #374151",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.6)",
          imageRendering: "pixelated",
          display: "block",
          cursor: "crosshair",
        }}
        tabIndex={0}
      />

      {/* Proximity note */}
      {activeNpcState && !selectedProject && (
        <div
          style={{
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.4)",
            borderRadius: "8px",
            padding: "4px 16px",
            fontSize: "0.78rem",
            color: "#fbbf24",
            fontFamily: "'Courier New', monospace",
            fontWeight: 700,
          }}
        >
          Press <kbd style={{ background: "#374151", borderRadius: "4px", padding: "1px 6px" }}>E</kbd> to inspect <strong>{activeNpcState.project.name}</strong>
        </div>
      )}

      {/* Dialog portal */}
      <ProjectDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};
