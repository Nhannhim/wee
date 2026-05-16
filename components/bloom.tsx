"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { loadSavedCharacters, saveCharacter } from '@/lib/savedCharacters';
import {
  Camera, ChevronRight, Sparkles, ArrowRight, ArrowLeft, Palette,
  Loader2, RefreshCw, Check, Scissors, Smile, Eye as EyeIcon, User,
  Move, X
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────
// STYLES — Fraunces (display) + DM Sans (body), warm retro-future
// ────────────────────────────────────────────────────────────────

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600;700&display=swap');

.bloom-root, .bloom-root * { box-sizing: border-box; }
.font-display { font-family: 'Fraunces', serif; font-variation-settings: "SOFT" 50; letter-spacing: -0.025em; }
.font-body { font-family: 'DM Sans', system-ui, sans-serif; }
.font-cute { font-family: 'Fredoka', 'Fraunces', sans-serif; letter-spacing: -0.02em; }

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(4vw, -3vh) scale(1.1); }
  66% { transform: translate(-3vw, 4vh) scale(0.92); }
}
@keyframes pulse-glow { 0%, 100% { opacity: 0.65; } 50% { opacity: 1; } }
@keyframes scan-sweep {
  0% { transform: translateY(-110%); opacity: 0; }
  15%, 85% { opacity: 1; }
  100% { transform: translateY(110%); opacity: 0; }
}
@keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes dot-pulse { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
@keyframes bounce-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes wobble-cute {
  0%, 100% { transform: rotate(-1.5deg); }
  50% { transform: rotate(1.5deg); }
}
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.4) translateY(20px); }
  60% { opacity: 1; transform: scale(1.08) translateY(-6px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes float-up {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-16px) rotate(4deg); }
}
@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}

