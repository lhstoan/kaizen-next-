import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import BodyAttrs from "@/components/site/BodyAttrs";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
      <BodyAttrs />
      <div id="wrapper">
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
}
