import MainVisual from "@/components/site/MainVisual";
import Members from "@/components/site/Members";
import Matches from "@/components/site/Matches";
import HotNews from "@/components/site/HotNews";
import Partners from "@/components/site/Partners";
import { placeholderMembers, placeholderMatches } from "@/lib/placeholder-data";
import { getPartnerGroups } from "@/lib/partners";
import { getNews } from "@/lib/news";

export default async function Home() {
  const [{ mainPartners, internationalPartners, otherPartners }, news] = await Promise.all([
    getPartnerGroups(),
    getNews(),
  ]);

  return (
    <main>
      <MainVisual />
      <Members members={placeholderMembers} />
      <Matches matches={placeholderMatches} monthLabel="September" />
      <HotNews items={news} />
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
