// src/lib/walletDetect.ts
/** Utility to detect platform and whether HashPack is available */
export type WalletAvailability = "mobile" | "desktop" | "none";

/**
 * Improved detection logic:
 * - Desktop: extension detected (injected hashconnect or hedera)
 * - Mobile: we assume available (let WalletConnect modal handle it)
 * - Fallback: none
 */
export const checkHashpackAvailability = (): WalletAvailability => {
  if (typeof window === "undefined") return "none";

  const ua =
    navigator.userAgent || navigator.vendor || (window as any).opera || "";
  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  const isDesktopInjected =
    typeof (window as any).hedera !== "undefined" ||
    typeof (window as any).hashpack !== "undefined" ||
    typeof (window as any).hashconnect !== "undefined";

  // ✅ assume wallet is available on mobile — let the modal show QR or deep link
  if (isDesktopInjected) return "desktop";
  if (isAndroid || isIOS) return "mobile";
  return "none";
};
