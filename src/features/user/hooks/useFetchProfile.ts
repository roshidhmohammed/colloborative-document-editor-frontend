"use client";

import { useQuery } from "@tanstack/react-query";

import { userService } from "../services/user";
import { authedQueryFn } from "@/lib/auth-token";

export function useFetchProfile() {
  const { data } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authedQueryFn((auth) => userService.getProfile(auth)),
  });

  return data;
}
