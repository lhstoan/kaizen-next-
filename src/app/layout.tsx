import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import BodyAttrs from "@/components/site/BodyAttrs";

export const metadata: Metadata = {
  title: "KAIZEN BADMINTON",
  description: "",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  openGraph: {
    images: ["/images/ogp.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Damion&family=Lilita+One&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/slick.css" />
        <link rel="stylesheet" media="all" href="/css/styles.css" />
        <link rel="stylesheet" media="all" href="/css/responsive.css" />
        <link rel="stylesheet" media="all" href="/css/site-overrides.css" />
      </head>
      <body>
        <BodyAttrs />
        <div id="wrapper">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
