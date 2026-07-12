import { DocumentShareRole } from "@/features/documents";
import { Dispatch, SetStateAction } from "react";

export type ShareModalProps = {
  documentToken: string;
  documentId: string;
  setShareOpen: Dispatch<SetStateAction<boolean>>;
};

export type ShareableRole = Exclude<DocumentShareRole, "OWNER">;