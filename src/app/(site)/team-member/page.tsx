import MainVisual from "@/components/site/MainVisual";
import Partners from "@/components/site/Partners";
import TeamMemberGrid from "@/components/site/TeamMemberGrid";
import { getMembers } from "@/lib/members";
import { getPartnerGroups } from "@/lib/partners";

export const metadata = {
  title: "TEAM MEMBER | KAIZEN BADMINTON",
};

export default async function TeamMemberPage() {
  const [{ mainPartners, internationalPartners, otherPartners }, members] = await Promise.all([
    getPartnerGroups(),
    getMembers(),
  ]);

  return (
    <main>
      <MainVisual />
      <TeamMemberGrid members={members} />
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
