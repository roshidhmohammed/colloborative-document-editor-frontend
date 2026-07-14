import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/features/auth/components/LoginForm";
import { useRouter } from "next/navigation";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { AppToast } from "@/lib/toast";
import { getSafePostLoginRedirect } from "@/lib/auth";
import { fillForm } from "../test-utils/fillForm";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/auth/hooks/useLogin", () => {
  const actual = jest.requireActual("@/features/auth/hooks/useLogin");

  return {
    ...actual,
    useLogin: jest.fn(),
  };
});

jest.mock("@/lib/toast", () => ({
  AppToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  getSafePostLoginRedirect: jest.fn(),
}));

describe("LoginForm", () => {
  const replaceMock = jest.fn();
  const loginAsyncMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: replaceMock,
    });

    (useLogin as jest.Mock).mockReturnValue({
      loginAsync: loginAsyncMock,
      isPending: false,
    });

    (getSafePostLoginRedirect as jest.Mock).mockReturnValue("/documents");
  });

  it("renders email, password and login button", () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText("john@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("submits valid form successfully and redirects to safe path", async () => {
    loginAsyncMock.mockResolvedValue({
      message: "Login successful",
    });

    render(<LoginForm returnTo="/documents" />);

    const user = userEvent.setup()

    await fillForm(user, { form: "login" });
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(loginAsyncMock).toHaveBeenCalledWith({
        email: "roshidh@gmail.com",
        password: "Password@123",
      });
    });

    expect(AppToast.success).toHaveBeenCalledWith({
      title: "Login successful",
      description: "You have successfully logged in.",
    });
    expect(getSafePostLoginRedirect).toHaveBeenCalledWith("/documents");
    expect(replaceMock).toHaveBeenCalledWith("/documents");
  });

  it("shows API error message when login fails with server response", async () => {
    loginAsyncMock.mockRejectedValue({
      response: {
        data: {
          message: "Invalid credentials",
        },
      },
    });

    render(<LoginForm />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("john@example.com"), "roshidh@gmail.com");
    await user.type(screen.getByLabelText(/password/i), "Password@123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(AppToast.error).toHaveBeenCalledWith({
        title: "Login failed",
        description: "Invalid credentials",
      });
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows error message when login fails without response data", async () => {
    loginAsyncMock.mockRejectedValue(new Error("Network failure"));

    render(<LoginForm />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("john@example.com"), "roshidh@gmail.com");
    await user.type(screen.getByLabelText(/password/i), "Password@123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(AppToast.error).toHaveBeenCalledWith({
        title: "Login failed",
        description: "Network failure",
      });
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("does not submit when the form is empty", async () => {
    render(<LoginForm />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must contain at least 8 characters/i)).toBeInTheDocument();
    expect(loginAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email format", async () => {
    render(<LoginForm />);

    const user = userEvent.setup();
    await fillForm(user, { form: "login", email: "invalid-email" });
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    expect(loginAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error when password is too short", async () => {
    render(<LoginForm />);

    const user = userEvent.setup();
    await fillForm(user, { form: "login", email: "john@example.com", password: "short" });
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least 8 characters/i)).toBeInTheDocument();
    });

    expect(loginAsyncMock).not.toHaveBeenCalled();
  });
  

  it("disables submit button while request is pending", () => {
    (useLogin as jest.Mock).mockReturnValue({
      loginAsync: loginAsyncMock,
      isPending: true,
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /loading/i });
    expect(submitButton).toBeDisabled();
  });
});