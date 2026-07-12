import { renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { authService } from "@/features/auth/services/auth";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock("@/features/auth/services/auth", () => ({
  authService: {
    login: jest.fn(),
  },
}));

describe("useLogin", () => {
  const mutateMock = jest.fn();
  const mutateAsyncMock = jest.fn();
  const resetMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
      reset: resetMock,
    });
  });

  it("calls useMutation with authService.login", () => {
    renderHook(() => useLogin());

    expect(useMutation).toHaveBeenCalledWith({
      mutationFn: authService.login,
    });
  });

  it("returns login mutation functions", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.login).toBe(mutateMock);
    expect(result.current.loginAsync).toBe(mutateAsyncMock);
    expect(result.current.reset).toBe(resetMock);
  });

  it("returns mutation state", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("returns pending state", () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
      reset: resetMock,
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.isPending).toBe(true);
  });

  it("returns success state", () => {
    const response = {
      message: "Login successful",
    };

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
      data: response,
      reset: resetMock,
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(response);
  });

  it("returns error state", () => {
    const error = new Error("Invalid credentials");

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      mutateAsync: mutateAsyncMock,
      isPending: false,
      isSuccess: false,
      isError: true,
      error,
      data: null,
      reset: resetMock,
    });

    const { result } = renderHook(() => useLogin());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});