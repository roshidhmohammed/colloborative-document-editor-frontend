import { useEffect, useRef } from "react";

import { documentSocketService } from "../services/documentSocket";
import {
  clearPendingUpdates,
  getDocument,
  getPendingUpdates,
} from "../services/docOfflineStorage";
import { Socket } from "node_modules/socket.io-client/build/esm/socket";

function waitForSocketConnect(socket: Socket, timeoutMs = 10000) {
  if (socket.connected) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      socket.off("connect", onConnect);
      reject(new Error("Timed out waiting for socket connection"));
    }, timeoutMs);

    const onConnect = () => {
      window.clearTimeout(timeout);
      resolve();
    };

    socket.once("connect", onConnect);

    if (typeof socket.connect === "function") {
      socket.connect();
    }
  });
}

/**
 * Pushes the latest document write from IndexedDB to the backend, then clears
 * the pending-sync marker. No-ops when nothing is pending.
 */
export async function flushPendingDocumentUpdates(
  socket: Socket,
  documentId: string,
) {
  const pending = await getPendingUpdates(documentId);

  if (!pending.length) return;

  await waitForSocketConnect(socket);

  const latest = await getDocument(documentId);

  if (!latest) {
    await clearPendingUpdates(documentId);
    return;
  }

  await documentSocketService.updateDocument(socket, documentId, latest);
  await clearPendingUpdates(documentId);
}

/**
 * When the browser or socket comes back online: optional re-join, then push the
 * latest IndexedDB write to the backend.
 */
export function useOfflineSync(
  socket: Socket,
  documentId: string,
  onReconnect?: () => Promise<void>,
) {
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    async function sync() {
      if (inFlight || cancelled || !navigator.onLine) return;

      inFlight = true;

      try {
        await waitForSocketConnect(socket);

        if (cancelled) return;

        if (onReconnectRef.current) {
          await onReconnectRef.current();
        }

        if (cancelled) return;

        await flushPendingDocumentUpdates(socket, documentId);
      } catch {
        // Keep pending updates so the next online/reconnect attempt can retry.
      } finally {
        inFlight = false;
      }
    }

    window.addEventListener("online", sync);
    socket.on("connect", sync);

    return () => {
      cancelled = true;
      window.removeEventListener("online", sync);
      socket.off("connect", sync);
    };
  }, [socket, documentId]);
}
