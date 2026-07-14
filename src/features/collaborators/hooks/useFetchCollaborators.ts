"use client";

import { useQuery } from "@tanstack/react-query";

import { collaboratorService } from "../services/collaborator";
import { authedQueryFn } from "@/lib/auth-token";

export function useFetchCollaborators(documentId: string) {
  return useQuery({
    queryKey: ["documents", documentId, "collaborators"],
    queryFn: authedQueryFn((auth) =>
      collaboratorService.getCollaborators(documentId, auth)
    ),
    enabled: Boolean(documentId),
  });
}
