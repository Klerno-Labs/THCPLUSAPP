import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://order.thcplus.com"),
  title: "THC Plus | Will-Call Ordering",
  description:
    "Reserve premium THCA flower, concentrates, and pre-rolls for will-call pickup at THC Plus. Browse our menu, place your order, and pick up when ready. No payment online.",
  keywords: [
    "THC Plus",
    "will-call",
    "THCA flower",
    "concentrates",
    "pre-rolls",
    "Houston hemp",
    "order ahead",
    "pickup",
  ],
  openGraph: {
    title: "THC Plus | Will-Call Ordering",
    description:
      "Browse, reserve, and pick up premium hemp products at THC Plus Houston. No payment collected online.",
    type: "website",
    siteName: "THC Plus Order",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090F09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#090F09] text-[#EBF0EB]`}
      >
        <Providers>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
