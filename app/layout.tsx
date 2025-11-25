import type { Metadata } from "next";
import { National_Park } from "next/font/google";
import "./globals.css";

const nationalPark = National_Park({
  variable: "--font-national-park",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Posta",
  description: "Posta - The best way to manage your photos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nationalPark.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
