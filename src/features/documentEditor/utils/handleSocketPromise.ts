import { SocketResponse } from "../types/documentEditor";

export function unwrap<T>(response: SocketResponse<T>, resolve: (value: T) => void, reject: (reason: Error) => void) {
  if (response.success) {
    resolve(response.data);
    return;
  }
  reject(new Error(response.message));
}