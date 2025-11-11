import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ocean Tasks",
  description: "A modern task manager with an Ocean Professional theme",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
