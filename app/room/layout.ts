/**
 * Single source of truth for the room's geometry.
 *
 * World units ≈ metres. The floor spans x,z ∈ [-HALF, HALF]; the two visible
 * walls sit on the far sides (x = -HALF and z = -HALF) facing the iso camera.
 *
 * To add an object: add a collider to FURNITURE, render it at the same spot in
 * scene/, and — if it does something — add an entry to INTERACTABLES.
 */
import { interests } from "app/data/interests";

export const HALF = 5;
export const WALL_HEIGHT = 3.2;
export const WALL_THICKNESS = 0.3;
/** inner face of the walls */
export const INNER = -HALF + WALL_THICKNESS / 2;
export const PLAYER_RADIUS = 0.28;
export const PLAYER_START: [number, number] = [1.9, 2.6];

/** window opening in the left wall (z range, y range) */
export const WINDOW = { z0: -0.65, z1: 1.25, y0: 1.05, y1: 2.45 };

/** climbing wall wraps the back-left corner */
export const CLIMB = { backX1: -2.3, leftZ1: -1.9 };

export type Box = { x: number; z: number; w: number; d: number; h: number };

export const FURNITURE = {
  // back wall
  desk: { x: 0, z: -4.4, w: 2.8, d: 1.0, h: 0.78 },
  chair: { x: -0.35, z: -3.45, w: 0.62, d: 0.62, h: 1.1 },
  mediaUnit: { x: 3.05, z: -4.6, w: 1.9, d: 0.5, h: 0.45 },
  plant: { x: 4.45, z: -4.45, w: 0.7, d: 0.7, h: 1.6 },
  // left wall
  sideboard: { x: -4.55, z: 0.3, w: 0.6, d: 1.5, h: 0.8 },
  projectCase: { x: -4.5, z: 2.2, w: 0.7, d: 1.0, h: 2.1 },
  bookshelf: { x: -4.55, z: 3.8, w: 0.6, d: 1.4, h: 2.3 },
  // floor
  coffeeTable: { x: 0.6, z: 0.6, w: 1.8, d: 1.1, h: 0.42 },
  sofa: { x: 4.1, z: 1.0, w: 0.95, d: 2.3, h: 0.85 },
  lamp: { x: 4.45, z: 2.75, w: 0.45, d: 0.45, h: 1.8 },
} satisfies Record<string, Box>;

export const COLLIDERS: Box[] = Object.values(FURNITURE);

/** Things that open an overlay. */
export type PanelId = "jobs" | "writing" | "projects" | "desk" | "app";

/** Things the character does. */
export type ActionId = "climb" | "game";
/**
 * Anything you can walk up to. Beyond the room's own panels/actions:
 * a statue in one of the two buildings (`job:<chapter>` / `app:<id>`) and
 * the open-source wall.
 */
export type TargetId = PanelId | ActionId | "repos" | `job:${string}` | `app:${string}`;

export const isAction = (id: TargetId): id is ActionId => id === "climb" || id === "game";

export type Interactable = {
  id: TargetId;
  label: string;
  verb: string;
  /** where the character stands to use it */
  spot: [number, number];
  /** world position of the floating marker */
  labelAt: [number, number, number];
  /** camera close-up while its overlay is open: centre + world extent to fit */
  closeUp?: { at: [number, number, number]; extent: number };
};

export const INTERACTABLES: Interactable[] = [
  {
    id: "jobs",
    label: "Past jobs",
    verb: "Look through past jobs",
    spot: [0.6, 1.75],
    labelAt: [0.6, 1.1, 0.6],
    closeUp: { at: [0.6, 0.42, 0.6], extent: 2.4 },
  },
  {
    id: "writing",
    label: "Writing",
    verb: "Browse my writing",
    spot: [-3.65, 3.8],
    labelAt: [-4.55, 2.75, 3.8],
    closeUp: { at: [-4.55, 1.2, 3.8], extent: 3.2 },
  },
  {
    id: "projects",
    label: "Projects",
    verb: "Open the project case",
    spot: [-3.55, 2.2],
    labelAt: [-4.5, 2.5, 2.2],
    closeUp: { at: [-4.5, 1.1, 2.2], extent: 3.0 },
  },
  {
    id: "desk",
    label: "Computer",
    verb: "Use the computer",
    spot: [0.75, -3.3],
    labelAt: [-0.2, 2.3, -4.6],
    // zoom onto the ultrawide while the OS is up
    closeUp: { at: [-0.25, 1.4, -4.7], extent: 2.2 },
  },
  {
    id: "climb",
    label: interests.climbing.label,
    verb: interests.climbing.verb,
    spot: [-4.45, -3.3],
    labelAt: [-4.7, 3.0, -3.3],
  },
  {
    id: "game",
    label: interests.gaming.label,
    verb: interests.gaming.verb,
    spot: [3.05, -3.05],
    labelAt: [3.05, 2.1, -4.6],
  },
];

/** How close (to the spot) the player must be for "E" to work. */
export const INTERACT_RADIUS = 0.85;
