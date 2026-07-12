import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/(documents)/layout";

jest.mock("@/components/layout", () => ({
  Header: () => <header data-testid="header">Header</header>,
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe("RootLayout", () => {
  it("renders header, footer and children", () => {
    render(
      <RootLayout>
        <div data-testid="page-content">
          Dashboard Content
        </div>
      </RootLayout>
    );

    expect(
      screen.getByTestId("header")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("footer")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("page-content")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Dashboard Content")
    ).toBeInTheDocument();
  });

  it("renders children inside the main element", () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child">
          Child Component
        </div>
      </RootLayout>
    );

    const main = container.querySelector("main");

    expect(main).toBeInTheDocument();

    expect(
      screen.getByTestId("child")
    ).toBeInTheDocument();

    expect(main).toContainElement(
      screen.getByTestId("child")
    );
  });
});