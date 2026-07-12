"use client";

import { useQuery } from "@tanstack/react-query";

import { documentService } from "../services/document";

export function useFetchDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: documentService.getAllDocuments,
  });
}
