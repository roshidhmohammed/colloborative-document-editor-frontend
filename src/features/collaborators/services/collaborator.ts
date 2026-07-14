import {
  getCollaboratorsApi,
  registerDocumentCollaboratorApi,
} from "../api/collaborators.api";
import type {
  GetCollaboratorsResponse,
  RegisterDocumentCollaboratorRequest,
} from "../../documentEditor/types/documentEditor";
import type { AuthRequestConfig } from "@/lib/auth-token";
import { withAuthHeaders } from "@/lib/auth-token";

class CollaboratorService {
  async getCollaborators(
    documentId: string,
    auth: AuthRequestConfig = withAuthHeaders(),
  ): Promise<GetCollaboratorsResponse> {
    return getCollaboratorsApi(documentId, auth);
  }

  async registerDocumentCollaborator(
    documentId: string,
    payload: RegisterDocumentCollaboratorRequest,
    auth: AuthRequestConfig = withAuthHeaders(),
  ): Promise<void> {
    return registerDocumentCollaboratorApi(documentId, payload, auth);
  }
}

export const collaboratorService = new CollaboratorService();
