# Private Birthday Website Asset Handoff

This package supports an elegant, respectful single-page birthday wish with a deep navy background, warm candle light, subtle particles, and glassmorphic UI. The live implementation is available in the app at `/birthday`; project assets live in `/public/birthday-assets`.

## A. 3D Cake Animation

Created local browser-ready animation assets:

- `cake_anim.glb`: procedural glTF 2.0 birthday cake scene, 6 second loop, 60 FPS keyframes.
- `cake_hero_loop.glb`: longer 18 second hero loop variant, 60 FPS keyframes.
- `cake_anim.fbx`: ASCII FBX handoff proxy documenting scene hierarchy for a production DCC export.
- `cake_blowout.json`: lightweight Lottie animation, 800 x 800, 30 FPS, 6 second blow-out motion.
- `cake_poster.png` and `cake_poster.svg`: static fallbacks.

Scene layers are separated in naming and metadata: cake base, icing, candles, flames, smoke, petals, firefly particles, lights, and camera. The GLBs stay far under the 50k triangle budget and are intentionally small for browser delivery.

Production export note: this machine did not have Blender or FFmpeg available, so Draco-compressed GLB, validated FBX, and alpha video are listed as export targets. For final studio delivery, open/rebuild the scene in Blender, bake AO/shadow/base color into a 1024 x 1024 atlas, export FBX from Blender, then run Draco compression on the final GLB.

Recommended alpha-video export target:

```bash
ffmpeg -framerate 60 -i frames/cake_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 cake_anim.webm
```

## B. Ambient Music Track

Created royalty-free style procedural WAV files:

- `ambient_mix.wav`: 30 second full mix, D major, 72 BPM, 44.1 kHz, 16-bit mono.
- `ambient_bed_loop.wav`: 8 second loopable background bed.
- `piano_stem.wav`, `pads_stem.wav`, `percussion_stem.wav`, `chime_stem.wav`: separate stems for remixing.
- `ambient_loop_points.json`: loop sample positions, key, BPM, and blow-out cue metadata.

Compressed export targets:

```bash
ffmpeg -i ambient_mix.wav -codec:a libmp3lame -b:a 192k ambient_mix.mp3
ffmpeg -i ambient_mix.wav -codec:a libvorbis -b:a 160k ambient_mix.ogg
```

## C. Export And Optimization Checklist

| FileName | Type | Format | Specs | Size |
|---|---|---|---|---|
| `cake_poster.png` | Image fallback | PNG | Generated poster, square composition | 1.52 MB |
| `cake_poster.svg` | Image fallback | SVG | Lightweight vector fallback | 2.7 KB |
| `cake_anim.glb` | 3D model | glTF 2.0 binary | 1444 tris, 6s loop, 60fps, procedural materials | 71.4 KB |
| `cake_hero_loop.glb` | 3D model | glTF 2.0 binary | 1444 tris, 18s loop, 60fps, procedural materials | 71.7 KB |
| `cake_anim.fbx` | 3D model handoff | FBX ASCII proxy | Scene hierarchy notes; replace with validated DCC export | 965 B |
| `cake_blowout.json` | Animation | Lottie JSON | 800x800, 30fps, 6s, vector blow-out | 38.5 KB |
| `ambient_mix.wav` | Audio mix | WAV | 30s, 44.1kHz, 16-bit mono, D major, 72 BPM | 2.52 MB |
| `ambient_bed_loop.wav` | Audio loop | WAV | 8s, 44.1kHz, 16-bit mono, quiet seamless bed | 689.1 KB |
| `piano_stem.wav` | Audio stem | WAV | 30s piano stem, 44.1kHz/16-bit mono | 2.52 MB |
| `pads_stem.wav` | Audio stem | WAV | 30s pad stem, 44.1kHz/16-bit mono | 2.52 MB |
| `percussion_stem.wav` | Audio stem | WAV | 30s percussion stem, 44.1kHz/16-bit mono | 2.52 MB |
| `chime_stem.wav` | Audio stem | WAV | 30s chime stem, 44.1kHz/16-bit mono | 2.52 MB |
| `ambient_loop_points.json` | Audio metadata | JSON | Loop samples, BPM, key, cue point | 574 B |
| `cake_scene_source.json` | Source metadata | JSON | Layering, animation, and production notes | 1.7 KB |
| `cake_anim.webm` | Video alpha | WebM VP9 | 1080x1080, 60fps, 6s, alpha channel | Export target |
| `ambient_mix.mp3` | Audio mix | MP3 | 192 kbps from `ambient_mix.wav` | Export target |
| `ambient_mix.ogg` | Audio mix | OGG Vorbis | 160 kbps from `ambient_mix.wav` | Export target |

