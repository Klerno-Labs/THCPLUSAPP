import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    template: "%s | THC Plus Houston",
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
  maximumScale: 5,
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Store",
                "@id": "https://order.thcplus.com/#store",
                name: "THC Plus",
                description:
                  "Premium THCA flower, concentrates, and pre-rolls. Order ahead for will-call pickup.",
                url: "https://order.thcplus.com",
                telephone: "+1-346-762-7482",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "5235 N Shepherd Dr",
                  addressLocality: "Houston",
                  addressRegion: "TX",
                  postalCode: "77018",
                  addressCountry: "US",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 29.8131,
                  longitude: -95.4103,
                },
                priceRange: "$$",
                image: "https://order.thcplus.com/images/logo.png",
                openingHoursSpecification: [
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ],
                    opens: "10:00",
                    closes: "21:00",
                  },
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Sunday",
                    opens: "11:00",
                    closes: "19:00",
                  },
                ],
                potentialAction: {
                  "@type": "OrderAction",
                  target: "https://order.thcplus.com/products",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": "https://order.thcplus.com/#organization",
                name: "THC Plus",
                url: "https://order.thcplus.com",
                logo: "https://order.thcplus.com/images/logo.png",
                sameAs: [],
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+1-346-762-7482",
                  contactType: "customer service",
                  areaServed: "US",
                  availableLanguage: "English",
                },
              },
            ]),
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
