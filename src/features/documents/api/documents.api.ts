import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants/api";
import { type AuthRequestConfig, withAuthHeaders } from "@/lib/auth-token";

import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetAllDocumentsResponse,
  GetDocumentResponse,
} from "../types/document";

export async function createDocumentApi(
  payload: CreateDocumentRequest,
  auth: AuthRequestConfig = withAuthHeaders(),
): Promise<CreateDocumentResponse> {
  const response = await axiosInstance.post(
    API_ENDPOINTS.DOCUMENTS,
    payload,
    auth,
  );
  return response.data;
}

export async function getAllDocumentsApi(
  auth: AuthRequestConfig = withAuthHeaders(),
): Promise<GetAllDocumentsResponse> {
  const response = await axiosInstance.get(API_ENDPOINTS.DOCUMENTS, auth);
  return response.data.data;
}

export async function getDocumentApi(
  documentToken: string,
  auth: AuthRequestConfig = withAuthHeaders(),
): Promise<GetDocumentResponse> {
  const response = await axiosInstance.get(
    API_ENDPOINTS.DOCUMENT_BY_TOKEN(documentToken),
    auth,
  );
  return response.data.data;
}
