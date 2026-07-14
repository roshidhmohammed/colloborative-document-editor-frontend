import {
  createDocumentApi,
  getAllDocumentsApi,
  getDocumentApi,
} from "../api/documents.api";

import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetAllDocumentsResponse,
  GetDocumentResponse,
} from "../types/document";
import type { AuthRequestConfig } from "@/lib/auth-token";
import { withAuthHeaders } from "@/lib/auth-token";

class DocumentService {
  async createDocument(
    payload: CreateDocumentRequest,
    auth: AuthRequestConfig = withAuthHeaders(),
  ): Promise<CreateDocumentResponse> {
    return createDocumentApi(payload, auth);
  }

  async getAllDocuments(
    auth: AuthRequestConfig = withAuthHeaders(),
  ): Promise<GetAllDocumentsResponse> {
    return getAllDocumentsApi(auth);
  }

  async getDocument(
    documentToken: string,
    auth: AuthRequestConfig = withAuthHeaders(),
  ): Promise<GetDocumentResponse> {
    return getDocumentApi(documentToken, auth);
  }
}

export const documentService = new DocumentService();