.blob-bg {
  position: absolute; border-radius: 50%; filter: blur(90px);
  pointer-events: none; will-change: transform;
}
.grain {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.glass {
  background: rgba(255, 244, 230, 0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 244, 230, 0.09);
}
.glass-strong {
  background: rgba(20, 14, 32, 0.7);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 244, 230, 0.12);
}
.btn-primary {
  background: linear-gradient(135deg, #FFC9B5 0%, #FF8B7A 100%);
  color: #1a1428;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 24px -4px rgba(255, 139, 122, 0.5), inset 0 1px 0 rgba(255,255,255,0.3);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 36px -4px rgba(255, 139, 122, 0.7), inset 0 1px 0 rgba(255,255,255,0.3); }
.btn-primary:active { transform: translateY(0); }
.btn-ghost {
  background: rgba(255, 244, 230, 0.06);
  color: #F5EFE6;
  border: 1px solid rgba(255, 244, 230, 0.12);
  transition: all 0.2s ease;
}
.btn-ghost:hover { background: rgba(255, 244, 230, 0.1); }

.btn-cute {
  background: linear-gradient(180deg, #FFD66B 0%, #FFA84B 100%);
  color: #4A2C18;
  border: 3px solid #FFFFFF;
  border-radius: 9999px;
  box-shadow:
    0 6px 0 #C77A2E,
    0 12px 28px -6px rgba(199, 122, 46, 0.5),
    inset 0 2px 0 rgba(255,255,255,0.55);
  transition: transform 0.15s cubic-bezier(0.4,0,0.2,1), box-shadow 0.15s cubic-bezier(0.4,0,0.2,1);
}
.btn-cute:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 0 #C77A2E,
    0 16px 32px -6px rgba(199, 122, 46, 0.6),
    inset 0 2px 0 rgba(255,255,255,0.55);
}
.btn-cute:active {
  transform: translateY(4px);
  box-shadow:
    0 2px 0 #C77A2E,
    0 6px 18px -6px rgba(199, 122, 46, 0.45),
    inset 0 2px 0 rgba(255,255,255,0.55);
}

.pill-tag {
  background: #FFFFFF;
  border: 2px solid #FFE3D1;
  border-radius: 9999px;
  box-shadow: 0 3px 0 rgba(255, 179, 158, 0.35);
  color: #C2553D;
}

.stage-plate {
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%);
}

.swatch { transition: all 0.2s ease; cursor: pointer; }
.swatch:hover { transform: scale(1.12); }
.swatch.selected { box-shadow: 0 0 0 2px #FFB39E, 0 0 16px rgba(255, 179, 158, 0.5); transform: scale(1.1); }

.option-btn {
  transition: all 0.2s ease; cursor: pointer;
  background: rgba(255, 244, 230, 0.04);
  border: 1px solid rgba(255, 244, 230, 0.08);
}
.option-btn:hover { background: rgba(255, 244, 230, 0.08); }
.option-btn.selected { background: rgba(255, 179, 158, 0.16); border-color: #FFB39E; color: #FFD9CA; }

input[type="range"].slider {
  -webkit-appearance: none; appearance: none; width: 100%; height: 4px;
  background: rgba(255, 244, 230, 0.15); border-radius: 2px; outline: none;
}
input[type="range"].slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px;
  background: #FFB39E; border-radius: 50%; cursor: pointer;
  border: 2px solid #1a1428;
}
input[type="range"].slider::-moz-range-thumb {
  width: 18px; height: 18px; background: #FFB39E; border-radius: 50%;
  cursor: pointer; border: 2px solid #1a1428;
}

.scan-frame-corner {
  position: absolute; width: 32px; height: 32px;
  border: 2px solid #FFC9B5; border-radius: 4px;
}

/* ── Wee / Tomodachi-style light theme helpers ── */
.card-cute {
  background: #FFFFFF;
  border: 3px solid #FFFFFF;
  border-radius: 24px;
  box-shadow:
    0 6px 0 rgba(255, 179, 158, 0.35),
    0 14px 28px -6px rgba(255, 139, 122, 0.25);
}
.card-cute-strong {
  background: #FFFFFF;
  border: 3px solid #FFFFFF;
  border-radius: 28px;
  box-shadow:
    0 10px 0 rgba(255, 179, 158, 0.32),
    0 22px 44px -10px rgba(255, 139, 122, 0.28);
}
.pill-cute {
  background: #FFFFFF;
  border: 2px solid #FFE3D1;
  border-radius: 9999px;
  box-shadow: 0 4px 0 rgba(255, 179, 158, 0.32);
  color: #C2553D;
}
.pill-soft {
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(255, 227, 209, 0.9);
  border-radius: 9999px;
  box-shadow: 0 3px 0 rgba(255, 179, 158, 0.25);
  color: #8A5A3A;
}

.input-cute {
  background: #FFF7EE;
  border: 2px solid #FFE3D1;
  border-radius: 14px;
  color: #3D2418;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}
.input-cute:focus {
  border-color: #FF8B7A;
  box-shadow: 0 0 0 4px rgba(255, 139, 122, 0.18);
}

.option-cute {
  background: #FFF7EE;
  border: 2px solid #FFE3D1;
  color: #8A5A3A;
  border-radius: 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  cursor: pointer;
  font-weight: 600;
}
.option-cute:hover { transform: translateY(-1px); border-color: #FFC9B5; }
.option-cute.selected {
  background: linear-gradient(180deg, #FFE6D5 0%, #FFCDB5 100%);
  border-color: #FF8B7A;
  color: #C2553D;
  box-shadow: 0 4px 0 rgba(255, 139, 122, 0.35);
}

.tab-cute {
  background: transparent;
  color: rgba(74, 44, 24, 0.5);
  border-radius: 16px;
  transition: all 0.15s ease;
  cursor: pointer;
  font-weight: 600;
}
.tab-cute:not(.selected):hover { color: #8A5A3A; background: rgba(255, 244, 230, 0.6); }
.tab-cute.selected {
  background: linear-gradient(180deg, #FFE6D5 0%, #FFCDB5 100%);
  color: #C2553D;
  box-shadow: 0 3px 0 rgba(255, 139, 122, 0.35), inset 0 1px 0 rgba(255,255,255,0.55);
}

.swatch-cute { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; border: 3px solid #fff; box-shadow: 0 3px 0 rgba(255,179,158,0.25); }
.swatch-cute:hover { transform: scale(1.1); }
.swatch-cute.selected {
  box-shadow: 0 0 0 3px #FF8B7A, 0 4px 0 rgba(255,139,122,0.45);
  transform: scale(1.08);
}

input[type="range"].slider-cute {
  -webkit-appearance: none; appearance: none; width: 100%; height: 6px;
  background: #FFE3D1; border-radius: 6px; outline: none;
}
input[type="range"].slider-cute::-webkit-slider-thumb {
  -webkit-appearance: none; width: 22px; height: 22px;
  background: #FF8B7A; border-radius: 50%; cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 3px 0 #D45D4B;
}
input[type="range"].slider-cute::-moz-range-thumb {
  width: 22px; height: 22px; background: #FF8B7A; border-radius: 50%;
  cursor: pointer; border: 3px solid #fff;
  box-shadow: 0 3px 0 #D45D4B;
}

.scan-frame-corner-cute {
  position: absolute; width: 28px; height: 28px;
  border: 3px solid #FF8B7A;
}

.text-warm        { color: #3D2418; }
.text-warm-soft   { color: rgba(74, 44, 24, 0.7); }
.text-warm-faded  { color: rgba(74, 44, 24, 0.5); }

.wee-bg-pastel {
  background: linear-gradient(180deg, #BCE3F2 0%, #FFE9D9 55%, #FFCDD9 100%);
}
.wee-bg-soft {
  background: linear-gradient(180deg, #FFF6E8 0%, #FFE9D9 60%, #FFD9E1 100%);
}

/* speech bubble used for proximity dialogue in the world */
.speech-bubble {
  position: relative;
  background: #FFFFFF;
  border: 3px solid #FFFFFF;
  border-radius: 18px;
  padding: 8px 14px;
  box-shadow: 0 5px 0 rgba(255,179,158,0.35), 0 12px 22px -6px rgba(255,139,122,0.3);
  font-family: 'Fredoka', sans-serif;
  color: #3D2418;
  white-space: nowrap;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.speech-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 14px;
  height: 14px;
  background: #FFFFFF;
  transform: translateX(-50%) rotate(45deg);
  border-right: 3px solid #FFFFFF;
  border-bottom: 3px solid #FFFFFF;
  border-radius: 0 0 4px 0;
  box-shadow: 3px 3px 0 rgba(255,179,158,0.35);
}
.speech-bubble.talking {
  border-color: #FFD66B;
  box-shadow: 0 0 0 3px #FFD66B, 0 5px 0 rgba(229,167,57,0.45), 0 14px 28px -6px rgba(229,167,57,0.4);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both, pulse-glow 1.4s ease-in-out infinite;
}
.speech-bubble.talking::after {
  background: #FFD66B;
  border-color: #FFD66B;
}
`;

// ────────────────────────────────────────────────────────────────
// COLOR PALETTES & PRESETS
// ────────────────────────────────────────────────────────────────

const SKIN_TONES = [
  '#F4D9C4', '#EAC8A8', '#DDB088', '#C99770', '#A87859', '#8B5E3F', '#6B4329', '#4A2C18'
];
const HAIR_COLORS = [
  '#241A12', '#3D2817', '#5C3B1F', '#8B5A2B', '#C29554', '#E5C07B', '#D9D2C0', '#F5EFE6',
  '#5D4A8C', '#8B7AB8', '#D86F8C', '#E89B6E', '#6FA8C9', '#5D8C5A'
];
const EYE_COLORS = ['#3A2418', '#5C3B1F', '#1F3D5C', '#3D5C2F', '#5C2F4A', '#2F2F2F'];
const OUTFIT_COLORS = [
  '#8DECC2', '#FFC9B5', '#F5C56B', '#A8B5E8', '#E895B5', '#7AC2D9',
  '#C99FE3', '#F2A584', '#9BD9B0', '#F0E4B0'
];

const HAIR_STYLES = ['short', 'bob', 'quiff', 'long', 'bun', 'spiky'];
const FACE_SHAPES = ['round', 'oval', 'square'];
const EYE_STYLES = ['normal', 'big', 'sleepy', 'sparkle'];
const MOUTH_STYLES = ['smile', 'grin', 'neutral', 'smirk', 'oh'];

// Mii-style expression presets. Each one is a combo of eye + mouth + brow tilt
// that the Customize "mood" tab applies in a single tap. Inspired by the
// Mii expression sheet (Big smile / Cheerful / Bored / Smug / Unbelievable / ...).
const EXPRESSIONS = [
  { id: 'happy',      label: 'happy',      icon: '😊', eyeStyle: 'sparkle', mouthStyle: 'grin',    eyebrowAngle:  0.0 },
  { id: 'cheerful',   label: 'cheerful',   icon: '☺︎', eyeStyle: 'normal',  mouthStyle: 'smile',   eyebrowAngle:  0.0 },
  { id: 'bored',      label: 'bored',      icon: '😐', eyeStyle: 'sleepy',  mouthStyle: 'neutral', eyebrowAngle:  0.0 },
  { id: 'smug',       label: 'smug',       icon: '😏', eyeStyle: 'normal',  mouthStyle: 'smirk',   eyebrowAngle: -0.4 },
  { id: 'wow',        label: 'wow!',       icon: '😯', eyeStyle: 'big',     mouthStyle: 'oh',      eyebrowAngle:  0.5 },
  { id: 'cute',       label: 'cute',       icon: '✿',  eyeStyle: 'sparkle', mouthStyle: 'smile',   eyebrowAngle:  0.1 },
  { id: 'serious',    label: 'serious',    icon: '⌒', eyeStyle: 'normal',  mouthStyle: 'neutral', eyebrowAngle: -0.6 },
  { id: 'dreamy',     label: 'dreamy',     icon: '♡',  eyeStyle: 'sleepy',  mouthStyle: 'smile',   eyebrowAngle:  0.2 },
];

const DEFAULT_CONFIG = {
  skinTone: SKIN_TONES[1],
  hairStyle: 'short',
  hairColor: HAIR_COLORS[1],
  faceShape: 'round',
  eyeStyle: 'normal',
  eyeColor: EYE_COLORS[0],
  eyebrowAngle: 0,
  mouthStyle: 'smile',
  outfitColor: OUTFIT_COLORS[0],
  name: 'You',
  faceTexture: null,   // data URL — front capture, wraps the front of the head
  leftTexture: null,   // data URL — left capture, wraps the left cheek
  rightTexture: null,  // data URL — right capture, wraps the right cheek
};

const NPC_NAMES = ['Luna', 'Pip', 'Sage', 'Echo', 'Wren', 'Juno', 'Milo', 'Fern', 'Rio', 'Noor'];

// Canned greetings NPCs say when you walk near. One is assigned per NPC at spawn.
// (Real voice chat needs a backend/WebRTC; for now this is the Fortnite-style
// proximity UI prototype with text bubbles.)
const GREETINGS = [
  'hi there ♡',
  'hey new face!',
  'wanna hang?',
  'cute fit!',
  'oh!!',
  'good to see you',
  'haiii',
  'love the look',
  'come say hi ✿',
  'over here!',
];

// ────────────────────────────────────────────────────────────────
// FACE TEXTURE — composites the front capture into a soft, cute
// circular face that can be applied to the front of the head sphere.
// Cached per data URL so re-renders don't re-decode the image.
// ────────────────────────────────────────────────────────────────

const faceTextureCache = new Map();

function getFaceTexture(dataUrl) {
  if (!dataUrl) return null;
  const cached = faceTextureCache.get(dataUrl);
  if (cached) return cached;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const img = new Image();
  img.onload = () => {
    drawStylizedFace(canvas, img);
    tex.needsUpdate = true;
  };
  img.src = dataUrl;

  faceTextureCache.set(dataUrl, tex);
  return tex;
}

function drawStylizedFace(canvas, img) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // capture is already mirrored to match the user's preview, so we
  // draw it straight. crop a tighter square so the face fills more.
  const srcSide = Math.min(img.width, img.height);
  const zoom = 1.18;
  const cropSide = srcSide / zoom;
  const sx = (img.width - cropSide) / 2;
  const sy = (img.height - cropSide) / 2 - cropSide * 0.04;
  ctx.drawImage(img, sx, sy, cropSide, cropSide, 0, 0, w, h);

  // warm soft-light pass for the "stylized" feel
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(255, 196, 168, 0.22)';
  ctx.fillRect(0, 0, w, h);

  // gentle saturation/contrast bump
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(255, 220, 200, 0.10)';
  ctx.fillRect(0, 0, w, h);

  // feather to transparent at edges so face blends into head's skin tone
  ctx.globalCompositeOperation = 'destination-in';
  const cx = w / 2, cy = h * 0.50;
  const inner = Math.min(w, h) * 0.30;
  const outer = Math.min(w, h) * 0.50;
  const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(0.65, 'rgba(0,0,0,1)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'source-over';
}

// ────────────────────────────────────────────────────────────────
// AVATAR GEOMETRY BUILDER
// Builds a Mii-style low-poly humanoid from primitives.
// Returns a THREE.Group that can be added to any scene.
// ────────────────────────────────────────────────────────────────

function buildAvatar(config) {
  const group = new THREE.Group();
  const hasFaceTexture = !!(config.faceTexture || config.leftTexture || config.rightTexture);

  // ── PROPORTIONS — Mii-style when scanned (oversized head, stubby body), original otherwise ──
  const headR    = hasFaceTexture ? 0.80 : 0.42;
  const headY    = hasFaceTexture ? 1.15 : 1.45;
  const torsoH   = hasFaceTexture ? 0.30 : 0.70;
  const torsoY   = hasFaceTexture ? 0.42 : 0.70;
  const torsoT   = hasFaceTexture ? 0.24 : 0.35;
  const torsoB   = hasFaceTexture ? 0.30 : 0.42;
  const showNeck = !hasFaceTexture; // Mii heads sit right on the torso
  const neckY    = 1.10;
  const armSep   = hasFaceTexture ? 0.28 : 0.42;
  const armH     = hasFaceTexture ? 0.24 : 0.55;
  const armY     = hasFaceTexture ? 0.44 : 0.78;
  const armR     = hasFaceTexture ? 0.085 : 0.09;
  const armR2    = hasFaceTexture ? 0.075 : 0.08;
  const handX    = hasFaceTexture ? 0.30 : 0.49;
  const handY    = hasFaceTexture ? 0.30 : 0.50;
  const handR    = hasFaceTexture ? 0.13 : 0.10; // mitten-style stubby hands
  const legH     = hasFaceTexture ? 0.28 : 0.55;
  const legY     = hasFaceTexture ? 0.10 : 0.12;
  const footY    = hasFaceTexture ? -0.08 : -0.18; // close to leg bottom in Mii mode

  const skin = new THREE.Color(config.skinTone);
  const hair = new THREE.Color(config.hairColor);
  const eye = new THREE.Color(config.eyeColor);
  const outfit = new THREE.Color(config.outfitColor);

  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7, metalness: 0.02 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hair, roughness: 0.45, metalness: 0.05 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: eye, roughness: 0.3 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfaf7f0, roughness: 0.4 });
  const outfitMat = new THREE.MeshStandardMaterial({ color: outfit, roughness: 0.65, metalness: 0.04 });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x6b2a3a, roughness: 0.4 });
  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xffadb0, roughness: 0.8, transparent: true, opacity: 0.35
  });

  // ── BODY (torso) ──
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(torsoT, torsoB, torsoH, 16),
    outfitMat
  );
  torso.position.y = torsoY;
  group.add(torso);

  // collar/neck transition (hidden in Mii mode — head sits right on torso)
  if (showNeck) {
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 12), skinMat);
    neck.position.y = neckY;
    group.add(neck);
  }

  // ── ARMS ──
  const armGeom = new THREE.CylinderGeometry(armR, armR2, armH, 10);
  const lArm = new THREE.Mesh(armGeom, outfitMat);
  lArm.position.set(-armSep, armY, 0);
  lArm.rotation.z = 0.15;
  group.add(lArm);
  const rArm = new THREE.Mesh(armGeom, outfitMat);
  rArm.position.set(armSep, armY, 0);
  rArm.rotation.z = -0.15;
  group.add(rArm);

  // hands — chunky mittens
  const handGeom = new THREE.SphereGeometry(handR, 12, 10);
  const lHand = new THREE.Mesh(handGeom, skinMat);
  lHand.position.set(-handX, handY, 0);
  group.add(lHand);
  const rHand = new THREE.Mesh(handGeom, skinMat);
  rHand.position.set(handX, handY, 0);
  group.add(rHand);

  // ── LEGS ──
  const legGeom = new THREE.CylinderGeometry(0.13, 0.11, legH, 10);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3d3050, roughness: 0.7 });
  const lLeg = new THREE.Mesh(legGeom, legMat);
  lLeg.position.set(-0.16, legY, 0);
  group.add(lLeg);
  const rLeg = new THREE.Mesh(legGeom, legMat);
  rLeg.position.set(0.16, legY, 0);
  group.add(rLeg);

  // feet
  const footGeom = new THREE.SphereGeometry(0.13, 10, 8);
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1428, roughness: 0.5 });
  const lFoot = new THREE.Mesh(footGeom, shoeMat);
  lFoot.position.set(-0.16, footY, 0.05);
  lFoot.scale.set(1, 0.6, 1.4);
  group.add(lFoot);
  const rFoot = new THREE.Mesh(footGeom, shoeMat);
  rFoot.position.set(0.16, footY, 0.05);
  rFoot.scale.set(1, 0.6, 1.4);
  group.add(rFoot);

  // ── HEAD ── single round shape; identity comes from the photo wrap, not the silhouette
  const headShapeScale = [1, 1, 1];

  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 28, 22), skinMat);
  head.position.y = headY;
  group.add(head);

  // ── EARS ── only on the primitive head; the photo-wrapped head has no ear bumps
  if (!hasFaceTexture) {
    const earGeom = new THREE.SphereGeometry(0.07, 8, 6);
    const lEar = new THREE.Mesh(earGeom, skinMat);
    lEar.position.set(-headR * headShapeScale[0], headY, 0);
    lEar.scale.set(0.5, 1, 0.7);
    group.add(lEar);
    const rEar = new THREE.Mesh(earGeom, skinMat);
    rEar.position.set(headR * headShapeScale[0], headY, 0);
    rEar.scale.set(0.5, 1, 0.7);
    group.add(rEar);
  }

  let lEyeWhite = null, rEyeWhite = null, lPupil = null, rPupil = null;
  let faceShell = null;

  if (hasFaceTexture) {
    // ── FACE SHELLS ── three curved patches wrap the head with front/left/right captures.
    // Each shell is a partial sphere; alpha-feathered textures blend at the seams.
    // phi mapping (three.js convention: phi=0 → -X, π/2 → +Z front, π → +X):
    //   front  → π/2  (camera-facing)
    //   left capture (user turned left, exposing their right cheek to camera) → -X = phi 0  → avatar's right
    //   right capture (user turned right, exposing their left cheek to camera) → +X = phi π → avatar's left
    const shellPhiLen   = Math.PI * 0.78;   // ~140° per shell so neighbors overlap and feather together
    const shellThetaStart = Math.PI * 0.18;
    const shellThetaLen   = Math.PI * 0.58;
    const shellSpecs = [
      { url: config.faceTexture,  phiCenter: Math.PI / 2, rBump: 1.012 },
      { url: config.leftTexture,  phiCenter: 0,           rBump: 1.014 },
      { url: config.rightTexture, phiCenter: Math.PI,     rBump: 1.013 },
    ];
    for (const spec of shellSpecs) {
      if (!spec.url) continue;
      const tex = getFaceTexture(spec.url);
      const geom = new THREE.SphereGeometry(
        headR * spec.rBump,
        32, 24,
        spec.phiCenter - shellPhiLen / 2,
        shellPhiLen,
        shellThetaStart, shellThetaLen
      );
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0,
        transparent: true,
        alphaTest: 0.02,
        side: THREE.FrontSide,
        depthWrite: false,
      });
      const shell = new THREE.Mesh(geom, mat);
      shell.position.y = headY;
      group.add(shell);
      if (spec.phiCenter === Math.PI / 2) faceShell = shell; // keep front ref for userData
    }

    // Photo mode is intentionally minimal: head mesh + 3 photo shells, nothing else.
    // No hair dome, no blush, no primitive eyes/ears — the photos define the face.
    // Hair styling and facial features come back as a later iteration.
  } else {
    // ── EYES (primitives) ──
    const eyeFwdZ = (headR - 0.06) * headShapeScale[2];
    const eyeY = headY + 0.03;
    const eyeSep = 0.13;
    const eyeRadius = ({
      normal: 0.07, big: 0.085, sleepy: 0.07, sparkle: 0.08
    })[config.eyeStyle] || 0.07;

    const eyeWhiteGeom = new THREE.SphereGeometry(eyeRadius, 12, 10);
    lEyeWhite = new THREE.Mesh(eyeWhiteGeom, whiteMat);
    lEyeWhite.position.set(-eyeSep, eyeY, eyeFwdZ);
    group.add(lEyeWhite);
    rEyeWhite = new THREE.Mesh(eyeWhiteGeom, whiteMat);
    rEyeWhite.position.set(eyeSep, eyeY, eyeFwdZ);
    group.add(rEyeWhite);

    // pupils
    const pupilRadius = eyeRadius * 0.55;
    const pupilGeom = new THREE.SphereGeometry(pupilRadius, 10, 8);
    lPupil = new THREE.Mesh(pupilGeom, eyeMat);
    lPupil.position.set(-eyeSep, eyeY, eyeFwdZ + eyeRadius * 0.55);
    group.add(lPupil);
    rPupil = new THREE.Mesh(pupilGeom, eyeMat);
    rPupil.position.set(eyeSep, eyeY, eyeFwdZ + eyeRadius * 0.55);
    group.add(rPupil);

    // eye highlights (sparkle/normal)
    if (config.eyeStyle !== 'sleepy') {
      const hiSize = config.eyeStyle === 'sparkle' ? 0.022 : 0.015;
      const hiGeom = new THREE.SphereGeometry(hiSize, 8, 6);
      const lHi = new THREE.Mesh(hiGeom, whiteMat);
      lHi.position.set(-eyeSep + 0.015, eyeY + 0.015, eyeFwdZ + pupilRadius + 0.01);
      group.add(lHi);
      const rHi = new THREE.Mesh(hiGeom, whiteMat);
      rHi.position.set(eyeSep + 0.015, eyeY + 0.015, eyeFwdZ + pupilRadius + 0.01);
      group.add(rHi);
    }

    // sleepy: lid covering top of eye
    if (config.eyeStyle === 'sleepy') {
      const lidGeom = new THREE.SphereGeometry(eyeRadius * 1.02, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      const lLid = new THREE.Mesh(lidGeom, skinMat);
      lLid.position.set(-eyeSep, eyeY, eyeFwdZ);
      group.add(lLid);
      const rLid = new THREE.Mesh(lidGeom, skinMat);
      rLid.position.set(eyeSep, eyeY, eyeFwdZ);
      group.add(rLid);
    }

    // ── EYEBROWS ──
    const browGeom = new THREE.BoxGeometry(0.11, 0.018, 0.025);
    const browMat = hairMat;
    const browY = eyeY + 0.1;
    const browAng = config.eyebrowAngle; // -1 sad ... 1 angry
    const lBrow = new THREE.Mesh(browGeom, browMat);
    lBrow.position.set(-eyeSep, browY, eyeFwdZ + 0.01);
    lBrow.rotation.z = browAng * 0.35;
    group.add(lBrow);
    const rBrow = new THREE.Mesh(browGeom, browMat);
    rBrow.position.set(eyeSep, browY, eyeFwdZ + 0.01);
    rBrow.rotation.z = -browAng * 0.35;
    group.add(rBrow);

    // ── MOUTH ──
    const mouthY = headY - 0.13;
    const mouthZ = eyeFwdZ + 0.005;
    if (config.mouthStyle === 'smile' || config.mouthStyle === 'grin') {
      const radius = config.mouthStyle === 'grin' ? 0.08 : 0.06;
      const tube = config.mouthStyle === 'grin' ? 0.014 : 0.012;
      const mouth = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 8, 16, Math.PI),
        mouthMat
      );
      mouth.position.set(0, mouthY + radius * 0.4, mouthZ);
      mouth.rotation.z = Math.PI;
      group.add(mouth);
    } else if (config.mouthStyle === 'smirk') {
      const mouth = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.012, 8, 12, Math.PI * 0.7),
        mouthMat
      );
      mouth.position.set(0.015, mouthY + 0.02, mouthZ);
      mouth.rotation.z = Math.PI + 0.2;
      group.add(mouth);
    } else if (config.mouthStyle === 'neutral') {
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.015), mouthMat);
      mouth.position.set(0, mouthY, mouthZ);
      group.add(mouth);
    } else if (config.mouthStyle === 'oh') {
      const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), mouthMat);
      mouth.position.set(0, mouthY, mouthZ);
      mouth.scale.set(0.8, 1, 0.5);
      group.add(mouth);
    }

    // ── BLUSH ──
    const blushGeom = new THREE.SphereGeometry(0.06, 10, 8);
    const lBlush = new THREE.Mesh(blushGeom, blushMat);
    lBlush.position.set(-0.22, headY - 0.07, eyeFwdZ - 0.02);
    lBlush.scale.set(1, 0.6, 0.2);
    group.add(lBlush);
    const rBlush = new THREE.Mesh(blushGeom, blushMat);
    rBlush.position.set(0.22, headY - 0.07, eyeFwdZ - 0.02);
    rBlush.scale.set(1, 0.6, 0.2);
    group.add(rBlush);
  }

  // ── HAIR ── primitive hair-style cap only in non-photo mode; photo mode
  // uses the hair-dome shell built inside the face-shells branch above.
  if (!hasFaceTexture) {
    addHair(group, config.hairStyle, hairMat, headShapeScale, headR, headY);
  }

  // tags for animation (eye refs null in photo mode → blink no-ops)
  group.userData = {
    head, lEyeWhite, rEyeWhite, lPupil, rPupil, faceShell,
    lArm, rArm, lLeg, rLeg,
    materials: [skinMat, hairMat, eyeMat, whiteMat, outfitMat, mouthMat, blushMat, legMat, shoeMat],
  };
  return group;
}

function addHair(group, style, hairMat, hs, headR, headY) {

  if (style === 'short') {
    // cap-like, rests on top half of head
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 1.02, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    cap.position.y = headY;
    cap.scale.set(...hs);
    group.add(cap);
    // forehead bangs
    const bang = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.4, 12, 8), hairMat);
    bang.position.set(-0.12, headY + 0.16, headR * 0.85 * hs[2]);
    bang.scale.set(1.2, 0.5, 0.5);
    group.add(bang);
  } else if (style === 'bob') {
    // half-sphere going down past ears
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 1.06, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.72),
      hairMat
    );
    cap.position.y = headY;
    cap.scale.set(...hs);
    group.add(cap);
    // back fall
    const back = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.9, 16, 12), hairMat);
    back.position.set(0, headY - 0.05, -headR * 0.6 * hs[2]);
    back.scale.set(1, 1.1, 0.5);
    group.add(back);
  } else if (style === 'quiff') {
    // shorter base + tall flame
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 1.01, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      hairMat
    );
    cap.position.y = headY;
    cap.scale.set(...hs);
    group.add(cap);
    const quiff = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 8), hairMat);
    quiff.position.set(0, headY + 0.42, 0.1 * hs[2]);
    quiff.rotation.x = -0.4;
    group.add(quiff);
  } else if (style === 'long') {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 1.05, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.6),
      hairMat
    );
    cap.position.y = headY;
    cap.scale.set(...hs);
    group.add(cap);
    // long flowing back
    const back = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.25, 0.65, 12), hairMat);
    back.position.set(0, headY - 0.35, -0.18 * hs[2]);
    group.add(back);
    // side strands
    const lStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.4, 8), hairMat);
    lStrand.position.set(-0.34 * hs[0], headY - 0.15, 0.12 * hs[2]);
    group.add(lStrand);
    const rStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.4, 8), hairMat);
    rStrand.position.set(0.34 * hs[0], headY - 0.15, 0.12 * hs[2]);
    group.add(rStrand);
  } else if (style === 'bun') {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 1.01, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    cap.position.y = headY;
    cap.scale.set(...hs);
    group.add(cap);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), hairMat);
    bun.position.set(0, headY + 0.42, -0.05);
    group.add(bun);
  } else if (style === 'spiky') {
    // base cap
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(headR * 1.02, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      hairMat
    );
    cap.position.y = headY;
    cap.scale.set(...hs);
    group.add(cap);
    // spikes
    const spikePositions = [
      [-0.18, 0.4, 0.06], [0, 0.45, 0.08], [0.18, 0.4, 0.06],
      [-0.1, 0.42, -0.1], [0.1, 0.42, -0.1],
    ];
    for (const [x, y, z] of spikePositions) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), hairMat);
      spike.position.set(x, headY + y, z * hs[2]);
      spike.rotation.x = z * -2;
      spike.rotation.z = x * 1.5;
      group.add(spike);
    }
  }
}

function disposeGroup(group) {
  if (!group) return;
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
}

// ────────────────────────────────────────────────────────────────
// AVATAR PORTRAIT VIEWER — for customize phase
// ────────────────────────────────────────────────────────────────

function AvatarPortrait({ config, autoRotate = true, interactive = true }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 1.5, 3.2);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // lighting — soft, three-point
    const hemi = new THREE.HemisphereLight(0xfff0e0, 0x2a1f3d, 0.6);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff5e8, 1.1);
    key.position.set(2, 3, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8c5ff, 0.4);
    fill.position.set(-2, 2, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xff8fa3, 0.5);
    rim.position.set(0, 2, -3);
    scene.add(rim);

    // pedestal
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.85, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: 0x2a1f3d, roughness: 0.5, metalness: 0.2 })
    );
    pedestal.position.y = -0.21;
    scene.add(pedestal);
    const pedRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.012, 8, 64),
      new THREE.MeshStandardMaterial({ color: 0xFFB39E, emissive: 0xFFB39E, emissiveIntensity: 0.5 })
    );
    pedRing.position.y = -0.17;
    pedRing.rotation.x = Math.PI / 2;
    scene.add(pedRing);

    let avatar = buildAvatar(configRef.current);
    scene.add(avatar);

    stateRef.current = { scene, camera, renderer, avatar, pedestal };

    // interaction
    let rotY = 0;
    let targetRotY = 0;
    let isDragging = false;
    let lastX = 0;

    const onPointerDown = (e) => {
      if (!interactive) return;
      isDragging = true;
      lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = x - lastX;
      targetRotY += dx * 0.01;
      lastX = x;
    };
    const onPointerUp = () => { isDragging = false; };

    renderer.domElement.addEventListener('mousedown', onPointerDown);
    renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    let blinkT = 0;
    let frameId;
    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (autoRotate && !isDragging) targetRotY += dt * 0.3;
      rotY += (targetRotY - rotY) * 0.1;
      if (stateRef.current.avatar) stateRef.current.avatar.rotation.y = rotY;

      // gentle bobbing
      if (stateRef.current.avatar) {
        stateRef.current.avatar.position.y = Math.sin(now * 0.002) * 0.03;
      }

      // blink
      blinkT += dt;
      const ud = stateRef.current.avatar?.userData;
      if (ud) {
        const blinkPhase = (blinkT % 4) / 4;
        const blinkScale = blinkPhase > 0.95 ? Math.max(0.1, 1 - (blinkPhase - 0.95) * 40) : 1;
        if (ud.lEyeWhite) ud.lEyeWhite.scale.y = blinkScale;
        if (ud.rEyeWhite) ud.rEyeWhite.scale.y = blinkScale;
        if (ud.lPupil) ud.lPupil.scale.y = blinkScale;
        if (ud.rPupil) ud.rPupil.scale.y = blinkScale;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    // resize
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      renderer.domElement.removeEventListener('mousedown', onPointerDown);
      renderer.domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      disposeGroup(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  // rebuild avatar when config changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s || !s.scene) return;
    if (s.avatar) {
      const oldRot = s.avatar.rotation.y;
      s.scene.remove(s.avatar);
      disposeGroup(s.avatar);
      s.avatar = buildAvatar(config);
      s.avatar.rotation.y = oldRot;
      s.scene.add(s.avatar);
    }
  }, [config]);

  return <div ref={mountRef} className="w-full h-full" style={{ cursor: interactive ? 'grab' : 'default' }} />;
}

// ────────────────────────────────────────────────────────────────
// PHASE 1: INTRO — Tomodachi-style hero with a stage of cute Miis
// ────────────────────────────────────────────────────────────────

// Default cast for the landing stage when no user-created characters exist yet.
// As soon as the visitor creates and saves their own character (auto-saved on
// "enter your world"), it slots into the cast at the front and pushes a default
// out. See lib/savedCharacters.ts and IntroStage below for the merge logic.
const INTRO_CAST = [
  {
    skinTone: '#F4D9C4', hairStyle: 'short',  hairColor: '#3D2418',
    faceShape: 'round',  eyeStyle: 'sparkle', eyeColor: '#3A2418',
    eyebrowAngle: 0.0,   mouthStyle: 'grin',  outfitColor: '#FF8B7A',
    name: 'Pip',
    faceTexture: null, leftTexture: null, rightTexture: null,
  },
  {
    skinTone: '#DDB088', hairStyle: 'bun',    hairColor: '#5C3A22',
    faceShape: 'oval',   eyeStyle: 'big',     eyeColor: '#5C3B1F',
    eyebrowAngle: 0.1,   mouthStyle: 'smile', outfitColor: '#8DECC2',
    name: 'Sage',
    faceTexture: null, leftTexture: null, rightTexture: null,
  },
  {
    skinTone: '#EAC8A8', hairStyle: 'quiff',  hairColor: '#1F1812',
    faceShape: 'square', eyeStyle: 'normal',  eyeColor: '#1F3D5C',
    eyebrowAngle: -0.1,  mouthStyle: 'smile', outfitColor: '#FFD66B',
    name: 'Milo',
    faceTexture: null, leftTexture: null, rightTexture: null,
  },
];

function IntroStage() {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 1.05, 5.4);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // soft pastel light
    scene.add(new THREE.AmbientLight(0xFFF1E8, 0.95));
    const key = new THREE.DirectionalLight(0xFFE6CB, 0.7);
    key.position.set(2.5, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xCDE6F5, 0.45);
    rim.position.set(-3, 2, -2);
    scene.add(rim);

    // Build the cast — user-saved characters take the front of the line
    // (most recent first); the built-in INTRO_CAST fills any remaining slots
    // so the landing always has 3 avatars.
    const saved = loadSavedCharacters();
    const cast = [
      ...saved.slice(0, 3).map(s => s.config),
      ...INTRO_CAST,
    ].slice(0, 3);
    // (bigger heads need a bit more horizontal breathing room)
    const avatars = cast.map((cfg, i) => {
      const a = buildAvatar(cfg);
      const xs = [-1.7, 0, 1.7];
      a.position.set(xs[i], 0, 0);
      a.rotation.y = (i - 1) * 0.15;
      scene.add(a);
      return { mesh: a, phase: i * 0.9, sway: (i - 1) * 0.08 };
    });

    let frameId;
    let lastTime = performance.now();
    let t = 0;
    const animate = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      t += dt;
      for (const a of avatars) {
        const bob = Math.sin(t * 2.2 + a.phase) * 0.06;
        a.mesh.position.y = bob;
        a.mesh.rotation.y = a.sway + Math.sin(t * 0.9 + a.phase) * 0.18;
        // tiny tilt
        a.mesh.rotation.z = Math.sin(t * 1.3 + a.phase * 1.5) * 0.025;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      disposeGroup(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

function Intro({ onBegin }) {
  return (
    <div className="bloom-root font-body relative w-full h-full overflow-hidden" style={{
      background: 'linear-gradient(180deg, #BCE3F2 0%, #FFE9D9 55%, #FFCDD9 100%)',
      color: '#3D2418',
    }}>
      {/* sun */}
      <div className="absolute" style={{
        width: '240px', height: '240px', top: '-60px', right: '-40px',
        background: 'radial-gradient(circle at center, #FFE38A 0%, rgba(255,227,138,0.55) 45%, rgba(255,227,138,0) 70%)',
        borderRadius: '50%', filter: 'blur(2px)',
      }} />

      {/* floating decorations */}
      <div className="absolute" style={{ top: '14%', left: '8%', animation: 'float-up 6s ease-in-out infinite' }}>
        <div style={{ width: '54px', height: '54px', background: '#FFD66B', borderRadius: '14px', boxShadow: '0 6px 0 #E5A739, 0 12px 20px -6px rgba(229,167,57,0.4)', transform: 'rotate(-12deg)' }} />
      </div>
      <div className="absolute" style={{ top: '22%', right: '10%', animation: 'float-up 7s ease-in-out infinite 0.8s' }}>
        <div style={{ width: '44px', height: '44px', background: '#FF8B7A', borderRadius: '50%', boxShadow: '0 5px 0 #D45D4B, 0 10px 18px -5px rgba(212,93,75,0.45)' }} />
      </div>
      <div className="absolute" style={{ bottom: '24%', left: '6%', animation: 'float-up 8s ease-in-out infinite 1.4s' }}>
        <div style={{ width: '38px', height: '38px', background: '#8DECC2', borderRadius: '12px', boxShadow: '0 5px 0 #4DBE93, 0 10px 16px -5px rgba(77,190,147,0.45)', transform: 'rotate(18deg)' }} />
      </div>
      <div className="absolute" style={{ bottom: '32%', right: '7%', animation: 'float-up 6.5s ease-in-out infinite 0.4s' }}>
        <div style={{ width: '30px', height: '30px', background: '#A5D8F3', borderRadius: '50%', boxShadow: '0 4px 0 #6FB6DD, 0 8px 14px -4px rgba(111,182,221,0.4)' }} />
      </div>

      {/* sparkles */}
      {[
        { top: '18%', left: '22%', size: 16, delay: '0s' },
        { top: '12%', right: '26%', size: 12, delay: '0.6s' },
        { top: '40%', left: '12%', size: 10, delay: '1.2s' },
        { top: '46%', right: '14%', size: 14, delay: '0.3s' },
        { bottom: '38%', left: '24%', size: 12, delay: '1s' },
      ].map((s, i) => (
        <div key={i} className="absolute" style={{
          ...s, width: undefined, height: undefined,
          animation: `sparkle-twinkle 2.4s ease-in-out infinite ${s.delay}`,
        }}>
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.8 9.5L21.5 11.2L13.8 12.9L12 22L10.2 12.9L2.5 11.2L10.2 9.5L12 2Z" fill="#FFD66B" stroke="#E5A739" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
      ))}

      {/* top bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 pill-tag font-cute text-sm font-semibold" style={{
        animation: 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        <span style={{ fontSize: '14px' }}>✿</span>
        <span style={{ letterSpacing: '0.04em' }}>WEE · v0.1</span>
      </div>

      {/* main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-24 md:pt-28 px-8 text-center">
        {/* tagline above wordmark */}
        <div className="font-cute text-sm md:text-base font-semibold mb-2" style={{
          color: '#C2553D', letterSpacing: '0.04em',
          animation: 'fade-up 0.8s ease-out 0.2s both',
        }}>
          ♡ your tiny digital twin ♡
        </div>

        {/* WEE wordmark */}
        <h1 className="font-cute leading-[0.85] mb-3" style={{
          fontSize: 'clamp(96px, 18vw, 200px)',
          fontWeight: 700,
          background: 'linear-gradient(180deg, #FF8B7A 0%, #FF5A6B 65%, #E63A57 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          WebkitTextStroke: '4px #fff',
          paintOrder: 'stroke fill',
          filter: 'drop-shadow(0 6px 0 rgba(199, 47, 89, 0.55)) drop-shadow(0 14px 22px rgba(199, 47, 89, 0.35))',
          animation: 'pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both',
        }}>
          Wee
        </h1>

        {/* subtitle */}
        <p className="font-cute text-lg md:text-xl mb-1 max-w-xl" style={{
          color: '#4A2C18', fontWeight: 500,
          animation: 'fade-up 0.8s ease-out 0.35s both',
        }}>
          a cozy little world for your stylized self.
        </p>
        <p className="font-cute text-sm md:text-base mb-2 max-w-md" style={{
          color: 'rgba(74, 44, 24, 0.6)', fontWeight: 400,
          animation: 'fade-up 0.8s ease-out 0.5s both',
        }}>
          snap a selfie → meet your mini-me → hang with new friends.
        </p>

        {/* the stage of characters */}
        <div className="relative w-full max-w-[760px] mb-2" style={{
          height: '300px',
          animation: 'pop-in 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both',
        }}>
          {/* stage glow plate */}
          <div className="absolute inset-x-8 bottom-8 h-12 stage-plate" />
          {/* stage shadow ellipse */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-10" style={{
            width: '60%', height: '24px',
            background: 'radial-gradient(ellipse at center, rgba(74,44,24,0.22) 0%, rgba(74,44,24,0) 70%)',
            filter: 'blur(2px)',
          }} />
          <IntroStage />
        </div>

        {/* CTA */}
        <button
          onClick={onBegin}
          className="btn-cute font-cute text-lg md:text-xl font-bold px-10 py-4 inline-flex items-center gap-3 mb-3"
          style={{ animation: 'pop-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.85s both' }}
        >
          <Sparkles className="w-5 h-5" />
          create your character
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-xs md:text-sm font-cute" style={{
          color: 'rgba(74, 44, 24, 0.55)',
          animation: 'fade-up 0.8s ease-out 1.05s both',
        }}>
          ~ 30 seconds · webcam required · nothing leaves your browser
        </div>
      </div>

      {/* bottom step pips */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 font-cute text-xs font-semibold" style={{
        color: 'rgba(74, 44, 24, 0.55)',
        animation: 'fade-up 0.8s ease-out 1.2s both',
      }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#FF8B7A' }} /> snap
        </span>
        <span style={{ color: 'rgba(74,44,24,0.3)' }}>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#FFD66B' }} /> shape
        </span>
        <span style={{ color: 'rgba(74,44,24,0.3)' }}>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#8DECC2' }} /> style
        </span>
        <span style={{ color: 'rgba(74,44,24,0.3)' }}>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#A5D8F3' }} /> hang
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PHASE 2: SCAN — webcam capture, front/left/right
// ────────────────────────────────────────────────────────────────

const SCAN_STEPS = [
  { id: 'front', label: 'look straight ahead', sub: 'keep your face centered' },
  { id: 'left', label: 'turn gently to your left', sub: 'about 30 degrees' },
  { id: 'right', label: 'now to your right', sub: 'one last angle' },
];

function Scan({ onComplete, onSkip }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [step, setStep] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [error, setError] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    let active = true;
    let s;
    (async () => {
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 720 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        if (!active) { s.getTracks().forEach(t => t.stop()); return; }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        if (active) setError(e.message || 'camera unavailable');
      }
    })();
    return () => {
      active = false;
      if (s) s.getTracks().forEach(t => t.stop());
    };
  }, []);

  const doCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = 320;
    c.height = 320;
    const ctx = c.getContext('2d');
    // square crop center
    const vw = v.videoWidth, vh = v.videoHeight;
    const side = Math.min(vw, vh);
    const sx = (vw - side) / 2, sy = (vh - side) / 2;
    // mirror to match preview
    ctx.save();
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, side, side, 0, 0, c.width, c.height);
    ctx.restore();
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    const imageData = ctx.getImageData(0, 0, c.width, c.height);
    setCaptures(prev => [...prev, { id: SCAN_STEPS[step].id, dataUrl, imageData }]);
    setCapturing(false);
    if (step < SCAN_STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 500);
    } else {
      // done — proceed to analysis
      setTimeout(() => {
        const all = [...captures, { id: SCAN_STEPS[step].id, dataUrl, imageData }];
        onComplete(all);
      }, 700);
    }
  }, [step, captures, onComplete]);

  const startCapture = () => {
    if (capturing) return;
    setCapturing(true);
    setCountdown(3);
    let n = 3;
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(null);
        doCapture();
      } else {
        setCountdown(n);
        setTimeout(tick, 700);
      }
    };
    setTimeout(tick, 700);
  };

  const cur = SCAN_STEPS[step];

  return (
    <div className="bloom-root font-body wee-bg-pastel relative w-full h-full overflow-hidden flex flex-col text-warm">
      {/* sun in corner for consistency with landing */}
      <div className="absolute" style={{
        width: '220px', height: '220px', top: '-60px', right: '-40px',
        background: 'radial-gradient(circle at center, #FFE38A 0%, rgba(255,227,138,0.5) 45%, rgba(255,227,138,0) 70%)',
        borderRadius: '50%', filter: 'blur(2px)',
      }} />

      {/* header */}
      <div className="flex justify-between items-center px-8 py-6 z-10">
        <div className="pill-cute font-cute font-semibold text-sm flex items-center gap-2 px-4 py-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#FF8B7A', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
          snapping your selfies
        </div>
        <div className="flex items-center gap-2">
          {SCAN_STEPS.map((s, i) => (
            <div key={s.id} className="h-2 rounded-full transition-all" style={{
              width: i === step ? '36px' : '18px',
              background: i < captures.length ? '#8DECC2' : i === step ? '#FF8B7A' : 'rgba(74, 44, 24, 0.15)',
              boxShadow: i < captures.length || i === step ? '0 2px 0 rgba(74,44,24,0.18)' : 'none',
            }} />
          ))}
        </div>
        <button onClick={onSkip} className="font-cute text-sm font-semibold text-warm-faded hover:text-warm-soft transition-colors">
          skip →
        </button>
      </div>

      {/* center: webcam frame */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div key={step} className="mb-6 text-center" style={{ animation: 'fade-up 0.5s ease-out' }}>
          <div className="font-cute text-xs font-semibold mb-2" style={{ color: '#C2553D', letterSpacing: '0.18em' }}>
            STEP {step + 1} OF {SCAN_STEPS.length}
          </div>
          <h2 className="font-cute text-3xl md:text-4xl mb-1" style={{ color: '#3D2418', fontWeight: 700 }}>
            {cur.label}
          </h2>
          <p className="font-cute text-sm md:text-base text-warm-soft">{cur.sub}</p>
        </div>

        {/* video frame */}
        <div className="relative" style={{ width: 'min(360px, 80vw)', height: 'min(360px, 80vw)' }}>
          {/* corner brackets */}
          <div className="scan-frame-corner-cute" style={{ top: -10, left: -10, borderRight: 'none', borderBottom: 'none', borderTopLeftRadius: 10 }} />
          <div className="scan-frame-corner-cute" style={{ top: -10, right: -10, borderLeft: 'none', borderBottom: 'none', borderTopRightRadius: 10 }} />
          <div className="scan-frame-corner-cute" style={{ bottom: -10, left: -10, borderRight: 'none', borderTop: 'none', borderBottomLeftRadius: 10 }} />
          <div className="scan-frame-corner-cute" style={{ bottom: -10, right: -10, borderLeft: 'none', borderTop: 'none', borderBottomRightRadius: 10 }} />

          <div className="absolute inset-0 rounded-3xl overflow-hidden card-cute" style={{ padding: 0 }}>
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Camera className="w-10 h-10 mb-3" style={{ color: 'rgba(74,44,24,0.3)' }} />
                <p className="font-cute text-sm mb-3 text-warm-soft">camera unavailable</p>
                <p className="font-cute text-xs mb-4 text-warm-faded">{error}</p>
                <button onClick={onSkip} className="btn-cute font-cute text-sm font-bold px-5 py-2.5">
                  use random instead
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                  playsInline
                  muted
                />
                {/* face guide */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <ellipse cx="50" cy="48" rx="22" ry="30" fill="none"
                    stroke="rgba(255, 139, 122, 0.55)" strokeWidth="0.4" strokeDasharray="2 2" />
                </svg>
                {/* scan line */}
                {capturing && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-0 right-0 h-0.5" style={{
                      background: 'linear-gradient(90deg, transparent, #FF8B7A, transparent)',
                      boxShadow: '0 0 14px #FF8B7A',
                      animation: 'scan-sweep 1.2s ease-in-out infinite'
                    }} />
                  </div>
                )}
                {/* countdown */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{
                    background: 'rgba(255, 244, 230, 0.55)'
                  }}>
                    <div className="font-cute text-9xl" style={{ color: '#FF5A6B', fontWeight: 700, WebkitTextStroke: '4px #fff', paintOrder: 'stroke fill' }}>
                      {countdown}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* capture button */}
        <div className="mt-8 flex items-center gap-4">
          {!error && (
            <button
              onClick={startCapture}
              disabled={capturing}
              className="btn-cute font-cute text-base md:text-lg font-bold px-8 py-3.5 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5" />
              {capturing ? 'hold still...' : 'snap!'}
            </button>
          )}
        </div>

        {/* thumbnails */}
        <div className="mt-8 flex gap-3">
          {SCAN_STEPS.map((s, i) => {
            const cap = captures[i];
            return (
              <div key={s.id} className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden" style={{
                  background: '#FFF7EE',
                  border: i === step ? '3px solid #FF8B7A' : '3px solid #FFE3D1',
                  boxShadow: '0 4px 0 rgba(255,179,158,0.32)',
                }}>
                  {cap ? (
                    <img src={cap.dataUrl} className="w-full h-full object-cover" alt={s.id} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-cute text-[10px] tracking-widest uppercase font-semibold text-warm-faded">
                      {s.id}
                    </div>
                  )}
                </div>
                {cap && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{
                    background: '#8DECC2', color: '#1a4a34', border: '2px solid #fff',
                    boxShadow: '0 3px 0 #4DBE93',
                  }}>
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* footer hint */}
      <div className="text-center pb-6 font-cute text-xs md:text-sm font-medium text-warm-faded">
        ♡ photos stay on your device · nothing gets uploaded ♡
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// FACE ANALYSIS — real pixel sampling from captured frames
// ────────────────────────────────────────────────────────────────

function analyzeFaces(captures) {
  // Use the FRONT photo primarily; left/right wrap the sides of the head
  const front = captures.find(c => c.id === 'front') || captures[0];
  const leftCap  = captures.find(c => c.id === 'left');
  const rightCap = captures.find(c => c.id === 'right');
  if (!front || !front.imageData) return { ...DEFAULT_CONFIG };

  const { data, width, height } = front.imageData;

  // Sample center region for skin tone (avoid eyes/mouth area)
  const skinSamples = [];
  const cx = width / 2, cy = height / 2;
  // cheeks: slightly below center, left & right of midline
  const cheekRegions = [
    { cx: cx - width * 0.13, cy: cy + height * 0.05, r: 20 },
    { cx: cx + width * 0.13, cy: cy + height * 0.05, r: 20 },
    { cx: cx, cy: cy + height * 0.12, r: 18 }, // chin/jaw
  ];
  for (const region of cheekRegions) {
    for (let y = region.cy - region.r; y < region.cy + region.r; y += 2) {
      for (let x = region.cx - region.r; x < region.cx + region.r; x += 2) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4;
        if (i >= 0 && i < data.length - 3) {
          skinSamples.push([data[i], data[i+1], data[i+2]]);
        }
      }
    }
  }
  const skinAvg = avgColor(skinSamples);

  // Sample top region for hair color (top 25%, center-ish)
  const hairSamples = [];
  for (let y = height * 0.05; y < height * 0.22; y += 2) {
    for (let x = width * 0.3; x < width * 0.7; x += 2) {
      const i = (Math.floor(y) * width + Math.floor(x)) * 4;
      if (i >= 0 && i < data.length - 3) {
        // skip if very bright (likely background)
        const lum = (data[i] + data[i+1] + data[i+2]) / 3;
        if (lum < 240 && lum > 15) {
          hairSamples.push([data[i], data[i+1], data[i+2]]);
        }
      }
    }
  }
  const hairAvg = hairSamples.length > 30 ? avgColor(hairSamples) : null;

  // Build config — extracted skin + best-guess hair, randomize rest playfully
  const skinHex = rgbToHex(skinAvg);
  // pick the closest skin tone preset
  const skinClosest = closestColor(skinAvg, SKIN_TONES);

  let hairHex;
  if (hairAvg) {
    hairHex = closestColor(hairAvg, HAIR_COLORS);
  } else {
    hairHex = HAIR_COLORS[1];
  }

  // kick off texture decodes early so all three sides are warm by the time we reach Customize
  if (front.dataUrl)    getFaceTexture(front.dataUrl);
  if (leftCap?.dataUrl)  getFaceTexture(leftCap.dataUrl);
  if (rightCap?.dataUrl) getFaceTexture(rightCap.dataUrl);

  return {
    skinTone: skinClosest,
    hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
    hairColor: hairHex,
    faceShape: 'round',
    eyeStyle: EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)],
    eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
    eyebrowAngle: (Math.random() - 0.5) * 0.6,
    mouthStyle: 'smile',
    outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
    name: 'You',
    faceTexture:  front.dataUrl   || null,
    leftTexture:  leftCap?.dataUrl  || null,
    rightTexture: rightCap?.dataUrl || null,
    extracted: { skinHex, hairHex },
  };
}

function avgColor(samples) {
  if (!samples.length) return [128, 128, 128];
  let r = 0, g = 0, b = 0;
  for (const s of samples) { r += s[0]; g += s[1]; b += s[2]; }
  return [r / samples.length, g / samples.length, b / samples.length];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/.{2}/g);
  return m ? m.map(h => parseInt(h, 16)) : [128, 128, 128];
}
function closestColor(rgb, palette) {
  let best = palette[0], bestD = Infinity;
  for (const p of palette) {
    const pr = hexToRgb(p);
    const d = Math.pow(rgb[0]-pr[0], 2) + Math.pow(rgb[1]-pr[1], 2) + Math.pow(rgb[2]-pr[2], 2);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

// ────────────────────────────────────────────────────────────────
// PHASE 3: ANALYZE
// ────────────────────────────────────────────────────────────────

function Analyze({ captures, onComplete }) {
  const [stage, setStage] = useState(0);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // run analysis
    const result = captures && captures.length
      ? analyzeFaces(captures)
      : { ...DEFAULT_CONFIG };
    setConfig(result);

    const timers = [];
    timers.push(setTimeout(() => setStage(1), 500));
    timers.push(setTimeout(() => setStage(2), 1300));
    timers.push(setTimeout(() => setStage(3), 2100));
    timers.push(setTimeout(() => setStage(4), 2900));
    timers.push(setTimeout(() => onComplete(result), 3800));
    return () => timers.forEach(clearTimeout);
  }, [captures, onComplete]);

  const traits = config ? [
    { label: 'skin tone', value: config.extracted?.skinHex || config.skinTone, swatch: config.skinTone },
    { label: 'hair color', value: config.extracted?.hairHex || config.hairColor, swatch: config.hairColor },
    { label: 'face shape', value: config.faceShape, swatch: '#FFC9B5' },
    { label: 'expression', value: 'serene', swatch: '#8DECC2' },
  ] : [];

  return (
    <div className="bloom-root font-body wee-bg-pastel relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-warm">
      {/* sun */}
      <div className="absolute" style={{
        width: '240px', height: '240px', top: '-60px', right: '-40px',
        background: 'radial-gradient(circle at center, #FFE38A 0%, rgba(255,227,138,0.5) 45%, rgba(255,227,138,0) 70%)',
        borderRadius: '50%', filter: 'blur(2px)',
      }} />

      {/* floating sparkles */}
      {[
        { top: '20%', left: '18%', size: 14, delay: '0s' },
        { top: '28%', right: '20%', size: 12, delay: '0.6s' },
        { bottom: '24%', left: '22%', size: 10, delay: '1.2s' },
        { bottom: '32%', right: '18%', size: 14, delay: '0.3s' },
      ].map((s, i) => (
        <div key={i} className="absolute" style={{ ...s, width: undefined, height: undefined,
          animation: `sparkle-twinkle 2.4s ease-in-out infinite ${s.delay}` }}>
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.8 9.5L21.5 11.2L13.8 12.9L12 22L10.2 12.9L2.5 11.2L10.2 9.5L12 2Z" fill="#FFD66B" stroke="#E5A739" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
      ))}

      <div className="relative text-center px-8">
        <div className="pill-cute font-cute text-xs font-semibold inline-flex items-center gap-2 px-4 py-2 mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span style={{ letterSpacing: '0.18em' }}>MAKING YOUR WEE</span>
        </div>
        <h2 className="font-cute text-4xl md:text-5xl mb-10" style={{
          color: '#3D2418', fontWeight: 700,
          WebkitTextStroke: '2px #fff', paintOrder: 'stroke fill',
          filter: 'drop-shadow(0 3px 0 rgba(255,179,158,0.4))',
        }}>
          studying your shapes...
        </h2>

        {/* orbiting dots */}
        <div className="relative w-32 h-32 mx-auto mb-12">
          <div className="absolute inset-0" style={{ animation: 'spin-slow 4s linear infinite' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: '#FF8B7A', boxShadow: '0 2px 0 #D45D4B' }} />
          </div>
          <div className="absolute inset-2" style={{ animation: 'spin-slow 5s linear infinite reverse' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: '#8DECC2', boxShadow: '0 2px 0 #4DBE93' }} />
          </div>
          <div className="absolute inset-4" style={{ animation: 'spin-slow 6s linear infinite' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full" style={{ background: '#FFD66B', boxShadow: '0 2px 0 #E5A739' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-7 h-7" style={{ color: '#FF8B7A' }} />
          </div>
        </div>

        {/* traits revealing */}
        <div className="space-y-3 max-w-md mx-auto">
          {traits.map((t, i) => (
            <div key={t.label}
              className="card-cute flex items-center justify-between px-5 py-3.5"
              style={{
                opacity: stage > i ? 1 : 0,
                transform: stage > i ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.5s ease-out',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full" style={{ background: t.swatch, border: '2px solid #fff', boxShadow: '0 2px 0 rgba(74,44,24,0.15)' }} />
                <span className="font-cute font-semibold text-sm text-warm-soft" style={{ letterSpacing: '0.08em' }}>
                  {t.label}
                </span>
              </div>
              <span className="font-cute text-base font-bold text-warm">
                {t.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PHASE 4: CUSTOMIZE
// ────────────────────────────────────────────────────────────────

function generateVibe(config: any): string {
  const exprId = matchExpression(config) || 'serene';
  const hairStyle = config?.hairStyle || 'short';
  const faceShape = config?.faceShape || 'round';
  const moodMap: Record<string, string> = {
    serene:  'calm · quietly observant · brings the room down by half a notch',
    cheerful:'sunny · easy to laugh · the friend who always knows a coffee spot',
    sleepy:  'soft-spoken · perpetually cozy · runs on tea and small naps',
    sparkle: 'curious · talks fast · saves screenshots of everything',
    determined: 'focused · finishes what they start · politely competitive',
    serious: 'thoughtful · listens before speaking · writes good DMs',
  };
  const styleMap: Record<string, string> = {
    short:   'crisp look',
    long:    'romantic energy',
    pony:    'always-moving energy',
    bun:     'busy-but-grounded energy',
    curly:   'expressive energy',
    bald:    'low-fuss energy',
    cap:     'casual cool',
  };
  const shapeMap: Record<string, string> = {
    round:   'soft features',
    oval:    'classic features',
    square:  'sharp features',
    heart:   'gentle features',
    long:    'elegant features',
  };
  const mood = moodMap[exprId] || moodMap.serene;
  const style = styleMap[hairStyle] || 'unique energy';
  const shape = shapeMap[faceShape] || 'distinct features';
  return `${shape} · ${style} · ${mood}`;
}

function Customize({ config, onChange, onEnter }) {
  const [tab, setTab] = useState('face');

  const update = (patch) => onChange({ ...config, ...patch });

  return (
    <div className="bloom-root font-body wee-bg-pastel relative w-full h-full overflow-hidden flex text-warm">
      {/* sun */}
      <div className="absolute" style={{
        width: '260px', height: '260px', top: '-70px', left: '-50px',
        background: 'radial-gradient(circle at center, #FFE38A 0%, rgba(255,227,138,0.5) 45%, rgba(255,227,138,0) 70%)',
        borderRadius: '50%', filter: 'blur(2px)', pointerEvents: 'none',
      }} />
      {/* floating decorations */}
      <div className="absolute" style={{ top: '14%', left: '8%', animation: 'float-up 7s ease-in-out infinite' }}>
        <div style={{ width: '40px', height: '40px', background: '#FFD66B', borderRadius: '12px', boxShadow: '0 5px 0 #E5A739', transform: 'rotate(-10deg)' }} />
      </div>
      <div className="absolute" style={{ bottom: '18%', left: '10%', animation: 'float-up 8s ease-in-out infinite 0.6s' }}>
        <div style={{ width: '32px', height: '32px', background: '#8DECC2', borderRadius: '50%', boxShadow: '0 4px 0 #4DBE93' }} />
      </div>

      {/* left: 3D viewer */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-8 left-8 z-10">
          <div className="pill-cute font-cute text-xs font-semibold inline-flex items-center gap-2 px-4 py-2 mb-3">
            <Sparkles className="w-3 h-3" />
            <span style={{ letterSpacing: '0.16em' }}>MAKE YOUR CHARACTER</span>
          </div>
          <h2 className="font-cute text-4xl md:text-5xl" style={{
            color: '#3D2418', fontWeight: 700,
            WebkitTextStroke: '2px #fff', paintOrder: 'stroke fill',
            filter: 'drop-shadow(0 4px 0 rgba(255,179,158,0.4))',
          }}>
            you, but cuter.
          </h2>
        </div>

        <div className="absolute bottom-8 left-8 pill-soft font-cute text-xs font-semibold inline-flex items-center gap-2 px-3.5 py-2">
          <Move className="w-3 h-3" />
          drag to rotate
        </div>

        <div className="absolute inset-0">
          <AvatarPortrait config={config} />
        </div>
      </div>

      {/* right: panel */}
      <div className="w-full max-w-md flex flex-col p-4">
        <div className="card-cute-strong flex flex-col h-full overflow-hidden">
          {/* tabs */}
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: '#FFF1E6', border: '2px solid #FFE3D1' }}>
              {[
                { id: 'face', label: 'face', Icon: User },
                { id: 'hair', label: 'hair', Icon: Scissors },
                { id: 'eyes', label: 'eyes', Icon: EyeIcon },
                { id: 'mood', label: 'mood', Icon: Smile },
                { id: 'fit',  label: 'fit',  Icon: Palette },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`tab-cute font-cute flex-1 flex flex-col items-center gap-1 py-2.5 ${tab === id ? 'selected' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.08em' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* content */}
          <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'thin' }}>
            {tab === 'face' && (
              <div className="space-y-6">
                <Section label="skin tone">
                  <SwatchRow colors={SKIN_TONES} selected={config.skinTone} onSelect={(c) => update({ skinTone: c })} />
                </Section>
              </div>
            )}
            {tab === 'hair' && (
              <div className="space-y-6">
                <Section label="style">
                  <OptionRow options={HAIR_STYLES} selected={config.hairStyle} onSelect={(v) => update({ hairStyle: v })} />
                </Section>
                <Section label="color">
                  <SwatchRow colors={HAIR_COLORS} selected={config.hairColor} onSelect={(c) => update({ hairColor: c })} />
                </Section>
              </div>
            )}
            {tab === 'eyes' && (
              <div className="space-y-6">
                <Section label="shape">
                  <OptionRow options={EYE_STYLES} selected={config.eyeStyle} onSelect={(v) => update({ eyeStyle: v })} />
                </Section>
                <Section label="color">
                  <SwatchRow colors={EYE_COLORS} selected={config.eyeColor} onSelect={(c) => update({ eyeColor: c })} />
                </Section>
              </div>
            )}
            {tab === 'mood' && (
              <div className="space-y-6">
                <Section label="expression">
                  <ExpressionRow
                    selected={matchExpression(config)}
                    onSelect={(preset) => update({
                      eyeStyle: preset.eyeStyle,
                      mouthStyle: preset.mouthStyle,
                      eyebrowAngle: preset.eyebrowAngle,
                    })}
                  />
                </Section>
                <Section label="mouth">
                  <OptionRow options={MOUTH_STYLES} selected={config.mouthStyle} onSelect={(v) => update({ mouthStyle: v })} />
                </Section>
                <Section label="eyebrow tilt">
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="-1" max="1" step="0.05"
                      value={config.eyebrowAngle}
                      onChange={(e) => update({ eyebrowAngle: parseFloat(e.target.value) })}
                      className="slider-cute"
                    />
                    <div className="flex justify-between font-cute text-[10px] font-semibold uppercase text-warm-faded" style={{ letterSpacing: '0.12em' }}>
                      <span>worried</span>
                      <span>neutral</span>
                      <span>fierce</span>
                    </div>
                  </div>
                </Section>
              </div>
            )}
            {tab === 'fit' && (
              <div className="space-y-6">
                <Section label="outfit color">
                  <SwatchRow colors={OUTFIT_COLORS} selected={config.outfitColor} onSelect={(c) => update({ outfitColor: c })} />
                </Section>
                <Section label="display name">
                  <input
                    value={config.name}
                    onChange={(e) => update({ name: e.target.value.slice(0, 14) })}
                    maxLength={14}
                    className="input-cute font-cute w-full px-4 py-3 text-base font-semibold"
                  />
                </Section>
                <Section label="vibe">
                  <div className="rounded-2xl p-4" style={{ background: '#FFF7EE', border: '2px solid #FFE3D1' }}>
                    <p className="font-cute text-base font-semibold text-warm">
                      {generateVibe(config)}
                    </p>
                  </div>
                </Section>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="p-5" style={{ borderTop: '2px solid #FFE3D1' }}>
            <button
              onClick={onEnter}
              className="btn-cute font-cute w-full py-4 text-base md:text-lg font-bold inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              enter your world
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="font-cute text-xs font-bold uppercase mb-3 text-warm-soft" style={{ letterSpacing: '0.14em' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SwatchRow({ colors, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`swatch-cute w-10 h-10 rounded-full ${selected === c ? 'selected' : ''}`}
          style={{ background: c }}
          aria-label={c}
        />
      ))}
    </div>
  );
}

function OptionRow({ options, selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={`option-cute font-cute py-2.5 text-xs uppercase ${selected === o ? 'selected' : ''}`}
          style={{ letterSpacing: '0.06em' }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// Find the EXPRESSION preset that best matches the current config (or null).
function matchExpression(config) {
  return EXPRESSIONS.find(p =>
    p.eyeStyle === config.eyeStyle &&
    p.mouthStyle === config.mouthStyle &&
    Math.abs(p.eyebrowAngle - (config.eyebrowAngle ?? 0)) < 0.06
  )?.id || null;
}

function ExpressionRow({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {EXPRESSIONS.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className={`option-cute font-cute flex flex-col items-center justify-center gap-0.5 py-2 ${selected === p.id ? 'selected' : ''}`}
          title={p.label}
        >
          <span className="text-lg leading-none" style={{ filter: 'saturate(1.1)' }}>{p.icon}</span>
          <span className="text-[10px] font-bold uppercase" style={{ letterSpacing: '0.04em' }}>{p.label}</span>
        </button>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PHASE 5: WORLD — Wee Street lobby (Easy Tomorrow inspired)
// A walkable 3D lobby with shop/building facades that act as
// portals into games and communities (each opens a "coming soon"
// modal for now — slots to fill in later).
// ────────────────────────────────────────────────────────────────

const SHOPS = [
  { id: 'arcade',  name: 'Arcade',    tagline: 'play tiny games together',     icon: '🕹️', color: 0xFFB39E, accent: '#FF8B7A', side: 'L', z: -22 },
  { id: 'community', name: 'Community', tagline: 'cozy social plaza · meet & chat', icon: '👋', color: 0xFFD9C2, accent: '#E89B6E', side: 'R', z: -22 },
  { id: 'studio',  name: 'Studio',    tagline: 'draw, build, share',           icon: '🎨', color: 0xC9B5FF, accent: '#8B7AB8', side: 'L', z:  -4 },
  { id: 'garden',  name: 'Garden',    tagline: 'a quiet co-op grow space',     icon: '🌿', color: 0xA8E6CF, accent: '#5D8C5A', side: 'R', z:  -4 },
  { id: 'theater', name: 'Theater',   tagline: 'shows, jams, performances',    icon: '🎭', color: 0xE895B5, accent: '#D86F8C', side: 'L', z:  14 },
  { id: 'market',  name: 'Plaza Mart', tagline: 'trinkets, fits & curios',     icon: '🛍️', color: 0xF5C56B, accent: '#C77A2E', side: 'R', z:  14 },
  { id: 'arena',   name: 'Trivia Arena', tagline: 'compete · reason · rank up', icon: '🧠', color: 0x6EE7FF, accent: '#00C2FF', side: 'C', z:  32 },
];

function makeLabelTexture(name, icon, accent) {
  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // soft cream plate
  ctx.fillStyle = '#FFF7EE';
  roundRect(ctx, 8, 8, W - 16, H - 16, 36);
  ctx.fill();

  // border
  ctx.lineWidth = 8;
  ctx.strokeStyle = accent;
  roundRect(ctx, 8, 8, W - 16, H - 16, 36);
  ctx.stroke();

  // icon
  ctx.font = '108px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, W * 0.22, H * 0.5);

  // name
  ctx.fillStyle = '#3D2418';
  ctx.font = 'bold 64px "Fraunces", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, W * 0.40, H * 0.5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeBannerTexture(text, accent) {
  const W = 512, H = 96;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = accent;
  roundRect(ctx, 0, 0, W, H, 16);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 56px "Fredoka","Fraunces", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2 + 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function buildShop(shop) {
  if (shop.side === 'C') return buildArenaPortal(shop);
  const facing = shop.side === 'L' ? 1 : -1; // +x faces right (towards street)
  const baseX = shop.side === 'L' ? -11 : 11;
  const group = new THREE.Group();
  group.position.set(baseX, 0, shop.z);
  group.rotation.y = facing > 0 ? Math.PI / 2 : -Math.PI / 2;
  // After rotation: building front (originally +z local) points toward street center.

  // body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 3.6, 4.4),
    new THREE.MeshStandardMaterial({ color: shop.color, roughness: 0.78 })
  );
  body.position.y = 1.8;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.45, 4.8),
    new THREE.MeshStandardMaterial({ color: 0x3D2418, roughness: 0.7 })
  );
  roof.position.y = 3.78;
  roof.castShadow = true;
  group.add(roof);

  // chimney/cap
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.45, 1.0),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.8 })
  );
  cap.position.set(1.4, 4.22, -0.6);
  cap.castShadow = true;
  group.add(cap);

  // awning (striped) along the FRONT face (local +z)
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })
  );
  awning.position.set(0, 2.95, 2.8);
  awning.rotation.x = -0.15;
  awning.castShadow = true;
  group.add(awning);

  // awning stripe (accent)
  const stripeMat = new THREE.MeshStandardMaterial({ color: shop.color, roughness: 0.55 });
  for (let i = -2; i <= 2; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.21, 1.21), stripeMat);
    s.position.set(i * 1.0, 2.95, 2.8);
    s.rotation.x = -0.15;
    group.add(s);
  }

  // sign plate (label)
  const labelTex = makeLabelTexture(shop.name, shop.icon, shop.accent);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 1.8),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })
  );
  sign.position.set(0, 4.0, 2.25);
  sign.rotation.x = -0.05;
  group.add(sign);

  // doorway frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 2.7, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 })
  );
  frame.position.set(0, 1.35, 2.21);
  group.add(frame);

  // glowing portal door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 2.3),
    new THREE.MeshStandardMaterial({
      color: shop.color,
      emissive: shop.color,
      emissiveIntensity: 0.55,
      roughness: 0.4,
    })
  );
  door.position.set(0, 1.25, 2.31);
  group.add(door);

  // door arch glow halo
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.25, 32),
    new THREE.MeshBasicMaterial({ color: shop.color, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  halo.position.set(0, 1.4, 2.36);
  group.add(halo);

  // side windows
  const winMat = new THREE.MeshStandardMaterial({
    color: 0xBCE3F2, emissive: 0xCDE6F5, emissiveIntensity: 0.3, roughness: 0.4,
  });
  for (const wx of [-1.85, 1.85]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), winMat);
    win.position.set(wx, 2.0, 2.21);
    group.add(win);
    const cross = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.08, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    cross.position.set(wx, 2.0, 2.22);
    group.add(cross);
    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.92, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    crossV.position.set(wx, 2.0, 2.22);
    group.add(crossV);
  }

  // planter at door
  const planter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.45, 12),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7 })
  );
  planter.position.set(-1.4, 0.225, 2.6);
  planter.castShadow = true;
  group.add(planter);
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0x8DECC2, roughness: 0.55 })
  );
  leaves.position.set(-1.4, 0.78, 2.6);
  leaves.castShadow = true;
  group.add(leaves);

  // mailbox/sign post on the other side
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })
  );
  post.position.set(1.4, 0.55, 2.6);
  group.add(post);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.32),
    new THREE.MeshBasicMaterial({ map: makeBannerTexture('open', shop.accent), side: THREE.DoubleSide })
  );
  flag.position.set(1.78, 1.0, 2.6);
  group.add(flag);

  // compute world-space entrance point (in front of the door)
  const localEntry = new THREE.Vector3(0, 0, 4.0);
  const entrance = localEntry.clone().applyEuler(group.rotation).add(group.position);

  group.userData = {
    shop,
    entrance,
    door,
    halo,
    sign,
  };
  return group;
}

