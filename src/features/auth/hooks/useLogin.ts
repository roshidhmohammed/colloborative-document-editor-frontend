
"use client";

import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth";

export function useLogin() {
  const mutation = useMutation({
    mutationFn: authService.login,
  });

  return {
    login: mutation.mutate,

    loginAsync: mutation.mutateAsync,

    isPending: mutation.isPending,

    isSuccess: mutation.isSuccess,

    isError: mutation.isError,

    error: mutation.error,

    data: mutation.data,

    reset: mutation.reset,
  };
}