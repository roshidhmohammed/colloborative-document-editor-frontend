import { render, screen } from "@testing-library/react";
import CreateDocumentCard from "@/features/documents/components/CreateDocumentCard";

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

describe("CreateDocumentCard", () => {
  it("renders the create document heading", () => {
    render(<CreateDocumentCard />);

    expect(
      screen.getByText(/create new document/i)
    ).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<CreateDocumentCard />);

    expect(
      screen.getByText(
        /start a fresh document with a topic and invite collaborators instantly/i
      )
    ).toBeInTheDocument();
  });

  it("renders a link", () => {
    render(<CreateDocumentCard />);

    expect(
      screen.getByRole("link")
    ).toBeInTheDocument();
  });

  it("links to the create document page", () => {
    render(<CreateDocumentCard />);

    expect(
      screen.getByRole("link")
    ).toHaveAttribute(
      "href",
      "/create-document"
    );
  });

  it("has an accessible link name", () => {
    render(<CreateDocumentCard />);

    expect(
      screen.getByRole("link", {
        name: /create new document/i,
      })
    ).toBeInTheDocument();
  });
});