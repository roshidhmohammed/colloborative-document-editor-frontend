import { renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";

import { useRegister } from "@/features/auth/hooks/useRegister";
import { authService } from "@/features/auth/services/auth";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock("@/features/auth/services/auth", () => ({
  authService: {
    register: jest.fn(),
  },
}));

describe("useRegister", () => {
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

  it("calls useMutation with authService.register", () => {
    renderHook(() => useRegister());

    expect(useMutation).toHaveBeenCalledWith({
      mutationFn: authService.register,
    });
  });

  it("returns register mutation functions", () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.register).toBe(mutateMock);
    expect(result.current.registerAsync).toBe(mutateAsyncMock);
    expect(result.current.reset).toBe(resetMock);
  });

  it("returns default mutation state", () => {
    const { result } = renderHook(() => useRegister());

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

    const { result } = renderHook(() => useRegister());

    expect(result.current.isPending).toBe(true);
  });

  it("returns success state and data", () => {
    const response = {
      message: "Registration successful",
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

    const { result } = renderHook(() => useRegister());

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(response);
  });

  it("returns error state", () => {
    const error = new Error("Registration failed");

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

    const { result } = renderHook(() => useRegister());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });

  it("returns reset function", () => {
    const { result } = renderHook(() => useRegister());

    result.current.reset();

    expect(resetMock).toHaveBeenCalledTimes(1);
  });
});