// Holographic-style sign texture for the prestige arena portal.
function makeArenaSignTexture(name, tagline) {
  const W = 768, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  // Dark holographic backplate with cyan border
  ctx.fillStyle = 'rgba(10, 18, 38, 0.92)';
  roundRect(ctx, 8, 8, W - 16, H - 16, 24);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#6EE7FF';
  roundRect(ctx, 8, 8, W - 16, H - 16, 24);
  ctx.stroke();
  // Faint scanlines
  ctx.fillStyle = 'rgba(110, 231, 255, 0.06)';
  for (let y = 14; y < H - 14; y += 6) ctx.fillRect(14, y, W - 28, 2);
  // Icon
  ctx.font = '88px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧠', 100, H * 0.5);
  // Name (neon)
  ctx.shadowColor = '#00C2FF';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#E6F8FF';
  ctx.font = 'bold 56px "Fraunces", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 180, H * 0.4);
  ctx.shadowBlur = 0;
  // Tagline
  ctx.fillStyle = '#6EE7FF';
  ctx.font = 'bold 22px "Fredoka", sans-serif';
  ctx.fillText(tagline.toUpperCase(), 180, H * 0.68);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// A prestige landmark portal at the north end of Wee Street — neon, cyberpunk,
// visually distinct from the cozy shops. Same userData contract as buildShop().
function buildArenaPortal(shop) {
  const group = new THREE.Group();
  group.position.set(0, 0, shop.z);
  // Front faces south (toward player approaching from -z) — no rotation needed.

  const DARK = 0x1A1530;
  const NEON = shop.color; // 0x6EE7FF

  // Approach pad — a wide hex base flush with the street.
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 6.0, 0.18, 6),
    new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.5, metalness: 0.4 })
  );
  pad.position.y = 0.09;
  pad.receiveShadow = true;
  group.add(pad);

  // Neon edge ring on the pad
  const padRing = new THREE.Mesh(
    new THREE.RingGeometry(5.55, 5.85, 64),
    new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.y = 0.19;
  group.add(padRing);

  // Tall side pylons framing the gate
  for (const xOff of [-3.6, 3.6]) {
    const pylon = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 8.0, 0.8),
      new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.45, metalness: 0.55 })
    );
    pylon.position.set(xOff, 4.0, 0);
    pylon.castShadow = true;
    group.add(pylon);
    // neon vertical strip
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 7.4, 0.05),
      new THREE.MeshStandardMaterial({ color: NEON, emissive: NEON, emissiveIntensity: 1.1 })
    );
    strip.position.set(xOff + (xOff < 0 ? 0.42 : -0.42), 4.0, 0.42);
    group.add(strip);
  }

  // Top crossbeam / arch lintel
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 0.9, 0.9),
    new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.4, metalness: 0.6 })
  );
  lintel.position.set(0, 7.4, 0);
  lintel.castShadow = true;
  group.add(lintel);

  // Neon underside strip of lintel
  const lintelGlow = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 0.08, 0.5),
    new THREE.MeshStandardMaterial({ color: NEON, emissive: NEON, emissiveIntensity: 1.3 })
  );
  lintelGlow.position.set(0, 6.92, 0.18);
  group.add(lintelGlow);

  // Holographic sign (above the lintel)
  const signTex = makeArenaSignTexture(shop.name, 'est. intelligence');
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 2.4),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  );
  sign.position.set(0, 9.0, 0);
  group.add(sign);

  // The portal door — a tall glowing rectangle of energy framed by the pylons
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(6.0, 6.8),
    new THREE.MeshStandardMaterial({
      color: NEON, emissive: NEON, emissiveIntensity: 0.8,
      transparent: true, opacity: 0.55, roughness: 0.2, side: THREE.DoubleSide,
    })
  );
  door.position.set(0, 3.6, 0.05);
  group.add(door);

  // Inner halo ring framing the doorway
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(3.4, 3.9, 64),
    new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  halo.position.set(0, 3.6, 0.12);
  group.add(halo);

  // Glow plinths flanking the approach
  for (const xOff of [-2.4, 2.4]) {
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: NEON, emissive: NEON, emissiveIntensity: 0.9 })
    );
    plinth.position.set(xOff, 0.4, 4.2);
    group.add(plinth);
  }

  // Compute world-space entrance point (in front of the door)
  const entrance = new THREE.Vector3(0, 0, shop.z + 5.0);

  group.userData = { shop, entrance, door, halo, sign };
  return group;
}

function buildLantern(x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 2.2, 10),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.55 })
  );
  pole.position.y = 1.1;
  pole.castShadow = true;
  g.add(pole);
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.55 })
  );
  arm.position.set(0, 2.05, 0.25);
  g.add(arm);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xFFE7C2, emissive: 0xFFD9A8, emissiveIntensity: 0.9 })
  );
  bulb.position.set(0, 2.0, 0.45);
  g.add(bulb);
  return { group: g, bulb };
}

function buildBench(x, z, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xB58860, roughness: 0.7 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.55 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.5), seatMat);
  seat.position.y = 0.5;
  seat.castShadow = true;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.08), seatMat);
  back.position.set(0, 0.78, -0.21);
  back.castShadow = true;
  g.add(back);
  for (const lx of [-0.8, 0.8]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), legMat);
    leg.position.set(lx, 0.24, 0);
    g.add(leg);
  }
  return g;
}

function buildCloud(x, y, z, s = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.95 });
  const blobs = [
    [0, 0, 0, 1.0],
    [0.8, 0.15, 0, 0.85],
    [-0.8, 0.1, 0.1, 0.8],
    [0.3, 0.5, -0.05, 0.7],
    [-0.4, 0.35, 0.0, 0.75],
  ];
  for (const [bx, by, bz, br] of blobs) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(br * s, 14, 10), mat);
    m.position.set(bx * s, by * s, bz * s);
    g.add(m);
  }
  return g;
}

function makeSkyTexture() {
  const W = 4, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0.00, '#BCE3F2');
  grad.addColorStop(0.55, '#FFE9D9');
  grad.addColorStop(1.00, '#FFCDD9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function World({ config, onBack, onEnter }: any) {
  const mountRef = useRef(null);
  const stateRef = useRef<any>({});
  const nearbyShopRef = useRef<any>(null);
  const onEnterRef = useRef(onEnter);
  useEffect(() => { onEnterRef.current = onEnter; }, [onEnter]);
  const tryEnter = (shop: any) => {
    if (!shop) return;
    if (onEnterRef.current && onEnterRef.current(shop)) return; // parent handled (e.g. phase transition)
    setEnteredShop(shop);
  };
  const [nearbyShop, setNearbyShop] = useState(null);
  const [enteredShop, setEnteredShop] = useState(null);
  const [hint, setHint] = useState(true);
  // Per-NPC proximity speech bubbles. Updated each frame from the animate loop.
  const [bubbles, setBubbles] = useState([]);
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  const [profileToast, setProfileToast] = useState<any>(null);
  const friendsApi = useFriends();
  const profileToastTimerRef = useRef<number | null>(null);
  const showProfileToast = (next: any) => {
    setProfileToast(next);
    if (profileToastTimerRef.current) window.clearTimeout(profileToastTimerRef.current);
    profileToastTimerRef.current = window.setTimeout(() => setProfileToast(null), 3500);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth, height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = makeSkyTexture();
    scene.fog = new THREE.Fog(0xFFE3CF, 24, 60);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // ── LIGHTING — soft pastel day ──
    const hemi = new THREE.HemisphereLight(0xFFF1E8, 0xCDE6F5, 0.95);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xFFF4DD, 1.05);
    sun.position.set(12, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xCDE6F5, 0.35);
    rim.position.set(-8, 6, -10);
    scene.add(rim);

    // ── GROUND ── grass field
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(80, 64),
      new THREE.MeshStandardMaterial({ color: 0xC4ECC8, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── STREET ── long cream road
    const street = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 90),
      new THREE.MeshStandardMaterial({ color: 0xFFE9D9, roughness: 0.85 })
    );
    street.rotation.x = -Math.PI / 2;
    street.position.y = 0.01;
    street.position.z = 5;
    street.receiveShadow = true;
    scene.add(street);

    // sidewalks (raised slightly)
    for (const sx of [-6.5, 6.5]) {
      const sw = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.1, 90),
        new THREE.MeshStandardMaterial({ color: 0xFFD9CA, roughness: 0.85 })
      );
      sw.position.set(sx, 0.05, 5);
      sw.receiveShadow = true;
      scene.add(sw);
    }

    // street stripes (decorative cobble-tile lines)
    for (let i = -32; i <= 44; i += 4) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(7.6, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xFFD9CA, roughness: 0.7, transparent: true, opacity: 0.75 })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, i);
      scene.add(stripe);
    }

    // ── DISTANT HILLS ── (low-poly silhouettes ringing the lobby)
    const hillMat1 = new THREE.MeshStandardMaterial({ color: 0xA8E6CF, roughness: 0.95 });
    const hillMat2 = new THREE.MeshStandardMaterial({ color: 0x8DECC2, roughness: 0.95 });
    const hillPositions = [
      [-40,  35, hillMat1, 8, 5],
      [ 38,  32, hillMat2, 9, 6],
      [-44, -36, hillMat2, 10, 6],
      [ 46, -30, hillMat1, 8, 5],
      [-55,   0, hillMat1, 12, 7],
      [ 58,   2, hillMat2, 11, 6.5],
    ];
    for (const [hx, hz, mat, r, h] of hillPositions) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mat);
      hill.position.set(hx, h / 2 - 0.3, hz);
      scene.add(hill);
    }

    // ── TREES ── flanking the street
    const treeColors = [0x8DECC2, 0xA8E6CF, 0x9BD9B0];
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0xB58860, roughness: 0.8 });
    const treePositions = [
      [-15, -28], [ 15, -28], [-18, -10], [ 18, -10],
      [-18,  10], [ 18,  10], [-15,  28], [ 15,  28],
      [-22,   0], [ 22,   0], [-25, -18], [ 25,  18],
    ];
    for (const [x, z] of treePositions) {
      const sc = 0.9 + Math.random() * 0.5;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 * sc, 0.22 * sc, 1.0 * sc, 8),
        trunkMat
      );
      trunk.position.set(x, 0.5 * sc, z);
      trunk.castShadow = true;
      scene.add(trunk);
      const leafMat = new THREE.MeshStandardMaterial({
        color: treeColors[Math.floor(Math.random() * treeColors.length)],
        roughness: 0.6,
      });
      const top1 = new THREE.Mesh(new THREE.ConeGeometry(1.0 * sc, 1.8 * sc, 7), leafMat);
      top1.position.set(x, 1.8 * sc, z);
      top1.castShadow = true;
      scene.add(top1);
      const top2 = new THREE.Mesh(new THREE.ConeGeometry(0.7 * sc, 1.3 * sc, 7), leafMat);
      top2.position.set(x, 2.6 * sc, z);
      top2.castShadow = true;
      scene.add(top2);
    }

    // ── SHOPS (portals) ──
    const shops = SHOPS.map((s) => {
      const g = buildShop(s);
      g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
      scene.add(g);
      return g;
    });

    // ── LANTERNS along sidewalks ──
    const lanternBulbs = [];
    for (let z = -28; z <= 36; z += 8) {
      for (const lx of [-7.6, 7.6]) {
        const { group, bulb } = buildLantern(lx, z);
        scene.add(group);
        lanternBulbs.push(bulb);
        const pl = new THREE.PointLight(0xFFD9A8, 0.5, 7);
        pl.position.set(lx, 2.0, z);
        scene.add(pl);
      }
    }

    // ── BENCHES & DECOR ──
    scene.add(buildBench(-7.4, -16, Math.PI / 2));
    scene.add(buildBench( 7.4,  -8, -Math.PI / 2));
    scene.add(buildBench(-7.4,  20, Math.PI / 2));
    scene.add(buildBench( 7.4,  24, -Math.PI / 2));

    // ── CENTRAL FOUNTAIN ──
    const fountain = new THREE.Group();
    fountain.position.set(0, 0, 4);
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.7, 0.4, 24),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 })
    );
    basin.position.y = 0.2;
    basin.castShadow = true;
    fountain.add(basin);
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.35, 0.05, 24),
      new THREE.MeshStandardMaterial({
        color: 0xBCE3F2, emissive: 0xCDE6F5, emissiveIntensity: 0.25,
        roughness: 0.2, metalness: 0.1,
      })
    );
    water.position.y = 0.42;
    fountain.add(water);
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 })
    );
    spout.position.y = 0.85;
    spout.castShadow = true;
    fountain.add(spout);
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xBCE3F2, emissive: 0xCDE6F5, emissiveIntensity: 0.35 })
    );
    top.position.y = 1.3;
    fountain.add(top);
    scene.add(fountain);

    // ── WELCOME ARCH (at the south end) ──
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -33);
    const archMat = new THREE.MeshStandardMaterial({ color: 0xFFC9B5, roughness: 0.7 });
    const archL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.0, 0.6), archMat);
    archL.position.set(-3.5, 2.5, 0);
    archL.castShadow = true;
    archGroup.add(archL);
    const archR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.0, 0.6), archMat);
    archR.position.set(3.5, 2.5, 0);
    archR.castShadow = true;
    archGroup.add(archR);
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.6, 0.8), archMat);
    archTop.position.set(0, 5.2, 0);
    archTop.castShadow = true;
    archGroup.add(archTop);
    const archBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 1.0),
      new THREE.MeshBasicMaterial({ map: makeBannerTexture('Wee Street', '#FF8B7A'), side: THREE.DoubleSide })
    );
    archBanner.position.set(0, 4.0, 0.4);
    archGroup.add(archBanner);
    scene.add(archGroup);

    // ── CLOUDS ──
    const clouds = [];
    for (let i = 0; i < 8; i++) {
      const c = buildCloud(
        (Math.random() - 0.5) * 80,
        14 + Math.random() * 6,
        (Math.random() - 0.5) * 80,
        1.2 + Math.random() * 0.6
      );
      clouds.push(c);
      scene.add(c);
    }

    // ── PLAYER ──
    const player = buildAvatar(config);
    player.position.set(0, 0, -28);
    player.rotation.y = Math.PI; // face north (into the street)
    player.traverse(o => { if (o.isMesh) o.castShadow = true; });
    scene.add(player);

    // ── NPCs ── walking the plaza
    const npcs = [];
    const npcCount = 6;
    for (let i = 0; i < npcCount; i++) {
      const cfg = randomNpcConfig(NPC_NAMES[i % NPC_NAMES.length]);
      const npc = buildAvatar(cfg);
      npc.position.set(
        (Math.random() - 0.5) * 6,
        0,
        -24 + i * 9 + (Math.random() - 0.5) * 4,
      );
      npc.rotation.y = Math.random() * Math.PI * 2;
      npc.traverse(o => { if (o.isMesh) o.castShadow = true; });
      scene.add(npc);
      npcs.push({
        id: `npc-${i}`,
        group: npc,
        config: cfg,
        stats: buildNpcStats(cfg.name),
        target: pickStreetTarget(),
        speed: 0.7 + Math.random() * 0.5,
        wait: Math.random() * 2,
        greeting: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
      });
    }

    function pickStreetTarget() {
      return new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        0,
        -28 + Math.random() * 56,
      );
    }

    function randomNpcConfig(name) {
      // pick a Mii-style expression preset so each NPC has a distinct vibe
      const expr = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
      return {
        skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
        hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
        hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
        faceShape: 'round',
        eyeStyle: expr.eyeStyle,
        eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
        eyebrowAngle: expr.eyebrowAngle,
        mouthStyle: expr.mouthStyle,
        outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
        name,
      };
    }

    const teleportToShop = (shopId: string) => {
      const sg = shops.find((g: any) => g.userData?.shop?.id === shopId);
      if (!sg) return;
      const ent = sg.userData.entrance;
      // place player AT the entrance point (already 4u in front of the door)
      player.position.set(ent.x, 0, ent.z);
      // face the building (look from entrance back toward the shop body)
      const dx = sg.position.x - ent.x;
      const dz = sg.position.z - ent.z;
      player.rotation.y = Math.atan2(dx, dz);
      // snap camera close so it doesn't slingshot
      camera.position.set(ent.x, 4.2, ent.z - 6.5);
      camera.lookAt(ent.x, 1.1, ent.z + 2);
      setHint(false);
    };
    stateRef.current = { scene, camera, renderer, player, npcs, lanternBulbs, shops, teleportToShop };

    // click on an NPC → open profile (don't trigger on shop chips — those use their own onClick)
    const onCanvasClick = (e: MouseEvent) => {
      const idx = pickNpcAtPointer(e, renderer.domElement, camera, npcs);
      if (idx >= 0) setSelectedNpc(npcs[idx].stats);
    };
    renderer.domElement.addEventListener('click', onCanvasClick);

    // ── INPUT ──
    const keys = {};
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (hint) setHint(false);
      if (k === 'e' || k === 'enter') {
        if (nearbyShopRef.current) {
          tryEnter(nearbyShopRef.current);
        }
      }
    };
    const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // touch
    let touchStart = null;
    let touchMove = null;
    const onTouchStart = (e) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
      touchMove = { x: t.clientX, y: t.clientY };
      if (hint) setHint(false);
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      touchMove = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = () => { touchStart = null; touchMove = null; };
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // ── ANIMATION LOOP ──
    const yaw = 0;
    let walkCycle = 0;
    let frameId;
    let lastT = performance.now();
    let lastNearbyId = null;
    // proximity-bubble scratch state
    let lastBubbleT = 0;
    const bubblePos = new THREE.Vector3();
    const headR_player = 0.65; // matches buildAvatar's Mii-mode head radius

    const animate = (now) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // input
      let fwd = 0, strafe = 0;
      if (keys['w'] || keys['arrowup']) fwd += 1;
      if (keys['s'] || keys['arrowdown']) fwd -= 1;
      if (keys['a'] || keys['arrowleft']) strafe += 1;
      if (keys['d'] || keys['arrowright']) strafe -= 1;

      if (touchStart && touchMove) {
        const dx = touchMove.x - touchStart.x;
        const dy = touchMove.y - touchStart.y;
        fwd += clamp(-dy / 60, -1, 1);
        strafe += clamp(-dx / 60, -1, 1);
      }

      const mag = Math.hypot(fwd, strafe);
      const moving = mag > 0.05;
      if (moving) {
        const speed = 4.0;
        const dirAngle = Math.atan2(strafe, fwd) + yaw;
        const vx = Math.sin(dirAngle) * speed * dt;
        const vz = Math.cos(dirAngle) * speed * dt;
        player.position.x += vx;
        player.position.z += vz;
        // clamp to walkable street bounds (between sidewalks-ish)
        player.position.x = clamp(player.position.x, -5.4, 5.4);
        player.position.z = clamp(player.position.z, -31, 38);
        const targetRot = Math.atan2(vx, vz);
        let dr = targetRot - player.rotation.y;
        while (dr > Math.PI) dr -= Math.PI * 2;
        while (dr < -Math.PI) dr += Math.PI * 2;
        player.rotation.y += dr * Math.min(1, dt * 12);

        walkCycle += dt * 8;
        animateWalk(player, walkCycle);
      } else {
        walkCycle += dt * 1.5;
        animateIdle(player, walkCycle);
      }

      // camera follow — slightly tilted, behind & above
      const camDist = 6.5;
      const camHeight = 4.2;
      const camTargetX = player.position.x;
      const camTargetZ = player.position.z - camDist;
      const camTargetY = camHeight;
      camera.position.x += (camTargetX - camera.position.x) * 0.1;
      camera.position.z += (camTargetZ - camera.position.z) * 0.1;
      camera.position.y += (camTargetY - camera.position.y) * 0.1;
      camera.lookAt(player.position.x, player.position.y + 1.1, player.position.z + 2);

      // NPC wandering
      for (const n of npcs) {
        if (n.wait > 0) {
          n.wait -= dt;
          animateIdle(n.group, now * 0.001);
        } else {
          const dx = n.target.x - n.group.position.x;
          const dz = n.target.z - n.group.position.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.3) {
            n.target = pickStreetTarget();
            n.wait = 1 + Math.random() * 3;
          } else {
            const speed = n.speed;
            n.group.position.x += (dx / d) * speed * dt;
            n.group.position.z += (dz / d) * speed * dt;
            const tr = Math.atan2(dx, dz);
            let dr = tr - n.group.rotation.y;
            while (dr > Math.PI) dr -= Math.PI * 2;
            while (dr < -Math.PI) dr += Math.PI * 2;
            n.group.rotation.y += dr * Math.min(1, dt * 8);
            animateWalk(n.group, now * 0.008);
          }
        }
      }

      // Proximity speech bubbles — Fortnite-style range-gated visibility,
      // talking pulse when player is very close. Throttled to ~15Hz so React
      // doesn't churn every frame.
      if (now - lastBubbleT > 65) {
        lastBubbleT = now;
        const newBubbles = [];
        const SHOW_RANGE = 7;
        const TALK_RANGE = 2.4;
        for (const n of npcs) {
          const ndx = n.group.position.x - player.position.x;
          const ndz = n.group.position.z - player.position.z;
          const pd = Math.hypot(ndx, ndz);
          if (pd > SHOW_RANGE) continue;
          // project NPC head position into NDC
          const head = bubblePos.set(
            n.group.position.x,
            n.group.position.y + (headR_player + 1.0),
            n.group.position.z,
          );
          head.project(camera);
          if (head.z >= 1) continue; // behind camera
          if (head.x < -1.15 || head.x > 1.15 || head.y < -1.15 || head.y > 1.15) continue;
          newBubbles.push({
            id: n.id,
            name: n.config.name,
            line: n.greeting,
            x: (head.x * 0.5 + 0.5) * width,
            y: (-head.y * 0.5 + 0.5) * height,
            talking: pd < TALK_RANGE,
            opacity: pd < TALK_RANGE ? 1 : Math.max(0.5, 1 - (pd - TALK_RANGE) / (SHOW_RANGE - TALK_RANGE)),
          });
        }
        setBubbles(newBubbles);
      }

      // shop proximity
      let nearest = null;
      let nearestDist = Infinity;
      for (const sg of shops) {
        const ent = sg.userData.entrance;
        const d = Math.hypot(ent.x - player.position.x, ent.z - player.position.z);
        if (d < nearestDist) { nearestDist = d; nearest = sg.userData.shop; }
      }
      const inRange = nearestDist < 2.6 ? nearest : null;
      const newId = inRange ? inRange.id : null;
      if (newId !== lastNearbyId) {
        lastNearbyId = newId;
        nearbyShopRef.current = inRange;
        setNearbyShop(inRange);
      }

      // lantern flicker + portal pulses
      const t = now * 0.001;
      for (let i = 0; i < lanternBulbs.length; i++) {
        const b = lanternBulbs[i];
        b.material.emissiveIntensity =
          0.7 + Math.sin(t * 2 + i) * 0.15 + Math.sin(t * 7 + i * 2.3) * 0.05;
      }
      for (const sg of shops) {
        const door = sg.userData.door;
        const halo = sg.userData.halo;
        const pulse = 0.45 + Math.sin(t * 1.6 + sg.position.z * 0.2) * 0.18;
        door.material.emissiveIntensity = pulse;
        halo.material.opacity = 0.35 + Math.sin(t * 1.6 + sg.position.z * 0.2) * 0.18;
        halo.scale.setScalar(1 + Math.sin(t * 1.6 + sg.position.z * 0.2) * 0.05);
      }

      // gentle cloud drift
      for (let i = 0; i < clouds.length; i++) {
        clouds[i].position.x += dt * (0.2 + (i % 3) * 0.08);
        if (clouds[i].position.x > 50) clouds[i].position.x = -50;
      }

      // fountain water bob
      water.position.y = 0.42 + Math.sin(t * 1.4) * 0.01;
      top.position.y = 1.3 + Math.sin(t * 1.4) * 0.03;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      if (profileToastTimerRef.current) window.clearTimeout(profileToastTimerRef.current);
      disposeGroup(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="bloom-root font-body relative w-full h-full overflow-hidden wee-bg-pastel">
      <div ref={mountRef} className="absolute inset-0" />

      {/* proximity speech bubbles — projected from world to screen */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {bubbles.map(b => (
          <div key={b.id} className="absolute" style={{
            left: `${b.x}px`,
            top: `${b.y}px`,
            transform: 'translate(-50%, -100%)',
            opacity: b.opacity,
            transition: 'opacity 180ms ease-out, left 120ms linear, top 120ms linear',
          }}>
            <div className={`speech-bubble ${b.talking ? 'talking' : ''}`}>
              <div className="font-cute text-[10px] font-bold uppercase mb-0.5" style={{
                color: b.talking ? '#C77A2E' : '#C2553D', letterSpacing: '0.12em',
              }}>
                {b.talking && <span className="inline-block mr-1" style={{ fontSize: 11 }}>🎤</span>}
                {b.name}
              </div>
              <div className="font-cute text-sm font-semibold">{b.line}</div>
            </div>
          </div>
        ))}
      </div>

      {/* top HUD */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-3 transition-all hover:scale-105 text-warm" style={{
          background: '#FFFFFF', border: '3px solid #FFFFFF', borderRadius: '9999px',
          boxShadow: '0 5px 0 rgba(255,179,158,0.45), 0 10px 22px -6px rgba(255,139,122,0.3)',
        }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="pill-cute font-cute text-xs font-bold flex items-center gap-2 px-4 py-2.5" style={{ letterSpacing: '0.12em' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#8DECC2', animation: 'pulse-glow 2s ease-in-out infinite' }} />
          <span>WEE STREET</span>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <div className="pill-cute font-cute text-base font-bold flex items-center gap-2 px-5 py-2.5">
          <Sparkles className="w-4 h-4" />
          <span>{config.name}</span>
        </div>
      </div>

      {/* directory chips along the right edge */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-10 flex flex-col gap-2" style={{
        animation: 'fade-up 0.6s ease-out 0.2s both',
      }}>
        <div className="pill-soft font-cute text-[10px] font-bold px-3 py-1.5 text-center"
             style={{ letterSpacing: '0.18em' }}>
          DIRECTORY
        </div>
        {SHOPS.map((s) => {
          const isNear = nearbyShop?.id === s.id;
          return (
            <button key={s.id}
                    onClick={() => stateRef.current?.teleportToShop?.(s.id)}
                    className="font-cute text-xs font-bold flex items-center gap-2 px-3 py-2 transition-all hover:scale-105 hover:-translate-x-1 cursor-pointer"
                    title={`teleport to ${s.name}`}
                    style={{
                      background: isNear ? s.accent : '#FFFFFF',
                      color: isNear ? '#FFF7EE' : '#8A5A3A',
                      border: '2px solid #FFE3D1',
                      borderRadius: '9999px',
                      boxShadow: '0 3px 0 rgba(255,179,158,0.32)',
                    }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* control hint */}
      {hint && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 card-cute px-5 py-4 z-10 text-center" style={{
          animation: 'fade-up 0.8s ease-out 0.3s both', maxWidth: '90vw',
        }}>
          <div className="font-cute text-xs font-bold uppercase mb-2" style={{ color: '#C2553D', letterSpacing: '0.18em' }}>
            controls
          </div>
          <div className="font-cute text-sm font-semibold text-warm">
            <span className="px-2 py-0.5 rounded-md" style={{ background: '#FFE9D9', border: '1.5px solid #FFC9B5' }}>WASD</span>
            <span className="mx-1.5 text-warm-faded">to walk</span>
            <span className="mx-2 text-warm-faded">·</span>
            <span className="px-2 py-0.5 rounded-md" style={{ background: '#FFE9D9', border: '1.5px solid #FFC9B5' }}>E</span>
            <span className="mx-1.5 text-warm-faded">to enter</span>
          </div>
        </div>
      )}

      {/* "press E to enter" prompt */}
      {nearbyShop && !enteredShop && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
             style={{ animation: 'fade-up 0.3s ease-out' }}>
          <button
            onClick={() => tryEnter(nearbyShop)}
            className="font-cute text-base font-bold flex items-center gap-3 px-6 py-3 transition-all hover:scale-105"
            style={{
              background: '#FFFFFF',
              border: '3px solid #FFFFFF',
              borderRadius: '9999px',
              boxShadow: `0 5px 0 ${nearbyShop.accent}, 0 12px 26px -6px rgba(255,139,122,0.35)`,
              color: nearbyShop.accent,
            }}
          >
            <span style={{ fontSize: 22 }}>{nearbyShop.icon}</span>
            <span>enter the {nearbyShop.name}</span>
            <span className="font-cute text-[10px] font-bold px-2 py-1"
                  style={{ background: '#FFF7EE', border: `2px solid ${nearbyShop.accent}`, borderRadius: 8, letterSpacing: '0.14em' }}>
              E
            </span>
          </button>
        </div>
      )}

      {/* bottom plate */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pill-soft font-cute text-xs font-bold px-4 py-2"
           style={{ letterSpacing: '0.16em' }}>
        ♡ WEE STREET · {stateRef.current?.npcs?.length || 6} OTHERS NEARBY ♡
      </div>

      {/* coming-soon modal */}
      {enteredShop && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6"
             style={{ background: 'rgba(60, 36, 24, 0.45)', animation: 'fade-in 0.25s ease-out' }}>
          <div className="card-cute-strong p-8 max-w-md w-full text-center relative"
               style={{ animation: 'pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
            <button onClick={() => setEnteredShop(null)}
                    className="absolute top-4 right-4 p-2 transition-all hover:scale-110"
                    style={{
                      background: '#FFF7EE', border: '2px solid #FFE3D1',
                      borderRadius: '9999px', color: '#8A5A3A',
                    }}>
              <X className="w-4 h-4" />
            </button>
            <div className="text-7xl mb-3" style={{ animation: 'float-up 2.4s ease-in-out infinite' }}>
              {enteredShop.icon}
            </div>
            <div className="font-cute text-[10px] font-bold uppercase mb-2"
                 style={{ color: enteredShop.accent, letterSpacing: '0.22em' }}>
              ♡ door is humming ♡
            </div>
            <h2 className="font-display text-3xl font-bold text-warm mb-2">
              {enteredShop.name}
            </h2>
            <p className="font-cute text-sm text-warm-soft mb-6">
              {enteredShop.tagline}
            </p>
            <div className="font-cute text-xs font-bold uppercase mb-5 px-4 py-2 inline-block"
                 style={{
                   background: '#FFF7EE',
                   border: `2px dashed ${enteredShop.accent}`,
                   borderRadius: '9999px',
                   color: enteredShop.accent,
                   letterSpacing: '0.22em',
                 }}>
              coming soon
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setEnteredShop(null)}
                      className="btn-cute font-cute text-sm font-bold px-6 py-3"
                      style={{ letterSpacing: '0.06em' }}>
                back to the street
              </button>
            </div>
          </div>
        </div>
      )}

      <NpcToast toast={profileToast} accent="#FF8B7A" />
      <NpcProfile
        npc={selectedNpc}
        isFriend={selectedNpc ? friendsApi.isFriend(selectedNpc.name) : false}
        accent="#FF8B7A"
        onClose={() => setSelectedNpc(null)}
        onChat={(npc: any) => {
          showProfileToast({ text: `${npc.name}: ${npcChatLineFor(npc.personality)}`, icon: '💬' });
          setSelectedNpc(null);
        }}
        onFriendToggle={(npc: any) => {
          if (friendsApi.isFriend(npc.name)) {
            friendsApi.removeFriend(npc.name);
            showProfileToast({ text: `${npc.name} removed from friends`, icon: '○' });
          } else {
            friendsApi.addFriend(npc.name);
            showProfileToast({ text: `you and ${npc.name} are friends now ♡`, icon: '✦' });
          }
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// COMMUNITY PLAZA — Social world (entered via the Community portal)
// Cozy multiplayer-style social hub with chat bubbles, emotes,
// proximity-based conversations, and ambient music.
// ────────────────────────────────────────────────────────────────

const COMMUNITY_NAMES = ['Mochi', 'Bun', 'Plum', 'Tofu', 'Sora', 'Nori', 'Yuzu', 'Kumo', 'Hana', 'Mika'];

const PERSONALITIES = ['cheerful', 'shy', 'sleepy', 'curious', 'cozy'] as const;
type Personality = (typeof PERSONALITIES)[number];

const CHAT_LINES: Record<Personality, string[]> = {
  cheerful: [
    'hi there! ♡',
    'oh i love your hair',
    'wanna dance with me?',
    'today feels so soft',
    'yay! new friend!',
    'this place is the best',
  ],
  shy: [
    'um... hello',
    '*waves quietly*',
    'i like your eyes ♡',
    'i was just sitting...',
    '...thanks',
  ],
  sleepy: [
    'mmh... nap time?',
    'tired but cozy ♡',
    'sleepy sleepy',
    'wanna lounge?',
    '*yawn*',
  ],
  curious: [
    'where did you come from?',
    'what is this fountain?',
    'have you tried the arcade?',
    'i wonder...',
    'tell me your story?',
  ],
  cozy: [
    'tea? warm bread?',
    'sit with me ♡',
    'this rug is so soft',
    'i love this corner',
    'wanna chat?',
  ],
};

const EMOTES = [
  { id: 'wave',   icon: '👋', label: 'wave',   key: '1' },
  { id: 'dance',  icon: '💃', label: 'dance',  key: '2' },
  { id: 'laugh',  icon: '😂', label: 'laugh',  key: '3' },
  { id: 'cheer',  icon: '🙌', label: 'cheer',  key: '4' },
  { id: 'sit',    icon: '🪑', label: 'sit',    key: '5' },
  { id: 'sleep',  icon: '😴', label: 'sleep',  key: '6' },
  { id: 'clap',   icon: '👏', label: 'clap',   key: '7' },
];

function pickPersonality(): Personality {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
}

function pickChatLine(personality: Personality) {
  const pool = CHAT_LINES[personality] || CHAT_LINES.cheerful;
  return pool[Math.floor(Math.random() * pool.length)];
}

function animateEmote(group: any, t: number, emote: string) {
  const ud = group?.userData;
  if (!ud) return;
  // reset pose
  if (ud.lArm) ud.lArm.rotation.set(0, 0, 0);
  if (ud.rArm) ud.rArm.rotation.set(0, 0, 0);
  if (ud.lLeg) ud.lLeg.rotation.set(0, 0, 0);
  if (ud.rLeg) ud.rLeg.rotation.set(0, 0, 0);
  if (ud.head) ud.head.rotation.set(0, 0, 0);
  group.position.y = 0;
  group.rotation.z = 0;

  switch (emote) {
    case 'wave': {
      if (ud.rArm) {
        ud.rArm.rotation.z = -Math.PI / 1.8;
        ud.rArm.rotation.x = Math.sin(t * 6) * 0.35;
      }
      group.position.y = Math.sin(t * 1.2) * 0.025;
      break;
    }
    case 'dance': {
      if (ud.lArm) { ud.lArm.rotation.z = 0.6 + Math.sin(t * 4) * 0.4; ud.lArm.rotation.x = Math.sin(t * 4) * 0.3; }
      if (ud.rArm) { ud.rArm.rotation.z = -0.6 - Math.sin(t * 4) * 0.4; ud.rArm.rotation.x = -Math.sin(t * 4) * 0.3; }
      if (ud.lLeg) ud.lLeg.rotation.x = Math.sin(t * 4) * 0.25;
      if (ud.rLeg) ud.rLeg.rotation.x = -Math.sin(t * 4) * 0.25;
      group.position.y = Math.abs(Math.sin(t * 4)) * 0.12;
      group.rotation.z = Math.sin(t * 2) * 0.05;
      break;
    }
    case 'laugh': {
      group.position.y = Math.abs(Math.sin(t * 8)) * 0.06;
      if (ud.head) ud.head.rotation.x = Math.sin(t * 8) * 0.1;
      if (ud.lArm) ud.lArm.rotation.x = -0.4 + Math.sin(t * 8) * 0.15;
      if (ud.rArm) ud.rArm.rotation.x = -0.4 + Math.sin(t * 8) * 0.15;
      break;
    }
    case 'cheer': {
      if (ud.lArm) { ud.lArm.rotation.z = Math.PI / 1.4; ud.lArm.rotation.x = Math.sin(t * 4) * 0.1; }
      if (ud.rArm) { ud.rArm.rotation.z = -Math.PI / 1.4; ud.rArm.rotation.x = Math.sin(t * 4) * 0.1; }
      group.position.y = Math.abs(Math.sin(t * 4)) * 0.25;
      break;
    }
    case 'sit': {
      if (ud.lLeg) ud.lLeg.rotation.x = -Math.PI / 2.2;
      if (ud.rLeg) ud.rLeg.rotation.x = -Math.PI / 2.2;
      group.position.y = -0.45;
      break;
    }
    case 'sleep': {
      group.rotation.z = -0.3;
      group.position.y = -0.25;
      if (ud.head) ud.head.rotation.z = 0.2;
      if (ud.lArm) ud.lArm.rotation.x = 0.2;
      if (ud.rArm) ud.rArm.rotation.x = 0.2;
      break;
    }
    case 'clap': {
      const phase = Math.sin(t * 6);
      if (ud.lArm) { ud.lArm.rotation.x = -0.8; ud.lArm.rotation.z = 0.4 + phase * 0.3; }
      if (ud.rArm) { ud.rArm.rotation.x = -0.8; ud.rArm.rotation.z = -0.4 - phase * 0.3; }
      break;
    }
    default:
      animateIdle(group, t);
  }
}

function buildCommunityFountain() {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0xBCE3F2, emissive: 0xCDE6F5, emissiveIntensity: 0.3, roughness: 0.2,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.7, 0.5, 24), stoneMat);
  base.position.y = 0.25; base.castShadow = true; g.add(base);
  const baseWater = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 24), waterMat);
  baseWater.position.y = 0.5; g.add(baseWater);
  const mid = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.4, 24), stoneMat);
  mid.position.y = 0.75; mid.castShadow = true; g.add(mid);
  const midWater = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 24), waterMat);
  midWater.position.y = 0.97; g.add(midWater);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 1.3, 16), stoneMat);
  pillar.position.y = 1.55; g.add(pillar);
  const topBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.3, 18), stoneMat);
  topBowl.position.y = 2.3; g.add(topBowl);
  const topWater = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 18), waterMat);
  topWater.position.y = 2.47; g.add(topWater);
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xFFE7C2, emissive: 0xFFD9A8, emissiveIntensity: 0.9 })
  );
  orb.position.y = 2.7; g.add(orb);
  return { group: g, midWater, topWater, orb };
}

