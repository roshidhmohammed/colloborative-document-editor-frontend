import { DocumentUpdate } from "../types/documentEditor";

export function toUint8Array(update: DocumentUpdate | ArrayBuffer | number[]): DocumentUpdate {
  if (update instanceof Uint8Array) return update;
  if (update instanceof ArrayBuffer) return new Uint8Array(update);

  return new Uint8Array(update);
}