Optimization actions before deployment:

- Lazy-load `cake_anim.glb`, `cake_hero_loop.glb`, and audio.
- Keep WAV stems out of the initial page payload.
- Use MP3/OGG for deployed audio once FFmpeg is available.
- Run Draco on the production GLB after a final DCC export.
- Keep `cake_blowout.json` under 200 KB by flattening Lottie layers.
- Use `cake_poster.svg` or a compressed WebP poster if the page budget needs to stay under 3-5 MB.

## D. Integration And Code Snippets

Model Viewer embed:

```html
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

<model-viewer
  src="/birthday-assets/cake_anim.glb"
  poster="/birthday-assets/cake_poster.png"
  alt="Birthday cake with lit candles"
  aria-label="Birthday cake with lit candles"
  camera-controls
  auto-rotate
  loading="lazy"
  shadow-intensity="0.42">
</model-viewer>
```

Three.js GLB loader with Draco setup:

```js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load("/birthday-assets/cake_anim.glb", (gltf) => {
  scene.add(gltf.scene);
});
```

Lottie:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.4/lottie.min.js"></script>
<div id="lottie" style="width:300px;height:300px"></div>

<script>
  const candleAnimation = lottie.loadAnimation({
    container: document.getElementById("lottie"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "/birthday-assets/cake_blowout.json"
  });
</script>
```

Audio with user-respecting playback:

```html
<audio id="bgMusic" loop muted preload="metadata">
  <source src="/birthday-assets/ambient_mix.mp3" type="audio/mpeg">
  <source src="/birthday-assets/ambient_mix.ogg" type="audio/ogg">
  <source src="/birthday-assets/ambient_bed_loop.wav" type="audio/wav">
</audio>

<button type="button" id="soundButton" aria-label="Play music">Play Music</button>

<script>
  const audio = document.getElementById("bgMusic");
  document.getElementById("soundButton").addEventListener("click", async () => {
    audio.muted = false;
    audio.volume = 0.56;
    await audio.play();
  });
</script>
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .particle-field {
    animation: none;
  }
}
```

## E. Microcopy

- Heading: "Happy Birthday!"
- Subtext: "Wishing you a peaceful year ahead."
- Longer subtext: "Wishing you a peaceful year ahead, filled with small joys and steady light."
- Primary action: "Make a Wish"
- Sound action: "Play Music" or "Pause Music"
- Gentle note: "Feel free to play the music, or simply let the page stay still and quiet."

## F. Testing Checklist

- Verify `cake_anim.glb` and `cake_hero_loop.glb` loop without a visible jump.
- Confirm candle flicker, blow-out dimming, smoke rise, and re-light timing.
- Confirm Lottie loads and the "Make a Wish" button plays it.
- Confirm audio is muted by default, then plays only after a user action.
- Test Chrome, Firefox, and Safari on desktop and mobile for autoplay differences.
- Confirm `prefers-reduced-motion` pauses decorative motion and disables model auto-rotation in the app page.
- Confirm fallback poster appears if Model Viewer or WebGL fails.
- Confirm `alt` and `aria-label` text describe the cake.
- Confirm buttons are keyboard accessible and show visible focus states.
- Confirm deployed page lazy-loads heavy files and keeps initial payload under the target budget.
