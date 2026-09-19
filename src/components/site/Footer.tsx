import { getSiteSettings } from "@/lib/settings";

export default async function Footer() {
  const { facebook_url, tiktok_url, youtube_url } = await getSiteSettings();

  const links = [
    { label: "FACEBOOK", href: facebook_url },
    { label: "TIKTOK", href: tiktok_url },
    { label: "YOUTUBE", href: youtube_url },
  ];

  return (
    <footer>
      <div className="iFooter">
        <ul className="iFooter--link">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="iFooter--logo">
          <div className="iFooter--copyright">
            <span>@2025 KAIZEN.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
