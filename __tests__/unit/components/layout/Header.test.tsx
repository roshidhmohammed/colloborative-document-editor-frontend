import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/layout/Header";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/features/user/components/ProfileModal", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="profile-modal">
      Profile Modal
    </div>
  ),
}));

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the application title", () => {
    render(<Header />);

    expect(
      screen.getByText("Collab Doc Creator")
    ).toBeInTheDocument();
  });

  it("renders the documents link", () => {
    render(<Header />);

    const link = screen.getByRole("link", {
      name: /collab doc creator/i,
    });

    expect(link).toHaveAttribute(
      "href",
      "/documents"
    );
  });

  it("renders the profile menu button", () => {
    render(<Header />);

    expect(
      screen.getByRole("button", {
        name: /open profile menu/i,
      })
    ).toBeInTheDocument();
  });

  it("opens the profile modal when button is clicked", () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /open profile menu/i,
      })
    );

    expect(
      screen.getByTestId("profile-modal")
    ).toBeInTheDocument();
  });

  it("closes the profile modal when button is clicked twice", () => {
    render(<Header />);

    const button = screen.getByRole("button", {
      name: /open profile menu/i,
    });

    fireEvent.click(button);

    expect(
      screen.getByTestId("profile-modal")
    ).toBeInTheDocument();

    fireEvent.click(button);

    expect(
      screen.queryByTestId("profile-modal")
    ).not.toBeInTheDocument();
  });

  it("closes the profile modal when clicking outside", () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /open profile menu/i,
      })
    );

    expect(
      screen.getByTestId("profile-modal")
    ).toBeInTheDocument();

    fireEvent.mouseDown(document);

    expect(
      screen.queryByTestId("profile-modal")
    ).not.toBeInTheDocument();
  });

  it("does not render profile modal initially", () => {
    render(<Header />);

    expect(
      screen.queryByTestId("profile-modal")
    ).not.toBeInTheDocument();
  });

  it("adds and removes the mousedown event listener", () => {
    const addSpy = jest.spyOn(
      document,
      "addEventListener"
    );

    const removeSpy = jest.spyOn(
      document,
      "removeEventListener"
    );

    const { unmount } = render(<Header />);

    expect(addSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});