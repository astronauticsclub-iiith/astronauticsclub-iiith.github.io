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
  metadataBase: new URL("https://astronautics-club-iiith.vercel.app"),
  title: "Astronautics Club | IIIT Hyderabad",
  icons: {
    icon: "/favicon.ico",
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
