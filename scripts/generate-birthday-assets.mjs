import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const assetDir = join(root, "public", "birthday-assets");
const sampleRate = 44_100;
let noiseSeed = 12_345;

async function main() {
  await mkdir(assetDir, { recursive: true });

  const lottie = createLottie();
  await writeJson("cake_blowout.json", lottie);
  await writeFile(join(assetDir, "cake_poster.svg"), createPosterSvg());

  const audio = createAudioPack();
  await Promise.all(
    Object.entries(audio.files).map(([name, samples]) =>
      writeFile(join(assetDir, name), wavBuffer(samples, sampleRate))
    )
  );
  await writeJson("ambient_loop_points.json", audio.loopPoints);

  const shortGlb = buildCakeGlb({ duration: 6, fps: 60, hero: false });
  const heroGlb = buildCakeGlb({ duration: 18, fps: 60, hero: true });
  await writeFile(join(assetDir, "cake_anim.glb"), shortGlb.buffer);
  await writeFile(join(assetDir, "cake_hero_loop.glb"), heroGlb.buffer);
  await writeFile(join(assetDir, "cake_anim.fbx"), createFbxProxy(shortGlb.stats));
  await writeJson("cake_scene_source.json", {
    generator: "scripts/generate-birthday-assets.mjs",
    style: "Elegant, respectful private birthday website asset pack",
    palette: {
      navy: "#001A33",
      candleGlow: "#ffbe64",
      icing: "#f2d9b1",
      pastelPetals: ["#e8a4ae", "#c9b7e6", "#f2c7aa"]
    },
    animations: [
      {
        file: "cake_anim.glb",
        durationSeconds: 6,
        fps: 60,
        action: "Slow camera push, candle flicker, blow-out, smoke rise, relight for seamless loop"
      },
      {
        file: "cake_hero_loop.glb",
        durationSeconds: 18,
        fps: 60,
        action: "Longer hero loop with repeated glow and blow-out timing"
      }
    ],
    meshLayers: [
      "cake_base",
      "icing_top",
      "icing_trim",
      "candles",
      "flames",
      "smoke",
      "petals",
      "particles",
      "lights",
      "camera"
    ],
    productionNotes: [
      "The GLB files are browser-ready glTF 2.0 procedural models with transform animation.",
      "Draco compression and baked texture maps require a DCC/export toolchain such as Blender plus gltf-transform.",
      "The FBX file is an ASCII handoff proxy generated without DCC validation; replace with a Blender FBX export for production."
    ],
    shortGlbStats: shortGlb.stats,
    heroGlbStats: heroGlb.stats
  });

  await writeManifest({ shortGlb, heroGlb, audio });
}

async function writeJson(fileName, value) {
  await writeFile(join(assetDir, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

function createAudioPack() {
  const duration = 30;
  const blowoutAt = 18;
  const piano = new Float32Array(duration * sampleRate);
  const pads = new Float32Array(duration * sampleRate);
  const percussion = new Float32Array(duration * sampleRate);
  const chime = new Float32Array(duration * sampleRate);

  const chordSlots = [
    ["D4", "F#4", "A4", "C#5"],
    ["B3", "D4", "F#4", "A4"],
    ["G3", "B3", "D4", "A4"],
    ["A3", "D4", "E4", "A4"],
    ["D4", "F#4", "A4", "E5"],
    ["B3", "D4", "F#4", "C#5"],
    ["G3", "B3", "D4", "F#4"],
    ["A3", "C#4", "E4", "A4"]
  ];

  const slot = duration / chordSlots.length;
  chordSlots.forEach((chord, index) => {
    const start = index * slot;
    chord.forEach((note, noteIndex) => {
      addPluck(piano, start + noteIndex * 0.07, slot * 0.86, noteToHz(note), 0.13 - noteIndex * 0.01);
      addPad(pads, start, slot + 0.4, noteToHz(note) / 2, 0.035);
      addPad(pads, start + 0.25, slot, noteToHz(note) * 0.997, 0.018);
    });
  });

  for (let t = 0; t < duration; t += 60 / 72) {
    addBrush(percussion, t, 0.18, 0.035);
  }
  for (let t = 0; t < duration; t += (60 / 72) * 4) {
    addSoftKick(percussion, t, 0.42, 0.055);
  }
  ["D6", "A5", "F#5", "E6"].forEach((note, index) => {
    addBell(chime, blowoutAt + index * 0.18, 2.4, noteToHz(note), 0.16 - index * 0.015);
  });

  const mix = mixBuffers([
    [piano, 0.92],
    [pads, 1.12],
    [percussion, 0.78],
    [chime, 0.95]
  ]);

  const bed = new Float32Array(8 * sampleRate);
  const bedPiano = new Float32Array(8 * sampleRate);
  const bedPads = new Float32Array(8 * sampleRate);
  const bedPercussion = new Float32Array(8 * sampleRate);
  [
    ["D4", "F#4", "A4", "C#5"],
    ["G3", "B3", "D4", "A4"]
  ].forEach((chord, index) => {
    chord.forEach((note, noteIndex) => {
      addPluck(bedPiano, index * 4 + noteIndex * 0.08, 3.4, noteToHz(note), 0.09);
      addPad(bedPads, index * 4, 4.2, noteToHz(note) / 2, 0.04);
    });
  });
  for (let t = 0; t < 8; t += 60 / 72) addBrush(bedPercussion, t, 0.16, 0.025);
  const bedMix = mixBuffers([
    [bedPiano, 0.9],
    [bedPads, 1.15],
    [bedPercussion, 0.65]
  ]);
  bed.set(bedMix);

  return {
    files: {
      "ambient_mix.wav": normalize(mix, 0.86),
      "ambient_bed_loop.wav": normalize(bed, 0.78),
      "piano_stem.wav": normalize(piano, 0.82),
      "pads_stem.wav": normalize(pads, 0.82),
      "percussion_stem.wav": normalize(percussion, 0.7),
      "chime_stem.wav": normalize(chime, 0.78)
    },
    loopPoints: {
      sampleRate,
      bitDepth: 16,
      channels: 1,
      key: "D major",
      bpm: 72,
      fullMix: {
        file: "ambient_mix.wav",
        durationSeconds: duration,
        loopStartSample: 0,
        loopEndSample: duration * sampleRate,
        blowoutCueSecond: blowoutAt
      },
      bedLoop: {
        file: "ambient_bed_loop.wav",
        durationSeconds: 8,
        loopStartSample: 0,
        loopEndSample: 8 * sampleRate,
        note: "No distinct climax; intended for quiet background looping."
      },
      stems: ["piano_stem.wav", "pads_stem.wav", "percussion_stem.wav", "chime_stem.wav"]
    }
  };
}

function noteToHz(note) {
  const match = /^([A-G])(#?)(-?\d)$/.exec(note);
  if (!match) throw new Error(`Invalid note ${note}`);
  const semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1]] + (match[2] ? 1 : 0);
  const midi = (Number(match[3]) + 1) * 12 + semitone;
  return 440 * 2 ** ((midi - 69) / 12);
}

function addPluck(buffer, start, duration, freq, gain) {
  const startIndex = Math.floor(start * sampleRate);
  const length = Math.min(buffer.length - startIndex, Math.floor(duration * sampleRate));
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.035);
    const decay = Math.exp(-t * 1.9);
    const release = Math.min(1, (duration - t) / 0.28);
    const env = attack * decay * Math.max(0, release);
    const tone =
      Math.sin(Math.PI * 2 * freq * t) +
      Math.sin(Math.PI * 2 * freq * 2.01 * t) * 0.22 +
      Math.sin(Math.PI * 2 * freq * 3.01 * t) * 0.08;
    buffer[startIndex + i] += tone * gain * env;
  }
}

