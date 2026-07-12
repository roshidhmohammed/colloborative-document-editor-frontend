"use client";

import {  useQuery } from "@tanstack/react-query";

import { userService } from "../services/user";

export function useFetchProfile() {
  const {data} =  useQuery({
    queryKey: ["userProfile"],
    queryFn: userService.getProfile,
  });

return data
}