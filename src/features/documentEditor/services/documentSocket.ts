import type { Socket } from "socket.io-client";
import type { DocumentUpdate } from "../types/documentEditor";
import { joinDocumentSocketApi, updateDocumentSocketApi } from "../api/documentSocket.api";

class DocumentSocketService {
  joinDocument(socket: Socket, documentId: string) {
    return joinDocumentSocketApi(socket, documentId);
  }

  updateDocument(socket: Socket, documentId: string, content: DocumentUpdate) {
    return updateDocumentSocketApi(socket, documentId, content);
  }
}

export const documentSocketService = new DocumentSocketService();
