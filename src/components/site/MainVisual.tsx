import { getSiteSettings } from "@/lib/settings";

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
          "--banner-pc": `url("${banner_pc}")`,
          "--banner-sp": `url("${banner_sp}")`,
        } as React.CSSProperties
      }
    >
      <div className="iMainvisual--bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner_sp} alt="Kaizen Badminton" className="sp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner_pc} alt="Kaizen Badminton" className="pc" />
      </div>
    </section>
  );
}
