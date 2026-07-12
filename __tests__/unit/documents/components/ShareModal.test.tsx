import {  render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ShareModal from "@/features/documentEditor/components/ShareModal";
import { useFetchDocumentDetails } from "@/features/documents";

const mockUseFetchDocumentDetails = useFetchDocumentDetails as jest.Mock;
const writeTextMock = jest.fn().mockResolvedValue(undefined);

const setupUser = () => {
  const user = userEvent.setup();

  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: writeTextMock,
    },
  });

  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: writeTextMock,
    },
  });

  return user;
};

jest.mock("@/features/documents", () => ({
  useFetchDocumentDetails: jest.fn(),
  selectDocumentShareLinks: jest.fn(),
}));

describe("ShareModal", () => {
  const shareLinks = [
    {
      documentId: "doc-123",
      token: "viewer-token",
      role: "VIEWER",
      isActive: true,
    },
    {
      documentId: "doc-123",
      token: "editor-token",
      role: "EDITOR",
      isActive: true,
    },
    {
      documentId: "doc-123",
      token: "inactive-token",
      role: "VIEWER",
      isActive: false,
    },
  ];

  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    jest.clearAllMocks();
    writeTextMock.mockReset().mockResolvedValue(undefined);

    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    mockUseFetchDocumentDetails.mockReturnValue({
      data: shareLinks,
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
  });

  it("renders the modal contents and default viewer link", () => {
    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={jest.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /share document/i })).toBeInTheDocument();
    expect(screen.getByText(/choose access for the shared link/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("VIEWER");
    expect(screen.getByRole("button", { name: /copy link/i })).toBeEnabled();
  });

  it("disables the copy button while the share link is loading", () => {
    mockUseFetchDocumentDetails.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /loading link/i })).toBeDisabled();
  });

  it("shows an error alert when sharing links fail to load", () => {
    mockUseFetchDocumentDetails.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={jest.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't load the sharing links/i
    );
    expect(screen.getByRole("button", { name: /copy link/i })).toBeDisabled();
  });

  it("updates the link target when the access role changes", async () => {
    const user = setupUser();

    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={jest.fn()}
      />
    );

    await user.selectOptions(screen.getByRole("combobox"), "EDITOR");

    const copyButton = screen.getByRole("button", { name: /copy link/i });
    expect(copyButton).toBeEnabled();
    expect(navigator.clipboard.writeText).toBe(writeTextMock);

    await user.click(copyButton);

    await waitFor(() =>
      expect(writeTextMock).toHaveBeenCalledWith(
        `${window.location.origin}/documents/doc-123/editor-token`
      )
    );
  });

  it("copies the link text and temporarily shows the copied state", async () => {
    const user = setupUser();

    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={jest.fn()}
      />
    );

    const copyButton = screen.getByRole("button", { name: /copy link/i });
    expect(copyButton).toBeEnabled();

    await user.click(copyButton);

    await waitFor(() =>
      expect(writeTextMock).toHaveBeenCalledWith(
        `${window.location.origin}/documents/doc-123/viewer-token`
      )
    );
    expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();

    await waitFor(
      () => expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  it("handles clipboard write failures gracefully", async () => {
    writeTextMock.mockRejectedValue(new Error("Denied"));
    const user = setupUser();

    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={jest.fn()}
      />
    );

    const copyButton = screen.getByRole("button", { name: /copy link/i });
    expect(copyButton).toBeEnabled();

    await user.click(copyButton);

    await waitFor(() => expect(writeTextMock).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
  });

  it("disables the copy button when there is no active link for the selected role", async () => {
    mockUseFetchDocumentDetails.mockReturnValue({
      data: [
        {
          documentId: "doc-123",
          token: "inactive-token",
          role: "EDITOR",
          isActive: false,
        },
      ],
      isLoading: false,
      isError: false,
    });

    const user = setupUser();

    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={jest.fn()}
      />
    );

    await user.selectOptions(screen.getByRole("combobox"), "EDITOR");

    expect(screen.getByRole("button", { name: /copy link/i })).toBeDisabled();
  });

  it("closes the modal when the close button is clicked", async () => {
    const setShareOpen = jest.fn();
    const user = setupUser();

    render(
      <ShareModal
        documentId="doc-123"
        documentToken="token-123"
        setShareOpen={setShareOpen}
      />
    );

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(setShareOpen).toHaveBeenCalledWith(false);
  });
});
