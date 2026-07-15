import { useQuery } from "@tanstack/react-query";

import { authService } from "../services/auth";
import { authedQueryFn } from "@/lib/auth-token";

export function useUserAuth() {
  const query = useQuery({
    queryKey: ["userAuth"],
    queryFn: authedQueryFn((auth) => authService.userAuth(auth)),
  });

  return {
    userAuth: query.refetch,

    userAuthAsync: query.refetch,

    isPending: query.isPending,

    isSuccess: query.isSuccess,

    isError: query.isError,

    error: query.error,

    data: query.data,

    refetch: query.refetch,
  };
}
