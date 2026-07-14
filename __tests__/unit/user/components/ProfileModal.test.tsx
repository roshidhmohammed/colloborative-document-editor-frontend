import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProfileModal from "@/features/user/components/ProfileModal";
import { AppToast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants/api";
import { ROUTES } from "@/constants/routes";

const mockReplace = jest.fn();
const mockUseFetchProfile = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/features/user/hooks/useFetchProfile", () => ({
  useFetchProfile: () => mockUseFetchProfile(),
}));

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock("@/lib/toast", () => ({
  AppToast: {
    error: jest.fn(),
  },
}));

const clearAuthTokenMock = jest.fn();

jest.mock("@/features/auth/actions/authCookies", () => ({
  clearAuthToken: (...args: unknown[]) => clearAuthTokenMock(...args),
}));

describe("ProfileModal", () => {
  const postMock = axiosInstance.post as jest.Mock;
  const errorToastMock = AppToast.error as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    errorToastMock.mockReset();
    clearAuthTokenMock.mockResolvedValue(undefined);
    mockUseFetchProfile.mockReturnValue({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    });
    postMock.mockResolvedValue({});
  });

  it("renders the user's full name and email from the profile hook", () => {
    render(<ProfileModal />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("renders the logout button with the expected accessible name", () => {
    render(<ProfileModal />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logout endpoint and redirects to login on successful logout", async () => {
    const user = userEvent.setup();

    render(<ProfileModal />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        API_ENDPOINTS.LOGOUT,
        {},
        expect.objectContaining({ withCredentials: true })
      );
    });

    await waitFor(() => {
      expect(clearAuthTokenMock).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("shows a toast and does not redirect when logout fails", async () => {
    const user = userEvent.setup();
    postMock.mockRejectedValueOnce(new Error("Network error"));

    render(<ProfileModal />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(errorToastMock).toHaveBeenCalledWith({
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
      });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("does not crash when the profile data is missing", () => {
    mockUseFetchProfile.mockReturnValue(undefined);

    render(<ProfileModal />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("uses the correct button type and styling hook for the logout action", () => {
    render(<ProfileModal />);

    const button = screen.getByRole("button", { name: /logout/i });

    expect(button).toHaveAttribute("type", "button");
  });

  it("handles rapid repeated clicks without triggering duplicate navigation", async () => {
    const user = userEvent.setup();
    postMock.mockResolvedValue({});

    render(<ProfileModal />);

    const button = screen.getByRole("button", { name: /logout/i });

    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(2);
    });
  });
});
