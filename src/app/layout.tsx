import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import TopNav from "@/components/ui/top-nav";
import { AlertVisualProvider } from "@/components/ui/alert-visual-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vineyard AI - Panel de Control",
  description: "Monitorea la salud y el estado de tus viñedos en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <AlertVisualProvider>
          <TopNav />
          <div className="min-h-screen pt-16">{children}</div>
        </AlertVisualProvider>
        <Toaster />
      </body>
    </html>
  );
}
