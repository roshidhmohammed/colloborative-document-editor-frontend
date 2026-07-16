import { renderHook } from "@testing-library/react";
import {
  flushPendingDocumentUpdates,
  useOfflineSync,
} from "@/features/documentEditor/hooks/useDocOfflineSync";
import { documentSocketService } from "@/features/documentEditor/services/documentSocket";
import {
  getDocument,
  getPendingUpdates,
  clearPendingUpdates,
} from "@/features/documentEditor/services/docOfflineStorage";
import type { Socket } from "socket.io-client";

// Mock services
jest.mock("@/features/documentEditor/services/documentSocket", () => ({
  documentSocketService: {
    updateDocument: jest.fn(),
  },
}));

jest.mock("@/features/documentEditor/services/docOfflineStorage", () => ({
  getDocument: jest.fn(),
  getPendingUpdates: jest.fn(),
  clearPendingUpdates: jest.fn(),
}));

describe("useOfflineSync Hook", () => {
  const mockUpdateDocument = documentSocketService.updateDocument as jest.Mock;
  const mockGetDocument = getDocument as jest.Mock;
  const mockGetPendingUpdates = getPendingUpdates as jest.Mock;
  const mockClearPendingUpdates = clearPendingUpdates as jest.Mock;
  const mockSocket = {
    connected: true,
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    connect: jest.fn(),
  } as unknown as Socket;

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
  });

  afterAll(() => {
    setOnLine(originalOnLine);
  });

  it("registers online and socket connect listeners on mount and removes them on unmount", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    expect(addEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1];
    const connectHandler = (mockSocket.on as jest.Mock).mock.calls.find(
      ([event]) => event === "connect"
    )?.[1];

    expect(onlineHandler).toBeDefined();
    expect(connectHandler).toBeDefined();

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("online", onlineHandler);
    expect(mockSocket.off).toHaveBeenCalledWith("connect", connectHandler);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("does not sync or clear if there are no pending updates when the window goes online", async () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    mockGetPendingUpdates.mockResolvedValue([]);

    renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1] as () => Promise<void>;
    expect(onlineHandler).toBeDefined();

    await onlineHandler();

    expect(mockGetPendingUpdates).toHaveBeenCalledWith("doc-123");
    expect(mockUpdateDocument).not.toHaveBeenCalled();
    expect(mockClearPendingUpdates).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it("pushes the latest IndexedDB write to the backend when window goes online", async () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const latestFromIdb = new Uint8Array([9, 9, 9]);
    mockGetPendingUpdates.mockResolvedValue([new Uint8Array([1, 2])]);
    mockGetDocument.mockResolvedValue(latestFromIdb);
    mockUpdateDocument.mockResolvedValue(undefined);
    mockClearPendingUpdates.mockResolvedValue(undefined);

    renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1] as () => Promise<void>;
    expect(onlineHandler).toBeDefined();

    await onlineHandler();

    expect(mockGetDocument).toHaveBeenCalledWith("doc-123");
    expect(mockUpdateDocument).toHaveBeenCalledWith(mockSocket, "doc-123", latestFromIdb);
    expect(mockClearPendingUpdates).toHaveBeenCalledWith("doc-123");

    addEventListenerSpy.mockRestore();
  });

  it("calls onReconnect before flushing the latest IndexedDB write", async () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const onReconnect = jest.fn().mockResolvedValue(undefined);
    const latestFromIdb = new Uint8Array([5]);
    mockGetPendingUpdates.mockResolvedValue([new Uint8Array([1])]);
    mockGetDocument.mockResolvedValue(latestFromIdb);
    mockUpdateDocument.mockResolvedValue(undefined);

    renderHook(() => useOfflineSync(mockSocket, "doc-123", onReconnect));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1] as () => Promise<void>;
    await onlineHandler();

    expect(onReconnect).toHaveBeenCalled();
    expect(mockUpdateDocument).toHaveBeenCalledWith(mockSocket, "doc-123", latestFromIdb);

    addEventListenerSpy.mockRestore();
  });

  it("keeps pending updates when sync fails", async () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    mockGetPendingUpdates.mockResolvedValue([new Uint8Array([1])]);
    mockGetDocument.mockResolvedValue(new Uint8Array([1]));
    mockUpdateDocument.mockRejectedValue(new Error("socket failed"));

    renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1] as () => Promise<void>;
    await onlineHandler();

    expect(mockClearPendingUpdates).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it("does not sync when navigator is offline", async () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    setOnLine(false);

    renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1] as () => Promise<void>;
    await onlineHandler();

    expect(mockGetPendingUpdates).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it("flushPendingDocumentUpdates sends IndexedDB latest then clears pending", async () => {
    const latestFromIdb = new Uint8Array([7, 8]);
    mockGetPendingUpdates.mockResolvedValue([new Uint8Array([1])]);
    mockGetDocument.mockResolvedValue(latestFromIdb);
    mockUpdateDocument.mockResolvedValue(undefined);

    await flushPendingDocumentUpdates(mockSocket, "doc-123");

    expect(mockUpdateDocument).toHaveBeenCalledWith(mockSocket, "doc-123", latestFromIdb);
    expect(mockClearPendingUpdates).toHaveBeenCalledWith("doc-123");
  });
});
