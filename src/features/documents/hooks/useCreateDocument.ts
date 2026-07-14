"use client";

import { useMutation } from "@tanstack/react-query";

import { documentService } from "../services/document";
import { withAuthHeaders } from "@/lib/auth-token";

export function useCreateDocument() {
  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof documentService.createDocument>[0]) =>
      documentService.createDocument(payload, withAuthHeaders()),
  });

  return {
    createDocument: mutation.mutate,
    createDocumentAsync: mutation.mutateAsync,

    isPending: mutation.isPending,

    isSuccess: mutation.isSuccess,

    isError: mutation.isError,

    error: mutation.error,

    data: mutation.data,

    reset: mutation.reset,
  };
}
