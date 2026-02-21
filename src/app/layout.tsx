import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
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
  title: {
    default: "THC Plus | Will-Call Ordering",
    template: "%s | THC Plus",
  },
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
    siteName: "THC Plus",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "THC Plus | Will-Call Ordering",
    description:
      "Reserve premium hemp products for pickup. Browse our menu and order ahead.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://order.thcplus.com",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "THC Plus",
              description:
                "Premium THCA flower, concentrates, and pre-rolls. Order ahead for will-call pickup.",
              url: "https://order.thcplus.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Houston",
                addressRegion: "TX",
                addressCountry: "US",
              },
              priceRange: "$$",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
              },
              potentialAction: {
                "@type": "OrderAction",
                target: "https://order.thcplus.com/products",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#090F09] text-[#EBF0EB]`}
      >
        <Providers>
          <CartProvider>
            <FavoritesProvider>
              {children}
              <Toaster />
            </FavoritesProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