function addPad(buffer, start, duration, freq, gain) {
  const startIndex = Math.floor(start * sampleRate);
  const length = Math.min(buffer.length - startIndex, Math.floor(duration * sampleRate));
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 1.4);
    const release = Math.min(1, (duration - t) / 1.4);
    const tremolo = 0.92 + 0.08 * Math.sin(Math.PI * 2 * 0.13 * (start + t));
    const tone =
      Math.sin(Math.PI * 2 * freq * t) * 0.62 +
      Math.sin(Math.PI * 2 * freq * 1.505 * t) * 0.22 +
      Math.sin(Math.PI * 2 * freq * 2.01 * t) * 0.1;
    buffer[startIndex + i] += tone * gain * attack * Math.max(0, release) * tremolo;
  }
}

function noise() {
  noiseSeed = (noiseSeed * 16_807) % 2_147_483_647;
  return noiseSeed / 2_147_483_647;
}

function addBrush(buffer, start, duration, gain) {
  const startIndex = Math.floor(start * sampleRate);
  const length = Math.min(buffer.length - startIndex, Math.floor(duration * sampleRate));
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 16);
    const n = (noise() * 2 - 1) * 0.8;
    const high = n - previous * 0.82;
    previous = n;
    buffer[startIndex + i] += high * gain * env;
  }
}

function addSoftKick(buffer, start, duration, gain) {
  const startIndex = Math.floor(start * sampleRate);
  const length = Math.min(buffer.length - startIndex, Math.floor(duration * sampleRate));
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const freq = 88 * Math.exp(-t * 5) + 38;
    buffer[startIndex + i] += Math.sin(Math.PI * 2 * freq * t) * gain * Math.exp(-t * 8);
  }
}

function addBell(buffer, start, duration, freq, gain) {
  const startIndex = Math.floor(start * sampleRate);
  const length = Math.min(buffer.length - startIndex, Math.floor(duration * sampleRate));
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 1.45);
    const tone =
      Math.sin(Math.PI * 2 * freq * t) * 0.85 +
      Math.sin(Math.PI * 2 * freq * 2.76 * t) * 0.18 +
      Math.sin(Math.PI * 2 * freq * 4.1 * t) * 0.08;
    buffer[startIndex + i] += tone * gain * env;
  }
}

function mixBuffers(items) {
  const out = new Float32Array(items[0][0].length);
  for (const [buffer, gain] of items) {
    for (let i = 0; i < out.length; i += 1) out[i] += buffer[i] * gain;
  }
  return out;
}

function normalize(buffer, ceiling) {
  let peak = 0;
  for (const sample of buffer) peak = Math.max(peak, Math.abs(sample));
  if (peak === 0) return buffer;
  const gain = ceiling / peak;
  const out = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i += 1) out[i] = buffer[i] * gain;
  return out;
}

function wavBuffer(samples, rate) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

