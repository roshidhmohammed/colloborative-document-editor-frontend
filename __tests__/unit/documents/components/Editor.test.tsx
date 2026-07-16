import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Editor from "@/features/documentEditor/components/Editor";
import { useFetchDocumentDetails } from "@/features/documents";
import { getSocket } from "@/lib/socket";
import { getDocument, saveDocument } from "@/features/documentEditor/services/docOfflineStorage";
import { documentSocketService } from "@/features/documentEditor/services/documentSocket";
import useEditorConfig from "@/features/documentEditor/hooks/useEditorConfig";
import { yDocToProsemirrorJSON } from "y-prosemirror";
import * as Y from "yjs";

const setupUser = () => {
  return userEvent.setup();
};

// Mock @tiptap/react
const mockEditor = {
  setEditable: jest.fn(),
  commands: {
    setContent: jest.fn(),
  },
  chain: jest.fn(() => ({
    focus: jest.fn(() => ({
      toggleHeading: jest.fn(() => ({ run: jest.fn() })),
      setParagraph: jest.fn(() => ({ run: jest.fn() })),
      toggleBold: jest.fn(() => ({ run: jest.fn() })),
      toggleItalic: jest.fn(() => ({ run: jest.fn() })),
      toggleStrike: jest.fn(() => ({ run: jest.fn() })),
      toggleHighlight: jest.fn(() => ({ run: jest.fn() })),
      setTextAlign: jest.fn(() => ({ run: jest.fn() })),
    })),
  })),
  isActive: jest.fn(() => false),
};

jest.mock("@tiptap/react", () => ({
  EditorContent: jest.fn(({ editor }) => <div data-testid="editor-content" />),
  useEditorState: jest.fn(({ selector }) => selector({ editor: mockEditor })),
}));

// Mock yjs
jest.mock("yjs", () => ({
  Doc: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    guid: "mock-guid",
  })),
  applyUpdate: jest.fn(),
  encodeStateAsUpdate: jest.fn(() => new Uint8Array([100, 101, 102])),
}));

// Mock y-prosemirror
jest.mock("y-prosemirror", () => ({
  yDocToProsemirrorJSON: jest.fn((ydoc) => `pm-json-for-${ydoc ? "ydoc" : "none"}`),
}));

// Mock "@/features/documents"
jest.mock("@/features/documents", () => ({
  useFetchDocumentDetails: jest.fn(),
  selectCanEditDocument: jest.fn(),
}));

// Mock socket connection
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

jest.mock("@/lib/socket", () => ({
  getSocket: jest.fn(() => mockSocket),
}));

// Mock document API
jest.mock("@/features/documentEditor/api/documentSocket.api", () => ({
  toUint8Array: jest.fn((x) => x),
}));

// Mock offline storage services
jest.mock("@/features/documentEditor/services/docOfflineStorage", () => ({
  getDocument: jest.fn(),
  saveDocument: jest.fn(),
  hasPendingUpdates: jest.fn().mockResolvedValue(false),
}));

// Mock offline sync hook
jest.mock("@/features/documentEditor/hooks/useDocOfflineSync", () => ({
  useOfflineSync: jest.fn(),
  flushPendingDocumentUpdates: jest.fn().mockResolvedValue(undefined),
}));

// Mock document socket service
jest.mock("@/features/documentEditor/services/documentSocket", () => ({
  documentSocketService: {
    joinDocument: jest.fn(),
    updateDocument: jest.fn(),
  },
}));

// Mock editor configuration hook
jest.mock("@/features/documentEditor/hooks/useEditorConfig", () => jest.fn());

