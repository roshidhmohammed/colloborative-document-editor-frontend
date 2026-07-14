"use client";

import { useQuery } from "@tanstack/react-query";

import { documentService } from "../services/document";
import { authedQueryFn } from "@/lib/auth-token";

export function useFetchDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: authedQueryFn((auth) => documentService.getAllDocuments(auth)),
  });
}
