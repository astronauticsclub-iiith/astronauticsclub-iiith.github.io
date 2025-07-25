import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WhimsyProvider } from "@/context/WhimsyContext";
import { ImagePreviewProvider } from "@/context/ImagePreviewContext";
import AuthProvider from "@/components/AuthProvider";

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-exo2",
});

// TODO: update URL to the actual domain when deploying

export const metadata: Metadata = {
  title: "Astronautics Club | IIIT Hyderabad",
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
    "unignoramus",
  ],
  authors: [
    {
      name: "unignoramus",
      url: "https://github.com/unignoramus11",
    },
    { name: "Mayank Goel", url: "https://github.com/Mayank447" },
  ],
  creator: "unignoramus",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Astronautics Club | IIIT Hyderabad",
    description:
      "Where astronomy meets space technology. Experience stargazing sessions, participate in space projects, and explore the cosmos!",
    url: "https://astronautics-club-iiith.vercel.app",
    siteName: "Astronautics Club IIIT Hyderabad",
    images: [
      {
        url: "https://astronautics-club-iiith.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Astronautics Club IIIT Hyderabad OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astronautics Club | IIIT Hyderabad",
    description:
      "Where astronomy meets space technology. Experience stargazing sessions, participate in space projects, and explore the cosmos!",
    creator: "@unignoramus11",
    images: ["https://astronautics-club-iiith.vercel.app/logo.png"],
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <link
          rel="canonical"
          href="https://astronautics-club-iiith.vercel.app"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#020001" />
      </head>
      <body
        className={`bg-background text-foreground antialiased ${exo2.variable}`}
      >
        <AuthProvider>
          <WhimsyProvider>
            <ImagePreviewProvider>
              <Navbar />
              {children}
              <Footer />
            </ImagePreviewProvider>
          </WhimsyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
