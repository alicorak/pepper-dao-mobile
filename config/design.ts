/**
 * Active UI design
 *
 * The app ships multiple visual designs on top of the same data layer
 * (hooks, services, contexts). Route files in `app/` pick the screen for
 * the active design. Switch with EXPO_PUBLIC_DESIGN in `.env`, e.g.:
 *
 *   EXPO_PUBLIC_DESIGN=thermal   # Design 1 — "Thermal Pixel" (default)
 *   EXPO_PUBLIC_DESIGN=hq        # Design 2 — "Pepper Inc. HQ"
 *   EXPO_PUBLIC_DESIGN=legacy    # Original forest-green UI
 */

export const DESIGNS = {
  LEGACY: 'legacy',
  THERMAL: 'thermal',
  HQ: 'hq',
} as const;

export type DesignId = (typeof DESIGNS)[keyof typeof DESIGNS];

const DESIGN_IDS: Array<DesignId> = Object.values(DESIGNS);

function resolveDesign(value: string | undefined): DesignId {
  const match = DESIGN_IDS.find((id) => id === value);
  return match ?? DESIGNS.THERMAL;
}

export const ACTIVE_DESIGN: DesignId = resolveDesign(process.env.EXPO_PUBLIC_DESIGN);

export const IS_THERMAL = ACTIVE_DESIGN === DESIGNS.THERMAL;
export const IS_HQ = ACTIVE_DESIGN === DESIGNS.HQ;

/** Picks the value (usually a screen component) for the active design */
export function pickDesign<T>(options: Record<DesignId, T>): T {
  return options[ACTIVE_DESIGN];
}
