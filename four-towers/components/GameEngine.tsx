import React, { useEffect, useRef, useState } from 'react';
import { 
  Entity, Player, Enemy, Projectile, Particle, Vector3, 
  ElementType, GameState, TILE_SIZE, Polyomino
} from '../types';
import { generateLevel, TileType } from '../services/levelGen';
import { COLORS, MAP_WIDTH, MAP_HEIGHT, STARTING_POLYOMINOS, ISO_ANGLE } from '../constants';
import Inventory from './Inventory';
import { getNerdstormTaunt } from '../services/geminiService';
import { Zap, Heart, RefreshCw } from 'lucide-react';

const INITIAL_PLAYER: Player = {
  id: 'player',
  type: 'PLAYER',
  pos: { x: 0, y: 0, z: 0 },
  vel: { x: 0, y: 0, z: 0 },
  size: 10, // Slightly smaller bounding box for tighter movement
  color: '#ffffff',
  health: 100,
  maxHealth: 100,
  dead: false,
  cooldown: 0,
  dashCooldown: 0,
  iFrames: 0,
  element: ElementType.NEUTRAL,
  stats: {
    speed: 3.5,
    damage: 10,
    fireRate: 15, 
    projectileSpeed: 8, // Faster shots
    multishot: 1
  },
  inventory: [...STARTING_POLYOMINOS],
  equipped: new Array(16).fill(null), 
};

INITIAL_PLAYER.equipped[5] = STARTING_POLYOMINOS[0]; 

const GameEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State Refs
  const playerRef = useRef<Player>(JSON.parse(JSON.stringify(INITIAL_PLAYER)));
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mapRef = useRef<TileType[][]>([]);
  const keysRef = useRef<{[key: string]: boolean}>({});
  const mouseRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  const cameraRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  const frameRef = useRef<number>(0);
  const shakeRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>({
    floor: 1,
    score: 0,
    isPaused: false,
    isGameOver: false,
    isInInventory: false,
    message: "Welcome to Nerdstorm's Realm."
  });
  
  const [taunt, setTaunt] = useState<string>("");

  useEffect(() => {
    initLevel(1);
    
    const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent browser scrolling with space/arrows
        if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
        keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.code] = false;
    const handleMouseMove = (e: MouseEvent) => {
       const rect = canvasRef.current?.getBoundingClientRect();
       if(rect) {
         mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
       }
    };
    const handleMouseDown = (e: MouseEvent) => keysRef.current['MouseLeft'] = true;
    const handleMouseUp = (e: MouseEvent) => keysRef.current['MouseLeft'] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let animationId: number;
    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Logic Helpers ---

  const initLevel = (floor: number) => {
    const map = generateLevel(floor);
    mapRef.current = map;
    
    // Find spawn
    let spawnX = 5, spawnY = 5;
    for(let y=0; y<MAP_HEIGHT; y++) {
      for(let x=0; x<MAP_WIDTH; x++) {
        if(map[y][x] === TileType.SPAWN) {
          spawnX = x * TILE_SIZE + TILE_SIZE/2;
          spawnY = y * TILE_SIZE + TILE_SIZE/2;
        }
      }
    }

    playerRef.current.pos = { x: spawnX, y: spawnY, z: 0 };
    playerRef.current.vel = { x: 0, y: 0, z: 0 };
    
    // Improved Difficulty Scaling
    const newEnemies: Enemy[] = [];
    const enemyCount = 6 + Math.floor(floor * 2.5);
    
    for(let i=0; i<enemyCount; i++) {
       let ex = Math.floor(Math.random() * MAP_WIDTH);
       let ey = Math.floor(Math.random() * MAP_HEIGHT);
       // Ensure not spawning on walls or TOO close to spawn
       while(map[ey][ex] !== TileType.FLOOR || Math.hypot(ex*TILE_SIZE - spawnX, ey*TILE_SIZE - spawnY) < 300) {
          ex = Math.floor(Math.random() * MAP_WIDTH);
          ey = Math.floor(Math.random() * MAP_HEIGHT);
       }
       
       newEnemies.push({
         id: `e-${i}`,
         type: 'ENEMY',
         pos: { x: ex * TILE_SIZE + 16, y: ey * TILE_SIZE + 16, z: 0 },
         vel: { x: 0, y: 0, z: 0 },
         size: 12,
         color: COLORS[ElementType.DARK],
         health: 25 + floor * 8,
         maxHealth: 25 + floor * 8,
         dead: false,
         aiType: Math.random() > 0.6 ? 'RANGED' : 'MELEE',
         attackCooldown: Math.random() * 100,
         range: Math.random() > 0.6 ? 200 : 35
       });
    }
    enemiesRef.current = newEnemies;
    projectilesRef.current = [];
    particlesRef.current = [];
    shakeRef.current = 0;

    getNerdstormTaunt(playerRef.current, { ...gameState, floor }, 'NEW_FLOOR').then(setTaunt);
  };

  const spawnParticles = (pos: Vector3, color: string, count: number, speed: number = 4) => {
    for(let i=0; i<count; i++) {
      particlesRef.current.push({
        id: `p-${Math.random()}`,
        type: 'PARTICLE',
        pos: { ...pos },
        vel: { 
            x: (Math.random() - 0.5) * speed, 
            y: (Math.random() - 0.5) * speed, 
            z: Math.random() * (speed * 0.8) 
        },
        size: Math.random() * 3 + 1,
        color,
        health: 1, maxHealth: 1,
        lifeTime: 20 + Math.random() * 20,
        dead: false
      });
    }
  };

  // Robust Collision: Checks 4 corners of the entity's bounding box
  const checkRectCollision = (x: number, y: number, size: number): boolean => {
    const margin = 2; // Pixel buffer
    // Check points relative to tile grid
    const points = [
        { x: x - size + margin, y: y - size + margin }, // Top Left
        { x: x + size - margin, y: y - size + margin }, // Top Right
        { x: x - size + margin, y: y + size - margin }, // Bottom Left
        { x: x + size - margin, y: y + size - margin }, // Bottom Right
    ];

    for(const p of points) {
        const tx = Math.floor(p.x / TILE_SIZE);
        const ty = Math.floor(p.y / TILE_SIZE);
        
        if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) return true;
        const tile = mapRef.current[ty][tx];
        if (tile === TileType.WALL || tile === TileType.VOID) return true;
    }
    return false;
  };

  // --- Game Loop ---

  const update = () => {
    if (gameState.isPaused || gameState.isInInventory || gameState.isGameOver) return;
    frameRef.current++;
    if(shakeRef.current > 0) shakeRef.current *= 0.9;
    if(shakeRef.current < 0.5) shakeRef.current = 0;

    const player = playerRef.current;
    
    // 1. Player Movement with Slide Logic
    const speed = player.stats.speed;
    let dx = 0, dy = 0;
    if (keysRef.current['KeyW']) { dx -= speed; dy -= speed; }
    if (keysRef.current['KeyS']) { dx += speed; dy += speed; }
    if (keysRef.current['KeyA']) { dx -= speed; dy += speed; }
    if (keysRef.current['KeyD']) { dx += speed; dy -= speed; }

    if (dx !== 0 && dy !== 0) {
      dx *= 0.707; dy *= 0.707;
    }

    // Try Moving X
    if (!checkRectCollision(player.pos.x + dx, player.pos.y, player.size)) {
        player.pos.x += dx;
    }
    // Try Moving Y
    if (!checkRectCollision(player.pos.x, player.pos.y + dy, player.size)) {
        player.pos.y += dy;
    }

    // Floor Interaction
    const pgx = Math.floor(player.pos.x / TILE_SIZE);
    const pgy = Math.floor(player.pos.y / TILE_SIZE);
    if (mapRef.current[pgy]?.[pgx] === TileType.EXIT && enemiesRef.current.length === 0) {
      setGameState(prev => ({ ...prev, floor: prev.floor + 1 }));
      initLevel(gameState.floor + 1);
      return;
    }

    // Dash
    if (keysRef.current['Space'] && player.dashCooldown <= 0) {
       player.dashCooldown = 50;
       spawnParticles(player.pos, '#ffffff', 12, 6);
       shakeRef.current = 5;
       const dashSpeed = 12; // High speed iteration instead of teleport to prevent clipping
       const steps = 6;
       for(let i=0; i<steps; i++) {
           let ddx = dx * dashSpeed;
           let ddy = dy * dashSpeed;
           if (!checkRectCollision(player.pos.x + ddx, player.pos.y + ddy, player.size)) {
                player.pos.x += ddx;
                player.pos.y += ddy;
           } else {
               break; 
           }
       }
    }
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.cooldown > 0) player.cooldown--;
    if (player.iFrames > 0) player.iFrames--;

    // 2. Shooting
    if (keysRef.current['MouseLeft'] && player.cooldown <= 0) {
      player.cooldown = player.stats.fireRate;
      
      const screenCx = window.innerWidth / 2;
      const screenCy = window.innerHeight / 2;
      const aimDx = mouseRef.current.x - screenCx;
      const aimDy = mouseRef.current.y - screenCy;
      
      const worldDirX = aimDx + 2 * aimDy;
      const worldDirY = 2 * aimDy - aimDx;
      
      const len = Math.hypot(worldDirX, worldDirY);
      const projSpeed = player.stats.projectileSpeed;
      const dirX = (worldDirX / len) * projSpeed;
      const dirY = (worldDirY / len) * projSpeed;

      // Muzzle Flash
      spawnParticles({ ...player.pos, z: 15 }, COLORS[player.element], 5, 2);

      projectilesRef.current.push({
        id: `proj-${Math.random()}`,
        type: 'PROJECTILE',
        pos: { ...player.pos, z: 12 },
        vel: { x: dirX, y: dirY, z: 0 },
        size: 5,
        color: COLORS[player.element] || '#fff',
        ownerId: 'player',
        damage: player.stats.damage,
        element: player.element,
        lifeTime: 80,
        health: 1, maxHealth: 1, dead: false
      });
    }

    // 3. Update Projectiles
    projectilesRef.current.forEach(p => {
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      p.lifeTime--;
      if (p.lifeTime <= 0 || checkRectCollision(p.pos.x, p.pos.y, p.size)) {
          p.dead = true;
          spawnParticles(p.pos, p.color, 3, 2);
      }
      
      // Hit Enemies
      if (p.ownerId === 'player') {
        enemiesRef.current.forEach(e => {
          if (!e.dead && Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y) < e.size + p.size) {
            e.health -= p.damage;
            p.dead = true;
            spawnParticles({ ...e.pos, z: 10 }, e.color, 5, 3); // Blood
            if (e.health <= 0) {
               e.dead = true;
               shakeRef.current = 4; // Kill shake
               setGameState(prev => ({ ...prev, score: prev.score + 100 }));
               if (Math.random() > 0.6) { // Higher drop rate
                  const newPiece = STARTING_POLYOMINOS[Math.floor(Math.random() * STARTING_POLYOMINOS.length)];
                  player.inventory.push({ ...newPiece, id: `loot-${Math.random()}` });
                  setTaunt("A rune of power! Press 'I'!");
               }
            }
          }
        });
      } else if (p.ownerId !== 'player') {
         // Hit Player
         if (Math.hypot(player.pos.x - p.pos.x, player.pos.y - p.pos.y) < player.size + p.size) {
            if (player.iFrames <= 0) {
               player.health -= p.damage;
               player.iFrames = 20;
               p.dead = true;
               shakeRef.current = 10; // Big shake on damage
               spawnParticles(player.pos, '#ff0000', 8, 4);
               if (player.health <= 0) {
                 player.dead = true;
                 setGameState(prev => ({ ...prev, isGameOver: true }));
                 getNerdstormTaunt(player, gameState, 'DEATH').then(setTaunt);
               }
            }
         }
      }
    });
    projectilesRef.current = projectilesRef.current.filter(p => !p.dead);
    enemiesRef.current = enemiesRef.current.filter(e => !e.dead);

    // 4. Update Enemies (Harder AI)
    enemiesRef.current.forEach(e => {
      const dist = Math.hypot(player.pos.x - e.pos.x, player.pos.y - e.pos.y);
      
      // Simple Separation (Don't stack)
      let pushX = 0, pushY = 0;
      enemiesRef.current.forEach(other => {
          if (e === other) return;
          const dx = e.pos.x - other.pos.x;
          const dy = e.pos.y - other.pos.y;
          const d = Math.hypot(dx, dy);
          if (d < e.size * 2 && d > 0) {
              pushX += (dx / d) * 1.5; // Separation force
              pushY += (dy / d) * 1.5;
          }
      });

      // Move towards player
      if (dist < 400) { 
        const dx = player.pos.x - e.pos.x;
        const dy = player.pos.y - e.pos.y;
        const len = Math.hypot(dx, dy);
        
        // Base movement
        let moveX = (dx / len) * (2.0 + gameState.floor * 0.1); // Faster!
        let moveY = (dy / len) * (2.0 + gameState.floor * 0.1);

        if (dist < e.size * 2) {
             moveX = 0; moveY = 0; // Stop if touching player
        }

        // Apply velocities
        const finalVx = moveX + pushX;
        const finalVy = moveY + pushY;
        
        if (!checkRectCollision(e.pos.x + finalVx, e.pos.y, e.size)) e.pos.x += finalVx;
        if (!checkRectCollision(e.pos.x, e.pos.y + finalVy, e.size)) e.pos.y += finalVy;
        
        // Attack
        if (e.attackCooldown > 0) e.attackCooldown--;
        if (e.attackCooldown <= 0 && dist < e.range) {
           e.attackCooldown = 60; // Faster attacks
           if (e.aiType === 'RANGED') {
              const pVelX = (dx/len) * 5; // Faster projectiles
              const pVelY = (dy/len) * 5;
              projectilesRef.current.push({
                id: `ep-${Math.random()}`,
                type: 'PROJECTILE',
                pos: { ...e.pos, z: 12 },
                vel: { x: pVelX, y: pVelY, z: 0 },
                size: 5,
                color: '#ff00ff',
                ownerId: e.id,
                damage: 5 + gameState.floor * 2,
                element: ElementType.DARK,
                lifeTime: 80, health: 1, maxHealth: 1, dead: false
              });
           } else {
             // Melee
             if (dist < 30 && player.iFrames <= 0) {
                player.health -= (10 + gameState.floor);
                player.iFrames = 20;
                shakeRef.current = 8;
                spawnParticles(player.pos, '#ff0000', 5);
                if (player.health <= 0) {
                   player.dead = true;
                   setGameState(prev => ({ ...prev, isGameOver: true }));
                }
             }
           }
        }
      }
    });

    // 5. Update Particles
    particlesRef.current.forEach(p => {
       p.pos.x += p.vel.x;
       p.pos.y += p.vel.y;
       p.pos.z += p.vel.z;
       p.vel.z -= 0.3; 
       if (p.pos.z < 0) { p.pos.z = 0; p.vel.z *= -0.5; p.vel.x *= 0.8; p.vel.y *= 0.8; }
       p.lifeTime--;
    });
    particlesRef.current = particlesRef.current.filter(p => p.lifeTime > 0);

    // 6. Camera Follow with Shake
    const targetCamX = player.pos.x;
    const targetCamY = player.pos.y;
    cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
    cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1;

    // Toggle Inventory
    if (keysRef.current['KeyI']) {
       keysRef.current['KeyI'] = false; 
       setGameState(prev => ({ ...prev, isInInventory: true, isPaused: true }));
    }
  };

  // --- Rendering ---
  
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    // Apply Screen Shake
    const shakeX = (Math.random() - 0.5) * shakeRef.current;
    const shakeY = (Math.random() - 0.5) * shakeRef.current;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const toIso = (x: number, y: number, z: number) => {
      const rx = x - cameraRef.current.x;
      const ry = y - cameraRef.current.y;
      const isoX = (rx - ry) * Math.cos(ISO_ANGLE);
      const isoY = (rx + ry) * Math.sin(ISO_ANGLE) - z;
      return { x: cx + isoX, y: cy + isoY };
    };

    // Draw Map 
    const viewDist = 24; 
    const pTileX = Math.floor(cameraRef.current.x / TILE_SIZE);
    const pTileY = Math.floor(cameraRef.current.y / TILE_SIZE);
    
    for (let y = pTileY - viewDist; y < pTileY + viewDist; y++) {
      for (let x = pTileX - viewDist; x < pTileX + viewDist; x++) {
        if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) continue;
        const tile = mapRef.current[y][x];
        
        if (tile !== TileType.VOID) {
          const p1 = toIso(x * TILE_SIZE, y * TILE_SIZE, 0);
          const p2 = toIso((x+1) * TILE_SIZE, y * TILE_SIZE, 0);
          const p3 = toIso((x+1) * TILE_SIZE, (y+1) * TILE_SIZE, 0);
          const p4 = toIso(x * TILE_SIZE, (y+1) * TILE_SIZE, 0);
          
          // Draw Walls with more depth
          if (tile === TileType.WALL) {
             const h = 48; // Taller walls
             // Top
             ctx.fillStyle = '#52525b'; 
             ctx.beginPath(); ctx.moveTo(p4.x, p4.y - h); ctx.lineTo(p3.x, p3.y - h); ctx.lineTo(p2.x, p2.y - h); ctx.lineTo(p1.x, p1.y - h); ctx.fill();
             // Highlight Edge
             ctx.strokeStyle = '#71717a'; ctx.lineWidth = 1; ctx.stroke();
             
             // Left
             ctx.fillStyle = '#27272a';
             ctx.beginPath(); ctx.moveTo(p4.x, p4.y); ctx.lineTo(p4.x, p4.y - h); ctx.lineTo(p3.x, p3.y - h); ctx.lineTo(p3.x, p3.y); ctx.fill();
             // Right
             ctx.fillStyle = '#18181b'; // Darker right side for simple shading
             ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p3.x, p3.y - h); ctx.lineTo(p2.x, p2.y - h); ctx.lineTo(p2.x, p2.y); ctx.fill();
          } else {
              // Floor
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
              ctx.fillStyle = tile === TileType.FLOOR ? COLORS.FLOOR 
                : tile === TileType.SPAWN ? '#065f46' 
                : tile === TileType.EXIT ? '#be185d'
                : COLORS.FLOOR_HIGHLIGHT;
              ctx.fill();
              // Grid lines
              ctx.strokeStyle = '#333'; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    }

    const entities: Entity[] = [playerRef.current, ...enemiesRef.current, ...projectilesRef.current, ...particlesRef.current];
    entities.sort((a, b) => (a.pos.x + a.pos.y) - (b.pos.x + b.pos.y));

    // Shadow Layer
    entities.forEach(ent => {
       if (ent.type !== 'PARTICLE' && ent.type !== 'PROJECTILE') {
           const screen = toIso(ent.pos.x, ent.pos.y, 0);
           ctx.fillStyle = 'rgba(0,0,0,0.4)';
           ctx.beginPath();
           ctx.ellipse(screen.x, screen.y, ent.size, ent.size * 0.5, 0, 0, Math.PI * 2);
           ctx.fill();
       }
    });

    entities.forEach(ent => {
      const screen = toIso(ent.pos.x, ent.pos.y, ent.pos.z);
      
      if (ent.type === 'PLAYER') {
        ctx.fillStyle = ent.color;
        // Wizard Body
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - 20, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS[playerRef.current.element] || '#ccc';
        ctx.fillRect(screen.x - 8, screen.y - 20, 16, 20);
        
        // Staff
        ctx.save();
        ctx.translate(screen.x + 12, screen.y - 20);
        // Bobbing animation
        ctx.translate(0, Math.sin(frameRef.current * 0.1) * 3);
        ctx.fillStyle = '#a1a1aa';
        ctx.fillRect(-2, -10, 4, 30); // Handle
        ctx.fillStyle = ent.color; // Element color
        ctx.shadowColor = ent.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, -14, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (ent.type === 'ENEMY') {
        const isRanged = (ent as Enemy).aiType === 'RANGED';
        ctx.fillStyle = isRanged ? '#c084fc' : '#f87171'; // Purple ranged, Red melee
        ctx.beginPath();
        // Spiky shape
        ctx.moveTo(screen.x, screen.y - 35);
        ctx.lineTo(screen.x - 12, screen.y);
        ctx.lineTo(screen.x + 12, screen.y);
        ctx.fill();
        // Glowing Eyes
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#fff';
        ctx.fillRect(screen.x - 5, screen.y - 25, 3, 3);
        ctx.fillRect(screen.x + 2, screen.y - 25, 3, 3);
        ctx.shadowBlur = 0;

      } else if (ent.type === 'PROJECTILE') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = ent.color;
        ctx.shadowColor = ent.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;

      } else if (ent.type === 'PARTICLE') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = ent.color;
        ctx.globalAlpha = (ent as Particle).lifeTime / 30;
        const size = (ent as Particle).size;
        ctx.fillRect(screen.x - size/2, screen.y - size/2, size, size);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    });

    // Portal Highlight
    if (enemiesRef.current.length === 0) {
      let exitPos = { x: 0, y: 0 };
      mapRef.current.forEach((row, y) => row.forEach((t, x) => {
         if(t === TileType.EXIT) {
            exitPos = toIso(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 0);
         }
      }));
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Swirling portal
      const r = 30 + Math.sin(frameRef.current * 0.1) * 5;
      ctx.ellipse(exitPos.x, exitPos.y, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Portal beam
      ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
      ctx.beginPath();
      ctx.moveTo(exitPos.x - r, exitPos.y);
      ctx.lineTo(exitPos.x + r, exitPos.y);
      ctx.lineTo(exitPos.x + r * 0.5, exitPos.y - 100);
      ctx.lineTo(exitPos.x - r * 0.5, exitPos.y - 100);
      ctx.fill();
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText("PORTAL ACTIVE", exitPos.x, exitPos.y - 80);
    }

    // Vignette
    const gradient = ctx.createRadialGradient(cx, cy, canvas.height * 0.3, cx, cy, canvas.height * 0.8);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  };

  const handleUpdateLoadout = (newEquipped: (Polyomino | null)[], newInventory: Polyomino[]) => {
    const baseStats = { ...INITIAL_PLAYER.stats };
    let mainElement = ElementType.NEUTRAL;
    let elementCounts: Record<string, number> = {};

    newEquipped.forEach(item => {
      if (item) {
        if (item.stats.damage) baseStats.damage += item.stats.damage;
        if (item.stats.speed) baseStats.speed += item.stats.speed;
        if (item.stats.fireRate) baseStats.fireRate = Math.max(5, baseStats.fireRate * (item.stats.fireRate));
        if (item.stats.multishot) baseStats.multishot += item.stats.multishot;
        elementCounts[item.type] = (elementCounts[item.type] || 0) + 1;
      }
    });

    let maxCount = 0;
    Object.entries(elementCounts).forEach(([elem, count]) => {
      if (count > maxCount && elem !== ElementType.NEUTRAL) {
        maxCount = count;
        mainElement = elem as ElementType;
      }
    });

    playerRef.current.equipped = newEquipped;
    playerRef.current.inventory = newInventory;
    playerRef.current.stats = baseStats;
    playerRef.current.element = mainElement;
    playerRef.current.color = COLORS[mainElement] || '#ffffff';

    setGameState(prev => ({ ...prev, isInInventory: false, isPaused: false }));
  };

  return (
    <div className="relative w-full h-full cursor-crosshair">
      <canvas ref={canvasRef} className="block w-full h-full bg-neutral-900" />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none">
         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-gray-700 shadow-lg">
           <Heart className={`text-red-500 fill-red-500 ${playerRef.current.health < 30 ? 'animate-pulse' : ''}`} />
           <div className="flex flex-col">
             <span className="text-xl font-black leading-none">{Math.max(0, playerRef.current.health)}</span>
             <div className="w-24 h-1 bg-gray-800 rounded mt-1 overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300" 
                  style={{ width: `${(playerRef.current.health / playerRef.current.maxHealth) * 100}%` }}
                />
             </div>
           </div>
         </div>
         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-gray-700 shadow-lg">
           <Zap className="text-yellow-400 fill-yellow-400" />
           <span className="text-sm font-bold tracking-wider">FLOOR {gameState.floor}</span>
           <span className="text-gray-500">|</span>
           <span className="text-sm font-mono text-green-400">{gameState.score} PTS</span>
         </div>
         <div className="text-[10px] text-gray-500 font-mono mt-1 opacity-60">
           [WASD] MOVE • [LMB] FIRE • [SPACE] DASH • [I] RUNES
         </div>
      </div>

      {/* Taunt Box */}
      {taunt && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-purple-950/90 backdrop-blur border border-purple-500/50 p-4 rounded-xl max-w-lg text-center shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-bounce-in pointer-events-none">
           <h3 className="text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Lord Nerdstorm Transmission</h3>
           <p className="italic font-serif text-lg text-purple-50 leading-tight">"{taunt}"</p>
        </div>
      )}

      {/* Inventory Overlay */}
      {gameState.isInInventory && (
        <Inventory 
          player={playerRef.current} 
          onUpdateLoadout={handleUpdateLoadout} 
          onClose={() => setGameState(prev => ({ ...prev, isInInventory: false, isPaused: false }))} 
        />
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
           <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-2 tracking-tighter drop-shadow-lg">YOU DIED</h1>
           <p className="text-xl text-gray-400 mb-8 font-mono">SECTOR {gameState.floor} • SCORE {gameState.score}</p>
           <button 
             onClick={() => window.location.reload()}
             className="flex items-center gap-3 px-10 py-4 bg-red-800 hover:bg-red-700 rounded-lg text-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
           >
             <RefreshCw size={24} /> TRY AGAIN
           </button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;