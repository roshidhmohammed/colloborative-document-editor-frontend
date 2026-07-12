import {
  getCollaboratorsApi,
  registerDocumentCollaboratorApi,
} from "../api/collaborators.api";
import type {
  GetCollaboratorsResponse,
  RegisterDocumentCollaboratorRequest,
} from "../../documentEditor/types/documentEditor";

class CollaboratorService {
  async getCollaborators(
    documentId: string
  ): Promise<GetCollaboratorsResponse> {
    return getCollaboratorsApi(documentId);
  }

  async registerDocumentCollaborator(
    documentId: string,
    payload: RegisterDocumentCollaboratorRequest
  ): Promise<void> {
    return registerDocumentCollaboratorApi(documentId, payload);
  }
}

export const collaboratorService = new CollaboratorService();
