import { getSiteSettings } from "@/lib/settings";
import { optimizedImage } from "@/lib/image";

export default async function MainVisual() {
  const { banner_pc, banner_sp } = await getSiteSettings();

  return (
    <section
      className="iMainvisual"
      // What's actually visible is the section's CSS background (the <img> pair is
      // the legacy transparent spacer), so the editable banners come in as vars that
      // site-overrides.css swaps per breakpoint.
      style={
        {
          // Straight from settings these are the raw uploads — the stock banner alone
          // is a 3.4 MB PNG, pulled on every page because the header sits on it.
          "--banner-pc": `url("${optimizedImage(banner_pc, 1920)}")`,
          "--banner-sp": `url("${optimizedImage(banner_sp, 828)}")`,
        } as React.CSSProperties
      }
    >
      {/* .iMainvisual--bg is opacity:0 in the legacy CSS, but .iMainvisual is height:auto
          so this pair is what gives the section its height — it has to stay full width.
          Same URLs as the backgrounds above, which the browser then fetches once. */}
      <div className="iMainvisual--bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={optimizedImage(banner_sp, 828)} alt="Kaizen Badminton" className="sp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={optimizedImage(banner_pc, 1920)} alt="Kaizen Badminton" className="pc" />
      </div>
    </section>
  );
}
