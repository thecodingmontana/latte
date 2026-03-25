/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: ingore all */
/**
 * Detects if the current browser is Brave
 */
export async function isBraveBrowser(): Promise<boolean> {
  if (
    (navigator as any).brave &&
    typeof (navigator as any).brave.isBrave === "function"
  ) {
    try {
      return await (navigator as any).brave.isBrave();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Gets the current browser name
 */
export async function detectBrowser(): Promise<string> {
  if (await isBraveBrowser()) {
    return "Brave";
  }

  const userAgent = navigator.userAgent;

  if (userAgent.includes("Edg/")) {
    return "Edge";
  }
  if (userAgent.includes("OPR/") || userAgent.includes("Opera/")) {
    return "Opera";
  }
  if (userAgent.includes("Firefox/")) {
    return "Firefox";
  }
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }
  if (userAgent.includes("Chrome/")) {
    return "Chrome";
  }

  return "Unknown";
}
