import { Footer, Header } from "@/components/layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
