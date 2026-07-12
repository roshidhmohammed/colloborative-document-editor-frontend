import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";

import { useFetchDocuments } from "@/features/documents/hooks/useFetchDocuments";
import { documentService } from "@/features/documents/services/document";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/features/documents/services/document", () => ({
  documentService: {
    getAllDocuments: jest.fn(),
  },
}));

describe("useFetchDocuments", () => {
  const useQueryMock = useQuery as jest.Mock;
  const getAllDocumentsMock = documentService.getAllDocuments as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    getAllDocumentsMock.mockResolvedValue([]);
  });

  it("calls react-query with the expected document list query configuration", () => {
    renderHook(() => useFetchDocuments());

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: ["documents"],
      queryFn: documentService.getAllDocuments,
    });
  });

  it("returns the query state as-is from react-query", () => {
    const queryResult = {
      data: [{
            "id": "dffddfdfew33444dfsgfh",
            "name": "Loop Engineering",
            "content": {},
            "creatorId": "rrrgh54565-565gtyy",
            "creatorLink": null,
            "createdAt": "2026-07-04T13:10:35.181Z",
            "updatedAt": "2026-07-04T13:10:35.181Z",
            "creator": {
                "id": "erert54-5hy566jh-ytjh",
                "email": "asadfdffggf@gmail.com",
                "fullName": "Roshidh"
            },
            "collaborators": [],
            "associatedRoleToken": "dfdfgg 34556566"
        }],
      isLoading: false,
      isError: false,
      error: null,
    };

    useQueryMock.mockReturnValue(queryResult);

    const { result } = renderHook(() => useFetchDocuments());

    expect(result.current).toEqual(queryResult);
  });

  it("exposes the loading state when the documents request is pending", () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useFetchDocuments());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("exposes the empty-state response when no documents are returned", () => {
    useQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useFetchDocuments());

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("exposes the error state when the documents request fails", () => {
    const error = new Error("Failed to load documents");

    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    });

    const { result } = renderHook(() => useFetchDocuments());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });

  it("uses documentService.getAllDocuments as the query function", () => {
    renderHook(() => useFetchDocuments());

    const [options] = useQueryMock.mock.calls[0];

    expect(options.queryFn).toBe(documentService.getAllDocuments);
  });
});
