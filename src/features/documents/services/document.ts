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

class DocumentService {
  async createDocument(
    payload: CreateDocumentRequest
  ): Promise<CreateDocumentResponse> {
    return createDocumentApi(payload);
  }

  async getAllDocuments(): Promise<GetAllDocumentsResponse> {
    return getAllDocumentsApi();
  }

  async getDocument(documentToken: string): Promise<GetDocumentResponse> {
    return getDocumentApi(documentToken);
  }
}

export const documentService = new DocumentService();
