import { unwrap } from "@/features/documentEditor/utils/handleSocketPromise";
import type { SocketResponse } from "@/features/documentEditor/types/documentEditor";

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("unwrap", () => {
  // ── Success branch ──────────────────────────────────────────────────────

  it("calls resolve with response.data when success is true", () => {
    const data = { id: "doc-1", updatedAt: "2024-01-01" };
    const response: SocketResponse<typeof data> = { success: true, data };

    const resolve = jest.fn();
    const reject = jest.fn();

    unwrap(response, resolve, reject);

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith(data);
    expect(reject).not.toHaveBeenCalled();
  });

  it("passes the exact data reference to resolve (no copy)", () => {
    const data = { id: "doc-2" };
    const response: SocketResponse<typeof data> = { success: true, data };

    const resolve = jest.fn();
    const reject = jest.fn();

    unwrap(response, resolve, reject);

    expect(resolve.mock.calls[0][0]).toBe(data);
  });

  it("works when the resolved data is a primitive (string)", () => {
    const response: SocketResponse<string> = { success: true, data: "ok" };

    const resolve = jest.fn();
    const reject = jest.fn();

    unwrap(response, resolve, reject);

    expect(resolve).toHaveBeenCalledWith("ok");
    expect(reject).not.toHaveBeenCalled();
  });

  it("works when the resolved data is a primitive (number)", () => {
    const response: SocketResponse<number> = { success: true, data: 42 };

    const resolve = jest.fn();
    const reject = jest.fn();

    unwrap(response, resolve, reject);

    expect(resolve).toHaveBeenCalledWith(42);
    expect(reject).not.toHaveBeenCalled();
  });

  it("works when the resolved data is a Uint8Array payload", () => {
    const payload = new Uint8Array([1, 2, 3]);
    const response: SocketResponse<Uint8Array> = {
      success: true,
      data: payload,
    };

    const resolve = jest.fn();
    const reject = jest.fn();

    unwrap(response, resolve, reject);

    expect(resolve).toHaveBeenCalledWith(payload);
    expect(reject).not.toHaveBeenCalled();
  });

  // ── Failure branch ──────────────────────────────────────────────────────

  it("calls reject with an Error wrapping response.message when success is false", () => {
    const response: SocketResponse<never> = {
      success: false,
      message: "Document not found",
    };

    const resolve = jest.fn();
    const reject = jest.fn();

    unwrap(response, resolve, reject);

    expect(reject).toHaveBeenCalledTimes(1);
    expect(resolve).not.toHaveBeenCalled();

    const thrownError: Error = reject.mock.calls[0][0];
    expect(thrownError).toBeInstanceOf(Error);
    expect(thrownError.message).toBe("Document not found");
  });

  it("creates a new Error object (not a string) in the failure path", () => {
    const response: SocketResponse<never> = {
      success: false,
      message: "Permission denied",
    };

    const reject = jest.fn();
    unwrap(response, jest.fn(), reject);

    expect(reject.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("includes the full server message in the rejected Error", () => {
    const serverMessage = "Timed out waiting for acknowledgment";
    const response: SocketResponse<never> = {
      success: false,
      message: serverMessage,
    };

    const reject = jest.fn();
    unwrap(response, jest.fn(), reject);

    expect(reject.mock.calls[0][0].message).toBe(serverMessage);
  });

  // ── Early-return guard ──────────────────────────────────────────────────

  it("does not call reject after calling resolve (early return in success branch)", () => {
    // We verify that the success branch uses `return` so reject is unreachable.
    const response: SocketResponse<string> = { success: true, data: "hello" };

    const resolve = jest.fn();
    const reject = jest.fn();

    unwrap(response, resolve, reject);

    // Only one call to resolve, zero calls to reject.
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(reject).toHaveBeenCalledTimes(0);
  });

  // ── Integration: use inside a real Promise ──────────────────────────────

  it("integrates correctly as a Promise resolver (success)", async () => {
    const expectedData = { id: "doc-99", updatedAt: "2025-06-01" };
    const response: SocketResponse<typeof expectedData> = {
      success: true,
      data: expectedData,
    };

    const value = await new Promise((resolve, reject) =>
      unwrap(response, resolve, reject)
    );

    expect(value).toEqual(expectedData);
  });

  it("integrates correctly as a Promise rejector (failure)", async () => {
    const response: SocketResponse<never> = {
      success: false,
      message: "Socket error",
    };

    await expect(
      new Promise((resolve, reject) => unwrap(response, resolve, reject))
    ).rejects.toThrow("Socket error");
  });
});
