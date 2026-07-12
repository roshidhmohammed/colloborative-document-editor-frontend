import { useQuery } from "@tanstack/react-query";

import { authService } from "../services/auth";

export function useUserAuth() {
  const query = useQuery({
    queryKey: ["userAuth"],
    queryFn: authService.userAuth,
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

    // reset: query.remove,
  };
}