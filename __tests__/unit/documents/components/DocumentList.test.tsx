import { fireEvent, render, screen } from "@testing-library/react";

import DocumentList from "@/features/documents/components/DocumentList";
import { useFetchDocuments } from "@/features/documents/hooks/useFetchDocuments";

jest.mock(
  "@/features/documents/hooks/useFetchDocuments",
  () => ({
    useFetchDocuments: jest.fn(),
  })
);

jest.mock(
  "@/features/documents/components/CreateDocumentCard",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="create-document-card">
        Create Document Card
      </div>
    ),
  })
);

jest.mock(
  "@/features/documents/components/DocumentCard",
  () => ({
    __esModule: true,
    default: ({ document }: { document: { name: string } }) => (
      <div data-testid="document-card">
        {document.name}
      </div>
    ),
  })
);

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("DocumentList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(<DocumentList />);

    expect(
      screen.getByText(/loading documents.../i)
    ).toBeInTheDocument();
  });

  it("shows error state", () => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<DocumentList />);

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "We could not load your documents. Please try again."
    );
  });

  it("shows empty state", () => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<DocumentList />);

    expect(
      screen.getByTestId("create-document-card")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /No documents yet. Create your first one/i
      )
    ).toBeInTheDocument();
  });

  it("renders all documents", () => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [
        {
          id: "1",
          name: "Project Alpha",
          associatedRoleToken: "token-1",
        },
        {
          id: "2",
          name: "Project Beta",
          associatedRoleToken: "token-2",
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<DocumentList />);

    expect(
      screen.getByTestId("create-document-card")
    ).toBeInTheDocument();

    expect(
      screen.getAllByTestId("document-card")
    ).toHaveLength(2);

    expect(
      screen.getByText("Project Alpha")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Project Beta")
    ).toBeInTheDocument();
  });

  it("creates correct document links", () => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [
        {
          id: "123",
          name: "Proposal",
          associatedRoleToken: "ddfd3dffffgffg",
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<DocumentList />);

    expect(
      screen.getByRole("link")
    ).toHaveAttribute(
      "href",
      "/documents/123/ddfd3dffffgffg"
    );
  });

  it("redirects to the document route and renders the document card when clicked", () => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [
        {
          id: "123",
          name: "Proposal",
          associatedRoleToken: "ddfd3dffffgffg",
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<DocumentList />);

    const link = screen.getByRole("link", {
      name: /proposal/i,
    });

    fireEvent.click(link);

    expect(link).toHaveAttribute(
      "href",
      "/documents/123/ddfd3dffffgffg"
    );
    expect(screen.getByTestId("document-card")).toHaveTextContent("Proposal");
  });

  it("calls useFetchDocuments", () => {
    (useFetchDocuments as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<DocumentList />);

    expect(useFetchDocuments).toHaveBeenCalledTimes(1);
  });
});