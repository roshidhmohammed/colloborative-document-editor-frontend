import type { DocumentShareRole } from "@/features/documents";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { Collaborator } from "../../collaborators/types/collaborator";

export type MenubarProps = {
  editor: TiptapEditor;
};

export type EditorProps = {
  documentId: string;
  documentToken: string;
};

export type GetCollaboratorsResponse = Collaborator[];

export type RegisterDocumentCollaboratorRequest = {
  role: DocumentShareRole;
};

export type DocumentUpdate = Uint8Array;
export type SocketDocument = { id: string; updatedAt?: string };
export type SocketResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };
