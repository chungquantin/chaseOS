/**
 * Beat times for the Architect film, measured from the narration clips
 * (public/audio/architect-narration.mp3 is these clips laid end to end).
 * Every scene event is keyed to these so the picture stays in step with the voice.
 */
export const T = {
  a1: [0.8, 8.24],
  a2: [8.7, 15.26],
  b1: [16.86, 24.78],
  b2: [25.24, 31.88],
  b3: [32.34, 40.02],
  b4: [40.48, 45.04],
  c1: [46.64, 54.8],
  c2: [55.26, 60.06],
  c3: [60.52, 65.4],
  c4: [65.86, 70.02],
  d1: [71.62, 79.46],
  d2: [79.92, 81.6],
} as const;

export const END = 83.4;
/** When each diorama begins (the camera arrives here). */
export const SCENE_START = [0, 16.2, 46, 71] as const;
export const NARRATION = "/audio/architect-narration.mp3";
