import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { useRouter } from "next/navigation";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { AppToast } from "@/lib/toast";
import { ROUTES } from "@/constants/apiRoutes";
import { fillForm } from "../test-utils/fillForm";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/auth/hooks/useRegister", () => {
  const actual = jest.requireActual("@/features/auth/hooks/useRegister");

  return {
    ...actual,
    useRegister: jest.fn(),
  };
});

jest.mock("@/lib/toast", () => ({
  AppToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("RegisterForm", () => {
  const replaceMock = jest.fn();
  const registerAsyncMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: replaceMock,
    });

    (useRegister as jest.Mock).mockReturnValue({
      registerAsync: registerAsyncMock,
      isPending: false,
    });
  });

  it("renders all registration fields and submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input#password' })).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i, { selector: 'input#confirmPassword' })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("submits valid registration successfully and redirects to login", async () => {
    registerAsyncMock.mockResolvedValue({
      message: "Registration successful",
    });

    render(<RegisterForm />);

    const user = userEvent.setup();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(registerAsyncMock).toHaveBeenCalledWith({
        fullName: "Roshidh S",
        email: "roshidh@gmail.com",
        password: "Password@123",
        confirmPassword: "Password@123",
      });
    });

    expect(AppToast.success).toHaveBeenCalledWith({
      title: "Registration successful",
      description: "You have successfully registered.",
    });
    expect(replaceMock).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it("shows API error when registration fails", async () => {
    registerAsyncMock.mockRejectedValue(new Error("Registration failed"));

    render(<RegisterForm />);

    const user = userEvent.setup();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(AppToast.error).toHaveBeenCalledWith({
        title: "Registration failed",
        description: "An error occurred during registration.",
      });
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("does not submit with empty fields", async () => {
    render(<RegisterForm />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must contain at least 8 characters/i)).toBeInTheDocument();
    expect(registerAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email format", async () => {
    render(<RegisterForm />);

    const user = userEvent.setup();
    await fillForm(user, { email: "invalid-email" });
    await user.click(screen.getByRole("button", { name: /register/i }));

    // screen.debug();
    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(registerAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error for weak password", async () => {
    render(<RegisterForm />);

    const user = userEvent.setup();
    await fillForm(user, { password: "weakpass", confirmPassword: "weakpass" });
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/one uppercase letter required/i)).toBeInTheDocument();
    expect(registerAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    render(<RegisterForm />);

    const user = userEvent.setup();
    await fillForm(user, { fullName: "John Doe", email: "john@example.com", confirmPassword: "Password@124" });
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(registerAsyncMock).not.toHaveBeenCalled();
  });

  it("disables submit button while request is pending", () => {
    (useRegister as jest.Mock).mockReturnValue({
      registerAsync: registerAsyncMock,
      isPending: true,
    });

    render(<RegisterForm />);

    expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
  });
});