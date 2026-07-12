import { toUint8Array } from "@/features/documentEditor/utils/contentConversion";

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("toUint8Array", () => {
  // ── Uint8Array passthrough ──────────────────────────────────────────────

  it("returns the same Uint8Array instance when the input is already a Uint8Array", () => {
    const input = new Uint8Array([1, 2, 3]);

    const result = toUint8Array(input);

    expect(result).toBe(input); // strict identity — no copy made
  });

  it("preserves the byte values when passing through a Uint8Array", () => {
    const bytes = [10, 20, 30, 40, 255];
    const input = new Uint8Array(bytes);

    const result = toUint8Array(input);

    expect(Array.from(result)).toEqual(bytes);
  });

  it("handles an empty Uint8Array passthrough", () => {
    const input = new Uint8Array(0);

    const result = toUint8Array(input);

    expect(result).toBe(input);
    expect(result.byteLength).toBe(0);
  });

  // ── ArrayBuffer conversion ──────────────────────────────────────────────

  it("converts an ArrayBuffer to a Uint8Array with the same bytes", () => {
    const buffer = new Uint8Array([5, 10, 15]).buffer; // underlying ArrayBuffer

    const result = toUint8Array(buffer);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([5, 10, 15]);
  });

  it("returns a new Uint8Array instance (not the same reference) for an ArrayBuffer input", () => {
    const buffer = new Uint8Array([1, 2]).buffer;

    const result = toUint8Array(buffer);

    expect(result).not.toBe(buffer);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it("converts an empty ArrayBuffer to an empty Uint8Array", () => {
    const buffer = new ArrayBuffer(0);

    const result = toUint8Array(buffer);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.byteLength).toBe(0);
  });

  it("correctly converts a larger ArrayBuffer", () => {
    const source = new Uint8Array([0, 127, 128, 255]);
    const buffer = source.buffer;

    const result = toUint8Array(buffer);

    expect(Array.from(result)).toEqual([0, 127, 128, 255]);
  });

  // ── number[] conversion ─────────────────────────────────────────────────

  it("converts a number array to a Uint8Array with the same byte values", () => {
    const input: number[] = [50, 100, 150, 200];

    const result = toUint8Array(input);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual(input);
  });

  it("returns a new Uint8Array instance for a number-array input", () => {
    const input: number[] = [1, 2, 3];

    const result = toUint8Array(input);

    expect(result).not.toBe(input);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it("converts an empty number array to an empty Uint8Array", () => {
    const result = toUint8Array([]);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.byteLength).toBe(0);
  });

  it("clamps values to [0, 255] for the number-array path (Uint8Array semantic)", () => {
    // Uint8Array truncates values > 255 to their lower 8 bits
    const result = toUint8Array([0, 255, 256]);

    expect(result[0]).toBe(0);
    expect(result[1]).toBe(255);
    expect(result[2]).toBe(0); // 256 % 256 === 0
  });
});
