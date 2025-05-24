import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer/page";

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-exo2",
});

// TODO: update URL to the actual domain when deploying

export const metadata: Metadata = {
  metadataBase: new URL("https://astronautics-club-iiith.vercel.app"),
  title: "Astronautics Club | IIIT Hyderabad",
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [
      { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16" },
      { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32" },
      { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", url: "/android-icon-192x192.png", sizes: "192x192" },
    ],
  },
  description:
    "Where astronomy meets space technology. Experience stargazing sessions, participate in space projects, and explore the cosmos!",
  keywords: [
    "Astronautics Club",
    "IIIT Hyderabad",
    "astronomy",
    "space technology",
    "stargazing",
    "telescope",
    "student club",
    "space projects",
    "SpaceTech",
  ],
  authors: [
    { name: "Astronautics Club IIIT Hyderabad" },
    { name: "Mayank Goel", url: "https://github.com/Mayank447" },
    { name: "Mohit Kumar Singh", url: "https://github.com/unignoramus11" },
  ],
  creator: "Astronautics Club IIIT Hyderabad",
  applicationName: "Astronautics Club IIIT Hyderabad",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://astronautics-club-iiith.vercel.app",
    title: "Astronautics Club | IIIT Hyderabad",
    description:
      "Where astronomy meets space technology. Experience stargazing sessions, participate in space projects, and explore the cosmos!",
    siteName: "Astronautics Club IIIT Hyderabad",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Astronautics Club Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astronautics Club | IIIT Hyderabad",
    description:
      "Where astronomy meets space technology. Experience stargazing sessions, participate in space projects, and explore the cosmos!",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="canonical"
          href="https://astronautics-club-iiith.vercel.app"
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`bg-background text-foreground antialiased ${exo2.variable}`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
