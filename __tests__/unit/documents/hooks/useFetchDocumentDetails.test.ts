import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";

import {
  documentDetailsQueryKey,
  selectCanEditDocument,
  selectCurrentDocumentRole,
  selectCurrentDocumentShareLink,
  selectDocument,
  selectDocumentContent,
  selectDocumentName,
  selectDocumentShareLinks,
  useFetchDocumentDetails,
} from "@/features/documents/hooks/useFetchDocumentDetails";
import { documentService } from "@/features/documents/services/document";
import type { GetDocumentResponse } from "@/features/documents/types/document";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/features/documents/services/document", () => ({
  documentService: {
    getDocument: jest.fn(),
  },
}));

describe("useFetchDocumentDetails", () => {
  const useQueryMock = useQuery as jest.Mock;
  const getDocumentMock = documentService.getDocument as jest.Mock;

  const buildShareLink = (role: "OWNER" | "EDITOR" | "VIEWER") => ({
    id: "share-1",
    token: "share-token-1",
    documentId: "doc-123",
    role,
    createdById: "user-1",
    expiresAt: null,
    isActive: true,
    createdAt: "2026-07-04T13:10:35.181Z",
  });

  const buildDocumentResponse = (
    role: "OWNER" | "EDITOR" | "VIEWER" = "OWNER"
  ): GetDocumentResponse => ({
    document: {
      id: "doc-123",
      name: "Project Plan",
      content: "<p>Project plan</p>",
      creatorId: "user-1",
      createdAt: "2026-07-04T13:10:35.181Z",
      updatedAt: "2026-07-04T13:10:35.181Z",
      creator: {
        id: "user-1",
        email: "owner@example.com",
        fullName: "Owner User",
      },
      collaborators: [],
    },
    documentShareLinks: [buildShareLink(role)],
    currentDocumentShareLink: buildShareLink(role),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useQueryMock.mockReturnValue({ data: null, isLoading: false });
    getDocumentMock.mockResolvedValue(buildDocumentResponse());
  });

  describe("query key and selector helpers", () => {
    it("builds a stable query key from the document token", () => {
      expect(documentDetailsQueryKey("token-123")).toEqual([
        "document",
        "details",
        "token-123",
      ]);
    });

    it("maps the response shape through the selector helpers", () => {
      const response = buildDocumentResponse("EDITOR");

      expect(selectDocument(response)).toEqual(response.document);
      expect(selectDocumentName(response)).toBe(response.document.name);
      expect(selectDocumentContent(response)).toEqual(response.document.content);
      expect(selectDocumentShareLinks(response)).toEqual(response.documentShareLinks);
      expect(selectCurrentDocumentShareLink(response)).toEqual(
        response.currentDocumentShareLink
      );
      expect(selectCurrentDocumentRole(response)).toBe(response.currentDocumentShareLink.role);
      expect(selectCanEditDocument(response)).toBe(true);
      expect(selectCanEditDocument(buildDocumentResponse("VIEWER"))).toBe(false);
    });
  });

  describe("hook configuration", () => {
    it("calls useQuery with the expected query configuration for a valid token", () => {
      renderHook(() => useFetchDocumentDetails("token-123"));

      expect(useQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["document", "details", "token-123"],
          enabled: true,
          staleTime: 5 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
          select: undefined,
        })
      );
    });

    it("disables the query when no document token is provided", () => {
      renderHook(() => useFetchDocumentDetails(""));

      const [options] = useQueryMock.mock.calls[0];

      expect(options.enabled).toBe(false);
    });

    it("passes a custom select function through to react-query", () => {
      const select = jest.fn((response) => response.document.name);

      renderHook(() => useFetchDocumentDetails("token-123", { select }));

      const [options] = useQueryMock.mock.calls[0];

      expect(options.select).toBe(select);
    });

    it("uses documentService.getDocument as the query function and resolves its response", async () => {
      renderHook(() => useFetchDocumentDetails("token-123"));

      const [options] = useQueryMock.mock.calls[0];
      const result = await options.queryFn();

      expect(getDocumentMock).toHaveBeenCalledWith(
        "token-123",
        expect.objectContaining({ headers: expect.any(Object) })
      );
      expect(result).toEqual(buildDocumentResponse());
    });
  });
});
