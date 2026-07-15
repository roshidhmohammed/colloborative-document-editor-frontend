import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateDocument from "@/features/documents/components/CreateDocument";
import { useRouter } from "next/navigation";
import { useCreateDocument } from "@/features/documents/hooks/useCreateDocument";
import { AppToast } from "@/lib/toast";
import { PAGEROUTES } from "@/constants/apiRoutes";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/documents/hooks/useCreateDocument", () => ({
  useCreateDocument: jest.fn(),
}));

jest.mock("@/lib/toast", () => ({
  AppToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("CreateDocument", () => {
  const replaceMock = jest.fn();
  const createDocumentAsyncMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: replaceMock,
    });

    (useCreateDocument as jest.Mock).mockReturnValue({
      createDocumentAsync: createDocumentAsyncMock,
      isPending: false,
    });
  });

  it("renders the document creation form and supporting copy", () => {
    render(<CreateDocument />);

    expect(screen.getByText(/new document/i)).toBeInTheDocument();
    expect(screen.getByText(/create your next idea/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. product launch plan/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("submits a valid topic, shows success feedback, and navigates to the new document", async () => {
    createDocumentAsyncMock.mockResolvedValue({
      message: "Document created successfully",
      data: {
        document: { id: "123" },
        ownerToken: "o112df23343222dxd",
      },
    });

    render(<CreateDocument />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. product launch plan/i), "AI-powered marketing strategy");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(createDocumentAsyncMock).toHaveBeenCalledWith({ topic: "AI-powered marketing strategy" });
    });

    expect(AppToast.success).toHaveBeenCalledWith({
      title: "Document created successfully",
      description: "You have successfully logged in.",
    });
    expect(replaceMock).toHaveBeenCalledWith(`${PAGEROUTES.DOCUMENTS}/123/o112df23343222dxd`);
  });

  it("blocks submission when the topic is empty or only whitespace", async () => {
    render(<CreateDocument />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. product launch plan/i), "   ");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(await screen.findByText(/please enter a topic/i)).toBeInTheDocument();
    expect(createDocumentAsyncMock).not.toHaveBeenCalled();
  });

  it("shows a validation message when the topic is too short", async () => {
    render(<CreateDocument />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. product launch plan/i), "ab");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(await screen.findByText(/topic must be at least 3 characters/i)).toBeInTheDocument();
    expect(createDocumentAsyncMock).not.toHaveBeenCalled();
  });

  it("shows an error toast and does not navigate when document creation fails", async () => {
    createDocumentAsyncMock.mockRejectedValue({
      response: {
        data: {
          message: "Topic already exists",
        },
      },
    });

    render(<CreateDocument />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. product launch plan/i), "Existing topic");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(AppToast.error).toHaveBeenCalledWith({
        title: "Failed To create document",
        description: "Topic already exists",
      });
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("disables the submit button while the request is pending", () => {
    (useCreateDocument as jest.Mock).mockReturnValue({
      createDocumentAsync: createDocumentAsyncMock,
      isPending: true,
    });

    render(<CreateDocument />);

    expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
  });
});
