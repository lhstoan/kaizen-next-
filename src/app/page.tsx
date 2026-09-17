import MainVisual from "@/components/site/MainVisual";
import Members from "@/components/site/Members";
import Partners from "@/components/site/Partners";
import { placeholderMembers } from "@/lib/placeholder-data";
import { getPartnerGroups } from "@/lib/partners";

export default async function Home() {
  const { mainPartners, internationalPartners, otherPartners } = await getPartnerGroups();

  return (
    <main>
      <MainVisual />
      <Members members={placeholderMembers} />
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
