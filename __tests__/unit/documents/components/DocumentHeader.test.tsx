import { render, screen } from "@testing-library/react";

import DocumentsHeader from "@/features/documents/components/DocumentsHeader";

describe("DocumentsHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the workspace label", () => {
    render(<DocumentsHeader />);

    expect(
      screen.getByText(/workspace/i)
    ).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<DocumentsHeader />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /your documents/i,
      })
    ).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<DocumentsHeader />);

    expect(
      screen.getByText(
        /jump back into work or start a fresh collaborative document in seconds/i
      )
    ).toBeInTheDocument();
  });

  it("renders only one h1 heading", () => {
    render(<DocumentsHeader />);

    const headings = screen.getAllByRole("heading", {
      level: 1,
    });

    expect(headings).toHaveLength(1);
  });

  it("renders all expected text content", () => {
    render(<DocumentsHeader />);

    expect(screen.getByText("Workspace")).toBeInTheDocument();

    expect(screen.getByText("Your documents")).toBeInTheDocument();

    expect(
      screen.getByText(
        /Jump back into work or start a fresh collaborative document in seconds\./i
      )
    ).toBeInTheDocument();
  });
});