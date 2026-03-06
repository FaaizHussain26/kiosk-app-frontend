import type { Metadata, Viewport } from "next";
import { National_Park } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { FullscreenManager } from "@/components/full-screen-manager";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";

const nationalPark = National_Park({
  variable: "--font-national-park",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2A3B26",
};

export const metadata: Metadata = {
  title: "Posta",
  description: "Posta - The best way to manage your photos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Posta",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nationalPark.variable} antialiased`}>
        <FullscreenManager />
        <ServiceWorkerRegistrar />
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
