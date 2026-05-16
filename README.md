# Wee

A walkable 3D avatar/social experience built with Next.js + vanilla Three.js. Players scan their face to generate a stylized Mii-like avatar, then explore **Wee Street** — a cozy plaza with 7 portals leading to themed sub-worlds:

- 👋 **Community** — social plaza, NPCs, emote wheel
- 🧠 **Trivia Arena** — futuristic stadium with live trivia rounds vs. simulated AI agents (questions pulled from the [Open Trivia DB](https://opentdb.com/))
- 🕹️ **Arcade** — interior with 8 cabinets; 3 are playable mini-games:
  - 🚇 *Subway Surfer* — 3-lane endless runner
  - 🌾 *Hay Day* — grid farming with crop economy
  - 🚀 *Among Us* — top-down ship with tasks + bot imposter (wires / pump / sequence mini-tasks)
- 🎨 **Studio** · 🌿 **Garden** · 🎭 **Theater** · 🛍️ **Plaza Mart** — themed social rooms

The entire app lives in a single ~7,000-line component: [components/bloom.tsx](components/bloom.tsx).

## Stack

- Next.js 16 + React 19
- Three.js 0.184 (vanilla, no R3F)
- TailwindCSS v4 + Radix UI
- TypeScript

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Controls

- **WASD** / arrow keys — walk
- **E** — interact (enter portal, play arcade game, etc.)
- **1-4** — answer trivia / select crop in Hay Day
- **ESC** — back out of a sub-world or mini-game

## License

Private — all rights reserved.
