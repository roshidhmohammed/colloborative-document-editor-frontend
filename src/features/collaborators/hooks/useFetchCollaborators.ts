"use client";

import { useQuery } from "@tanstack/react-query";

import { collaboratorService } from "../services/collaborator";

export function useFetchCollaborators(documentId: string) {
  return useQuery({
    queryKey: ["documents", documentId, "collaborators"],
    queryFn: () => collaboratorService.getCollaborators(documentId),
    enabled: Boolean(documentId),
  });
}
