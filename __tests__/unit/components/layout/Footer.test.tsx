import { render, screen } from "@testing-library/react";
import Footer from "@/components/layout/Footer";
import { socialLinks } from "@/constants/footerData";

jest.mock("@/constants/footerData", () => ({
  socialLinks: [
    {
      label: "GitHub",
      href: "https://github.com/roshidh",
      icon: "GitHubIcon",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/roshidh",
      icon: "LinkedInIcon",
    },
    {
      label: "Portfolio",
      href: "https://roshidh.dev",
      icon: "PortfolioIcon",
    },
  ],
}));

describe("Footer", () => {
  it("renders the footer heading", () => {
    render(<Footer />);

    expect(
      screen.getByText(/developed by/i)
    ).toBeInTheDocument();
  });

  it("renders the developer name", () => {
    render(<Footer />);

    expect(
      screen.getByText("Mohammed Roshidh S")
    ).toBeInTheDocument();
  });

  it("renders all social links", () => {
    render(<Footer />);

    expect(
      screen.getAllByRole("link")
    ).toHaveLength(socialLinks.length);
  });

  it("renders every social link with the correct href", () => {
    render(<Footer />);

    socialLinks.forEach((link) => {
      const anchor = screen.getByRole("link", {
        name: link.label,
      });

      expect(anchor).toHaveAttribute(
        "href",
        link.href
      );
    });
  });

  it("opens every social link in a new tab", () => {
    render(<Footer />);

    socialLinks.forEach((link) => {
      const anchor = screen.getByRole("link", {
        name: link.label,
      });

      expect(anchor).toHaveAttribute(
        "target",
        "_blank"
      );
    });
  });

  it("uses rel='noreferrer' for every social link", () => {
    render(<Footer />);

    socialLinks.forEach((link) => {
      const anchor = screen.getByRole("link", {
        name: link.label,
      });

      expect(anchor).toHaveAttribute(
        "rel",
        "noreferrer"
      );
    });
  });

  it("uses the correct aria-label for every social link", () => {
    render(<Footer />);

    socialLinks.forEach((link) => {
      expect(
        screen.getByLabelText(link.label)
      ).toBeInTheDocument();
    });
  });
});