import { DocumentShareRole } from "@/features/documents";

export type CollaboratorStatus = "online" | "offline";

export type Collaborator = {
  documentId?: string;
  invitedBy?: string;
  role: DocumentShareRole;
  id: string | number;
  joinedAt?: Date;
  userId?: string;
  user?: {
    id: string | number;
    fullName: string;
    email: string;
  };
  status?: CollaboratorStatus;
};