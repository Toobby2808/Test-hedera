import { HashConnect } from "hashconnect";
import { LedgerId } from "@hashgraph/sdk";

/**
 * Replace this with your WalletConnect Project ID (WalletConnect Cloud)
 * Get one at https://cloud.walletconnect.com
 */
const PROJECT_ID = "fd608b25403164bd77112a43d98951ed";

/**
 * Network
 */
const env = "testnet";

/**
 * App metadata shown in wallet pairing UI
 */
const appMetadata = {
  name: "HederaAir",
  description: "HederaAir - Hedera Hashgraph DApp",
  icons: [
    typeof window !== "undefined"
      ? window.location.origin + "/favicon.ico"
      : "/favicon.ico",
  ],
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
};

let hcInstance: HashConnect | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize HashConnect on client side only.
 * HashConnect must be created once and reused.
 */
export function initHashConnect() {
  if (typeof window === "undefined") return;
  if (hcInstance) return;

  // NOTE: HashConnect constructor signature for v3:
  // new HashConnect(ledgerId, projectId, metadata, debug)
  hcInstance = new HashConnect(
    LedgerId.fromString(env),
    PROJECT_ID,
    appMetadata,
    true
  );
  initPromise = hcInstance.init();
  // it's fine to ignore the promise here; callers can await getInitPromise()
  console.log("HashConnect created", hcInstance);
}

export const getHashConnectInstance = (): HashConnect => {
  if (!hcInstance)
    throw new Error(
      "HashConnect not initialized. Call initHashConnect() on client."
    );
  return hcInstance;
};

export const getInitPromise = (): Promise<void> => {
  if (!initPromise)
    throw new Error(
      "HashConnect not initialized. Call initHashConnect() on client."
    );
  return initPromise!;
};

/**
 * Convenience: return connected account ids (may be empty array)
 */
export const getConnectedAccountIds = (): string[] => {
  if (!hcInstance) return [];
  return hcInstance.connectedAccountIds.map((acc) => acc.toString()) || [];
};

// init immediately if in browser (helps when imported)
if (typeof window !== "undefined") {
  try {
    initHashConnect();
  } catch (e) {
    console.warn("HashConnect init skipped:", e);
  }
}
