import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Green Lines CFO Platform - HQ Console",
  description: "Admin dashboard for Green Lines CFO Platform management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
