import { API_ENDPOINTS } from "@/constants/api";
import axiosInstance from "@/lib/axios";
import {
  type AuthRequestConfig,
  withAuthHeaders,
} from "@/lib/auth-token";

import type {
  GetCollaboratorsResponse,
  RegisterDocumentCollaboratorRequest,
} from "../../documentEditor/types/documentEditor";

export async function getCollaboratorsApi(
  documentId: string,
  auth: AuthRequestConfig = withAuthHeaders(),
): Promise<GetCollaboratorsResponse> {
  const response = await axiosInstance.get(
    API_ENDPOINTS.DOCUMENT_COLLABORATORS(documentId),
    auth,
  );

  return response.data.data;
}

export async function registerDocumentCollaboratorApi(
  documentId: string,
  payload: RegisterDocumentCollaboratorRequest,
  auth: AuthRequestConfig = withAuthHeaders(),
): Promise<void> {
  await axiosInstance.post(
    API_ENDPOINTS.DOCUMENT_COLLABORATORS(documentId),
    payload,
    auth,
  );
}
