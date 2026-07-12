"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth";

export function useRegister() {
  const mutation = useMutation({
    mutationFn: authService.register,
  });

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,

    isPending: mutation.isPending,

    isSuccess: mutation.isSuccess,

    isError: mutation.isError,

    error: mutation.error,

    data: mutation.data,

    reset: mutation.reset,
  };
}