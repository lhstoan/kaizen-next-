import MainVisual from "@/components/site/MainVisual";
import Partners from "@/components/site/Partners";
import TeamMemberGrid from "@/components/site/TeamMemberGrid";
import { placeholderMembers } from "@/lib/placeholder-data";
import { getPartnerGroups } from "@/lib/partners";

export const metadata = {
  title: "TEAM MEMBER | KAIZEN BADMINTON",
};

export default async function TeamMemberPage() {
  const { mainPartners, internationalPartners, otherPartners } = await getPartnerGroups();

  return (
    <main>
      <MainVisual />
      <TeamMemberGrid members={placeholderMembers} />
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