function createLottie() {
  const w = 800;
  const h = 800;
  const fr = 30;
  const op = 180;
  const layers = [
    ellipseLayer("navy_backdrop", 1, [400, 400, 0], [860, 860], [0.001, 0.102, 0.2, 1], 100, 0, op),
    ellipseLayer("soft_cake_shadow", 2, [400, 596, 0], [430, 72], [0, 0, 0, 1], 28, 0, op),
    ellipseLayer("cake_side", 3, [400, 520, 0], [390, 180], [0.86, 0.7, 0.49, 1], 100, 0, op),
    ellipseLayer("cake_top", 4, [400, 448, 0], [410, 138], [0.96, 0.84, 0.66, 1], 100, 0, op),
    ellipseLayer("icing_highlight", 5, [400, 430, 0], [345, 84], [1, 0.92, 0.74, 1], 75, 0, op)
  ];

  [-88, 0, 88].forEach((x, idx) => {
    layers.push(rectLayer(`candle_${idx + 1}`, 10 + idx, [400 + x, 330, 0], [16, 132], [0.96, 0.78, 0.48, 1], 100, 0, op));
    layers.push(flameLayer(`flame_${idx + 1}`, 20 + idx, [400 + x, 251, 0]));
    layers.push(smokeLayer(`smoke_${idx + 1}`, 30 + idx, [400 + x, 248, 0], idx * 7));
  });

  const particlePositions = [
    [152, 228],
    [229, 312],
    [604, 225],
    [665, 342],
    [196, 516],
    [612, 542],
    [314, 196],
    [492, 166],
    [520, 464]
  ];
  particlePositions.forEach(([x, y], index) => {
    layers.push(ellipseLayer(`firefly_${index + 1}`, 50 + index, [x, y, 0], [9, 9], [1, 0.68, 0.25, 1], 78, 0, op));
  });

  return {
    v: "5.9.0",
    fr,
    ip: 0,
    op,
    w,
    h,
    nm: "cake_blowout",
    ddd: 0,
    assets: [],
    meta: {
      g: "Codex procedural birthday asset generator",
      a: "Private respectful birthday wish animation"
    },
    layers
  };
}

function baseLayer(name, ind, position, opacity = 100, ip = 0, op = 180) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: opacity },
      r: { a: 0, k: 0 },
      p: { a: 0, k: position },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] }
    },
    ao: 0,
    ip,
    op,
    st: 0,
    bm: 0,
    shapes: []
  };
}

function ellipseLayer(name, ind, position, size, color, opacity, ip, op) {
  const layer = baseLayer(name, ind, position, opacity, ip, op);
  layer.shapes.push(
    { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: size }, nm: `${name}_ellipse` },
    { ty: "fl", c: { a: 0, k: color }, o: { a: 0, k: opacity }, r: 1, bm: 0, nm: `${name}_fill` }
  );
  return layer;
}

function rectLayer(name, ind, position, size, color, opacity, ip, op) {
  const layer = baseLayer(name, ind, position, opacity, ip, op);
  layer.shapes.push(
    { ty: "rc", p: { a: 0, k: [0, 0] }, s: { a: 0, k: size }, r: { a: 0, k: 5 }, nm: `${name}_rect` },
    { ty: "fl", c: { a: 0, k: color }, o: { a: 0, k: opacity }, r: 1, bm: 0, nm: `${name}_fill` }
  );
  return layer;
}

function flameLayer(name, ind, position) {
  const layer = ellipseLayer(name, ind, position, [28, 54], [1, 0.67, 0.26, 1], 100, 0, 180);
  layer.ks.s = {
    a: 1,
    k: [
      { t: 0, s: [100, 100, 100] },
      { t: 42, s: [112, 91, 100] },
      { t: 88, s: [82, 122, 100] },
      { t: 103, s: [8, 8, 100] },
      { t: 137, s: [8, 8, 100] },
      { t: 170, s: [100, 100, 100] }
    ]
  };
  layer.ks.o = {
    a: 1,
    k: [
      { t: 0, s: [100] },
      { t: 96, s: [100] },
      { t: 108, s: [0] },
      { t: 148, s: [0] },
      { t: 170, s: [100] }
    ]
  };
  return layer;
}

function smokeLayer(name, ind, position, offset) {
  const layer = ellipseLayer(name, ind, position, [22, 22], [0.88, 0.91, 0.94, 1], 0, 0, 180);
  layer.ks.p = {
    a: 1,
    k: [
      { t: 92 + offset, s: position },
      { t: 121 + offset, s: [position[0] + 16, position[1] - 78, 0] },
      { t: 160 + offset, s: [position[0] - 10, position[1] - 124, 0] }
    ]
  };
  layer.ks.s = {
    a: 1,
    k: [
      { t: 92 + offset, s: [30, 30, 100] },
      { t: 130 + offset, s: [120, 120, 100] },
      { t: 170 + offset, s: [20, 20, 100] }
    ]
  };
  layer.ks.o = {
    a: 1,
    k: [
      { t: 88 + offset, s: [0] },
      { t: 112 + offset, s: [42] },
      { t: 158 + offset, s: [0] }
    ]
  };
  return layer;
}

function createPosterSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="Birthday cake with lit candles">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="68%">
      <stop offset="0%" stop-color="#07345f"/>
      <stop offset="58%" stop-color="#001a33"/>
      <stop offset="100%" stop-color="#000b18"/>
    </radialGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="11" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <g opacity=".9" filter="url(#glow)">
    <circle cx="151" cy="237" r="4" fill="#ffc96a"/>
    <circle cx="621" cy="198" r="3" fill="#ffc96a"/>
    <circle cx="676" cy="513" r="4" fill="#ffc96a"/>
    <circle cx="230" cy="565" r="3" fill="#ffc96a"/>
    <circle cx="487" cy="292" r="5" fill="#ffc96a"/>
  </g>
  <ellipse cx="400" cy="610" rx="246" ry="54" fill="#000814" opacity=".42"/>
  <ellipse cx="400" cy="509" rx="220" ry="102" fill="#d7b882"/>
  <rect x="180" y="438" width="440" height="142" rx="72" fill="#e5c894"/>
  <ellipse cx="400" cy="438" rx="220" ry="98" fill="#f5dcac"/>
  <ellipse cx="400" cy="421" rx="182" ry="62" fill="#fff0c8" opacity=".55"/>
  <g fill="#f4dfbd">
    <circle cx="205" cy="530" r="18"/><circle cx="247" cy="557" r="16"/><circle cx="296" cy="573" r="17"/>
    <circle cx="354" cy="580" r="16"/><circle cx="415" cy="579" r="18"/><circle cx="477" cy="570" r="16"/>
    <circle cx="532" cy="550" r="18"/><circle cx="590" cy="520" r="17"/>
    <circle cx="224" cy="416" r="14"/><circle cx="276" cy="391" r="13"/><circle cx="338" cy="379" r="14"/>
    <circle cx="402" cy="377" r="15"/><circle cx="468" cy="389" r="13"/><circle cx="533" cy="415" r="14"/>
  </g>
  <g fill="#f1c56f">
    <rect x="306" y="265" width="15" height="132" rx="8"/><rect x="392" y="247" width="15" height="150" rx="8"/>
    <rect x="479" y="265" width="15" height="132" rx="8"/>
  </g>
  <g filter="url(#glow)">
    <ellipse cx="313.5" cy="242" rx="15" ry="36" fill="#ffbd5a"/>
    <ellipse cx="399.5" cy="224" rx="16" ry="39" fill="#ffbd5a"/>
    <ellipse cx="486.5" cy="242" rx="15" ry="36" fill="#ffbd5a"/>
    <ellipse cx="313.5" cy="251" rx="7" ry="19" fill="#fff4cf"/>
    <ellipse cx="399.5" cy="235" rx="7" ry="20" fill="#fff4cf"/>
    <ellipse cx="486.5" cy="251" rx="7" ry="19" fill="#fff4cf"/>
  </g>
  <g opacity=".72">
    <ellipse cx="281" cy="421" rx="30" ry="14" fill="#e8a4ae" transform="rotate(-20 281 421)"/>
    <ellipse cx="504" cy="423" rx="32" ry="13" fill="#c9b7e6" transform="rotate(18 504 423)"/>
    <ellipse cx="454" cy="474" rx="25" ry="11" fill="#f2c7aa" transform="rotate(-34 454 474)"/>
  </g>
