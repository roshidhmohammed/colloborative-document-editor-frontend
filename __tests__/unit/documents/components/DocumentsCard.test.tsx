import { render, screen } from "@testing-library/react";

import DocumentCard from "@/features/documents/components/DocumentCard";

describe("DocumentCard", () => {
  it("renders the document name", () => {
    render(
      <DocumentCard
        document={{
          id: "1",
          name: "Project Proposal",
          collaborators: [],
        }}
      />
    );

    expect(
      screen.getByText("Project Proposal")
    ).toBeInTheDocument();
  });

  it("shows collaborator count when collaborators is an array", () => {
    render(
      <DocumentCard
        document={{
          id: "1",
          name: "Project Proposal",
          collaborators: [
            { id: "1" },
            { id: "2" },
            { id: "3" },
          ],
        }}
      />
    );

    expect(
      screen.getByText("3 collab")
    ).toBeInTheDocument();
  });

  it("shows collaborator count when collaborators is a number", () => {
    render(
      <DocumentCard
        document={{
          id: "1",
          name: "Project Proposal",
          collaborators: 5,
        }}
      />
    );

    expect(
      screen.getByText("5 collab")
    ).toBeInTheDocument();
  });

  it("shows zero collaborators when collaborators is an empty array", () => {
    render(
      <DocumentCard
        document={{
          id: "1",
          name: "Project Proposal",
          collaborators: [],
        }}
      />
    );

    expect(
      screen.getByText("0 collab")
    ).toBeInTheDocument();
  });

  it("shows zero collaborators when collaborators is undefined", () => {
    render(
      <DocumentCard
        document={{
          id: "1",
          name: "Project Proposal",
        }}
      />
    );

    expect(
      screen.getByText("0 collab")
    ).toBeInTheDocument();
  });

  it("renders an article element", () => {
    const { container } = render(
      <DocumentCard
        document={{
          id: "1",
          name: "Project Proposal",
          collaborators: [],
        }}
      />
    );

    expect(
      container.querySelector("article")
    ).toBeInTheDocument();
  });
});