function buildCafeTable(x: number, z: number, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0xFFE9D9, roughness: 0.5 })
  );
  tableTop.position.y = 0.75; tableTop.castShadow = true; g.add(tableTop);
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.75, 8),
    new THREE.MeshStandardMaterial({ color: 0xB58860 })
  );
  leg.position.y = 0.37; g.add(leg);
  const legBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.4, 0.08, 12),
    new THREE.MeshStandardMaterial({ color: 0xB58860 })
  );
  legBase.position.y = 0.04; legBase.receiveShadow = true; g.add(legBase);
  // cup + plate
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.06, 0.13, 12),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })
  );
  cup.position.set(0.15, 0.85, 0); g.add(cup);
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.02, 14),
    new THREE.MeshStandardMaterial({ color: 0xFFC9B5, roughness: 0.6 })
  );
  plate.position.set(-0.18, 0.80, 0.05); g.add(plate);
  return g;
}

function buildChair(x: number, z: number, rotY: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xFFC9B5, roughness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xB58860 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), seatMat);
  seat.position.y = 0.45; seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.06), seatMat);
  back.position.set(0, 0.75, -0.22); g.add(back);
  for (const [lx, lz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]] as Array<[number, number]>) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), woodMat);
    leg.position.set(lx, 0.22, lz); g.add(leg);
  }
  return g;
}

function buildGazebo(x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xFFB39E, roughness: 0.7 });
  for (const [px, pz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]] as Array<[number, number]>) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), poleMat);
    pole.position.set(px, 1.4, pz); pole.castShadow = true; g.add(pole);
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 4), roofMat);
  roof.position.y = 3.2; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 6, 24), ringMat);
  ring.position.y = 2.6; ring.rotation.x = Math.PI / 2; g.add(ring);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xFFE7C2, emissive: 0xFFD9A8, emissiveIntensity: 0.9 })
  );
  bulb.position.y = 2.3; g.add(bulb);
  // bench inside
  const bench = buildBench(0, 0, 0);
  g.add(bench);
  return { group: g, bulb };
}

function buildMushroom(x: number, z: number, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 0.5 * scale, 10),
    new THREE.MeshStandardMaterial({ color: 0xFFF7EE, roughness: 0.6 })
  );
  stem.position.y = 0.25 * scale; stem.castShadow = true; g.add(stem);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.32 * scale, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xE76F51, roughness: 0.55 })
  );
  cap.position.y = 0.5 * scale; cap.castShadow = true; g.add(cap);
  return g;
}

function buildRug(x: number, z: number, w: number, h: number, color: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.02, z);
  m.receiveShadow = true;
  return m;
}

function buildCushion(x: number, z: number, color: number) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.2, 0.7),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  m.position.set(x, 0.12, z); m.castShadow = true;
  return m;
}

function buildStringLightArc(x1: number, z1: number, x2: number, z2: number, h = 4, count = 12) {
  const g = new THREE.Group();
  const lights: any[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const lx = x1 + (x2 - x1) * t;
    const lz = z1 + (z2 - z1) * t;
    const ly = h - Math.sin(t * Math.PI) * 0.5;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xFFE7C2, emissive: 0xFFD9A8, emissiveIntensity: 0.9 })
    );
    bulb.position.set(lx, ly, lz);
    g.add(bulb);
    lights.push(bulb);
  }
  return { group: g, lights };
}

function Community({ config, onBack }: any) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<any>({});
  const audioRef = useRef<any>(null);
  const bubblesRef = useRef<any[]>([]);
  const playerEmoteRef = useRef<string | null>(null);
  const [, setTick] = useState(0);
  const [emoteWheel, setEmoteWheel] = useState(false);
  const [playerEmote, setPlayerEmote] = useState<string | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [nearbyFriends, setNearbyFriends] = useState<string[]>([]);
  const [hint, setHint] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  const [profileToast, setProfileToast] = useState<any>(null);
  const friendsApi = useFriends();
  const profileToastTimerRef = useRef<number | null>(null);
  const showProfileToast = (next: any) => {
    setProfileToast(next);
    if (profileToastTimerRef.current) window.clearTimeout(profileToastTimerRef.current);
    profileToastTimerRef.current = window.setTimeout(() => setProfileToast(null), 3500);
  };

  useEffect(() => { playerEmoteRef.current = playerEmote; }, [playerEmote]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth, height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = makeSkyTexture();
    scene.fog = new THREE.Fog(0xFFE3CF, 20, 55);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // lighting
    const hemi = new THREE.HemisphereLight(0xFFF1E8, 0xFFD9CA, 1.0);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xFFEDD5, 0.9);
    sun.position.set(10, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xFFD9E1, 0.4);
    rim.position.set(-6, 5, -10);
    scene.add(rim);

    // ── PLAZA FLOOR ── octagonal
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(14, 8),
      new THREE.MeshStandardMaterial({ color: 0xFFE9D9, roughness: 0.85 })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.receiveShadow = true;
    scene.add(plaza);

    // surrounding grass
    const grass = new THREE.Mesh(
      new THREE.RingGeometry(14, 60, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0xC4ECC8, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.02;
    grass.receiveShadow = true;
    scene.add(grass);

    // inner pattern rings
    for (let i = 0; i < 3; i++) {
      const r = 3 + i * 3;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.18, 48),
        new THREE.MeshStandardMaterial({ color: 0xFFCDB5, roughness: 0.6, transparent: true, opacity: 0.6 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      scene.add(ring);
    }

    // pastel cobble accents (radial spokes)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.PlaneGeometry(11, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xFFD9CA, roughness: 0.7, transparent: true, opacity: 0.4 })
      );
      spoke.rotation.x = -Math.PI / 2;
      spoke.rotation.z = a;
      spoke.position.y = 0.015;
      scene.add(spoke);
    }

    // ── CENTRAL FOUNTAIN ──
    const fount = buildCommunityFountain();
    scene.add(fount.group);

    // ── CAFÉ AREA (north) ── 3 tables w/ chairs each
    const cafeAnchors: Array<[number, number]> = [
      [-4, -8], [0, -9.2], [4, -8],
    ];
    for (const [tx, tz] of cafeAnchors) {
      scene.add(buildCafeTable(tx, tz));
      scene.add(buildChair(tx - 1.0, tz, Math.PI / 2));
      scene.add(buildChair(tx + 1.0, tz, -Math.PI / 2));
    }
    // café back wall (cozy facade)
    const facade = new THREE.Mesh(
      new THREE.BoxGeometry(12, 2.6, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xFFD9C2, roughness: 0.7 })
    );
    facade.position.set(0, 1.3, -11);
    facade.castShadow = true; facade.receiveShadow = true;
    scene.add(facade);
    const facadeRoof = new THREE.Mesh(
      new THREE.BoxGeometry(12.6, 0.3, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xE89B6E, roughness: 0.7 })
    );
    facadeRoof.position.set(0, 2.75, -11);
    facadeRoof.castShadow = true;
    scene.add(facadeRoof);
    const facadeSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.8),
      new THREE.MeshBasicMaterial({ map: makeBannerTexture('Café & Tea', '#FF8B7A'), side: THREE.DoubleSide })
    );
    facadeSign.position.set(0, 2.0, -10.78);
    scene.add(facadeSign);

    // ── LOUNGE AREA (south) ── rug + cushions + low table
    scene.add(buildRug(0, 8, 4.8, 4.8, 0xE895B5));
    for (const [cx, cz, cc] of [
      [-1.3, 9.3, 0xFFB39E],
      [ 1.3, 9.3, 0xFFC9B5],
      [-1.3, 6.8, 0xC9B5FF],
      [ 1.3, 6.8, 0xA8E6CF],
      [ 0,   8.0, 0xF5C56B],
    ] as Array<[number, number, number]>) {
      scene.add(buildCushion(cx, cz, cc));
    }
    const lowTable = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.18, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xB58860, roughness: 0.7 })
    );
    lowTable.position.set(0, 0.32, 8); lowTable.castShadow = true;
    scene.add(lowTable);
    const teapot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })
    );
    teapot.position.set(0, 0.55, 8);
    scene.add(teapot);

    // ── GAZEBO (east) ──
    const gz = buildGazebo(10, 0);
    scene.add(gz.group);

    // ── GARDEN PATCH (west) ──
    for (const [mx, mz, ms] of [
      [-9, -1, 1.0], [-10.5, 0.5, 0.85], [-9.5, 1.5, 1.1],
      [-11, -1.5, 0.95], [-8.5, -2.2, 0.9], [-10.2, -3, 0.8],
    ] as Array<[number, number, number]>) {
      scene.add(buildMushroom(mx, mz, ms));
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI;
      const hx = -10 + Math.cos(a) * 2.8;
      const hz = -1 + Math.sin(a) * 2.8;
      const hedge = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 12, 8),
        new THREE.MeshStandardMaterial({ color: 0x8DECC2, roughness: 0.55 })
      );
      hedge.position.set(hx, 0.4, hz);
      hedge.castShadow = true;
      scene.add(hedge);
    }

    // ── STRING LIGHTS — cozy canopy ──
    const arcConfigs: Array<[number, number, number, number]> = [
      [-12, -12,  12, -12],
      [-12,  12,  12,  12],
      [-12, -12, -12,  12],
      [ 12, -12,  12,  12],
    ];
    const lightArcs: any[] = [];
    for (const [x1, z1, x2, z2] of arcConfigs) {
      const arc = buildStringLightArc(x1, z1, x2, z2, 3.8, 14);
      scene.add(arc.group);
      lightArcs.push(arc);
    }

    // ── TREES around perimeter ──
    const treeColors = [0x8DECC2, 0xA8E6CF, 0x9BD9B0];
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0xB58860 });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.15;
      const r = 17 + Math.random() * 5;
      const tx = Math.cos(a) * r;
      const tz = Math.sin(a) * r;
      const sc = 0.9 + Math.random() * 0.6;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 * sc, 0.24 * sc, 1.2 * sc, 8),
        trunkMat
      );
      trunk.position.set(tx, 0.6 * sc, tz);
      trunk.castShadow = true; scene.add(trunk);
      const leafMat = new THREE.MeshStandardMaterial({
        color: treeColors[Math.floor(Math.random() * treeColors.length)],
        roughness: 0.6,
      });
      const top1 = new THREE.Mesh(new THREE.ConeGeometry(1.1 * sc, 1.9 * sc, 7), leafMat);
      top1.position.set(tx, 2.1 * sc, tz); top1.castShadow = true; scene.add(top1);
      const top2 = new THREE.Mesh(new THREE.ConeGeometry(0.75 * sc, 1.4 * sc, 7), leafMat);
      top2.position.set(tx, 3.0 * sc, tz); top2.castShadow = true; scene.add(top2);
    }

    // ── DISTANT HILLS ──
    const hillMat1 = new THREE.MeshStandardMaterial({ color: 0xA8E6CF, roughness: 0.95 });
    const hillMat2 = new THREE.MeshStandardMaterial({ color: 0x8DECC2, roughness: 0.95 });
    const hillData: Array<[number, number, THREE.Material, number, number]> = [
      [-40,  35, hillMat1, 8, 5],
      [ 38,  32, hillMat2, 9, 6],
      [-44, -36, hillMat2, 10, 6],
      [ 46, -30, hillMat1, 8, 5],
      [-58,   0, hillMat1, 12, 7],
      [ 60,   2, hillMat2, 11, 6.5],
    ];
    for (const [hx, hz, mat, r, h] of hillData) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mat as any);
      hill.position.set(hx, h / 2 - 0.3, hz);
      scene.add(hill);
    }

    // ── CLOUDS ──
    const clouds: any[] = [];
    for (let i = 0; i < 7; i++) {
      const c = buildCloud(
        (Math.random() - 0.5) * 70,
        13 + Math.random() * 5,
        (Math.random() - 0.5) * 70,
        1.0 + Math.random() * 0.5,
      );
      clouds.push(c);
      scene.add(c);
    }

    // ── PLAYER ──
    const player = buildAvatar(config);
    player.position.set(0, 0, -4);
    player.rotation.y = Math.PI;
    player.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
    scene.add(player);

    // ── NPCs ──
    const npcs: any[] = [];
    // anchored spots — biased to social areas, so NPCs *appear* socializing
    const spawnSpots: Array<{ pos: [number, number]; seat?: string; idleRange?: number }> = [
      // café chairs
      { pos: [-4 - 1.0, -8], seat: 'sit' },
      { pos: [ 4 + 1.0, -8], seat: 'sit' },
      { pos: [ 0 - 1.0, -9.2], seat: 'sit' },
      // lounge cushions
      { pos: [-1.3, 9.3], seat: 'sit' },
      { pos: [ 1.3, 6.8], seat: Math.random() < 0.5 ? 'sit' : 'sleep' },
      { pos: [ 0, 8.0],   seat: 'sit' },
      // gazebo
      { pos: [10, 0], seat: 'sit' },
      // free wanderers near fountain
      { pos: [3, 2], idleRange: 5 },
      { pos: [-3, 3], idleRange: 5 },
      { pos: [4, -4], idleRange: 4 },
    ];
    for (let i = 0; i < spawnSpots.length; i++) {
      const name = COMMUNITY_NAMES[i % COMMUNITY_NAMES.length];
      const personality = pickPersonality();
      const cfg = {
        skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
        hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
        hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
        faceShape: FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)],
        eyeStyle: EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)],
        eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
        eyebrowAngle: (Math.random() - 0.5) * 0.4,
        mouthStyle: MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)],
        outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
        name,
      };
      const npc = buildAvatar(cfg);
      const spot = spawnSpots[i];
      npc.position.set(spot.pos[0], 0, spot.pos[1]);
      npc.rotation.y = Math.random() * Math.PI * 2;
      npc.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
      scene.add(npc);
      npcs.push({
        id: 'npc-' + i,
        group: npc,
        config: cfg,
        name,
        personality,
        stats: buildNpcStats(name, personality),
        seated: !!spot.seat,
        seatedEmote: spot.seat || null,
        emote: null as string | null,
        emoteUntil: 0,
        anchor: new THREE.Vector3(spot.pos[0], 0, spot.pos[1]),
        idleRange: spot.idleRange || 0,
        target: new THREE.Vector3(spot.pos[0], 0, spot.pos[1]),
        speed: 0.5 + Math.random() * 0.4,
        wait: 1 + Math.random() * 3,
        chatCooldown: 2 + Math.random() * 5,
      });
    }

    function pickWanderTargetFor(n: any) {
      if (n.idleRange > 0) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * n.idleRange;
        return new THREE.Vector3(
          n.anchor.x + Math.cos(a) * r,
          0,
          n.anchor.z + Math.sin(a) * r,
        );
      }
      return n.anchor.clone();
    }

    stateRef.current = { scene, camera, renderer, player, npcs, fountain: fount, gazeboBulb: gz.bulb, lightArcs };

    // click on an NPC → open profile
    const onCanvasClick = (e: MouseEvent) => {
      const idx = pickNpcAtPointer(e, renderer.domElement, camera, npcs);
      if (idx >= 0) setSelectedNpc(npcs[idx].stats);
    };
    renderer.domElement.addEventListener('click', onCanvasClick);

    // ── INPUT ──
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (hint) setHint(false);
      // start music on first interaction (browser policy)
      tryStartMusic();
      const emote = EMOTES.find(em => em.key === k);
      if (emote) {
        setPlayerEmote(emote.id);
        window.clearTimeout(emoteTimerRef.value);
        emoteTimerRef.value = window.setTimeout(() => setPlayerEmote(null), 4000);
      }
      if (k === 'q') setEmoteWheel(v => !v);
      if (k === 'escape') setEmoteWheel(false);
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    const emoteTimerRef = { value: 0 as any };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // touch
    let touchStart: any = null;
    let touchMove: any = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
      touchMove  = { x: t.clientX, y: t.clientY };
      if (hint) setHint(false);
      tryStartMusic();
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      touchMove = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = () => { touchStart = null; touchMove = null; };
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // ── AMBIENT MUSIC ── soft WebAudio pad + chimes
    let audioCtx: AudioContext | null = null;
    let masterGain: GainNode | null = null;
    let chordNodes: any[] = [];
    let chimeIntervalId: any = null;
    let userInteracted = false;
    function tryStartMusic() {
      if (userInteracted) return;
      userInteracted = true;
      if (musicOnRef.current) startMusic();
    }
    function startMusic() {
      if (audioCtx) return;
      try {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
        masterGain = audioCtx!.createGain();
        masterGain.gain.value = 0.05;
        masterGain.connect(audioCtx!.destination);
        const notes = [220, 277.18, 329.63, 415.30];
        for (const f of notes) {
          const osc1 = audioCtx!.createOscillator();
          const osc2 = audioCtx!.createOscillator();
          osc1.type = 'sine'; osc2.type = 'sine';
          osc1.frequency.value = f;
          osc2.frequency.value = f * 1.005;
          const g = audioCtx!.createGain();
          g.gain.value = 0.16;
          const lfo = audioCtx!.createOscillator();
          lfo.frequency.value = 0.08 + Math.random() * 0.1;
          const lfoGain = audioCtx!.createGain();
          lfoGain.gain.value = 0.05;
          lfo.connect(lfoGain).connect(g.gain as any);
          lfo.start();
          osc1.connect(g); osc2.connect(g);
          g.connect(masterGain!);
          osc1.start(); osc2.start();
          chordNodes.push(osc1, osc2, lfo);
        }
        chimeIntervalId = window.setInterval(() => {
          if (!audioCtx) return;
          const freqs = [660, 880, 1100, 990, 1320, 740];
          const f = freqs[Math.floor(Math.random() * freqs.length)];
          const t = audioCtx.currentTime;
          const o = audioCtx.createOscillator();
          o.type = 'sine';
          o.frequency.value = f;
          const g = audioCtx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.10, t + 0.04);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
          o.connect(g).connect(masterGain!);
          o.start(t);
          o.stop(t + 2.5);
        }, 5500 + Math.random() * 4000);
      } catch (e) {
        audioCtx = null;
      }
    }
    function stopMusic() {
      if (chimeIntervalId) clearInterval(chimeIntervalId);
      chimeIntervalId = null;
      for (const o of chordNodes) {
        try { o.stop(); } catch (e) { /* noop */ }
      }
      chordNodes = [];
      if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    }
    audioRef.current = { startMusic, stopMusic };
    const musicOnRef = { current: musicOn };
    stateRef.current.musicOnRef = musicOnRef;

    // ── ANIMATION LOOP ──
    let walkCycle = 0;
    let frameId = 0;
    let lastT = performance.now();
    let lastChat = 0;

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const t = now * 0.001;

      // player input
      let fwd = 0, strafe = 0;
      if (keys['w'] || keys['arrowup']) fwd += 1;
      if (keys['s'] || keys['arrowdown']) fwd -= 1;
      if (keys['a'] || keys['arrowleft']) strafe += 1;
      if (keys['d'] || keys['arrowright']) strafe -= 1;

      if (touchStart && touchMove) {
        const dx = touchMove.x - touchStart.x;
        const dy = touchMove.y - touchStart.y;
        fwd += clamp(-dy / 60, -1, 1);
        strafe += clamp(-dx / 60, -1, 1);
      }

      const mag = Math.hypot(fwd, strafe);
      const moving = mag > 0.05;
      const activeEmote = playerEmoteRef.current;

      if (activeEmote && !moving) {
        animateEmote(player, walkCycle, activeEmote);
        walkCycle += dt * 4;
      } else if (moving) {
        // moving cancels emote pose visually
        const speed = 3.6;
        const dirAngle = Math.atan2(strafe, fwd);
        const vx = Math.sin(dirAngle) * speed * dt;
        const vz = Math.cos(dirAngle) * speed * dt;
        player.position.x += vx;
        player.position.z += vz;
        const d = Math.hypot(player.position.x, player.position.z);
        if (d > 13) { player.position.x *= 13 / d; player.position.z *= 13 / d; }
        const targetRot = Math.atan2(vx, vz);
        let dr = targetRot - player.rotation.y;
        while (dr > Math.PI) dr -= Math.PI * 2;
        while (dr < -Math.PI) dr += Math.PI * 2;
        player.rotation.y += dr * Math.min(1, dt * 12);
        walkCycle += dt * 8;
        animateWalk(player, walkCycle);
      } else {
        walkCycle += dt * 1.5;
        animateIdle(player, walkCycle);
      }

      // camera follow
      const camDist = 7;
      const camHeight = 5;
      const camTargetX = player.position.x;
      const camTargetZ = player.position.z - camDist;
      const camTargetY = camHeight;
      camera.position.x += (camTargetX - camera.position.x) * 0.09;
      camera.position.z += (camTargetZ - camera.position.z) * 0.09;
      camera.position.y += (camTargetY - camera.position.y) * 0.09;
      camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z + 2);

      // NPCs
      for (const n of npcs) {
        if (n.seated && !n.emote) {
          animateEmote(n.group, t + n.id.length, n.seatedEmote || 'sit');
        } else if (n.emote && n.emoteUntil > now) {
          animateEmote(n.group, t + n.id.length, n.emote);
        } else {
          if (n.emote) n.emote = null;
          if (n.seated) {
            animateEmote(n.group, t + n.id.length, n.seatedEmote || 'sit');
          } else if (n.wait > 0) {
            n.wait -= dt;
            animateIdle(n.group, t + n.id.length);
          } else {
            const dx = n.target.x - n.group.position.x;
            const dz = n.target.z - n.group.position.z;
            const d = Math.hypot(dx, dz);
            if (d < 0.3) {
              n.target = pickWanderTargetFor(n);
              n.wait = 2 + Math.random() * 4;
              if (Math.random() < 0.4) {
                const e = ['wave', 'laugh', 'cheer', 'clap', 'dance'][Math.floor(Math.random() * 5)];
                n.emote = e;
                n.emoteUntil = now + 2400 + Math.random() * 1800;
              }
            } else {
              const speed = n.speed;
              n.group.position.x += (dx / d) * speed * dt;
              n.group.position.z += (dz / d) * speed * dt;
              const tr = Math.atan2(dx, dz);
              let dr = tr - n.group.rotation.y;
              while (dr > Math.PI) dr -= Math.PI * 2;
              while (dr < -Math.PI) dr += Math.PI * 2;
              n.group.rotation.y += dr * Math.min(1, dt * 8);
              animateWalk(n.group, t * 8 + n.id.length);
            }
          }
        }
        n.chatCooldown -= dt;
      }

      // chat bubble emission (proximity)
      if (now - lastChat > 1800) {
        const all = [
          { id: 'player', group: player, personality: 'cheerful' as Personality, name: config.name },
          ...npcs.map(n => ({ id: n.id, group: n.group, personality: n.personality, name: n.name })),
        ];
        for (const a of npcs) {
          if (a.chatCooldown > 0) continue;
          let nearest: any = null;
          let nd = Infinity;
          for (const b of all) {
            if (b.id === a.id) continue;
            const d = Math.hypot(b.group.position.x - a.group.position.x, b.group.position.z - a.group.position.z);
            if (d < nd) { nd = d; nearest = b; }
          }
          if (nearest && nd < 4.8 && Math.random() < 0.55) {
            const bubble = {
              id: 'b-' + a.id + '-' + now,
              charId: a.id,
              text: pickChatLine(a.personality),
              expires: now + 3800,
            };
            bubblesRef.current = [...bubblesRef.current.filter(x => x.expires > now), bubble].slice(-10);
            a.chatCooldown = 6 + Math.random() * 5;
            // occasional response from nearest
            if (Math.random() < 0.35) {
              const nNpc = npcs.find(n => n.id === nearest.id);
              if (nNpc) {
                setTimeout(() => {
                  const reply = {
                    id: 'b-' + nNpc.id + '-' + (Date.now()),
                    charId: nNpc.id,
                    text: pickChatLine(nNpc.personality),
                    expires: performance.now() + 3500,
                  };
                  bubblesRef.current = [...bubblesRef.current.filter(x => x.expires > performance.now()), reply].slice(-10);
                }, 1200 + Math.random() * 600);
              }
            }
          }
        }
        lastChat = now;
      }
      // drop expired bubbles
      bubblesRef.current = bubblesRef.current.filter(b => b.expires > now);

      // project bubble world positions to screen
      const ndc = new THREE.Vector3();
      const overlay = mountRef.current;
      const positions: Record<string, { x: number; y: number; visible: boolean }> = {};
      if (overlay) {
        const ww = overlay.clientWidth, hh = overlay.clientHeight;
        for (const b of bubblesRef.current) {
          let g: any = null;
          if (b.charId === 'player') g = player;
          else { const n = npcs.find(x => x.id === b.charId); if (n) g = n.group; }
          if (g) {
            ndc.set(g.position.x, g.position.y + 2.5, g.position.z);
            ndc.project(camera);
            const x = (ndc.x * 0.5 + 0.5) * ww;
            const y = (-ndc.y * 0.5 + 0.5) * hh;
            positions[b.id] = { x, y, visible: ndc.z < 1 };
          }
        }
      }
      stateRef.current.bubblePositions = positions;

      // nearby friends
      const friends: string[] = [];
      for (const n of npcs) {
        const d = Math.hypot(n.group.position.x - player.position.x, n.group.position.z - player.position.z);
        if (d < 4) friends.push(n.name);
      }
      stateRef.current.nearbyFriends = friends;

      // fountain water bob
      fount.midWater.position.y = 0.97 + Math.sin(t * 1.4) * 0.012;
      fount.topWater.position.y = 2.47 + Math.sin(t * 1.4) * 0.014;
      fount.orb.position.y = 2.7 + Math.sin(t * 1.2) * 0.04;
      (fount.orb.material as any).emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.15;

      // gazebo bulb pulse
      (gz.bulb.material as any).emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.15;

      // string lights twinkle
      for (const arc of lightArcs) {
        for (let i = 0; i < arc.lights.length; i++) {
          (arc.lights[i].material as any).emissiveIntensity = 0.6 + Math.sin(t * 1.8 + i * 0.7) * 0.25;
        }
      }

      // clouds drift
      for (let i = 0; i < clouds.length; i++) {
        clouds[i].position.x += dt * (0.12 + (i % 3) * 0.06);
        if (clouds[i].position.x > 50) clouds[i].position.x = -50;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // re-render bubble layer + friend list at ~16 Hz
    const tickInt = window.setInterval(() => {
      setTick(v => (v + 1) % 1_000_000);
      const f = stateRef.current.nearbyFriends as string[] | undefined;
      if (f) {
        setNearbyFriends(prev => {
          if (prev.length === f.length && prev.every((x, i) => x === f[i])) return prev;
          return [...f];
        });
      }
    }, 60);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.clearInterval(tickInt);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      if (profileToastTimerRef.current) window.clearTimeout(profileToastTimerRef.current);
      stopMusic();
      disposeGroup(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // toggle music
  useEffect(() => {
    if (stateRef.current?.musicOnRef) stateRef.current.musicOnRef.current = musicOn;
    if (!audioRef.current) return;
    if (musicOn) audioRef.current.startMusic();
    else audioRef.current.stopMusic();
  }, [musicOn]);

  const triggerEmote = (id: string) => {
    setPlayerEmote(id);
    setEmoteWheel(false);
    setTimeout(() => setPlayerEmote(null), 4000);
  };

  return (
    <div className="bloom-root font-body relative w-full h-full overflow-hidden wee-bg-soft">
      <div ref={mountRef} className="absolute inset-0" />

      {/* chat bubbles overlay */}
      {bubblesRef.current.map((b: any) => {
        const pos = stateRef.current.bubblePositions?.[b.id];
        if (!pos || !pos.visible) return null;
        return (
          <div key={b.id}
               style={{
                 position: 'absolute',
                 left: pos.x,
                 top: pos.y,
                 transform: 'translate(-50%, -100%)',
                 pointerEvents: 'none',
                 zIndex: 8,
                 animation: 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
               }}>
            <div className="font-cute text-xs font-bold px-3 py-2"
                 style={{
                   background: '#FFFFFF',
                   border: '2.5px solid #FFE3D1',
                   color: '#3D2418',
                   borderRadius: 18,
                   boxShadow: '0 4px 0 rgba(255,179,158,0.32), 0 8px 18px -4px rgba(255,139,122,0.2)',
                   maxWidth: 200,
                   textAlign: 'center',
                   whiteSpace: 'normal',
                 }}>
              {b.text}
            </div>
            <div style={{
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid #FFE3D1',
              margin: '0 auto',
            }} />
          </div>
        );
      })}

      {/* top-left HUD */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-3 transition-all hover:scale-105 text-warm" style={{
          background: '#FFFFFF', border: '3px solid #FFFFFF', borderRadius: '9999px',
          boxShadow: '0 5px 0 rgba(255,179,158,0.45), 0 10px 22px -6px rgba(255,139,122,0.3)',
        }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="pill-cute font-cute text-xs font-bold flex items-center gap-2 px-4 py-2.5"
             style={{ letterSpacing: '0.12em' }}>
          <div className="w-2 h-2 rounded-full"
               style={{ background: '#FFB39E', animation: 'pulse-glow 2s ease-in-out infinite' }} />
          <span>COMMUNITY PLAZA</span>
        </div>
        <button onClick={() => setMusicOn(v => !v)}
                className="px-3 py-2 font-cute text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: musicOn ? '#FFD9CA' : '#FFF7EE',
                  border: '2px solid #FFE3D1', borderRadius: 9999,
                  boxShadow: '0 3px 0 rgba(255,179,158,0.32)',
                  color: '#8A5A3A',
                  letterSpacing: '0.1em',
                }}>
          ♫ {musicOn ? 'music on' : 'music off'}
        </button>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <div className="pill-cute font-cute text-base font-bold flex items-center gap-2 px-5 py-2.5">
          <Sparkles className="w-4 h-4" />
          <span>{config.name}</span>
        </div>
      </div>

      {/* nearby friends */}
      {nearbyFriends.length > 0 && (
        <div className="absolute top-24 right-6 z-10 max-w-[200px]"
             style={{ animation: 'fade-up 0.3s ease-out' }}>
          <div className="font-cute text-[10px] font-bold uppercase mb-1.5 text-right"
               style={{ color: '#8A5A3A', letterSpacing: '0.18em' }}>
            ♡ nearby
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {nearbyFriends.slice(0, 5).map((name: string) => (
              <div key={name}
                   className="font-cute text-xs font-bold px-3 py-1.5"
                   style={{
                     background: '#FFFFFF',
                     color: '#C2553D',
                     border: '2px solid #FFE3D1',
                     borderRadius: 9999,
                     boxShadow: '0 3px 0 rgba(255,179,158,0.25)',
                   }}>
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* control hint */}
      {hint && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 card-cute px-5 py-4 z-10 text-center"
             style={{ animation: 'fade-up 0.8s ease-out 0.3s both', maxWidth: '92vw' }}>
          <div className="font-cute text-xs font-bold uppercase mb-2"
               style={{ color: '#C2553D', letterSpacing: '0.18em' }}>
            controls
          </div>
          <div className="font-cute text-sm font-semibold text-warm flex flex-wrap justify-center items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md" style={{ background: '#FFE9D9', border: '1.5px solid #FFC9B5' }}>WASD</span>
            <span className="text-warm-faded">walk</span>
            <span className="text-warm-faded">·</span>
            <span className="px-2 py-0.5 rounded-md" style={{ background: '#FFE9D9', border: '1.5px solid #FFC9B5' }}>1-7</span>
            <span className="text-warm-faded">emotes</span>
            <span className="text-warm-faded">·</span>
            <span className="px-2 py-0.5 rounded-md" style={{ background: '#FFE9D9', border: '1.5px solid #FFC9B5' }}>Q</span>
            <span className="text-warm-faded">emote wheel</span>
          </div>
        </div>
      )}

      {/* emote dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-2"
           style={{
             background: '#FFFFFF',
             border: '3px solid #FFFFFF',
             borderRadius: 9999,
             boxShadow: '0 5px 0 rgba(255,179,158,0.45), 0 12px 26px -6px rgba(255,139,122,0.25)',
           }}>
        {EMOTES.map(em => (
          <button
            key={em.id}
            onClick={() => triggerEmote(em.id)}
            className="transition-all hover:scale-110 flex items-center justify-center"
            style={{
              width: 42, height: 42,
              background: playerEmote === em.id ? '#FFD9CA' : '#FFF7EE',
              border: playerEmote === em.id ? '2px solid #FF8B7A' : '2px solid #FFE3D1',
              borderRadius: 9999,
              fontSize: 20,
            }}
            title={`${em.label} (${em.key})`}>
            {em.icon}
          </button>
        ))}
      </div>

      {/* emote wheel popup */}
      {emoteWheel && (
        <div className="absolute inset-0 z-20 flex items-center justify-center"
             onClick={() => setEmoteWheel(false)}
             style={{ background: 'rgba(60, 36, 24, 0.35)' }}>
          <div className="card-cute-strong p-6 text-center"
               style={{ animation: 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
               onClick={(e) => e.stopPropagation()}>
            <div className="font-cute text-xs font-bold uppercase mb-3"
                 style={{ color: '#C2553D', letterSpacing: '0.2em' }}>
              ♡ pick an emote ♡
            </div>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {EMOTES.map(em => (
                <button
                  key={em.id}
                  onClick={() => triggerEmote(em.id)}
                  className="transition-all hover:scale-105 flex flex-col items-center justify-center p-3"
                  style={{
                    background: '#FFF7EE',
                    border: '2.5px solid #FFE3D1',
                    borderRadius: 18,
                    boxShadow: '0 3px 0 rgba(255,179,158,0.32)',
                    minWidth: 72,
                  }}>
                  <div style={{ fontSize: 28 }}>{em.icon}</div>
                  <div className="font-cute text-[10px] font-bold mt-1 text-warm">{em.label}</div>
                </button>
              ))}
            </div>
            <div className="font-cute text-[10px] text-warm-faded">press Q again to close</div>
          </div>
        </div>
      )}

      <NpcToast toast={profileToast} accent="#FF8B7A" />
      <NpcProfile
        npc={selectedNpc}
        isFriend={selectedNpc ? friendsApi.isFriend(selectedNpc.name) : false}
        accent="#FF8B7A"
        onClose={() => setSelectedNpc(null)}
        onChat={(npc: any) => {
          showProfileToast({ text: `${npc.name}: ${npcChatLineFor(npc.personality)}`, icon: '💬' });
          setSelectedNpc(null);
        }}
        onFriendToggle={(npc: any) => {
          if (friendsApi.isFriend(npc.name)) {
            friendsApi.removeFriend(npc.name);
            showProfileToast({ text: `${npc.name} removed from friends`, icon: '○' });
          } else {
            friendsApi.addFriend(npc.name);
            showProfileToast({ text: `you and ${npc.name} are friends now ♡`, icon: '✦' });
          }
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// NPC PROFILE — shared across all worlds.
// Click any NPC → profile popup with name, level, vibe stats,
// plus Chat (toast) and Add Friend (persisted in localStorage).
// ────────────────────────────────────────────────────────────────

const PERSONALITY_ICONS: Record<string, string> = {
  cheerful: '☺',
  shy:      '◡',
  sleepy:   '𓂃',
  curious:  '◉',
  cozy:     '♥',
};

const PERSONALITY_TITLES: Record<string, string> = {
  cheerful: 'sunshine wee',
  shy:      'quiet wee',
  sleepy:   'dreamy wee',
  curious:  'thinky wee',
  cozy:     'cuddle wee',
};

const VIBE_WORDS = ['soft', 'sparkly', 'cozy', 'spicy', 'mellow', 'beamy', 'gentle', 'wavy', 'bubbly', 'velvet'];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Stable, deterministic stats from the NPC's name (so the same NPC has
// the same level/vibe each time the player meets them — feels like a real wee).
function buildNpcStats(name: string, personality?: string) {
  const h = hashStr(name);
  const personalities = ['cheerful', 'shy', 'sleepy', 'curious', 'cozy'];
  return {
    name,
    personality: personality || personalities[h % personalities.length],
    level:  1 + (h % 99),
    vibe:   VIBE_WORDS[h % VIBE_WORDS.length],
    streak: 1 + ((h >> 4) % 64),
  };
}

const FRIENDS_KEY = 'wee:friends';
function loadFriends(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function persistFriends(s: Set<string>) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(Array.from(s))); } catch {}
}

function useFriends() {
  const [friends, setFriends] = useState<Set<string>>(() => loadFriends());
  return {
    friends,
    isFriend: (n: string) => friends.has(n),
    addFriend: (n: string) => {
      setFriends(prev => { const x = new Set(prev); x.add(n); persistFriends(x); return x; });
    },
    removeFriend: (n: string) => {
      setFriends(prev => { const x = new Set(prev); x.delete(n); persistFriends(x); return x; });
    },
  };
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="font-cute font-bold flex flex-col items-center px-3 py-2"
         style={{
           background: '#FFF7EE',
           border: '2px solid #FFE3D1',
           borderRadius: 14,
           minWidth: 64,
         }}>
      <div className="text-[9px] uppercase mb-0.5"
           style={{ color: '#8A5A3A', letterSpacing: '0.18em' }}>{label}</div>
      <div className="text-sm text-warm">{value}</div>
    </div>
  );
}

function NpcProfile({ npc, isFriend, onClose, onChat, onFriendToggle, accent = '#FF8B7A' }: any) {
  if (!npc) return null;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center px-6"
         style={{ background: 'rgba(60, 36, 24, 0.45)', animation: 'fade-in 0.2s ease-out' }}
         onClick={onClose}>
      <div className="card-cute-strong p-7 w-full max-w-sm text-center relative"
           style={{ animation: 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
           onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}
                className="absolute top-3 right-3 p-2 transition-all hover:scale-110"
                style={{ background: '#FFF7EE', border: '2px solid #FFE3D1',
                         borderRadius: 9999, color: '#8A5A3A' }}>
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto mb-4 flex items-center justify-center"
             style={{
               width: 100, height: 100, borderRadius: '50%',
               background: 'linear-gradient(180deg, #FFE9D9, #FFC9B5)',
               border: '4px solid #FFFFFF',
               boxShadow: `0 6px 0 ${accent}66, 0 14px 28px -6px rgba(255,139,122,0.3)`,
               fontSize: 44, color: '#3D2418',
             }}>
          <span style={{ fontFamily: 'system-ui, -apple-system' }}>
            {PERSONALITY_ICONS[npc.personality] || '☺'}
          </span>
        </div>

        <div className="font-cute text-[10px] font-bold uppercase mb-1.5"
             style={{ color: accent, letterSpacing: '0.22em' }}>
          ♡ wee · lvl {npc.level}
        </div>

        <h2 className="font-display text-3xl font-bold text-warm mb-1">{npc.name}</h2>

        <div className="font-cute text-sm text-warm-soft mb-5">
          {PERSONALITY_TITLES[npc.personality] || 'a wee'} ♡
        </div>

        <div className="flex gap-2 justify-center mb-5 flex-wrap">
          <StatChip label="vibe"   value={npc.vibe} />
          <StatChip label="lvl"    value={String(npc.level)} />
          <StatChip label="streak" value={`${npc.streak}d`} />
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={() => onChat?.(npc)}
                  className="font-cute text-sm font-bold px-5 py-3 flex items-center gap-2 transition-all hover:scale-105 active:translate-y-1"
                  style={{
                    background: 'linear-gradient(180deg, #FFD66B 0%, #FFA84B 100%)',
                    color: '#4A2C18',
                    border: '3px solid #FFFFFF',
                    borderRadius: 9999,
                    boxShadow: '0 5px 0 #C77A2E, 0 12px 26px -6px rgba(199,122,46,0.4)',
                  }}>
            <span style={{ fontSize: 16 }}>💬</span>
            <span>chat</span>
          </button>
          <button onClick={() => onFriendToggle?.(npc)}
                  className="font-cute text-sm font-bold px-5 py-3 flex items-center gap-2 transition-all hover:scale-105 active:translate-y-1"
                  style={{
                    background: isFriend
                      ? 'linear-gradient(180deg, #C4ECC8 0%, #8DECC2 100%)'
                      : '#FFFFFF',
                    color: isFriend ? '#3D2418' : accent,
                    border: '3px solid #FFFFFF',
                    borderRadius: 9999,
                    boxShadow: isFriend
                      ? '0 5px 0 #5D8C5A, 0 12px 26px -6px rgba(93,140,90,0.35)'
                      : `0 5px 0 ${accent}, 0 12px 26px -6px rgba(255,139,122,0.35)`,
                  }}>
            {isFriend ? (
              <>
                <Check className="w-4 h-4" />
                <span>friends ♡</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>＋</span>
                <span>add friend</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function NpcToast({ toast, accent }: any) {
  if (!toast) return null;
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
         style={{ animation: 'fade-up 0.3s ease-out' }}>
      <div className="font-cute text-sm font-bold px-5 py-3 flex items-center gap-2"
           style={{
             background: '#FFFFFF',
             border: '3px solid #FFFFFF',
             borderRadius: 9999,
             boxShadow: `0 5px 0 ${accent || '#FF8B7A'}66, 0 12px 26px -6px rgba(255,139,122,0.3)`,
             color: '#3D2418',
             maxWidth: '82vw',
           }}>
        {toast.icon && <span style={{ fontSize: 16 }}>{toast.icon}</span>}
        <span>{toast.text}</span>
      </div>
    </div>
  );
}

// Pick the NPC whose group's descendant was clicked (or -1).
function pickNpcAtPointer(
  e: { clientX: number; clientY: number },
  domElement: HTMLElement,
  camera: THREE.Camera,
  npcs: Array<{ group: THREE.Object3D }>,
): number {
  const rect = domElement.getBoundingClientRect();
  const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera({ x: ndcX, y: ndcY } as any, camera);
  const targets = npcs.map(n => n.group);
  const hits = raycaster.intersectObjects(targets, true);
  if (hits.length === 0) return -1;
  let obj: THREE.Object3D | null = hits[0].object;
  while (obj) {
    const idx = npcs.findIndex(n => n.group === obj);
    if (idx >= 0) return idx;
    obj = obj.parent;
  }
  return -1;
}

// A simple chat-line picker that works even when called from Subworld /
// World (which don't have their own CHAT_LINES system).
function npcChatLineFor(personality: string): string {
  const pool = (CHAT_LINES as any)?.[personality] || ['hi! ♡', 'oh, hey there', 'good to see you'];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ────────────────────────────────────────────────────────────────
// SUBWORLDS — Arcade, Studio, Garden, Theater, Plaza Mart
// Each is rendered through a shared <Subworld> component with a
// theme config that supplies decor, palette, NPC layout, and a
// per-frame update hook.
// ────────────────────────────────────────────────────────────────

type SubworldNpcSpawn = {
  pos: [number, number];
  yaw?: number;
  seated?: string; // 'sit' | 'sleep' | 'dance' | 'cheer' | 'wave' | 'clap' | 'laugh'
  wanderRadius?: number;
};

type SubworldTheme = {
  title: string;
  subtitle: string;
  accent: string;
  dotColor: string;
  fog: number;
  hemi: { sky: number; ground: number; intensity: number };
  sun: { color: number; intensity: number };
  rim?: { color: number; intensity: number; pos: [number, number, number] };
  ground: { color: number; radius: number };
  surround?: number; // ring around the ground
  perimeterTrees?: { count: number; colors: number[] } | false;
  clouds?: number;
  playerSpawn: [number, number, number];
  playerYaw: number;
  walkBounds: number; // radius
  populate: (scene: THREE.Scene, refs: any) => void;
  npcs: SubworldNpcSpawn[];
  update?: (now: number, dt: number, refs: any) => void;
  // Optional in-world interactables; when player is within `radius` of `pos`,
  // a "press E to play" prompt appears and pressing E calls `onInteract(id)`.
  interactables?: Array<{ id: string; pos: [number, number]; label?: string; icon?: string; radius?: number }>;
};

function randomCommunityCfg(name: string) {
  return {
    skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
    hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    faceShape: FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)],
    eyeStyle: EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)],
    eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
    eyebrowAngle: (Math.random() - 0.5) * 0.4,
    mouthStyle: MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)],
    outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
    name,
  };
}

function Subworld({ config, onBack, theme, onInteract }: any) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hint, setHint] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [nearbyInteractable, setNearbyInteractable] = useState<any>(null);
  const nearbyInteractableRef = useRef<any>(null);
  const onInteractRef = useRef(onInteract);
  useEffect(() => { onInteractRef.current = onInteract; }, [onInteract]);
  const friendsApi = useFriends();
  const npcsClickableRef = useRef<any[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const showToast = (next: any) => {
    setToast(next);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth, height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = makeSkyTexture();
    scene.fog = new THREE.Fog(theme.fog, 20, 55);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // lighting
    const hemi = new THREE.HemisphereLight(theme.hemi.sky, theme.hemi.ground, theme.hemi.intensity);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(theme.sun.color, theme.sun.intensity);
    sun.position.set(10, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    if (theme.rim) {
      const rim = new THREE.DirectionalLight(theme.rim.color, theme.rim.intensity);
      rim.position.set(theme.rim.pos[0], theme.rim.pos[1], theme.rim.pos[2]);
      scene.add(rim);
    }

    // ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(theme.ground.radius, 64),
      new THREE.MeshStandardMaterial({ color: theme.ground.color, roughness: 0.85 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    if (theme.surround !== undefined) {
      const surround = new THREE.Mesh(
        new THREE.RingGeometry(theme.ground.radius, 60, 32, 1),
        new THREE.MeshStandardMaterial({ color: theme.surround, roughness: 0.95 })
      );
      surround.rotation.x = -Math.PI / 2;
      surround.position.y = -0.02;
      scene.add(surround);
    }

    // perimeter trees
    if (theme.perimeterTrees) {
      const { count, colors } = theme.perimeterTrees;
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0xB58860 });
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + 0.18;
        const r = theme.ground.radius + 3 + Math.random() * 4;
        const tx = Math.cos(a) * r;
        const tz = Math.sin(a) * r;
        const sc = 0.9 + Math.random() * 0.5;
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2 * sc, 0.24 * sc, 1.2 * sc, 8),
          trunkMat
        );
        trunk.position.set(tx, 0.6 * sc, tz); trunk.castShadow = true;
        scene.add(trunk);
        const leafMat = new THREE.MeshStandardMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          roughness: 0.6,
        });
        const top1 = new THREE.Mesh(new THREE.ConeGeometry(1.1 * sc, 1.9 * sc, 7), leafMat);
        top1.position.set(tx, 2.1 * sc, tz); top1.castShadow = true;
        scene.add(top1);
        const top2 = new THREE.Mesh(new THREE.ConeGeometry(0.75 * sc, 1.4 * sc, 7), leafMat);
        top2.position.set(tx, 3.0 * sc, tz); top2.castShadow = true;
        scene.add(top2);
      }
    }

    // clouds
    const clouds: any[] = [];
    const cloudCount = theme.clouds ?? 6;
    for (let i = 0; i < cloudCount; i++) {
      const c = buildCloud(
        (Math.random() - 0.5) * 70,
        13 + Math.random() * 5,
        (Math.random() - 0.5) * 70,
        1.0 + Math.random() * 0.5,
      );
      clouds.push(c);
      scene.add(c);
    }

    // theme-specific decor
    const refs: any = { player: null, npcs: [], extras: {}, clouds };
    theme.populate(scene, refs);

    // player
    const player = buildAvatar(config);
    const sp = theme.playerSpawn;
    player.position.set(sp[0], sp[1], sp[2]);
    player.rotation.y = theme.playerYaw;
    player.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
    scene.add(player);
    refs.player = player;

    // NPCs
    const npcs: any[] = [];
    const npcSpots = theme.npcs as SubworldNpcSpawn[];
    for (let i = 0; i < npcSpots.length; i++) {
      const cfg = randomCommunityCfg(NPC_NAMES[i % NPC_NAMES.length]);
      const npc = buildAvatar(cfg);
      npc.position.set(npcSpots[i].pos[0], 0, npcSpots[i].pos[1]);
      npc.rotation.y = npcSpots[i].yaw ?? Math.random() * Math.PI * 2;
      npc.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
      scene.add(npc);
      npcs.push({
        id: 'npc-' + i,
        group: npc,
        cfg,
        stats: buildNpcStats(cfg.name),
        seated: !!npcSpots[i].seated,
        seatedEmote: npcSpots[i].seated || null,
        anchor: new THREE.Vector3(npcSpots[i].pos[0], 0, npcSpots[i].pos[1]),
        target: new THREE.Vector3(npcSpots[i].pos[0], 0, npcSpots[i].pos[1]),
        wanderRadius: npcSpots[i].wanderRadius ?? 3,
        speed: 0.45 + Math.random() * 0.45,
        wait: 1 + Math.random() * 3,
      });
    }
    refs.npcs = npcs;
    npcsClickableRef.current = npcs;

    // click on an NPC → open profile
    const onCanvasClick = (e: MouseEvent) => {
      const idx = pickNpcAtPointer(e, renderer.domElement, camera, npcs);
      if (idx >= 0) setSelectedNpc(npcs[idx].stats);
    };
    renderer.domElement.addEventListener('click', onCanvasClick);

    // input
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (hint) setHint(false);
      if ((k === 'e' || k === 'enter') && nearbyInteractableRef.current && onInteractRef.current) {
        onInteractRef.current(nearbyInteractableRef.current.id);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let touchStart: any = null, touchMove: any = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
      touchMove  = { x: t.clientX, y: t.clientY };
      if (hint) setHint(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      touchMove = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = () => { touchStart = null; touchMove = null; };
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // animation loop
    let walkCycle = 0;
    let frameId = 0;
    let lastT = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const t = now * 0.001;

      let fwd = 0, strafe = 0;
      if (keys['w'] || keys['arrowup']) fwd += 1;
      if (keys['s'] || keys['arrowdown']) fwd -= 1;
      if (keys['a'] || keys['arrowleft']) strafe -= 1;
      if (keys['d'] || keys['arrowright']) strafe += 1;
      if (touchStart && touchMove) {
        const dx = touchMove.x - touchStart.x;
        const dy = touchMove.y - touchStart.y;
        fwd += Math.max(-1, Math.min(1, -dy / 60));
        strafe += Math.max(-1, Math.min(1, dx / 60));
      }
      const mag = Math.hypot(fwd, strafe);
      const moving = mag > 0.05;

      if (moving) {
        const speed = 3.6;
        const dirAngle = Math.atan2(strafe, fwd);
        const vx = Math.sin(dirAngle) * speed * dt;
        const vz = Math.cos(dirAngle) * speed * dt;
        player.position.x += vx;
        player.position.z += vz;
        const d = Math.hypot(player.position.x, player.position.z);
        if (d > theme.walkBounds) {
          player.position.x *= theme.walkBounds / d;
          player.position.z *= theme.walkBounds / d;
        }
        const targetRot = Math.atan2(vx, vz);
        let dr = targetRot - player.rotation.y;
        while (dr > Math.PI) dr -= Math.PI * 2;
        while (dr < -Math.PI) dr += Math.PI * 2;
        player.rotation.y += dr * Math.min(1, dt * 12);
        walkCycle += dt * 8;
        animateWalk(player, walkCycle);
      } else {
        walkCycle += dt * 1.5;
        animateIdle(player, walkCycle);
      }

      // camera follow
      const camDist = 7;
      const camHeight = 4.6;
      const camTargetX = player.position.x;
      const camTargetZ = player.position.z - camDist;
      const camTargetY = camHeight;
      camera.position.x += (camTargetX - camera.position.x) * 0.09;
      camera.position.z += (camTargetZ - camera.position.z) * 0.09;
      camera.position.y += (camTargetY - camera.position.y) * 0.09;
      camera.lookAt(player.position.x, player.position.y + 1.1, player.position.z + 2);

      // NPC wander
      for (const n of npcs) {
        if (n.seated) {
          animateEmote(n.group, t + n.id.length, n.seatedEmote);
        } else if (n.wait > 0) {
          n.wait -= dt;
          animateIdle(n.group, t + n.id.length);
        } else {
          const dx = n.target.x - n.group.position.x;
          const dz = n.target.z - n.group.position.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.3) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * n.wanderRadius;
            n.target.set(n.anchor.x + Math.cos(a) * r, 0, n.anchor.z + Math.sin(a) * r);
            n.wait = 2 + Math.random() * 3;
          } else {
            n.group.position.x += (dx / d) * n.speed * dt;
            n.group.position.z += (dz / d) * n.speed * dt;
            const tr = Math.atan2(dx, dz);
            let dr = tr - n.group.rotation.y;
            while (dr > Math.PI) dr -= Math.PI * 2;
            while (dr < -Math.PI) dr += Math.PI * 2;
            n.group.rotation.y += dr * Math.min(1, dt * 8);
            animateWalk(n.group, t * 8 + n.id.length);
          }
        }
      }

      // clouds drift
      for (let i = 0; i < clouds.length; i++) {
        clouds[i].position.x += dt * (0.12 + (i % 3) * 0.06);
        if (clouds[i].position.x > 50) clouds[i].position.x = -50;
      }

      // interactable proximity
      if (theme.interactables && theme.interactables.length) {
        let nearest: any = null;
        let nearestDist = Infinity;
        for (const it of theme.interactables) {
          const r = it.radius ?? 1.8;
          const dx = it.pos[0] - player.position.x;
          const dz = it.pos[1] - player.position.z;
          const d = Math.hypot(dx, dz);
          if (d < r && d < nearestDist) { nearest = it; nearestDist = d; }
        }
        const prevId = nearbyInteractableRef.current?.id ?? null;
        const newId = nearest?.id ?? null;
        if (prevId !== newId) {
          nearbyInteractableRef.current = nearest;
          setNearbyInteractable(nearest);
        }
      }

      if (theme.update) theme.update(now, dt, refs);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      disposeGroup(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bloom-root font-body relative w-full h-full overflow-hidden wee-bg-soft">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-3 transition-all hover:scale-105 text-warm" style={{
          background: '#FFFFFF', border: '3px solid #FFFFFF', borderRadius: '9999px',
          boxShadow: '0 5px 0 rgba(255,179,158,0.45), 0 10px 22px -6px rgba(255,139,122,0.3)',
        }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="pill-cute font-cute text-xs font-bold flex items-center gap-2 px-4 py-2.5"
             style={{ letterSpacing: '0.12em' }}>
          <div className="w-2 h-2 rounded-full"
               style={{ background: theme.dotColor, animation: 'pulse-glow 2s ease-in-out infinite' }} />
          <span>{theme.title.toUpperCase()}</span>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <div className="pill-cute font-cute text-base font-bold flex items-center gap-2 px-5 py-2.5">
          <Sparkles className="w-4 h-4" />
          <span>{config.name}</span>
        </div>
      </div>

      {hint && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 card-cute px-5 py-4 z-10 text-center"
             style={{ animation: 'fade-up 0.8s ease-out 0.3s both', maxWidth: '90vw' }}>
          <div className="font-cute text-xs font-bold uppercase mb-2"
               style={{ color: '#C2553D', letterSpacing: '0.18em' }}>
            controls
          </div>
          <div className="font-cute text-sm font-semibold text-warm">
            <span className="px-2 py-0.5 rounded-md" style={{ background: '#FFE9D9', border: '1.5px solid #FFC9B5' }}>WASD</span>
            <span className="mx-1.5 text-warm-faded">to walk</span>
            <span className="mx-2 text-warm-faded">·</span>
            <span className="font-cute text-warm-faded">drag on touch</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pill-soft font-cute text-xs font-bold px-4 py-2"
           style={{ letterSpacing: '0.16em' }}>
        ♡ {theme.subtitle.toUpperCase()} ♡
      </div>

      {nearbyInteractable && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
             style={{ animation: 'fade-up 0.3s ease-out' }}>
          <button
            onClick={() => onInteractRef.current && onInteractRef.current(nearbyInteractable.id)}
            className="font-cute font-bold flex items-center gap-3 px-5 py-3 transition-all hover:scale-105"
            style={{
              background: '#FFFFFF',
              border: `3px solid ${theme.accent}`,
              borderRadius: 9999,
              color: theme.accent,
              boxShadow: `0 5px 0 ${theme.accent}, 0 12px 26px -6px rgba(0,0,0,0.25)`,
              cursor: 'pointer',
            }}>
            {nearbyInteractable.icon && <span style={{ fontSize: 22 }}>{nearbyInteractable.icon}</span>}
            <span>play {nearbyInteractable.label || nearbyInteractable.id}</span>
            <span className="font-cute text-[10px] font-bold px-2 py-0.5"
                  style={{ background: '#FFF7EE', border: `2px solid ${theme.accent}`, borderRadius: 8, letterSpacing: '0.14em' }}>
              E
            </span>
          </button>
        </div>
      )}

      <NpcToast toast={toast} accent={theme.accent} />
      <NpcProfile
        npc={selectedNpc}
        isFriend={selectedNpc ? friendsApi.isFriend(selectedNpc.name) : false}
        accent={theme.accent}
        onClose={() => setSelectedNpc(null)}
        onChat={(npc: any) => {
          showToast({ text: `${npc.name}: ${npcChatLineFor(npc.personality)}`, icon: '💬' });
          setSelectedNpc(null);
        }}
        onFriendToggle={(npc: any) => {
          if (friendsApi.isFriend(npc.name)) {
            friendsApi.removeFriend(npc.name);
            showToast({ text: `${npc.name} removed from friends`, icon: '○' });
          } else {
            friendsApi.addFriend(npc.name);
            showToast({ text: `you and ${npc.name} are friends now ♡`, icon: '✦' });
          }
        }}
      />
    </div>
  );
}

