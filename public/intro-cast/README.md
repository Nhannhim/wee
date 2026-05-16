# Landing-page demo characters

The three avatars on the Wee landing page are populated **automatically** from
characters visitors create in the flow. The most recent character a visitor
finishes (auto-saved when they hit *"enter your world"*) shows up in the leftmost
landing-page slot the next time they load the page, and older saved characters
fill in behind it. If they haven't created any characters yet, a built-in cast
(Pip / Sage / Milo) fills the slots as primitive Mii-style avatars.

See:
- [lib/savedCharacters.ts](../../lib/savedCharacters.ts) — localStorage helpers
- `IntroStage` in [components/bloom.tsx](../../components/bloom.tsx) — merges saved + defaults
- `INTRO_CAST` in [components/bloom.tsx](../../components/bloom.tsx) — the default cast

## Manually seeding photo-wrapped demo characters (optional)

This folder also exists as a static drop zone if you want to hand-author a
landing-page character that isn't tied to a visitor's saved state. Drop photo
sets like the names below and then point `INTRO_CAST` entries at the paths
(`faceTexture: '/intro-cast/pip-front.jpg'`, etc.) instead of `null`:

```
pip-front.jpg    pip-left.jpg    pip-right.jpg
sage-front.jpg   sage-left.jpg   sage-right.jpg
milo-front.jpg   milo-left.jpg   milo-right.jpg
```

- `*-front.jpg` — looking straight at the camera, face centered
- `*-left.jpg`  — head turned to your **left** (camera sees your right cheek)
- `*-right.jpg` — head turned to your **right** (camera sees your left cheek)

Square crops (1:1) work best, ~512×512 is plenty. JPG or PNG both fine. Using
one photo for all three angles is also fine for quick demos.
