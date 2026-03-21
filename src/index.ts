import { requireNativeModule } from "expo-modules-core";

const NativeModule = requireNativeModule("CircularReveal");

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
  return NativeModule.triggerTransition(centerX, centerY, durationMs);
}