// ── reusable decor helpers ──────────────────────────────────────

function buildArcadeCabinet(x: number, z: number, rotY: number, color: number, screenColor: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.9, 0.7),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  body.position.y = 0.95; body.castShadow = true; g.add(body);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.18, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2D2A4A, roughness: 0.6 })
  );
  top.position.y = 2.0; g.add(top);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.55),
    new THREE.MeshStandardMaterial({ color: screenColor, emissive: screenColor, emissiveIntensity: 0.9 })
  );
  screen.position.set(0, 1.45, 0.36); g.add(screen);
  // control panel
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.15, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x1A1A2E })
  );
  panel.position.set(0, 1.05, 0.35); panel.rotation.x = -0.3; g.add(panel);
  // joystick
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8),
    new THREE.MeshStandardMaterial({ color: 0x3D2418 })
  );
  stick.position.set(-0.2, 1.18, 0.32); g.add(stick);
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xFF8B7A })
  );
  knob.position.set(-0.2, 1.27, 0.32); g.add(knob);
  // buttons
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.04, 14),
      new THREE.MeshStandardMaterial({ color: [0xFFD66B, 0x6EE7FF, 0xE895B5][i] })
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.05 + i * 0.13, 1.2, 0.32);
    g.add(btn);
  }
  return { group: g, screen };
}

function buildClawMachine(x: number, z: number, rotY: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.9, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xFF8B7A, roughness: 0.55 })
  );
  base.position.y = 0.45; base.castShadow = true; g.add(base);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.4, 0.95),
    new THREE.MeshStandardMaterial({ color: 0xBCE3F2, transparent: true, opacity: 0.32, roughness: 0.1 })
  );
  glass.position.y = 1.6; g.add(glass);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.22, 1.15),
    new THREE.MeshStandardMaterial({ color: 0xE895B5 })
  );
  top.position.y = 2.4; g.add(top);
  // plush stuffed inside
  const colors = [0xFFC9B5, 0xC9B5FF, 0xA8E6CF, 0xF5C56B, 0xE895B5];
  for (let i = 0; i < 6; i++) {
    const plush = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 10),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.7 })
    );
    plush.position.set((Math.random() - 0.5) * 0.7, 0.95 + Math.random() * 0.1, (Math.random() - 0.5) * 0.6);
    g.add(plush);
  }
  return g;
}

function buildPinballTable(x: number, z: number, rotY: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.12, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x6EE7FF, emissive: 0x4FA8E7, emissiveIntensity: 0.4, roughness: 0.4 })
  );
  top.position.y = 0.85; top.rotation.x = -0.08; top.castShadow = true; g.add(top);
  for (const lx of [-0.45, 0.45]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.85, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x2D2A4A })
    );
    for (const lz of [-0.7, 0.7]) {
      const l = leg.clone();
      l.position.set(lx, 0.42, lz);
      g.add(l);
    }
  }
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.7, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xE895B5, emissive: 0xD86F8C, emissiveIntensity: 0.45 })
  );
  back.position.set(0, 1.18, -0.85); g.add(back);
  return g;
}

function buildAirHockey(x: number, z: number, rotY: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.1, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xCDE6F5, emissiveIntensity: 0.3, roughness: 0.3 })
  );
  top.position.y = 0.85; top.castShadow = true; g.add(top);
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.18, 1.15),
    new THREE.MeshStandardMaterial({ color: 0xC77A2E, roughness: 0.6 })
  );
  rim.position.y = 0.93; g.add(rim);
  for (const [lx, lz] of [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]] as Array<[number, number]>) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.85, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x2D2A4A })
    );
    leg.position.set(lx, 0.42, lz); g.add(leg);
  }
  // center line
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.02, 1.0),
    new THREE.MeshStandardMaterial({ color: 0xFF8B7A, emissive: 0xFF8B7A })
  );
  line.position.y = 0.91; g.add(line);
  return g;
}

function buildEasel(x: number, z: number, rotY: number, paintColor: number, accent2: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xB58860, roughness: 0.7 });
  // three legs
  const lA = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 8), woodMat);
  lA.rotation.x = 0.25; lA.position.set(0, 0.85, 0.15); g.add(lA);
  const lB = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 8), woodMat);
  lB.rotation.z = -0.2; lB.position.set(-0.3, 0.85, -0.1); g.add(lB);
  const lC = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 8), woodMat);
  lC.rotation.z = 0.2; lC.position.set(0.3, 0.85, -0.1); g.add(lC);
  // canvas
  const canvas = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.1, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xFFF7EE, roughness: 0.7 })
  );
  canvas.position.set(0, 1.1, -0.05); canvas.castShadow = true; g.add(canvas);
  // painting (simple swatches)
  const splotch1 = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 16),
    new THREE.MeshStandardMaterial({ color: paintColor, roughness: 0.5 })
  );
  splotch1.position.set(-0.2, 1.2, -0.02); g.add(splotch1);
  const splotch2 = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 16),
    new THREE.MeshStandardMaterial({ color: accent2, roughness: 0.5 })
  );
  splotch2.position.set(0.18, 1.05, -0.02); g.add(splotch2);
  return g;
}

function buildPotteryWheel(x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.45, 0.7, 14),
    new THREE.MeshStandardMaterial({ color: 0xB58860, roughness: 0.7 })
  );
  base.position.y = 0.35; base.castShadow = true; g.add(base);
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.04, 18),
    new THREE.MeshStandardMaterial({ color: 0x3D2418 })
  );
  wheel.position.y = 0.72; g.add(wheel);
  const clay = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.32, 14),
    new THREE.MeshStandardMaterial({ color: 0xC77A2E, roughness: 0.55 })
  );
  clay.position.y = 0.88; clay.castShadow = true; g.add(clay);
  return { group: g, wheel, clay };
}

function buildStage(x: number, z: number, w: number, d: number, color: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.4, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  platform.position.y = 0.2; platform.castShadow = true; platform.receiveShadow = true;
  g.add(platform);
  // step
  const step = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.5, 0.2, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xC77A2E, roughness: 0.7 })
  );
  step.position.set(0, 0.1, d / 2 + 0.2); g.add(step);
  return g;
}

function buildCurtain(x: number, z: number, w: number, h: number, color: number, side: 'L' | 'R') {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const fold = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.15),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  fold.position.y = h / 2; fold.castShadow = true; g.add(fold);
  // ruffles
  for (let i = 0; i < 4; i++) {
    const ruffleX = side === 'L' ? -w / 2 + 0.12 + i * (w / 4 - 0.05) : w / 2 - 0.12 - i * (w / 4 - 0.05);
    const ruffle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, h, 8, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    );
    ruffle.position.set(ruffleX, h / 2, 0.08); g.add(ruffle);
  }
  return g;
}

function buildSpotlight(x: number, y: number, z: number, target: THREE.Vector3, scene: THREE.Scene) {
  const housing = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.45, 12),
    new THREE.MeshStandardMaterial({ color: 0x3D2418 })
  );
  housing.position.set(x, y, z);
  housing.lookAt(target);
  housing.rotateX(Math.PI / 2);
  scene.add(housing);
  // cone of light visualization
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 4.5, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xFFEDD5, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  beam.position.set((x + target.x) / 2, (y + target.y) / 2, (z + target.z) / 2);
  beam.lookAt(target);
  beam.rotateX(Math.PI / 2);
  scene.add(beam);
  // light source
  const sp = new THREE.SpotLight(0xFFEDD5, 1.4, 20, Math.PI / 5, 0.45, 1.2);
  sp.position.set(x, y, z);
  sp.target.position.copy(target);
  scene.add(sp);
  scene.add(sp.target);
  return { housing, beam };
}

function buildAudienceBench(x: number, z: number, rotY: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xD86F8C, roughness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xB58860 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.6), seatMat);
  seat.position.y = 0.45; seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 0.08), seatMat);
  back.position.set(0, 0.78, -0.26); g.add(back);
  for (const lx of [-1.4, 0, 1.4]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.6), woodMat);
    leg.position.set(lx, 0.22, 0); g.add(leg);
  }
  return g;
}

function buildGardenPlot(x: number, z: number, plantColors: number[]) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xB58860, roughness: 0.8 })
  );
  box.position.y = 0.2; box.castShadow = true; box.receiveShadow = true; g.add(box);
  // soil top
  const soil = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.05, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x5C3B1F, roughness: 0.95 })
  );
  soil.position.y = 0.42; g.add(soil);
  // plants
  for (let i = 0; i < 6; i++) {
    const px = -0.7 + (i % 3) * 0.7;
    const pz = -0.35 + Math.floor(i / 3) * 0.7;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x5D8C5A })
    );
    stem.position.set(px, 0.6, pz); stem.castShadow = true; g.add(stem);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 10),
      new THREE.MeshStandardMaterial({ color: plantColors[i % plantColors.length], roughness: 0.55 })
    );
    head.position.set(px, 0.83, pz); head.castShadow = true; g.add(head);
  }
  return g;
}

