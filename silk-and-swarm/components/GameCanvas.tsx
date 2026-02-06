import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Anchor, WebStrand, Bug, Particle, GameState, Point, SilkType, BugType, UpgradeStats, GamePhase, FloatingText } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, NEST_RADIUS, SILK_DEFS, BUG_STATS, WAVE_COUNTDOWN_SECONDS, UPGRADE_CONFIG, PASSIVE_SILK_PER_SECOND } from '../constants';
import { audioService } from '../services/audioService';
import { generateMapAnchors, getMapTheme } from '../utils/maps';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  upgradeStats: UpgradeStats;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, upgradeStats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game Logic State Refs
  const anchorsRef = useRef<Anchor[]>([]);
  const strandsRef = useRef<WebStrand[]>([]);
  const bugsRef = useRef<Bug[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextRef = useRef<FloatingText[]>([]);
  
  const frameRef = useRef<number>(0);
  
  // Interaction Refs
  const dragStartRef = useRef<Anchor | null>(null);
  const activeBuilderRef = useRef<Anchor | null>(null);
  const mousePosRef = useRef<Point>({ x: 0, y: 0 });
  
  // Timers
  const timeRef = useRef<number>(0);
  const waveCountdownRef = useRef<number>(WAVE_COUNTDOWN_SECONDS);
  const enemiesToSpawnRef = useRef<BugType[]>([]);
  const spawnTimerRef = useRef<number>(0);
  const passiveSilkAccumulatorRef = useRef<number>(0);
  
  // Theme
  const theme = getMapTheme(gameState.currentMap);

  // --- RESET LOGIC ---
  useEffect(() => {
    // When phase changes to PLAYING (either from Menu or Restart), Reset board
    if (gameState.phase === GamePhase.PLAYING) {
        // Clear all dynamic entities
        strandsRef.current = [];
        bugsRef.current = [];
        particlesRef.current = [];
        floatingTextRef.current = [];
        enemiesToSpawnRef.current = [];
        spawnTimerRef.current = 0;
        waveCountdownRef.current = WAVE_COUNTDOWN_SECONDS;
        passiveSilkAccumulatorRef.current = 0;
        
        // Re-generate Anchors based on Map Selection
        initAnchors();
        activeBuilderRef.current = null;
        dragStartRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.phase, gameState.currentMap]); 

  const initAnchors = () => {
    anchorsRef.current = generateMapAnchors(gameState.currentMap);
  };

  useEffect(() => {
    if (anchorsRef.current.length === 0) initAnchors();
    
    return () => {
      audioService.stopMusic();
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Music Control
  useEffect(() => {
    if (gameState.phase === GamePhase.PLAYING) {
      audioService.startMusic();
    }
  }, [gameState.phase]);

  // Helper: Distance
  const dist = (p1: Point, p2: Point) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

  // Helper: Particle Spawner
  const spawnParticles = (pos: Point, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        id: Math.random().toString(),
        pos: { ...pos },
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color: color,
        size: Math.random() * 3 + 1,
      });
    }
  };

  const spawnFloatingText = (pos: Point, text: string, color: string) => {
    floatingTextRef.current.push({
        id: Math.random().toString(),
        pos: { ...pos },
        text,
        color,
        life: 60, // 1 second
    });
  };

  // Helper: Wave Management
  const updateWave = (currentWave: number) => {
    // 1. COUNTDOWN PHASE
    if (waveCountdownRef.current > 0) {
        // Decrease timer
        waveCountdownRef.current -= 0.016; // Approx 60fps
        
        // Update UI sparingly (when integer changes)
        const ceilTimer = Math.ceil(waveCountdownRef.current);
        if (ceilTimer !== gameState.waveCountdown) {
             setGameState(prev => ({ ...prev, waveCountdown: ceilTimer }));
        }

        if (waveCountdownRef.current <= 0) {
             // Countdown finished! Generate enemies.
             const count = 5 + Math.floor(currentWave * 1.5);
             for (let i = 0; i < count; i++) {
               enemiesToSpawnRef.current.push(BugType.ANT);
             }
             if (currentWave > 2) {
               for (let i = 0; i < Math.floor(currentWave / 2); i++) enemiesToSpawnRef.current.push(BugType.WASP);
             }
             if (currentWave > 4) {
                for (let i = 0; i < Math.floor(currentWave / 3); i++) enemiesToSpawnRef.current.push(BugType.BEETLE);
             }
             if (currentWave % 5 === 0) {
               enemiesToSpawnRef.current.push(BugType.BOSS);
             }
        }
        return; 
    }

    // 2. SPAWNING & FIGHTING PHASE
    const totalRemaining = enemiesToSpawnRef.current.length + bugsRef.current.length;
    
    // Sync bugs remaining to UI (throttle check to avoid spam)
    if (Math.abs(gameState.bugsRemaining - totalRemaining) > 0) {
        setGameState(prev => ({...prev, bugsRemaining: totalRemaining}));
    }

    // Wave Complete Logic
    if (totalRemaining === 0) {
        // Wave Defeated
        const nextWave = currentWave + 1;
        setGameState(prev => ({ ...prev, wave: nextWave, waveCountdown: WAVE_COUNTDOWN_SECONDS }));
        waveCountdownRef.current = WAVE_COUNTDOWN_SECONDS;
        
        // Heal Nest based on Upgrade
        const regen = upgradeStats.nestRegen * UPGRADE_CONFIG.nestRegen.statGain;
        if (regen > 0) {
            setGameState(prev => ({ ...prev, health: Math.min(prev.maxHealth, prev.health + regen) }));
            spawnFloatingText({ x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2 - 50 }, `+${regen} HP`, '#ef4444');
        }
        
    } else if (enemiesToSpawnRef.current.length > 0) {
        // Spawn Logic
        spawnTimerRef.current++;
        if (spawnTimerRef.current > 60 - Math.min(40, gameState.wave * 2)) {
            spawnTimerRef.current = 0;
            const type = enemiesToSpawnRef.current.shift();
            if (type) {
                const angle = Math.random() * Math.PI * 2;
                const spawnDist = CANVAS_WIDTH / 2 + 100;
                const centerX = CANVAS_WIDTH / 2;
                const centerY = CANVAS_HEIGHT / 2;
                const pos = {
                    x: centerX + Math.cos(angle) * spawnDist,
                    y: centerY + Math.sin(angle) * spawnDist,
                };
                
                const stats = BUG_STATS[type];
                bugsRef.current.push({
                    id: Math.random().toString(),
                    type,
                    pos,
                    velocity: { x: 0, y: 0 },
                    speed: stats.speed + (gameState.wave * 0.05),
                    health: stats.health * (1 + gameState.wave * 0.1),
                    maxHealth: stats.health * (1 + gameState.wave * 0.1),
                    radius: stats.radius,
                    damage: stats.damage,
                    value: stats.value,
                    slowedTimer: 0,
                    poisonTimer: 0,
                });
            }
        }
    }
  };

  // Main Game Loop
  const tick = useCallback(() => {
    // Only update game logic if playing
    const isPlaying = gameState.phase === GamePhase.PLAYING;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isPlaying && !gameState.isPaused) {
      timeRef.current += 0.05;
      
      // --- UPDATE LOGIC ---
      
      // Passive Silk
      passiveSilkAccumulatorRef.current += (PASSIVE_SILK_PER_SECOND / 60); // approx 60fps
      if (passiveSilkAccumulatorRef.current >= 1) {
          const amount = Math.floor(passiveSilkAccumulatorRef.current);
          setGameState(prev => ({ ...prev, silk: prev.silk + amount }));
          passiveSilkAccumulatorRef.current -= amount;
      }
      
      updateWave(gameState.wave);

      // Bugs Logic
      const nestPos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      
      bugsRef.current.forEach(bug => {
        // Movement Calculation
        const dx = nestPos.x - bug.pos.x;
        const dy = nestPos.y - bug.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / distance;
        const dirY = dy / distance;

        let currentSpeed = bug.speed;
        let isTouchingWeb = false;
        
        // --- WEB COLLISION ---
        strandsRef.current = strandsRef.current.filter(strand => {
          if (isTouchingWeb) return true; // Only calc collision once per frame

          const vx = strand.p2.x - strand.p1.x;
          const vy = strand.p2.y - strand.p1.y;
          const wx = bug.pos.x - strand.p1.x;
          const wy = bug.pos.y - strand.p1.y;

          const c1 = vx * wx + vy * wy;
          const c2 = vx * vx + vy * vy;

          if (c2 <= 0) return true;

          const b = c1 / c2;
          const bx = (b < 0 ? 0 : (b > 1 ? 1 : b)) * vx;
          const by = (b < 0 ? 0 : (b > 1 ? 1 : b)) * vy;

          const closestX = strand.p1.x + bx;
          const closestY = strand.p1.y + by;

          const distToWeb = Math.sqrt((bug.pos.x - closestX) ** 2 + (bug.pos.y - closestY) ** 2);

          if (distToWeb < bug.radius + (SILK_DEFS[strand.type].width * 2)) {
            isTouchingWeb = true;
            
            // Audio trigger chance
            if (Math.random() > 0.95) audioService.playStringPluck();

            // FREEZE Mechanic
            currentSpeed = 0; 
            
            const silkConfig = SILK_DEFS[strand.type];
            bug.slowedTimer = 60; // Set slowed timer to allow recovery if web breaks
            
            // Damage
            const poisonMult = 1 + (upgradeStats.poisonPotency * UPGRADE_CONFIG.poisonPotency.statGain);
            // Even standard silk does tiny damage via "crushing" in this mode to ensure stuck bugs die eventually
            const baseDamage = Math.max(0.1, silkConfig.damagePerSecond); 
            const damage = baseDamage * (strand.type === SilkType.POISON ? poisonMult : 1);
            
            bug.health -= damage;
            if (strand.type === SilkType.POISON) bug.poisonTimer = 120;
            
            // Web Durability
            let durabilityLoss = 0.5;
            if (bug.type === BugType.BEETLE && strand.type !== SilkType.STEEL) durabilityLoss = 2.0;
            if (bug.type === BugType.BOSS) durabilityLoss = 5.0;
            
            const strengthMult = 1 + (upgradeStats.webStrength * UPGRADE_CONFIG.webStrength.statGain);
            durabilityLoss /= strengthMult;
            
            strand.currentDurability -= durabilityLoss;
            strand.vibration = 8; // More vibration when stuck

            if (strand.currentDurability <= 0) {
              audioService.playStringPluck();
              return false; // Break web
            }
          }
          return true;
        });

        // Speed Recovery Logic
        // If slowedTimer is active but we are NOT touching a web, reduce timer faster
        if (bug.slowedTimer > 0) {
            if (!isTouchingWeb) {
                bug.slowedTimer -= 5; 
            } else {
                bug.slowedTimer = 30; 
            }
            
            // Apply residual slow if not touching but timer still active (accelerating back to full)
            if (!isTouchingWeb && bug.slowedTimer > 0) {
                currentSpeed *= 0.5;
            }
        }
        
        // Poison Logic
        if (bug.poisonTimer > 0) {
          const poisonMult = 1 + (upgradeStats.poisonPotency * UPGRADE_CONFIG.poisonPotency.statGain);
          bug.health -= (0.05 * poisonMult);
          bug.poisonTimer--;
        }

        bug.pos.x += dirX * currentSpeed;
        bug.pos.y += dirY * currentSpeed;

        // Nest Collision
        if (distance < NEST_RADIUS + bug.radius) {
          setGameState(prev => {
            const newHealth = prev.health - bug.damage;
            if (newHealth <= 0) return { ...prev, health: 0, phase: GamePhase.GAME_OVER };
            return { ...prev, health: newHealth };
          });
          audioService.playDamage();
          bug.health = 0;
        }
      });

      // Cleanup
      const livingBugs: Bug[] = [];
      let gainedSilk = 0;
      let gainedScore = 0;
      bugsRef.current.forEach(bug => {
        if (bug.health > 0) {
          livingBugs.push(bug);
        } else {
          spawnParticles(bug.pos, BUG_STATS[bug.type].color, 8);
          spawnFloatingText(bug.pos, `+${bug.value}`, '#22d3ee');
          audioService.playSplat();
          gainedSilk += bug.value;
          gainedScore += bug.value * 10;
        }
      });
      if (gainedSilk > 0) {
        setGameState(prev => ({ ...prev, silk: prev.silk + gainedSilk, score: prev.score + gainedScore }));
      }
      bugsRef.current = livingBugs;

      // Particles
      particlesRef.current.forEach(p => {
        p.pos.x += p.velocity.x;
        p.pos.y += p.velocity.y;
        p.life--;
        p.velocity.x *= 0.95;
        p.velocity.y *= 0.95;
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      
      // Floating Text
      floatingTextRef.current.forEach(ft => {
          ft.pos.y -= 0.5; // Float up
          ft.life--;
      });
      floatingTextRef.current = floatingTextRef.current.filter(ft => ft.life > 0);
    }

    // --- RENDER ---
    
    // Background - Use Theme Color
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=0; x<CANVAS_WIDTH; x+=50) { ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); }
    for(let y=0; y<CANVAS_HEIGHT; y+=50) { ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); }
    ctx.stroke();

    // Strands
    strandsRef.current.forEach(s => {
      const config = SILK_DEFS[s.type];
      if (s.vibration > 0) s.vibration *= 0.9;
      
      ctx.beginPath();
      const midX = (s.p1.x + s.p2.x) / 2;
      const midY = (s.p1.y + s.p2.y) / 2;
      const dx = s.p2.x - s.p1.x;
      const dy = s.p2.y - s.p1.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const perpX = -dy/len;
      const perpY = dx/len;
      const wobble = Math.sin(timeRef.current * 20) * s.vibration;
      
      ctx.moveTo(s.p1.x, s.p1.y);
      ctx.quadraticCurveTo(midX + perpX * wobble, midY + perpY * wobble, s.p2.x, s.p2.y);
      
      ctx.lineWidth = config.width;
      ctx.strokeStyle = config.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = config.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      if (s.type === SilkType.STICKY) {
         ctx.fillStyle = config.color;
         for(let i=0.2; i<0.9; i+=0.2) {
            ctx.beginPath();
            ctx.arc(s.p1.x + dx*i, s.p1.y + dy*i, 2, 0, Math.PI*2);
            ctx.fill();
         }
      }
    });

    // Builder Line
    const buildingSource = dragStartRef.current || activeBuilderRef.current;
    if (buildingSource) {
      const currentSilk = SILK_DEFS[gameState.selectedSilk];
      const snapTarget = getClosestAnchor(mousePosRef.current, 60); // INCREASED RADIUS
      
      // Calculate Cost Check
      const costMultiplier = Math.max(0.5, 1 - (upgradeStats.silkEfficiency * UPGRADE_CONFIG.silkEfficiency.statGain));
      const cost = Math.floor(currentSilk.cost * costMultiplier);
      const canAfford = gameState.silk >= cost;
      
      // Ensure snap target isn't the source
      const finalSnap = (snapTarget && snapTarget.id !== buildingSource.id) ? snapTarget : null;
      
      const targetPos = finalSnap ? finalSnap.pos : mousePosRef.current;

      ctx.beginPath();
      ctx.moveTo(buildingSource.pos.x, buildingSource.pos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      
      // Color Logic based on affordability
      ctx.strokeStyle = canAfford ? currentSilk.color : '#ef4444'; 
      ctx.lineWidth = currentSilk.width;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (finalSnap) {
        ctx.beginPath();
        ctx.arc(finalSnap.pos.x, finalSnap.pos.y, 20, 0, Math.PI * 2); // Larger snap visual
        ctx.strokeStyle = canAfford ? '#fff' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Anchors - Use Theme Color
    anchorsRef.current.forEach(a => {
      const isSelected = activeBuilderRef.current?.id === a.id || dragStartRef.current?.id === a.id;
      
      ctx.beginPath();
      ctx.arc(a.pos.x, a.pos.y, a.radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#fff' : theme.anchor;
      ctx.fill();
      
      // Hover Effect - Larger Radius Visual
      if (dist(mousePosRef.current, a.pos) < 60) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.pos.x, a.pos.y, a.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Nest
    const nestPos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    ctx.beginPath();
    ctx.arc(nestPos.x, nestPos.y, NEST_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(nestPos.x, nestPos.y, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(nestPos.x - 5, nestPos.y - 5, 2, 0, Math.PI*2);
    ctx.arc(nestPos.x + 5, nestPos.y - 5, 2, 0, Math.PI*2);
    ctx.fill();

    // Bugs
    bugsRef.current.forEach(b => {
      ctx.save();
      ctx.translate(b.pos.x, b.pos.y);
      const angle = Math.atan2(nestPos.y - b.pos.y, nestPos.x - b.pos.x);
      ctx.rotate(angle);
      
      ctx.fillStyle = b.poisonTimer > 0 ? '#a3e635' : BUG_STATS[b.type].color;
      ctx.beginPath();
      if (b.type === BugType.BEETLE || b.type === BugType.BOSS) {
        ctx.rect(-b.radius, -b.radius, b.radius*2, b.radius*2);
      } else {
        ctx.scale(1.5, 1);
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      const legWiggle = Math.sin(timeRef.current * 20);
      ctx.beginPath();
      ctx.moveTo(5, 5); ctx.lineTo(10, 10 + legWiggle * 2);
      ctx.moveTo(5, -5); ctx.lineTo(10, -10 - legWiggle * 2);
      ctx.moveTo(-5, 5); ctx.lineTo(-10, 10 - legWiggle * 2);
      ctx.moveTo(-5, -5); ctx.lineTo(-10, -10 + legWiggle * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Floating Text
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    floatingTextRef.current.forEach(ft => {
        ctx.globalAlpha = ft.life / 60;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.pos.x, ft.pos.y);
    });
    ctx.globalAlpha = 1.0;

    // --- COUNTDOWN RENDER ---
    if (gameState.waveCountdown > 0 && gameState.waveCountdown <= 3.9) {
        ctx.save();
        ctx.translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        // Pulse Effect
        const scale = 1 + (0.5 * (1 - (waveCountdownRef.current % 1))); 
        ctx.scale(scale, scale);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
        ctx.shadowBlur = 20;
        ctx.font = '900 120px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const count = Math.ceil(waveCountdownRef.current);
        ctx.fillText(count.toString(), 0, 0);
        ctx.restore();
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [gameState, setGameState, upgradeStats]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [tick]);


  // --- INPUT HANDLING ---
  
  const getClosestAnchor = (p: Point, radius: number): Anchor | null => {
    let closest: Anchor | null = null;
    let minD = radius; // Start with max allowed distance
    
    anchorsRef.current.forEach(a => {
        const d = dist(p, a.pos);
        // Change from d < minD to d <= minD to catch nodes at edge of radius
        // Actually, logic is fine, but radius passed in is key
        if (d <= minD) {
            minD = d;
            closest = a;
        }
    });
    return closest;
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameState.phase !== GamePhase.PLAYING && gameState.phase !== GamePhase.TUTORIAL) return;
    if (gameState.isPaused) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const p = { x, y };

    // Increased selection radius to 60 for better usability
    const clickedAnchor = getClosestAnchor(p, 60);
    
    if (activeBuilderRef.current) {
        if (clickedAnchor) {
            if (clickedAnchor.id !== activeBuilderRef.current.id) {
                buildStrand(activeBuilderRef.current, clickedAnchor);
                activeBuilderRef.current = null;
            } else {
                activeBuilderRef.current = null; 
            }
        } else {
            activeBuilderRef.current = null;
        }
    } else {
        if (clickedAnchor) {
            dragStartRef.current = clickedAnchor;
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    mousePosRef.current = { x, y };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const p = { x, y };

    // Increased selection radius
    const releasedAnchor = getClosestAnchor(p, 60);

    if (releasedAnchor && releasedAnchor.id !== dragStartRef.current.id) {
        buildStrand(dragStartRef.current, releasedAnchor);
        activeBuilderRef.current = null;
    } else {
        // If we release on the start anchor or just click it, active builder mode
        if (releasedAnchor && releasedAnchor.id === dragStartRef.current.id) {
            activeBuilderRef.current = dragStartRef.current;
        } else {
             activeBuilderRef.current = null; 
        }
    }

    dragStartRef.current = null;
  };

  const buildStrand = (a1: Anchor, a2: Anchor) => {
      const config = SILK_DEFS[gameState.selectedSilk];
      const costMultiplier = Math.max(0.5, 1 - (upgradeStats.silkEfficiency * UPGRADE_CONFIG.silkEfficiency.statGain));
      const cost = Math.floor(config.cost * costMultiplier);
      
      const exists = strandsRef.current.some(s => 
        (s.p1 === a1.pos && s.p2 === a2.pos) ||
        (s.p2 === a1.pos && s.p1 === a2.pos)
      );

      if (!exists && gameState.silk >= cost) {
        const length = dist(a1.pos, a2.pos);
        if (length < 600) {  
            const strengthMult = 1 + (upgradeStats.webStrength * UPGRADE_CONFIG.webStrength.statGain);
            
            strandsRef.current.push({
              id: Math.random().toString(),
              p1: a1.pos,
              p2: a2.pos,
              type: gameState.selectedSilk,
              currentDurability: config.durability * strengthMult,
              maxDurability: config.durability * strengthMult,
              vibration: 20,
            });
            
            setGameState(prev => ({ ...prev, silk: prev.silk - cost }));
            audioService.playBuild();
        }
      }
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center" style={{ backgroundColor: theme.bg }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full max-h-full aspect-[3/2] shadow-2xl touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
            dragStartRef.current = null;
        }}
      />
    </div>
  );
};