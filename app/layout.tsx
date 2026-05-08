import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nomadic Workspace",
  description: "Nomadic багш нарын өдөр тутмын ажлын дотоод орчин",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#4f63e6",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