function buildGreenhouse(x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xCDE6F5, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.0,
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
  const w = 4, h = 2.4, d = 3.2;
  // walls
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), glassMat);
  back.position.set(0, h / 2, -d / 2); g.add(back);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, d), glassMat);
  left.position.set(-w / 2, h / 2, 0); g.add(left);
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, d), glassMat);
  right.position.set(w / 2, h / 2, 0); g.add(right);
  // peaked roof (two slanted planes)
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.05, d / 1.5), glassMat);
  roofL.position.set(-w / 4, h + 0.4, 0); roofL.rotation.z = 0.4; g.add(roofL);
  const roofR = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.05, d / 1.5), glassMat);
  roofR.position.set(w / 4, h + 0.4, 0); roofR.rotation.z = -0.4; g.add(roofR);
  // frame edges
  for (const [fx, fy, fz, fw, fh, fd] of [
    [0, 0, -d / 2, w + 0.05, 0.06, 0.06],
    [0, h, -d / 2, w + 0.05, 0.06, 0.06],
    [-w / 2, 0, 0, 0.06, 0.06, d + 0.05],
    [w / 2, 0, 0, 0.06, 0.06, d + 0.05],
    [-w / 2, h, 0, 0.06, 0.06, d + 0.05],
    [w / 2, h, 0, 0.06, 0.06, d + 0.05],
  ] as Array<[number, number, number, number, number, number]>) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), frameMat);
    bar.position.set(fx, fy, fz); g.add(bar);
  }
  // plants inside
  for (let i = 0; i < 6; i++) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.3, 10),
      new THREE.MeshStandardMaterial({ color: 0xE76F51, roughness: 0.6 })
    );
    pot.position.set(-1.3 + (i % 3) * 1.3, 0.15, -0.7 + Math.floor(i / 3) * 1.4);
    pot.castShadow = true; g.add(pot);
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x8DECC2, roughness: 0.5 })
    );
    leaves.position.copy(pot.position); leaves.position.y += 0.4;
    leaves.castShadow = true; g.add(leaves);
  }
  return g;
}

function buildWell(x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xCDC4B8, roughness: 0.85 });
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.8, 0.6, 18),
    stoneMat
  );
  ring.position.y = 0.3; ring.castShadow = true; g.add(ring);
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0xBCE3F2, emissive: 0xCDE6F5, emissiveIntensity: 0.3 })
  );
  water.position.y = 0.55; g.add(water);
  // roof posts
  for (const lx of [-0.6, 0.6]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8),
      new THREE.MeshStandardMaterial({ color: 0xB58860 })
    );
    post.position.set(lx, 1.4, 0); post.castShadow = true; g.add(post);
  }
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.0, 0.7, 4),
    new THREE.MeshStandardMaterial({ color: 0xE76F51, roughness: 0.65 })
  );
  roof.position.y = 2.4; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
  return g;
}

function buildMarketStall(x: number, z: number, rotY: number, awning: number, goodsColors: number[]) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rotY;
  // counter
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.95, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xB58860, roughness: 0.7 })
  );
  counter.position.y = 0.475; counter.castShadow = true; counter.receiveShadow = true; g.add(counter);
  // top of counter
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.08, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xFFF7EE, roughness: 0.55 })
  );
  top.position.y = 1.0; g.add(top);
  // poles
  for (const [px, pz] of [[-1.0, -0.45], [1.0, -0.45], [-1.0, 0.45], [1.0, 0.45]] as Array<[number, number]>) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
    );
    pole.position.set(px, 1.2, pz); pole.castShadow = true; g.add(pole);
  }
  // awning (striped)
  const awn = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.12, 1.1),
    new THREE.MeshStandardMaterial({ color: awning, roughness: 0.55 })
  );
  awn.position.y = 2.4; awn.rotation.x = -0.15; awn.castShadow = true; g.add(awn);
  // stripes
  for (let i = -2; i <= 2; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.13, 1.11),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })
    );
    stripe.position.set(i * 0.46, 2.4, 0);
    stripe.rotation.x = -0.15;
    g.add(stripe);
  }
  // goods on the counter
  for (let i = 0; i < 5; i++) {
    const sz = 0.16 + Math.random() * 0.08;
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(sz, sz, sz),
      new THREE.MeshStandardMaterial({ color: goodsColors[i % goodsColors.length], roughness: 0.55 })
    );
    item.position.set(-0.9 + i * 0.4, 1.06 + sz / 2, 0);
    item.castShadow = true; g.add(item);
  }
  // hanging sign
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.32, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xFFF7EE, roughness: 0.55 })
  );
  sign.position.set(0, 1.95, 0.6); g.add(sign);
  return g;
}

// ── theme: ARCADE ──────────────────────────────────────────────

const arcadeTheme: SubworldTheme = {
  title: 'Arcade',
  subtitle: 'tiny games · big feelings',
  accent: '#FF8B7A',
  dotColor: '#FF8B7A',
  fog: 0x4A2C5C,
  hemi: { sky: 0xFFB3E1, ground: 0x4A2C5C, intensity: 0.85 },
  sun: { color: 0xFFC9B5, intensity: 0.6 },
  rim: { color: 0x6EE7FF, intensity: 0.55, pos: [-8, 6, -10] },
  ground: { color: 0x2D2A4A, radius: 18 },
  surround: 0x191728,
  perimeterTrees: false,
  clouds: 4,
  playerSpawn: [0, 0, 12],
  playerYaw: Math.PI,
  walkBounds: 16,
  populate(scene, refs) {
    // floor grid pattern (cream lines)
    for (let i = -16; i <= 16; i += 4) {
      const linePh = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xFF8B7A, emissive: 0xFF8B7A, emissiveIntensity: 0.45, transparent: true, opacity: 0.7 })
      );
      linePh.rotation.x = -Math.PI / 2;
      linePh.position.set(0, 0.01, i);
      scene.add(linePh);
      const lineVer = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 32),
        new THREE.MeshStandardMaterial({ color: 0x6EE7FF, emissive: 0x6EE7FF, emissiveIntensity: 0.4, transparent: true, opacity: 0.6 })
      );
      lineVer.rotation.x = -Math.PI / 2;
      lineVer.position.set(i, 0.01, 0);
      scene.add(lineVer);
    }
    // cabinets — two rows of 4
    const cabPositions: Array<[number, number, number, number, number]> = [
      // x, z, rotY, body color, screen color
      [-6.5, -2,  Math.PI, 0xFF8B7A, 0x6EE7FF],
      [-2.2, -2,  Math.PI, 0xE895B5, 0xFFD66B],
      [ 2.2, -2,  Math.PI, 0xC9B5FF, 0x8DECC2],
      [ 6.5, -2,  Math.PI, 0x6EE7FF, 0xFF8B7A],
      [-6.5, -6,  Math.PI, 0xFFD66B, 0xE895B5],
      [-2.2, -6,  Math.PI, 0x8DECC2, 0xC9B5FF],
      [ 2.2, -6,  Math.PI, 0xFFC9B5, 0x6EE7FF],
      [ 6.5, -6,  Math.PI, 0xD86F8C, 0xFFD66B],
    ];
    refs.extras.cabinetScreens = [];
    for (const [x, z, rot, c1, c2] of cabPositions) {
      const cab = buildArcadeCabinet(x, z, rot, c1, c2);
      scene.add(cab.group);
      refs.extras.cabinetScreens.push(cab.screen);
    }
    // pinball table on the right
    scene.add(buildPinballTable(8, 4, Math.PI));
    // claw machine on the left
    scene.add(buildClawMachine(-8, 4, Math.PI / 2));
    // air hockey center
    scene.add(buildAirHockey(0, 6, 0));
    // neon string lights overhead
    refs.extras.lights = [];
    const arcConfigs: Array<[number, number, number, number]> = [
      [-15, -10, 15, -10],
      [-15,  8,  15,  8],
      [-15, -10, -15, 8],
      [ 15, -10,  15, 8],
    ];
    for (const [x1, z1, x2, z2] of arcConfigs) {
      const arc = buildStringLightArc(x1, z1, x2, z2, 5.0, 16);
      scene.add(arc.group);
      refs.extras.lights.push(...arc.lights);
    }
    // ambient glow point lights
    for (const [px, py, pz, col] of [
      [-7, 4, 5, 0x6EE7FF],
      [ 7, 4, 5, 0xFF8B7A],
      [ 0, 4, -7, 0xE895B5],
    ] as Array<[number, number, number, number]>) {
      const pl = new THREE.PointLight(col, 0.8, 12);
      pl.position.set(px, py, pz);
      scene.add(pl);
    }
    // back wall (low) for a "we're inside" feeling
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(28, 4.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x3D2658, roughness: 0.8 })
    );
    wall.position.set(0, 2.25, -10);
    scene.add(wall);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 1.1),
      new THREE.MeshBasicMaterial({ map: makeBannerTexture('ARCADE', '#FF8B7A'), side: THREE.DoubleSide })
    );
    sign.position.set(0, 3.6, -9.78);
    scene.add(sign);
  },
  npcs: [
    { pos: [-6.5, -1.0], yaw: 0 },          // near cabinet
    { pos: [ 2.2, -1.0], yaw: 0 },
    { pos: [ 6.5, -5.0], yaw: 0 },
    { pos: [-8.0,  5.0], yaw: 0, wanderRadius: 2 },
    { pos: [ 0.0,  8.5], yaw: Math.PI, wanderRadius: 3 },
  ],
  interactables: [
    { id: 'subway', pos: [-6.5, -1.0], label: 'Subway Surfer', icon: '🚇', radius: 2.0 },
    { id: 'farm',   pos: [-2.2, -1.0], label: 'Hay Day',       icon: '🌾', radius: 2.0 },
    { id: 'crew',   pos: [ 2.2, -1.0], label: 'Among Us',      icon: '🚀', radius: 2.0 },
  ],
  update(now, dt, refs) {
    const t = now * 0.001;
    // pulse cabinet screens
    for (let i = 0; i < refs.extras.cabinetScreens.length; i++) {
      const s = refs.extras.cabinetScreens[i];
      (s.material as any).emissiveIntensity = 0.7 + Math.sin(t * 3 + i * 0.8) * 0.2;
    }
    // string lights twinkle
    if (refs.extras.lights) {
      for (let i = 0; i < refs.extras.lights.length; i++) {
        (refs.extras.lights[i].material as any).emissiveIntensity = 0.6 + Math.sin(t * 2 + i * 0.7) * 0.3;
      }
    }
  },
};

function Arcade({ config, onBack }: any) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const exit = () => setActiveGame(null);
  return (
    <>
      <Subworld config={config} onBack={onBack} theme={arcadeTheme}
                onInteract={(id: string) => setActiveGame(id)} />
      {activeGame === 'subway' && <SubwaySurferGame onExit={exit} />}
      {activeGame === 'farm'   && <HayDayGame onExit={exit} />}
      {activeGame === 'crew'   && <AmongUsGame onExit={exit} />}
    </>
  );
}

// ── arcade mini-games (2D canvas) ───────────────────────────────

function ArcadeShell({ title, accent, bg, children, onExit, statusLeft, statusRight }: any) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: bg || '#0E1230' }}>
      <div className="flex items-center justify-between px-6 py-3" style={{
        background: 'rgba(0,0,0,0.35)',
        borderBottom: `2px solid ${accent}`,
      }}>
        <button onClick={onExit} className="font-cute font-bold text-xs px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: `2px solid ${accent}`,
            color: accent,
            borderRadius: 9999, letterSpacing: '0.18em', cursor: 'pointer',
          }}>
          ◀ EXIT
        </button>
        <div className="font-cute text-sm font-bold" style={{
          color: accent, letterSpacing: '0.22em',
        }}>
          {title}
        </div>
        <div className="flex items-center gap-3">
          {statusLeft && <div className="font-cute text-xs font-bold px-3 py-1.5"
            style={{ background: 'rgba(0,0,0,0.45)', border: `1.5px solid ${accent}`, color: '#fff', borderRadius: 9999 }}>
            {statusLeft}
          </div>}
          {statusRight && <div className="font-cute text-xs font-bold px-3 py-1.5"
            style={{ background: 'rgba(0,0,0,0.45)', border: `1.5px solid ${accent}`, color: '#fff', borderRadius: 9999 }}>
            {statusRight}
          </div>}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── 1) SUBWAY SURFER — 3-lane endless runner ─────────────────

function SubwaySurferGame({ onExit }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hud, setHud] = useState({ score: 0, coins: 0, best: 0, gameOver: false });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = canvas.clientWidth, H = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const LANES = [-1, 0, 1];
    const game = {
      lane: 1, // 0,1,2
      laneX: 0, // smooth interpolation
      y: 0, vy: 0, onGround: true, sliding: 0,
      speed: 280, // px/sec the world scrolls toward player
      score: 0, coins: 0,
      obstacles: [] as Array<{ z: number; lane: number; kind: 'box'|'low'|'train' }>,
      pickups: [] as Array<{ z: number; lane: number }>,
      spawnAccum: 0,
      pickupAccum: 0,
      timeAlive: 0,
      gameOver: false,
      best: Number(localStorage.getItem('wee.subway.best') || '0'),
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (game.gameOver) {
        if (k === ' ' || k === 'enter') reset();
        if (k === 'escape') onExit();
        return;
      }
      if (k === 'a' || k === 'arrowleft')  game.lane = Math.max(0, game.lane - 1);
      if (k === 'd' || k === 'arrowright') game.lane = Math.min(2, game.lane + 1);
      if ((k === 'w' || k === 'arrowup' || k === ' ') && game.onGround) {
        game.vy = -520; game.onGround = false;
      }
      if ((k === 's' || k === 'arrowdown') && game.onGround) game.sliding = 0.6;
      if (k === 'escape') onExit();
    };
    window.addEventListener('keydown', onKey);

    let touchStartX = 0, touchStartY = 0;
    const ts = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX, dy = t.clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) game.lane = Math.min(2, game.lane + 1);
        else if (dx < -30) game.lane = Math.max(0, game.lane - 1);
      } else {
        if (dy < -30 && game.onGround) { game.vy = -520; game.onGround = false; }
        else if (dy > 30 && game.onGround) game.sliding = 0.6;
      }
    };
    canvas.addEventListener('touchstart', ts, { passive: true });
    canvas.addEventListener('touchend', te);

    function reset() {
      game.lane = 1; game.laneX = 0;
      game.y = 0; game.vy = 0; game.onGround = true; game.sliding = 0;
      game.speed = 280;
      game.score = 0; game.coins = 0;
      game.obstacles = []; game.pickups = [];
      game.spawnAccum = 0; game.pickupAccum = 0;
      game.timeAlive = 0;
      game.gameOver = false;
      setHud({ score: 0, coins: 0, best: game.best, gameOver: false });
    }

    // perspective projection helper
    const horizonRatio = 0.35;
    function project(zWorld: number, laneIdx: number, yOffset: number = 0) {
      // zWorld: 0 = at player, larger = farther away (in front)
      // Returns screen { x, y, scale }
      const horizon = H * horizonRatio;
      const dz = Math.max(0.5, zWorld);
      const scale = Math.min(1.6, 1 / (dz / 6 + 0.3));
      const sy = horizon + (H - horizon) * (1 - 1 / (dz / 6 + 1));
      // lane offset: lane 0 = left, 2 = right, narrows with distance
      const laneSpread = (W * 0.42) * scale;
      const sx = W / 2 + (laneIdx - 1) * laneSpread - yOffset * 0;
      return { x: sx, y: sy - yOffset * scale, scale };
    }

    let frameId = 0;
    let lastT = performance.now();
    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      if (!game.gameOver) {
        game.timeAlive += dt;
        game.speed = 280 + Math.min(380, game.timeAlive * 12);
        game.score = Math.floor(game.timeAlive * 10 + game.coins * 5);

        // smooth lane interpolation
        game.laneX += (game.lane - game.laneX) * Math.min(1, dt * 14);

        // jump physics
        if (!game.onGround) {
          game.vy += 1450 * dt;
          game.y += game.vy * dt;
          if (game.y >= 0) { game.y = 0; game.vy = 0; game.onGround = true; }
        }
        if (game.sliding > 0) game.sliding = Math.max(0, game.sliding - dt);

        // scroll obstacles toward player
        const scrollDz = game.speed * dt / 60;
        for (const o of game.obstacles) o.z -= scrollDz;
        for (const p of game.pickups) p.z -= scrollDz;
        game.obstacles = game.obstacles.filter(o => o.z > -1);
        game.pickups = game.pickups.filter(p => p.z > -1);

        // spawn obstacles
        game.spawnAccum += dt;
        const spawnInterval = Math.max(0.55, 1.4 - game.timeAlive * 0.012);
        if (game.spawnAccum > spawnInterval) {
          game.spawnAccum = 0;
          const kinds: Array<'box'|'low'|'train'> = ['box', 'low', 'train'];
          const lane = Math.floor(Math.random() * 3);
          const kind = kinds[Math.floor(Math.random() * kinds.length)];
          game.obstacles.push({ z: 18, lane, kind });
        }
        // spawn pickups
        game.pickupAccum += dt;
        if (game.pickupAccum > 0.5) {
          game.pickupAccum = 0;
          if (Math.random() < 0.55) {
            game.pickups.push({ z: 18, lane: Math.floor(Math.random() * 3) });
          }
        }

        // collisions
        for (const o of game.obstacles) {
          if (o.z < 0.6 && o.z > -0.2 && o.lane === game.lane) {
            const safe =
              (o.kind === 'low' && game.sliding > 0) ||      // slide under low
              (o.kind === 'box' && !game.onGround && game.y < -50); // jump over short box
            if (!safe) {
              game.gameOver = true;
              if (game.score > game.best) {
                game.best = game.score;
                localStorage.setItem('wee.subway.best', String(game.best));
              }
            }
          }
        }
        for (let i = game.pickups.length - 1; i >= 0; i--) {
          const p = game.pickups[i];
          if (p.z < 0.6 && p.z > -0.2 && p.lane === game.lane) {
            if (game.onGround || (game.onGround === false && game.y > -60)) {
              game.coins += 1;
              game.pickups.splice(i, 1);
            }
          }
        }
        setHud({ score: game.score, coins: game.coins, best: game.best, gameOver: game.gameOver });
      }

      // ── render ──
      // sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#3A2660');
      sky.addColorStop(0.55, '#5D3A8C');
      sky.addColorStop(1, '#FFB3E1');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // ground
      const horizon = H * horizonRatio;
      ctx.fillStyle = '#2A2540';
      ctx.fillRect(0, horizon, W, H - horizon);

      // tracks — perspective lines
      for (let lane = 0; lane < 3; lane++) {
        ctx.beginPath();
        ctx.strokeStyle = lane === game.lane ? '#FFD66B' : 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        const near = project(0.4, lane);
        const far = project(20, lane);
        ctx.moveTo(near.x, H);
        ctx.lineTo(far.x, horizon + 4);
        ctx.stroke();
      }
      // perspective rungs
      for (let z = 1; z < 20; z += 1.2) {
        const off = (now * 0.001 * game.speed * 0.012) % 1.2;
        const zz = z + off;
        const left = project(zz, 0);
        const right = project(zz, 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left.x - 30 * left.scale, left.y);
        ctx.lineTo(right.x + 30 * right.scale, right.y);
        ctx.stroke();
      }

      // draw obstacles + pickups (far → near)
      const drawables = [
        ...game.obstacles.map(o => ({ z: o.z, draw: () => drawObstacle(o) })),
        ...game.pickups.map(p => ({ z: p.z, draw: () => drawPickup(p) })),
      ].sort((a, b) => b.z - a.z);
      for (const d of drawables) d.draw();

      // player avatar (always front)
      drawPlayer();

      // HUD on canvas (extras)
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 14px "Fredoka", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('← → switch lane · ↑ jump · ↓ slide · ESC exit', 12, H - 14);

      if (game.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#FF8B7A';
        ctx.font = 'bold 56px "Fraunces", serif';
        ctx.textAlign = 'center';
        ctx.fillText('CRASH', W / 2, H / 2 - 30);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px "Fredoka", sans-serif';
        ctx.fillText(`score ${game.score}  ·  coins ${game.coins}  ·  best ${game.best}`, W / 2, H / 2 + 10);
        ctx.fillStyle = '#FFD66B';
        ctx.font = 'bold 18px "Fredoka", sans-serif';
        ctx.fillText('SPACE to restart  ·  ESC to exit', W / 2, H / 2 + 50);
      }

      frameId = requestAnimationFrame(render);
    };

    function drawObstacle(o: any) {
      const p = project(o.z, o.lane);
      const w = 90 * p.scale;
      const h = (o.kind === 'low' ? 38 : o.kind === 'train' ? 130 : 75) * p.scale;
      const y = p.y - h;
      const colors: Record<string, string> = { box: '#E89B6E', low: '#6EE7FF', train: '#D86F8C' };
      ctx.fillStyle = colors[o.kind];
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 * p.scale;
      ctx.fillRect(p.x - w / 2, y, w, h);
      ctx.strokeRect(p.x - w / 2, y, w, h);
      // stripe
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(p.x - w / 2, y + h * 0.45, w, 6 * p.scale);
      if (o.kind === 'train') {
        ctx.fillStyle = '#FFD66B';
        ctx.fillRect(p.x - w * 0.35, y + 10, w * 0.7, 16 * p.scale);
      }
    }

    function drawPickup(c: any) {
      const p = project(c.z, c.lane);
      const r = 12 * p.scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 30 * p.scale, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD66B';
      ctx.fill();
      ctx.strokeStyle = '#C77A2E';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#C77A2E';
      ctx.font = `bold ${Math.round(14 * p.scale)}px "Fraunces", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', p.x, p.y - 30 * p.scale + 1);
    }

    function drawPlayer() {
      const p = project(0.4, game.laneX);
      const baseY = p.y;
      const w = 80, h = 110;
      const sx = p.x - w / 2;
      const sy = baseY - h + game.y - (game.sliding > 0 ? 30 : 0);
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(p.x, baseY + 4, 38, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      ctx.fillStyle = '#FFB39E';
      ctx.fillRect(sx + 15, sy + 30, w - 30, h - 50);
      // head
      ctx.fillStyle = '#FFD9B5';
      ctx.beginPath();
      ctx.arc(p.x, sy + 22, 22, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = '#3D2418';
      ctx.beginPath(); ctx.arc(p.x - 7, sy + 22, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x + 7, sy + 22, 3, 0, Math.PI * 2); ctx.fill();
      // legs swing
      const swing = Math.sin(performance.now() * 0.015) * 8;
      ctx.fillStyle = '#3D2658';
      ctx.fillRect(sx + 20, sy + h - 20, 14, 20 + swing);
      ctx.fillRect(sx + w - 34, sy + h - 20, 14, 20 - swing);
    }

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', ts);
      canvas.removeEventListener('touchend', te);
    };
  }, []);

  return (
    <ArcadeShell title="🚇 SUBWAY SURFER" accent="#FF8B7A" bg="#1A1230"
      onExit={onExit}
      statusLeft={<span>SCORE <b style={{color:'#FFD66B'}}>{hud.score}</b></span>}
      statusRight={<span>COINS <b style={{color:'#FFD66B'}}>{hud.coins}</b></span>}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </ArcadeShell>
  );
}

// ─── 2) HAY DAY — grid-based farm economy ─────────────────────

type Crop = { id: string; name: string; icon: string; cost: number; sell: number; grow: number; color: string };
const HAYDAY_CROPS: Crop[] = [
  { id: 'wheat',  name: 'Wheat',  icon: '🌾', cost: 5,  sell: 12, grow: 4,  color: '#FFD66B' },
  { id: 'corn',   name: 'Corn',   icon: '🌽', cost: 10, sell: 28, grow: 9,  color: '#FFC56E' },
  { id: 'carrot', name: 'Carrot', icon: '🥕', cost: 15, sell: 45, grow: 15, color: '#FF8B5A' },
  { id: 'berry',  name: 'Berry',  icon: '🫐', cost: 25, sell: 80, grow: 24, color: '#8B7AB8' },
];

function HayDayGame({ onExit }: any) {
  const ROWS = 4, COLS = 5;
  type Plot = { crop: Crop | null; plantedAt: number; ready: boolean };
  const makeEmpty = (): Plot[][] => Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ crop: null, plantedAt: 0, ready: false })));

  const [coins, setCoins] = useState<number>(() => Number(localStorage.getItem('wee.farm.coins') || '100'));
  const [selectedCrop, setSelectedCrop] = useState<Crop>(HAYDAY_CROPS[0]);
  const [plots, setPlots] = useState<Plot[][]>(makeEmpty);
  const [, tick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setPlots(prev => {
        let changed = false;
        const next = prev.map(row => row.map(p => {
          if (p.crop && !p.ready && (now - p.plantedAt) >= p.crop.grow * 1000) {
            changed = true;
            return { ...p, ready: true };
          }
          return p;
        }));
        return changed ? next : prev;
      });
      tick(t => (t + 1) % 1000);
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => { localStorage.setItem('wee.farm.coins', String(coins)); }, [coins]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= HAYDAY_CROPS.length) setSelectedCrop(HAYDAY_CROPS[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  const onPlotClick = (r: number, c: number) => {
    setPlots(prev => {
      const next = prev.map(row => row.slice());
      const p = next[r][c];
      if (!p.crop) {
        if (coins < selectedCrop.cost) return prev;
        setCoins(x => x - selectedCrop.cost);
        next[r][c] = { crop: selectedCrop, plantedAt: Date.now(), ready: false };
      } else if (p.ready) {
        setCoins(x => x + p.crop!.sell);
        next[r][c] = { crop: null, plantedAt: 0, ready: false };
      }
      return next;
    });
  };

  const progressOf = (p: Plot) => {
    if (!p.crop) return 0;
    if (p.ready) return 1;
    return Math.min(1, (Date.now() - p.plantedAt) / (p.crop.grow * 1000));
  };

  return (
    <ArcadeShell title="🌾 HAY DAY" accent="#A8E6CF" bg="#3A6B3A"
      onExit={onExit}
      statusLeft={<span>COINS <b style={{color:'#FFD66B'}}>{coins}</b></span>}
      statusRight={<span>HELD <b style={{color:'#FFD66B'}}>{selectedCrop.icon} {selectedCrop.name}</b></span>}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <div className="grid gap-2 mb-6" style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          width: 'min(720px, 96%)',
        }}>
          {plots.map((row, r) => row.map((p, c) => {
            const pr = progressOf(p);
            const canAfford = !p.crop ? coins >= selectedCrop.cost : true;
            return (
              <button key={`${r}-${c}`} onClick={() => onPlotClick(r, c)}
                className="aspect-square flex items-center justify-center relative transition-all hover:scale-105"
                style={{
                  background: p.crop
                    ? (p.ready ? '#8DECC2' : `linear-gradient(180deg, #B58860 0%, #8B6240 ${(1-pr)*100}%, ${p.crop.color} ${(1-pr)*100}%)`)
                    : (canAfford ? '#7CC07C' : '#5A8C5A'),
                  border: `3px solid ${p.ready ? '#FFD66B' : '#4A6B3A'}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  boxShadow: p.ready ? '0 0 18px rgba(255, 214, 107, 0.6)' : 'inset 0 -6px 0 rgba(0,0,0,0.18)',
                }}>
                {p.crop && (
                  <div style={{ fontSize: p.ready ? 44 : 28, filter: p.ready ? 'none' : 'grayscale(0.4)' }}>
                    {p.crop.icon}
                  </div>
                )}
                {p.crop && !p.ready && (
                  <div className="absolute bottom-1 left-1 right-1 font-cute font-bold text-[10px] text-center"
                       style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {Math.ceil(p.crop.grow * (1 - pr))}s
                  </div>
                )}
                {p.ready && (
                  <div className="absolute top-1 right-1 font-cute font-bold text-[10px] px-1.5 py-0.5"
                       style={{ background: '#FFD66B', color: '#3D2418', borderRadius: 6 }}>
                    +{p.crop!.sell}
                  </div>
                )}
              </button>
            );
          }))}
        </div>

        <div className="flex items-center gap-2">
          {HAYDAY_CROPS.map((c, i) => {
            const isSel = selectedCrop.id === c.id;
            const canBuy = coins >= c.cost;
            return (
              <button key={c.id} onClick={() => setSelectedCrop(c)}
                className="font-cute font-bold px-4 py-3 flex items-center gap-2 transition-all"
                style={{
                  background: isSel ? '#FFF7EE' : 'rgba(255,255,255,0.85)',
                  border: `3px solid ${isSel ? '#FFD66B' : '#fff'}`,
                  borderRadius: 14,
                  opacity: canBuy ? 1 : 0.5,
                  cursor: 'pointer',
                  boxShadow: isSel ? '0 0 14px rgba(255,214,107,0.6)' : 'none',
                }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <div className="text-left">
                  <div className="text-[12px]" style={{ color: '#3D2418' }}>{c.name} <span className="text-[9px] opacity-50">({i+1})</span></div>
                  <div className="text-[10px]" style={{ color: '#8A5A3A' }}>cost {c.cost} · sell {c.sell} · {c.grow}s</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 font-cute text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
          click empty plot to plant · click ready crop to harvest · 1-4 switch crop · ESC exit
        </div>
      </div>
    </ArcadeShell>
  );
}

// ─── 3) AMONG US — top-down crewmate w/ tasks + bot imposter ──

function AmongUsGame({ onExit }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hud, setHud] = useState<{ tasks: number; total: number; status: 'play'|'win'|'lose'; activeTask: string | null }>({
    tasks: 0, total: 4, status: 'play', activeTask: null,
  });
  const [task, setTask] = useState<{ id: string; kind: 'wires' | 'mash' | 'sequence' } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = canvas.clientWidth, H = canvas.clientHeight;
    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // World coords — fixed map 640 x 380
    const MAP_W = 640, MAP_H = 380;
    const rooms = [
      { x: 40,  y: 40,  w: 200, h: 140, name: 'Engine' },
      { x: 280, y: 40,  w: 140, h: 100, name: 'Cafeteria' },
      { x: 460, y: 40,  w: 140, h: 140, name: 'Medbay' },
      { x: 40,  y: 220, w: 180, h: 120, name: 'Storage' },
      { x: 260, y: 200, w: 160, h: 140, name: 'Reactor' },
      { x: 460, y: 220, w: 140, h: 120, name: 'Electric' },
    ];
    const corridors = [
      { x: 240, y: 80,  w: 40,  h: 60 },
      { x: 420, y: 80,  w: 40,  h: 60 },
      { x: 100, y: 180, w: 40,  h: 40 },
      { x: 320, y: 140, w: 40,  h: 60 },
      { x: 500, y: 180, w: 40,  h: 40 },
      { x: 220, y: 260, w: 40,  h: 40 },
      { x: 420, y: 260, w: 40,  h: 40 },
    ];

    function isInsideRoom(x: number, y: number, padding = 8) {
      for (const r of rooms) {
        if (x >= r.x + padding && x <= r.x + r.w - padding && y >= r.y + padding && y <= r.y + r.h - padding) return true;
      }
      for (const c of corridors) {
        if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) return true;
      }
      return false;
    }

    const taskSpots = [
      { id: 'engine',   x: 110, y: 110, kind: 'wires'    as const, done: false },
      { id: 'medbay',   x: 530, y: 110, kind: 'mash'     as const, done: false },
      { id: 'reactor',  x: 340, y: 270, kind: 'sequence' as const, done: false },
      { id: 'electric', x: 530, y: 280, kind: 'wires'    as const, done: false },
    ];

    const player = { x: 340, y: 90, speed: 130 };
    const imposter = { x: 110, y: 290, speed: 78, targetX: 110, targetY: 290 };
    let status: 'play' | 'win' | 'lose' = 'play';
    let activeTaskId: string | null = null;

    const keys: Record<string, boolean> = {};
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (k === 'escape') onExit();
      if (k === 'e' && status === 'play' && activeTaskId == null) {
        const t = taskSpots.find(s => !s.done && Math.hypot(s.x - player.x, s.y - player.y) < 22);
        if (t) {
          activeTaskId = t.id;
          setTask({ id: t.id, kind: t.kind });
          setHud(h => ({ ...h, activeTask: t.id }));
        }
      }
      if (k === ' ' && (status === 'win' || status === 'lose')) {
        // reset
        for (const s of taskSpots) s.done = false;
        player.x = 340; player.y = 90;
        imposter.x = 110; imposter.y = 290;
        status = 'play';
        setHud({ tasks: 0, total: taskSpots.length, status: 'play', activeTask: null });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);

    let frameId = 0;
    let lastT = performance.now();
    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const paused = activeTaskId != null || status !== 'play';

      if (!paused) {
        // player input
        let dx = 0, dy = 0;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
          dx /= len; dy /= len;
          const nx = player.x + dx * player.speed * dt;
          const ny = player.y + dy * player.speed * dt;
          if (isInsideRoom(nx, player.y)) player.x = nx;
          if (isInsideRoom(player.x, ny)) player.y = ny;
        }

        // imposter AI — wander, occasionally chase
        const distToPlayer = Math.hypot(player.x - imposter.x, player.y - imposter.y);
        if (distToPlayer < 140) {
          imposter.targetX = player.x;
          imposter.targetY = player.y;
        } else {
          const dtx = imposter.targetX - imposter.x;
          const dty = imposter.targetY - imposter.y;
          if (Math.hypot(dtx, dty) < 8) {
            // pick a new wander target inside a room
            const r = rooms[Math.floor(Math.random() * rooms.length)];
            imposter.targetX = r.x + 20 + Math.random() * (r.w - 40);
            imposter.targetY = r.y + 20 + Math.random() * (r.h - 40);
          }
        }
        const idx = imposter.targetX - imposter.x;
        const idy = imposter.targetY - imposter.y;
        const il = Math.hypot(idx, idy);
        if (il > 0) {
          const nx = imposter.x + (idx / il) * imposter.speed * dt;
          const ny = imposter.y + (idy / il) * imposter.speed * dt;
          if (isInsideRoom(nx, imposter.y)) imposter.x = nx;
          if (isInsideRoom(imposter.x, ny)) imposter.y = ny;
        }
        if (distToPlayer < 18) {
          status = 'lose';
          setHud(h => ({ ...h, status: 'lose' }));
        }
      }

      // ── render ──
      ctx.fillStyle = '#0A0E1F';
      ctx.fillRect(0, 0, W, H);
      const scale = Math.min(W / MAP_W, H / MAP_H) * 0.92;
      const offX = (W - MAP_W * scale) / 2;
      const offY = (H - MAP_H * scale) / 2;
      ctx.save();
      ctx.translate(offX, offY);
      ctx.scale(scale, scale);

      // rooms + corridors
      ctx.fillStyle = '#23304F';
      for (const r of rooms) ctx.fillRect(r.x, r.y, r.w, r.h);
      for (const c of corridors) ctx.fillRect(c.x, c.y, c.w, c.h);

      ctx.strokeStyle = '#5572AC';
      ctx.lineWidth = 2;
      for (const r of rooms) ctx.strokeRect(r.x, r.y, r.w, r.h);

      // room labels
      ctx.fillStyle = 'rgba(180, 200, 255, 0.45)';
      ctx.font = 'bold 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const r of rooms) ctx.fillText(r.name.toUpperCase(), r.x + r.w / 2, r.y + 14);

      // task spots
      for (const s of taskSpots) {
        const near = Math.hypot(s.x - player.x, s.y - player.y) < 22;
        const pulse = 6 + Math.sin(now * 0.004) * 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 12 + (near && !s.done ? pulse : 0), 0, Math.PI * 2);
        ctx.fillStyle = s.done ? '#7AFF9A' : (near ? '#FFD66B' : '#FFC56E');
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#3D2418';
        ctx.font = 'bold 14px "Fraunces", serif';
        ctx.fillText(s.done ? '✓' : '!', s.x, s.y + 1);
      }

      // imposter (red bean)
      drawCrew(ctx, imposter.x, imposter.y, '#E84545', '#8C2828');
      // player (blue bean)
      drawCrew(ctx, player.x, player.y, '#6EA8FF', '#2A4B8C');

      ctx.restore();

      // overlay messages
      if (status === 'win' || status === 'lose') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = status === 'win' ? '#7AFF9A' : '#FF5A78';
        ctx.font = 'bold 56px "Fraunces", serif';
        ctx.fillText(status === 'win' ? 'VICTORY' : 'SABOTAGED', W / 2, H / 2 - 10);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px "Fredoka", sans-serif';
        ctx.fillText('SPACE to restart  ·  ESC to exit', W / 2, H / 2 + 36);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 12px "Fredoka", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('WASD move · E interact at ! spots · finish all tasks · avoid red imposter · ESC exit', 12, H - 12);

      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    // Bridge: outer React completes a task by calling these
    (canvas as any).__completeTask = (taskId: string, ok: boolean) => {
      const t = taskSpots.find(s => s.id === taskId);
      if (t && ok) {
        t.done = true;
        const done = taskSpots.filter(s => s.done).length;
        setHud(h => ({ ...h, tasks: done, activeTask: null }));
        if (done === taskSpots.length) {
          status = 'win';
          setHud(h => ({ ...h, status: 'win' }));
        }
      } else {
        setHud(h => ({ ...h, activeTask: null }));
      }
      activeTaskId = null;
      setTask(null);
    };

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  function drawCrew(ctx: CanvasRenderingContext2D, x: number, y: number, body: string, shade: string) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x, y + 12, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    // body
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(x - 11, y + 10);
    ctx.bezierCurveTo(x - 13, y - 8, x + 13, y - 8, x + 11, y + 10);
    ctx.lineTo(x + 9, y + 12); ctx.lineTo(x - 9, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shade; ctx.lineWidth = 1.5; ctx.stroke();
    // visor
    ctx.fillStyle = '#A6D8FF';
    ctx.beginPath();
    ctx.ellipse(x + 3, y - 2, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3A5A8C'; ctx.lineWidth = 1; ctx.stroke();
    // backpack
    ctx.fillStyle = shade;
    ctx.fillRect(x - 14, y - 3, 5, 10);
  }

  const completeTask = (ok: boolean) => {
    const c = canvasRef.current as any;
    if (c && c.__completeTask && task) c.__completeTask(task.id, ok);
  };

  return (
    <ArcadeShell title="🚀 AMONG US" accent="#6EE7FF" bg="#06091A"
      onExit={onExit}
      statusLeft={<span>TASKS <b style={{color:'#FFD66B'}}>{hud.tasks}/{hud.total}</b></span>}
      statusRight={<span style={{color:'#FF5A78'}}>⚠ 1 IMPOSTER</span>}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {task && <TaskMiniGame task={task} onDone={completeTask} />}
    </ArcadeShell>
  );
}

function TaskMiniGame({ task, onDone }: any) {
  // Each task kind is a tiny self-contained mini-game.
  if (task.kind === 'wires') return <WiresTask onDone={onDone} />;
  if (task.kind === 'mash')  return <MashTask onDone={onDone} />;
  return <SequenceTask onDone={onDone} />;
}

function WiresTask({ onDone }: any) {
  const colors = useMemo(() => arenaShuffle(['#FF5A78', '#FFD66B', '#7AFF9A', '#6EA8FF']), []);
  const rightOrder = useMemo(() => arenaShuffle(colors.slice()), [colors]);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [drag, setDrag] = useState<{ color: string; sx: number; sy: number; x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (Object.values(connected).filter(Boolean).length === colors.length) {
      const t = setTimeout(() => onDone(true), 400);
      return () => clearTimeout(t);
    }
  }, [connected, colors.length, onDone]);

  const onMove = (e: PointerEvent) => {
    if (!drag || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    setDrag({ ...drag, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const onUp = () => {
    if (!drag || !boxRef.current) { setDrag(null); return; }
    const rect = boxRef.current.getBoundingClientRect();
    // check if dropped on the matching right-side terminal
    const rightIdx = rightOrder.indexOf(drag.color);
    const targetY = 30 + rightIdx * 60;
    if (drag.x > rect.width - 80 && Math.abs(drag.y - targetY) < 32) {
      setConnected(c => ({ ...c, [drag.color]: true }));
    }
    setDrag(null);
  };
  useEffect(() => {
    if (!drag) return;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag]);

  return (
    <TaskShell title="REPAIR WIRES" subtitle="drag colored wires to matching terminals" onCancel={() => onDone(false)}>
      <div ref={boxRef} className="relative" style={{ width: 440, height: 280, background: '#1A1F3A', borderRadius: 16, border: '3px solid #5572AC' }}>
        {colors.map((c, i) => (
          <div key={`L-${c}`} className="absolute" style={{ left: 0, top: 30 + i * 60 - 16, width: 32, height: 32, background: c, borderRadius: 8, cursor: connected[c] ? 'default' : 'grab' }}
            onPointerDown={(e) => {
              if (connected[c] || !boxRef.current) return;
              const rect = boxRef.current.getBoundingClientRect();
              setDrag({ color: c, sx: 16, sy: 30 + i * 60, x: e.clientX - rect.left, y: e.clientY - rect.top });
            }} />
        ))}
        {rightOrder.map((c, i) => (
          <div key={`R-${c}`} className="absolute" style={{ right: 0, top: 30 + i * 60 - 16, width: 32, height: 32, background: 'transparent', border: `4px solid ${c}`, borderRadius: 8 }} />
        ))}
        {/* connected lines */}
        {colors.map((c) => {
          if (!connected[c]) return null;
          const li = colors.indexOf(c);
          const ri = rightOrder.indexOf(c);
          return <svg key={`line-${c}`} className="absolute inset-0" width="100%" height="100%" style={{ pointerEvents: 'none' }}>
            <line x1={32} y1={30 + li * 60} x2={440 - 32} y2={30 + ri * 60} stroke={c} strokeWidth={5} />
          </svg>;
        })}
        {/* drag line */}
        {drag && (
          <svg className="absolute inset-0" width="100%" height="100%" style={{ pointerEvents: 'none' }}>
            <line x1={drag.sx} y1={drag.sy} x2={drag.x} y2={drag.y} stroke={drag.color} strokeWidth={5} />
          </svg>
        )}
      </div>
    </TaskShell>
  );
}

function MashTask({ onDone }: any) {
  const target = 15;
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= target) {
      const t = setTimeout(() => onDone(true), 300);
      return () => clearTimeout(t);
    }
  }, [count, onDone]);
  return (
    <TaskShell title="CALIBRATE PUMP" subtitle={`mash SPACE or click to fill — ${count}/${target}`} onCancel={() => onDone(false)}>
      <button autoFocus onClick={() => setCount(c => c + 1)}
        onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); setCount(c => c + 1); } }}
        className="font-cute font-bold transition-all hover:scale-105"
        style={{
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #FFD66B, #C77A2E)',
          border: '6px solid #FFF7EE',
          color: '#3D2418',
          fontSize: 22, letterSpacing: '0.18em',
          boxShadow: '0 0 32px rgba(255,214,107,0.7)',
          cursor: 'pointer',
        }}>
        MASH
      </button>
      <div className="mt-4 font-cute font-bold" style={{ color: '#FFD66B' }}>
        <div style={{ width: 240, height: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, count / target * 100)}%`, height: '100%', background: '#7AFF9A', transition: 'width 0.1s' }} />
        </div>
      </div>
    </TaskShell>
  );
}

