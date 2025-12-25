import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Player, Projectile, Enemy, Platform, Particle, Obstacle } from '../types';
import { 
  GRAVITY, JUMP_FORCE, FRICTION, MAX_SPEED, 
  CHAPPAL_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT, 
  ENEMY_WIDTH, ENEMY_HEIGHT, CHAPPAL_SIZE, OBSTACLE_WIDTH, OBSTACLE_HEIGHT 
} from '../constants';
import { soundManager } from '../services/soundManager';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  setDistance: (dist: number) => void;
  setHp: (hp: number) => void;
  setCauseOfDeath: (cause: string) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, setScore, setDistance, setHp, setCauseOfDeath }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const playerRef = useRef<Player>({ 
    x: 100, y: 300, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, 
    vx: 0, vy: 0, isGrounded: false, hp: 3, direction: 1, cooldown: 0 
  });
  const projectilesRef = useRef<Projectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const platformsRef = useRef<Platform[]>([]);
  const cloudsRef = useRef<{x: number, y: number, speed: number, scale: number}[]>([]);
  
  const frameRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const startXRef = useRef<number>(100);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const cameraXRef = useRef<number>(0);

  // Initialize Level
  const initLevel = () => {
    soundManager.init();
    soundManager.startBGM();
    
    playerRef.current = { 
      x: 100, y: 300, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, 
      vx: 0, vy: 0, isGrounded: false, hp: 3, direction: 1, cooldown: 0 
    };
    startXRef.current = 100;
    projectilesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    cameraXRef.current = 0;
    setScore(0);
    setDistance(0);
    setHp(3);

    // Initialize Clouds
    const clouds = [];
    for(let i=0; i<15; i++) {
        clouds.push({
            x: Math.random() * 2000,
            y: Math.random() * 300,
            speed: 0.2 + Math.random() * 0.3,
            scale: 0.5 + Math.random() * 1.5
        });
    }
    cloudsRef.current = clouds;

    const newPlatforms: Platform[] = [];
    const newEnemies: Enemy[] = [];
    const newObstacles: Obstacle[] = [];
    
    // Ground
    const GROUND_Y = 500;
    newPlatforms.push({ x: 0, y: GROUND_Y, width: 30000, height: 100, color: '#2a2a2a' });

    // Procedural generation
    for (let i = 400; i < 30000; i += 300 + Math.random() * 200) {
      // Add Platforms
      if (Math.random() > 0.2) {
        const height = 350 - Math.random() * 150;
        const width = 150 + Math.random() * 200;
        newPlatforms.push({ x: i, y: height, width, height: 20, color: '#554433' }); 

        // Chance to spawn Dino on platform
        if (Math.random() > 0.4) {
          newEnemies.push({
            id: i,
            x: i + width / 2,
            y: height - ENEMY_HEIGHT,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            vx: -2,
            vy: 0,
            active: true,
            type: Math.random() > 0.5 ? 'DINO_REX' : 'DINO_LONG',
            patrolStart: i,
            patrolEnd: i + width
          });
        }
      }

      // Add Ground Enemies (Dinos)
      if (Math.random() > 0.5) {
         newEnemies.push({
            id: i + 10000, // offset id
            x: i,
            y: GROUND_Y - ENEMY_HEIGHT,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            vx: -1.5,
            vy: 0,
            active: true,
            type: 'DINO_REX',
            patrolStart: i - 200,
            patrolEnd: i + 200
         });
      }

      // Add Ground Obstacles (Static)
      if (Math.random() > 0.4) {
          newObstacles.push({
              id: i,
              x: i + 150, // Offset from enemy spawn
              y: GROUND_Y - OBSTACLE_HEIGHT,
              width: OBSTACLE_WIDTH,
              height: OBSTACLE_HEIGHT,
              vx: 0,
              vy: 0,
              type: Math.random() > 0.5 ? 'CACTUS' : 'FIRE'
          });
      }
    }
    platformsRef.current = newPlatforms;
    enemiesRef.current = newEnemies;
    obstaclesRef.current = newObstacles;
  };

  // Stop music on unmount or game over
  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
        soundManager.stopBGM();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      initLevel();
    }
  }, [gameState]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (gameState === GameState.PLAYING) {
        // Jump logic (Space or Up Arrow)
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          if (playerRef.current.isGrounded) {
            playerRef.current.vy = JUMP_FORCE;
            playerRef.current.isGrounded = false;
            soundManager.playJump();
            createParticles(playerRef.current.x + PLAYER_WIDTH/2, playerRef.current.y + PLAYER_HEIGHT, '#fff', 5);
          }
        }
        if (e.code === 'KeyZ' || e.code === 'ControlLeft') {
          // Throw Chappal
          if (playerRef.current.cooldown <= 0) {
            const p = playerRef.current;
            projectilesRef.current.push({
              x: p.x + (p.direction === 1 ? p.width : 0),
              y: p.y + p.height / 3,
              width: CHAPPAL_SIZE,
              height: CHAPPAL_SIZE / 2,
              vx: p.direction * CHAPPAL_SPEED + p.vx,
              vy: -2,
              active: true,
              rotation: 0
            });
            playerRef.current.cooldown = 15; // Faster fire rate
            soundManager.playThrow();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y, width: 4, height: 4,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        id: Math.random(),
        life: 1.0,
        color
      });
    }
  };

  const loop = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- UPDATE ---
    const player = playerRef.current;

    // Horizontal Movement
    if (keysRef.current['ArrowRight']) {
      player.vx += 0.8; // Snappier movement
      player.direction = 1;
    } else if (keysRef.current['ArrowLeft']) {
      player.vx -= 0.8;
      player.direction = -1;
    } else {
      player.vx *= FRICTION;
    }

    // Cap Speed
    player.vx = Math.max(Math.min(player.vx, MAX_SPEED), -MAX_SPEED);
    player.x += player.vx;

    // Update Distance
    const dist = Math.floor((player.x - startXRef.current) / 10);
    if (dist > 0) setDistance(dist);

    // Vertical Movement
    player.vy += GRAVITY;
    player.y += player.vy;

    // Cooldown
    if (player.cooldown > 0) player.cooldown--;

    // World Limits
    if (player.y > 1000) {
      soundManager.playDamage();
      setCauseOfDeath("Fell into the abyss.");
      setGameState(GameState.GAME_OVER);
    }

    // Platforms Collision
    player.isGrounded = false;
    platformsRef.current.forEach(plat => {
      if (
        player.x < plat.x + plat.width &&
        player.x + player.width > plat.x &&
        player.y + player.height > plat.y &&
        player.y + player.height < plat.y + plat.height + 20 &&
        player.vy >= 0
      ) {
        player.isGrounded = true;
        player.vy = 0;
        player.y = plat.y - player.height;
      }
    });

    // Update Projectiles
    projectilesRef.current.forEach(proj => {
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.vy += GRAVITY * 0.4;
      proj.rotation += 0.4; // Faster spin
      
      if (proj.y > 800 || Math.abs(proj.x - player.x) > 1500) {
        proj.active = false;
      }
    });

    // Update Obstacles (Collision with Player)
    obstaclesRef.current.forEach(obs => {
        if (
            player.x < obs.x + obs.width - 10 &&
            player.x + player.width > obs.x + 10 &&
            player.y < obs.y + obs.height - 10 &&
            player.y + player.height > obs.y + 5
        ) {
            // Player hit obstacle
            player.hp -= 1;
            player.vy = -10; // Big bounce up
            player.vx = -player.direction * 10; // Bounce back
            setHp(player.hp);
            soundManager.playDamage();
            createParticles(player.x, player.y, '#ff4400', 15);
            
            if (player.hp <= 0) {
                setCauseOfDeath(`Tripped on a ${obs.type === 'CACTUS' ? 'prickly cactus' : 'raging fire'}.`);
                setGameState(GameState.GAME_OVER);
            }
        }
    });

    // Update Enemies
    enemiesRef.current.forEach(enemy => {
      if (!enemy.active) return;
      
      enemy.x += enemy.vx;
      if (enemy.x <= enemy.patrolStart || enemy.x >= enemy.patrolEnd) {
        enemy.vx *= -1;
      }

      // Collision with Chappal
      projectilesRef.current.forEach(proj => {
        if (proj.active && 
            proj.x < enemy.x + enemy.width && 
            proj.x + proj.width > enemy.x && 
            proj.y < enemy.y + enemy.height && 
            proj.y + proj.height > enemy.y) {
          
          enemy.active = false;
          proj.active = false;
          scoreRef.current += 150;
          setScore(scoreRef.current);
          soundManager.playHit();
          createParticles(enemy.x, enemy.y, '#00ff00', 15);
        }
      });

      // Collision with Player
      if (
        player.x < enemy.x + enemy.width - 15 &&
        player.x + player.width > enemy.x + 15 &&
        player.y < enemy.y + enemy.height - 15 &&
        player.y + player.height > enemy.y + 15
      ) {
        player.hp -= 1;
        player.vy = -6; 
        player.vx = -player.direction * 12;
        setHp(player.hp);
        soundManager.playDamage();
        createParticles(player.x, player.y, '#ff00cc', 10);
        
        if (player.hp <= 0) {
           setCauseOfDeath(`Eaten by a ${enemy.type === 'DINO_REX' ? 'T-Rex' : 'Dino'}.`);
           setGameState(GameState.GAME_OVER);
        } else {
           enemy.x += (player.x < enemy.x ? 100 : -100); // Enemy backs off
        }
      }
    });

    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    projectilesRef.current = projectilesRef.current.filter(p => p.active);

    const targetCamX = player.x - canvas.width / 4;
    cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;

    // --- DRAW ---
    
    // Gradient Sky
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#200122');
    grad.addColorStop(1, '#6f0000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Clouds (Background)
    cloudsRef.current.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -200) cloud.x = 2000 + Math.random() * 500;
        
        ctx.save();
        ctx.translate(cloud.x - (cameraXRef.current * 0.05), cloud.y);
        ctx.scale(cloud.scale, cloud.scale);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.arc(25, -10, 35, 0, Math.PI * 2);
        ctx.arc(50, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Parallax City Background
    ctx.fillStyle = '#4a1c40'; 
    for(let i = -1; i < 6; i++) {
        const bgX = (i * 300) - (cameraXRef.current * 0.2) % 300;
        ctx.fillRect(bgX, 200, 150, 600); // Distant buildings
    }
    
    ctx.fillStyle = '#2a0a20';
    for(let i = -1; i < 6; i++) {
        const bgX = (i * 500) - (cameraXRef.current * 0.5) % 500;
        ctx.fillRect(bgX, 150, 200, 800); // Closer buildings
        
        // Neon Windows
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        ctx.fillStyle = '#ffcc00';
        ctx.globalAlpha = 0.5;
        for(let w = 0; w < 3; w++) {
             ctx.fillRect(bgX + 20 + w*50, 200, 30, 40);
             ctx.fillRect(bgX + 20 + w*50, 300, 30, 40);
             ctx.fillRect(bgX + 20 + w*50, 400, 30, 40);
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#2a0a20'; // Reset
    }

    ctx.save();
    ctx.translate(-cameraXRef.current, 0);

    // Draw Platforms
    platformsRef.current.forEach(plat => {
      ctx.fillStyle = plat.color;
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      
      // Grass details
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(plat.x, plat.y, plat.width, 5);
      // Spikes of grass
      for(let g = 0; g < plat.width; g += 20) {
        ctx.beginPath();
        ctx.moveTo(plat.x + g, plat.y);
        ctx.lineTo(plat.x + g + 5, plat.y - 5);
        ctx.lineTo(plat.x + g + 10, plat.y);
        ctx.fill();
      }
    });

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
        ctx.save();
        ctx.translate(obs.x + obs.width/2, obs.y + obs.height/2);
        
        // Glow for fire
        if (obs.type === 'FIRE') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'orange';
        }

        ctx.font = '35px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.type === 'CACTUS' ? '🌵' : '🔥', 0, 0);
        
        ctx.shadowBlur = 0;
        ctx.restore();
    });

    // Draw Player (Cute Girl)
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    if (player.direction === -1) ctx.scale(-1, 1);
    
    // Draw Body (Dress)
    ctx.fillStyle = '#ff69b4'; // Hot pink dress
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(10, 10);
    ctx.lineTo(15, 30);
    ctx.lineTo(-15, 30);
    ctx.fill();

    // Draw Head
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👧', 0, -5); 
    
    ctx.restore();

    // Draw Projectiles
    projectilesRef.current.forEach(proj => {
      ctx.save();
      ctx.translate(proj.x + proj.width/2, proj.y + proj.height/2);
      ctx.rotate(proj.rotation);
      ctx.font = '25px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🩴', 0, 0);
      ctx.restore();
    });

    // Draw Enemies (Dinos)
    enemiesRef.current.forEach(enemy => {
      if (!enemy.active) return;
      ctx.save();
      ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
      ctx.font = '50px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (enemy.vx < 0) ctx.scale(-1, 1); 
      ctx.fillText(enemy.type === 'DINO_REX' ? '🦖' : '🦕', 0, 0);
      ctx.restore();
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.globalAlpha = 1.0;
    });

    ctx.restore();

    frameRef.current = requestAnimationFrame(loop);
  }, [gameState, setGameState, setScore, setDistance, setHp, setCauseOfDeath]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [loop]);

  return (
    <canvas 
      ref={canvasRef} 
      width={window.innerWidth} 
      height={window.innerHeight} 
      className="block"
    />
  );
};

export default GameCanvas;