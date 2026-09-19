import MainVisual from "@/components/site/MainVisual";
import Members from "@/components/site/Members";
import Matches from "@/components/site/Matches";
import HotNews from "@/components/site/HotNews";
import Partners from "@/components/site/Partners";
import { getPartnerGroups } from "@/lib/partners";
import { getNews } from "@/lib/news";
import { getMembers } from "@/lib/members";
import { getMatches } from "@/lib/matches";
import { getSiteSettings } from "@/lib/settings";

export default async function Home() {
  const [{ mainPartners, internationalPartners, otherPartners }, news, members, matches, settings] = await Promise.all([
    getPartnerGroups(),
    getNews(),
    getMembers(),
    getMatches(),
    getSiteSettings(),
  ]);

  return (
    <main>
      <MainVisual />
      <Members members={members} />
      <Matches matches={matches} monthLabel={settings.matches_month} />
      <HotNews items={news} />
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
