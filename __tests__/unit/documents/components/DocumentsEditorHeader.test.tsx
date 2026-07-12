import { fireEvent, render, screen } from "@testing-library/react";

import DocumentsEditorHeader from "@/features/documentEditor/components/DocumentsEditorHeader";
import { useFetchDocumentDetails } from "@/features/documents";

jest.mock("@/features/documents", () => ({
  useFetchDocumentDetails: jest.fn(),
  selectDocumentName: jest.fn((response) => response?.document?.name),
  selectCurrentDocumentShareLink: jest.fn((response) => response?.currentDocumentShareLink),
}));

describe("DocumentsEditorHeader", () => {
  const useFetchDocumentDetailsMock = useFetchDocumentDetails as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading state when document name is still being fetched", () => {
    useFetchDocumentDetailsMock.mockImplementation((token: string, options?: { select?: (value: unknown) => unknown }) => {
      if (options?.select && options.select({ document: { name: "Loaded" } })) {
        return { data: undefined, isLoading: true, isError: false };
      }

      return { data: undefined, isLoading: true, isError: false };
    });

    render(
      <DocumentsEditorHeader
        documentId="doc-123"
        documentToken="token-abc"
        onShareClick={jest.fn()}
      />
    );

    expect(screen.getByText("Loading document...")).toBeInTheDocument();
  });

  it("renders the fetched document name and workspace label", () => {
    useFetchDocumentDetailsMock.mockReturnValue({
      data: "Quarterly roadmap",
      isLoading: false,
      isError: false,
    });

    render(
      <DocumentsEditorHeader
        documentId="doc-123"
        documentToken="token-abc"
        onShareClick={jest.fn()}
      />
    );

    expect(screen.getByText("Document workspace")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Quarterly roadmap" })).toBeInTheDocument();
  });

  it("falls back to a generated document title when no name is available", () => {
    useFetchDocumentDetailsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(
      <DocumentsEditorHeader
        documentId="doc-456"
        documentToken="token-xyz"
        onShareClick={jest.fn()}
      />
    );

    expect(screen.getByRole("heading", { level: 1, name: "Document #doc-456" })).toBeInTheDocument();
  });

  it("shows an error alert when document details fail to load", () => {
    useFetchDocumentDetailsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(
      <DocumentsEditorHeader
        documentId="doc-123"
        documentToken="token-abc"
        onShareClick={jest.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't load the latest document details/i
    );
  });

  it("renders the share button for owners and undefined roles", () => {
    useFetchDocumentDetailsMock.mockImplementation((token: string, options?: { select?: (value: unknown) => unknown }) => {
      if (options?.select && options.select({ currentDocumentShareLink: { role: "OWNER" } })) {
        return {
          data: { role: "OWNER" },
          isLoading: false,
          isError: false,
        };
      }

      return {
        data: undefined,
        isLoading: false,
        isError: false,
      };
    });

    render(
      <DocumentsEditorHeader
        documentId="doc-123"
        documentToken="token-owner"
        onShareClick={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /share link/i })).toBeInTheDocument();
  });

  it("hides the share button for non-owner collaborators", () => {
    useFetchDocumentDetailsMock.mockImplementation((token: string, options?: { select?: (value: unknown) => unknown }) => {
      if (options?.select && options.select({ currentDocumentShareLink: { role: "EDITOR" } })) {
        return {
          data: { role: "EDITOR" },
          isLoading: false,
          isError: false,
        };
      }

      return {
        data: undefined,
        isLoading: false,
        isError: false,
      };
    });

    render(
      <DocumentsEditorHeader
        documentId="doc-123"
        documentToken="token-abc"
        onShareClick={jest.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /share link/i })).not.toBeInTheDocument();
  });

  it("calls onShareClick when the share button is clicked", () => {
    const onShareClick = jest.fn();

    useFetchDocumentDetailsMock.mockImplementation((token: string, options?: { select?: (value: unknown) => unknown }) => {
      if (options?.select && options.select({ currentDocumentShareLink: { role: "OWNER" } })) {
        return {
          data: { role: "OWNER" },
          isLoading: false,
          isError: false,
        };
      }

      return {
        data: undefined,
        isLoading: false,
        isError: false,
      };
    });

    render(
      <DocumentsEditorHeader
        documentId="doc-123"
        documentToken="token-abc"
        onShareClick={onShareClick}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /share link/i }));

    expect(onShareClick).toHaveBeenCalledTimes(1);
  });
});
