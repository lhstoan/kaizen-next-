import MainVisual from "@/components/site/MainVisual";
import Members from "@/components/site/Members";
import Matches from "@/components/site/Matches";
import Partners from "@/components/site/Partners";
import { placeholderMatches, placeholderMembers, placeholderPartners } from "@/lib/placeholder-data";

export default function Home() {
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();

  return (
    <main>
      <MainVisual />
      <Members members={placeholderMembers} />
      <Matches matches={placeholderMatches} monthLabel={monthLabel} />
      <Partners mainPartners={placeholderPartners} internationalPartners={[]} otherPartners={[]} />
    </main>
  );
}
