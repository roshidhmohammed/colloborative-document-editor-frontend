"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  selectCurrentDocumentRole,
  useFetchDocumentDetails,
} from "@/features/documents";
import { authedQueryFn } from "@/lib/auth-token";

import { collaboratorService } from "../../collaborators/services/collaborator";

const REGISTRATION_STALE_TIME = 5 * 60 * 1000;

export function useRegisterDocumentCollaborator(
  documentId: string,
  documentToken: string
) {
  const queryClient = useQueryClient();
  const { data: role } = useFetchDocumentDetails(documentToken, {
    select: selectCurrentDocumentRole,
  });

  return useQuery({
    queryKey: [
      "documents",
      documentId,
      "collaborator-registration",
      documentToken,
      role,
    ],
    queryFn: authedQueryFn(async (auth) => {
      await collaboratorService.registerDocumentCollaborator(
        documentId,
        { role: role! },
        auth
      );

      await queryClient.invalidateQueries({
        queryKey: ["documents", documentId, "collaborators"],
      });
    }),
    enabled: Boolean(documentId && documentToken && role),
    staleTime: REGISTRATION_STALE_TIME,
    retry: 1,
  });
}
