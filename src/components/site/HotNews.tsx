import SectionHeading from "@/components/site/SectionHeading";
import NewsCard from "@/components/site/NewsCard";
import type { NewsItem } from "@/types/home";

export default function HotNews({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  // Mockup splits the block in two: a three-up grid of standard cards, then the
  // featured ones as wide cards underneath.
  const standard = items.filter((item) => !item.featured);
  const featured = items.filter((item) => item.featured);

  return (
    <section className="iNews">
      <div className="iNews--wrap">
        <SectionHeading en="Hot News" jp="プレイヤー" />
        {standard.length > 0 && (
          <ul className="iNews--list">
            {standard.map((item) => (
              <NewsCard item={item} key={item.id} />
            ))}
          </ul>
        )}
        {featured.length > 0 && (
          <ul className="iNews--list --featured">
            {featured.map((item) => (
              <NewsCard item={item} key={item.id} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
