import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";

import { useFetchProfile } from "@/features/user/hooks/useFetchProfile";
import { userService } from "@/features/user/services/user";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/features/user/services/user", () => ({
  userService: {
    getProfile: jest.fn(),
  },
}));

describe("useFetchProfile", () => {
  const useQueryMock = useQuery as jest.Mock;
  const getProfileMock = userService.getProfile as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useQueryMock.mockReturnValue({ data: null, isLoading: false, isError: false });
    getProfileMock.mockResolvedValue({
      id: "user-1",
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    });
  });

  it("calls react-query with the expected profile query configuration", () => {
    renderHook(() => useFetchProfile());

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: ["userProfile"],
      queryFn: userService.getProfile,
    });
  });

  it("returns the profile data from react-query", () => {
    const profile = {
      id: "user-1",
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    };

    useQueryMock.mockReturnValue({ data: profile, isLoading: false, isError: false });

    const { result } = renderHook(() => useFetchProfile());

    expect(result.current).toEqual(profile);
  });

  it("returns null when the profile query has not loaded data yet", () => {
    useQueryMock.mockReturnValue({ data: null, isLoading: true, isError: false });

    const { result } = renderHook(() => useFetchProfile());

    expect(result.current).toBeNull();
  });

  it("returns undefined when the query has no data and the request is idle", () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    const { result } = renderHook(() => useFetchProfile());

    expect(result.current).toBeUndefined();
  });

  it("surfaces the error state from react-query", () => {
    const error = new Error("Failed to load profile");

    useQueryMock.mockReturnValue({ data: null, isLoading: false, isError: true, error });

    const { result } = renderHook(() => useFetchProfile());

    expect(result.current).toBeNull();
  });

  it("uses userService.getProfile as the query function", () => {
    renderHook(() => useFetchProfile());

    const [options] = useQueryMock.mock.calls[0];

    expect(options.queryFn).toBe(userService.getProfile);
  });
});
