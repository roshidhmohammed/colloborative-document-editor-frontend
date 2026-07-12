import { renderHook } from "@testing-library/react";
import { useEditor } from "@tiptap/react";
import useEditorConfig from "@/features/documentEditor/hooks/useEditorConfig";
import { saveDocument, queuePendingUpdate } from "@/features/documentEditor/services/docOfflineStorage";
import { documentSocketService } from "@/features/documentEditor/services/documentSocket";
import * as Y from "yjs";
import { prosemirrorToYXmlFragment } from "y-prosemirror";
import type { Socket } from "socket.io-client";

// Mock @tiptap/react
jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn((options) => ({
    state: {
      doc: "mock-doc-state",
    },
    _options: options,
  })),
}));

// Mock Yjs
jest.mock("yjs", () => ({
  encodeStateVector: jest.fn(() => new Uint8Array([1])),
  encodeStateAsUpdate: jest.fn(() => new Uint8Array([2])),
}));

// Mock y-prosemirror
jest.mock("y-prosemirror", () => ({
  prosemirrorToYXmlFragment: jest.fn(),
  yDocToProsemirrorJSON: jest.fn(),
}));

interface MockEditor {
  state: {
    doc: string;
  };
  _options: {
    onUpdate: (props: { editor: unknown }) => void | Promise<void>;
  };
}

// Mock offline storage services
jest.mock("@/features/documentEditor/services/docOfflineStorage", () => ({
  saveDocument: jest.fn(),
  queuePendingUpdate: jest.fn(),
}));

// Mock socket services
jest.mock("@/features/documentEditor/services/documentSocket", () => ({
  documentSocketService: {
    updateDocument: jest.fn(),
  },
}));

describe("useEditorConfig Hook", () => {
  const useEditorMock = useEditor as jest.Mock;
  const mockEncodeStateAsUpdate = Y.encodeStateAsUpdate as jest.Mock;
  const mockProsemirrorToYXmlFragment = prosemirrorToYXmlFragment as jest.Mock;
  const mockSaveDocument = saveDocument as jest.Mock;
  const mockQueuePendingUpdate = queuePendingUpdate as jest.Mock;
  const mockUpdateDocument = documentSocketService.updateDocument as jest.Mock;

  const mockSocket = {} as unknown as Socket;
  const originalOnLine = navigator.onLine;

  const setOnLine = (status: boolean) => {
    Object.defineProperty(navigator, "onLine", {
      value: status,
      configurable: true,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setOnLine(true);
    mockEncodeStateAsUpdate.mockReturnValue(new Uint8Array([2])); // byteLength > 0 by default
  });

  afterAll(() => {
    setOnLine(originalOnLine);
  });

  it("calls useEditor with the expected configuration options", () => {
    renderHook(() =>
      useEditorConfig(
        true,
        "doc-123",
        mockSocket,
        { current: false },
        { current: true },
        { current: {} as unknown as Y.Doc | null }
      )
    );

    expect(useEditorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "",
        immediatelyRender: false,
        editable: true,
        extensions: expect.any(Array),
        onUpdate: expect.any(Function),
      })
    );
  });

  it("does not trigger save or sync if isApplyingRemoteUpdate is true", async () => {
    const isApplyingRemoteUpdate = { current: true };
    const hasLoadedDocument = { current: true };
    const ydocRef = { current: {} as unknown as Y.Doc | null };

    const { result } = renderHook(() =>
      useEditorConfig(
        true,
        "doc-123",
        mockSocket,
        isApplyingRemoteUpdate,
        hasLoadedDocument,
        ydocRef
      )
    );

    const onUpdate = (result.current.editor as unknown as MockEditor)._options.onUpdate;
    onUpdate({ editor: result.current.editor });

    expect(mockSaveDocument).not.toHaveBeenCalled();
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });

  it("does not trigger save or sync if hasLoadedDocument is false", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: false };
    const ydocRef = { current: null };

    const { result } = renderHook(() =>
      useEditorConfig(
        true,
        "doc-123",
        mockSocket,
        isApplyingRemoteUpdate,
        hasLoadedDocument,
        ydocRef
      )
    );

    const onUpdate = (result.current.editor as unknown as MockEditor)._options.onUpdate;
    onUpdate({ editor: result.current.editor });

    expect(mockSaveDocument).not.toHaveBeenCalled();
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });

  it("does not trigger save or sync if ydocRef is null", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const ydocRef = { current: null };

    const { result } = renderHook(() =>
      useEditorConfig(
        true,
        "doc-123",
        mockSocket,
        isApplyingRemoteUpdate,
        hasLoadedDocument,
        ydocRef
      )
    );

    const onUpdate = (result.current.editor as unknown as MockEditor)._options.onUpdate;
    onUpdate({ editor: result.current.editor });

    expect(mockSaveDocument).not.toHaveBeenCalled();
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });

  it("does not trigger save or sync if the state update has byteLength equal to 0", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const mockYDoc = { getXmlFragment: jest.fn(() => "fragment") };
    const ydocRef = { current: mockYDoc as unknown as Y.Doc };

    mockEncodeStateAsUpdate.mockReturnValue(new Uint8Array(0)); // byteLength = 0

    const { result } = renderHook(() =>
      useEditorConfig(
        true,
        "doc-123",
        mockSocket,
        isApplyingRemoteUpdate,
        hasLoadedDocument,
        ydocRef
      )
    );

    const onUpdate = (result.current.editor as unknown as MockEditor)._options.onUpdate;
    onUpdate({ editor: result.current.editor });

    expect(mockYDoc.getXmlFragment).toHaveBeenCalledWith("prosemirror");
    expect(mockProsemirrorToYXmlFragment).toHaveBeenCalledWith("mock-doc-state", "fragment");
    expect(mockSaveDocument).not.toHaveBeenCalled();
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });

  it("saves the document and calls updateDocument via socket when navigator is online", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const mockYDoc = { getXmlFragment: jest.fn(() => "fragment") };
    const ydocRef = { current: mockYDoc as unknown as Y.Doc };
    const mockUpdate = new Uint8Array([10, 20]);
    mockEncodeStateAsUpdate.mockReturnValue(mockUpdate);

    setOnLine(true);

    const { result } = renderHook(() =>
      useEditorConfig(
        true,
        "doc-123",
        mockSocket,
        isApplyingRemoteUpdate,
        hasLoadedDocument,
        ydocRef
      )
    );

    const onUpdate = (result.current.editor as unknown as MockEditor)._options.onUpdate;
    await onUpdate({ editor: result.current.editor });

    expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", mockUpdate);
    expect(mockUpdateDocument).toHaveBeenCalledWith(mockSocket, "doc-123", mockUpdate);
    expect(mockQueuePendingUpdate).not.toHaveBeenCalled();
  });

  it("saves the document and queues pending update when navigator is offline", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const mockYDoc = { getXmlFragment: jest.fn(() => "fragment") };
    const ydocRef = { current: mockYDoc as unknown as Y.Doc };
    const mockUpdate = new Uint8Array([30, 40]);
    mockEncodeStateAsUpdate.mockReturnValue(mockUpdate);

    setOnLine(false);

    const { result } = renderHook(() =>
      useEditorConfig(
        true,
        "doc-123",
        mockSocket,
        isApplyingRemoteUpdate,
        hasLoadedDocument,
        ydocRef
      )
    );

    const onUpdate = (result.current.editor as unknown as MockEditor)._options.onUpdate;
    await onUpdate({ editor: result.current.editor });

    expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", mockUpdate);
    expect(mockQueuePendingUpdate).toHaveBeenCalledWith("doc-123", mockUpdate);
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });
});
