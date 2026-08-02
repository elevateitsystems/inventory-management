import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Raw material, production, finished goods, sales, and customer ledger management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
