import z from "zod";

import { createDocumentSchema } from "../schemas/createDocumentSchema";

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;

export type CreateDocumentRequest = CreateDocumentFormValues;

export interface Document {
  _id?: string;
  id?: string;
  associatedRoleToken?: string;
  name: string;
  content?: string;
  score?: number;
  collaborators?: number | unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDocument {
  document: Document;
  ownerToken: string;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

export interface CreateDocumentResponse {
  success: boolean;
  message: string;
  data: CreateDocument;
}

export type GetAllDocumentsResponse = Document[];

export interface DocumentCreator {
  id: string;
  email: string;
  fullName: string;
}

export interface DocumentDetails {
  id: string;
  name: string;
  content: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator: DocumentCreator;
  collaborators: unknown[];
}

export type DocumentShareRole = "OWNER" | "EDITOR" | "VIEWER";

export interface DocumentShareLink {
  id: string;
  token: string;
  documentId: string;
  role: DocumentShareRole;
  createdById: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GetDocumentResponse {
  document: DocumentDetails;
  documentShareLinks: DocumentShareLink[];
  currentDocumentShareLink: DocumentShareLink;
}

export type DocumentCardProps = {
  document: Document;
};

export type UseFetchDocumentDetailsOptions<TData> = {
  select?: (response: GetDocumentResponse) => TData;
};
