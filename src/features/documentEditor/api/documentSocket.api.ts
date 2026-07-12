import type { Socket } from "socket.io-client";
import type {
  DocumentUpdate,
  SocketDocument,
  SocketResponse,
} from "../types/documentEditor";
import { toUint8Array } from "../utils/contentConversion";
import { unwrap } from "../utils/handleSocketPromise";

export function joinDocumentSocketApi(socket: Socket, documentId: string): Promise<DocumentUpdate> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      socket.off("document:load", handleLoad);
      reject(new Error("Timed out while loading document"));
    }, 10000);

    const handleLoad = (update: DocumentUpdate | ArrayBuffer | number[]) => {
      window.clearTimeout(timeout);
      resolve(toUint8Array(update));
    };

    socket.once("document:load", handleLoad);
    socket.emit("document:join", documentId);
  });
}

export function updateDocumentSocketApi(socket: Socket, documentId: string, content: DocumentUpdate): Promise<SocketDocument> {
  return new Promise((resolve, reject) => {
    socket.emit("document:update", { documentId, content }, (response: SocketResponse<SocketDocument>) =>
      unwrap(response, resolve, reject)
    );
  });
}

export { toUint8Array };
