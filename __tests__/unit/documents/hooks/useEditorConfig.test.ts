import { renderHook } from "@testing-library/react";
import useEditorConfig from "@/features/documentEditor/hooks/useEditorConfig";
import { useEditor } from "@tiptap/react";
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

  const mockSocket = { connected: true } as unknown as Socket;
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
    (mockSocket as { connected: boolean }).connected = true;
    mockEncodeStateAsUpdate.mockReturnValue(new Uint8Array([2])); // byteLength > 0 by default
    mockUpdateDocument.mockResolvedValue(undefined);
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

  it("saves to IndexedDB first then sends the delta when socket is connected", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const mockYDoc = { getXmlFragment: jest.fn(() => "fragment") };
    const ydocRef = { current: mockYDoc as unknown as Y.Doc };
    const mockDelta = new Uint8Array([10, 20]);
    const mockFullState = new Uint8Array([10, 20, 30, 40]);

    mockEncodeStateAsUpdate
      .mockReturnValueOnce(mockDelta)
      .mockReturnValueOnce(mockFullState);

    setOnLine(true);
    (mockSocket as { connected: boolean }).connected = true;

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

    expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", mockFullState);
    expect(mockUpdateDocument).toHaveBeenCalledWith(mockSocket, "doc-123", mockDelta);
    expect(mockQueuePendingUpdate).not.toHaveBeenCalled();
  });

  it("saves to IndexedDB and queues the latest write when offline", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const mockYDoc = { getXmlFragment: jest.fn(() => "fragment") };
    const ydocRef = { current: mockYDoc as unknown as Y.Doc };
    const mockDelta = new Uint8Array([30, 40]);
    const mockFullState = new Uint8Array([30, 40, 50]);

    mockEncodeStateAsUpdate
      .mockReturnValueOnce(mockDelta)
      .mockReturnValueOnce(mockFullState);

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

    expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", mockFullState);
    expect(mockQueuePendingUpdate).toHaveBeenCalledWith("doc-123", mockFullState);
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });

  it("queues the latest IndexedDB write when the socket is disconnected", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const mockYDoc = { getXmlFragment: jest.fn(() => "fragment") };
    const ydocRef = { current: mockYDoc as unknown as Y.Doc };
    const mockDelta = new Uint8Array([1, 2]);
    const mockFullState = new Uint8Array([1, 2, 3]);

    mockEncodeStateAsUpdate
      .mockReturnValueOnce(mockDelta)
      .mockReturnValueOnce(mockFullState);

    setOnLine(true);
    (mockSocket as { connected: boolean }).connected = false;

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

    expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", mockFullState);
    expect(mockQueuePendingUpdate).toHaveBeenCalledWith("doc-123", mockFullState);
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });

  it("queues the latest write when the backend update fails", async () => {
    const isApplyingRemoteUpdate = { current: false };
    const hasLoadedDocument = { current: true };
    const mockYDoc = { getXmlFragment: jest.fn(() => "fragment") };
    const ydocRef = { current: mockYDoc as unknown as Y.Doc };
    const mockDelta = new Uint8Array([1, 2]);
    const mockFullState = new Uint8Array([1, 2, 3]);

    mockEncodeStateAsUpdate
      .mockReturnValueOnce(mockDelta)
      .mockReturnValueOnce(mockFullState);
    mockUpdateDocument.mockRejectedValue(new Error("ack failed"));

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

    expect(mockSaveDocument).toHaveBeenCalledWith("doc-123", mockFullState);
    expect(mockQueuePendingUpdate).toHaveBeenCalledWith("doc-123", mockFullState);
  });
});