</svg>
`;
}

class GltfBuilder {
  constructor() {
    this.chunks = [];
    this.byteLength = 0;
    this.bufferViews = [];
    this.accessors = [];
    this.materials = [];
    this.meshes = [];
    this.triangles = 0;
  }

  addMaterial(material) {
    this.materials.push(material);
    return this.materials.length - 1;
  }

  addAccessor(typedArray, type, componentType, options = {}) {
    this.align();
    const source = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    const byteOffset = this.byteLength;
    this.chunks.push(source);
    this.byteLength += source.byteLength;
    const bufferView = {
      buffer: 0,
      byteOffset,
      byteLength: source.byteLength
    };
    if (options.target) bufferView.target = options.target;
    this.bufferViews.push(bufferView);
    const count = typedArray.length / componentCount(type);
    const accessor = {
      bufferView: this.bufferViews.length - 1,
      componentType,
      count,
      type
    };
    if (options.min) accessor.min = options.min;
    if (options.max) accessor.max = options.max;
    this.accessors.push(accessor);
    return this.accessors.length - 1;
  }

  align() {
    const padding = (4 - (this.byteLength % 4)) % 4;
    if (padding > 0) {
      this.chunks.push(Buffer.alloc(padding));
      this.byteLength += padding;
    }
  }

  addMesh(name, geometry, materialIndex) {
    const positions = new Float32Array(geometry.positions);
    const normals = new Float32Array(geometry.normals);
    const indices = new Uint16Array(geometry.indices);
    const positionMinMax = minMaxVec3(positions);
    const normalAccessor = this.addAccessor(normals, "VEC3", 5126, { target: 34962 });
    const positionAccessor = this.addAccessor(positions, "VEC3", 5126, {
      target: 34962,
      min: positionMinMax.min,
      max: positionMinMax.max
    });
    const indexAccessor = this.addAccessor(indices, "SCALAR", 5123, {
      target: 34963,
      min: [0],
      max: [Math.max(...geometry.indices)]
    });
    this.meshes.push({
      name,
      primitives: [
        {
          attributes: {
            NORMAL: normalAccessor,
            POSITION: positionAccessor
          },
          indices: indexAccessor,
          material: materialIndex
        }
      ]
    });
    this.triangles += Math.floor(indices.length / 3);
    return this.meshes.length - 1;
  }

  binBuffer() {
    this.align();
    return Buffer.concat(this.chunks, this.byteLength);
  }
}

function buildCakeGlb({ duration, fps, hero }) {
  const builder = new GltfBuilder();
  const materials = {
    cake: builder.addMaterial(pbr("warm_cream_cake", [0.88, 0.72, 0.48, 1], 0.82, 0.02)),
    icing: builder.addMaterial(pbr("soft_gloss_icing", [0.96, 0.83, 0.62, 1], 0.55, 0.02)),
    candle: builder.addMaterial(pbr("muted_gold_candles", [0.95, 0.73, 0.39, 1], 0.48, 0.03)),
    flame: builder.addMaterial({
      name: "warm_candle_flame",
      emissiveFactor: [1, 0.48, 0.12],
      pbrMetallicRoughness: {
        baseColorFactor: [1, 0.58, 0.18, 0.8],
        metallicFactor: 0,
        roughnessFactor: 0.2
      },
      alphaMode: "BLEND",
      doubleSided: true
    }),
    smoke: builder.addMaterial({
      name: "soft_translucent_smoke",
      pbrMetallicRoughness: {
        baseColorFactor: [0.86, 0.9, 0.94, 0.33],
        metallicFactor: 0,
        roughnessFactor: 1
      },
      alphaMode: "BLEND",
      doubleSided: true
    }),
    petalPink: builder.addMaterial(pbr("muted_pink_petals", [0.84, 0.48, 0.58, 1], 0.72, 0)),
    petalLilac: builder.addMaterial(pbr("muted_lilac_petals", [0.65, 0.58, 0.82, 1], 0.74, 0)),
    firefly: builder.addMaterial({
      name: "tiny_warm_fireflies",
      emissiveFactor: [1, 0.62, 0.22],
      pbrMetallicRoughness: {
        baseColorFactor: [1, 0.78, 0.34, 1],
        metallicFactor: 0,
        roughnessFactor: 0.3
      }
    })
  };

  const cakeMesh = builder.addMesh("cake_base_mesh", cylinder(1.24, 0.54, 72), materials.cake);
  const topMesh = builder.addMesh("icing_top_mesh", cylinder(1.3, 0.09, 72), materials.icing);
  const sphereMesh = builder.addMesh("icing_dollop_mesh", sphere(1, 12, 8), materials.icing);
  const candleMesh = builder.addMesh("candle_mesh", cylinder(1, 1, 16), materials.candle);
  const flameMesh = builder.addMesh("flame_mesh", sphere(1, 16, 10), materials.flame);
  const smokeMesh = builder.addMesh("smoke_puff_mesh", sphere(1, 12, 8), materials.smoke);
  const petalPinkMesh = builder.addMesh("petal_pink_mesh", petal(), materials.petalPink);
  const petalLilacMesh = builder.addMesh("petal_lilac_mesh", petal(), materials.petalLilac);
  const fireflyMesh = builder.addMesh("firefly_mesh", sphere(1, 8, 6), materials.firefly);

  const nodes = [];
  const sceneNodes = [];
  const addNode = (node) => {
    nodes.push(node);
    sceneNodes.push(nodes.length - 1);
    return nodes.length - 1;
  };

  addNode({ name: "cake_base", mesh: cakeMesh, translation: [0, 0.28, 0] });
  addNode({ name: "icing_top", mesh: topMesh, translation: [0, 0.585, 0] });

  for (let i = 0; i < 34; i += 1) {
    const angle = (i / 34) * Math.PI * 2;
    const radius = 1.26;
    addNode({
      name: `icing_trim_top_${i + 1}`,
      mesh: sphereMesh,
      translation: [Math.cos(angle) * radius, 0.67, Math.sin(angle) * radius],
      rotation: quatFromEuler(0, -angle, 0),
      scale: [0.105, 0.052, 0.082]
    });
    addNode({
      name: `icing_trim_bottom_${i + 1}`,
      mesh: sphereMesh,
      translation: [Math.cos(angle) * radius, 0.09, Math.sin(angle) * radius],
      rotation: quatFromEuler(0, -angle, 0),
      scale: [0.115, 0.054, 0.088]
    });
  }

  const candleX = [-0.42, 0, 0.42];
  const flameNodes = [];
  const smokeNodes = [];
  candleX.forEach((x, index) => {
    addNode({
      name: `candle_${index + 1}`,
      mesh: candleMesh,
      translation: [x, 0.98, -0.03],
      scale: [0.035, 0.38, 0.035]
    });
    flameNodes.push(
      addNode({
        name: `flame_${index + 1}`,
        mesh: flameMesh,
        translation: [x, 1.39, -0.03],
        scale: [0.052, 0.132, 0.052]
      })
    );
    smokeNodes.push(
      addNode({
        name: `smoke_${index + 1}`,
        mesh: smokeMesh,
        translation: [x, 1.38, -0.03],
        scale: [0.001, 0.001, 0.001]
      })
    );
  });

  const petals = [
    [-1.1, 1.25, 0.45, 0.18, 0.06, 0.1],
    [1.04, 1.58, -0.1, 0.16, 0.06, -0.32],
    [-0.55, 1.72, -0.42, 0.14, 0.055, 0.25],
    [0.78, 1.08, 0.52, 0.15, 0.055, -0.15],
    [-1.35, 0.92, -0.24, 0.13, 0.05, 0.45],
    [1.32, 0.88, 0.2, 0.13, 0.05, -0.42],
    [-0.24, 1.92, 0.28, 0.12, 0.05, 0.18],
    [0.35, 1.78, -0.5, 0.12, 0.05, -0.18]
  ];
  petals.forEach(([x, y, z, sx, sy, rz], index) => {
    addNode({
      name: `drifting_petal_${index + 1}`,
      mesh: index % 2 ? petalLilacMesh : petalPinkMesh,
      translation: [x, y, z],
      rotation: quatFromEuler(0.6, index * 0.55, rz),
      scale: [sx, sy, sx * 0.75]
    });
  });

  const particleNodes = [];
  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2;
    const radius = 1.45 + (i % 5) * 0.18;
    particleNodes.push(
      addNode({
        name: `tiny_glowing_particle_${i + 1}`,
        mesh: fireflyMesh,
        translation: [Math.cos(angle) * radius, 0.72 + (i % 6) * 0.22, Math.sin(angle) * radius * 0.42],
        scale: [0.018 + (i % 3) * 0.006, 0.018 + (i % 3) * 0.006, 0.018 + (i % 3) * 0.006]
      })
    );
  }

  const cameraIndex = nodes.length;
  nodes.push({
    name: "camera_slow_push",
    camera: 0,
    translation: [0, 1.12, 4.35]
  });
  sceneNodes.push(cameraIndex);

  const warmLightIndex = nodes.length;
  nodes.push({
    name: "warm_candle_light",
    translation: [0, 1.35, 0.15],
    extensions: { KHR_lights_punctual: { light: 0 } }
  });
  sceneNodes.push(warmLightIndex);

  const keyLightIndex = nodes.length;
  nodes.push({
    name: "soft_key_light",
    translation: [2.4, 4.2, 2.8],
    rotation: quatFromEuler(-0.6, 0.5, 0),
    extensions: { KHR_lights_punctual: { light: 1 } }
  });
  sceneNodes.push(keyLightIndex);

  const animations = createGlbAnimations(builder, {
    duration,
    hero,
    cameraIndex,
    flameNodes,
    smokeNodes,
    particleNodes
  });

  const bin = builder.binBuffer();
  const gltf = {
    asset: {
      version: "2.0",
      generator: "Codex procedural birthday asset generator"
    },
    scene: 0,
    scenes: [{ name: "birthday_cake_scene", nodes: sceneNodes }],
    nodes,
    cameras: [
      {
        name: "hero_camera",
        type: "perspective",
        perspective: { yfov: 0.56, znear: 0.1, zfar: 100 }
      }
    ],
    meshes: builder.meshes,
    materials: builder.materials,
    accessors: builder.accessors,
    bufferViews: builder.bufferViews,
    buffers: [{ byteLength: bin.byteLength }],
    animations,
    extensionsUsed: ["KHR_lights_punctual"],
    extensions: {
      KHR_lights_punctual: {
        lights: [
          { name: "warm candle glow", type: "point", color: [1, 0.65, 0.28], intensity: 220, range: 3.2 },
          { name: "soft overhead key", type: "point", color: [0.68, 0.78, 1], intensity: 85, range: 7 }
        ]
      }
    },
    extras: {
      durationSeconds: duration,
      sourceFps: fps,
      loop: true,
      intendedBackground: "#001A33",
      note: "Browser-ready glTF animation. Draco compression and baked AO require a DCC export pass."
    }
  };

  const buffer = makeGlb(gltf, bin);
  return {
    buffer,
    stats: {
      durationSeconds: duration,
      fps,
      triangles: builder.triangles,
      materials: builder.materials.length,
      nodes: nodes.length,
      textureResolution: "procedural colors; production target 1024x1024 baked atlas",
      draco: false,
      fileBytes: buffer.byteLength
    }
  };
}

function createGlbAnimations(builder, { duration, hero, cameraIndex, flameNodes, smokeNodes, particleNodes }) {
  const samplers = [];
  const channels = [];
  const addAnim = (node, path, times, values, type = "VEC3") => {
    const input = builder.addAccessor(new Float32Array(times), "SCALAR", 5126, {
      min: [Math.min(...times)],
      max: [Math.max(...times)]
    });
    const output = builder.addAccessor(new Float32Array(values.flat()), type, 5126);
    const sampler = samplers.push({ input, output, interpolation: "LINEAR" }) - 1;
    channels.push({ sampler, target: { node, path } });
  };

  addAnim(cameraIndex, "translation", [0, duration / 2, duration], [
    [0, 1.12, 4.35],
    [0, 1.08, hero ? 3.68 : 3.82],
    [0, 1.12, 4.35]
  ]);

  const flameTimes = hero
    ? [0, 4.5, 6.9, 7.5, 9.8, 11.2, 14.6, 15.2, 17.1, 18]
    : [0, 0.8, 1.6, 2.4, 3.08, 3.55, 4.45, 5.45, 6];
  const flameScales = hero
    ? [
        [1, 1, 1],
        [1.1, 0.93, 1],
        [0.9, 1.14, 1],
        [0.04, 0.04, 0.04],
        [0.04, 0.04, 0.04],
        [1, 1, 1],
        [0.88, 1.15, 1],
        [0.04, 0.04, 0.04],
        [0.04, 0.04, 0.04],
        [1, 1, 1]
      ]
    : [
        [1, 1, 1],
        [1.14, 0.92, 1],
        [0.92, 1.12, 1],
        [1.05, 0.96, 1],
        [0.46, 0.5, 0.46],
        [0.04, 0.04, 0.04],
        [0.04, 0.04, 0.04],
        [0.7, 0.78, 0.7],
        [1, 1, 1]
      ];
  flameNodes.forEach((node, index) => {
    const wobble = flameScales.map(([x, y, z], key) => [
      x * (1 + ((index + key) % 2) * 0.04),
      y * (1 - ((index + key) % 2) * 0.03),
      z
    ]);
    addAnim(node, "scale", flameTimes, wobble);
  });

  const smokeTimes = hero ? [0, 7.4, 8.4, 10.2, 15.1, 16.0, 17.4, 18] : [0, 3.3, 3.85, 4.7, 5.7, 6];
  smokeNodes.forEach((node, index) => {
    const x = [-0.42, 0, 0.42][index];
    const smokeTranslations = hero
      ? [
          [x, 1.38, -0.03],
          [x, 1.38, -0.03],
          [x + 0.04, 1.66, -0.08],
          [x - 0.05, 1.96, -0.12],
          [x, 1.38, -0.03],
          [x + 0.04, 1.7, -0.1],
          [x - 0.05, 1.96, -0.1],
          [x, 1.38, -0.03]
        ]
      : [
          [x, 1.38, -0.03],
          [x, 1.38, -0.03],
          [x + 0.03, 1.62, -0.08],
          [x - 0.05, 1.88, -0.12],
          [x, 1.38, -0.03],
          [x, 1.38, -0.03]
        ];
    const smokeScales = smokeTimes.map((_, key) => {
      if ((!hero && (key === 0 || key === 1 || key === smokeTimes.length - 1)) || (hero && (key === 0 || key === 1 || key === 4 || key === smokeTimes.length - 1))) {
        return [0.001, 0.001, 0.001];
      }
      const scale = 0.06 + key * 0.016;
      return [scale, scale, scale];
    });
    addAnim(node, "translation", smokeTimes, smokeTranslations);
    addAnim(node, "scale", smokeTimes, smokeScales);
  });

  particleNodes.forEach((node, index) => {
    const base = nodeTranslation(index);
    const lift = 0.08 + (index % 5) * 0.018;
    addAnim(node, "translation", [0, duration / 2, duration], [
      base,
      [base[0] + Math.sin(index) * 0.05, base[1] + lift, base[2] + Math.cos(index) * 0.04],
      base
    ]);
  });

  return [{ name: hero ? "hero_cake_loop_18s" : "candle_blowout_loop_6s", samplers, channels }];

  function nodeTranslation(index) {
    const angle = (index / 18) * Math.PI * 2;
    const radius = 1.45 + (index % 5) * 0.18;
    return [Math.cos(angle) * radius, 0.72 + (index % 6) * 0.22, Math.sin(angle) * radius * 0.42];
  }
}

function pbr(name, baseColorFactor, roughnessFactor, metallicFactor) {
  return {
    name,
    pbrMetallicRoughness: {
      baseColorFactor,
      metallicFactor,
      roughnessFactor
    }
  };
}

function cylinder(radius, height, segments) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, -height / 2, z, x, height / 2, z);
    normals.push(Math.cos(a), 0, Math.sin(a), Math.cos(a), 0, Math.sin(a));
  }
  for (let i = 0; i < segments; i += 1) {
    const j = i * 2;
    indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
  }
  const topCenter = positions.length / 3;
  positions.push(0, height / 2, 0);
  normals.push(0, 1, 0);
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(a) * radius, height / 2, Math.sin(a) * radius);
    normals.push(0, 1, 0);
  }
  for (let i = 0; i < segments; i += 1) indices.push(topCenter, topCenter + i + 1, topCenter + i + 2);

  const bottomCenter = positions.length / 3;
  positions.push(0, -height / 2, 0);
  normals.push(0, -1, 0);
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(a) * radius, -height / 2, Math.sin(a) * radius);
    normals.push(0, -1, 0);
  }
  for (let i = 0; i < segments; i += 1) indices.push(bottomCenter, bottomCenter + i + 2, bottomCenter + i + 1);
  return { positions, normals, indices };
}

function sphere(radius, segments, rings) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let y = 0; y <= rings; y += 1) {
    const v = y / rings;
    const theta = v * Math.PI;
    for (let x = 0; x <= segments; x += 1) {
      const u = x / segments;
      const phi = u * Math.PI * 2;
      const nx = Math.cos(phi) * Math.sin(theta);
      const ny = Math.cos(theta);
      const nz = Math.sin(phi) * Math.sin(theta);
      positions.push(nx * radius, ny * radius, nz * radius);
      normals.push(nx, ny, nz);
    }
  }
  for (let y = 0; y < rings; y += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = y * (segments + 1) + x;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function petal() {
  return {
    positions: [0, 0, 0.1, 0.16, 0, 0, 0, 0, -0.1, -0.16, 0, 0],
    normals: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    indices: [0, 1, 2, 0, 2, 3]
  };
}

function quatFromEuler(x, y, z) {
  const cx = Math.cos(x / 2);
  const sx = Math.sin(x / 2);
  const cy = Math.cos(y / 2);
  const sy = Math.sin(y / 2);
  const cz = Math.cos(z / 2);
  const sz = Math.sin(z / 2);
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz
  ];
}

function componentCount(type) {
  return { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }[type];
}

function minMaxVec3(array) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < array.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], array[i + axis]);
      max[axis] = Math.max(max[axis], array[i + axis]);
    }
  }
  return { min, max };
}

function makeGlb(gltf, bin) {
  const json = Buffer.from(JSON.stringify(gltf));
  const jsonPadding = (4 - (json.byteLength % 4)) % 4;
  const binPadding = (4 - (bin.byteLength % 4)) % 4;
  const jsonChunk = Buffer.concat([json, Buffer.alloc(jsonPadding, 0x20)]);
  const binChunk = Buffer.concat([bin, Buffer.alloc(binPadding)]);
  const totalLength = 12 + 8 + jsonChunk.byteLength + 8 + binChunk.byteLength;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunk.byteLength, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binChunk.byteLength, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk], totalLength);
}

function createFbxProxy(stats) {
  return `; FBX 7.4.0 ASCII handoff proxy
