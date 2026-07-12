import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";

import { useFetchCollaborators } from "@/features/collaborators/hooks/useFetchCollaborators";
import { collaboratorService } from "@/features/collaborators/services/collaborator";

// ─── Module mocks ────────────────────────────────────────────────────────────

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/features/collaborators/services/collaborator", () => ({
  collaboratorService: {
    getCollaborators: jest.fn(),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeQueryResult(overrides: Partial<ReturnType<typeof useQuery>> = {}) {
  return {
    data: undefined,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("useFetchCollaborators", () => {
  const useQueryMock = useQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useQueryMock.mockReturnValue(makeQueryResult());
  });

  // ── Configuration ───────────────────────────────────────────────────────

  it("calls useQuery with the correct queryKey for the given documentId", () => {
    renderHook(() => useFetchCollaborators("doc-abc"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["documents", "doc-abc", "collaborators"],
      })
    );
  });

  it("enables the query when documentId is a non-empty string", () => {
    renderHook(() => useFetchCollaborators("doc-abc"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true })
    );
  });

  it("disables the query when documentId is an empty string", () => {
    renderHook(() => useFetchCollaborators(""));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it("uses a queryFn that delegates to collaboratorService.getCollaborators with the correct documentId", async () => {
    const documentId = "doc-xyz";
    const mockCollaborators = [{ id: "user-1", role: "viewer" }];

    (collaboratorService.getCollaborators as jest.Mock).mockResolvedValue(
      mockCollaborators
    );

    renderHook(() => useFetchCollaborators(documentId));

    // Extract the queryFn that was passed to useQuery and call it directly.
    const { queryFn } = useQueryMock.mock.calls[0][0] as {
      queryFn: () => Promise<unknown>;
    };
    const result = await queryFn();

    expect(collaboratorService.getCollaborators).toHaveBeenCalledWith(
      documentId
    );
    expect(result).toEqual(mockCollaborators);
  });

  it("passes a distinct queryKey when a different documentId is supplied", () => {
    renderHook(() => useFetchCollaborators("doc-111"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["documents", "doc-111", "collaborators"],
      })
    );
  });

  // ── Return-value shape ──────────────────────────────────────────────────

  it("returns the raw useQuery result", () => {
    const mockResult = makeQueryResult({ isPending: false, isSuccess: true });
    useQueryMock.mockReturnValue(mockResult);

    const { result } = renderHook(() => useFetchCollaborators("doc-abc"));

    // The hook is a thin passthrough — whatever useQuery returns is what
    // the caller receives.
    expect(result.current).toBe(mockResult);
  });

  // ── State transitions ───────────────────────────────────────────────────

  it("reflects the pending state while data is loading", () => {
    useQueryMock.mockReturnValue(makeQueryResult({ isPending: true }));

    const { result } = renderHook(() => useFetchCollaborators("doc-abc"));

    expect(result.current.isPending).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("reflects the success state with collaborator data", () => {
    const collaborators = [
      { id: "user-1", role: "editor" },
      { id: "user-2", role: "viewer" },
    ];

    useQueryMock.mockReturnValue(
      makeQueryResult({ isSuccess: true, data: collaborators })
    );

    const { result } = renderHook(() => useFetchCollaborators("doc-abc"));

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(collaborators);
  });

  it("reflects the error state when the query fails", () => {
    const error = new Error("Failed to fetch collaborators");

    useQueryMock.mockReturnValue(makeQueryResult({ isError: true, error }));

    const { result } = renderHook(() => useFetchCollaborators("doc-abc"));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});
