import { requireOptionalNativeModule } from "expo-modules-core";

type CircularRevealModule = {
  triggerTransition(
    centerX: number,
    centerY: number,
    durationMs: number,
  ): Promise<string>;
};

const NativeModule = requireOptionalNativeModule(
  "CircularReveal",
) as CircularRevealModule | null;

function getNativeModule(): CircularRevealModule {
  if (NativeModule) {
    return NativeModule;
  }

  throw new Error(
    "expo-circular-reveal native module is unavailable. Use a development build or standalone app that includes the module.",
  );
}

/**
 * Captures the full window, adds a native overlay, resolves when overlay
 * is visible (caller should swap theme), then animates a circular reveal.
 *
 * @param centerX - tap X in logical points
 * @param centerY - tap Y in logical points
 * @param durationMs - animation duration in milliseconds
 * @returns "ready" when overlay is visible and theme can be swapped
 */
export async function triggerTransition(
  centerX: number,
  centerY: number,
  durationMs: number,
): Promise<string> {
  return getNativeModule().triggerTransition(centerX, centerY, durationMs);
}
