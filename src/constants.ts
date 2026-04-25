/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  color: string;
}

export const TRACKS: Track[] = [
  { id: '1', title: 'PULSE_WAVE // GLITCH_CORE', artist: 'NEON_DEMON', duration: '3:42', color: '#00ffff' },
  { id: '2', title: 'VOID_NULL // STATIC_HYMN', artist: 'VOID_WALKER', duration: '4:15', color: '#ff00ff' },
  { id: '3', title: 'DATA_LEAK // SYNTH_FRAGMENT', artist: 'ROOT_SHELL', duration: '2:58', color: '#39ff14' },
];

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const MIN_SPEED = 50;
export const SPEED_INCREMENT = 2;
