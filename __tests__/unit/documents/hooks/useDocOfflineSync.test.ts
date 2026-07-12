import { renderHook } from "@testing-library/react";
import { useOfflineSync } from "@/features/documentEditor/hooks/useDocOfflineSync";
import { documentSocketService } from "@/features/documentEditor/services/documentSocket";
import { getPendingUpdates, clearPendingUpdates } from "@/features/documentEditor/services/docOfflineStorage";
import type { Socket } from "socket.io-client";

// Mock services
jest.mock("@/features/documentEditor/services/documentSocket", () => ({
  documentSocketService: {
    updateDocument: jest.fn(),
  },
}));

jest.mock("@/features/documentEditor/services/docOfflineStorage", () => ({
  getPendingUpdates: jest.fn(),
  clearPendingUpdates: jest.fn(),
}));

describe("useOfflineSync Hook", () => {
  const mockUpdateDocument = documentSocketService.updateDocument as jest.Mock;
  const mockGetPendingUpdates = getPendingUpdates as jest.Mock;
  const mockClearPendingUpdates = clearPendingUpdates as jest.Mock;
  const mockSocket = {} as unknown as Socket;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers the online event listener on mount and removes it on unmount", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    expect(addEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1];
    expect(onlineHandler).toBeDefined();

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("online", onlineHandler);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("does not sync or clear if there are no pending updates when the window goes online", async () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    mockGetPendingUpdates.mockResolvedValue([]);

    renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1] as () => Promise<void>;
    expect(onlineHandler).toBeDefined();

    // Trigger the online event handler
    await onlineHandler();

    expect(mockGetPendingUpdates).toHaveBeenCalledWith("doc-123");
    expect(mockUpdateDocument).not.toHaveBeenCalled();
    expect(mockClearPendingUpdates).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it("pushes all pending updates to socket and clears storage when window goes online", async () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const mockUpdates = [new Uint8Array([1, 2]), new Uint8Array([3, 4])];
    mockGetPendingUpdates.mockResolvedValue(mockUpdates);
    mockUpdateDocument.mockResolvedValue(undefined);
    mockClearPendingUpdates.mockResolvedValue(undefined);

    renderHook(() => useOfflineSync(mockSocket, "doc-123"));

    const onlineHandler = addEventListenerSpy.mock.calls.find(([event]) => event === "online")?.[1] as () => Promise<void>;
    expect(onlineHandler).toBeDefined();

    // Trigger the online event handler
    await onlineHandler();

    expect(mockGetPendingUpdates).toHaveBeenCalledWith("doc-123");
    expect(mockUpdateDocument).toHaveBeenCalledTimes(2);
    expect(mockUpdateDocument).toHaveBeenNthCalledWith(1, mockSocket, "doc-123", mockUpdates[0]);
    expect(mockUpdateDocument).toHaveBeenNthCalledWith(2, mockSocket, "doc-123", mockUpdates[1]);
    expect(mockClearPendingUpdates).toHaveBeenCalledWith("doc-123");

    addEventListenerSpy.mockRestore();
  });
});
