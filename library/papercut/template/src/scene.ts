// Word cues for a scene, from src/plan.json (built by tools/build_vo.py from the narration).
import plan from './plan.json';

// Typed by hand so an empty plan.json (a fresh scaffold) still typechecks; build_vo.py fills in the real scenes.
export type PlanWord = {text: string; f: number};
export type PlanScene = {id: string; from: number; durationInFrames: number; words: PlanWord[]};
export type SceneId = PlanScene['id'];
export const PLAN: {fps: number; durationInFrames: number; scenes: PlanScene[]} = plan;
export const scene = (id: string) => {
  const s = PLAN.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`No scene ${id} in plan.json`);
  return s;
};
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
// Frame (relative to the scene start) where the n-th word starting with `word` is spoken.
export const cueOf = (id: string) => {
  const s = scene(id);
  return (word: string, n = 0): number => {
    const want = norm(word);
    let k = 0;
    for (const w of s.words) if (norm(w.text).startsWith(want) && k++ === n) return w.f;
    throw new Error(`Cue "${word}"#${n} not in ${id}`);
  };
};
export const durOf = (id: string) => scene(id).durationInFrames;
