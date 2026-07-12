import { API_ENDPOINTS } from "@/constants/api";
import axiosInstance from "@/lib/axios";

import type {
  GetCollaboratorsResponse,
  RegisterDocumentCollaboratorRequest,
} from "../../documentEditor/types/documentEditor";

export async function getCollaboratorsApi(
  documentId: string
): Promise<GetCollaboratorsResponse> {
  const response = await axiosInstance.get(
    API_ENDPOINTS.DOCUMENT_COLLABORATORS(documentId)
  );

  return response.data.data;
}

export async function registerDocumentCollaboratorApi(
  documentId: string,
  payload: RegisterDocumentCollaboratorRequest
): Promise<void> {
  await axiosInstance.post(
    API_ENDPOINTS.DOCUMENT_COLLABORATORS(documentId),
    payload
  );
}
