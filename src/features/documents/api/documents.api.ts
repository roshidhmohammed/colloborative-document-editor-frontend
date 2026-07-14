import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants/api";
import { withAuthHeaders } from "@/lib/auth-token";

import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetAllDocumentsResponse,
  GetDocumentResponse,
} from "../types/document";

export async function createDocumentApi(
  payload: CreateDocumentRequest,
): Promise<CreateDocumentResponse> {
  const response = await axiosInstance.post(
    API_ENDPOINTS.DOCUMENTS,
    payload,
    withAuthHeaders(),
  );
  return response.data;
}

export async function getAllDocumentsApi(): Promise<GetAllDocumentsResponse> {
  const response = await axiosInstance.get(
    API_ENDPOINTS.DOCUMENTS,
    withAuthHeaders(),
  );
  return response.data.data;
}

export async function getDocumentApi(
  documentToken: string,
): Promise<GetDocumentResponse> {
  const response = await axiosInstance.get(
    API_ENDPOINTS.DOCUMENT_BY_TOKEN(documentToken),
    withAuthHeaders(),
  );
  return response.data.data;
}
