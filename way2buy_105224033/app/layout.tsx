import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Way2Buy — Produk lokal, lebih dekat ke kamu",
    template: "%s | Way2Buy",
  },
  description:
    "Temukan produk lokal dari berbagai penjuru Indonesia dan titipkan dengan mudah lewat Way2Buy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-scroll-behavior="smooth" lang="id">
      <body>{children}</body>
    </html>
  );
}