function SequenceTask({ onDone }: any) {
  const sequence = useMemo(() => arenaShuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 6), []);
  const [progress, setProgress] = useState(0);
  const [wrong, setWrong] = useState(-1);
  useEffect(() => {
    if (progress >= sequence.length) {
      const t = setTimeout(() => onDone(true), 300);
      return () => clearTimeout(t);
    }
  }, [progress, sequence.length, onDone]);
  const click = (idx: number) => {
    const expected = sequence[progress];
    if (idx === expected) setProgress(p => p + 1);
    else {
      setWrong(idx);
      setTimeout(() => { setWrong(-1); setProgress(0); }, 400);
    }
  };
  return (
    <TaskShell title="REACTOR SEQUENCE" subtitle={`click cells in order — ${progress}/${sequence.length}`} onCancel={() => onDone(false)}>
      <div className="grid grid-cols-3 gap-2" style={{ width: 280 }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const next = sequence[progress];
          const isNext = i === next && wrong < 0;
          const isWrong = i === wrong;
          const seqIdx = sequence.indexOf(i);
          return (
            <button key={i} onClick={() => click(i)}
              className="aspect-square font-cute font-bold transition-all"
              style={{
                background: isWrong ? '#FF5A78' : isNext ? '#FFD66B' : '#2A3050',
                border: `3px solid ${isWrong ? '#FF5A78' : '#5572AC'}`,
                borderRadius: 12,
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                boxShadow: isNext ? '0 0 16px rgba(255,214,107,0.7)' : 'none',
              }}>
              {seqIdx >= 0 ? seqIdx + 1 : ''}
            </button>
          );
        })}
      </div>
    </TaskShell>
  );
}

function TaskShell({ title, subtitle, onCancel, children }: any) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="flex flex-col items-center p-6" style={{
        background: 'rgba(10, 18, 38, 0.95)',
        border: '3px solid #6EE7FF',
        borderRadius: 20,
        boxShadow: '0 0 40px rgba(110, 231, 255, 0.4)',
      }}>
        <div className="font-cute text-xs font-bold mb-1" style={{ color: '#6EE7FF', letterSpacing: '0.22em' }}>◆ {title} ◆</div>
        <div className="font-cute text-[12px] mb-4" style={{ color: 'rgba(230,248,255,0.7)' }}>{subtitle}</div>
        {children}
        <button onClick={onCancel} className="font-cute font-bold text-[11px] mt-5 px-4 py-2"
          style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)', borderRadius: 9999, cursor: 'pointer', letterSpacing: '0.18em' }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

// ── theme: STUDIO ──────────────────────────────────────────────

const studioTheme: SubworldTheme = {
  title: 'Studio',
  subtitle: 'draw · build · share',
  accent: '#8B7AB8',
  dotColor: '#C9B5FF',
  fog: 0xFFF1E8,
  hemi: { sky: 0xFFF7EE, ground: 0xC9B5FF, intensity: 1.05 },
  sun: { color: 0xFFEDD5, intensity: 0.95 },
  rim: { color: 0xC9B5FF, intensity: 0.4, pos: [-8, 6, -10] },
  ground: { color: 0xFFF7EE, radius: 18 },
  surround: 0xE8E0D2,
  perimeterTrees: { count: 10, colors: [0x9BD9B0, 0xC9B5FF, 0xA8E6CF] },
  clouds: 7,
  playerSpawn: [0, 0, 10],
  playerYaw: Math.PI,
  walkBounds: 16,
  populate(scene, refs) {
    // parquet seams
    for (let i = -16; i <= 16; i += 2) {
      const seam = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xE8DBC0, roughness: 0.7, transparent: true, opacity: 0.5 })
      );
      seam.rotation.x = -Math.PI / 2;
      seam.position.set(0, 0.01, i);
      scene.add(seam);
    }
    // central performance stage (small)
    scene.add(buildStage(0, -7, 4.5, 3.0, 0xC9B5FF));
    // mic stand on stage
    const micPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })
    );
    micPole.position.set(0, 1.1, -7); micPole.castShadow = true; scene.add(micPole);
    const micHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x3D2418, roughness: 0.4 })
    );
    micHead.position.set(0, 1.85, -7); scene.add(micHead);
    // banner above stage
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 0.9),
      new THREE.MeshBasicMaterial({ map: makeBannerTexture('Studio', '#8B7AB8'), side: THREE.DoubleSide })
    );
    banner.position.set(0, 3.4, -8.7);
    scene.add(banner);
    // easels around the room
    const easelData: Array<[number, number, number, number, number]> = [
      [-8, -4, Math.PI / 2, 0xFF8B7A, 0xFFD66B],
      [-8,  0, Math.PI / 2, 0x6EE7FF, 0xFFD9CA],
      [-8,  4, Math.PI / 2, 0xE895B5, 0xC9B5FF],
      [ 8, -4, -Math.PI / 2, 0x8DECC2, 0xFFB39E],
      [ 8,  0, -Math.PI / 2, 0xFFD66B, 0xFF8B7A],
      [ 8,  4, -Math.PI / 2, 0xC9B5FF, 0x6EE7FF],
    ];
    for (const [x, z, rot, c1, c2] of easelData) {
      scene.add(buildEasel(x, z, rot, c1, c2));
    }
    // pottery wheel area
    const wheel = buildPotteryWheel(-4, 6);
    scene.add(wheel.group);
    refs.extras.wheel = wheel;
    // display pedestals with sculptures
    refs.extras.sculptures = [];
    for (let i = 0; i < 3; i++) {
      const px = 3 + i * 1.6;
      const pz = 6;
      const pedestal = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 })
      );
      pedestal.position.set(px, 0.5, pz); pedestal.castShadow = true; scene.add(pedestal);
      const colors = [0xE76F51, 0x8B7AB8, 0x5D8C5A];
      const sculpt = new THREE.Mesh(
        i === 0 ? new THREE.OctahedronGeometry(0.28, 0) :
        i === 1 ? new THREE.TorusKnotGeometry(0.2, 0.07, 64, 8) :
                  new THREE.DodecahedronGeometry(0.28, 0),
        new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.45 })
      );
      sculpt.position.set(px, 1.3, pz); sculpt.castShadow = true;
      scene.add(sculpt);
      refs.extras.sculptures.push(sculpt);
    }
    // colorful rugs
    const rugA = buildRug(-4, 0, 4.0, 4.0, 0xFFD9CA);
    scene.add(rugA);
    const rugB = buildRug(4, 0, 4.0, 4.0, 0xC9B5FF);
    scene.add(rugB);
    // string lights (subtle)
    refs.extras.lights = [];
    const arcConfigs: Array<[number, number, number, number]> = [
      [-12, -10, 12, -10],
      [-12,  10, 12,  10],
    ];
    for (const [x1, z1, x2, z2] of arcConfigs) {
      const arc = buildStringLightArc(x1, z1, x2, z2, 4.5, 14);
      scene.add(arc.group);
      refs.extras.lights.push(...arc.lights);
    }
  },
  npcs: [
    { pos: [-8, -4], yaw: Math.PI / 2 },
    { pos: [-8,  0], yaw: Math.PI / 2 },
    { pos: [ 8,  4], yaw: -Math.PI / 2 },
    { pos: [-3,  6], yaw: 0, wanderRadius: 1 },
    { pos: [ 0, -7], yaw: 0, seated: 'cheer' },
    { pos: [ 4,  3], yaw: Math.PI, wanderRadius: 3 },
  ],
  update(now, dt, refs) {
    const t = now * 0.001;
    if (refs.extras.wheel) refs.extras.wheel.wheel.rotation.y += dt * 2;
    if (refs.extras.sculptures) {
      for (let i = 0; i < refs.extras.sculptures.length; i++) {
        refs.extras.sculptures[i].rotation.y = t * (0.4 + i * 0.2);
      }
    }
    if (refs.extras.lights) {
      for (let i = 0; i < refs.extras.lights.length; i++) {
        (refs.extras.lights[i].material as any).emissiveIntensity = 0.6 + Math.sin(t * 1.5 + i * 0.6) * 0.25;
      }
    }
  },
};

function Studio({ config, onBack }: any) {
  return <Subworld config={config} onBack={onBack} theme={studioTheme} />;
}

// ── theme: GARDEN ──────────────────────────────────────────────

const gardenTheme: SubworldTheme = {
  title: 'Garden',
  subtitle: 'tend · grow · breathe',
  accent: '#5D8C5A',
  dotColor: '#8DECC2',
  fog: 0xCDEFD0,
  hemi: { sky: 0xFFF1E8, ground: 0xC4ECC8, intensity: 1.1 },
  sun: { color: 0xFFEDD5, intensity: 1.0 },
  rim: { color: 0xCDE6F5, intensity: 0.35, pos: [-8, 6, -10] },
  ground: { color: 0xC4ECC8, radius: 18 },
  surround: 0x9BD9B0,
  perimeterTrees: { count: 14, colors: [0x8DECC2, 0xA8E6CF, 0x9BD9B0] },
  clouds: 8,
  playerSpawn: [0, 0, 10],
  playerYaw: Math.PI,
  walkBounds: 16,
  populate(scene, refs) {
    // cobblestone path (cream rectangles in a cross)
    for (let i = -14; i <= 14; i += 2) {
      const stone1 = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xFFE9D9, roughness: 0.85 })
      );
      stone1.rotation.x = -Math.PI / 2;
      stone1.position.set(0, 0.01, i);
      scene.add(stone1);
      const stone2 = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xFFE9D9, roughness: 0.85 })
      );
      stone2.rotation.x = -Math.PI / 2;
      stone2.position.set(i, 0.01, 0);
      scene.add(stone2);
    }
    // garden plots
    const plotData: Array<[number, number, number[]]> = [
      [-7, -6, [0xE76F51, 0xFFD66B, 0xE895B5]],
      [-7,  2, [0xC9B5FF, 0xFFD9CA, 0xE895B5]],
      [ 7, -6, [0xFFD66B, 0xE76F51, 0xFFB39E]],
      [ 7,  2, [0x8DECC2, 0xC9B5FF, 0xE895B5]],
    ];
    for (const [x, z, colors] of plotData) {
      scene.add(buildGardenPlot(x, z, colors));
    }
    // greenhouse on one side
    scene.add(buildGreenhouse(-9, 7));
    // well in another corner
    scene.add(buildWell(9, 7));
    // mushrooms around the perimeter
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = 12 + Math.random() * 3;
      const mx = Math.cos(a) * r;
      const mz = Math.sin(a) * r;
      const sc = 0.7 + Math.random() * 0.7;
      scene.add(buildMushroom(mx, mz, sc));
    }
    // flower patches
    refs.extras.flowers = [];
    for (let i = 0; i < 18; i++) {
      const fx = (Math.random() - 0.5) * 22;
      const fz = (Math.random() - 0.5) * 22;
      if (Math.abs(fx) < 1.5 || Math.abs(fz) < 1.5) continue; // keep path clear
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6),
        new THREE.MeshStandardMaterial({ color: 0x5D8C5A })
      );
      stem.position.set(fx, 0.15, fz); scene.add(stem);
      const colors = [0xE76F51, 0xFFD66B, 0xE895B5, 0xC9B5FF, 0xFFB39E];
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 12, 8),
        new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)], roughness: 0.55 })
      );
      flower.position.set(fx, 0.36, fz);
      scene.add(flower);
      refs.extras.flowers.push(flower);
    }
    // sign
    const signPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xB58860 })
    );
    signPost.position.set(0, 0.6, 11); scene.add(signPost);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 0.7),
      new THREE.MeshBasicMaterial({ map: makeBannerTexture('Garden', '#5D8C5A'), side: THREE.DoubleSide })
    );
    sign.position.set(0, 1.35, 11.04);
    scene.add(sign);
    // floating bees/butterflies (small glowing spheres)
    refs.extras.bees = [];
    for (let i = 0; i < 5; i++) {
      const bee = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFD66B, emissive: 0xFFD66B, emissiveIntensity: 0.6 })
      );
      bee.position.set((Math.random() - 0.5) * 16, 1.2 + Math.random() * 0.6, (Math.random() - 0.5) * 16);
      scene.add(bee);
      refs.extras.bees.push({ mesh: bee, phase: Math.random() * Math.PI * 2, base: { x: bee.position.x, z: bee.position.z, y: bee.position.y } });
    }
  },
  npcs: [
    { pos: [-7, -6], yaw: 0, wanderRadius: 2 },
    { pos: [ 7, -6], yaw: 0, wanderRadius: 2 },
    { pos: [-9,  7], yaw: 0, wanderRadius: 1 },
    { pos: [ 9,  7], yaw: 0, wanderRadius: 1 },
    { pos: [ 0,  5], yaw: Math.PI, wanderRadius: 4 },
    { pos: [-3,  0], yaw: 0, wanderRadius: 3 },
  ],
  update(now, dt, refs) {
    const t = now * 0.001;
    if (refs.extras.bees) {
      for (const b of refs.extras.bees) {
        b.mesh.position.x = b.base.x + Math.cos(t * 1.4 + b.phase) * 0.8;
        b.mesh.position.z = b.base.z + Math.sin(t * 1.2 + b.phase * 1.3) * 0.7;
        b.mesh.position.y = b.base.y + Math.sin(t * 3 + b.phase) * 0.1;
      }
    }
    if (refs.extras.flowers) {
      for (let i = 0; i < refs.extras.flowers.length; i++) {
        refs.extras.flowers[i].rotation.y = Math.sin(t * 0.8 + i * 0.4) * 0.2;
      }
    }
  },
};

function Garden({ config, onBack }: any) {
  return <Subworld config={config} onBack={onBack} theme={gardenTheme} />;
}

// ── theme: THEATER ─────────────────────────────────────────────

const theaterTheme: SubworldTheme = {
  title: 'Theater',
  subtitle: 'shows · jams · standing-O',
  accent: '#D86F8C',
  dotColor: '#E895B5',
  fog: 0x4A2C3D,
  hemi: { sky: 0xFFD9E1, ground: 0x4A2C3D, intensity: 0.85 },
  sun: { color: 0xFFB39E, intensity: 0.65 },
  rim: { color: 0xC9B5FF, intensity: 0.55, pos: [6, 7, 10] },
  ground: { color: 0x6B3D52, radius: 18 },
  surround: 0x3D1F2E,
  perimeterTrees: false,
  clouds: 3,
  playerSpawn: [0, 0, 10],
  playerYaw: Math.PI,
  walkBounds: 16,
  populate(scene, refs) {
    // dark wood floor accents
    for (let i = -16; i <= 16; i += 3) {
      const seam = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x3D1F2E, roughness: 0.85, transparent: true, opacity: 0.5 })
      );
      seam.rotation.x = -Math.PI / 2;
      seam.position.set(0, 0.012, i);
      scene.add(seam);
    }
    // red carpet runner
    const carpet = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 28),
      new THREE.MeshStandardMaterial({ color: 0xD86F8C, roughness: 0.85 })
    );
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.02, 0);
    scene.add(carpet);
    // stage at the back
    const stage = buildStage(0, -9, 12, 5, 0xB58860);
    scene.add(stage);
    // curtains
    scene.add(buildCurtain(-5, -11, 3.0, 5.0, 0xD86F8C, 'L'));
    scene.add(buildCurtain( 5, -11, 3.0, 5.0, 0xD86F8C, 'R'));
    // backdrop
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 5),
      new THREE.MeshStandardMaterial({ color: 0xFFD9CA, roughness: 0.75 })
    );
    backdrop.position.set(0, 2.7, -11.5);
    scene.add(backdrop);
    // stars/moon on backdrop
    for (let i = 0; i < 7; i++) {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFEDD5, emissive: 0xFFEDD5, emissiveIntensity: 0.6 })
      );
      star.position.set(-4.5 + i * 1.3, 4.0 + Math.sin(i) * 0.8, -11.4);
      scene.add(star);
    }
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 18, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFF7EE, emissive: 0xFFEDD5, emissiveIntensity: 0.55 })
    );
    moon.position.set(-4.0, 4.6, -11.4);
    scene.add(moon);
    // banner
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 1.0),
      new THREE.MeshBasicMaterial({ map: makeBannerTexture('Theater', '#D86F8C'), side: THREE.DoubleSide })
    );
    banner.position.set(0, 5.5, -10.5);
    scene.add(banner);
    // spotlights pointing at the stage
    const stageTarget = new THREE.Vector3(0, 0.5, -9);
    refs.extras.spotlights = [];
    refs.extras.spotlights.push(buildSpotlight(-4, 5, -2, stageTarget, scene));
    refs.extras.spotlights.push(buildSpotlight( 4, 5, -2, stageTarget, scene));
    // audience benches (curved)
    const benchYZ: Array<[number, number, number]> = [
      [-4, 2, 0.15],
      [ 4, 2, -0.15],
      [-4, 5, 0.18],
      [ 4, 5, -0.18],
      [-4, 8, 0.22],
      [ 4, 8, -0.22],
    ];
    for (const [bx, bz, rot] of benchYZ) {
      scene.add(buildAudienceBench(bx, bz, rot));
    }
    // performer (NPC) on stage — see npcs spawn
    // chandelier/bulbs over audience
    refs.extras.lights = [];
    const arcConfigs: Array<[number, number, number, number]> = [
      [-10, 0, 10, 0],
      [-10, 4, 10, 4],
      [-10, 8, 10, 8],
    ];
    for (const [x1, z1, x2, z2] of arcConfigs) {
      const arc = buildStringLightArc(x1, z1, x2, z2, 5.2, 14);
      scene.add(arc.group);
      refs.extras.lights.push(...arc.lights);
    }
  },
  npcs: [
    // performer on stage (dancing)
    { pos: [0, -8.5], yaw: 0, seated: 'dance' },
    // audience
    { pos: [-3, 2], yaw: 0, seated: 'sit' },
    { pos: [-1, 2], yaw: 0, seated: 'cheer' },
    { pos: [ 1, 2], yaw: 0, seated: 'clap' },
    { pos: [ 3, 2], yaw: 0, seated: 'sit' },
    { pos: [-2, 5], yaw: 0, seated: 'sit' },
    { pos: [ 2, 5], yaw: 0, seated: 'laugh' },
  ],
  update(now, dt, refs) {
    const t = now * 0.001;
    if (refs.extras.lights) {
      for (let i = 0; i < refs.extras.lights.length; i++) {
        (refs.extras.lights[i].material as any).emissiveIntensity = 0.65 + Math.sin(t * 1.6 + i * 0.7) * 0.25;
      }
    }
  },
};

function Theater({ config, onBack }: any) {
  return <Subworld config={config} onBack={onBack} theme={theaterTheme} />;
}

// ── theme: PLAZA MART ──────────────────────────────────────────

const marketTheme: SubworldTheme = {
  title: 'Plaza Mart',
  subtitle: 'trinkets · fits · curios',
  accent: '#C77A2E',
  dotColor: '#F5C56B',
  fog: 0xFFE3CF,
  hemi: { sky: 0xFFF1E8, ground: 0xFFD9CA, intensity: 1.0 },
  sun: { color: 0xFFEDD5, intensity: 0.95 },
  rim: { color: 0xFFCDB5, intensity: 0.4, pos: [-8, 6, -10] },
  ground: { color: 0xFFE9D9, radius: 18 },
  surround: 0xC4ECC8,
  perimeterTrees: { count: 10, colors: [0x8DECC2, 0xA8E6CF, 0x9BD9B0] },
  clouds: 6,
  playerSpawn: [0, 0, 12],
  playerYaw: Math.PI,
  walkBounds: 16,
  populate(scene, refs) {
    // cobblestone pattern (tile cells)
    for (let i = -14; i <= 14; i += 2) {
      for (let j = -14; j <= 14; j += 2) {
        if (Math.random() > 0.6) continue;
        const stone = new THREE.Mesh(
          new THREE.PlaneGeometry(1.8, 1.8),
          new THREE.MeshStandardMaterial({ color: 0xFFD9CA, roughness: 0.8, transparent: true, opacity: 0.5 })
        );
        stone.rotation.x = -Math.PI / 2;
        stone.position.set(i, 0.011, j);
        scene.add(stone);
      }
    }
    // stalls arranged in a ring
    const stallData: Array<[number, number, number, number, number[]]> = [
      // x, z, rotY, awning color, goods colors
      [-9,  0,  Math.PI / 2,  0xFF8B7A, [0xE76F51, 0xFFD66B, 0xE895B5]],
      [ 9,  0, -Math.PI / 2,  0x6EE7FF, [0xC9B5FF, 0x8DECC2, 0xFFB39E]],
      [ 0, -9,  Math.PI,      0xC9B5FF, [0xFFD66B, 0xE76F51, 0x8DECC2]],
      [ 0,  9,  0,            0xFFD66B, [0xE895B5, 0xC9B5FF, 0xFFB39E]],
      [-6.5, -6.5, -Math.PI * 0.25 + Math.PI, 0x8DECC2, [0xE76F51, 0xFFC9B5, 0x6EE7FF]],
      [ 6.5, -6.5,  Math.PI * 0.25 + Math.PI, 0xE895B5, [0x6EE7FF, 0xC9B5FF, 0x8DECC2]],
      [-6.5,  6.5,  Math.PI * 0.25,           0xFFB39E, [0xFFD66B, 0xC9B5FF, 0xE895B5]],
      [ 6.5,  6.5, -Math.PI * 0.25,           0xC77A2E, [0xE76F51, 0x8DECC2, 0xFFB39E]],
    ];
    for (const [x, z, rot, awn, goods] of stallData) {
      scene.add(buildMarketStall(x, z, rot, awn, goods));
    }
    // central plaza pole with banners
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 4.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })
    );
    pole.position.set(0, 2.25, 0); pole.castShadow = true;
    scene.add(pole);
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xC77A2E, emissive: 0xFFD66B, emissiveIntensity: 0.45 })
    );
    ball.position.set(0, 4.7, 0); scene.add(ball);
    // string light arcs from pole top
    refs.extras.lights = [];
    const top = new THREE.Vector3(0, 4.4, 0);
    const arcEnds: Array<[number, number]> = [
      [-9, 0], [9, 0], [0, -9], [0, 9],
      [-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5], [6.5, 6.5],
    ];
    for (const [ex, ez] of arcEnds) {
      const arc = buildStringLightArc(top.x, top.z, ex, ez, top.y, 10);
      arc.group.position.y = 0; // arcs already have absolute y baked in
      scene.add(arc.group);
      refs.extras.lights.push(...arc.lights);
    }
    // banners flying from pole
    refs.extras.banners = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.6),
        new THREE.MeshBasicMaterial({ map: makeBannerTexture(['mart', 'fits', 'tea', '♡ wee'][i], '#C77A2E'), side: THREE.DoubleSide })
      );
      banner.position.set(Math.cos(a) * 1.5, 3.6, Math.sin(a) * 1.5);
      banner.lookAt(0, 3.6, 0);
      scene.add(banner);
      refs.extras.banners.push({ mesh: banner, phase: i });
    }
  },
  npcs: [
    { pos: [-9, 0], yaw: -Math.PI / 2, wanderRadius: 1.5 },
    { pos: [ 9, 0], yaw: Math.PI / 2, wanderRadius: 1.5 },
    { pos: [ 0, -9], yaw: 0, wanderRadius: 1.5 },
    { pos: [ 0,  9], yaw: Math.PI, wanderRadius: 1.5 },
    { pos: [ 3,  3], yaw: 0, wanderRadius: 4 },
    { pos: [-3, -3], yaw: 0, wanderRadius: 4 },
    { pos: [ 5, -2], yaw: 0, wanderRadius: 3 },
  ],
  update(now, dt, refs) {
    const t = now * 0.001;
    if (refs.extras.lights) {
      for (let i = 0; i < refs.extras.lights.length; i++) {
        (refs.extras.lights[i].material as any).emissiveIntensity = 0.6 + Math.sin(t * 1.6 + i * 0.5) * 0.3;
      }
    }
    if (refs.extras.banners) {
      for (const b of refs.extras.banners) {
        b.mesh.rotation.z = Math.sin(t * 1.2 + b.phase) * 0.08;
      }
    }
  },
};

function Market({ config, onBack }: any) {
  return <Subworld config={config} onBack={onBack} theme={marketTheme} />;
}

// animation helpers
function animateWalk(group, t) {
  const ud = group.userData;
  if (!ud) return;
  const swing = Math.sin(t) * 0.5;
  if (ud.lArm) ud.lArm.rotation.x = swing;
  if (ud.rArm) ud.rArm.rotation.x = -swing;
  if (ud.lLeg) ud.lLeg.rotation.x = -swing * 0.6;
  if (ud.rLeg) ud.rLeg.rotation.x = swing * 0.6;
  group.position.y = Math.abs(Math.sin(t * 2)) * 0.06;
}
function animateIdle(group, t) {
  const ud = group.userData;
  if (!ud) return;
  const sway = Math.sin(t * 0.8) * 0.05;
  if (ud.lArm) ud.lArm.rotation.x = sway * 0.5;
  if (ud.rArm) ud.rArm.rotation.x = -sway * 0.5;
  if (ud.lLeg) ud.lLeg.rotation.x = 0;
  if (ud.rLeg) ud.rLeg.rotation.x = 0;
  group.position.y = Math.sin(t * 1.2) * 0.025;
}

// ────────────────────────────────────────────────────────────────
// PHASE 7: ARENA — Trivia Arena ("Olympics for Intelligence")
// A cyberpunk stadium where the player competes against simulated
// AI agent opponents through live trivia rounds.
// ────────────────────────────────────────────────────────────────

const ARENA_QUESTION_MS = 15000;
const ARENA_REVEAL_MS = 3000;
const ARENA_IDLE_MS = 1500;
const ARENA_QUESTIONS_PER_ROUND = 10;

const ARENA_PLATFORM_COLORS = [0x6EE7FF, 0xFF7AC6, 0xBEFF7A, 0xFFC56E];
const ARENA_PLATFORM_LETTERS = ['A', 'B', 'C', 'D'];

const ARENA_BOTS = [
  { id: 'gpt-neo',     name: 'GPT-Neo',     color: '#FF7AC6', accuracy: 0.85, speed: [3000, 8000],  bias: { science: 0.08, programming: 0.10 } as Record<string, number> },
  { id: 'claude-lite', name: 'Claude-Lite', color: '#BEFF7A', accuracy: 0.78, speed: [2000, 6000],  bias: { logic: 0.10, math: 0.05, science: 0.04 } as Record<string, number> },
  { id: 'logic-9',     name: 'Logic-9',     color: '#FFC56E', accuracy: 0.70, speed: [5000, 10000], bias: { logic: 0.18, math: 0.12 } as Record<string, number> },
];

const ARENA_FALLBACK_QUESTIONS = [
  { category: 'science', question: 'What is the chemical symbol for gold?', correct: 'Au', incorrect: ['Ag', 'Gd', 'Go'] },
  { category: 'history', question: 'In what year did the Berlin Wall fall?', correct: '1989', incorrect: ['1987', '1991', '1985'] },
  { category: 'geography', question: 'Which is the longest river in the world?', correct: 'Nile', incorrect: ['Amazon', 'Yangtze', 'Mississippi'] },
  { category: 'math', question: 'What is the value of π rounded to two decimals?', correct: '3.14', incorrect: ['3.41', '3.12', '3.16'] },
  { category: 'programming', question: 'Which language compiles to WebAssembly natively?', correct: 'Rust', incorrect: ['JavaScript', 'Python', 'Ruby'] },
  { category: 'logic', question: 'If all bloops are razzles and all razzles are lazzles, all bloops are…', correct: 'lazzles', incorrect: ['razzles only', 'neither', 'sometimes lazzles'] },
  { category: 'science', question: 'What part of the cell produces most of its energy?', correct: 'Mitochondria', incorrect: ['Nucleus', 'Ribosome', 'Golgi apparatus'] },
  { category: 'pop culture', question: 'Who painted the Mona Lisa?', correct: 'Leonardo da Vinci', incorrect: ['Michelangelo', 'Raphael', 'Donatello'] },
  { category: 'geography', question: 'What is the capital of Australia?', correct: 'Canberra', incorrect: ['Sydney', 'Melbourne', 'Perth'] },
  { category: 'history', question: 'Who was the first person to walk on the Moon?', correct: 'Neil Armstrong', incorrect: ['Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins'] },
  { category: 'math', question: 'How many edges does a cube have?', correct: '12', incorrect: ['8', '6', '10'] },
  { category: 'programming', question: 'In binary, what is 1010 + 0101?', correct: '1111', incorrect: ['1010', '1101', '10000'] },
];

function arenaShuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function arenaFetchQuestions(signal: AbortSignal) {
  const res = await fetch(
    'https://opentdb.com/api.php?amount=20&type=multiple&encode=url3986',
    { signal }
  );
  const data = await res.json();
  if (!data || data.response_code !== 0 || !Array.isArray(data.results) || !data.results.length) return null;
  return data.results.map((r: any) => {
    const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
    const catName = (dec(r.category) || '').toLowerCase();
    let category = 'general';
    if (catName.includes('science') || catName.includes('nature') || catName.includes('animals')) category = 'science';
    else if (catName.includes('computer') || catName.includes('programming')) category = 'programming';
    else if (catName.includes('math')) category = 'math';
    else if (catName.includes('geography')) category = 'geography';
    else if (catName.includes('history') || catName.includes('mythology') || catName.includes('politics')) category = 'history';
    else if (catName.includes('film') || catName.includes('music') || catName.includes('television') || catName.includes('celebrities') || catName.includes('books') || catName.includes('art') || catName.includes('comics') || catName.includes('cartoons') || catName.includes('anime') || catName.includes('video games') || catName.includes('musicals') || catName.includes('theatres') || catName.includes('entertainment')) category = 'pop culture';
    return {
      category,
      question: dec(r.question),
      correct: dec(r.correct_answer),
      incorrect: (r.incorrect_answers || []).map(dec),
    };
  });
}

function arenaMakeJumbotronTexture() {
  const W = 1024, H = 576;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { canvas, tex };
}

function arenaWrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = (text || '').split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth) {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

function arenaDrawJumbotron(canvas: HTMLCanvasElement, payload: any) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#06091A';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(110, 231, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.strokeStyle = '#6EE7FF';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  if (payload.kind === 'loading') {
    ctx.fillStyle = '#6EE7FF';
    ctx.font = 'bold 64px "Fraunces", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('INITIALIZING ARENA…', W / 2, H / 2 - 20);
    ctx.fillStyle = 'rgba(110,231,255,0.55)';
    ctx.font = '26px "Fredoka", sans-serif';
    ctx.fillText('linking to global question feed', W / 2, H / 2 + 50);
    return;
  }
  if (payload.kind === 'idle') {
    ctx.fillStyle = '#6EE7FF';
    ctx.font = 'bold 40px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ROUND ${payload.round}  ·  QUESTION ${payload.q} / ${ARENA_QUESTIONS_PER_ROUND}`, W / 2, H / 2 - 40);
    ctx.fillStyle = '#FF7AC6';
    ctx.font = 'bold 52px "Fraunces", serif';
    ctx.fillText((payload.category || 'general').toUpperCase(), W / 2, H / 2 + 40);
    return;
  }
  if (payload.kind === 'roundOver') {
    ctx.fillStyle = '#BEFF7A';
    ctx.font = 'bold 72px "Fraunces", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ROUND COMPLETE', W / 2, H / 2 - 30);
    ctx.fillStyle = '#6EE7FF';
    ctx.font = '28px "Fredoka", sans-serif';
    ctx.fillText('press SPACE for the next round', W / 2, H / 2 + 50);
    return;
  }

  const { category, question, answers, correctIdx, revealing } = payload;
  ctx.fillStyle = '#FF7AC6';
  ctx.font = 'bold 26px "Fredoka", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`◆ ${(category || 'general').toUpperCase()}`, 32, 22);

  ctx.fillStyle = '#E6F8FF';
  ctx.font = 'bold 36px "Fraunces", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const lines = arenaWrapText(ctx, question, W - 100, 5);
  const startY = 80;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, startY + i * 44);
  }

  const gridY = 290;
  const gridW = (W - 80) / 2;
  const gridH = 110;
  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * gridW;
    const y = gridY + row * (gridH + 16);
    const isCorrect = revealing && i === correctIdx;
    const isWrong = revealing && i !== correctIdx;
    const bg = isCorrect ? 'rgba(110, 255, 150, 0.22)' : isWrong ? 'rgba(255, 80, 110, 0.10)' : 'rgba(110, 231, 255, 0.10)';
    const border = isCorrect ? '#7AFF9A' : isWrong ? '#FF5A78' : '#6EE7FF';
    ctx.fillStyle = bg;
    roundRect(ctx, x + 6, y, gridW - 12, gridH - 6, 14);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = border;
    roundRect(ctx, x + 6, y, gridW - 12, gridH - 6, 14);
    ctx.stroke();
    ctx.fillStyle = border;
    ctx.beginPath();
    ctx.arc(x + 40, y + (gridH - 6) / 2, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06091A';
    ctx.font = 'bold 26px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ARENA_PLATFORM_LETTERS[i], x + 40, y + (gridH - 6) / 2 + 1);
    ctx.fillStyle = '#E6F8FF';
    ctx.font = '22px "Fredoka", sans-serif';
    ctx.textAlign = 'left';
    const ans = answers[i] || '';
    const trimmed = ans.length > 52 ? ans.slice(0, 51) + '…' : ans;
    ctx.fillText(trimmed, x + 76, y + (gridH - 6) / 2 + 1);
  }
}

function arenaMakePillarTexture() {
  const W = 256, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { canvas, tex };
}

function arenaDrawPillar(canvas: HTMLCanvasElement, player: any) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#06091A';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  ctx.fillStyle = player.color;
  ctx.font = 'bold 28px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(player.isBot ? '◤ AI ◥' : '◆ YOU ◆', W / 2, 24);
  ctx.fillStyle = '#E6F8FF';
  ctx.font = 'bold 28px "Fraunces", serif';
  ctx.fillText(player.name, W / 2, 66);
  ctx.fillStyle = player.color;
  ctx.font = 'bold 92px "Fraunces", serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(player.score), W / 2, 240);
  ctx.fillStyle = player.streak >= 2 ? '#FFC56E' : 'rgba(230,248,255,0.5)';
  ctx.font = 'bold 24px "Fredoka", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(player.streak >= 2 ? `⚡ ${player.streak}x STREAK` : `STREAK ${player.streak}`, W / 2, 340);
  if (player.lastDelta != null) {
    ctx.fillStyle = player.lastCorrect ? '#7AFF9A' : '#FF5A78';
    ctx.font = 'bold 34px "Fredoka", sans-serif';
    ctx.fillText(player.lastCorrect ? `+${player.lastDelta}` : 'MISS', W / 2, 400);
  }
}

function Arena({ config, onBack }: any) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<any>({});
  const [hudState, setHudState] = useState<any>({
    phase: 'loading',
    round: 1,
    qIndex: 0,
    question: null,
    answers: [],
    correctIdx: -1,
    category: '',
    remainingMs: ARENA_QUESTION_MS,
    players: [],
    selected: -1,
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth, height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05071A);
    scene.fog = new THREE.Fog(0x05071A, 30, 95);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 250);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0x5A78FF, 0x0A0E2A, 0.65);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xB6F1FF, 0.7);
    key.position.set(10, 22, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const fill = new THREE.PointLight(0xFF7AC6, 0.7, 60);
    fill.position.set(-12, 8, -4);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(28, 64),
      new THREE.MeshStandardMaterial({ color: 0x0B1030, roughness: 0.55, metalness: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const floorRings: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const r = 6 + i * 4;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.06, r + 0.06, 96),
        new THREE.MeshBasicMaterial({ color: 0x6EE7FF, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      scene.add(ring);
      floorRings.push(ring);
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.PlaneGeometry(22, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x6EE7FF, transparent: true, opacity: 0.18 })
      );
      spoke.rotation.x = -Math.PI / 2;
      spoke.rotation.z = a;
      spoke.position.y = 0.015;
      scene.add(spoke);
    }

    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(5.4, 5.8, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x141A3A, roughness: 0.5, metalness: 0.5 })
    );
    stage.position.y = 0.25;
    stage.receiveShadow = true;
    scene.add(stage);
    const stageEdge = new THREE.Mesh(
      new THREE.RingGeometry(5.35, 5.6, 64),
      new THREE.MeshBasicMaterial({ color: 0x6EE7FF, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    stageEdge.rotation.x = -Math.PI / 2;
    stageEdge.position.y = 0.51;
    scene.add(stageEdge);

    const platformSpecs = [
      { idx: 0, x:  10, z:  -2, color: ARENA_PLATFORM_COLORS[0] },
      { idx: 1, x: -10, z:  -2, color: ARENA_PLATFORM_COLORS[1] },
      { idx: 2, x:   0, z:  10, color: ARENA_PLATFORM_COLORS[2] },
      { idx: 3, x:   0, z: -12, color: ARENA_PLATFORM_COLORS[3] },
    ];
    const platforms: any[] = [];
    for (const spec of platformSpecs) {
      const g = new THREE.Group();
      g.position.set(spec.x, 0, spec.z);
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(2.0, 2.2, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.6, roughness: 0.35 })
      );
      plate.position.y = 0.2;
      plate.castShadow = true;
      g.add(plate);
      const edge = new THREE.Mesh(
        new THREE.RingGeometry(2.05, 2.25, 32),
        new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
      );
      edge.rotation.x = -Math.PI / 2;
      edge.position.y = 0.41;
      g.add(edge);
      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 256; badgeCanvas.height = 256;
      const bctx = badgeCanvas.getContext('2d')!;
      bctx.fillStyle = '#06091A';
      bctx.beginPath(); bctx.arc(128, 128, 110, 0, Math.PI * 2); bctx.fill();
      bctx.strokeStyle = '#' + spec.color.toString(16).padStart(6, '0');
      bctx.lineWidth = 10;
      bctx.beginPath(); bctx.arc(128, 128, 110, 0, Math.PI * 2); bctx.stroke();
      bctx.fillStyle = '#' + spec.color.toString(16).padStart(6, '0');
      bctx.font = 'bold 160px "Fraunces", serif';
      bctx.textAlign = 'center';
      bctx.textBaseline = 'middle';
      bctx.fillText(ARENA_PLATFORM_LETTERS[spec.idx], 128, 138);
      const badgeTex = new THREE.CanvasTexture(badgeCanvas);
      badgeTex.colorSpace = THREE.SRGBColorSpace;
      const badge = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1.6),
        new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true })
      );
      badge.position.y = 2.4;
      g.add(badge);
      scene.add(g);
      platforms.push({ ...spec, group: g, plate, edge, badge });
    }

    const { canvas: jumboCanvas, tex: jumboTex } = arenaMakeJumbotronTexture();
    arenaDrawJumbotron(jumboCanvas, { kind: 'loading' });
    jumboTex.needsUpdate = true;
    const jumboFrame = new THREE.Mesh(
      new THREE.BoxGeometry(13.4, 7.8, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x0A1024, roughness: 0.5, metalness: 0.6 })
    );
    jumboFrame.position.set(0, 9.5, -8);
    scene.add(jumboFrame);
    const jumboScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(12.6, 7.0),
      new THREE.MeshBasicMaterial({ map: jumboTex, transparent: true })
    );
    jumboScreen.position.set(0, 9.5, -7.78);
    scene.add(jumboScreen);
    const timerRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.1, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x6EE7FF, transparent: true, opacity: 0.85 })
    );
    timerRing.position.set(0, 9.5, -8.2);
    scene.add(timerRing);

    const spotlights: THREE.SpotLight[] = [];
    for (let i = 0; i < 4; i++) {
      const sl = new THREE.SpotLight(ARENA_PLATFORM_COLORS[i], 1.2, 30, Math.PI / 8, 0.35, 1.5);
      const a = (i / 4) * Math.PI * 2;
      sl.position.set(Math.cos(a) * 16, 14, Math.sin(a) * 16);
      sl.target.position.set(0, 1, 0);
      scene.add(sl);
      scene.add(sl.target);
      spotlights.push(sl);
    }

    const crowd: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];
    for (let tier = 0; tier < 3; tier++) {
      const radius = 22 + tier * 2.3;
      const seatY = 0.6 + tier * 0.9;
      const seating = new THREE.Mesh(
        new THREE.CylinderGeometry(radius + 1.1, radius + 1.1, 0.6, 64, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x16204A, roughness: 0.7, side: THREE.DoubleSide })
      );
      seating.position.y = seatY - 0.3;
      scene.add(seating);
      const count = 28 + tier * 6;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + (tier * 0.1);
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        const body = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.28, 0.7, 4, 8),
          new THREE.MeshStandardMaterial({
            color: [0x2B3A8A, 0x3F4FBE, 0x6F4FBE, 0xBE4F8A, 0x4FBEBE][i % 5],
            roughness: 0.6,
          })
        );
        body.position.set(x, seatY + 0.6, z);
        body.lookAt(0, seatY, 0);
        scene.add(body);
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x1A1530, roughness: 0.6 })
        );
        head.position.set(x, seatY + 1.25, z);
        scene.add(head);
        crowd.push({ mesh: body, baseY: seatY + 0.6, phase: Math.random() * Math.PI * 2 });
        crowd.push({ mesh: head, baseY: seatY + 1.25, phase: Math.random() * Math.PI * 2 });
      }
    }

    const pillarData: any[] = [];
    const pillarPositions = [
      { x: -9, color: '#6EE7FF' },
      { x: -3, color: ARENA_BOTS[0].color },
      { x:  3, color: ARENA_BOTS[1].color },
      { x:  9, color: ARENA_BOTS[2].color },
    ];
    for (let i = 0; i < 4; i++) {
      const { canvas: pc, tex: pt } = arenaMakePillarTexture();
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(2.0, 4.0),
        new THREE.MeshBasicMaterial({ map: pt, transparent: true })
      );
      screen.position.set(pillarPositions[i].x, 3.2, -18);
      scene.add(screen);
      const stem = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 6.4, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x0A1024, roughness: 0.4, metalness: 0.6 })
      );
      stem.position.set(pillarPositions[i].x, 3.2, -18.2);
      scene.add(stem);
      pillarData.push({ canvas: pc, tex: pt });
    }

    const player = buildAvatar(config);
    player.position.set(0, 0.5, 0);
    player.rotation.y = Math.PI;
    player.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
    scene.add(player);

    const botPositions = [{ x: -3.5, z: 1.5 }, { x: 3.5, z: 1.5 }, { x: 0, z: 3.0 }];
    const botMeshes: any[] = [];
    for (let i = 0; i < ARENA_BOTS.length; i++) {
      const b = ARENA_BOTS[i];
      const botCfg = {
        skinTone: 0xB6E0FF, hairStyle: 'short', hairColor: parseInt(b.color.slice(1), 16),
        faceShape: 'round', eyeStyle: 'serene', eyeColor: parseInt(b.color.slice(1), 16),
        eyebrowAngle: 0, mouthStyle: 'serene',
        outfitColor: parseInt(b.color.slice(1), 16), name: b.name,
      };
      const botAvatar = buildAvatar(botCfg);
      botAvatar.position.set(botPositions[i].x, 0.5, botPositions[i].z);
      botAvatar.rotation.y = Math.PI;
      botAvatar.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
      scene.add(botAvatar);
      botMeshes.push(botAvatar);
    }

    camera.position.set(0, 7.5, 16);
    camera.lookAt(0, 4.5, -4);

    const game: any = {
      phase: 'loading',
      round: 1,
      qIndex: 0,
      questionStartedAt: 0,
      remainingMs: ARENA_QUESTION_MS,
      questions: [] as any[],
      current: null as any,
      players: [
        { id: 'you', name: (config?.name || 'You'), isBot: false, color: '#6EE7FF', score: 0, streak: 0, lastDelta: null, lastCorrect: null, answeredAt: -1, answerIdx: -1 },
        ...ARENA_BOTS.map(b => ({ id: b.id, name: b.name, isBot: true, color: b.color, score: 0, streak: 0, lastDelta: null, lastCorrect: null, answeredAt: -1, answerIdx: -1 })),
      ],
      revealFlash: 0,
      flashUntil: 0,
      botTimeouts: [] as number[],
      pendingPhaseTimeout: 0,
      abortController: new AbortController(),
      questionsExhausted: false,
    };
    stateRef.current = game;

    function syncHud() {
      setHudState({
        phase: game.phase,
        round: game.round,
        qIndex: game.qIndex,
        question: game.current?.question || null,
        answers: game.current?.answers || [],
        correctIdx: game.current?.correctIdx ?? -1,
        category: game.current?.category || '',
        remainingMs: game.remainingMs,
        players: game.players.map((p: any) => ({ ...p })),
        selected: game.players[0]?.answerIdx ?? -1,
      });
    }

    function redrawJumbotron() {
      if (game.phase === 'loading') {
        arenaDrawJumbotron(jumboCanvas, { kind: 'loading' });
      } else if (game.phase === 'idle') {
        arenaDrawJumbotron(jumboCanvas, { kind: 'idle', round: game.round, q: game.qIndex + 1, category: game.current?.category });
      } else if (game.phase === 'roundOver') {
        arenaDrawJumbotron(jumboCanvas, { kind: 'roundOver' });
      } else if (game.current) {
        arenaDrawJumbotron(jumboCanvas, {
          kind: 'question',
          category: game.current.category,
          question: game.current.question,
          answers: game.current.answers,
          correctIdx: game.current.correctIdx,
          revealing: game.phase === 'reveal',
        });
      }
      jumboTex.needsUpdate = true;
    }

    function redrawPillars() {
      for (let i = 0; i < 4; i++) {
        arenaDrawPillar(pillarData[i].canvas, game.players[i]);
        pillarData[i].tex.needsUpdate = true;
      }
    }

    function clearBotTimeouts() {
      for (const t of game.botTimeouts) clearTimeout(t);
      game.botTimeouts = [];
    }

    function recordAnswer(playerId: string, idx: number) {
      const p = game.players.find((pp: any) => pp.id === playerId);
      if (!p || p.answerIdx !== -1 || game.phase !== 'question') return;
      p.answerIdx = idx;
      p.answeredAt = performance.now();
      if (playerId === 'you') {
        const pf = platforms[idx];
        if (pf) (pf.plate.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.6;
        syncHud();
      }
      if (game.players.every((pp: any) => pp.answerIdx !== -1)) {
        clearTimeout(game.pendingPhaseTimeout);
        enterReveal();
      }
    }

    function pickBotAnswer(bot: any, correctIdx: number, category: string) {
      const bias = bot.bias[category] || 0;
      const eff = Math.max(0.4, Math.min(0.97, bot.accuracy + bias));
      const willBeCorrect = Math.random() < eff;
      if (willBeCorrect) return correctIdx;
      const choices = [0, 1, 2, 3].filter(i => i !== correctIdx);
      return choices[Math.floor(Math.random() * choices.length)];
    }

    function nextQuestion() {
      if (!game.questions.length && game.questionsExhausted) {
        game.questions = arenaShuffle(ARENA_FALLBACK_QUESTIONS).map(q => ({ ...q }));
      }
      const raw = game.questions.shift();
      if (!raw) {
        game.phase = 'loading';
        redrawJumbotron();
        syncHud();
        return;
      }
      const all = arenaShuffle([raw.correct, ...raw.incorrect]);
      const correctIdx = all.indexOf(raw.correct);
      game.current = { category: raw.category, question: raw.question, answers: all, correctIdx };
      for (const p of game.players) {
        p.answerIdx = -1;
        p.answeredAt = -1;
        p.lastDelta = null;
        p.lastCorrect = null;
      }
      game.phase = 'idle';
      redrawJumbotron();
      redrawPillars();
      syncHud();
      game.pendingPhaseTimeout = window.setTimeout(() => {
        beginQuestion();
      }, ARENA_IDLE_MS);
    }

    function beginQuestion() {
      game.phase = 'question';
      game.questionStartedAt = performance.now();
      game.remainingMs = ARENA_QUESTION_MS;
      redrawJumbotron();
      syncHud();
      clearBotTimeouts();
      for (let i = 0; i < ARENA_BOTS.length; i++) {
        const bot = ARENA_BOTS[i];
        const [minD, maxD] = bot.speed;
        const delay = minD + Math.random() * (maxD - minD);
        const pickedIdx = pickBotAnswer(bot, game.current.correctIdx, game.current.category);
        const timeoutId = window.setTimeout(() => {
          recordAnswer(bot.id, pickedIdx);
        }, Math.min(delay, ARENA_QUESTION_MS - 200));
        game.botTimeouts.push(timeoutId);
      }
      game.pendingPhaseTimeout = window.setTimeout(() => {
        enterReveal();
      }, ARENA_QUESTION_MS);
    }

    function enterReveal() {
      if (game.phase === 'reveal' || game.phase === 'roundOver') return;
      clearBotTimeouts();
      clearTimeout(game.pendingPhaseTimeout);
      game.phase = 'reveal';
      const correctIdx = game.current.correctIdx;
      const tStart = game.questionStartedAt;
      for (const p of game.players) {
        const correct = p.answerIdx === correctIdx;
        if (correct) {
          const ansT = p.answeredAt > 0 ? p.answeredAt : performance.now();
          const remainingFrac = Math.max(0, Math.min(1, 1 - (ansT - tStart) / ARENA_QUESTION_MS));
          const base = 100;
          const speedBonus = Math.floor(100 * remainingFrac);
          const streakMult = 1 + Math.min(p.streak, 5) * 0.1;
          const delta = Math.floor((base + speedBonus) * streakMult);
          p.score += delta;
          p.streak += 1;
          p.lastDelta = delta;
          p.lastCorrect = true;
        } else {
          p.streak = 0;
          p.lastDelta = 0;
          p.lastCorrect = false;
        }
      }
      game.flashUntil = performance.now() + 600;
      game.revealFlash = game.players[0].lastCorrect ? 1 : -1;
      redrawJumbotron();
      redrawPillars();
      syncHud();
      game.pendingPhaseTimeout = window.setTimeout(() => {
        game.qIndex += 1;
        if (game.qIndex >= ARENA_QUESTIONS_PER_ROUND) {
          game.phase = 'roundOver';
          redrawJumbotron();
          syncHud();
        } else {
          nextQuestion();
        }
      }, ARENA_REVEAL_MS);
    }

    function startNextRound() {
      game.round += 1;
      game.qIndex = 0;
      for (const p of game.players) { p.streak = 0; p.lastDelta = null; p.lastCorrect = null; }
      nextQuestion();
    }

    game.onPlayerAnswer = (idx: number) => recordAnswer('you', idx);
    game.startNextRound = startNextRound;

    arenaFetchQuestions(game.abortController.signal)
      .then(qs => {
        if (qs && qs.length) {
          game.questions = qs;
        } else {
          game.questions = arenaShuffle(ARENA_FALLBACK_QUESTIONS).map(q => ({ ...q }));
          game.questionsExhausted = true;
        }
        nextQuestion();
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        game.questions = arenaShuffle(ARENA_FALLBACK_QUESTIONS).map(q => ({ ...q }));
        game.questionsExhausted = true;
        nextQuestion();
      });

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'escape') { onBack && onBack(); return; }
      if (game.phase === 'roundOver' && (k === ' ' || k === 'enter')) {
        startNextRound();
        return;
      }
      if (game.phase !== 'question') return;
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      if (map[k] != null) recordAnswer('you', map[k]);
    };
    window.addEventListener('keydown', onKeyDown);

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onPointerDown = (e: PointerEvent) => {
      if (game.phase !== 'question') return;
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(platforms.map(p => p.plate), false);
      if (hits.length) {
        const hit = hits[0].object;
        const pf = platforms.find(p => p.plate === hit);
        if (pf) recordAnswer('you', pf.idx);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    let frameId = 0;
    let lastT = performance.now();
    let lastHudT = 0;

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const t = now * 0.001;

      for (let i = 0; i < floorRings.length; i++) {
        (floorRings[i].material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(t * 1.4 + i * 0.6) * 0.18;
      }
      (stageEdge.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 2.0) * 0.25;

      for (let i = 0; i < spotlights.length; i++) {
        const sl = spotlights[i];
        const a = (i / 4) * Math.PI * 2 + t * 0.4;
        sl.position.set(Math.cos(a) * 16, 14, Math.sin(a) * 16);
      }
      if (now < game.flashUntil) {
        const flashColor = game.revealFlash > 0 ? 0x7AFF9A : 0xFF5A78;
        for (const sl of spotlights) { sl.color.setHex(flashColor); sl.intensity = 2.0; }
      } else {
        for (let i = 0; i < spotlights.length; i++) {
          spotlights[i].color.setHex(ARENA_PLATFORM_COLORS[i]);
          spotlights[i].intensity = 1.2;
        }
      }

      for (let i = 0; i < platforms.length; i++) {
        const pf = platforms[i];
        let target = 0.55 + Math.sin(t * 2 + i) * 0.15;
        if (game.phase === 'reveal') {
          if (i === game.current?.correctIdx) target = 1.6;
          else target = 0.15;
        } else if (game.players[0]?.answerIdx === i) {
          target = 1.3;
        }
        const cur = (pf.plate.material as THREE.MeshStandardMaterial).emissiveIntensity;
        (pf.plate.material as THREE.MeshStandardMaterial).emissiveIntensity = cur + (target - cur) * 0.15;
        pf.badge.position.y = 2.4 + Math.sin(t * 2 + i) * 0.08;
        pf.badge.rotation.y = Math.sin(t * 0.6 + i) * 0.2;
      }

      if (game.phase === 'question') {
        const elapsed = now - game.questionStartedAt;
        game.remainingMs = Math.max(0, ARENA_QUESTION_MS - elapsed);
        const frac = game.remainingMs / ARENA_QUESTION_MS;
        timerRing.scale.setScalar(Math.max(0.05, frac));
        const ringColor = frac > 0.5 ? 0x6EE7FF : frac > 0.25 ? 0xFFC56E : 0xFF5A78;
        (timerRing.material as THREE.MeshBasicMaterial).color.setHex(ringColor);
        (timerRing.material as THREE.MeshBasicMaterial).opacity = 0.85;
      } else {
        timerRing.scale.setScalar(1);
        (timerRing.material as THREE.MeshBasicMaterial).opacity = 0.3;
      }
      timerRing.rotation.z = t * 0.6;

      for (let i = 0; i < crowd.length; i++) {
        const c = crowd[i];
        c.mesh.position.y = c.baseY + Math.sin(t * 1.8 + c.phase) * 0.05;
      }

      animateIdle(player, t);
      for (let i = 0; i < botMeshes.length; i++) animateIdle(botMeshes[i], t + i * 0.7);

      if (now - lastHudT > 100) {
        lastHudT = now;
        if (game.phase === 'question') {
          setHudState((prev: any) => ({ ...prev, remainingMs: game.remainingMs }));
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(game.pendingPhaseTimeout);
      for (const t of game.botTimeouts) clearTimeout(t);
      try { game.abortController.abort(); } catch {}
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      disposeGroup(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  const click = (idx: number) => {
    const g = stateRef.current;
    if (g && g.onPlayerAnswer) g.onPlayerAnswer(idx);
  };
  const nextRound = () => {
    const g = stateRef.current;
    if (g && g.startNextRound) g.startNextRound();
  };

  const fmtTime = (ms: number) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const phase = hudState.phase;
  const isQuestion = phase === 'question';
  const isReveal = phase === 'reveal';
  const sortedPlayers = [...hudState.players].sort((a: any, b: any) => b.score - a.score);
  const timerCritical = hudState.remainingMs < 5000;

  return (
    <div className="bloom-root font-body relative w-full h-full overflow-hidden" style={{ background: '#05071A' }}>
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-3 transition-all hover:scale-105" style={{
          background: 'rgba(10, 18, 38, 0.85)', border: '2px solid #6EE7FF', borderRadius: '9999px',
          color: '#6EE7FF', boxShadow: '0 0 24px rgba(110, 231, 255, 0.35)',
        }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="font-cute text-xs font-bold flex items-center gap-2 px-4 py-2.5" style={{
          letterSpacing: '0.18em',
          background: 'rgba(10, 18, 38, 0.85)', border: '2px solid #6EE7FF', borderRadius: 9999,
          color: '#6EE7FF', boxShadow: '0 0 24px rgba(110, 231, 255, 0.2)',
        }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#6EE7FF', boxShadow: '0 0 8px #6EE7FF' }} />
          <span>TRIVIA ARENA</span>
          {phase !== 'loading' && (
            <>
              <span style={{ color: 'rgba(110,231,255,0.4)' }}>·</span>
              <span style={{ color: '#FF7AC6' }}>R{hudState.round}</span>
              <span style={{ color: 'rgba(110,231,255,0.4)' }}>·</span>
              <span>Q{Math.min(hudState.qIndex + 1, ARENA_QUESTIONS_PER_ROUND)}/{ARENA_QUESTIONS_PER_ROUND}</span>
            </>
          )}
        </div>
        {hudState.category && (
          <div className="font-cute text-[11px] font-bold px-3 py-2" style={{
            letterSpacing: '0.18em',
            background: 'rgba(255, 122, 198, 0.15)', border: '1.5px solid #FF7AC6', borderRadius: 9999,
            color: '#FF7AC6',
          }}>
            ◆ {hudState.category.toUpperCase()}
          </div>
        )}
      </div>

      {isQuestion && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <div className="font-cute font-bold text-center px-6 py-2" style={{
            background: 'rgba(10, 18, 38, 0.92)',
            border: `2.5px solid ${timerCritical ? '#FF5A78' : '#6EE7FF'}`,
            borderRadius: 18,
            color: timerCritical ? '#FF5A78' : '#6EE7FF',
            fontSize: 36, letterSpacing: '0.15em',
            boxShadow: `0 0 30px ${timerCritical ? 'rgba(255,90,120,0.4)' : 'rgba(110,231,255,0.3)'}`,
            minWidth: 140,
          }}>
            {fmtTime(hudState.remainingMs)}
          </div>
        </div>
      )}

      <div className="absolute top-6 right-6 z-10">
        <div className="font-cute text-base font-bold flex items-center gap-2 px-5 py-2.5" style={{
          background: 'rgba(10, 18, 38, 0.85)', border: '2px solid #6EE7FF', borderRadius: 9999,
          color: '#E6F8FF', boxShadow: '0 0 24px rgba(110, 231, 255, 0.2)',
        }}>
          <Sparkles className="w-4 h-4" style={{ color: '#6EE7FF' }} />
          <span>{config?.name || 'You'}</span>
        </div>
      </div>

      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-10 flex flex-col gap-2" style={{ minWidth: 210 }}>
        <div className="font-cute text-[10px] font-bold px-3 py-1.5 text-center" style={{
          letterSpacing: '0.22em',
          background: 'rgba(10, 18, 38, 0.85)', border: '1.5px solid #6EE7FF', borderRadius: 9999, color: '#6EE7FF',
        }}>
          LEADERBOARD
        </div>
        {sortedPlayers.map((p: any, rank: number) => (
          <div key={p.id} className="font-cute text-xs font-bold flex items-center justify-between px-3 py-2" style={{
            background: p.id === 'you' ? 'rgba(110, 231, 255, 0.12)' : 'rgba(10, 18, 38, 0.85)',
            border: `2px solid ${p.color}`,
            borderRadius: 14,
            color: '#E6F8FF',
            boxShadow: p.id === 'you' ? `0 0 16px ${p.color}55` : 'none',
            transition: 'all 0.25s ease',
          }}>
            <div className="flex items-center gap-2">
              <span style={{ color: p.color, fontSize: 13 }}>#{rank + 1}</span>
              <span>{p.name}</span>
              {p.streak >= 2 && <span style={{ color: '#FFC56E', fontSize: 11 }}>⚡{p.streak}</span>}
            </div>
            <span style={{ color: p.color, fontSize: 15 }}>{p.score}</span>
          </div>
        ))}
      </div>

      {(isQuestion || isReveal) && hudState.question && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10" style={{ maxWidth: '780px', width: 'calc(100vw - 280px)' }}>
          <div className="px-6 py-4 mb-3 text-center" style={{
            background: 'rgba(10, 18, 38, 0.92)',
            border: '2px solid #6EE7FF',
            borderRadius: 18,
            color: '#E6F8FF',
            fontSize: 18, fontWeight: 600, lineHeight: 1.35,
            boxShadow: '0 0 30px rgba(110, 231, 255, 0.2)',
          }}>
            {hudState.question}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {hudState.answers.map((ans: string, i: number) => {
              const colorHex = '#' + ARENA_PLATFORM_COLORS[i].toString(16).padStart(6, '0');
              const isPlayerChoice = hudState.selected === i;
              const isCorrectReveal = isReveal && i === hudState.correctIdx;
              const isWrongReveal = isReveal && i !== hudState.correctIdx;
              return (
                <button
                  key={i}
                  onClick={() => isQuestion && click(i)}
                  disabled={!isQuestion || isPlayerChoice}
                  className="font-cute font-bold text-left px-4 py-3 transition-all flex items-center gap-3"
                  style={{
                    background: isCorrectReveal ? 'rgba(122, 255, 154, 0.20)'
                              : isWrongReveal ? 'rgba(255, 90, 120, 0.08)'
                              : isPlayerChoice ? `${colorHex}33`
                              : 'rgba(10, 18, 38, 0.85)',
                    border: `2px solid ${isCorrectReveal ? '#7AFF9A' : isWrongReveal ? '#FF5A78' : colorHex}`,
                    borderRadius: 14,
                    color: '#E6F8FF',
                    cursor: isQuestion ? 'pointer' : 'default',
                    boxShadow: isPlayerChoice ? `0 0 16px ${colorHex}88` : 'none',
                    opacity: isWrongReveal ? 0.55 : 1,
                  }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 9999,
                    background: isCorrectReveal ? '#7AFF9A' : isWrongReveal ? '#FF5A78' : colorHex,
                    color: '#06091A', fontSize: 14,
                  }}>{ARENA_PLATFORM_LETTERS[i]}</span>
                  <span style={{ fontSize: 14 }}>{ans}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === 'roundOver' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'rgba(5, 7, 26, 0.65)' }}>
          <div className="text-center px-8 py-6" style={{
            background: 'rgba(10, 18, 38, 0.95)',
            border: '3px solid #6EE7FF',
            borderRadius: 24,
            boxShadow: '0 0 60px rgba(110, 231, 255, 0.45)',
            minWidth: 380,
          }}>
            <div className="font-cute text-xs font-bold mb-2" style={{ color: '#6EE7FF', letterSpacing: '0.25em' }}>
              ◆ ROUND {hudState.round} COMPLETE ◆
            </div>
            <div className="font-body font-bold mb-4" style={{ color: '#E6F8FF', fontSize: 30 }}>
              {sortedPlayers[0]?.name} takes the round
            </div>
            <div className="flex flex-col gap-2 mb-5">
              {sortedPlayers.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2" style={{
                  background: 'rgba(10, 18, 38, 0.6)',
                  border: `1.5px solid ${p.color}`,
                  borderRadius: 10,
                  color: '#E6F8FF',
                }}>
                  <span className="font-cute font-bold" style={{ color: p.color }}>#{i + 1} {p.name}</span>
                  <span className="font-cute font-bold" style={{ color: p.color, fontSize: 16 }}>{p.score}</span>
                </div>
              ))}
            </div>
            <button onClick={nextRound}
              className="font-cute font-bold px-6 py-3 transition-all hover:scale-105"
              style={{
                background: '#6EE7FF', color: '#06091A',
                border: 'none', borderRadius: 9999, fontSize: 14, letterSpacing: '0.18em',
                boxShadow: '0 0 24px rgba(110, 231, 255, 0.55)',
                cursor: 'pointer',
              }}>
              NEXT ROUND  ▶
            </button>
            <div className="font-cute text-[10px] mt-3" style={{ color: 'rgba(230, 248, 255, 0.5)' }}>
              press SPACE to continue · ESC to exit
            </div>
          </div>
        </div>
      )}

      {phase === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-center px-6 py-5" style={{
            background: 'rgba(10, 18, 38, 0.85)',
            border: '2px solid #6EE7FF',
            borderRadius: 18,
            color: '#6EE7FF',
            boxShadow: '0 0 40px rgba(110, 231, 255, 0.4)',
            animation: 'pulse-glow 1.6s ease-in-out infinite',
          }}>
            <div className="font-cute font-bold" style={{ fontSize: 22, letterSpacing: '0.2em' }}>
              INITIALIZING ARENA…
            </div>
            <div className="font-cute text-[11px] mt-2" style={{ color: 'rgba(110, 231, 255, 0.7)' }}>
              linking to global question feed
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-6 z-10 font-cute text-[10px]" style={{
        background: 'rgba(10, 18, 38, 0.7)',
        border: '1.5px solid rgba(110, 231, 255, 0.4)',
        borderRadius: 12,
        color: 'rgba(230, 248, 255, 0.75)',
        padding: '8px 12px',
        letterSpacing: '0.1em',
      }}>
        <div className="mb-1"><span style={{ color: '#6EE7FF' }}>1 2 3 4</span> — answer</div>
        <div><span style={{ color: '#6EE7FF' }}>ESC</span> — return to Wee Street</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// MAIN APP — phase orchestration
// ────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState('intro');
  const [captures, setCaptures] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  return (
    <>
      <style>{STYLES}</style>
      <div className="bloom-root w-full h-screen overflow-hidden" style={{
        background: '#FFE9D9',
        color: '#3D2418',
      }}>
        {phase === 'intro' && (
          <Intro onBegin={() => setPhase('scan')} />
        )}
        {phase === 'scan' && (
          <Scan
            onComplete={(caps) => { setCaptures(caps); setPhase('analyze'); }}
            onSkip={() => { setCaptures(null); setPhase('analyze'); }}
          />
        )}
        {phase === 'analyze' && (
          <Analyze
            captures={captures}
            onComplete={(cfg) => { setConfig(cfg); setPhase('customize'); }}
          />
        )}
        {phase === 'customize' && (
          <Customize
            config={config}
            onChange={setConfig}
            onEnter={() => {
              // persist this character so it shows up as one of the 3 featured
              // avatars on the landing the next time someone lands on the page
              saveCharacter(config);
              setPhase('world');
            }}
          />
        )}
        {phase === 'world' && (
          <World
            config={config}
            onBack={() => setPhase('customize')}
            onEnter={(shop: any) => {
              const phases: Record<string, string> = {
                community: 'community',
                arena: 'arena',
                arcade: 'arcade',
                studio: 'studio',
                garden: 'garden',
                theater: 'theater',
                market: 'market',
              };
              const next = phases[shop?.id];
              if (next) { setPhase(next); return true; }
              return false;
            }}
          />
        )}
        {phase === 'community' && (
          <Community config={config} onBack={() => setPhase('world')} />
        )}
        {phase === 'arena' && (
          <Arena config={config} onBack={() => setPhase('world')} />
        )}
        {phase === 'arcade' && (
          <Arcade config={config} onBack={() => setPhase('world')} />
        )}
        {phase === 'studio' && (
          <Studio config={config} onBack={() => setPhase('world')} />
        )}
        {phase === 'garden' && (
          <Garden config={config} onBack={() => setPhase('world')} />
        )}
        {phase === 'theater' && (
          <Theater config={config} onBack={() => setPhase('world')} />
        )}
        {phase === 'market' && (
          <Market config={config} onBack={() => setPhase('world')} />
        )}
      </div>
    </>
  );
}
