import { useEffect } from "react";

import { documentSocketService } from "../services/documentSocket";
import {
  clearPendingUpdates,
  getPendingUpdates,
} from "../services/docOfflineStorage";
import { Socket } from "node_modules/socket.io-client/build/esm/socket";

export function useOfflineSync(socket: Socket, documentId: string) {
  async function sync() {
    const updates = await getPendingUpdates(documentId);

    if (!updates.length) return;

    for (const update of updates) {
      await documentSocketService.updateDocument(socket, documentId, update);
    }

    await clearPendingUpdates(documentId);
  }
  useEffect(() => {
    window.addEventListener("online", sync);

    return () => {
      window.removeEventListener("online", sync);
    };
  }, [socket, documentId]);
}
