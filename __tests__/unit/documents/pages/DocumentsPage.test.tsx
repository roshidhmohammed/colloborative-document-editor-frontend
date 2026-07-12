import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";

import DocumentsPage from "@/app/(documents)/documents/page";
import { useFetchDocuments } from "@/features/documents/hooks/useFetchDocuments";

jest.mock("@/features/documents/hooks/useFetchDocuments", () => ({
  useFetchDocuments: jest.fn(),
}));

jest.mock("@/features/documents/components/CreateDocumentCard", () => ({
  __esModule: true,
  default: () => <div data-testid="create-document-card">Create Document Card</div>,
}));

jest.mock("@/features/documents/components/DocumentCard", () => ({
  __esModule: true,
  default: ({ document }: { document: { name: string } }) => (
    <div data-testid="document-card">{document.name}</div>
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("DocumentsPage integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDocumentsQuery = (overrides: Partial<Record<string, unknown>> = {}) => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      ...overrides,
    });
  };

  it("renders the page shell, header content, and documents in a single main landmark", () => {
    mockDocumentsQuery({
      data: [
        {
          id: "doc-1",
          name: "Product Requirements",
          associatedRoleToken: "token-1",
        },
      ],
    });

    render(<DocumentsPage />);

    const main = screen.getByRole("main");

    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByRole("heading", { level: 1, name: /your documents/i }));
    expect(within(main).getByText(/workspace/i)).toBeInTheDocument();
    expect(within(main).getByText(/product requirements/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("preserves the shell and shows an empty state when the user has no documents", () => {
    mockDocumentsQuery({ data: [] });

    render(<DocumentsPage />);

    const main = screen.getByRole("main");

    expect(main).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /your documents/i })).toBeInTheDocument();
    expect(screen.getByTestId("create-document-card")).toBeInTheDocument();
    expect(screen.getByText(/no documents yet/i)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("keeps the page accessible and informative while documents are loading", () => {
    mockDocumentsQuery({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(<DocumentsPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /your documents/i })).toBeInTheDocument();
    expect(screen.getByText(/loading documents/i)).toBeInTheDocument();
  });

  it("renders an error alert without losing the page structure when the document query fails", () => {
    mockDocumentsQuery({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<DocumentsPage />);

    const main = screen.getByRole("main");

    expect(main).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/could not load your documents/i);
    expect(screen.getByRole("heading", { level: 1, name: /your documents/i })).toBeInTheDocument();
  });
});