describe("Editor Component", () => {
  const mockUseFetchDocumentDetails = useFetchDocumentDetails as jest.Mock;
  const mockGetDocument = getDocument as jest.Mock;
  const mockSaveDocument = saveDocument as jest.Mock;
  const mockJoinDocument = documentSocketService.joinDocument as jest.Mock;
  const mockUseEditorConfig = useEditorConfig as jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Set up standard mock responses
    mockUseFetchDocumentDetails.mockReturnValue({
      data: true, // canEdit default to true
      isLoading: false,
      isError: false,
    });
    mockUseEditorConfig.mockReturnValue({ editor: mockEditor });
    mockGetDocument.mockResolvedValue(null);
    mockJoinDocument.mockResolvedValue(new Uint8Array([1, 2, 3]));
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders null if the editor is not initialized", () => {
    mockUseEditorConfig.mockReturnValue({ editor: null });

    const { container } = render(
      <Editor documentId="doc-123" documentToken="token-123" />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders the EditorContent and Menubar when editable", () => {
    render(<Editor documentId="doc-123" documentToken="token-123" />);

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    // Buttons inside Menubar (like H1) should render when canEdit is true
    expect(screen.getByRole("button", { name: "H1" })).toBeInTheDocument();
    expect(mockEditor.setEditable).toHaveBeenCalledWith(true);
  });

  it("renders EditorContent but hides Menubar when not editable", () => {
    mockUseFetchDocumentDetails.mockReturnValue({
      data: false, // canEdit = false
      isLoading: false,
      isError: false,
    });

    render(<Editor documentId="doc-123" documentToken="token-123" />);

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "H1" })).not.toBeInTheDocument();
    expect(mockEditor.setEditable).toHaveBeenCalledWith(false);
  });

  it("loads a local document from IndexedDB and sets editor content on mount", async () => {
    const localUpdate = new Uint8Array([9, 8, 7]);
    mockGetDocument.mockResolvedValue(localUpdate);

    render(<Editor documentId="doc-123" documentToken="token-123" />);

    await waitFor(() => {
      expect(mockGetDocument).toHaveBeenCalledWith("doc-123");
      expect(Y.applyUpdate).toHaveBeenCalled();
      expect(yDocToProsemirrorJSON).toHaveBeenCalled();
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
        expect.any(String),
        { emitUpdate: false }
      );
    });
  });

  it("joins the document socket and saves the merged full Yjs state to IndexedDB", async () => {
    const serverUpdate = new Uint8Array([4, 5, 6]);
    const fullState = new Uint8Array([100, 101, 102]);
    mockJoinDocument.mockResolvedValue(serverUpdate);
    (Y.encodeStateAsUpdate as jest.Mock).mockReturnValue(fullState);

    render(<Editor documentId="doc-123" documentToken="token-123" />);

    await waitFor(() => {
      expect(mockJoinDocument).toHaveBeenCalledWith(mockSocket, "doc-123");
      expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", fullState);
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
        expect.any(String),
        { emitUpdate: false }
      );
    });
  });

  it("handles document join socket failures gracefully", async () => {
    const joinError = new Error("Connection failed");
    mockJoinDocument.mockRejectedValue(joinError);

    render(<Editor documentId="doc-123" documentToken="token-123" />);

    await waitFor(() => {
      expect(mockJoinDocument).toHaveBeenCalled();
      // expect(consoleErrorSpy).toHaveBeenCalledWith(joinError);
    });
  });

  it("subscribes to remote socket updates and saves the merged full Yjs state locally", async () => {
    const fullState = new Uint8Array([100, 101, 102]);
    (Y.encodeStateAsUpdate as jest.Mock).mockReturnValue(fullState);

    render(<Editor documentId="doc-123" documentToken="token-123" />);

    // Get the socket event listener for 'document:update'
    const onCalls = mockSocket.on.mock.calls;
    const updateListeners = onCalls
      .filter(([event]) => event === "document:update")
      .map(([, cb]) => cb);

    expect(updateListeners.length).toBeGreaterThan(0);

    const remoteUpdate = new Uint8Array([10, 20, 30]);

    // Simulate socket emitting updates
    for (const listener of updateListeners) {
      await listener(remoteUpdate);
    }

    expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", fullState);
    expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
      expect.any(String),
      { emitUpdate: false }
    );
  });

  it("registers socket listeners and cleans them up on unmount", () => {
    const { unmount } = render(<Editor documentId="doc-123" documentToken="token-123" />);

    expect(mockSocket.on).toHaveBeenCalledWith("document:update", expect.any(Function));

    const registerCall = mockSocket.on.mock.calls.find(([event]) => event === "document:update");
    const registeredHandler = registerCall[1];

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith("document:update", registeredHandler);
  });

  it("manages the ydoc ref lifecycle correctly", () => {
    const { unmount } = render(<Editor documentId="doc-123" documentToken="token-123" />);

    // Retrieve the ydocRef passed to useEditorConfig (6th argument)
    const ydocRef = mockUseEditorConfig.mock.calls[0][5];
    expect(ydocRef).toBeDefined();

    const ydocInstance = ydocRef.current;
    expect(ydocInstance).toBeDefined();
    expect(Y.Doc).toHaveBeenCalled();

    unmount();

    expect(ydocInstance.destroy).toHaveBeenCalled();
    expect(ydocRef.current).toBeNull();
  });

  it("handles race condition when component is unmounted before socket join resolves", async () => {
    let resolveJoin: (val: unknown) => void = () => {};
    mockJoinDocument.mockReturnValue(
      new Promise((resolve) => {
        resolveJoin = resolve;
      })
    );

    const { unmount } = render(<Editor documentId="doc-123" documentToken="token-123" />);

    // Unmount before resolving the promise
    unmount();

    resolveJoin(new Uint8Array([99, 99, 99]));

    // Yield control to let microtasks execute
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockSaveDocument).not.toHaveBeenCalled();
  });

  it("triggers editor formatting chains when menubar buttons are clicked", async () => {
    const user = setupUser();
    render(<Editor documentId="doc-123" documentToken="token-123" />);

    const h1Button = screen.getByRole("button", { name: "H1" });
    await user.click(h1Button);

    expect(mockEditor.chain).toHaveBeenCalled();
  });
});
