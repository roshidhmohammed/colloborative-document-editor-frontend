import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DocumentPage from "@/app/(documents)/documents/[id]/[documentToken]/page";
import { useParams } from "next/navigation";
import {
  CollaboratorList,
  DocumentsEditorHeader,
  Editor,
  useRegisterDocumentCollaborator,
} from "@/features/documentEditor";

const mockUseParams = useParams as jest.Mock;
const mockUseRegisterDocumentCollaborator = useRegisterDocumentCollaborator as jest.Mock;

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/features/documentEditor", () => ({
  __esModule: true,
  CollaboratorList: ({ documentId }: { documentId: string }) => (
    <div data-testid="collaborator-list">{documentId}</div>
  ),
  DocumentsEditorHeader: ({
    documentId,
    documentToken,
    onShareClick,
  }: {
    documentId: string;
    documentToken: string;
    onShareClick: () => void;
  }) => (
    <div>
      <div data-testid="header-props">{documentId}-{documentToken}</div>
      <button onClick={onShareClick}>Share</button>
    </div>
  ),
  Editor: ({ documentId, documentToken }: { documentId: string; documentToken: string }) => (
    <div data-testid="editor">{documentId}-{documentToken}</div>
  ),
  useRegisterDocumentCollaborator: jest.fn(),
}));

jest.mock("@/features/documentEditor/components/ShareModal", () => ({
  __esModule: true,
  default: ({ documentId, documentToken }: { documentId: string; documentToken: string }) => (
    <div data-testid="share-modal">{documentId}-{documentToken}</div>
  ),
}));

describe("DocumentPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({
      id: "doc-123",
      documentToken: "token-xyz",
    });
  });

  it("renders the editor shell and registers the collaborator hook with the route params", () => {
    render(<DocumentPage />);

    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("Collaborate and write in real time.")).toBeInTheDocument();
    expect(screen.getByTestId("header-props")).toHaveTextContent("doc-123-token-xyz");
    expect(screen.getByTestId("editor")).toHaveTextContent("doc-123-token-xyz");
    expect(screen.getByTestId("collaborator-list")).toHaveTextContent("doc-123");
    expect(mockUseRegisterDocumentCollaborator).toHaveBeenCalledWith("doc-123", "token-xyz");
  });

  it("falls back to demo values when route params are missing", () => {
    mockUseParams.mockReturnValue({});

    render(<DocumentPage />);

    expect(mockUseRegisterDocumentCollaborator).toHaveBeenCalledWith("demo", "demo");
    expect(screen.getByTestId("editor")).toHaveTextContent("demo-demo");
  });

  it("does not render the share modal until the header share action is triggered", () => {
    render(<DocumentPage />);

    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
  });

  it("renders the share modal when the header share button is clicked", async () => {
    const user = userEvent.setup();

    render(<DocumentPage />);

    await user.click(screen.getByRole("button", { name: /share/i }));

    expect(screen.getByTestId("share-modal")).toHaveTextContent("doc-123-token-xyz");
  });
});
