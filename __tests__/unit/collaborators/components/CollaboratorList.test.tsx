import { render, screen } from "@testing-library/react";

import CollaboratorList from "@/features/collaborators/components/CollaboratorList";
import { useFetchCollaborators } from "@/features/collaborators/hooks/useFetchCollaborators";

jest.mock(
    "@/features/collaborators/hooks/useFetchCollaborators",
    () => ({
        useFetchCollaborators: jest.fn(),
    })
);

describe("CollaboratorList", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders collaborator container heading", () => {
        (useFetchCollaborators as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });

        render(
            <CollaboratorList documentId="123" />
        );

        expect(
            screen.getByText("Collaborators")
        ).toBeInTheDocument();
    });

    it("shows loading state", () => {
        (useFetchCollaborators as jest.Mock).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
        });

        render(
            <CollaboratorList documentId="123" />
        );

        expect(
            screen.getByText(
                /Loading collaborators/i
            )
        ).toBeInTheDocument();
    });

    it("shows error state", () => {
        (useFetchCollaborators as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
        });

        render(
            <CollaboratorList documentId="123" />
        );

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent(
            "We couldn't load the collaborators."
        );
    });

    it("shows empty state", () => {
        (useFetchCollaborators as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });

        render(
            <CollaboratorList documentId="123" />
        );

        expect(
            screen.getByText(
                /No collaborators yet/i
            )
        ).toBeInTheDocument();
    });

    it("renders collaborators", () => {
        (useFetchCollaborators as jest.Mock).mockReturnValue({
            data: [
                {
                    id: "1",
                    status: "online",
                    user: {
                        id: "10",
                        fullName: "Roshidh S",
                    },
                },
                {
                    id: "2",
                    status: "offline",
                    user: {
                        id: "11",
                        fullName: "Rahul R",
                    },
                },
            ],
            isLoading: false,
            isError: false,
        });

        render(
            <CollaboratorList documentId="123" />
        );

        expect(
            screen.getByText("Roshidh S")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Rahul R")
        ).toBeInTheDocument();
    });

    it("shows fallback name when fullName is missing", () => {
        (useFetchCollaborators as jest.Mock).mockReturnValue({
            data: [
                {
                    id: "1",
                    status: "online",
                    user: {
                        id: "10",
                        fullName: null,
                    },
                },
            ],
            isLoading: false,
            isError: false,
        });

        render(
            <CollaboratorList documentId="123" />
        );

        expect(
            screen.getByText("Not found the name")
        ).toBeInTheDocument();
    });

    it("calls useFetchCollaborators with documentId", () => {
        (useFetchCollaborators as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });

        render(
            <CollaboratorList documentId="document-123" />
        );

        expect(
            useFetchCollaborators
        ).toHaveBeenCalledWith(
            "document-123"
        );
    });
});