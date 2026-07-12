import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Menubar from "@/features/documentEditor/components/Menubar";
import { useEditorState } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/core";

// Mock @tiptap/react hooks
jest.mock("@tiptap/react", () => ({
  useEditorState: jest.fn(),
}));

const mockUseEditorState = useEditorState as jest.Mock;

interface MockSpies {
  chain: jest.Mock;
  focus: jest.Mock;
  toggleHeading: jest.Mock;
  setParagraph: jest.Mock;
  toggleBold: jest.Mock;
  toggleItalic: jest.Mock;
  toggleStrike: jest.Mock;
  toggleHighlight: jest.Mock;
  setTextAlign: jest.Mock;
  run: jest.Mock;
}

describe("Menubar Component", () => {
  // Fluent Editor Mock Creator
  const createMockEditor = () => {
    const runMock = jest.fn();
    const toggleHeadingMock = jest.fn().mockImplementation(() => ({ run: runMock }));
    const setParagraphMock = jest.fn().mockImplementation(() => ({ run: runMock }));
    const toggleBoldMock = jest.fn().mockImplementation(() => ({ run: runMock }));
    const toggleItalicMock = jest.fn().mockImplementation(() => ({ run: runMock }));
    const toggleStrikeMock = jest.fn().mockImplementation(() => ({ run: runMock }));
    const toggleHighlightMock = jest.fn().mockImplementation(() => ({ run: runMock }));
    const setTextAlignMock = jest.fn().mockImplementation(() => ({ run: runMock }));

    const focusMock = jest.fn().mockImplementation(() => ({
      toggleHeading: toggleHeadingMock,
      setParagraph: setParagraphMock,
      toggleBold: toggleBoldMock,
      toggleItalic: toggleItalicMock,
      toggleStrike: toggleStrikeMock,
      toggleHighlight: toggleHighlightMock,
      setTextAlign: setTextAlignMock,
    }));

    const chainMock = jest.fn().mockImplementation(() => ({
      focus: focusMock,
    }));

    const spies: MockSpies = {
      chain: chainMock,
      focus: focusMock,
      toggleHeading: toggleHeadingMock,
      setParagraph: setParagraphMock,
      toggleBold: toggleBoldMock,
      toggleItalic: toggleItalicMock,
      toggleStrike: toggleStrikeMock,
      toggleHighlight: toggleHighlightMock,
      setTextAlign: setTextAlignMock,
      run: runMock,
    };

    return {
      editor: {
        chain: chainMock,
      } as unknown as TiptapEditor,
      spies,
    };
  };

  const defaultEditorState = {
    isBold: false,
    isItalic: false,
    isStrike: false,
    isHighlight: false,
    isAlignLeft: false,
    isAlignCenter: false,
    isAlignRight: false,
    isAlignJustify: false,
    isParagraph: false,
    isHeading1: false,
    isHeading2: false,
    isHeading3: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditorState.mockReturnValue(defaultEditorState);
  });

  it("renders all menubar action buttons", () => {
    const { editor } = createMockEditor();
    render(<Menubar editor={editor} />);

    expect(screen.getByRole("button", { name: "H1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "H2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "H3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /paragraph/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /strike/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /highlight/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /left/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /center/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /right/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /justify/i })).toBeInTheDocument();
  });

  it("applies the active styles to buttons corresponding to true state variables", () => {
    mockUseEditorState.mockReturnValue({
      ...defaultEditorState,
      isHeading1: true,
      isBold: true,
      isAlignRight: true,
    });

    const { editor } = createMockEditor();
    render(<Menubar editor={editor} />);

    const activeClass = "font-bold bg-red-800 rounded-md p-1";

    expect(screen.getByRole("button", { name: "H1" })).toHaveClass(activeClass);
    expect(screen.getByRole("button", { name: /bold/i })).toHaveClass(activeClass);
    expect(screen.getByRole("button", { name: /right/i })).toHaveClass(activeClass);

    expect(screen.getByRole("button", { name: "H2" })).not.toHaveClass(activeClass);
    expect(screen.getByRole("button", { name: /italic/i })).not.toHaveClass(activeClass);
    expect(screen.getByRole("button", { name: /left/i })).not.toHaveClass(activeClass);
  });

  const runButtonClickTest = (
    buttonName: string | RegExp,
    spySelector: (spies: MockSpies) => jest.Mock,
    expectedArg?: string | { level: number }
  ) => {
    it(`calls correct editor chain command when ${buttonName.toString()} button is clicked`, async () => {
      const user = userEvent.setup();
      const { editor, spies } = createMockEditor();
      render(<Menubar editor={editor} />);

      await user.click(screen.getByRole("button", { name: buttonName }));

      expect(spies.chain).toHaveBeenCalledTimes(1);
      expect(spies.focus).toHaveBeenCalledTimes(1);
      if (expectedArg !== undefined) {
        expect(spySelector(spies)).toHaveBeenCalledWith(expectedArg);
      } else {
        expect(spySelector(spies)).toHaveBeenCalledTimes(1);
      }
      expect(spies.run).toHaveBeenCalledTimes(1);
    });
  };

  runButtonClickTest("H1", (spies) => spies.toggleHeading, { level: 1 });
  runButtonClickTest("H2", (spies) => spies.toggleHeading, { level: 2 });
  runButtonClickTest("H3", (spies) => spies.toggleHeading, { level: 3 });
  runButtonClickTest(/paragraph/i, (spies) => spies.setParagraph);
  runButtonClickTest(/bold/i, (spies) => spies.toggleBold);
  runButtonClickTest(/italic/i, (spies) => spies.toggleItalic);
  runButtonClickTest(/strike/i, (spies) => spies.toggleStrike);
  runButtonClickTest(/highlight/i, (spies) => spies.toggleHighlight);
  runButtonClickTest(/left/i, (spies) => spies.setTextAlign, "left");
  runButtonClickTest(/center/i, (spies) => spies.setTextAlign, "center");
  runButtonClickTest(/right/i, (spies) => spies.setTextAlign, "right");
  runButtonClickTest(/justify/i, (spies) => spies.setTextAlign, "justify");
});
