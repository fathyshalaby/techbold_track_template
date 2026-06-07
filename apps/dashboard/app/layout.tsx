import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Service Desk Autopilot",
  description: "Technician-controlled troubleshooting dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
