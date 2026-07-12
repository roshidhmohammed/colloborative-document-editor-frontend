"use client";

import { useMutation } from "@tanstack/react-query";

import { documentService } from "../services/document";

export function useCreateDocument() {
  const mutation = useMutation({
    mutationFn: documentService.createDocument,
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