; Generated by scripts/generate-birthday-assets.mjs
; This file documents the production FBX scene hierarchy for DCC export.
; The validated animated browser scene is cake_anim.glb.
; Replace this proxy with a Blender/Maya FBX export when a DCC toolchain is available.

FBXHeaderExtension:  {
  FBXHeaderVersion: 1003
  FBXVersion: 7400
  Creator: "Codex Birthday Asset Generator"
}
GlobalSettings:  {
  Version: 1000
  Properties70:  {
    P: "UpAxis", "int", "Integer", "",1
    P: "UpAxisSign", "int", "Integer", "",1
    P: "FrontAxis", "int", "Integer", "",2
    P: "CoordAxis", "int", "Integer", "",0
    P: "UnitScaleFactor", "double", "Number", "",1
  }
}
; Scene layers:
; - cake_base
; - icing_top
; - icing_trim
; - candles
; - flames
; - smoke
; - petals
; - particles
; - warm_candle_light
; - soft_key_light
; - camera_slow_push
; Animation: 0-${stats.durationSeconds}s, ${stats.fps}fps, seamless loop.
; Mesh budget: ${stats.triangles} triangles in the GLB source.
`;
}

async function writeManifest({ shortGlb, heroGlb, audio }) {
  const desired = [
    ["cake_poster.png", "Image fallback", "PNG", "Generated poster, square composition"],
    ["cake_poster.svg", "Image fallback", "SVG", "Lightweight vector fallback"],
    ["cake_anim.glb", "3D model", "glTF 2.0 binary", `${shortGlb.stats.triangles} tris, ${shortGlb.stats.durationSeconds}s loop, ${shortGlb.stats.fps}fps, procedural materials`],
    ["cake_hero_loop.glb", "3D model", "glTF 2.0 binary", `${heroGlb.stats.triangles} tris, ${heroGlb.stats.durationSeconds}s loop, ${heroGlb.stats.fps}fps, procedural materials`],
    ["cake_anim.fbx", "3D model handoff", "FBX ASCII proxy", "Scene hierarchy notes; replace with validated DCC export"],
    ["cake_blowout.json", "Animation", "Lottie JSON", "800x800, 30fps, 6s, vector blow-out"],
    ["ambient_mix.wav", "Audio mix", "WAV", `${audio.loopPoints.fullMix.durationSeconds}s, 44.1kHz, 16-bit mono, D major, 72 BPM`],
    ["ambient_bed_loop.wav", "Audio loop", "WAV", "8s, 44.1kHz, 16-bit mono, quiet seamless bed"],
    ["piano_stem.wav", "Audio stem", "WAV", "30s piano stem, 44.1kHz/16-bit mono"],
    ["pads_stem.wav", "Audio stem", "WAV", "30s pad stem, 44.1kHz/16-bit mono"],
    ["percussion_stem.wav", "Audio stem", "WAV", "30s percussion stem, 44.1kHz/16-bit mono"],
    ["chime_stem.wav", "Audio stem", "WAV", "30s chime stem, 44.1kHz/16-bit mono"],
    ["ambient_loop_points.json", "Audio metadata", "JSON", "Loop samples, BPM, key, cue point"],
    ["cake_scene_source.json", "Source metadata", "JSON", "Layering, animation, and production notes"]
  ];

  const rows = [];
  for (const [fileName, type, format, details] of desired) {
    let sizeBytes = null;
    try {
      sizeBytes = (await stat(join(assetDir, fileName))).size;
    } catch {
      sizeBytes = null;
    }
    rows.push({ fileName, type, format, details, sizeBytes });
  }

  const exportTargets = [
    {
      fileName: "cake_anim.webm",
      type: "Video alpha",
      format: "WebM VP9",
      status: "Export target",
      details: "1080x1080, 60fps, 6s, alpha channel. Requires Blender/FFmpeg render pass."
    },
    {
      fileName: "ambient_mix.mp3",
      type: "Audio mix",
      format: "MP3",
      status: "Export target",
      details: "192 kbps from ambient_mix.wav. Requires FFmpeg or audio encoder."
    },
    {
      fileName: "ambient_mix.ogg",
      type: "Audio mix",
      format: "OGG Vorbis",
      status: "Export target",
      details: "160 kbps from ambient_mix.wav. Requires FFmpeg or audio encoder."
    }
  ];

  await writeJson("asset-manifest.json", {
    generatedAt: new Date().toISOString(),
    status: "Browser-ready local asset pack plus production export targets",
    localFiles: rows,
    exportTargets,
    optimization: {
      totalPublicAssetSizeGoal: "3-5 MB for deployed page payload; WAV stems should stay out of initial page load.",
      lazyLoad: ["cake_anim.glb", "cake_hero_loop.glb", "audio files"],
      draco: "Run gltf-transform draco after DCC export if final GLB size needs reduction.",
      textureAtlas: "Bake 1024x1024 AO/roughness/base-color atlas in Blender for final asset."
    }
  });

  const table = [
    "| FileName | Type | Format | Specs | Size |",
    "|---|---|---|---|---|",
    ...rows.map((row) => `| \`${row.fileName}\` | ${row.type} | ${row.format} | ${row.details} | ${row.sizeBytes == null ? "n/a" : formatBytes(row.sizeBytes)} |`),
    ...exportTargets.map((row) => `| \`${row.fileName}\` | ${row.type} | ${row.format} | ${row.details} | ${row.status} |`)
  ].join("\n");
  await writeFile(join(assetDir, "asset-manifest.md"), `${table}\n`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
