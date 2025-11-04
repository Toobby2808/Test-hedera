// src/lib/walletDetect.ts
/** Utility to detect platform and whether HashPack is available */
export type WalletAvailability = "mobile" | "desktop" | "none";

/**
 * Heuristic:
 * - desktop: window.hedera or window.hashconnect available (extension / injected)
 * - mobile: check meta tag used by several wallets or Android/iOS UA and no desktop injection
 *
 * This is a best-effort detection.
 */
export const checkHashpackAvailability = (): WalletAvailability => {
  if (typeof window === "undefined") return "none";

  const ua =
    navigator.userAgent || navigator.vendor || (window as any).opera || "";

  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  // Some mobile wallets add a meta tag; this is optional/heuristic
  const hasMobileMeta = !!document.querySelector(
    'meta[name="hashconnect-mobile"]'
  );

  // Desktop injection (HashPack extension often injects window.hedera or window.hashpack)
  const isDesktopInjected =
    typeof (window as any).hedera !== "undefined" ||
    typeof (window as any).hashpack !== "undefined" ||
    typeof (window as any).hashconnect !== "undefined";

  if (isDesktopInjected) return "desktop";
  if ((isAndroid || isIOS) && hasMobileMeta) return "mobile";
  if (isAndroid || isIOS) return "none";
  return "none";
};
