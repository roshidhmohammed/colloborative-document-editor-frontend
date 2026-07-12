import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";

import { useUserAuth } from "@/features/auth/hooks/useUserAuth";
import { authService } from "@/features/auth/services/auth";

// ─── Module mocks ────────────────────────────────────────────────────────────

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/features/auth/services/auth", () => ({
  authService: {
    userAuth: jest.fn(),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const refetchMock = jest.fn();

/**
 * Returns the minimal shape that useQuery would normally return, so that
 * each test can override only the fields it cares about.
 */
function makeQueryResult(overrides: Partial<ReturnType<typeof useQuery>> = {}) {
  return {
    refetch: refetchMock,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    ...overrides,
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("useUserAuth", () => {
  const useQueryMock = useQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useQueryMock.mockReturnValue(makeQueryResult());
  });

  // ── Configuration ───────────────────────────────────────────────────────

  it("calls useQuery with the correct queryKey", () => {
    renderHook(() => useUserAuth());

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["userAuth"],
      })
    );
  });

  it("calls useQuery with authService.userAuth as the queryFn", () => {
    renderHook(() => useUserAuth());

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryFn: authService.userAuth,
      })
    );
  });

  // ── Return-value shape ──────────────────────────────────────────────────

  it("maps userAuth and userAuthAsync to query.refetch", () => {
    const { result } = renderHook(() => useUserAuth());

    expect(result.current.userAuth).toBe(refetchMock);
    expect(result.current.userAuthAsync).toBe(refetchMock);
  });

  it("maps refetch to query.refetch", () => {
    const { result } = renderHook(() => useUserAuth());

    expect(result.current.refetch).toBe(refetchMock);
  });

  // ── Default (idle) state ────────────────────────────────────────────────

  it("returns the default idle state correctly", () => {
    const { result } = renderHook(() => useUserAuth());

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeUndefined();
  });

  // ── Pending state ───────────────────────────────────────────────────────

  it("reflects isPending: true while the query is in-flight", () => {
    useQueryMock.mockReturnValue(makeQueryResult({ isPending: true }));

    const { result } = renderHook(() => useUserAuth());

    expect(result.current.isPending).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  // ── Success state ───────────────────────────────────────────────────────

  it("reflects isSuccess: true and exposes data when the query resolves", () => {
    const mockData = {
      message: "Authenticated",
      token: "jwt-abc-123",
    };

    useQueryMock.mockReturnValue(
      makeQueryResult({ isSuccess: true, data: mockData })
    );

    const { result } = renderHook(() => useUserAuth());

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  // ── Error state ─────────────────────────────────────────────────────────

  it("reflects isError: true and exposes the error when the query fails", () => {
    const mockError = new Error("Unauthorized");

    useQueryMock.mockReturnValue(
      makeQueryResult({ isError: true, error: mockError })
    );

    const { result } = renderHook(() => useUserAuth());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  // ── Re-render stability ─────────────────────────────────────────────────

  it("does not re-create the returned functions across re-renders", () => {
    const { result, rerender } = renderHook(() => useUserAuth());

    const firstRefetch = result.current.refetch;
    rerender();
    const secondRefetch = result.current.refetch;

    // Both references point to the same mock, so identity is preserved.
    expect(firstRefetch).toBe(secondRefetch);
  });
});
