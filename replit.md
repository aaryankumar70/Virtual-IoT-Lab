# Virtual IoT Lab

A local-first browser laboratory for placing, wiring, programming, and simulating virtual electronics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/virtual-iot-lab/src/App.tsx` — application shell, workspace interaction, project history, and simulation controls.
- `artifacts/virtual-iot-lab/src/components3d/VirtualLab3D.tsx` — React Three Fiber scene, camera, controls, transform handling, and WebGL capability guard.
- `artifacts/virtual-iot-lab/src/components3d/` — reusable Arduino, breadboard, LED, resistor, button, potentiometer, pin, and wire meshes.
- `artifacts/virtual-iot-lab/src/lib/component-registry.ts` — registry definitions, dimensions, local pin offsets, and component factories.
- `artifacts/virtual-iot-lab/src/lib/runtime.ts` — supported Arduino-style runtime and serial output.
- `artifacts/virtual-iot-lab/src/lib/project-storage.ts` — local project persistence and backward-compatible normalization.
- `artifacts/virtual-iot-lab/src/index.css` — engineering workspace theme and component geometry.

## Architecture decisions

- The prototype is local-first: project JSON is stored in browser localStorage, with no authentication, database, or backend dependency.
- Component definitions own their dimensions and local pin offsets; wire endpoints store component IDs and pin IDs, then derive screen positions from the current component transform.
- The 3D workspace keeps the persisted model as its only coordinate source: project `x` maps to Three.js `X`, project `y` maps to Three.js `Z`, and project `z` maps to Three.js `Y`; component-local pin anchors are transformed at render time.
- The Arduino runtime is intentionally controlled and deterministic rather than a full C++ compiler, so the UI/hardware contract can later be swapped for a WebAssembly runtime.
- Project state, simulation state, and workspace/view state stay separate in the frontend even though the first prototype keeps them in one feature module.
- Top-view workspace coordinates use a documented scale of 1 workspace unit = 24 pixels; z is persisted for future 3D elevation while normal movement stays on the work plane.
- React Three Fiber is the only 3D renderer. Orbit controls handle the camera, while Drei transform controls constrain object movement to the horizontal X/Z plane and preserve the existing snap increments.

## Product

The app provides an engineering-style workspace for a seeded Arduino Blink circuit and expandable virtual hardware experiments. Users can add registry-defined components, select and move them with optional grid snapping, rotate/lock/duplicate/delete them, connect pins with logical wires, run the controlled Arduino-style runtime, inspect serial output, and save/load projects from local storage.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
