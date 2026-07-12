import "./globals.css";

import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import ReduxProvider from "@/providers/ReduxProvider";
import SonnerProvider from "@/providers/ToastProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
         {/* <ReduxProvider> */}
        <QueryProvider>
           <SonnerProvider />
            {children}
        </QueryProvider>
         {/* </ReduxProvider> */}
      </body>
    </html>
  );
}