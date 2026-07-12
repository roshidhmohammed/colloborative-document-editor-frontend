import { renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";

import { useCreateDocument } from "@/features/documents/hooks/useCreateDocument";
import { documentService } from "@/features/documents/services/document";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock("@/features/documents/services/document", () => ({
  documentService: {
    createDocument: jest.fn(),
  },
}));

describe("useCreateDocument", () => {
  const mutateMock = jest.fn();
  const mutateAsyncMock = jest.fn();
  const resetMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
      reset: resetMock,
    });
  });

  it("calls useMutation with documentService.createDocument", () => {
    renderHook(() => useCreateDocument());

    expect(useMutation).toHaveBeenCalledWith({
      mutationFn: documentService.createDocument,
    });
  });

  it("returns create document mutation functions", () => {
    const { result } = renderHook(() => useCreateDocument());

    expect(result.current.createDocument).toBe(mutateMock);
    expect(result.current.createDocumentAsync).toBe(mutateAsyncMock);
    expect(result.current.reset).toBe(resetMock);
  });

  it("returns mutation state values", () => {
    const { result } = renderHook(() => useCreateDocument());

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("returns pending state", () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
      reset: resetMock,
    });

    const { result } = renderHook(() => useCreateDocument());

    expect(result.current.isPending).toBe(true);
  });

  it("returns success state and data", () => {
    const response = {"document": {
            "id": "fgghn4545gf456557",
            "name": "Loop Engineering",
            "content": {},
            "creatorId": "dfffgg-hghr674574",
            "creatorLink": null,
            "createdAt": "2026-07-04T13:10:35.181Z",
            "updatedAt": "2026-07-04T13:10:35.181Z",
            "creator": {
                "id": "fddfgjg-485467-fghgg",
                "email": "mohammedroshidh71@gmail.com",
                "fullName": "Roshidh"
            }
        },
        "ownerToken": "ssddr3434445ffg45455454gfrfhghf"};

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
      data: response,
      reset: resetMock,
    });

    const { result } = renderHook(() => useCreateDocument());

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(response);
  });

  it("returns error state", () => {
    const error = new Error("Document creation failed");

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: false,
      isSuccess: false,
      isError: true,
      error,
      data: null,
      reset: resetMock,
    });

    const { result } = renderHook(() => useCreateDocument());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});
