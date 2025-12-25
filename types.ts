export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
}

export interface Player extends Entity {
  isGrounded: boolean;
  hp: number;
  direction: 1 | -1; // 1 right, -1 left
  cooldown: number;
}

export interface Projectile extends Entity {
  active: boolean;
  rotation: number;
}

export interface Enemy extends Entity {
  id: number;
  active: boolean;
  type: 'DINO_REX' | 'DINO_LONG';
  patrolStart: number;
  patrolEnd: number;
}

export interface Obstacle extends Entity {
  id: number;
  type: 'CACTUS' | 'FIRE';
}

export interface Particle extends Entity {
  id: number;
  life: number;
  color: string;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface GameStats {
  score: number;
  distance: number;
  highScore: number;
}