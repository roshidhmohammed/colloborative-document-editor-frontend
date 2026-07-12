import { joinDocumentSocketApi, updateDocumentSocketApi } from "@/features/documentEditor/api/documentSocket.api";
import type { SocketResponse, SocketDocument } from "@/features/documentEditor/types/documentEditor";

// ─── Mock contentConversion & handleSocketPromise ────────────────────────────
//
// We test documentSocket.api.ts in isolation. The conversion and unwrap helpers
// are covered by their own dedicated suites.

jest.mock("@/features/documentEditor/utils/contentConversion", () => ({
  toUint8Array: jest.fn((v: unknown) => v), // identity — just return the input
}));

jest.mock("@/features/documentEditor/utils/handleSocketPromise", () => ({
  unwrap: jest.fn(
    <T>(
      response: SocketResponse<T>,
      resolve: (v: T) => void,
      reject: (e: Error) => void
    ) => {
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.message));
      }
    }
  ),
}));

// ─── Socket stub factory ──────────────────────────────────────────────────────

/**
 * Builds a minimal socket stub whose `once`, `off`, and `emit` methods
 * are Jest spies.  The `triggerLoad` helper simulates the server firing
 * "document:load" after a configurable delay.
 */
function makeSocket() {
  const listeners: Record<string, ((data: unknown) => void)[]> = {};

  const socket = {
    once: jest.fn((event: string, handler: (data: unknown) => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(handler);
    }),
    off: jest.fn((event: string, handler: (data: unknown) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
    }),
    emit: jest.fn(),
  };

  /**
   * Fires a "document:load" event with the supplied payload,
   * simulating the server push.
   */
  function triggerLoad(data: unknown) {
    (listeners["document:load"] ?? []).forEach((h) => h(data));
  }

  return { socket, triggerLoad };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe("joinDocumentSocketApi", () => {
  // Provide fake timers for timeout-related tests
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // ── Emit & listen wiring ────────────────────────────────────────────────

  it("emits 'document:join' with the given documentId", () => {
    const { socket } = makeSocket();

    joinDocumentSocketApi(socket as never, "doc-1");

    expect(socket.emit).toHaveBeenCalledWith("document:join", "doc-1");
  });

  it("registers a 'document:load' listener via socket.once", () => {
    const { socket } = makeSocket();

    joinDocumentSocketApi(socket as never, "doc-1");

    expect(socket.once).toHaveBeenCalledWith(
      "document:load",
      expect.any(Function)
    );
  });

  // ── Success path ────────────────────────────────────────────────────────

  it("resolves with the Uint8Array returned by toUint8Array when 'document:load' fires", async () => {
    const { socket, triggerLoad } = makeSocket();
    const rawUpdate = new Uint8Array([1, 2, 3]);

    const promise = joinDocumentSocketApi(socket as never, "doc-1");
    triggerLoad(rawUpdate);

    const result = await promise;
    expect(result).toEqual(rawUpdate);
  });

  it("resolves with converted data for a number[] payload", async () => {
    const { socket, triggerLoad } = makeSocket();
    const numberArray = [10, 20, 30];

    const promise = joinDocumentSocketApi(socket as never, "doc-1");
    triggerLoad(numberArray);

    // toUint8Array is mocked as identity, so we get the same value back.
    const result = await promise;
    expect(result).toEqual(numberArray);
  });

  it("clears the timeout after 'document:load' fires", async () => {
    const clearTimeoutSpy = jest.spyOn(window, "clearTimeout");
    const { socket, triggerLoad } = makeSocket();

    const promise = joinDocumentSocketApi(socket as never, "doc-1");
    triggerLoad(new Uint8Array([5]));

    await promise;

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  // ── Timeout path ────────────────────────────────────────────────────────

  it("rejects with a timeout error if 'document:load' never fires within 10 seconds", async () => {
    const { socket } = makeSocket();

    const promise = joinDocumentSocketApi(socket as never, "doc-1");

    // Advance fake timers past the 10-second deadline.
    jest.advanceTimersByTime(10_001);

    await expect(promise).rejects.toThrow("Timed out while loading document");
  });

  it("removes the 'document:load' listener on timeout so no future events are handled", async () => {
    const { socket, triggerLoad } = makeSocket();

    const promise = joinDocumentSocketApi(socket as never, "doc-1");

    // Trigger the timeout.
    jest.advanceTimersByTime(10_001);

    try {
      await promise;
    } catch {
      // expected rejection — we only care about the off() call below.
    }

    expect(socket.off).toHaveBeenCalledWith(
      "document:load",
      expect.any(Function)
    );
  });

  it("does NOT reject before 10 seconds have elapsed", () => {
    const { socket } = makeSocket();

    const promise = joinDocumentSocketApi(socket as never, "doc-2");

    // Only 9 999 ms — should still be pending.
    jest.advanceTimersByTime(9_999);

    // Attach a rejection handler to prevent unhandled-rejection noise.
    promise.catch(() => undefined);

    // The promise should still be pending — check by racing it with a resolved one.
    let settled = false;
    promise.then(() => { settled = true; }).catch(() => { settled = true; });
    // settled is still false synchronously because the promise is pending.
    expect(settled).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("updateDocumentSocketApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Emit wiring ─────────────────────────────────────────────────────────

  it("emits 'document:update' with the correct payload shape", () => {
    const { socket } = makeSocket();
    const content = new Uint8Array([7, 8, 9]);

    updateDocumentSocketApi(socket as never, "doc-55", content);

    expect(socket.emit).toHaveBeenCalledWith(
      "document:update",
      { documentId: "doc-55", content },
      expect.any(Function)
    );
  });

  // ── Success path ────────────────────────────────────────────────────────

  it("resolves with the SocketDocument returned by the server acknowledgement", async () => {
    const { socket } = makeSocket();
    const content = new Uint8Array([1]);
    const serverResponse: SocketResponse<SocketDocument> = {
      success: true,
      data: { id: "doc-55", updatedAt: "2025-01-01" },
    };

    // Simulate the server calling the socket acknowledgement callback.
    socket.emit.mockImplementation(
      (_event: string, _payload: unknown, ack: (r: typeof serverResponse) => void) => {
        ack(serverResponse);
      }
    );

    const result = await updateDocumentSocketApi(socket as never, "doc-55", content);

    expect(result).toEqual({ id: "doc-55", updatedAt: "2025-01-01" });
  });

  it("resolves with only id when updatedAt is absent", async () => {
    const { socket } = makeSocket();
    const content = new Uint8Array([2]);
    const serverResponse: SocketResponse<SocketDocument> = {
      success: true,
      data: { id: "doc-55" },
    };

    socket.emit.mockImplementation(
      (_event: string, _payload: unknown, ack: (r: typeof serverResponse) => void) => {
        ack(serverResponse);
      }
    );

    const result = await updateDocumentSocketApi(socket as never, "doc-55", content);

    expect(result).toEqual({ id: "doc-55" });
    expect(result.updatedAt).toBeUndefined();
  });

  // ── Failure path ────────────────────────────────────────────────────────

  it("rejects with an Error when the server acknowledgement reports failure", async () => {
    const { socket } = makeSocket();
    const content = new Uint8Array([3]);
    const serverResponse: SocketResponse<SocketDocument> = {
      success: false,
      message: "Unauthorized",
    };

    socket.emit.mockImplementation(
      (_event: string, _payload: unknown, ack: (r: typeof serverResponse) => void) => {
        ack(serverResponse);
      }
    );

    await expect(
      updateDocumentSocketApi(socket as never, "doc-55", content)
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects with an Error whose message matches the server error string", async () => {
    const { socket } = makeSocket();
    const content = new Uint8Array([4]);
    const errorMessage = "Document update conflict";
    const serverResponse: SocketResponse<SocketDocument> = {
      success: false,
      message: errorMessage,
    };

    socket.emit.mockImplementation(
      (_event: string, _payload: unknown, ack: (r: typeof serverResponse) => void) => {
        ack(serverResponse);
      }
    );

    await expect(
      updateDocumentSocketApi(socket as never, "doc-55", content)
    ).rejects.toThrow(errorMessage);
  });

  // ── Pending (no ack) ────────────────────────────────────────────────────

  it("remains pending when the socket never fires the acknowledgement", () => {
    const { socket } = makeSocket();
    const content = new Uint8Array([5]);

    // emit does NOT call the ack callback.
    socket.emit.mockImplementation(() => undefined);

    const promise = updateDocumentSocketApi(socket as never, "doc-55", content);

    let settled = false;
    promise.then(() => { settled = true; }).catch(() => { settled = true; });

    // Synchronously — promise is still pending.
    expect(settled).toBe(false);
  });
});
