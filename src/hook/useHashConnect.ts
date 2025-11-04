// src/hooks/useHashConnect.tsx
import { useEffect, useState, useCallback } from "react";
import {
  initHashConnect,
  getHashConnectInstance,
  getInitPromise,
  getConnectedAccountIds,
} from "../lib/hashconnect";
import type { HashConnect } from "hashconnect";
import { checkHashpackAvailability } from "../lib/walletDetect";

/**
 * useHashConnect
 * - simple hook around HashConnect instance
 * - will initialize HashConnect on mount (client only)
 */
export default function useHashConnect() {
  const [hc, setHc] = useState<HashConnect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [pairingData, setPairingData] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      initHashConnect();
      const instance = getHashConnectInstance();
      setHc(instance);

      // attach events after init
      getInitPromise()
        .then(() => {
          // If already paired, pick the first account
          const ids = getConnectedAccountIds();
          if (ids && ids.length > 0) {
            setIsConnected(true);
            setAccountId(ids[0].toString());
          }

          // events
          instance.pairingEvent.on((p: any) => {
            console.log("pairingEvent:", p);
            setPairingData(p);
            // read connectedAccountIds
            const ids2 = getConnectedAccountIds();
            if (ids2 && ids2.length > 0) {
              setIsConnected(true);
              setAccountId(ids2[0].toString());
            }
          });

          instance.disconnectionEvent.on(() => {
            console.log("disconnectionEvent");
            setIsConnected(false);
            setAccountId(null);
            setPairingData(null);
          });

          instance.connectionStatusChangeEvent.on((s: any) => {
            console.log("connectionStatus change:", s);
          });
        })
        .catch((err) => {
          console.warn("HashConnect init error:", err);
        });
    } catch (e) {
      console.warn("HashConnect not available yet:", e);
    }
  }, []);

  const openPairing = useCallback(async () => {
    if (typeof window === "undefined") return;
    setIsLoading(true);
    try {
      // check availability and redirect if missing (mobile -> play/app store)
      const availability = checkHashpackAvailability();
      if (availability === "none") {
        const ua = navigator.userAgent || navigator.vendor || "";
        if (/android/i.test(ua)) {
          window.location.href =
            "https://play.google.com/store/apps/details?id=app.hashpack.wallet";
          return;
        } else if (/iPad|iPhone|iPod/.test(ua)) {
          window.location.href =
            "https://apps.apple.com/app/hashpack-wallet/id1608827031";
          return;
        } else {
          // desktop: open download page
          window.open("https://www.hashpack.app/download", "_blank");
          return;
        }
      }

      // ensure initialized
      await getInitPromise();
      const instance = getHashConnectInstance();
      // open pairing modal from HashConnect (wallet chooser / deep link)
      await instance.openPairingModal();
    } catch (err) {
      console.error("openPairing failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      if (!hc) return;
      hc.disconnect();
      setIsConnected(false);
      setAccountId(null);
      setPairingData(null);
    } catch (err) {
      console.warn("disconnect error:", err);
    }
  }, [hc]);

  return {
    connect: openPairing,
    disconnect,
    isConnected,
    accountId,
    isLoading,
    pairingData,
  };
}
